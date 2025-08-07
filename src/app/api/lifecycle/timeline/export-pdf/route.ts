import { NextResponse } from 'next/server';
import { TimelineService } from '@/services/timelineService';
import { PDFExportService } from '@/services/pdfExportService';

export async function GET() {
  try {
    const timelineData = await TimelineService.getTimelineData();
    const buffer = await PDFExportService.generateTimelinePDF(timelineData);
    
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="Timeline_Siklus_Hidup_${new Date().toISOString().split('T')[0]}.pdf"`);
    headers.set('Content-Type', 'application/pdf');
    
    return new NextResponse(buffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error exporting timeline to PDF:', error);
    return NextResponse.json(
      { error: 'Failed to export timeline PDF' },
      { status: 500 }
    );
  }
}