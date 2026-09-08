# Autentikasi Pengguna

Pengguna dapat membuat akun dan masuk untuk mengakses fitur sesuai perannya masing-masing.

## Spesifikasi

### Tujuan

Pengguna dapat membuat akun dan masuk ke aplikasi agar fitur sesuai perannya (penyewa, pemilik, admin) dapat diakses dengan aman.

### Selesai bila

- Halaman pendaftaran dan masuk tersedia serta dapat dibuka dari halaman yang membutuhkan autentikasi.
- Pengunjung yang belum punya akun dapat mendaftar, lalu masuk ke aplikasi.
- Setelah masuk, aplikasi mengenali peran pengguna dan hanya menampilkan menu/halaman yang berhak diakses.
- Pengguna yang belum masuk tidak dapat membuka halaman khusus peran dan diarahkan ke halaman masuk.
- Pengguna dapat keluar dari akun dan kembali ke kondisi belum masuk.

## Sub-fitur: Daftar Akun

Pengunjung membuat akun baru melalui formulir pendaftaran.

### Tujuan

Pengunjung dapat membuat akun baru melalui formulir pendaftaran agar dapat masuk dan menggunakan fitur aplikasi.

### Selesai bila

- Halaman pendaftaran menampilkan formulir berisi data yang dibutuhkan (misalnya nama, email, dan kata sandi) beserta tombol untuk mengirim pendaftaran.
- Data yang tidak lengkap atau tidak valid ditolak dan pengguna melihat pesan kesalahan yang jelas di formulir.
- Setelah pendaftaran berhasil, akun baru tercatat dan pengguna dapat langsung masuk ke aplikasi.

## Sub-fitur: Masuk Akun

Pengguna masuk menggunakan kredensial untuk membuka halaman terproteksi.

### Tujuan

Pengguna yang sudah punya akun dapat masuk menggunakan kredensialnya sehingga aplikasi mengenali identitas dan perannya.

### Selesai bila

- Halaman masuk menampilkan kolom email, kolom kata sandi, dan tombol masuk.
- Jika email atau kata sandi salah, pengguna mendapat pesan kesalahan yang jelas dan tidak berhasil masuk.
- Setelah berhasil masuk, pengguna diarahkan ke halaman awal atau dashboard yang sesuai perannya.
- Saat berpindah halaman, pengguna tidak diminta masuk kembali selama sesi berjalan.

## Sub-fitur: Peran & Proteksi

Setiap halaman penyewa, pemilik, atau admin hanya dapat diakses oleh pengguna dengan peran yang sesuai.

### Tujuan

Halaman khusus penyewa, pemilik, dan admin hanya dapat dibuka oleh pengguna dengan peran yang sesuai agar data dan menu di luar haknya tidak dapat diakses.

### Selesai bila

- Setelah masuk, menu dan halaman yang ditampilkan hanya yang sesuai dengan peran pengguna.
- Pengguna yang membuka halaman khusus peran yang bukan haknya mendapat penolakan dan pesan bahwa ia tidak memiliki akses.
- Pengunjung yang belum masuk dan membuka halaman khusus peran diarahkan ke halaman masuk, lalu dapat kembali ke halaman yang dituju setelah berhasil masuk.
