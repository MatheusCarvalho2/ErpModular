-- CreateTable
CREATE TABLE "PermissionGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "systemKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PermissionGroup_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "PermissionGrant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "permissionGroupId" TEXT NOT NULL,
    "permissionKey" TEXT NOT NULL,
    CONSTRAINT "PermissionGrant_permissionGroupId_fkey" FOREIGN KEY ("permissionGroupId") REFERENCES "PermissionGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PermissionGroup_companyId_idx" ON "PermissionGroup"("companyId");
CREATE UNIQUE INDEX "PermissionGroup_companyId_name_key" ON "PermissionGroup"("companyId", "name");
CREATE UNIQUE INDEX "PermissionGrant_permissionGroupId_permissionKey_key" ON "PermissionGrant"("permissionGroupId", "permissionKey");

-- Presets Admin + Operadores por empresa existente
INSERT INTO "PermissionGroup" ("id", "companyId", "name", "systemKey", "createdAt", "updatedAt")
SELECT lower(hex(randomblob(16))), c."id", 'Admin', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Company" c;

INSERT INTO "PermissionGroup" ("id", "companyId", "name", "systemKey", "createdAt", "updatedAt")
SELECT lower(hex(randomblob(16))), c."id", 'Operadores', 'OPERADORES', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Company" c;

-- Grants de negócio padrão em Operadores
INSERT INTO "PermissionGrant" ("id", "permissionGroupId", "permissionKey")
SELECT lower(hex(randomblob(16))), g."id", k."permissionKey"
FROM "PermissionGroup" g
CROSS JOIN (
  SELECT 'services:list' AS "permissionKey"
  UNION ALL SELECT 'services:create'
  UNION ALL SELECT 'services:update'
  UNION ALL SELECT 'services:setActive'
) k
WHERE g."systemKey" = 'OPERADORES';

-- Redefine Membership com permissionGroupId (migra role → grupo)
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Membership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "permissionGroupId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Membership_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Membership_permissionGroupId_fkey" FOREIGN KEY ("permissionGroupId") REFERENCES "PermissionGroup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Membership" ("id", "userId", "companyId", "permissionGroupId", "createdAt")
SELECT
  m."id",
  m."userId",
  m."companyId",
  CASE
    WHEN m."role" = 'ADMIN' THEN (
      SELECT g."id" FROM "PermissionGroup" g
      WHERE g."companyId" = m."companyId" AND g."systemKey" = 'ADMIN' LIMIT 1
    )
    ELSE (
      SELECT g."id" FROM "PermissionGroup" g
      WHERE g."companyId" = m."companyId" AND g."systemKey" = 'OPERADORES' LIMIT 1
    )
  END,
  m."createdAt"
FROM "Membership" m;

DROP TABLE "Membership";
ALTER TABLE "new_Membership" RENAME TO "Membership";
CREATE UNIQUE INDEX "Membership_userId_key" ON "Membership"("userId");
CREATE INDEX "Membership_companyId_idx" ON "Membership"("companyId");
CREATE INDEX "Membership_permissionGroupId_idx" ON "Membership"("permissionGroupId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
