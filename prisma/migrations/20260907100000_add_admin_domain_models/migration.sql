-- CreateEnum
CREATE TYPE "StatusPemesanan" AS ENUM ('MENUNGGU_PERSETUJUAN', 'DITERIMA', 'DITOLAK', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PENYEWA', 'PEMILIK', 'ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('BELUM_VERIFIKASI', 'MENUNGGU', 'TERVERIFIKASI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "StatusBooking" AS ENUM ('MENUNGGU_PEMBAYARAN_DP', 'MENUNGGU_VERIFIKASI_DP', 'MENUNGGU_PERSETUJUAN', 'MENUNGGU_PELUNASAN', 'AKTIF', 'SELESAI', 'PROSES_REFUND_DP', 'SELESAI_DITOLAK', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "StatusRefundDP" AS ENUM ('BELUM_REFUND', 'MENUNGGU_PROSES', 'SEDANG_DIPROSES', 'BERHASIL', 'GAGAL');

-- CreateEnum
CREATE TYPE "TipeTransaksi" AS ENUM ('DP', 'PELUNASAN', 'REFUND');

-- CreateEnum
CREATE TYPE "StatusTransaksi" AS ENUM ('PENDING', 'BERHASIL', 'GAGAL', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "MetodePembayaran" AS ENUM ('TRANSFER', 'E_WALLET', 'CREDIT_CARD', 'VA');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('PENDING', 'BERHASIL', 'GAGAL');

-- CreateEnum
CREATE TYPE "StatusKyc" AS ENUM ('MENUNGGU', 'TERVERIFIKASI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "StatusRefund" AS ENUM ('MENUNGGU', 'DISETUJUI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "TipeProperti" AS ENUM ('KOST', 'KONTRAKAN');

-- CreateEnum
CREATE TYPE "StatusProperti" AS ENUM ('DRAFT', 'AKTIF', 'NONAKTIF');

-- CreateEnum
CREATE TYPE "StatusKetersediaan" AS ENUM ('TERSEDIA', 'TERISI', 'DIPESAN', 'MAINTENANCE');

-- AlterTable
ALTER TABLE "kyc_verifications" DROP COLUMN "status",
ADD COLUMN     "status" "KycStatus" NOT NULL DEFAULT 'MENUNGGU';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'PENYEWA',
DROP COLUMN "kyc_status",
ADD COLUMN     "kyc_status" "KycStatus" NOT NULL DEFAULT 'BELUM_VERIFIKASI';

-- DropEnum
DROP TYPE "UserRole";

-- DropEnum
DROP TYPE "KYCStatus";

-- CreateTable
CREATE TABLE "Booking" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unit_id" UUID NOT NULL,
    "penyewa_id" UUID NOT NULL,
    "tanggal_mulai" TIMESTAMP(6) NOT NULL,
    "tanggal_selesai" TIMESTAMP(6) NOT NULL,
    "total_harga" DECIMAL(12,2) NOT NULL,
    "status_booking" "StatusBooking" NOT NULL DEFAULT 'MENUNGGU_PEMBAYARAN_DP',
    "jumlahDP" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "jumlahPelunasan" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tanggalBayarDP" TIMESTAMP(6),
    "tanggalPelunasan" TIMESTAMP(6),
    "tanggalDitolak" TIMESTAMP(6),
    "alasanPenolakan" TEXT,
    "statusRefundDP" "StatusRefundDP" DEFAULT 'BELUM_REFUND',
    "transaksiDP_id" TEXT,
    "transaksiPelunasan_id" TEXT,
    "transaksiRefund_id" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "jumlah_bayar" DECIMAL(12,2) NOT NULL,
    "metode_pembayaran" "MetodePembayaran" NOT NULL,
    "status_pembayaran" "StatusPembayaran" NOT NULL DEFAULT 'PENDING',
    "bukti_transfer_url" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycRequest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "nomor_ktp" TEXT NOT NULL,
    "url_foto_ktp" TEXT NOT NULL,
    "url_foto_selfie" TEXT NOT NULL,
    "status_kyc" "StatusKyc" NOT NULL DEFAULT 'MENUNGGU',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KycRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRequest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "alasan" TEXT NOT NULL,
    "jumlah_refund" DECIMAL(12,2) NOT NULL,
    "status_refund" "StatusRefund" NOT NULL DEFAULT 'MENUNGGU',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_config" (
    "id" TEXT NOT NULL,
    "persentaseDP" INTEGER NOT NULL DEFAULT 30,
    "biayaRefundPenyewa" DECIMAL(5,2) NOT NULL DEFAULT 3.88,
    "biayaRefundPemilik" DECIMAL(5,2) NOT NULL DEFAULT 0.1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "tipeTransaksi" "TipeTransaksi" NOT NULL,
    "jumlah" DECIMAL(12,2) NOT NULL,
    "status" "StatusTransaksi" NOT NULL DEFAULT 'PENDING',
    "referensiGateway" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nama_properti" TEXT NOT NULL,
    "deskripsi" TEXT,
    "alamat_lengkap" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "tipe_properti" "TipeProperti" NOT NULL,
    "status" "StatusProperti" NOT NULL DEFAULT 'DRAFT',
    "pemilik_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitProperti" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "nama_unit" TEXT NOT NULL,
    "luas_meter" DECIMAL(8,2) NOT NULL,
    "harga_bulanan" DECIMAL(12,2) NOT NULL,
    "kapasitas" INTEGER NOT NULL,
    "status_ketersediaan" "StatusKetersediaan" NOT NULL DEFAULT 'TERSEDIA',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnitProperti_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fasilitas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nama_fasilitas" TEXT NOT NULL,
    "ikon" TEXT,
    "property_id" UUID NOT NULL,
    "unit_id" UUID,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fasilitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoProperti" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "url_foto" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "apakah_utama" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FotoProperti_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pemesanan" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unit_properti_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "jumlah_penghuni" INTEGER NOT NULL,
    "tanggal_mulai" TIMESTAMP(6) NOT NULL,
    "tanggal_selesai" TIMESTAMP(6),
    "total_harga" DECIMAL(12,2) NOT NULL,
    "status" "StatusPemesanan" NOT NULL DEFAULT 'MENUNGGU_PERSETUJUAN',
    "catatan" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pemesanan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_transaksiDP_id_key" ON "Booking"("transaksiDP_id");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_transaksiPelunasan_id_key" ON "Booking"("transaksiPelunasan_id");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_transaksiRefund_id_key" ON "Booking"("transaksiRefund_id");

-- CreateIndex
CREATE INDEX "Booking_penyewa_id_idx" ON "Booking"("penyewa_id");

-- CreateIndex
CREATE INDEX "Booking_unit_id_idx" ON "Booking"("unit_id");

-- CreateIndex
CREATE INDEX "Booking_transaksiDP_id_idx" ON "Booking"("transaksiDP_id");

-- CreateIndex
CREATE INDEX "Booking_transaksiPelunasan_id_idx" ON "Booking"("transaksiPelunasan_id");

-- CreateIndex
CREATE INDEX "Booking_transaksiRefund_id_idx" ON "Booking"("transaksiRefund_id");

-- CreateIndex
CREATE INDEX "Payment_booking_id_idx" ON "Payment"("booking_id");

-- CreateIndex
CREATE INDEX "Payment_status_pembayaran_idx" ON "Payment"("status_pembayaran");

-- CreateIndex
CREATE UNIQUE INDEX "KycRequest_nomor_ktp_key" ON "KycRequest"("nomor_ktp");

-- CreateIndex
CREATE INDEX "KycRequest_user_id_idx" ON "KycRequest"("user_id");

-- CreateIndex
CREATE INDEX "KycRequest_status_kyc_idx" ON "KycRequest"("status_kyc");

-- CreateIndex
CREATE INDEX "RefundRequest_booking_id_idx" ON "RefundRequest"("booking_id");

-- CreateIndex
CREATE INDEX "RefundRequest_status_refund_idx" ON "RefundRequest"("status_refund");

-- CreateIndex
CREATE INDEX "PaymentTransaction_tipeTransaksi_idx" ON "PaymentTransaction"("tipeTransaksi");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");

-- CreateIndex
CREATE INDEX "Property_pemilik_id_idx" ON "Property"("pemilik_id");

-- CreateIndex
CREATE INDEX "Property_tipe_properti_idx" ON "Property"("tipe_properti");

-- CreateIndex
CREATE INDEX "Property_status_idx" ON "Property"("status");

-- CreateIndex
CREATE INDEX "Property_created_at_idx" ON "Property"("created_at");

-- CreateIndex
CREATE INDEX "UnitProperti_property_id_idx" ON "UnitProperti"("property_id");

-- CreateIndex
CREATE INDEX "UnitProperti_status_ketersediaan_idx" ON "UnitProperti"("status_ketersediaan");

-- CreateIndex
CREATE INDEX "Fasilitas_property_id_idx" ON "Fasilitas"("property_id");

-- CreateIndex
CREATE INDEX "Fasilitas_unit_id_idx" ON "Fasilitas"("unit_id");

-- CreateIndex
CREATE INDEX "FotoProperti_property_id_idx" ON "FotoProperti"("property_id");

-- CreateIndex
CREATE INDEX "FotoProperti_urutan_idx" ON "FotoProperti"("urutan");

-- CreateIndex
CREATE INDEX "Pemesanan_property_id_idx" ON "Pemesanan"("property_id");

-- CreateIndex
CREATE INDEX "Pemesanan_unit_properti_id_idx" ON "Pemesanan"("unit_properti_id");

-- CreateIndex
CREATE INDEX "Pemesanan_tenant_id_idx" ON "Pemesanan"("tenant_id");

-- CreateIndex
CREATE INDEX "Pemesanan_status_idx" ON "Pemesanan"("status");

-- CreateIndex
CREATE INDEX "kyc_verifications_status_idx" ON "kyc_verifications"("status");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_penyewa_id_users_id_fk" FOREIGN KEY ("penyewa_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_transaksiDP_id_fkey" FOREIGN KEY ("transaksiDP_id") REFERENCES "PaymentTransaction"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_transaksiPelunasan_id_fkey" FOREIGN KEY ("transaksiPelunasan_id") REFERENCES "PaymentTransaction"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_transaksiRefund_id_fkey" FOREIGN KEY ("transaksiRefund_id") REFERENCES "PaymentTransaction"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_booking_id_Booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "KycRequest" ADD CONSTRAINT "KycRequest_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_booking_id_Booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_pemilik_id_users_id_fk" FOREIGN KEY ("pemilik_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "UnitProperti" ADD CONSTRAINT "UnitProperti_property_id_Property_id_fk" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Fasilitas" ADD CONSTRAINT "Fasilitas_property_id_Property_id_fk" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Fasilitas" ADD CONSTRAINT "Fasilitas_unit_id_UnitProperti_id_fk" FOREIGN KEY ("unit_id") REFERENCES "UnitProperti"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FotoProperti" ADD CONSTRAINT "FotoProperti_property_id_Property_id_fk" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Pemesanan" ADD CONSTRAINT "Pemesanan_unit_properti_id_UnitProperti_id_fk" FOREIGN KEY ("unit_properti_id") REFERENCES "UnitProperti"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Pemesanan" ADD CONSTRAINT "Pemesanan_property_id_Property_id_fk" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Pemesanan" ADD CONSTRAINT "Pemesanan_tenant_id_users_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
