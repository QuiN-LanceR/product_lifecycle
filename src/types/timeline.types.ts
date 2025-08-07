export interface TimelineProduct {
  id: number;
  name: string;
  kategori: string;
  stage_start: string | null;
  stage_end: string | null;
  stage_date: string;
  segmen: string;
  stage: string;
}

export interface TimelineDataPoint {
  x: number;
  y: number;
  productCount: number;
}

export interface TimelineDataset {
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

export interface TimelineApiResponse {
  success: boolean;
  data: {
    datasets: TimelineDataset[];
    yearRange: {
      min: number;
      max: number;
    };
    lastUpdated: string;
  };
}

export interface TimelineExportData {
  products: TimelineProduct[];
  summaryBySegment: {
    segmen: string;
    totalProducts: number;
    stages: string[];
    yearRange: string;
  }[];
  summaryByYear: {
    year: number;
    totalProducts: number;
    segments: string[];
    stages: string[];
  }[];
  metadata: {
    totalProducts: number;
    dateRange: string;
    exportDate: string;
  };
}