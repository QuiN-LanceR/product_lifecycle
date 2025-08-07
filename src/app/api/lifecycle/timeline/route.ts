import { NextResponse } from "next/server";
import { getPool } from '@/lib/database';

// Define proper types
interface TimelineDataPoint {
  x: number;
  y: number;
  productCount: number;
}

interface TimelineProduct {
  id: number;
  name: string;
  kategori: string;
  stage_start: string | null;
  stage_end: string | null;
  stage_date: string;
}

interface TimelineDataset {
  label: string;
  data: TimelineDataPoint[];
  backgroundColor: string;
  borderColor: string;
  pointRadius: number;
  pointHoverRadius: number;
  products: {
    year: number;
    month: number;
    stage: string;
    products: TimelineProduct[];
  }[];
}

export async function GET() {
  const client = await getPool().connect();
  try {    
    // Query untuk mendapatkan timeline data berdasarkan stage history dan tanggal stage
    const timelineQuery = `
      WITH product_timeline AS (
        SELECT DISTINCT
          p.id as product_id,
          p.produk as product_name,
          p.tanggal_stage_start,
          p.tanggal_stage_end,
          st.stage,
          sg.segmen,
          k.kategori,
          p.created_at as product_created,
          COALESCE(
            p.tanggal_stage_start,
            sh.created_at,
            p.created_at
          ) as stage_date
        FROM public.tbl_produk p
        JOIN public.tbl_stage st ON p.id_stage = st.id
        JOIN public.tbl_segmen sg ON p.id_segmen = sg.id
        JOIN public.tbl_kategori k ON p.id_kategori = k.id
        LEFT JOIN public.tbl_stage_histori sh ON p.id = sh.id_produk AND sh.stage_now = st.id
      ),
      timeline_with_coordinates AS (
        SELECT 
          product_id,
          product_name,
          stage,
          segmen,
          kategori,
          stage_date,
          EXTRACT(YEAR FROM stage_date) as timeline_year,
          EXTRACT(MONTH FROM stage_date) as timeline_month,
          tanggal_stage_start,
          tanggal_stage_end
        FROM product_timeline
        WHERE stage_date IS NOT NULL
      )
      SELECT 
        stage,
        segmen,
        timeline_year,
        timeline_month,
        COUNT(*) as product_count,
        array_agg(
          json_build_object(
            'id', product_id,
            'name', product_name,
            'kategori', kategori,
            'stage_start', tanggal_stage_start,
            'stage_end', tanggal_stage_end,
            'stage_date', stage_date
          )
        ) as products
      FROM timeline_with_coordinates
      GROUP BY stage, segmen, timeline_year, timeline_month
      ORDER BY timeline_year, timeline_month, stage, segmen
    `;

    const result = await client.query(timelineQuery);
    
    if (result.rows.length === 0) {
      
      // Check if there are any products at all
      const productCheckQuery = `
        SELECT COUNT(*) as total_products
        FROM public.tbl_produk p
      `;
      
      const productCheck = await client.query(productCheckQuery);
      console.log(`Total products in database: ${productCheck.rows[0].total_products}`);
      
      // Check if there are products with stage dates
      const stageDateCheckQuery = `
        SELECT 
          COUNT(*) as products_with_stage_date,
          COUNT(CASE WHEN tanggal_stage_start IS NOT NULL THEN 1 END) as with_stage_start,
          COUNT(CASE WHEN created_at IS NOT NULL THEN 1 END) as with_created_at
        FROM public.tbl_produk p
      `;
      
      const stageDateCheck = await client.query(stageDateCheckQuery);
      console.log('Stage date check:', stageDateCheck.rows[0]);
    }
    
    // Format data untuk chart scatter plot dengan tipe yang tepat
    const timelineData: Record<string, TimelineDataset> = {};
    
    const segmentColors: Record<string, string> = {
      'Pembangunan': '#06B6D4',
      'Transmisi': '#10B981', 
      'Distribusi': '#F59E0B',
      'Korporat': '#8B5CF6',
      'Pelayanan Pelanggan': '#EF4444'
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result.rows.forEach((row: any) => {
      const segmen: string = row.segmen;
      
      if (!timelineData[segmen]) {
        timelineData[segmen] = {
          label: segmen,
          data: [],
          backgroundColor: segmentColors[segmen] || '#6B7280',
          borderColor: segmentColors[segmen] || '#6B7280',
          pointRadius: 6,
          pointHoverRadius: 8,
          products: []
        };
      }
      
      // Add jitter untuk menyebarkan titik yang bertumpuk
      const monthJitter = (Math.random() - 0.5) * 1.0;  // ±0.5
      const yearJitter = (Math.random() - 0.5) * 0.6;   // ±0.3
      
      timelineData[segmen].data.push({
        x: parseInt(row.timeline_month) + monthJitter, // Bulan + jitter
        y: parseInt(row.timeline_year) + yearJitter,   // Tahun + jitter
        productCount: parseInt(row.product_count)
      });
      
      timelineData[segmen].products.push({
        year: parseInt(row.timeline_year),
        month: parseInt(row.timeline_month),
        stage: row.stage,
        products: row.products
      });
    });

    console.log(`Processed ${Object.keys(timelineData).length} segments`);

    // Query untuk mendapatkan range tahun untuk chart
    const yearRangeQuery = `
      SELECT 
        MIN(EXTRACT(YEAR FROM COALESCE(tanggal_stage_start, created_at))) as min_year,
        MAX(EXTRACT(YEAR FROM COALESCE(tanggal_stage_end, created_at))) as max_year
      FROM public.tbl_produk
      WHERE (tanggal_stage_start IS NOT NULL OR created_at IS NOT NULL)
    `;
    
    const yearRangeResult = await client.query(yearRangeQuery);
    const yearRange = yearRangeResult.rows[0];
    
    const responseData = {
      success: true,
      data: {
        datasets: Object.values(timelineData),
        yearRange: {
          min: parseInt(yearRange.min_year) - 2 || new Date().getFullYear() - 5,
          max: parseInt(yearRange.max_year) || new Date().getFullYear()
        },
        lastUpdated: new Date().toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      }
    };
    
    return NextResponse.json(responseData);

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch timeline data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}