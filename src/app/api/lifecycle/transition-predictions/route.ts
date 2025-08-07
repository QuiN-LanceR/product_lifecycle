import { NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function GET() {
  const client = await getPool().connect();
  try {
    // Query untuk mendapatkan data stages dan segments
    const stagesQuery = `SELECT id, stage FROM public.tbl_stage ORDER BY stage`;
    const segmentsQuery = `SELECT id, segmen FROM public.tbl_segmen ORDER BY segmen`;
    
    const [stagesResult, segmentsResult] = await Promise.all([
      client.query(stagesQuery),
      client.query(segmentsQuery)
    ]);

    const stages = stagesResult.rows.map(row => row.stage);
    const segments = segmentsResult.rows.map(row => row.segmen);

    // Query untuk analisis prediksi transisi berdasarkan data historis nyata
    const transitionQuery = `
        WITH historical_transitions AS (
            -- Mengambil data transisi historis dari tbl_stage_histori
            SELECT 
                sp.stage as from_stage,
                sn.stage as to_stage,
                seg.segmen as segment,
                sh.tanggal_perubahan,
                sh.created_at,
                p.id as product_id,
                -- Menghitung durasi transisi dalam hari
                EXTRACT(EPOCH FROM (
                    sh.tanggal_perubahan - 
                    LAG(sh.tanggal_perubahan) OVER (
                        PARTITION BY p.id ORDER BY sh.created_at
                    )
                )) / 86400 as transition_days
            FROM public.tbl_stage_histori sh
            JOIN public.tbl_produk p ON sh.id_produk = p.id
            JOIN public.tbl_segmen seg ON p.id_segmen = seg.id
            LEFT JOIN public.tbl_stage sp ON sh.stage_previous = sp.id
            LEFT JOIN public.tbl_stage sn ON sh.stage_now = sn.id
            WHERE sh.stage_previous IS NOT NULL 
                AND sh.stage_now IS NOT NULL
                AND sh.tanggal_perubahan IS NOT NULL
        ),
        transition_patterns AS (
            -- Menghitung pola transisi dan probabilitas
            SELECT 
                from_stage,
                to_stage,
                segment,
                COUNT(*) as transition_count,
                ROUND(AVG(transition_days)::numeric, 0) as avg_transition_days,
                ROUND(STDDEV(transition_days)::numeric, 0) as stddev_days,
                MIN(transition_days) as min_days,
                MAX(transition_days) as max_days
            FROM historical_transitions
            WHERE transition_days > 0 AND transition_days < 1000 -- Filter outliers
            GROUP BY from_stage, to_stage, segment
            HAVING COUNT(*) >= 2 -- Minimal 2 data untuk prediksi
        ),
        current_stage_counts AS (
            -- Menghitung jumlah produk di setiap stage per segment
            SELECT 
                st.stage,
                seg.segmen as segment,
                COUNT(*) as current_count
            FROM public.tbl_produk p
            JOIN public.tbl_stage st ON p.id_stage = st.id
            JOIN public.tbl_segmen seg ON p.id_segmen = seg.id
            GROUP BY st.stage, seg.segmen
        ),
        total_historical_transitions AS (
            -- Total transisi per stage asal dan segment
            SELECT 
                from_stage,
                segment,
                SUM(transition_count) as total_from_stage
            FROM transition_patterns
            GROUP BY from_stage, segment
        )
        SELECT 
            tp.from_stage,
            tp.to_stage,
            tp.segment,
            -- Menghitung probabilitas berdasarkan data historis
            ROUND(
                CASE 
                    WHEN tht.total_from_stage > 0 THEN 
                        CAST(tp.transition_count AS NUMERIC) / CAST(tht.total_from_stage AS NUMERIC)
                    ELSE 0
                END, 3
            ) as probability,
            -- Estimasi hari berdasarkan rata-rata historis
            COALESCE(tp.avg_transition_days, 60)::int as expected_days,
            tp.transition_count as historical_count,
            COALESCE(csc.current_count, 0) as current_products_in_stage,
            tp.min_days::int as min_expected_days,
            tp.max_days::int as max_expected_days,
            tp.stddev_days::int as days_variance
        FROM transition_patterns tp
        LEFT JOIN total_historical_transitions tht 
            ON tp.from_stage = tht.from_stage AND tp.segment = tht.segment
        LEFT JOIN current_stage_counts csc 
            ON tp.from_stage = csc.stage AND tp.segment = csc.segment
        WHERE tp.transition_count > 0
        ORDER BY 
            probability DESC, 
            current_products_in_stage DESC,
            tp.from_stage, 
            tp.to_stage
        LIMIT 25
    `;

    const transitionResult = await client.query(transitionQuery);
    
    // Format data prediksi
    let predictions = transitionResult.rows.map(row => ({
      fromStage: row.from_stage,
      toStage: row.to_stage,
      segment: row.segment,
      probability: parseFloat(row.probability) || 0,
      expectedDays: parseInt(row.expected_days, 10),
      historicalCount: parseInt(row.historical_count, 10),
      currentProductsInStage: parseInt(row.current_products_in_stage, 10),
      minExpectedDays: parseInt(row.min_expected_days, 10) || null,
      maxExpectedDays: parseInt(row.max_expected_days, 10) || null,
      daysVariance: parseInt(row.days_variance, 10) || null
    }));

    // Jika tidak ada data historis, berikan prediksi berdasarkan produk saat ini
    if (predictions.length === 0) {
      const fallbackQuery = `
        WITH current_products AS (
            SELECT 
                st.stage as from_stage,
                seg.segmen as segment,
                COUNT(*) as product_count
            FROM public.tbl_produk p
            JOIN public.tbl_stage st ON p.id_stage = st.id
            JOIN public.tbl_segmen seg ON p.id_segmen = seg.id
            GROUP BY st.stage, seg.segmen
        ),
        stage_sequence AS (
            SELECT 
                'Introduction' as from_stage, 'Growth' as to_stage, 45 as expected_days
            UNION ALL
            SELECT 'Growth', 'Maturity', 90
            UNION ALL
            SELECT 'Maturity', 'Decline', 180
            UNION ALL
            SELECT 'Introduction', 'Decline', 30
        )
        SELECT 
            ss.from_stage,
            ss.to_stage,
            cp.segment,
            0.5 as probability,
            ss.expected_days,
            0 as historical_count,
            cp.product_count as current_products_in_stage
        FROM stage_sequence ss
        CROSS JOIN (
            SELECT DISTINCT segment FROM current_products WHERE product_count > 0
        ) cp
        ORDER BY cp.segment, ss.from_stage
      `;
      
      const fallbackResult = await client.query(fallbackQuery);
      predictions = fallbackResult.rows.map(row => ({
        fromStage: row.from_stage,
        toStage: row.to_stage,
        segment: row.segment,
        probability: parseFloat(row.probability),
        expectedDays: parseInt(row.expected_days, 10),
        historicalCount: parseInt(row.historical_count, 10),
        currentProductsInStage: parseInt(row.current_products_in_stage, 10),
        minExpectedDays: null,
        maxExpectedDays: null,
        daysVariance: null
      }));
    }

    return NextResponse.json({
      success: true,
      data: {
        predictions,
        stages,
        segments,
        metadata: {
          totalPredictions: predictions.length,
          basedOnHistoricalData: predictions.some(p => p.historicalCount > 0),
          lastUpdated: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error("Error fetching transition predictions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch transition predictions",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}