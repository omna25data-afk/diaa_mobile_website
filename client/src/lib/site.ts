import { trpc } from "@/lib/trpc";

export function usePublicSite() {
  return trpc.site.publicData.useQuery(undefined, { staleTime: 60_000 });
}

export function findLink(data: any, key: string, fallback = "#") {
  return data?.links?.find((link: any) => link.linkKey === key)?.url || fallback;
}

export function normalizeMediaUrl(url?: string | null, fallback = "/media/diaa-app-icon.jpg") {
  if (!url) return fallback;
  if (!url.startsWith("/manus-storage/")) return url;
  if (url.includes("promo-dark")) return "/media/diaa-app-promo-dark.jpg";
  if (url.includes("promo-light")) return "/media/diaa-app-promo-light.jpg";
  if (url.includes("diaa-logo")) return "/media/diaa-logo.jpg";
  return "/media/diaa-app-icon.jpg";
}

export const categoryLabels = {
  telecom: "الاتصالات",
  payments: "السداد",
  games: "الألعاب الرقمية",
} as const;
