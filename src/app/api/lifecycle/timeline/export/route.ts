import { NextResponse } from 'next/server';
import { TimelineService } from '@/services/timelineService';
import { ExcelExportService } from '@/services/excelExportService';

export async function GET() {
  try {
    const timelineData = await TimelineService.getTimelineData();
    const buffer = ExcelExportService.generateTimelineWorkbook(timelineData);
    
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="Timeline_Siklus_Hidup_${new Date().toISOString().split('T')[0]}.xlsx"`);
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    return new NextResponse(buffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error exporting timeline to Excel:', error);
    return NextResponse.json(
      { error: 'Failed to export timeline data' },
      { status: 500 }
    );
  }
}