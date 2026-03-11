-- CreateEnum
CREATE TYPE "feeding_type" AS ENUM ('BREASTFEEDING', 'FORMULA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "babies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "feeding_interval_minutes" INTEGER NOT NULL DEFAULT 180,
    "target_amount_ml" INTEGER NOT NULL DEFAULT 120,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "babies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "baby_users" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "baby_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'parent',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "baby_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedings" (
    "id" TEXT NOT NULL,
    "baby_id" TEXT NOT NULL,
    "recorded_by" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount_ml" INTEGER,
    "type" "feeding_type" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "baby_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "daily_time" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "baby_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "baby_users_user_id_baby_id_key" ON "baby_users"("user_id", "baby_id");

-- AddForeignKey
ALTER TABLE "baby_users" ADD CONSTRAINT "baby_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "baby_users" ADD CONSTRAINT "baby_users_baby_id_fkey" FOREIGN KEY ("baby_id") REFERENCES "babies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedings" ADD CONSTRAINT "feedings_baby_id_fkey" FOREIGN KEY ("baby_id") REFERENCES "babies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedings" ADD CONSTRAINT "feedings_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_baby_id_fkey" FOREIGN KEY ("baby_id") REFERENCES "babies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_baby_id_fkey" FOREIGN KEY ("baby_id") REFERENCES "babies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
