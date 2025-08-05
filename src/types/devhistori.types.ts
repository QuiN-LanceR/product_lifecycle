export interface DevHistori {
  id: number;
  id_produk: number;
  nama_produk: string;
  tipe_pekerjaan: string;
  tanggal_mulai: string;
  tanggal_akhir: string;
  version: string;
  deskripsi: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TableMasterDevHistoriProps {
  currentPage: number;
  onTotalChange: (totalPages: number) => void;
}