/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeUnit = searchParams.get('unit') || 'months'; // 'days' or 'months'
  const analysisType = searchParams.get('type') || 'duration'; // 'duration', 'success_rate', 'velocity'
  
  const client = await getPool().connect();
  try {
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
            -- Hitung durasi aktual berdasarkan tanggal
            CASE 
              WHEN LAG(sh.tanggal_perubahan) OVER (
                PARTITION BY p.id ORDER BY sh.tanggal_perubahan
              ) IS NOT NULL THEN
                EXTRACT(EPOCH FROM (
                  sh.tanggal_perubahan - LAG(sh.tanggal_perubahan) OVER (
                    PARTITION BY p.id ORDER BY sh.tanggal_perubahan
                  )
                )) / ${timeUnit === 'days' ? '86400' : '2592000'} -- seconds to days/months
              ELSE 
                COALESCE(ist.interval ${timeUnit === 'days' ? '* 30' : ''}, ${timeUnit === 'days' ? '180' : '6'})
            END as actual_duration,
            -- Ambil interval yang direncanakan
            COALESCE(ist.interval ${timeUnit === 'days' ? '* 30' : ''}, ${timeUnit === 'days' ? '180' : '6'}) as planned_duration,
            -- Hitung efisiensi (planned/actual)
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
          FROM public.tbl_stage_histori sh
          JOIN public.tbl_produk p ON sh.id_produk = p.id
          JOIN public.tbl_segmen sg ON p.id_segmen = sg.id
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
    } else if (analysisType === 'success_rate') {
      query = `
        WITH stage_success AS (
          SELECT 
            sg.segmen,
            st.stage,
            st.id as stage_id,
            COUNT(DISTINCT p.id) as products_in_stage,
            COUNT(DISTINCT CASE 
              WHEN sh.stage_now IS NOT NULL AND sh.stage_now > st.id 
              THEN p.id 
            END) as products_progressed
          FROM public.tbl_segmen sg
          CROSS JOIN public.tbl_stage st
          LEFT JOIN public.tbl_produk p ON p.id_segmen = sg.id
          LEFT JOIN public.tbl_stage_histori sh ON sh.id_produk = p.id AND sh.stage_previous = st.id
          WHERE st.stage IN ('Introduction', 'Growth', 'Maturity')
          GROUP BY sg.segmen, st.stage, st.id
        )
        SELECT 
          segmen,
          stage,
          products_in_stage,
          products_progressed,
          CASE 
            WHEN products_in_stage > 0 THEN 
              ROUND((products_progressed::decimal / products_in_stage * 100), 1)
            ELSE 0
          END as success_rate_percentage
        FROM stage_success
        ORDER BY segmen, stage_id
      `;
    }

    const result = await client.query(query);
    
    // Process data based on analysis type
    let processedData = {};
    
    if (analysisType === 'duration') {
      const segmentData: { [key: string]: any[] } = {};
      const transitions = ['Introduction → Growth', 'Growth → Maturity', 'Maturity → Decline'];
      
      result.rows.forEach(row => {
        if (!segmentData[row.segmen]) {
          segmentData[row.segmen] = [];
        }
        segmentData[row.segmen].push({
          transition: row.transition_name,
          actualDuration: parseFloat(row.avg_actual_duration) || 0,
          plannedDuration: parseFloat(row.avg_planned_duration) || 0,
          efficiency: parseFloat(row.avg_efficiency) || 0,
          totalTransitions: parseInt(row.total_transitions, 10),
          standardDeviation: parseFloat(row.duration_stddev) || 0,
          minDuration: parseFloat(row.min_duration) || 0,
          maxDuration: parseFloat(row.max_duration) || 0,
          medianDuration: parseFloat(row.median_duration) || 0
        });
      });
      
      processedData = {
        segments: Object.keys(segmentData),
        transitions: transitions,
        timeUnit: timeUnit,
        data: segmentData,
        summary: {
          totalSegments: Object.keys(segmentData).length,
          totalTransitions: result.rows.reduce((sum, row) => sum + parseInt(row.total_transitions, 10), 0),
          avgEfficiency: result.rows.length > 0 ? 
            result.rows.reduce((sum, row) => sum + parseFloat(row.avg_efficiency), 0) / result.rows.length : 0
        }
      };
    } else if (analysisType === 'success_rate') {
      const segmentData: { [key: string]: any[] } = {};
      
      result.rows.forEach(row => {
        if (!segmentData[row.segmen]) {
          segmentData[row.segmen] = [];
        }
        segmentData[row.segmen].push({
          stage: row.stage,
          productsInStage: parseInt(row.products_in_stage, 10),
          productsProgressed: parseInt(row.products_progressed, 10),
          successRate: parseFloat(row.success_rate_percentage) || 0
        });
      });
      
      processedData = {
        segments: Object.keys(segmentData),
        stages: ['Introduction', 'Growth', 'Maturity'],
        data: segmentData
      };
    }

    // Default data jika tidak ada hasil
    if (Object.keys(processedData).length === 0 || 
        ('data' in processedData && Object.keys((processedData as { data: Record<string, unknown> }).data).length === 0)) {
      const defaultSegments = ['Distribusi', 'EP & Pembangkit', 'Korporat', 'Pelayanan Pelanggan', 'Transmisi'];
      const defaultData: { [key: string]: any[] } = {};
      
      if (analysisType === 'duration') {
        defaultSegments.forEach(segment => {
          defaultData[segment] = [
            { 
              transition: 'Introduction → Growth', 
              actualDuration: timeUnit === 'days' ? 180 : 6, 
              plannedDuration: timeUnit === 'days' ? 180 : 6,
              efficiency: 100,
              totalTransitions: 0
            },
            { 
              transition: 'Growth → Maturity', 
              actualDuration: timeUnit === 'days' ? 360 : 12, 
              plannedDuration: timeUnit === 'days' ? 360 : 12,
              efficiency: 100,
              totalTransitions: 0
            },
            { 
              transition: 'Maturity → Decline', 
              actualDuration: timeUnit === 'days' ? 270 : 9, 
              plannedDuration: timeUnit === 'days' ? 270 : 9,
              efficiency: 100,
              totalTransitions: 0
            }
          ];
        });
        
        processedData = {
          segments: defaultSegments,
          transitions: ['Introduction → Growth', 'Growth → Maturity', 'Maturity → Decline'],
          timeUnit: timeUnit,
          data: defaultData,
          summary: {
            totalSegments: defaultSegments.length,
            totalTransitions: 0,
            avgEfficiency: 100
          }
        };
      }
    }

    return NextResponse.json({
      success: true,
      analysisType: analysisType,
      timeUnit: timeUnit,
      data: processedData
    });

  } catch (error) {
    console.error("Error fetching transition speed analysis:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch transition speed analysis",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}