# Pengajuan Booking

Penyewa mengajukan permintaan sewa untuk unit tertentu dan memantau status pengajuannya.

## Spesifikasi

### Tujuan

Fitur ini memungkinkan penyewa yang sudah masuk untuk mengajukan permintaan sewa sebuah unit dan memantau status pengajuannya hingga disetujui atau ditolak.

### Selesai bila

- Penyewa dapat mengisi formulir pengajuan untuk unit tertentu dan mengirimkannya ke pemilik.
- Pengajuan yang sudah dikirim muncul di daftar booking milik penyewa beserta properti/unit, tanggal, dan statusnya.
- Status pengajuan dapat berubah menjadi menunggu, disetujui, atau ditolak, dan perubahan itu terlihat oleh penyewa.

## Sub-fitur: Formulir Sewa

Penyewa mengisi formulir untuk mengirim permintaan booking sebuah unit.

### Tujuan

Formulir Sewa digunakan penyewa untuk mengirim permintaan booking sebuah unit.

### Selesai bila

- Formulir menampilkan unit yang dipilih beserta kolom pengisian yang diperlukan, seperti data kontak, tanggal mulai sewa, dan keterangan.
- Semua data wajib divalidasi; penyewa yang belum masuk akan diarahkan ke halaman masuk.
- Setelah tombol kirim ditekan, muncul konfirmasi bahwa permintaan terkirim dan pengajuan tersimpan di daftar booking penyewa.

## Sub-fitur: Status Booking

Menampilkan daftar booking milik penyewa beserta status persetujuannya.

### Tujuan

Status Booking menampilkan daftar pengajuan milik penyewa beserta status persetujuan dari pemilik.

### Selesai bila

- Halaman menampilkan seluruh booking penyewa dengan informasi unit/properti dan tanggal pengajuan.
- Setiap booking memiliki label status yang jelas, contohnya Menunggu, Disetujui, atau Ditolak.
- Jika belum ada booking, halaman menampilkan pesan kosong dan tautan untuk mencari properti.
