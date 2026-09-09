# Setup Cron Job - Cancel Expired Bookings

Endpoint ini digunakan untuk membatalkan booking yang telah melewati deadline pembayaran secara otomatis.

## Endpoint

```
POST /api/cron/cancel-expired-bookings
```

## Autentikasi

Endpoint ini dilindungi oleh secret token. Sertakan header:

```
Authorization: Bearer ${CRON_SECRET}
```

## Setup di Vercel

### 1. Tambahkan Environment Variable

Di Vercel Dashboard, tambahkan environment variable:

- **Name**: `CRON_SECRET`
- **Value**: Random string yang aman (contoh: `openssl rand -hex 32`)
- **Environment**: Production, Preview, Development

### 2. Buat Vercel Cron Job

Buat file `vercel.json` di root project (jika belum ada) atau tambahkan cron configuration:

```json
{
  "crons": [
    {
      "path": "/api/cron/cancel-expired-bookings",
      "schedule": "0 * * * *"
    }
  ]
}
```

Atau jika menggunakan Vercel Pro/Business, bisa juga setup melalui Vercel Dashboard > Settings > Cron Jobs.

### 3. Deploy

Setelah deploy, Vercel akan otomatis memanggil endpoint setiap 1 jam.

## Setup di Upstash QStash

### 1. Buat QStash Schedule

```bash
curl -X POST https://qstash.upstash.io/v2/schedules \
  -H "Authorization: Bearer ${QSTASH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "https://konkosyuk.vercel.app/api/cron/cancel-expired-bookings",
    "cron": "0 * * * *",
    "headers": {
      "Authorization": "Bearer ${CRON_SECRET}"
    }
  }'
```

### 2. Verifikasi Schedule

```bash
curl https://qstash.upstash.io/v2/schedules \
  -H "Authorization: Bearer ${QSTASH_TOKEN}"
```

## Testing Manual

### 1. Test dengan curl

```bash
curl -X POST https://konkosyuk.vercel.app/api/cron/cancel-expired-bookings \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

### 2. Expected Response

```json
{
  "success": true,
  "cancelled": 5,
  "skipped": 0,
  "errors": []
}
```

### 3. Test Scenario

1. Buat booking dengan `payment_deadline` = 1 menit dari sekarang
2. Tunggu 2 menit
3. Panggil endpoint cron manual
4. Cek:
   - Booking status berubah menjadi `EXPIRED`
   - Unit status berubah menjadi `AVAILABLE`
   - Notifikasi dikirim ke tenant

## Monitoring

### Logs

- Vercel: Lihat function logs di Vercel Dashboard > Functions
- QStash: Lihat delivery logs di Upstash Console

### Alerting

Rekomendasi: Setup alert jika `skipped > 0` atau `errors` tidak kosong.

## Security

- **Jangan** expose `CRON_SECRET` ke client-side
- **Jangan** commit `.env.local` atau `.env`
- Gunakan token yang cukup kompleks (minimal 32 karakter random)
- Rotate token secara periodik

## Batch Processing

Endpoint ini memproses maksimal 100 booking per eksekusi untuk menghindari timeout. Jika ada lebih dari 100 booking expired, mereka akan diproses pada eksekusi berikutnya.
