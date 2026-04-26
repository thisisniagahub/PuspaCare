# 🚀 PUSPA Asnaf Management: Blueprint & SOP

**Status**: Dirancang (Planned)
**Fokus**: Transformasi pengurusan penerima bantuan (Ahli Asnaf) daripada sekadar "Sistem Rekod" kepada **Ekosistem Pemerkasaan Pintar (Smart Empowerment Ecosystem)** bertaraf Enterprise, melepasi piawaian aplikasi kebajikan nasional seperti MyKasih.

---

## 🌟 Visi Sistem (The Grand Vision)

Platform PUSPA tidak lagi sekadar menyimpan data peribadi dan rekod transaksi. Ia berevolusi menjadi sebuah sistem **Omnichannel, AI-Driven, dan Geolocation-Aware**.

Matlamat utama:
1. **Zero-Leakage (Sifar Ketirisan)**: Pengesahan biometrik (eKYC) & integrasi silang (cross-checking) menghalang *double-dipping* (bantuan bertindih).
2. **Hyper-Personalization**: Setiap asnaf menerima pelan tindakan (intervention plan) yang dikhususkan berdasarkan Indeks Kerentanan (Vulnerability Index) mereka.
3. **Asnaf to Asnafpreneur**: Memantau perjalanan (graduation) asnaf keluar dari kepompong kemiskinan dengan metrik impak yang boleh disahkan (verifiable impact metrics).

---

## 🛠️ Ciri-ciri Teras & Senibina (Core Features & Architecture)

### 1. 🛡️ Pendaftaran Pintar & Pengesahan eKYC (Smart Onboarding)
Berbanding sistem tradisional yang memerlukan asnaf hadir ke pejabat membawa salinan kad pengenalan fizikal, PUSPA menggunakan teknologi nirkertas (paperless).

* **Aliran (Workflow)**:
  1. Asnaf memohon melalui portal awam / WhatsApp.
  2. Sistem menghantar pautan **Self-Service eKYC** selamat (selari dengan piawaian BNM AMLA).
  3. Asnaf mengimbas MyKad (OCR mengekstrak data secara automatik: Nama, IC, Alamat).
  4. Asnaf mengambil swafoto (Liveness Detection + Face Match).
* **Kelebihan**: Pendaftaran siap dalam masa 3 minit. Mencegah pendaftaran akaun palsu atau "hantu".
* **Data Model**: \EKYCVerification\ (status: \erified\, \livenessScore\, \aceMatchScore\).

### 2. 📊 Enjin Pengiraan Kifayah Automatik (Dynamic Kifayah Engine)
Menilai kelayakan bukan lagi tekaan atau pengiraan manual excel.

* **Aliran (Workflow)**:
  1. Semasa pendaftaran, asnaf menyenaraikan Ahli Isi Rumah (Tanggungan, OKU, Pelajar).
  2. Sistem menarik data "Kadar Had Kifayah Semasa" mengikut negeri tempat tinggal asnaf.
  3. **Algoritma PUSPA** menolak jumlah pendapatan seisi rumah dengan keperluan asas (makanan, sewa, bil, pendidikan).
* **Output**: Menghasilkan **Skor Kerentanan (0-100)** dan menetapkan Kategori (Fakir, Miskin, Fisabilillah). Profil ditandakan warna secara automatik (Merah = Kritikal, Kuning = Sederhana).

### 3. 💳 Pengedaran Dana Dompet Pintar (Smart Wallet Disbursement) - *Melepasi MyKasih*
MyKasih menggunakan sistem MyKad untuk pembayaran di pasar raya tertentu. PUSPA menggunakan pendekatan dompet digital (e-Wallet) hibrid.

* **Aliran (Workflow)**:
  1. Dana diluluskan (Disbursement) dikreditkan ke dalam **PUSPA Virtual Wallet** asnaf.
  2. **Kawalan Kategori (Category Fencing)**: Duit bantuan "Makanan" (Food Aid) hanya boleh diimbas (QR Pay / TapSecure) di rakan niaga PUSPA berdaftar (Runcit, Pasaraya) dan sistem akan menolak pembelian barangan terlarang (rokok, alkohol).
  3. Dana "Pendidikan" hanya boleh dipindahkan terus ke akaun PIBG sekolah atau pembekal uniform.
* **Kelebihan**: Fleksibiliti untuk asnaf berbelanja di kedai kejiranan (merchant kecil) berbanding hanya pasar raya besar, merangsang ekonomi komuniti setempat (hyper-local economy).

### 4. 🗺️ Perisikan Lokasi & Operasi Lapangan (Geo-Intelligence & Offline Field Ops)
Siasatan rumah asnaf dipermudahkan dengan alat digital moden untuk skuad skuadron/sukarelawan.

* **Aliran (Workflow)**:
  1. Sistem memetakan taburan asnaf dalam satu kawasan (Heatmap).
  2. Sistem menjana **Laluan Optimum (Optimized Routing)** untuk pegawai siasatan melawat 5 rumah asnaf dalam masa tersingkat.
  3. **Mod Luar Talian (Offline Mode)**: Jika rumah asnaf di pedalaman tiada internet, pegawai masih boleh mengisi borang siasatan (\CaseNote\), menangkap gambar rumah (\CaseDocument\), dan menanda koordinat GPS (Geotagging).
  4. Data disegerakkan (Auto-Sync) ke pelayan apabila kembali ke kawasan berinternet.

### 5. 🤖 Pembantu Bot Analitik & Komunikasi (Omnichannel Bot & 360° Timeline)
Interaksi asnaf tidak lagi bertaburan di pelbagai platform.

* **Aliran (Workflow)**:
  1. Profil asnaf memaparkan **Timeline 360-Darjah**.
  2. Ia menggabungkan semua titik sentuh (touchpoints): Panggilan telefon, kunjungan kaunter, permohonan kes, log pembayaran, dan perbualan WhatsApp.
  3. **OpenClaw Bot**: Asnaf boleh bertanya status permohonan via Telegram/WhatsApp (cth: *"Bila duit bantuan bulan ni masuk?"*). Bot membaca data dari \Disbursement\ dan membalas secara automatik, mengurangkan kesesakan panggilan di pusat panggilan PUSPA.


### 6. 🔄 Automasi Interoperabiliti Sifar-Geseran (Zero-Friction Interoperability)
Pegawai lapangan (Field Workers) tidak sepatutnya membuang masa merekodkan data yang sama ke dalam pelbagai sistem kerajaan/agensi berbeza (seperti eCoss, e-Kasih). PUSPA bertindak sebagai **Pusat Arahan Utama (Command Center)**.

* **Aliran (Workflow) "Satu Imbasan, Semua Terkini"**:
  1. Staf mengimbas Kad Pengenalan (IC) atau kod QR asnaf melalui aplikasi mudah alih PUSPA semasa serahan bantuan.
  2. PUSPA merekodkan transaksi secara masa nyata (real-time) ke dalam pangkalan data utamanya (\Disbursement\).
  3. **Enjin RPA (Robotic Process Automation)** PUSPA yang digerakkan oleh OpenClaw/Playwright diaktifkan di latar belakang (background worker).
  4. Robot pelayan (Server Bot) akan mendaftar masuk (login) ke portal eCoss secara automatik, mencari profil IC asnaf tersebut, dan mengemas kini log bantuan (cth: "Menerima Bantuan Bakul Makanan RM150 pada 26/04/2026").
* **Kelebihan**: 
  - Sifar kerja pengkeranian berganda (Zero double data-entry).
  - Mengelakkan asnaf menipu agensi lain kerana data bantuan dikemas kini secara serentak (Real-time Sync) merentas platform.
  - Staf PUSPA hanya perlu mahir menggunakan satu aplikasi sahaja (PUSPA), manakala sistem yang mengendalikan kerumitan bercakap dengan sistem legasi luar.

### 7. 📈 Papan Pemuka Pembangunan Asnafpreneur (Graduation Dashboard)
Bantuan zakat/sedekah adalah penyelesaian jangka pendek. Pemerkasaan adalah matlamat utama.

* **Aliran (Workflow)**:
  1. Sistem menjejaki sejarah pendapatan asnaf.
  2. Apabila algoritma mengesan peningkatan pendapatan stabil (contohnya asnaf memulakan perniagaan kecil dari bantuan modal PUSPA) selama 6 bulan, profil ini akan di-*flag* untuk **Graduasi**.
  3. Profil dipindahkan ke modul **Asnafpreneur** untuk bimbingan lanjutan, pembiayaan mikro (micro-financing), dan pemantauan perniagaan.
* **Kelebihan**: Metrik kejayaan ("Berapa ramai asnaf berjaya keluar dari kemiskinan tahun ini?") boleh dijana dengan satu klik untuk dilaporkan kepada penderma korporat (CSR).

---

## 🚦 SOP Pelaksanaan & Pelancaran (Implementation Phases)

### Fasa 1: Pengukuhan Profil & Kalkulator Kifayah (Bulan 1)
- [ ] Ubahsuai UI \src/modules/members/page.tsx\ untuk memasukkan tab **Ahli Isi Rumah (Household)**.
- [ ] Bina fungsi (Utility) untuk mengira dan memaparkan Had Kifayah & Status Kerentanan secara automatik pada profil.
- [ ] Hasilkan Timeline ringkas (Sejarah Kes & Pembayaran) di bawah profil.

### Fasa 2: Pemprosesan eKYC & Automasi Keselamatan (Bulan 2)
- [ ] Aktifkan modul pendaftaran eKYC melalui WhatsApp / Portal Awam.
- [ ] Integrasi dengan \EKYCVerification\ Prisma model.
- [ ] Bina fungsi "Anti-Double Dipping" (Sistem amaran jika IC/No Akaun diduplikasi).

### Fasa 3: PUSPA Wallet & Rangkaian Rakan Niaga (Bulan 3)
- [ ] Bina modul pengurusan dompet digital (Virtual Wallet) untuk asnaf.
- [ ] Bina aplikasi mini (PWA) untuk Rakan Niaga (Merchant) mengimbas kod QR asnaf.
- [ ] Laksanakan kawalan kategori pembelian (Item-Level Fencing).
- [ ] Bina Enjin RPA (Playwright/Puppeteer) untuk automasi kemas kini sistem eCoss secara latar belakang (Satu Imbasan).

### Fasa 4: OpenClaw AI & Geotagging Lapangan (Bulan 4)
- [ ] Aktifkan bot WhatsApp/Telegram berasaskan OpenClaw untuk melayan pertanyaan asnaf 24/7.
- [ ] Bina paparan Peta (Heatmap) di Dashboard untuk melihat kepadatan asnaf mengikut zon.
- [ ] Cipta borang luar talian (Offline Forms) berasaskan Service Worker (PWA) untuk skuad siasatan.

---

**"Daripada Penerima kepada Penyumbang. Membina Ekosistem Ihsan yang Mampan."**

