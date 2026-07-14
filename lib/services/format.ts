export function formatPriceCents(priceCents: number | null | undefined): string {
  if (priceCents == null) {
    return "—";
  }
  return (priceCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDurationMinutes(
  durationMinutes: number | null | undefined,
): string {
  if (durationMinutes == null) {
    return "—";
  }
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return `${hours}h ${minutes}min`;
}

export function parsePriceBRLToCents(raw: string): number | null | "invalid" {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) {
    return "invalid";
  }
  return Math.round(value * 100);
}

export function parseDurationToMinutes(
  hoursRaw: string,
  minutesRaw: string,
): number | null | "invalid" {
  const hoursEmpty = hoursRaw.trim() === "";
  const minutesEmpty = minutesRaw.trim() === "";
  if (hoursEmpty && minutesEmpty) {
    return null;
  }
  const hours = hoursEmpty ? 0 : Number(hoursRaw);
  const minutes = minutesEmpty ? 0 : Number(minutesRaw);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return "invalid";
  }
  return hours * 60 + minutes;
}

export function splitDurationMinutes(total: number | null | undefined): {
  hours: string;
  minutes: string;
} {
  if (total == null) {
    return { hours: "", minutes: "" };
  }
  return {
    hours: String(Math.floor(total / 60)),
    minutes: String(total % 60),
  };
}

export function centsToPriceInput(priceCents: number | null | undefined): string {
  if (priceCents == null) {
    return "";
  }
  return (priceCents / 100).toFixed(2).replace(".", ",");
}
