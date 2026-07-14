import type { ServiceOrderStatusRole } from "@prisma/client";

export function canEditServiceOrder(
  role: ServiceOrderStatusRole,
  isAdmin: boolean,
  hasEditClosed: boolean,
) {
  return role === "OPERATIONAL" || isAdmin || hasEditClosed;
}

export function canCorrectServiceOrderLinks(
  role: ServiceOrderStatusRole,
  isAdmin: boolean,
  hasCorrectLinks: boolean,
  hasEditClosed: boolean,
) {
  return (
    (isAdmin || hasCorrectLinks) &&
    (role === "OPERATIONAL" || isAdmin || hasEditClosed)
  );
}
