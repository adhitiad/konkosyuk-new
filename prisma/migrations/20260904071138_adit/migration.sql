-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'owner', 'tenant', 'cust', 'staff');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('daily', 'weekly', 'monthly', 'yearly', 'custom');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending_dp', 'confirmed', 'active', 'completed', 'cancelled', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "BookingRequestStatus" AS ENUM ('pending', 'accepted', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('direct', 'agent', 'referral', 'organic', 'paid_ads', 'social_media');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'disputed');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded', 'cancelled', 'expired');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('midtrans', 'xendit', 'tripay', 'manual', 'bank_transfer', 'e_wallet', 'credit_card', 'virtual_account');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('IDR', 'USD');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('aktif', 'nonaktif', 'draft', 'pending_review', 'rejected', 'archived');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('kost', 'kostan', 'kontrakan', 'ruko', 'apartment', 'house', 'room', 'studio', 'boarding_house', 'homestay');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('available', 'occupied', 'maintenance', 'reserved', 'unavailable');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('reported', 'assigned', 'in_progress', 'resolved', 'closed', 'cancelled');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "MaintenanceCategory" AS ENUM ('plumbing', 'electrical', 'hvac', 'structural', 'appliance', 'cleaning', 'pest_control', 'security', 'other');

-- CreateEnum
CREATE TYPE "MaintenanceReportStatus" AS ENUM ('pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('bug_report', 'feature_request', 'general', 'complaint', 'compliment', 'other');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('pending', 'reviewed', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "AdType" AS ENUM ('featured', 'banner', 'sidebar', 'header', 'footer', 'popup');

-- CreateEnum
CREATE TYPE "AdPackageTier" AS ENUM ('basic', 'standard', 'premium', 'enterprise');

-- CreateEnum
CREATE TYPE "AdPackagePositionType" AS ENUM ('top', 'sidebar', 'header', 'footer', 'inline');

-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('none', 'pending', 'verified', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ktp', 'passport', 'sim', 'npwp', 'other');

-- CreateEnum
CREATE TYPE "LoyaltyTransactionType" AS ENUM ('earned', 'spent', 'expired', 'bonus', 'referral', 'refund');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('property', 'host', 'tenant', 'booking');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('pending', 'approved', 'rejected', 'flagged');

-- CreateEnum
CREATE TYPE "ReferralCategory" AS ENUM ('tenant', 'owner', 'general');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('pending', 'qualified', 'completed', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('pending', 'approved', 'rejected', 'processed', 'cancelled');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('generated', 'signed', 'active', 'expired', 'terminated', 'cancelled');

-- CreateEnum
CREATE TYPE "PricingSuggestionStatus" AS ENUM ('pending', 'accepted', 'rejected', 'applied', 'expired');

-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('percentage', 'fixed', 'dynamic', 'seasonal', 'promotional');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('minor', 'moderate', 'major', 'critical');

-- CreateEnum
CREATE TYPE "DamageReportStatus" AS ENUM ('reported', 'acknowledged', 'in_progress', 'resolved', 'closed', 'disputed');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('excellent', 'good', 'fair', 'poor', 'damaged');

-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('move_in', 'move_out', 'periodic', 'maintenance', 'damage_assessment', 'safety');

-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('before', 'after', 'damage', 'general', 'evidence');

-- CreateEnum
CREATE TYPE "InspectionCategory" AS ENUM ('structural', 'electrical', 'plumbing', 'hvac', 'appliances', 'furniture', 'flooring', 'walls', 'windows', 'doors', 'safety', 'cleanliness', 'other');

-- CreateEnum
CREATE TYPE "PlaceType" AS ENUM ('restaurant', 'cafe', 'mall', 'hospital', 'school', 'university', 'park', 'gym', 'supermarket', 'pharmacy', 'bank', 'atm', 'public_transport', 'gas_station', 'convenience_store', 'laundry', 'salon', 'other');

-- CreateEnum
CREATE TYPE "InsightCategory" AS ENUM ('safety', 'noise', 'cleanliness', 'accessibility', 'amenities', 'community', 'transport', 'cost_of_living', 'other');

-- CreateEnum
CREATE TYPE "InsightSource" AS ENUM ('tenant', 'owner', 'public_data', 'verified_third_party');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('booking', 'payment', 'maintenance', 'message', 'review', 'referral', 'system', 'promotion', 'security', 'reminder');

-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('savings', 'checking', 'current', 'business');

-- CreateEnum
CREATE TYPE "GatewayProvider" AS ENUM ('midtrans', 'xendit', 'tripay', 'stripe', 'paypal');

-- CreateEnum
CREATE TYPE "Environment" AS ENUM ('sandbox', 'production');

-- CreateEnum
CREATE TYPE "WebhookProvider" AS ENUM ('midtrans', 'xendit', 'tripay', 'stripe', 'paypal', 'internal');

-- CreateEnum
CREATE TYPE "WebhookEventType" AS ENUM ('payment_success', 'payment_failed', 'payment_pending', 'refund_success', 'refund_failed', 'subscription_created', 'subscription_cancelled', 'invoice_created', 'invoice_paid', 'chargeback');

-- CreateEnum
CREATE TYPE "BalanceLogType" AS ENUM ('deposit', 'withdrawal', 'payment', 'refund', 'commission', 'bonus', 'penalty', 'adjustment');

-- CreateEnum
CREATE TYPE "GroupBookingStatus" AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'expired');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('invited', 'joined', 'paid', 'cancelled', 'left');

-- CreateEnum
CREATE TYPE "ExperimentStatus" AS ENUM ('draft', 'running', 'paused', 'completed', 'archived');

-- CreateEnum
CREATE TYPE "TagCategory" AS ENUM ('amenity', 'location', 'feature', 'policy', 'vibe', 'accessibility', 'other');

-- CreateEnum
CREATE TYPE "PaymentPurpose" AS ENUM ('rent', 'deposit', 'utility', 'maintenance', 'penalty', 'refund', 'commission', 'other');

-- CreateEnum
CREATE TYPE "LoyaltyTier" AS ENUM ('bronze', 'silver', 'gold', 'platinum');

-- CreateEnum
CREATE TYPE "FacilityCategory" AS ENUM ('bathroom', 'kitchen', 'bedroom', 'living_room', 'parking', 'security', 'laundry', 'internet', 'fitness', 'pool', 'garden', 'other');

-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('pending', 'approved', 'rejected', 'completed', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('pending', 'approved', 'rejected', 'processing', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "user_id" UUID NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(6),
    "refresh_token_expires_at" TIMESTAMP(6),
    "expires_at" TIMESTAMP(6),
    "password" TEXT,
    "scope" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuer" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_packages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "tier" "AdPackageTier" NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "position_type" "AdPackagePositionType" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "session_id" TEXT,
    "event" TEXT NOT NULL,
    "properties" JSONB DEFAULT '{}',
    "user_agent" TEXT,
    "ip_address" TEXT,
    "referrer" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "is_secret" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "admin_id" UUID,
    "action" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "details" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "BalanceLogType" NOT NULL,
    "description" TEXT NOT NULL,
    "related_id" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "unit_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "num_occupants" INTEGER NOT NULL,
    "start_date" TIMESTAMP(6) NOT NULL,
    "status" "BookingRequestStatus" NOT NULL DEFAULT 'pending',
    "agreed_price" DECIMAL(12,2),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "property_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "booking_type" "BookingType" NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending_dp',
    "start_date" TIMESTAMP(6) NOT NULL,
    "end_date" TIMESTAMP(6) NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "rejection_reason" TEXT,
    "is_group_booking" BOOLEAN DEFAULT false,
    "group_booking_id" UUID,
    "pricing_rule_id" UUID,
    "base_price_at_booking" DECIMAL(12,2),
    "security_deposit" DECIMAL(12,2),
    "move_in_inspection_id" UUID,
    "move_out_inspection_id" UUID,
    "inspection_status" "InspectionStatus" NOT NULL DEFAULT 'pending',
    "booking_request_id" UUID,
    "discount_amount" DECIMAL(12,2) DEFAULT 0,
    "tax_amount" DECIMAL(12,2) DEFAULT 0,
    "total_amount" DECIMAL(12,2),
    "currency" "Currency" NOT NULL DEFAULT 'IDR',
    "confirmed_at" TIMESTAMP(6),
    "cancelled_at" TIMESTAMP(6),
    "completed_at" TIMESTAMP(6),
    "rejected_at" TIMESTAMP(6),
    "source" "BookingSource" NOT NULL DEFAULT 'direct',
    "referral_code" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campus_areas" (
    "campus_area_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "campus_area_slug" TEXT NOT NULL,
    "campus_area_name" TEXT NOT NULL,
    "campus_area_image_key" TEXT NOT NULL,
    "campus_area_property_count" INTEGER NOT NULL DEFAULT 0,
    "campus_area_sort_order" INTEGER NOT NULL DEFAULT 0,
    "campus_area_is_active" BOOLEAN NOT NULL DEFAULT true,
    "campus_area_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campus_area_updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campus_areas_pkey" PRIMARY KEY ("campus_area_id")
);

-- CreateTable
CREATE TABLE "chart_of_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_code" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_type" "AccountType" NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "parent_account_id" UUID,

    CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_rooms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "tenant_id" UUID,
    "owner_id" UUID,
    "last_message_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "damage_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inspection_id" UUID NOT NULL,
    "item_id" UUID,
    "reported_by" UUID NOT NULL,
    "severity" "Severity" NOT NULL,
    "description" TEXT NOT NULL,
    "estimated_cost" DECIMAL(12,2),
    "actual_cost" DECIMAL(12,2),
    "status" "DamageReportStatus" NOT NULL DEFAULT 'reported',
    "resolution" TEXT,
    "resolved_by" UUID,
    "resolved_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "damage_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "variant" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "experiment_id" UUID,

    CONSTRAINT "experiment_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "status" "ExperimentStatus" NOT NULL DEFAULT 'draft',
    "variants" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "start_date" TIMESTAMP(6),
    "end_date" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experiments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "rollout_percentage" INTEGER NOT NULL DEFAULT 100,
    "allowedRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowedUsers" UUID[] DEFAULT ARRAY[]::UUID[],
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "category" "FeedbackCategory" NOT NULL,
    "message" TEXT NOT NULL,
    "rating" INTEGER,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general_ledger" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transaction_date" TIMESTAMP(6) NOT NULL,
    "account_code" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "debit" DECIMAL(12,2) DEFAULT 0,
    "credit" DECIMAL(12,2) DEFAULT 0,
    "balance" DECIMAL(12,2),
    "created_by" UUID,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "general_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_booking_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_booking_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "share_percentage" DECIMAL(5,2) NOT NULL,
    "share_amount" DECIMAL(12,2) NOT NULL,
    "paid_amount" DECIMAL(12,2) DEFAULT 0,
    "status" "MemberStatus" NOT NULL DEFAULT 'invited',
    "joined_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_booking_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lead_user_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "status" "GroupBookingStatus" NOT NULL DEFAULT 'pending',
    "total_amount" DECIMAL(12,2) NOT NULL,
    "deposit_amount" DECIMAL(12,2) NOT NULL,
    "start_date" TIMESTAMP(6) NOT NULL,
    "end_date" TIMESTAMP(6) NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inspection_id" UUID NOT NULL,
    "category" "InspectionCategory" NOT NULL,
    "item_name" TEXT NOT NULL,
    "condition" "Condition",
    "notes" TEXT,
    "repair_cost" DECIMAL(12,2),
    "photo_urls" JSONB DEFAULT '[]',
    "is_new_damage" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_photos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inspection_id" UUID NOT NULL,
    "item_id" UUID,
    "type" "PhotoType" NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_type" "PropertyType" NOT NULL,
    "items" JSONB NOT NULL,
    "is_default" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "type" "InspectionType" NOT NULL,
    "status" "InspectionStatus" DEFAULT 'pending',
    "performed_by" UUID NOT NULL,
    "witness_id" UUID,
    "overall_condition" "Condition",
    "notes" TEXT,
    "damage_score" DECIMAL(5,2),
    "estimated_repair_cost" DECIMAL(12,2),
    "security_deposit" DECIMAL(12,2),
    "refund_amount" DECIMAL(12,2),
    "is_disputed" BOOLEAN DEFAULT false,
    "dispute_reason" TEXT,
    "completed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_verifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "didit_session_id" TEXT,
    "didit_redirect_url" TEXT,
    "status" "KYCStatus" NOT NULL DEFAULT 'pending',
    "document_type" "DocumentType",
    "ktp_image_url" TEXT,
    "selfie_image_url" TEXT,
    "face_match_score" DECIMAL(5,2),
    "liveness_passed" BOOLEAN,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kyc_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "amount" INTEGER NOT NULL,
    "type" "LoyaltyTransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "reference_id" UUID,
    "reference_type" TEXT,
    "expires_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "property_id" UUID NOT NULL,
    "unit_id" UUID,
    "category" "MaintenanceCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "images" JSONB DEFAULT '[]',
    "status" "MaintenanceReportStatus" NOT NULL DEFAULT 'pending',
    "resolution_note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_tickets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unit_id" UUID NOT NULL,
    "tenant_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" JSONB DEFAULT '[]',
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "status" "TicketStatus" NOT NULL DEFAULT 'reported',
    "owner_notes" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_id" UUID NOT NULL,
    "sender_id" UUID,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nearby_places" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PlaceType" NOT NULL,
    "distance" INTEGER NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(10,8) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nearby_places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neighborhood_insights" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "category" "InsightCategory" NOT NULL,
    "rating" DECIMAL(3,2),
    "description" TEXT,
    "source" "InsightSource" NOT NULL DEFAULT 'tenant',
    "submitted_by" UUID,
    "is_verified" BOOLEAN DEFAULT false,
    "helpful_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "neighborhood_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neighborhood_places" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "type" "PlaceType" NOT NULL,
    "name" TEXT NOT NULL,
    "distance" DECIMAL(5,2),
    "walking_minutes" INTEGER,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "neighborhood_places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resend_api_key" TEXT,
    "resend_from_email" TEXT,
    "meta_access_token" TEXT,
    "meta_phone_number_id" TEXT,
    "meta_maintenance_created_template" TEXT,
    "meta_maintenance_updated_template" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "reference_id" UUID,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_bank_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" UUID NOT NULL,
    "account_type" "BankAccountType" NOT NULL,
    "provider_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "owner_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_gateway_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" "GatewayProvider" NOT NULL,
    "is_active" BOOLEAN DEFAULT false,
    "config" JSONB NOT NULL DEFAULT '{}',
    "environment" "Environment" NOT NULL DEFAULT 'sandbox',
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_gateway_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_gateway_credentials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "encrypted_config" JSONB NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gateway_id" UUID NOT NULL,

    CONSTRAINT "payment_gateway_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_number" TEXT NOT NULL,
    "booking_id" UUID,
    "provider" "PaymentProvider" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "gateway_response" JSONB,
    "webhook_payload" JSONB,
    "paid_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "property_id" UUID,
    "provider" "PaymentProvider" NOT NULL,
    "purpose" "PaymentPurpose" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'IDR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "transaction_id" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "raw_response" JSONB DEFAULT '{}',
    "paid_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL DEFAULT 'default',
    "platform_fee_percent" DECIMAL(5,2) DEFAULT 1.8,
    "featured_listing_price" DECIMAL(12,2) DEFAULT 50000,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "popular_areas" (
    "popular_area_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "popular_area_slug" TEXT NOT NULL,
    "popular_area_name" TEXT NOT NULL,
    "popular_area_image_key" TEXT NOT NULL,
    "popular_area_property_count" INTEGER NOT NULL DEFAULT 0,
    "popular_area_sort_order" INTEGER NOT NULL DEFAULT 0,
    "popular_area_is_active" BOOLEAN NOT NULL DEFAULT true,
    "popular_area_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "popular_area_updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "popular_areas_pkey" PRIMARY KEY ("popular_area_id")
);

-- CreateTable
CREATE TABLE "pricing_analytics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "month" TEXT NOT NULL,
    "avg_occupancy" DECIMAL(5,2),
    "avg_booking_value" DECIMAL(12,2),
    "total_bookings" INTEGER DEFAULT 0,
    "recommended_price" DECIMAL(12,2),
    "recommended_adjustment" DECIMAL(5,2),
    "confidence_score" DECIMAL(3,2),
    "factors" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pricing_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_suggestions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "rule_id" UUID,
    "suggested_value" DECIMAL(12,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "status" "PricingSuggestionStatus" NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pricing_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "province" TEXT,
    "city" TEXT,
    "district" TEXT,
    "type" "PropertyType" NOT NULL,
    "base_price" DECIMAL(12,2),
    "packages" JSONB NOT NULL DEFAULT '{"custom": {"unit": "days", "label": "Custom Duration", "enabled": false, "maxDuration": 365, "minDuration": 1, "pricePerUnit": 0}, "predefined": []}',
    "status" "PropertyStatus" NOT NULL DEFAULT 'aktif',
    "amenities" JSONB DEFAULT '[]',
    "metadata" JSONB DEFAULT '{}',
    "images" JSONB DEFAULT '[]',
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN DEFAULT false,
    "gps_verified" BOOLEAN NOT NULL DEFAULT false,
    "featured_until" TIMESTAMP(6),
    "ical_export_token" TEXT,
    "ical_import_url" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_ads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID,
    "package_id" UUID,
    "advertiser_name" TEXT NOT NULL,
    "advertiser_phone" TEXT NOT NULL,
    "advertiser_whatsapp" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "target_url" TEXT,
    "location" TEXT NOT NULL,
    "price" TEXT,
    "type" "AdType" NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(6),
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(6),
    "admin_note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_comparisons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "property_ids" JSONB NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_ratings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "cleanliness" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "security" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "accuracy" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "communication" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "value_for_money" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "rating_distribution" JSONB DEFAULT '{}',
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "type" "RuleType" NOT NULL DEFAULT 'percentage',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_similarities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "similar_property_id" UUID NOT NULL,
    "similarity_score" DECIMAL(5,4) NOT NULL,
    "cached_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_similarities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "referrer_id" UUID NOT NULL,
    "referee_id" UUID,
    "code" TEXT NOT NULL,
    "category" "ReferralCategory" NOT NULL DEFAULT 'tenant',
    "status" "ReferralStatus" NOT NULL DEFAULT 'pending',
    "property_id" UUID,
    "base_amount" DECIMAL(12,2) DEFAULT 0,
    "commission_rate" DECIMAL(5,2) DEFAULT 0,
    "commission_amount" DECIMAL(12,2) DEFAULT 0,
    "referee_transaction_id" UUID,
    "eligible_at" TIMESTAMP(6),
    "payout_scheduled_at" TIMESTAMP(6),
    "voucher_code" TEXT,
    "voucher_redeemed_at" TIMESTAMP(6),
    "offset_applied" BOOLEAN DEFAULT false,
    "tier" INTEGER DEFAULT 1,
    "payout_idempotency_key" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "completed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "user_id" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "approved_amount" DECIMAL(12,2),
    "reason" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'pending',
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMP(6),
    "review_note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refund_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_replies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "review_id" UUID NOT NULL,
    "user_id" UUID,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_by_id" UUID,
    "reviewed_user_id" UUID,
    "property_id" UUID,
    "type" "ReviewType" NOT NULL,
    "rating" DECIMAL(3,2) NOT NULL,
    "cleanliness" DECIMAL(3,2) NOT NULL,
    "security" DECIMAL(3,2) NOT NULL,
    "accuracy" DECIMAL(3,2) NOT NULL,
    "communication" DECIMAL(3,2) NOT NULL,
    "value_for_money" DECIMAL(3,2) NOT NULL,
    "comment" TEXT NOT NULL,
    "booking_id" UUID NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'pending',
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "reply_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_redemptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "reward_id" UUID NOT NULL,
    "points_used" INTEGER NOT NULL,
    "status" "RedemptionStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "points_cost" INTEGER NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_facilities" (
    "room_facility_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_facility_unit_id" UUID NOT NULL,
    "room_facility_category" "FacilityCategory" NOT NULL,
    "room_facility_name" TEXT NOT NULL,
    "room_facility_icon" TEXT NOT NULL DEFAULT 'circle-dot',
    "room_facility_sort_order" INTEGER NOT NULL DEFAULT 0,
    "room_facility_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_facilities_pkey" PRIMARY KEY ("room_facility_id")
);

-- CreateTable
CREATE TABLE "roommate_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "budget_min" DECIMAL(12,2),
    "budget_max" DECIMAL(12,2),
    "preferred_location" TEXT,
    "move_in_date" TIMESTAMP(6),
    "duration" TEXT,
    "lifestyle" JSONB DEFAULT '{}',
    "bio" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roommate_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_searches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" TEXT,
    "filters" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_matched_at" TIMESTAMP(6),
    "last_notified_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasonal_pricing_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "unit_id" UUID,
    "name" TEXT NOT NULL,
    "rule_type" "RuleType" NOT NULL DEFAULT 'percentage',
    "adjustment_value" DECIMAL(12,2) NOT NULL,
    "start_date" TIMESTAMP(6) NOT NULL,
    "end_date" TIMESTAMP(6) NOT NULL,
    "min_nights" INTEGER,
    "max_nights" INTEGER,
    "priority" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seasonal_pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "user_id" UUID,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "token" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "category" "TagCategory" NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "twoFactor" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "user_id" UUID,
    "secret" TEXT NOT NULL,
    "backup_codes" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "failed_verification_count" INTEGER DEFAULT 0,
    "locked_until" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "twoFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_pricing_tiers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unit_id" UUID NOT NULL,
    "max_occupants" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_pricing_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "capacity" INTEGER,
    "size" TEXT,
    "status" "UnitStatus" NOT NULL DEFAULT 'available',
    "current_booking_id" UUID,
    "metadata" JSONB DEFAULT '{}',
    "room_size" DECIMAL(6,2),
    "electricity_included" BOOLEAN NOT NULL DEFAULT false,
    "furniture_included" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_contracts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "booking_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "contract_url" TEXT NOT NULL,
    "contract_status" "ContractStatus" NOT NULL DEFAULT 'generated',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_interest_vectors" (
    "user_id" UUID NOT NULL,
    "type_weights" JSONB NOT NULL DEFAULT '{}',
    "city_weights" JSONB NOT NULL DEFAULT '{}',
    "price_bucket_weights" JSONB NOT NULL DEFAULT '{}',
    "amenity_set" JSONB NOT NULL DEFAULT '[]',
    "area_weights" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_interest_vectors_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_notification_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "email_digest" TEXT NOT NULL DEFAULT 'immediate',
    "quiet_hours_start" TEXT,
    "quiet_hours_end" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "telegram" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'cust',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "ban_reason" TEXT,
    "two_factor_enabled" BOOLEAN DEFAULT false,
    "kyc_status" "KYCStatus" NOT NULL DEFAULT 'none',
    "ktp_number" TEXT,
    "ktp_image_url" TEXT,
    "reputation_score" DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "province" TEXT,
    "city" TEXT,
    "district" TEXT,
    "referral_code" TEXT,
    "referred_by" UUID,
    "loyalty_tier" "LoyaltyTier" NOT NULL DEFAULT 'bronze',
    "total_referrals" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wa_session" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wa_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_type" TEXT,
    "payload" JSONB NOT NULL,
    "signature_valid" BOOLEAN DEFAULT false,
    "payload_hash" TEXT,
    "details" JSONB DEFAULT '{}',
    "processed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" UUID,
    "bank_account_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'pending',
    "admin_note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accounts_provider_idx" ON "accounts"("provider_id", "account_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ad_packages_name_unique" ON "ad_packages"("name");

-- CreateIndex
CREATE INDEX "idx_ad_packages_active" ON "ad_packages"("is_active");

-- CreateIndex
CREATE INDEX "idx_ad_packages_tier" ON "ad_packages"("tier");

-- CreateIndex
CREATE INDEX "idx_analytics_events_created" ON "analytics_events"("created_at");

-- CreateIndex
CREATE INDEX "idx_analytics_events_event" ON "analytics_events"("event");

-- CreateIndex
CREATE INDEX "idx_analytics_events_user" ON "analytics_events"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "app_settings_key_unique" ON "app_settings"("key");

-- CreateIndex
CREATE INDEX "app_settings_key_idx" ON "app_settings"("key");

-- CreateIndex
CREATE INDEX "balance_logs_created_at_idx" ON "balance_logs"("created_at");

-- CreateIndex
CREATE INDEX "balance_logs_type_idx" ON "balance_logs"("type");

-- CreateIndex
CREATE INDEX "balance_logs_user_id_idx" ON "balance_logs"("user_id");

-- CreateIndex
CREATE INDEX "booking_requests_property_id_idx" ON "booking_requests"("property_id");

-- CreateIndex
CREATE INDEX "booking_requests_status_idx" ON "booking_requests"("status");

-- CreateIndex
CREATE INDEX "booking_requests_tenant_id_idx" ON "booking_requests"("tenant_id");

-- CreateIndex
CREATE INDEX "booking_requests_unit_id_idx" ON "booking_requests"("unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_request_id_key" ON "bookings"("booking_request_id");

-- CreateIndex
CREATE INDEX "bookings_group_booking_id_idx" ON "bookings"("group_booking_id");

-- CreateIndex
CREATE INDEX "bookings_is_group_booking_idx" ON "bookings"("is_group_booking");

-- CreateIndex
CREATE INDEX "bookings_property_availability_idx" ON "bookings"("property_id", "status", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "bookings_property_id_idx" ON "bookings"("property_id");

-- CreateIndex
CREATE INDEX "bookings_property_status_created_idx" ON "bookings"("property_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_unit_id_idx" ON "bookings"("unit_id");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");

-- CreateIndex
CREATE INDEX "bookings_user_status_created_idx" ON "bookings"("user_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "campus_areas_campus_area_slug_unique" ON "campus_areas"("campus_area_slug");

-- CreateIndex
CREATE UNIQUE INDEX "chart_of_accounts_account_code_unique" ON "chart_of_accounts"("account_code");

-- CreateIndex
CREATE INDEX "chat_rooms_last_message_at_idx" ON "chat_rooms"("last_message_at");

-- CreateIndex
CREATE INDEX "chat_rooms_owner_id_idx" ON "chat_rooms"("owner_id");

-- CreateIndex
CREATE INDEX "chat_rooms_property_id_idx" ON "chat_rooms"("property_id");

-- CreateIndex
CREATE INDEX "chat_rooms_tenant_id_idx" ON "chat_rooms"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_rooms_tenant_owner_unique" ON "chat_rooms"("tenant_id", "owner_id");

-- CreateIndex
CREATE INDEX "idx_experiment_assignments_experiment" ON "experiment_assignments"("experiment_id");

-- CreateIndex
CREATE INDEX "idx_experiment_assignments_user" ON "experiment_assignments"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "experiment_assignments_user_experiment_unique" ON "experiment_assignments"("user_id", "experiment_id");

-- CreateIndex
CREATE INDEX "idx_experiments_status" ON "experiments"("status");

-- CreateIndex
CREATE INDEX "favorites_property_id_idx" ON "favorites"("property_id");

-- CreateIndex
CREATE INDEX "favorites_user_id_idx" ON "favorites"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_property_unique" ON "favorites"("user_id", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_idx" ON "feature_flags"("key");

-- CreateIndex
CREATE INDEX "feedbacks_category_idx" ON "feedbacks"("category");

-- CreateIndex
CREATE INDEX "feedbacks_status_idx" ON "feedbacks"("status");

-- CreateIndex
CREATE INDEX "feedbacks_user_id_idx" ON "feedbacks"("user_id");

-- CreateIndex
CREATE INDEX "general_ledger_created_by_idx" ON "general_ledger"("created_by");

-- CreateIndex
CREATE INDEX "group_booking_members_group_booking_id_idx" ON "group_booking_members"("group_booking_id");

-- CreateIndex
CREATE INDEX "group_booking_members_status_idx" ON "group_booking_members"("status");

-- CreateIndex
CREATE UNIQUE INDEX "group_booking_members_group_booking_id_user_id_unique" ON "group_booking_members"("group_booking_id", "user_id");

-- CreateIndex
CREATE INDEX "group_bookings_created_at_idx" ON "group_bookings"("created_at");

-- CreateIndex
CREATE INDEX "group_bookings_lead_user_id_idx" ON "group_bookings"("lead_user_id");

-- CreateIndex
CREATE INDEX "group_bookings_property_id_idx" ON "group_bookings"("property_id");

-- CreateIndex
CREATE INDEX "group_bookings_status_idx" ON "group_bookings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_verifications_didit_session_id_unique" ON "kyc_verifications"("didit_session_id");

-- CreateIndex
CREATE INDEX "kyc_verifications_didit_session_id_idx" ON "kyc_verifications"("didit_session_id");

-- CreateIndex
CREATE INDEX "kyc_verifications_status_idx" ON "kyc_verifications"("status");

-- CreateIndex
CREATE INDEX "kyc_verifications_user_id_idx" ON "kyc_verifications"("user_id");

-- CreateIndex
CREATE INDEX "loyalty_transactions_expires_at_idx" ON "loyalty_transactions"("expires_at");

-- CreateIndex
CREATE INDEX "loyalty_transactions_type_idx" ON "loyalty_transactions"("type");

-- CreateIndex
CREATE INDEX "loyalty_transactions_user_id_idx" ON "loyalty_transactions"("user_id");

-- CreateIndex
CREATE INDEX "maintenance_reports_property_id_idx" ON "maintenance_reports"("property_id");

-- CreateIndex
CREATE INDEX "maintenance_reports_status_idx" ON "maintenance_reports"("status");

-- CreateIndex
CREATE INDEX "maintenance_reports_tenant_id_idx" ON "maintenance_reports"("tenant_id");

-- CreateIndex
CREATE INDEX "maintenance_tickets_priority_idx" ON "maintenance_tickets"("priority");

-- CreateIndex
CREATE INDEX "maintenance_tickets_status_idx" ON "maintenance_tickets"("status");

-- CreateIndex
CREATE INDEX "maintenance_tickets_tenant_id_idx" ON "maintenance_tickets"("tenant_id");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- CreateIndex
CREATE INDEX "messages_room_id_idx" ON "messages"("room_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "idx_nearby_places_property" ON "nearby_places"("property_id");

-- CreateIndex
CREATE INDEX "idx_nearby_places_type" ON "nearby_places"("type");

-- CreateIndex
CREATE INDEX "notification_settings_created_at_idx" ON "notification_settings"("created_at");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "owner_bank_accounts_account_type_idx" ON "owner_bank_accounts"("account_type");

-- CreateIndex
CREATE INDEX "owner_bank_accounts_owner_id_idx" ON "owner_bank_accounts"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateway_credentials_gateway_id_unique" ON "payment_gateway_credentials"("gateway_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_invoice_number_unique" ON "payment_transactions"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_id_unique" ON "payments"("transaction_id");

-- CreateIndex
CREATE INDEX "payments_booking_id_idx" ON "payments"("booking_id");

-- CreateIndex
CREATE INDEX "payments_property_id_idx" ON "payments"("property_id");

-- CreateIndex
CREATE INDEX "payments_property_status_paidat_idx" ON "payments"("property_id", "status", "paid_at");

-- CreateIndex
CREATE INDEX "payments_provider_idx" ON "payments"("provider");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "platform_settings_key_key" ON "platform_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "popular_areas_popular_area_slug_unique" ON "popular_areas"("popular_area_slug");

-- CreateIndex
CREATE UNIQUE INDEX "properties_ical_export_token_unique" ON "properties"("ical_export_token");

-- CreateIndex
CREATE INDEX "idx_properties_city_active" ON "properties"("city", "is_active");

-- CreateIndex
CREATE INDEX "idx_properties_coords" ON "properties"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "properties_amenities_gin_idx" ON "properties" USING GIN ("amenities");

-- CreateIndex
CREATE INDEX "properties_city_idx" ON "properties"("city");

-- CreateIndex
CREATE INDEX "properties_is_active_idx" ON "properties"("is_active");

-- CreateIndex
CREATE INDEX "properties_metadata_gin_idx" ON "properties" USING GIN ("metadata");

-- CreateIndex
CREATE INDEX "properties_owner_active_created_idx" ON "properties"("owner_id", "is_active", "created_at");

-- CreateIndex
CREATE INDEX "properties_owner_id_idx" ON "properties"("owner_id");

-- CreateIndex
CREATE INDEX "properties_province_idx" ON "properties"("province");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "properties"("status");

-- CreateIndex
CREATE INDEX "properties_type_idx" ON "properties"("type");

-- CreateIndex
CREATE INDEX "idx_property_ads_active" ON "property_ads"("is_active");

-- CreateIndex
CREATE INDEX "idx_property_ads_dates" ON "property_ads"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "idx_property_ads_package_id" ON "property_ads"("package_id");

-- CreateIndex
CREATE INDEX "idx_property_ads_paid_at" ON "property_ads"("paid_at");

-- CreateIndex
CREATE INDEX "idx_property_ads_payment_status" ON "property_ads"("payment_status");

-- CreateIndex
CREATE INDEX "idx_property_ads_position" ON "property_ads"("position");

-- CreateIndex
CREATE UNIQUE INDEX "property_ratings_property_id_unique" ON "property_ratings"("property_id");

-- CreateIndex
CREATE INDEX "idx_property_rules_property" ON "property_rules"("property_id");

-- CreateIndex
CREATE INDEX "idx_property_similarities_property" ON "property_similarities"("property_id");

-- CreateIndex
CREATE INDEX "idx_property_similarities_similar" ON "property_similarities"("similar_property_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_similarities_pair_unique" ON "property_similarities"("property_id", "similar_property_id");

-- CreateIndex
CREATE INDEX "property_tags_property_id_idx" ON "property_tags"("property_id");

-- CreateIndex
CREATE INDEX "property_tags_tag_id_idx" ON "property_tags"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_tags_pk" ON "property_tags"("property_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_idx" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_code_idx" ON "referrals"("code");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_voucher_code_idx" ON "referrals"("voucher_code");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_payout_idempotency_key_idx" ON "referrals"("payout_idempotency_key");

-- CreateIndex
CREATE INDEX "referrals_referee_id_idx" ON "referrals"("referee_id");

-- CreateIndex
CREATE INDEX "referrals_referrer_id_idx" ON "referrals"("referrer_id");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referrer_referee_category_unique" ON "referrals"("referrer_id", "referee_id", "category");

-- CreateIndex
CREATE INDEX "refund_requests_booking_id_idx" ON "refund_requests"("booking_id");

-- CreateIndex
CREATE INDEX "refund_requests_payment_id_idx" ON "refund_requests"("payment_id");

-- CreateIndex
CREATE INDEX "refund_requests_status_idx" ON "refund_requests"("status");

-- CreateIndex
CREATE INDEX "refund_requests_user_id_idx" ON "refund_requests"("user_id");

-- CreateIndex
CREATE INDEX "review_replies_review_id_idx" ON "review_replies"("review_id");

-- CreateIndex
CREATE INDEX "review_replies_user_id_idx" ON "review_replies"("user_id");

-- CreateIndex
CREATE INDEX "reviews_booking_id_idx" ON "reviews"("booking_id");

-- CreateIndex
CREATE INDEX "reviews_created_by_id_idx" ON "reviews"("created_by_id");

-- CreateIndex
CREATE INDEX "reviews_property_id_idx" ON "reviews"("property_id");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "reviews_reviewed_user_id_idx" ON "reviews"("reviewed_user_id");

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- CreateIndex
CREATE INDEX "reviews_type_idx" ON "reviews"("type");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_property_user_unique" ON "reviews"("property_id", "created_by_id");

-- CreateIndex
CREATE INDEX "reward_redemptions_status_idx" ON "reward_redemptions"("status");

-- CreateIndex
CREATE INDEX "reward_redemptions_user_id_idx" ON "reward_redemptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "reward_redemptions_user_reward_unique" ON "reward_redemptions"("user_id", "reward_id");

-- CreateIndex
CREATE INDEX "idx_room_facilities_category" ON "room_facilities"("room_facility_category");

-- CreateIndex
CREATE INDEX "idx_room_facilities_unit" ON "room_facilities"("room_facility_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_facilities_unit_category_name_unique" ON "room_facilities"("room_facility_unit_id", "room_facility_category", "room_facility_name");

-- CreateIndex
CREATE UNIQUE INDEX "roommate_preferences_user_id_unique" ON "roommate_preferences"("user_id");

-- CreateIndex
CREATE INDEX "saved_searches_active_idx" ON "saved_searches"("is_active");

-- CreateIndex
CREATE INDEX "saved_searches_user_id_idx" ON "saved_searches"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_unique" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_unique" ON "tags"("name");

-- CreateIndex
CREATE INDEX "two_factor_secret_idx" ON "twoFactor"("secret");

-- CreateIndex
CREATE INDEX "two_factor_user_id_idx" ON "twoFactor"("user_id");

-- CreateIndex
CREATE INDEX "unit_pricing_tiers_unit_id_idx" ON "unit_pricing_tiers"("unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "units_current_booking_id_key" ON "units"("current_booking_id");

-- CreateIndex
CREATE INDEX "units_property_id_idx" ON "units"("property_id");

-- CreateIndex
CREATE INDEX "units_property_status_created_idx" ON "units"("property_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "units_status_idx" ON "units"("status");

-- CreateIndex
CREATE UNIQUE INDEX "units_property_id_name_unique" ON "units"("property_id", "name");

-- CreateIndex
CREATE INDEX "user_contracts_booking_id_idx" ON "user_contracts"("booking_id");

-- CreateIndex
CREATE INDEX "user_contracts_property_id_idx" ON "user_contracts"("property_id");

-- CreateIndex
CREATE INDEX "user_contracts_user_id_idx" ON "user_contracts"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_interest_vectors_user" ON "user_interest_vectors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_preferences_user_id_idx" ON "user_notification_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_unique" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_unique" ON "users"("referral_code");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");

-- CreateIndex
CREATE INDEX "webhook_events_payload_hash_idx" ON "webhook_events"("payload_hash");

-- CreateIndex
CREATE INDEX "webhook_events_provider_idx" ON "webhook_events"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_provider_event_id_unique" ON "webhook_events"("provider", "event_id");

-- CreateIndex
CREATE INDEX "wishlists_property_id_idx" ON "wishlists"("property_id");

-- CreateIndex
CREATE INDEX "wishlists_user_id_idx" ON "wishlists"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_user_property_unique" ON "wishlists"("user_id", "property_id");

-- CreateIndex
CREATE INDEX "withdrawals_bank_account_id_idx" ON "withdrawals"("bank_account_id");

-- CreateIndex
CREATE INDEX "withdrawals_owner_id_idx" ON "withdrawals"("owner_id");

-- CreateIndex
CREATE INDEX "withdrawals_status_idx" ON "withdrawals"("status");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "balance_logs" ADD CONSTRAINT "balance_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_tenant_id_users_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booking_request_id_booking_requests_id_fk" FOREIGN KEY ("booking_request_id") REFERENCES "booking_requests"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_group_booking_id_group_bookings_id_fk" FOREIGN KEY ("group_booking_id") REFERENCES "group_bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_pricing_rule_id_seasonal_pricing_rules_id_fk" FOREIGN KEY ("pricing_rule_id") REFERENCES "seasonal_pricing_rules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_parent_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("parent_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_tenant_id_users_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "damage_reports" ADD CONSTRAINT "damage_reports_inspection_id_inspections_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "damage_reports" ADD CONSTRAINT "damage_reports_item_id_inspection_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "inspection_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "damage_reports" ADD CONSTRAINT "damage_reports_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "damage_reports" ADD CONSTRAINT "damage_reports_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "experiment_assignments" ADD CONSTRAINT "experiment_assignments_experiment_id_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "experiments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "experiment_assignments" ADD CONSTRAINT "experiment_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "general_ledger" ADD CONSTRAINT "general_ledger_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_booking_members" ADD CONSTRAINT "group_booking_members_group_booking_id_group_bookings_id_fk" FOREIGN KEY ("group_booking_id") REFERENCES "group_bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_booking_members" ADD CONSTRAINT "group_booking_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_bookings" ADD CONSTRAINT "group_bookings_lead_user_id_users_id_fk" FOREIGN KEY ("lead_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_bookings" ADD CONSTRAINT "group_bookings_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_bookings" ADD CONSTRAINT "group_bookings_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspection_items" ADD CONSTRAINT "inspection_items_inspection_id_inspections_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspection_photos" ADD CONSTRAINT "inspection_photos_inspection_id_inspections_id_fk" FOREIGN KEY ("inspection_id") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspection_photos" ADD CONSTRAINT "inspection_photos_item_id_inspection_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "inspection_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_witness_id_users_id_fk" FOREIGN KEY ("witness_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kyc_verifications" ADD CONSTRAINT "kyc_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "maintenance_reports" ADD CONSTRAINT "maintenance_reports_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "maintenance_reports" ADD CONSTRAINT "maintenance_reports_tenant_id_users_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "maintenance_reports" ADD CONSTRAINT "maintenance_reports_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_tenant_id_users_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_room_id_chat_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "nearby_places" ADD CONSTRAINT "nearby_places_nearby_place_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "neighborhood_insights" ADD CONSTRAINT "neighborhood_insights_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "neighborhood_insights" ADD CONSTRAINT "neighborhood_insights_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "neighborhood_places" ADD CONSTRAINT "neighborhood_places_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "owner_bank_accounts" ADD CONSTRAINT "owner_bank_accounts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment_gateway_credentials" ADD CONSTRAINT "payment_gateway_credentials_gateway_id_payment_gateway_configs_" FOREIGN KEY ("gateway_id") REFERENCES "payment_gateway_configs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pricing_analytics" ADD CONSTRAINT "pricing_analytics_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pricing_suggestions" ADD CONSTRAINT "pricing_suggestions_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pricing_suggestions" ADD CONSTRAINT "pricing_suggestions_rule_id_seasonal_pricing_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "seasonal_pricing_rules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "property_ads" ADD CONSTRAINT "property_ads_package_id_ad_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "ad_packages"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "property_ads" ADD CONSTRAINT "property_ads_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "property_comparisons" ADD CONSTRAINT "property_comparisons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "property_ratings" ADD CONSTRAINT "property_ratings_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "property_rules" ADD CONSTRAINT "property_rules_property_rule_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "property_similarities" ADD CONSTRAINT "property_similarities_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "property_similarities" ADD CONSTRAINT "property_similarities_similar_property_id_properties_id_fk" FOREIGN KEY ("similar_property_id") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "property_tags" ADD CONSTRAINT "property_tags_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "property_tags" ADD CONSTRAINT "property_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referee_id_users_id_fk" FOREIGN KEY ("referee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referee_transaction_id_payments_id_fk" FOREIGN KEY ("referee_transaction_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewed_user_id_users_id_fk" FOREIGN KEY ("reviewed_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_reward_id_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "rewards"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_facilities" ADD CONSTRAINT "room_facilities_room_facility_unit_id_units_id_fk" FOREIGN KEY ("room_facility_unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "roommate_preferences" ADD CONSTRAINT "roommate_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seasonal_pricing_rules" ADD CONSTRAINT "seasonal_pricing_rules_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seasonal_pricing_rules" ADD CONSTRAINT "seasonal_pricing_rules_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "twoFactor" ADD CONSTRAINT "twoFactor_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_pricing_tiers" ADD CONSTRAINT "unit_pricing_tiers_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_current_booking_id_bookings_id_fk" FOREIGN KEY ("current_booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_contracts" ADD CONSTRAINT "user_contracts_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_contracts" ADD CONSTRAINT "user_contracts_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_contracts" ADD CONSTRAINT "user_contracts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_interest_vectors" ADD CONSTRAINT "user_interest_vectors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_bank_account_id_owner_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "owner_bank_accounts"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
