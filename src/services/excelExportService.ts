import * as XLSX from 'xlsx';
import { TimelineExportData } from '@/types/timeline.types';

export class ExcelExportService {
  static generateTimelineWorkbook(data: TimelineExportData): Buffer {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Timeline Detail
    this.addTimelineDetailSheet(workbook, data);
    
    // Sheet 2: Summary by Segment
    this.addSegmentSummarySheet(workbook, data);
    
    // Sheet 3: Summary by Year
    this.addYearSummarySheet(workbook, data);
    
    // Sheet 4: Metadata
    this.addMetadataSheet(workbook, data);

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  private static addTimelineDetailSheet(workbook: XLSX.WorkBook, data: TimelineExportData) {
    const excelData = data.products.map((product, index) => ({
      'No': index + 1,
      'ID Produk': product.id,
      'Nama Produk': product.name,
      'Kategori': product.kategori,
      'Segmen': product.segmen,
      'Stage': product.stage,
      'Tanggal Stage': product.stage_date 
        ? new Date(product.stage_date).toLocaleDateString('id-ID')
        : '-',
      'Tanggal Mulai Stage': product.stage_start 
        ? new Date(product.stage_start).toLocaleDateString('id-ID')
        : '-',
      'Tanggal Selesai Stage': product.stage_end 
        ? new Date(product.stage_end).toLocaleDateString('id-ID')
        : '-',
      'Tahun': product.stage_date 
        ? new Date(product.stage_date).getFullYear()
        : '-',
      'Bulan': product.stage_date 
        ? new Date(product.stage_date).toLocaleDateString('id-ID', { month: 'long' })
        : '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },   // No
      { wch: 10 },  // ID Produk
      { wch: 25 },  // Nama Produk
      { wch: 15 },  // Kategori
      { wch: 15 },  // Segmen
      { wch: 15 },  // Stage
      { wch: 15 },  // Tanggal Stage
      { wch: 18 },  // Tanggal Mulai Stage
      { wch: 18 },  // Tanggal Selesai Stage
      { wch: 8 },   // Tahun
      { wch: 12 }   // Bulan
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Timeline Detail');
  }

  private static addSegmentSummarySheet(workbook: XLSX.WorkBook, data: TimelineExportData) {
    const excelData = data.summaryBySegment.map((segment, index) => ({
      'No': index + 1,
      'Segmen': segment.segmen,
      'Total Produk': segment.totalProducts,
      'Jumlah Stage': segment.stages.length,
      'Daftar Stage': segment.stages.join(', '),
      'Rentang Tahun': segment.yearRange
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    worksheet['!cols'] = [
      { wch: 5 },   // No
      { wch: 20 },  // Segmen
      { wch: 12 },  // Total Produk
      { wch: 12 },  // Jumlah Stage
      { wch: 30 },  // Daftar Stage
      { wch: 15 }   // Rentang Tahun
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary by Segment');
  }

  private static addYearSummarySheet(workbook: XLSX.WorkBook, data: TimelineExportData) {
    const excelData = data.summaryByYear.map((year, index) => ({
      'No': index + 1,
      'Tahun': year.year,
      'Total Produk': year.totalProducts,
      'Jumlah Segmen': year.segments.length,
      'Daftar Segmen': year.segments.join(', '),
      'Jumlah Stage': year.stages.length,
      'Daftar Stage': year.stages.join(', ')
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    worksheet['!cols'] = [
      { wch: 5 },   // No
      { wch: 8 },   // Tahun
      { wch: 12 },  // Total Produk
      { wch: 12 },  // Jumlah Segmen
      { wch: 25 },  // Daftar Segmen
      { wch: 12 },  // Jumlah Stage
      { wch: 25 }   // Daftar Stage
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary by Year');
  }

  private static addMetadataSheet(workbook: XLSX.WorkBook, data: TimelineExportData) {
    const metadataArray = [
      { 'Informasi': 'Total Produk', 'Nilai': data.metadata.totalProducts },
      { 'Informasi': 'Rentang Tanggal', 'Nilai': data.metadata.dateRange },
      { 'Informasi': 'Tanggal Export', 'Nilai': data.metadata.exportDate },
      { 'Informasi': 'Total Segmen', 'Nilai': data.summaryBySegment.length },
      { 'Informasi': 'Total Tahun', 'Nilai': data.summaryByYear.length }
    ];

    const worksheet = XLSX.utils.json_to_sheet(metadataArray);
    
    worksheet['!cols'] = [
      { wch: 20 },  // Informasi
      { wch: 30 }   // Nilai
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Metadata');
  }
}