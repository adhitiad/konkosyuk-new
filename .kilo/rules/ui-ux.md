# Aturan UI/UX

## Prinsip umum

- Utamakan antarmuka yang sederhana, jelas, konsisten, dan mudah dipahami.
- Pertahankan pola komponen dan gaya visual yang sudah digunakan proyek.
- Jangan menambahkan elemen dekoratif jika tidak membantu pengguna menyelesaikan tugas.
- Gunakan hierarki visual yang jelas melalui ukuran, jarak, warna, dan tipografi.
- Pastikan setiap aksi pengguna memiliki umpan balik yang terlihat.
- Baca `../../package.json` untuk memahami dependensi dan skrip yang tersedia.
- Wajib menggunakan Tailwind CSS untuk styling; hindari CSS kustom kecuali ada alasan yang jelas.
- Gunakan Tailwind linting dan format untuk memeriksa kesalahan visual, tipografi, dan konsistensi.
- Gunakan Tailwind Shadcn UI untuk komponen yang sudah ada; Buat komponen baru hanya jika tidak ada yang sesuai `bunx --bun shadcn@latest ...`.
- Gunakan `bun --bun run lint` dan `bun --bun run format` untuk memeriksa kesalahan visual, tipografi, dan konsistensi.

## Mobile-first

- Mobile-first adalah pendekatan wajib: mulai desain dan implementasi dari layar ponsel, bukan desktop.
- Jadikan tampilan satu kolom, konten utama, dan aksi terpenting sebagai default tanpa breakpoint.
- Tambahkan breakpoint Tailwind (`sm:`, `md:`, `lg:`, dan seterusnya) hanya untuk meningkatkan layout pada layar yang lebih besar.
- Jangan menyembunyikan fungsi penting pada layar kecil; ubah susunan, ukuran, atau bentuk penyajiannya bila diperlukan.
- Gunakan ukuran teks, jarak, tombol, dan area sentuh yang nyaman untuk perangkat seluler.
- Prioritaskan performa seluler: hindari gambar besar, animasi berat, dan komponen yang tidak diperlukan.
- Uji setiap perubahan pada viewport seluler sebelum memeriksa tablet dan desktop.

## Responsif dan aksesibilitas

- Pastikan layout berkembang secara bertahap dari mobile ke tablet dan desktop tanpa merusak konten.
- Gunakan layout responsif tanpa menyebabkan konten terpotong atau harus menggulir secara horizontal.
- Pastikan semua fungsi dapat digunakan dengan keyboard.
- Gunakan elemen HTML semantik dan label yang jelas untuk input serta tombol.
- Pertahankan kontras warna yang memadai dan jangan menyampaikan informasi hanya melalui warna.
- Sediakan keadaan fokus, hover, aktif, loading, kosong, berhasil, dan gagal jika relevan.
- Jangan menghilangkan indikator fokus bawaan tanpa pengganti yang setara.

## Komponen dan interaksi

- Gunakan komponen UI yang sudah ada sebelum membuat komponen baru.
- Gunakan tombol untuk aksi dan tautan untuk navigasi.
- Tampilkan konfirmasi sebelum aksi yang destruktif atau sulit dibatalkan.
- Nonaktifkan tombol hanya jika alasannya jelas; jelaskan kondisi yang diperlukan.
- Cegah pengiriman formulir berulang dan tampilkan status proses saat operasi berlangsung.
- Tampilkan pesan error di dekat sumber masalah dengan bahasa yang membantu pengguna memperbaikinya.
- Pertahankan input pengguna ketika validasi gagal.

## Bahasa dan konten

- Gunakan Bahasa Indonesia yang singkat, natural, dan konsisten.
- Hindari jargon teknis, kalimat ambigu, serta pesan error yang hanya berisi kode.
- Gunakan istilah yang sama untuk aksi dan objek yang sama di seluruh aplikasi.
- Tulis label tombol berdasarkan hasil aksi, misalnya “Simpan perubahan” bukan “Kirim”.
- Sediakan teks alternatif yang bermakna untuk gambar informatif; gunakan alt kosong untuk gambar dekoratif.

## Implementasi visual

- Gunakan token desain, variabel tema, dan utilitas Tailwind yang sudah tersedia.
- Jangan menggunakan nilai warna, jarak, atau ukuran acak jika token yang sesuai sudah ada.
- Pertahankan dukungan tema terang dan gelap jika komponen terkait sudah mendukungnya.
- Hindari animasi yang berlebihan; gunakan transisi singkat dan hormati preferensi reduced motion.
- Pastikan perubahan UI tidak menyebabkan layout bergeser secara tiba-tiba.

## Validasi sebelum selesai

1. Periksa tampilan pada viewport mobile terlebih dahulu, kemudian tablet dan desktop.
2. Uji alur utama, termasuk loading, kosong, berhasil, dan gagal.
3. Uji navigasi keyboard serta indikator fokus.
4. Jalankan pemeriksaan lint dan format yang tersedia.
5. Tinjau perubahan untuk memastikan tidak ada teks debug, placeholder, atau perubahan visual yang tidak terkait.
