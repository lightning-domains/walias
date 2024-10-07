-- CreateTable
CREATE TABLE "User" (
    "pubkey" TEXT NOT NULL PRIMARY KEY,
    "relays" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Walias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "pubkey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Walias_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Walias_pubkey_fkey" FOREIGN KEY ("pubkey") REFERENCES "User" ("pubkey") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rootPrivateKey" TEXT NOT NULL,
    "adminPubkey" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "relays" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lastEventId" TEXT,
    "config" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "pubkey" TEXT NOT NULL,
    "waliasId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Wallet_pubkey_fkey" FOREIGN KEY ("pubkey") REFERENCES "User" ("pubkey") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Wallet_waliasId_fkey" FOREIGN KEY ("waliasId") REFERENCES "Walias" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pubkey" TEXT NOT NULL,
    "waliasId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_pubkey_key" ON "User"("pubkey");

-- CreateIndex
CREATE UNIQUE INDEX "Walias_id_key" ON "Walias"("id");

-- CreateIndex
CREATE INDEX "Walias_pubkey_idx" ON "Walias"("pubkey");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_id_key" ON "Domain"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_id_key" ON "Wallet"("id");

-- CreateIndex
CREATE INDEX "Wallet_pubkey_idx" ON "Wallet"("pubkey");

-- CreateIndex
CREATE INDEX "Wallet_waliasId_idx" ON "Wallet"("waliasId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_id_key" ON "Payment"("id");

-- CreateIndex
CREATE INDEX "Payment_pubkey_idx" ON "Payment"("pubkey");

-- CreateIndex
CREATE INDEX "Payment_waliasId_idx" ON "Payment"("waliasId");
