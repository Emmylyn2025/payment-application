/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `plans` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reference]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `provider` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "plans" DROP CONSTRAINT "plans_createdBy_fkey";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "provider" TEXT NOT NULL,
ADD COLUMN     "reference" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "expiredAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "createdAt",
ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3),
ALTER COLUMN "expiredAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "plans" DROP COLUMN "createdBy";

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");
