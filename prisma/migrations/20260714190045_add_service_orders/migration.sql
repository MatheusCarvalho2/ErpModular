-- CreateTable
CREATE TABLE "ServiceOrderStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameNormalized" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "isDefaultInitial" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceOrderStatus_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientProductId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "workDescription" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ServiceOrder_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServiceOrder_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ServiceOrder_clientProductId_fkey" FOREIGN KEY ("clientProductId") REFERENCES "ClientProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServiceOrder_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ServiceOrderStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PermissionGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "systemKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PermissionGroup_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PermissionGroup" ("companyId", "createdAt", "id", "name", "systemKey", "updatedAt") SELECT "companyId", "createdAt", "id", "name", "systemKey", "updatedAt" FROM "PermissionGroup";
DROP TABLE "PermissionGroup";
ALTER TABLE "new_PermissionGroup" RENAME TO "PermissionGroup";
CREATE INDEX "PermissionGroup_companyId_idx" ON "PermissionGroup"("companyId");
CREATE UNIQUE INDEX "PermissionGroup_companyId_name_key" ON "PermissionGroup"("companyId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ServiceOrderStatus_companyId_active_idx" ON "ServiceOrderStatus"("companyId", "active");

-- CreateIndex
CREATE INDEX "ServiceOrderStatus_companyId_sortOrder_idx" ON "ServiceOrderStatus"("companyId", "sortOrder");

-- CreateIndex
CREATE INDEX "ServiceOrder_companyId_statusId_idx" ON "ServiceOrder"("companyId", "statusId");

-- CreateIndex
CREATE INDEX "ServiceOrder_companyId_createdAt_idx" ON "ServiceOrder"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "ServiceOrder_serviceId_idx" ON "ServiceOrder"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceOrder_clientId_idx" ON "ServiceOrder"("clientId");

-- CreateIndex
CREATE INDEX "ServiceOrder_clientProductId_idx" ON "ServiceOrder"("clientProductId");
