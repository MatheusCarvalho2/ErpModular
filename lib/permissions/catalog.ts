export const SYSTEM_KEY_ADMIN = "ADMIN" as const;
export const SYSTEM_KEY_OPERADORES = "OPERADORES" as const;

export type SystemKey =
  | typeof SYSTEM_KEY_ADMIN
  | typeof SYSTEM_KEY_OPERADORES;

export const PERMISSION_KEYS = [
  "services:list",
  "services:create",
  "services:update",
  "services:setActive",
  "products:list",
  "products:create",
  "products:update",
  "products:setActive",
  "clients:list",
  "clients:create",
  "clients:update",
  "clients:setActive",
  "clientProducts:list",
  "clientProducts:create",
  "clientProducts:update",
  "clientProducts:setActive",
  "serviceOrders:list",
  "serviceOrders:create",
  "serviceOrders:update",
  "serviceOrders:correctLinks",
  "serviceOrders:editClosed",
  "serviceOrderStatuses:list",
  "serviceOrderStatuses:create",
  "serviceOrderStatuses:update",
  "serviceOrderStatuses:setActive",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export type PermissionResource = {
  resource: string;
  labelKey: string;
  actions: { key: PermissionKey; labelKey: string }[];
};

function crudActions(
  prefix:
    | "services"
    | "products"
    | "clients"
    | "clientProducts"
    | "serviceOrderStatuses",
): { key: PermissionKey; labelKey: string }[] {
  return [
    { key: `${prefix}:list`, labelKey: "permissionGroups.action.list" },
    { key: `${prefix}:create`, labelKey: "permissionGroups.action.create" },
    { key: `${prefix}:update`, labelKey: "permissionGroups.action.update" },
    {
      key: `${prefix}:setActive`,
      labelKey: "permissionGroups.action.setActive",
    },
  ];
}

export const PERMISSION_MATRIX: PermissionResource[] = [
  {
    resource: "services",
    labelKey: "permissionGroups.resource.services",
    actions: crudActions("services"),
  },
  {
    resource: "products",
    labelKey: "permissionGroups.resource.products",
    actions: crudActions("products"),
  },
  {
    resource: "clients",
    labelKey: "permissionGroups.resource.clients",
    actions: crudActions("clients"),
  },
  {
    resource: "clientProducts",
    labelKey: "permissionGroups.resource.clientProducts",
    actions: crudActions("clientProducts"),
  },
  {
    resource: "serviceOrders",
    labelKey: "permissionGroups.resource.serviceOrders",
    actions: [
      { key: "serviceOrders:list", labelKey: "permissionGroups.action.list" },
      { key: "serviceOrders:create", labelKey: "permissionGroups.action.create" },
      { key: "serviceOrders:update", labelKey: "permissionGroups.action.update" },
      {
        key: "serviceOrders:correctLinks",
        labelKey: "permissionGroups.action.correctLinks",
      },
      {
        key: "serviceOrders:editClosed",
        labelKey: "permissionGroups.action.editClosed",
      },
    ],
  },
  {
    resource: "serviceOrderStatuses",
    labelKey: "permissionGroups.resource.serviceOrderStatuses",
    actions: crudActions("serviceOrderStatuses"),
  },
];

export function businessPermissionKeys(): PermissionKey[] {
  return [...PERMISSION_KEYS];
}

export function operadoresPermissionKeys(): PermissionKey[] {
  return PERMISSION_KEYS.filter(
    (key) =>
      !key.startsWith("serviceOrderStatuses:") &&
      key !== "serviceOrders:correctLinks" &&
      key !== "serviceOrders:editClosed",
  );
}

export function isBusinessPermissionKey(key: string): key is PermissionKey {
  return (PERMISSION_KEYS as readonly string[]).includes(key);
}

export function filterBusinessKeys(keys: string[]): PermissionKey[] {
  return keys.filter(isBusinessPermissionKey);
}
