# AI Usage Logbook
- Nama Projek : Indonesianhorror
- Jenis Proyek: Website Game Horror Beredukasi
- Anggota Tim: Arindi Putri Mahardika dan Raditya Ferly Saputro
- AI Yang DIgunakan: Claude AI, ChatGPT, Gemini AI
- Platform Publikasi: GitHub Pages

# Tahap 1: Eksplorasi Ide & Perancangan Solusi
- Masalah yang ingin diselesaikan: Belajar pengetahuan umum lewat kuis biasanya membosankan dan tidak membuat orang ingin mengulang. Kami ingin kuis yang menegangkan dan menyenangkan, sehingga pemain mau terus menjawab soal.
- Ide solusi yang dipilih: Web game horor “Malam Kuis Angker” dengan hantu Indonesia (Pocong, Kuntilanak, Tuyul, Genderuwo). Pemain menjawab soal pengetahuan umum dalam 15 detik. Jawaban benar memberi senjata untuk memukul hantu, sedangkan jawaban salah membuat hantu mendekat dan sanity turun.
- AI yang digunakan: Claude (Anthropic)
- Prompt yang digunakan: “Posisikan dirimu sebagai ahli startup aplikasi berbasis web. Buatkan konsep web game horor yang menyenangkan. Pemain menjawab pertanyaan pengetahuan umum acak dalam 15 detik, dan jawaban benar akan memberi senjata untuk memukul musuh.”
- Saran AI: AI menawarkan konsep horor dengan kuis sebagai mekanisme bertahan hidup, hantu bertema lokal, beberapa jenis senjata, dan sistem ruangan yang makin sulit.
- Validasi & Modifikasi Mandiri: Kami memilih konsep “Website Game Horror Beredukasi" karena kuis dan horor bisa saling menguatkan: waktu 15 detik membuat pemain tegang, dan soalnya tetap mendidik. Kami menyesuaikan saran AI dengan kebutuhan pengguna: hantu memakai tokoh Indonesia agar akrab bagi pemain, soal memakai topik Indonesia dan umum (misalnya Candi Borobudur, Indonesia Raya), dan ada peringatan efek kejut di menu agar pemain bisa menyiapkan diri. Kami juga menambahkan fitur AI Logbook sendiri untuk mencatat jalannya permainan.

# Tahap 2: Penyusunan Kerangka Kode (Scaffolding)
- Bagian yang dikembangkan: Struktur index.html (menu, cara bermain, koleksi hantu, kuis, panel serang, jeda, game over, AI Logbook), lalu style.css (tema gelap, animasi hantu, bar waktu), lalu script.js (logika permainan).
- AI yang digunakan: Claude (Anthropic)
- Prompt yang digunakan: “Buatkan kode index.html saja sesuai dengan konsep tersebut”, lalu “Sekarang buatkan style.css”, lalu “Sekarang script.js”.
- Saran struktur atau kode dari AI: Kode dibagi tiga file. HTML berisi layar-layar terpisah (<section class="screen">) yang ditampilkan atau disembunyikan. CSS memakai variabel (--night, --ghost-scale, --vignette) yang diatur dari JavaScript. JS dibungkus dalam satu fungsi (() => {...})() dengan status state dan phase, bank soal berbentuk array, dan game loop requestAnimationFrame.
- Validasi & Modifikasi Mandiri:
HTML: kami memeriksa ID setiap elemen agar cocok dengan $('...') di JS, lalu menambahkan sendiri tombol btn-logbook di menu dan section ai-logbook beserta daftar ai-logbook-list.
CSS: kami memeriksa tampilan di layar HP (viewport-fit=cover, clamp()), dan menambahkan gaya #ai-logbook-list dan #ai-logbook-list li sendiri.
JavaScript: kami menambahkan sendiri fungsi addLogbookEntry() dan renderLogbook() yang menyimpan catatan ke localStorage (maksimal 100 entri), menambahkan logbook ke objek screens, serta memasang pemanggilan logbook di startGame, answerQuiz, killGhost, dan endGame.
[tambahkan perubahan lain yang kamu lakukan, misalnya soal, warna, teks, atau nilai senjata]

# Tahap 3: Pemecahan Masalah & Penanganan Galat (Debugging)
- Masalah atau error yang ditemukan: Ketika kami berhasil menambahkan tampilan AI Logbook nya ke dalam tampilan utama Website, tidak muncul bingkainya (Perintah AI Logbook dan Koleksi Hantu menjadi satu). Lalu setelah diperbaiki lagi, Sudah ada tampilan untuk AI Logbook nya namun tidak bisa diakses.
- AI yang digunakan: Claude (Anthropic), dan ChatGPT
- Prompt yang digunakan: "coba cek, apakah ada kesalahan pada kode index.html ini, karena tampilan ai logbook ada tapi tdak bisa dibuka", "tolong  cek apa yang salah dari kode script.js tersebut untuk memasukkan ai logbook, karena di saya tampilan ai logbook nya sudah ada tapi tidk bisa masuk"
- Saran perbaikan dari AI: Masalahnya ada di fungsi endGame. Saat menambahkan logbook, fungsi itu tertulis dua kali dan bersarang, jadi kurung kurawalnya tidak seimbang. Akibatnya seluruh script.js error sintaks dan tidak berjalan sama sekali, termasuk tombol logbook. Tampilan logbook-nya ada di HTML, tapi tidak ada kode yang jalan untuk membukanya.
- Hasil pengujian: “Klik AI Logbook di menu → layar logbook muncul → mulai game → entri baru tampil → tombol Kembali kembali ke menu → refresh halaman, entri masih ada.”
- Validasi & Modifikasi Mandiri: Masalahnya ada di fungsi endGame. Saat menambahkan logbook, fungsi itu tertulis dua kali dan bersarang, jadi kurung kurawalnya tidak seimbang. Akibatnya seluruh script.js error sintaks dan tidak berjalan sama sekali, termasuk tombol logbook. Tampilan logbook-nya ada di HTML, tapi tidak ada kode yang jalan untuk membukanya.

# Tahap 4: Refleksi & Penjelasan Kode
- Fungsi utama website: Game kuis horor. Pemain bertahan dari hantu dengan menjawab soal pengetahuan umum, memakai senjata hasil jawaban benar, dan mengejar skor tertinggi.
- Bagian kode yang paling penting:
answerQuiz(), onCorrect(), onWrong(): logika inti kuis, skor, dan senjata.
update(dt): game loop yang menggerakkan hantu, menguras baterai dan sanity, serta mengecek kalah.
QUESTIONS dan pickQuestion(): bank soal per level dan pemilihan soal tanpa pengulangan.
addLogbookEntry(): pencatatan ke localStorage.
- Penjelasan cara kerja kode:
openQuiz() memilih soal sesuai level ruangan, mengacak pilihan jawaban, lalu menampilkan timer 15 detik.
updateQuizTimer() mengurangi waktu tiap frame. Jika habis, answerQuiz(-1) dipanggil sebagai jawaban salah.
Jawaban benar (onCorrect) menambah skor (50 + sisa detik × 5), mengisi baterai dan sanity, dan memberi senjata acak sesuai level. Jika sisa waktu ≥ 10 detik (menjawab di 5 detik pertama), pukulannya kritis.
Jawaban salah (onWrong) mereset streak, memajukan hantu 18 poin, mengurangi sanity 15, dan Tuyul bahkan mencuri baterai.
Di update(), jarak hantu terus berkurang. Jika jarak ≤ 0 pemain tertangkap, dan jika sanity ≤ 0 permainan berakhir.
Skor tertinggi, koleksi hantu, dan logbook disimpan di localStorage dengan try/catch agar game tetap jalan jika penyimpanan tidak tersedia.
- AI yang digunakan: Claude (Anthropic)
- Prompt refleksi atau verifikasi: “Jelaskan cara kerja fungsi answerQuiz dan onCorrect baris per baris”, atau “Apa yang terjadi jika localStorage tidak tersedia?”
- Validasi & Modifikasi Mandiri: Kami memahami alur kuis → senjata → serangan → hantu mati atau pemain tertangkap, dan memeriksa bahwa angka seperti waktu 15 detik, nyawa awal 3, dan batas kritis ≥ 10 detik sesuai dengan teks di layar “Cara bermain”. Perubahan mandiri kami: fitur AI Logbook.

# Refleksi Tim
- Hal yang dipelajari:  Tata carapembutan website yang berguna dan fitur-fitur seperti index.html, style.css, dan script.js
- Tantangan yang dihadapi: sering kali terjadinya error karena kesalahan dalam penulisan kode
- Pembagian tugas antaranggota: 
Arindi Putri Mahardika : Memasukan kode-kode mulai dari index.html, style.css, dan script.js, dan mengakses AI Logbook
Raditya Ferly Saputro : Sebagai pusat ide atau pencarian ide konsep, pencarian kode-kode index.html, style.css, serta script.js 
- Rencana pengembangan selanjutnya: Menambah jumlah soal dan kategori, hantu dan senjata baru, efek suara yang lebih bervariasi, serta tampilan logbook yang bisa dihapus atau diekspor.
