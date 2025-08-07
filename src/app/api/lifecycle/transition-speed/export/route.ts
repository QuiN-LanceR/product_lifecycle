import { NextResponse } from "next/server";
import { getPool } from '@/lib/database';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeUnit = searchParams.get('unit') || 'months';
  const analysisType = searchParams.get('type') || 'duration';
  
  const client = await getPool().connect();
  try {
    // Menggunakan query yang sama dari route utama
    let query = '';
    
    if (analysisType === 'duration') {
      query = `
        WITH stage_order AS (
          SELECT 
            id,
            stage,
            CASE stage
              WHEN 'Introduction' THEN 1
              WHEN 'Growth' THEN 2
              WHEN 'Maturity' THEN 3
              WHEN 'Decline' THEN 4
              ELSE 5
            END as stage_order
          FROM public.tbl_stage
        ),
        transition_analysis AS (
          SELECT 
            p.id as product_id,
            p.produk as product_name,
            sg.segmen,
            sh.stage_previous,
            sh.stage_now,
            st_prev.stage as stage_previous_name,
            st_now.stage as stage_now_name,
            so_prev.stage_order as prev_order,
            so_now.stage_order as now_order,
            sh.tanggal_perubahan,
            CASE 
              WHEN LAG(sh.tanggal_perubahan) OVER (
                PARTITION BY p.id ORDER BY sh.tanggal_perubahan
              ) IS NOT NULL THEN
                EXTRACT(EPOCH FROM (
                  sh.tanggal_perubahan - LAG(sh.tanggal_perubahan) OVER (
                    PARTITION BY p.id ORDER BY sh.tanggal_perubahan
                  )
                )) / ${timeUnit === 'days' ? '86400' : '2592000'}
              ELSE 
                COALESCE(ist.interval ${timeUnit === 'days' ? '* 30' : ''}, ${timeUnit === 'days' ? '180' : '6'})
            END as actual_duration,
            COALESCE(ist.interval ${timeUnit === 'days' ? '* 30' : ''}, ${timeUnit === 'days' ? '180' : '6'}) as planned_duration,
            CASE 
              WHEN EXTRACT(EPOCH FROM (
                sh.tanggal_perubahan - LAG(sh.tanggal_perubahan) OVER (
                  PARTITION BY p.id ORDER BY sh.tanggal_perubahan
                )
              )) / ${timeUnit === 'days' ? '86400' : '2592000'} > 0 THEN
                ROUND(
                  (COALESCE(ist.interval ${timeUnit === 'days' ? '* 30' : ''}, ${timeUnit === 'days' ? '180' : '6'}) / 
                   (EXTRACT(EPOCH FROM (
                     sh.tanggal_perubahan - LAG(sh.tanggal_perubahan) OVER (
                       PARTITION BY p.id ORDER BY sh.tanggal_perubahan
                     )
                   )) / ${timeUnit === 'days' ? '86400' : '2592000'})) * 100, 2
                )
              ELSE 100
            END as efficiency_score
          FROM public.tbl_produk p
          JOIN public.tbl_segmen sg ON p.id_segmen = sg.id
          JOIN public.tbl_stage_histori sh ON p.id = sh.id_produk
          LEFT JOIN public.tbl_stage st_prev ON sh.stage_previous = st_prev.id
          LEFT JOIN public.tbl_stage st_now ON sh.stage_now = st_now.id
          LEFT JOIN stage_order so_prev ON sh.stage_previous = so_prev.id
          LEFT JOIN stage_order so_now ON sh.stage_now = so_now.id
          LEFT JOIN public.tbl_interval_stage ist ON (
            ist.id_produk = sh.id_produk AND 
            ist.id_stage = sh.stage_now
          )
          WHERE sh.stage_previous IS NOT NULL 
            AND sh.stage_now IS NOT NULL
            AND sh.tanggal_perubahan IS NOT NULL
            AND so_now.stage_order = so_prev.stage_order + 1
        ),
        transition_summary AS (
          SELECT 
            segmen,
            CONCAT(stage_previous_name, ' → ', stage_now_name) as transition_name,
            stage_previous_name,
            stage_now_name,
            now_order as target_stage_order,
            COUNT(*) as total_transitions,
            ROUND(AVG(actual_duration)::numeric, 1) as avg_actual_duration,
            ROUND(AVG(planned_duration)::numeric, 1) as avg_planned_duration,
            ROUND(AVG(efficiency_score)::numeric, 1) as avg_efficiency,
            ROUND(STDDEV(actual_duration)::numeric, 1) as duration_stddev,
            MIN(actual_duration) as min_duration,
            MAX(actual_duration) as max_duration,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY actual_duration) as median_duration
          FROM transition_analysis
          WHERE actual_duration IS NOT NULL
          GROUP BY segmen, stage_previous_name, stage_now_name, now_order
        )
        SELECT 
          segmen,
          transition_name,
          stage_previous_name,
          stage_now_name,
          target_stage_order,
          total_transitions,
          avg_actual_duration,
          avg_planned_duration,
          avg_efficiency,
          duration_stddev,
          min_duration,
          max_duration,
          median_duration
        FROM transition_summary
        ORDER BY segmen, target_stage_order
      `;
    }
    
    const result = await client.query(query);
    
    // Buat workbook Excel
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: Summary Data
    const summaryData = result.rows.map(row => ({
      'Segmen': row.segmen,
      'Transisi': row.transition_name,
      'Total Transisi': row.total_transitions,
      'Rata-rata Durasi Aktual': `${row.avg_actual_duration} ${timeUnit}`,
      'Rata-rata Durasi Rencana': `${row.avg_planned_duration} ${timeUnit}`,
      'Efisiensi (%)': row.avg_efficiency,
      'Standar Deviasi': row.duration_stddev,
      'Durasi Minimum': `${row.min_duration} ${timeUnit}`,
      'Durasi Maksimum': `${row.max_duration} ${timeUnit}`,
      'Median Durasi': `${row.median_duration} ${timeUnit}`
    }));
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Transition Speed Analysis');
    
    // Sheet 2: Statistics
    const segments = [...new Set(result.rows.map(row => row.segmen))];
    const statsData = segments.map(segment => {
      const segmentData = result.rows.filter(row => row.segmen === segment);
      const totalTransitions = segmentData.reduce((sum, row) => sum + parseInt(row.total_transitions), 0);
      const avgEfficiency = segmentData.reduce((sum, row) => sum + parseFloat(row.avg_efficiency), 0) / segmentData.length;
      
      return {
        'Segmen': segment,
        'Total Transisi': totalTransitions,
        'Rata-rata Efisiensi (%)': Math.round(avgEfficiency * 100) / 100,
        'Jumlah Jenis Transisi': segmentData.length
      };
    });
    
    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');
    
    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers untuk download
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="transition-speed-analysis-${new Date().toISOString().slice(0, 10)}.xlsx"`);
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    return new NextResponse(excelBuffer, { headers });
    
  } catch (error) {
    console.error("Error exporting transition speed analysis:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to export transition speed analysis",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}