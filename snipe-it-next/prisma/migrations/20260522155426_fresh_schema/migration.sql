/*
  Warnings:

  - You are about to drop the column `adminId` on the `action_logs` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `action_logs` table. All the data in the column will be lost.
  - You are about to drop the column `itemType` on the `action_logs` table. All the data in the column will be lost.
  - You are about to drop the column `targetId` on the `action_logs` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `action_logs` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `action_logs` table. All the data in the column will be lost.
  - You are about to drop the column `assignedToId` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `assignedType` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `byod` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `expectedCheckin` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `lastCheckin` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `lastCheckout` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `modelId` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `orderNumber` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `requestable` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `rtdLocationId` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `supplierId` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `warrantyMonths` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `categoryType` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `checkinEmail` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `eulaText` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `requireAcceptance` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `useDefaultEula` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `address2` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `fax` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `ldapOu` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `managerId` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `tagColor` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `adminCc` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `alertEmail` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `alertQty` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `brandingType` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `dashChartType` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `dashboardMessage` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `dateDisplayFormat` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `defaultLocale` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `defaultTimezone` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `favicon` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `fullMultipleCompaniesSupport` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `headerColor` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `loginNote` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `perPage` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `timeDisplayFormat` on the `settings` table. All the data in the column will be lost.
  - You are about to drop the column `archived` on the `status_labels` table. All the data in the column will be lost.
  - You are about to drop the column `deployable` on the `status_labels` table. All the data in the column will be lost.
  - You are about to drop the column `pending` on the `status_labels` table. All the data in the column will be lost.
  - You are about to drop the column `showInNav` on the `status_labels` table. All the data in the column will be lost.
  - You are about to drop the column `statusType` on the `status_labels` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `employeeNum` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isSuperAdmin` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `locale` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `managerId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `mobile` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `accessories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `accessory_checkouts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `asset_models` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `companies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `components` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `consumable_checkouts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `consumables` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `departments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `depreciations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `license_seats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `licenses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `maintenances` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `manufacturers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `suppliers` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `name` on table `assets` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('LOGISTIQUE', 'MAGASINIER', 'LABORATOIRE');

-- DropForeignKey
ALTER TABLE "accessories" DROP CONSTRAINT "accessories_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "accessories" DROP CONSTRAINT "accessories_companyId_fkey";

-- DropForeignKey
ALTER TABLE "accessories" DROP CONSTRAINT "accessories_locationId_fkey";

-- DropForeignKey
ALTER TABLE "accessories" DROP CONSTRAINT "accessories_manufacturerId_fkey";

-- DropForeignKey
ALTER TABLE "accessories" DROP CONSTRAINT "accessories_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "accessory_checkouts" DROP CONSTRAINT "accessory_checkouts_accessoryId_fkey";

-- DropForeignKey
ALTER TABLE "accessory_checkouts" DROP CONSTRAINT "accessory_checkouts_userId_fkey";

-- DropForeignKey
ALTER TABLE "action_logs" DROP CONSTRAINT "action_logs_adminId_fkey";

-- DropForeignKey
ALTER TABLE "action_logs" DROP CONSTRAINT "action_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "asset_models" DROP CONSTRAINT "asset_models_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "asset_models" DROP CONSTRAINT "asset_models_depreciationId_fkey";

-- DropForeignKey
ALTER TABLE "asset_models" DROP CONSTRAINT "asset_models_manufacturerId_fkey";

-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_companyId_fkey";

-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_modelId_fkey";

-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_rtdLocationId_fkey";

-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "components" DROP CONSTRAINT "components_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "components" DROP CONSTRAINT "components_companyId_fkey";

-- DropForeignKey
ALTER TABLE "components" DROP CONSTRAINT "components_locationId_fkey";

-- DropForeignKey
ALTER TABLE "components" DROP CONSTRAINT "components_manufacturerId_fkey";

-- DropForeignKey
ALTER TABLE "components" DROP CONSTRAINT "components_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "consumable_checkouts" DROP CONSTRAINT "consumable_checkouts_consumableId_fkey";

-- DropForeignKey
ALTER TABLE "consumable_checkouts" DROP CONSTRAINT "consumable_checkouts_userId_fkey";

-- DropForeignKey
ALTER TABLE "consumables" DROP CONSTRAINT "consumables_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "consumables" DROP CONSTRAINT "consumables_companyId_fkey";

-- DropForeignKey
ALTER TABLE "consumables" DROP CONSTRAINT "consumables_locationId_fkey";

-- DropForeignKey
ALTER TABLE "consumables" DROP CONSTRAINT "consumables_manufacturerId_fkey";

-- DropForeignKey
ALTER TABLE "consumables" DROP CONSTRAINT "consumables_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_companyId_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_locationId_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_managerId_fkey";

-- DropForeignKey
ALTER TABLE "license_seats" DROP CONSTRAINT "license_seats_licenseId_fkey";

-- DropForeignKey
ALTER TABLE "license_seats" DROP CONSTRAINT "license_seats_userId_fkey";

-- DropForeignKey
ALTER TABLE "licenses" DROP CONSTRAINT "licenses_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "licenses" DROP CONSTRAINT "licenses_companyId_fkey";

-- DropForeignKey
ALTER TABLE "licenses" DROP CONSTRAINT "licenses_manufacturerId_fkey";

-- DropForeignKey
ALTER TABLE "licenses" DROP CONSTRAINT "licenses_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "locations" DROP CONSTRAINT "locations_companyId_fkey";

-- DropForeignKey
ALTER TABLE "locations" DROP CONSTRAINT "locations_managerId_fkey";

-- DropForeignKey
ALTER TABLE "maintenances" DROP CONSTRAINT "maintenances_assetId_fkey";

-- DropForeignKey
ALTER TABLE "maintenances" DROP CONSTRAINT "maintenances_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_companyId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_locationId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_managerId_fkey";

-- AlterTable
ALTER TABLE "action_logs" DROP COLUMN "adminId",
DROP COLUMN "itemId",
DROP COLUMN "itemType",
DROP COLUMN "targetId",
DROP COLUMN "targetType",
DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "assets" DROP COLUMN "assignedToId",
DROP COLUMN "assignedType",
DROP COLUMN "byod",
DROP COLUMN "companyId",
DROP COLUMN "expectedCheckin",
DROP COLUMN "image",
DROP COLUMN "lastCheckin",
DROP COLUMN "lastCheckout",
DROP COLUMN "modelId",
DROP COLUMN "orderNumber",
DROP COLUMN "requestable",
DROP COLUMN "rtdLocationId",
DROP COLUMN "supplierId",
DROP COLUMN "warrantyMonths",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "reference" TEXT,
ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "categoryType",
DROP COLUMN "checkinEmail",
DROP COLUMN "eulaText",
DROP COLUMN "image",
DROP COLUMN "requireAcceptance",
DROP COLUMN "useDefaultEula";

-- AlterTable
ALTER TABLE "locations" DROP COLUMN "address2",
DROP COLUMN "city",
DROP COLUMN "companyId",
DROP COLUMN "country",
DROP COLUMN "currency",
DROP COLUMN "fax",
DROP COLUMN "image",
DROP COLUMN "ldapOu",
DROP COLUMN "managerId",
DROP COLUMN "phone",
DROP COLUMN "state",
DROP COLUMN "tagColor",
DROP COLUMN "zip",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'LOCATION';

-- AlterTable
ALTER TABLE "settings" DROP COLUMN "adminCc",
DROP COLUMN "alertEmail",
DROP COLUMN "alertQty",
DROP COLUMN "brandingType",
DROP COLUMN "currency",
DROP COLUMN "dashChartType",
DROP COLUMN "dashboardMessage",
DROP COLUMN "dateDisplayFormat",
DROP COLUMN "defaultLocale",
DROP COLUMN "defaultTimezone",
DROP COLUMN "favicon",
DROP COLUMN "fullMultipleCompaniesSupport",
DROP COLUMN "headerColor",
DROP COLUMN "loginNote",
DROP COLUMN "logo",
DROP COLUMN "perPage",
DROP COLUMN "timeDisplayFormat",
ALTER COLUMN "siteName" SET DEFAULT 'GestActif';

-- AlterTable
ALTER TABLE "status_labels" DROP COLUMN "archived",
DROP COLUMN "deployable",
DROP COLUMN "pending",
DROP COLUMN "showInNav",
DROP COLUMN "statusType";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "address",
DROP COLUMN "avatar",
DROP COLUMN "city",
DROP COLUMN "companyId",
DROP COLUMN "country",
DROP COLUMN "departmentId",
DROP COLUMN "employeeNum",
DROP COLUMN "isSuperAdmin",
DROP COLUMN "locale",
DROP COLUMN "locationId",
DROP COLUMN "managerId",
DROP COLUMN "mobile",
DROP COLUMN "notes",
DROP COLUMN "state",
DROP COLUMN "zip",
ADD COLUMN     "laboratoireId" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'LOGISTIQUE';

-- DropTable
DROP TABLE "accessories";

-- DropTable
DROP TABLE "accessory_checkouts";

-- DropTable
DROP TABLE "asset_models";

-- DropTable
DROP TABLE "companies";

-- DropTable
DROP TABLE "components";

-- DropTable
DROP TABLE "consumable_checkouts";

-- DropTable
DROP TABLE "consumables";

-- DropTable
DROP TABLE "departments";

-- DropTable
DROP TABLE "depreciations";

-- DropTable
DROP TABLE "license_seats";

-- DropTable
DROP TABLE "licenses";

-- DropTable
DROP TABLE "maintenances";

-- DropTable
DROP TABLE "manufacturers";

-- DropTable
DROP TABLE "suppliers";

-- CreateTable
CREATE TABLE "equipment_requests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'ACHAT',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "urgency" TEXT NOT NULL DEFAULT 'NORMALE',
    "status" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "requesterId" TEXT NOT NULL,
    "laboratoireId" TEXT,
    "reviewerId" TEXT,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_movements" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "reference" TEXT,
    "note" TEXT,
    "assetId" TEXT NOT NULL,
    "fromLocationId" TEXT,
    "toLocationId" TEXT,
    "doneById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_movements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_laboratoireId_fkey" FOREIGN KEY ("laboratoireId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_requests" ADD CONSTRAINT "equipment_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_requests" ADD CONSTRAINT "equipment_requests_laboratoireId_fkey" FOREIGN KEY ("laboratoireId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_requests" ADD CONSTRAINT "equipment_requests_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_movements" ADD CONSTRAINT "equipment_movements_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_movements" ADD CONSTRAINT "equipment_movements_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_movements" ADD CONSTRAINT "equipment_movements_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_movements" ADD CONSTRAINT "equipment_movements_doneById_fkey" FOREIGN KEY ("doneById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
