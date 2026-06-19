-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gstNumber" TEXT NOT NULL,
    "firmName" TEXT NOT NULL,
    "proprietorName" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "whatsappNumber" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "exactAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "rejectionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Buyer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "whatsappNumber" TEXT NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockedAt" DATETIME,
    "blockReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "count" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "availability" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "packaging" TEXT,
    "csp" TEXT,
    "otherDetails" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DropdownOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fieldType" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "addedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BlockedNumber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "whatsappNumber" TEXT NOT NULL,
    "reason" TEXT,
    "blockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BuyerReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerWhatsapp" TEXT NOT NULL,
    "buyerEmail" TEXT,
    "sellerId" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BuyerReport_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Seller_gstNumber_key" ON "Seller"("gstNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_email_key" ON "Seller"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_whatsappNumber_key" ON "Seller"("whatsappNumber");

-- CreateIndex
CREATE INDEX "Seller_status_idx" ON "Seller"("status");

-- CreateIndex
CREATE INDEX "Seller_state_district_city_idx" ON "Seller"("state", "district", "city");

-- CreateIndex
CREATE UNIQUE INDEX "Buyer_email_key" ON "Buyer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Buyer_whatsappNumber_key" ON "Buyer"("whatsappNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Listing_availability_idx" ON "Listing"("availability");

-- CreateIndex
CREATE INDEX "Listing_sellerId_idx" ON "Listing"("sellerId");

-- CreateIndex
CREATE INDEX "Listing_count_type_category_idx" ON "Listing"("count", "type", "category");

-- CreateIndex
CREATE UNIQUE INDEX "DropdownOption_fieldType_value_key" ON "DropdownOption"("fieldType", "value");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedNumber_whatsappNumber_key" ON "BlockedNumber"("whatsappNumber");

-- CreateIndex
CREATE INDEX "BuyerReport_buyerWhatsapp_idx" ON "BuyerReport"("buyerWhatsapp");

-- CreateIndex
CREATE INDEX "BuyerReport_status_idx" ON "BuyerReport"("status");
