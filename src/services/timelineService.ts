/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPool } from '@/lib/database';
import { TimelineProduct, TimelineExportData } from '@/types/timeline.types';

export class TimelineService {
  private static async getConnection() {
    return await getPool().connect();
  }

  static async getTimelineData(): Promise<TimelineExportData> {
    const client = await this.getConnection();
    
    try {
      const products = await this.fetchTimelineProducts(client);
      const summaryBySegment = await this.generateSegmentSummary(products);
      const summaryByYear = await this.generateYearSummary(products);
      const metadata = this.generateMetadata(products);

      return {
        products,
        summaryBySegment,
        summaryByYear,
        metadata
      };
    } finally {
      client.release();
    }
  }

  private static async fetchTimelineProducts(client: any): Promise<TimelineProduct[]> {
    const query = `
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
      )
      SELECT 
        product_id as id,
        product_name as name,
        kategori,
        tanggal_stage_start as stage_start,
        tanggal_stage_end as stage_end,
        stage_date,
        segmen,
        stage
      FROM product_timeline
      WHERE stage_date IS NOT NULL
      ORDER BY stage_date DESC, product_name
    `;

    const result = await client.query(query);
    return result.rows;
  }

  private static generateSegmentSummary(products: TimelineProduct[]) {
    const segmentMap = new Map<string, {
      totalProducts: number;
      stages: Set<string>;
      years: Set<number>;
    }>();

    products.forEach(product => {
      if (!segmentMap.has(product.segmen)) {
        segmentMap.set(product.segmen, {
          totalProducts: 0,
          stages: new Set(),
          years: new Set()
        });
      }

      const segment = segmentMap.get(product.segmen)!;
      segment.totalProducts++;
      segment.stages.add(product.stage);
      
      if (product.stage_date) {
        const year = new Date(product.stage_date).getFullYear();
        segment.years.add(year);
      }
    });

    return Array.from(segmentMap.entries()).map(([segmen, data]) => ({
      segmen,
      totalProducts: data.totalProducts,
      stages: Array.from(data.stages),
      yearRange: data.years.size > 0 
        ? `${Math.min(...data.years)} - ${Math.max(...data.years)}`
        : 'N/A'
    }));
  }

  private static generateYearSummary(products: TimelineProduct[]) {
    const yearMap = new Map<number, {
      totalProducts: number;
      segments: Set<string>;
      stages: Set<string>;
    }>();

    products.forEach(product => {
      if (!product.stage_date) return;
      
      const year = new Date(product.stage_date).getFullYear();
      
      if (!yearMap.has(year)) {
        yearMap.set(year, {
          totalProducts: 0,
          segments: new Set(),
          stages: new Set()
        });
      }

      const yearData = yearMap.get(year)!;
      yearData.totalProducts++;
      yearData.segments.add(product.segmen);
      yearData.stages.add(product.stage);
    });

    return Array.from(yearMap.entries())
      .map(([year, data]) => ({
        year,
        totalProducts: data.totalProducts,
        segments: Array.from(data.segments),
        stages: Array.from(data.stages)
      }))
      .sort((a, b) => b.year - a.year);
  }

  private static generateMetadata(products: TimelineProduct[]) {
    const dates = products
      .map(p => p.stage_date)
      .filter(Boolean)
      .map(date => new Date(date));

    const minDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
    const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

    return {
      totalProducts: products.length,
      dateRange: minDate && maxDate 
        ? `${minDate.toLocaleDateString('id-ID')} - ${maxDate.toLocaleDateString('id-ID')}`
        : 'N/A',
      exportDate: new Date().toLocaleString('id-ID')
    };
  }
}