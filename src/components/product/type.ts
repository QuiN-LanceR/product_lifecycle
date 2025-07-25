export interface Attachment {
  id: string;
  nama_attachment: string;
  url_attachment: string;
  size: number;
  created_at: string;
}

export interface Product {
  id: string;
  produk: string;
  deskripsi: string;
  kategori: string;
  segmen: string;
  stage: string;
  harga: string;
  tanggal_launch: string;
  pelanggan: string;
  attachments?: Attachment[];
}