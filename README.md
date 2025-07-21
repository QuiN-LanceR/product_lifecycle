# 🧩 Product Lifecycle Manager

Aplikasi **Product Lifecycle Manager (PLM)** adalah platform internal yang digunakan untuk memantau, mengelola, dan menganalisis siklus hidup suatu produk, mulai dari tahap perencanaan hingga tahap akhir produk.

Dibangun menggunakan **Next.js** dengan dukungan antarmuka modern dari template **TailAdmin**, aplikasi ini mendukung pengelolaan produk secara efisien melalui dashboard interaktif, manajemen pengguna, grafik visualisasi lifecycle, dan sistem reporting.

---

## 🚀 Fitur Utama

### 📊 Dashboard
- Menyajikan ringkasan statistik penting secara real-time
- Tampilan grafik lifecycle produk secara visual dan intuitif
- Notifikasi status atau tindakan yang dibutuhkan oleh user

### 📦 CRUD Product
- Tambah, ubah, hapus, dan lihat data produk
- Field utama: Nama produk, Kode, Kategori, Status lifecycle, Tanggal rilis, dan lainnya
- Validasi data secara real-time

### 👥 User Management
- Registrasi dan otorisasi pengguna
- Role-based access control (admin / user biasa)
- Fitur reset password dan pengelolaan profil user

### 📈 Lifecycle Chart
- Menampilkan status lifecycle produk dalam bentuk grafik
- Tahapan meliputi: Idea → Development → Testing → Launch → Maintenance → Retired
- Dibangun menggunakan chart library yang responsif

### 🧾 Reporting
- Laporan berbasis filter tanggal, status, kategori produk, dan user
- Ekspor ke format PDF atau Excel (fitur opsional)
- Tampilan laporan yang terstruktur dan siap cetak

---

## 🛠️ Teknologi yang Digunakan

- **Next.js** – Framework React modern untuk pengembangan aplikasi web fullstack
- **TailAdmin** – UI Template berbasis Tailwind CSS yang digunakan untuk tampilan modern dan clean
- **TypeScript** *(opsional)* – Untuk pengembangan dengan tipe data yang lebih aman
- **Chart.js / Recharts** – Untuk visualisasi data lifecycle produk
- **React Hook Form / Zod** – Untuk validasi form CRUD produk dan user
- **NextAuth / Middleware** – Untuk otentikasi dan otorisasi user

### Cloning the Repository
Clone the repository using the following command:

```bash
git clone https://github.com/QuiN-LanceR/product_lifecycle.git
```

> Windows Users: place the repository near the root of your drive if you face issues while cloning.

1. Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
    > Use `--legacy-peer-deps` flag if you face peer-dependency error during installation.

2. Start the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```