# Database Schema FinTrack

Dokumentasi schema database untuk aplikasi FinTrack. Tersedia dua versi: **Firestore** (saat ini dipakai) dan **PostgreSQL** (untuk nanti). Schema sudah dioptimasi untuk **best practice** dan **scalability**, dengan fitur-fitur modern aplikasi fintech.

## 📂 Struktur Folder

```
db/
├── schemas/
│   ├── firestore.schema.ts    # TypeScript types untuk Firestore
│   └── postgres.schema.ts     # TypeScript types untuk PostgreSQL
├── migrations/
│   └── 001_initial_schema.sql # Migration initial untuk PostgreSQL
└── README.md                   # Dokumentasi ini
```

## 🎯 Best Practice & Scalability Features

1. **Soft Delete**: Semua tabel memiliki `is_deleted` dan `deleted_at` untuk menghindari penghapusan permanen
2. **Audit Trail**: `created_at` dan `updated_at` dengan trigger otomatis
3. **UUID Primary Key**: Semua ID menggunakan UUID untuk keamanan dan scalability
4. **JSONB**: Untuk field yang fleksibel (settings, metadata, location, dll)
5. **Indexes**: Multiple indexes untuk performa query yang optimal
6. **Cascade Delete**: Semua foreign key memiliki `ON DELETE CASCADE`

## 🗄️ Tabel/Koleksi Utama

### 1. `users`
Menyimpan data profil user tambahan (selain Firebase Auth).

| Field              | Type          | Deskripsi                                  |
|---------------------|---------------|--------------------------------------------|
| id                  | UUID          | Primary key                                |
| firebase_uid        | string        | UID dari Firebase Auth                     |
| email               | string        | Email user (unique)                       |
| email_verified      | boolean       | Status verifikasi email                    |
| display_name        | string        | Nama tampilan user                         |
| photo_url           | string        | URL foto profil                            |
| phone_number        | string        | Nomor telepon                              |
| currency            | string        | Mata uang default (IDR)                    |
| locale              | string        | Bahasa dan locale (id-ID)                  |
| timezone            | string        | Zona waktu (Asia/Jakarta)                  |
| date_format         | string        | Format tanggal (DD/MM/YYYY)                |
| is_premium          | boolean       | Status premium user                         |
| premium_expires_at  | timestamp     | Kadaluarsa premium                          |
| onboarding_completed| boolean       | Status onboarding selesai                   |
| last_login_at       | timestamp     | Terakhir login                              |
| settings            | JSONB         | Pengaturan user (notifications, privacy)   |
| is_deleted          | boolean       | Soft delete                                 |
| deleted_at          | timestamp     | Waktu dihapus                               |
| created_at          | timestamp     | Waktu dibuat                                |
| updated_at          | timestamp     | Waktu diupdate                              |

### 2. `accounts`
Menyimpan rekening/akun keuangan user (bank, e-wallet, tunai, investasi, kartu kredit, pinjaman).

| Field               | Type          | Deskripsi                                  |
|---------------------|---------------|--------------------------------------------|
| id                  | UUID          | Primary key                                |
| user_id             | UUID          | Foreign key ke users                       |
| name                | string        | Nama akun (misal: "BNI", "GoPay")         |
| type                | enum          | `bank` \| `ewallet` \| `cash` \| `investment` \| `credit_card` \| `loan` |
| subtype             | string        | Subtipe akun                                |
| institution_name    | string        | Nama institusi (misal: "Bank Negara Indonesia") |
| account_number      | string        | Nomor rekening (opsional, terenkripsi)     |
| balance             | numeric       | Saldo saat ini                              |
| available_balance   | numeric       | Saldo tersedia (untuk kartu kredit)        |
| credit_limit        | numeric       | Batas kredit (untuk kartu kredit)           |
| currency            | string        | Mata uang akun                              |
| color               | string        | Warna untuk tampilan                        |
| icon                | string        | Ikon akun                                   |
| include_in_net_worth| boolean       | Masuk dalam perhitungan net worth           |
| is_active           | boolean       | Status akun aktif/non-aktif                |
| is_deleted          | boolean       | Soft delete                                 |
| deleted_at          | timestamp     | Waktu dihapus                               |
| last_synced_at      | timestamp     | Terakhir sinkronisasi dengan bank           |
| metadata            | JSONB         | Metadata tambahan                           |
| created_at          | timestamp     | Waktu dibuat                                |
| updated_at          | timestamp     | Waktu diupdate                              |

### 3. `categories`
Menyimpan kategori transaksi (pemasukan, pengeluaran, transfer) dengan hirarki parent-child.

| Field               | Type          | Deskripsi                                  |
|---------------------|---------------|--------------------------------------------|
| id                  | UUID          | Primary key                                |
| user_id             | UUID          | Foreign key ke users (null untuk kategori default) |
| name                | string        | Nama kategori                               |
| type                | enum          | `income` \| `expense` \| `transfer`       |
| parent_category_id  | UUID          | Parent kategori (untuk hirarki)            |
| icon                | string        | Ikon kategori                               |
| color               | string        | Warna kategori                              |
| is_default          | boolean       | Kategori default sistem atau buatan user   |
| is_deleted          | boolean       | Soft delete                                 |
| deleted_at          | timestamp     | Waktu dihapus                               |
| sort_order          | integer       | Urutan tampilan                              |
| created_at          | timestamp     | Waktu dibuat                                |
| updated_at          | timestamp     | Waktu diupdate                              |

### 4. `transactions`
Menyimpan transaksi (pemasukan, pengeluaran, transfer) dengan detail lengkap.

| Field               | Type          | Deskripsi                                  |
|---------------------|---------------|--------------------------------------------|
| id                  | UUID          | Primary key                                |
| user_id             | UUID          | Foreign key ke users                       |
| account_id          | UUID          | Foreign key ke accounts                    |
| to_account_id       | UUID          | Akun tujuan (untuk transfer)               |
| category_id         | UUID          | Foreign key ke categories                  |
| type                | enum          | `income` \| `expense` \| `transfer`       |
| status              | enum          | `pending` \| `completed` \| `failed` \| `cancelled` \| `refunded` |
| amount              | numeric       | Jumlah transaksi                            |
| fee                 | numeric       | Biaya transaksi                             |
| tax                 | numeric       | Pajak transaksi                             |
| description         | text          | Deskripsi transaksi                         |
| memo                | text          | Memo internal                               |
| merchant_name       | string        | Nama pedagang                               |
| merchant_id         | string        | ID pedagang                                 |
| transaction_date    | timestamp     | Tanggal transaksi                           |
| posting_date        | timestamp     | Tanggal posting ke bank                     |
| reference_id        | string        | ID referensi internal                       |
| external_id         | string        | ID referensi dari bank/e-wallet             |
| receipt_url         | string        | URL foto bukti transaksi                    |
| receipt_data        | text          | Data bukti transaksi (base64)               |
| location            | JSONB         | Lokasi transaksi (lat, lng, address)        |
| tags                | array         | Tag untuk transaksi                         |
| notes               | text          | Catatan tambahan                            |
| is_recurring        | boolean       | Transaksi berulang                          |
| recurring_transaction_id | UUID    | Referensi ke recurring_transactions         |
| is_split            | boolean       | Bagi-bagi tagihan                           |
| split_details       | JSONB         | Detail bagi-bagi tagihan                    |
| is_reconciled       | boolean       | Sudah direkonsiliasi                        |
| reconciled_at       | timestamp     | Waktu rekonsiliasi                          |
| is_deleted          | boolean       | Soft delete                                 |
| deleted_at          | timestamp     | Waktu dihapus                               |
| metadata            | JSONB         | Metadata tambahan                           |
| created_at          | timestamp     | Waktu dibuat                                |
| updated_at          | timestamp     | Waktu diupdate                              |

### 5. `recurring_transactions`
Menyimpan transaksi berulang (otomatis setiap hari/minggu/bulan).

| Field               | Type          | Deskripsi                                  |
|---------------------|---------------|--------------------------------------------|
| id                  | UUID          | Primary key                                |
| user_id             | UUID          | Foreign key ke users                       |
| account_id          | UUID          | Foreign key ke accounts                    |
| category_id         | UUID          | Foreign key ke categories                  |
| name                | string        | Nama transaksi berulang                     |
| type                | enum          | `income` \| `expense`                      |
| amount              | numeric       | Jumlah transaksi                            |
| description         | text          | Deskripsi                                   |
| frequency           | enum          | `daily` \| `weekly` \| `biweekly` \| `monthly` \| `bimonthly` \| `quarterly` \| `yearly` |
| interval            | integer       | Interval (misal: setiap 2 bulan = 2)       |
| start_date          | timestamp     | Tanggal mulai                               |
| end_date            | timestamp     | Tanggal berakhir (opsional)                 |
| last_occurrence     | timestamp     | Terjadi terakhir                            |
| next_occurrence     | timestamp     | Akan terjadi selanjutnya                    |
| day_of_month        | integer       | Tanggal dalam bulan (1-31)                  |
| day_of_week         | integer       | Hari dalam minggu (0=Minggu, 6=Sabtu)      |
| is_active           | boolean       | Status aktif                                |
| is_deleted          | boolean       | Soft delete                                 |
| deleted_at          | timestamp     | Waktu dihapus                               |
| created_at          | timestamp     | Waktu dibuat                                |
| updated_at          | timestamp     | Waktu diupdate                              |

### 6. `saving_plans`
Menyimpan rencana tabungan dengan milestones dan auto-save.

| Field               | Type          | Deskripsi                                  |
|---------------------|---------------|--------------------------------------------|
| id                  | UUID          | Primary key                                |
| user_id             | UUID          | Foreign key ke users                       |
| name                | string        | Nama rencana (misal: "Liburan Bali")       |
| description         | text          | Deskripsi rencana                           |
| target_amount       | numeric       | Target jumlah tabungan                      |
| current_amount      | numeric       | Jumlah yang sudah ditabung                  |
| deadline            | timestamp     | Target tanggal selesai                      |
| icon                | string        | Ikon rencana                                |
| color               | string        | Warna rencana                               |
| priority            | integer       | Prioritas rencana                           |
| auto_save           | boolean       | Auto save aktif                             |
| auto_save_amount    | numeric       | Jumlah auto save                            |
| auto_save_frequency | enum          | `weekly` \| `biweekly` \| `monthly`       |
| auto_save_day       | integer       | Hari auto save                               |
| linked_account_id   | UUID          | Akun untuk auto save                        |
| milestones          | JSONB         | Milestone tabungan                           |
| is_completed        | boolean       | Status selesai                               |
| completed_at        | timestamp     | Waktu selesai                                |
| is_deleted          | boolean       | Soft delete                                 |
| deleted_at          | timestamp     | Waktu dihapus                               |
| created_at          | timestamp     | Waktu dibuat                                |
| updated_at          | timestamp     | Waktu diupdate                              |

### 7. `budgets`
Menyimpan anggaran dengan rollover dan alert threshold.

| Field               | Type          | Deskripsi                                  |
|---------------------|---------------|--------------------------------------------|
| id                  | UUID          | Primary key                                |
| user_id             | UUID          | Foreign key ke users                       |
| category_id         | UUID          | Foreign key ke categories (null untuk anggaran keseluruhan) |
| name                | string        | Nama anggaran                               |
| amount              | numeric       | Batas anggaran                              |
| period              | enum          | `daily` \| `weekly` \| `monthly` \| `yearly` |
| month               | integer       | Bulan (1-12) untuk period monthly          |
| year                | integer       | Tahun anggaran                              |
| week                | integer       | Minggu anggaran                              |
| rollover            | boolean       | Rollover sisa anggaran ke periode berikutnya |
| rollover_amount     | numeric       | Jumlah rollover                              |
| alert_threshold     | integer       | Persentase threshold untuk alert (80%)      |
| alert_enabled       | boolean       | Alert aktif                                 |
| is_deleted          | boolean       | Soft delete                                 |
| deleted_at          | timestamp     | Waktu dihapus                               |
| created_at          | timestamp     | Waktu dibuat                                |
| updated_at          | timestamp     | Waktu diupdate                              |

### 8. `investments`
Menyimpan portofolio investasi dengan detail lengkap.

| Field               | Type          | Deskripsi                                  |
|---------------------|---------------|--------------------------------------------|
| id                  | UUID          | Primary key                                |
| user_id             | UUID          | Foreign key ke users                       |
| account_id          | UUID          | Foreign key ke accounts                    |
| name                | string        | Nama investasi (misal: "Saham BBCA")       |
| ticker_symbol       | string        | Simbol ticker (BBCA.JK)                    |
| type                | enum          | `stock` \| `mutual_fund` \| `etf` \| `gold` \| `bond` \| `crypto` \| `real_estate` \| `other` |
| sub_type            | string        | Subtipe investasi                           |
| exchange            | string        | Bursa efek (IDX, NYSE)                     |
| currency            | string        | Mata uang investasi                         |
| current_price       | numeric       | Harga saat ini per unit                     |
| purchase_price      | numeric       | Harga beli per unit                         |
| quantity            | numeric       | Jumlah unit investasi                       |
| total_value         | numeric       | Nilai total investasi saat ini              |
| cost_basis          | numeric       | Dasar biaya (total harga beli)              |
| unrealized_gain_loss | numeric     | Untung/rugi belum direalisasi               |
| unrealized_gain_loss_percentage | numeric | Persentase untung/rugi                     |
| purchase_date       | timestamp     | Tanggal pembelian                           |
| last_updated_price  | timestamp     | Terakhir update harga                        |
| icon                | string        | Ikon investasi                              |
| dividend_yield      | numeric       | Dividen yield                                |
| dividend_income     | numeric       | Total pendapatan dividen                     |
| is_deleted          | boolean       | Soft delete                                 |
| deleted_at          | timestamp     | Waktu dihapus                               |
| metadata            | JSONB         | Metadata tambahan                           |
| created_at          | timestamp     | Waktu dibuat                                |
| updated_at          | timestamp     | Waktu diupdate                              |

### 9. `investment_transactions`
Menyimpan riwayat transaksi investasi (beli, jual, dividen, dll).

| Field               | Type          | Deskripsi                                  |
|---------------------|---------------|--------------------------------------------|
| id                  | UUID          | Primary key                                |
| user_id             | UUID          | Foreign key ke users                       |
| investment_id       | UUID          | Foreign key ke investments                 |
| account_id          | UUID          | Foreign key ke accounts                    |
| type                | enum          | `buy` \| `sell` \| `dividend` \| `split` \| `contribution` \| `withdrawal` |
| quantity            | numeric       | Jumlah unit                                 |
| price               | numeric       | Harga per unit                              |
| amount              | numeric       | Total amount                                |
| fee                 | numeric       | Biaya transaksi                             |
| tax                 | numeric       | Pajak transaksi                             |
| transaction_date    | timestamp     | Tanggal transaksi                           |
| notes               | text          | Catatan                                     |
| reference_id        | string        | ID referensi                                 |
| is_deleted          | boolean       | Soft delete                                 |
| deleted_at          | timestamp     | Waktu dihapus                               |
| created_at          | timestamp     | Waktu dibuat                                |
| updated_at          | timestamp     | Waktu diupdate                              |

### 10. `subscriptions`
Menyimpan langganan bulanan dengan fitur pause.

| Field               | Type          | Deskripsi                                  |
|---------------------|---------------|--------------------------------------------|
| id                  | UUID          | Primary key                                |
| user_id             | UUID          | Foreign key ke users                       |
| name                | string        | Nama langganan (Netflix, Spotify)          |
| provider            | string        | Provider langganan                          |
| amount              | numeric       | Biaya langganan                             |
| currency            | string        | Mata uang                                   |
| billing_date        | integer       | Tanggal tagihan (1-31)                      |
| billing_period      | enum          | `monthly` \| `quarterly` \| `yearly`      |
| category_id         | UUID          | Foreign key ke categories                  |
| icon                | string        | Ikon langganan                              |
| next_billing_date   | timestamp     | Tanggal tagihan selanjutnya                 |
| last_payment_date   | timestamp     | Tanggal pembayaran terakhir                  |
| is_active           | boolean       | Status aktif                                |
| is_paused           | boolean       | Status di-pause                              |
| pause_until         | timestamp     | Pause sampai tanggal tertentu               |
| is_deleted          | boolean       | Soft delete                                 |
| deleted_at          | timestamp     | Waktu dihapus                               |
| metadata            | JSONB         | Metadata tambahan                           |
| created_at          | timestamp     | Waktu dibuat                                |
| updated_at          | timestamp     | Waktu diupdate                              |

### 11. `debts`
Menyimpan tracking utang (kartu kredit, pinjaman, dll).

| Field               | Type          | Deskripsi                                  |
|---------------------|---------------|--------------------------------------------|
| id                  | UUID          | Primary key                                |
| user_id             | UUID          | Foreign key ke users                       |
| name                | string        | Nama utang (Kartu Kredit BCA)              |
| type                | enum          | `credit_card` \| `personal_loan` \| `mortgage` \| `auto_loan` \| `student_loan` \| `other` |
| lender_name         | string        | Nama pemberi pinjaman                       |
| original_amount     | numeric       | Jumlah utang awal                           |
| current_balance     | numeric       | Saldo utang saat ini                        |
| interest_rate       | numeric       | Suku bunga tahunan (%)                      |
| minimum_payment     | numeric       | Pembayaran minimum                          |
| due_date            | integer       | Tanggal jatuh tempo (1-31)                  |
| start_date          | timestamp     | Tanggal mulai utang                          |
| end_date            | timestamp     | Tanggal selesai (lunas)                     |
| linked_account_id   | UUID          | Akun untuk pembayaran otomatis              |
| icon                | string        | Ikon utang                                  |
| color               | string        | Warna utang                                 |
| is_paid_off         | boolean       | Status lunas                                |
| paid_off_at         | timestamp     | Waktu lunas                                  |
| is_deleted          | boolean       | Soft delete                                 |
| deleted_at          | timestamp     | Waktu dihapus                               |
| created_at          | timestamp     | Waktu dibuat                                |
| updated_at          | timestamp     | Waktu diupdate                              |

### 12. `debt_payments`
Menyimpan riwayat pembayaran utang dengan breakdown principal dan interest.

| Field               | Type          | Deskripsi                                  |
|---------------------|---------------|--------------------------------------------|
| id                  | UUID          | Primary key                                |
| user_id             | UUID          | Foreign key ke users                       |
| debt_id             | UUID          | Foreign key ke debts                       |
| amount              | numeric       | Total pembayaran                            |
| principal_amount    | numeric       | Bagian pokok                                |
| interest_amount     | numeric       | Bagian bunga                                |
| payment_date        | timestamp     | Tanggal pembayaran                          |
| transaction_id      | UUID          | Referensi ke transactions                   |
| notes               | text          | Catatan                                     |
| is_deleted          | boolean       | Soft delete                                 |
| deleted_at          | timestamp     | Waktu dihapus                               |
| created_at          | timestamp     | Waktu dibuat                                |
| updated_at          | timestamp     | Waktu diupdate                              |

### 13. `notifications`
Menyimpan notifikasi untuk user.

| Field               | Type          | Deskripsi                                  |
|---------------------|---------------|--------------------------------------------|
| id                  | UUID          | Primary key                                |
| user_id             | UUID          | Foreign key ke users                       |
| type                | enum          | `transaction` \| `budget` \| `subscription` \| `saving_plan` \| `investment` \| `debt` \| `system` \| `marketing` |
| title               | string        | Judul notifikasi                            |
| body                | text          Isi notifikasi                              |
| data                | JSONB         Data tambahan (untuk deep linking)         |
| is_read             | boolean       | Sudah dibaca                                |
| read_at             | timestamp     | Waktu dibaca                                 |
| is_archived         | boolean       | Diarsipkan                                  |
| archived_at         | timestamp     | Waktu diarsipkan                            |
| action_url          | string        | URL untuk action button                      |
| created_at          | timestamp     | Waktu dibuat                                |

### 14. `user_sessions`
Menyimpan session user untuk keamanan.

| Field               | Type          | Deskripsi                                  |
|---------------------|---------------|--------------------------------------------|
| id                  | UUID          | Primary key                                |
| user_id             | UUID          | Foreign key ke users                       |
| device_id           | string        | ID perangkat                                |
| device_name         | string        | Nama perangkat (iPhone 15 Pro)             |
| device_type         | string        | Tipe perangkat (mobile, desktop)           |
| ip_address          | string        | Alamat IP                                   |
| location            | string        | Lokasi (Jakarta, Indonesia)                 |
| user_agent          | text          | User agent browser                           |
| expires_at          | timestamp     | Kadaluarsa session                           |
| is_active           | boolean       | Status aktif                                |
| created_at          | timestamp     | Waktu dibuat                                |
| updated_at          | timestamp     | Waktu diupdate                              |

## 🚀 Menjalankan Migration PostgreSQL

Untuk menjalankan migration di PostgreSQL:

```bash
# Menggunakan psql
psql -U your_username -d your_database -f db/migrations/001_initial_schema.sql

# Atau menggunakan migrasi tool seperti Prisma, Flyway, dll.
```

## 📝 Catatan Penting

1. **Firebase Auth**: Koleksi `users` di Firestore/PostgreSQL hanya menyimpan data tambahan. Data utama (email, password, dll) tetap dikelola oleh Firebase Auth.
2. **Soft Delete**: Semua tabel memiliki `is_deleted` dan `deleted_at` untuk menghindari penghapusan permanen dan audit trail.
3. **Cascade Delete**: Semua foreign key memiliki `ON DELETE CASCADE`, sehingga ketika user dihapus, semua data terkait juga akan dihapus.
4. **Updated At**: Semua tabel memiliki trigger `updated_at` yang otomatis memperbarui waktu ketika data diubah.
5. **UUID**: Semua primary key menggunakan UUID untuk keamanan dan scalability.
6. **Indexes**: Banyak indexes dibuat untuk performa query yang optimal, terutama pada field yang sering di-filter (user_id, is_deleted, date, dll).
