import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { appScreenshots, contentSections, links, mediaAssets, services, siteSettings, supportedCompanies } from "../../drizzle/schema";
import { getAdminSiteData, getDb, getPublicSiteData } from "../db";
import { storagePut } from "../storage";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

const urlField = z.string().max(2048);
const settingsInput = z.object({
  platformName: z.string().min(2).max(120), siteTitle: z.string().min(2).max(180), heroTitle: z.string().min(2), heroDescription: z.string().min(2),
  aboutTitle: z.string().min(2).max(180), aboutDescription: z.string().min(2), mission: z.string().min(2), values: z.string().min(2),
  phone: z.string().min(4).max(48), email: z.string().email(), logoUrl: z.string().nullable(), heroImageUrl: z.string().nullable(),
});
const sectionInput = z.object({ sectionKey: z.string().min(2).max(80), page: z.enum(["home", "services", "about", "download", "contact"]), label: z.string().max(120).nullable(), title: z.string().min(2), subtitle: z.string().nullable(), body: z.string().nullable(), imageUrl: z.string().nullable(), isEnabled: z.boolean(), sortOrder: z.number().int() });
const serviceInput = z.object({ category: z.enum(["telecom", "payments", "games"]), title: z.string().min(2).max(140), description: z.string().min(2), icon: z.string().min(2).max(64), isActive: z.boolean(), sortOrder: z.number().int() });
const companyInput = z.object({ name: z.string().min(2).max(120), description: z.string().max(220).nullable(), logoUrl: z.string().nullable(), isActive: z.boolean(), sortOrder: z.number().int() });
const linkInput = z.object({ linkKey: z.string().min(2).max(80), label: z.string().min(2).max(120), url: urlField, linkType: z.enum(["app", "social", "cta"]), icon: z.string().max(64).nullable(), isActive: z.boolean(), sortOrder: z.number().int() });
const screenshotInput = z.object({ imageUrl: urlField, altText: z.string().min(2).max(255), isActive: z.boolean(), sortOrder: z.number().int() });

async function requireDb() { const db = await getDb(); if (!db) throw new Error("قاعدة البيانات غير متاحة حاليًا."); return db; }

function normalizeLegacyMediaUrl(value: string | null | undefined) {
  if (!value || !value.startsWith("/manus-storage/")) return value ?? null;
  if (value.includes("promo-dark")) return "/media/diaa-app-promo-dark.jpg";
  if (value.includes("promo-light")) return "/media/diaa-app-promo-light.jpg";
  if (value.includes("diaa-logo")) return "/media/diaa-logo.jpg";
  return "/media/diaa-app-icon.jpg";
}

function normalizeSiteData<T extends Record<string, any> | null>(data: T): T {
  if (!data) return data;
  return {
    ...data,
    settings: data.settings ? { ...data.settings, logoUrl: normalizeLegacyMediaUrl(data.settings.logoUrl), heroImageUrl: normalizeLegacyMediaUrl(data.settings.heroImageUrl) } : data.settings,
    sections: data.sections?.map((section: any) => ({ ...section, imageUrl: normalizeLegacyMediaUrl(section.imageUrl) })),
    companies: data.companies?.map((company: any) => ({ ...company, logoUrl: normalizeLegacyMediaUrl(company.logoUrl) })),
    media: data.media?.map((asset: any) => ({ ...asset, url: normalizeLegacyMediaUrl(asset.url) })),
    screenshots: data.screenshots?.map((screenshot: any) => ({ ...screenshot, imageUrl: normalizeLegacyMediaUrl(screenshot.imageUrl) })),
  } as T;
}

export const siteRouter = router({
  publicData: publicProcedure.query(async () => normalizeSiteData(await getPublicSiteData())),
  admin: router({
    data: adminProcedure.query(async () => normalizeSiteData(await getAdminSiteData())),
    updateSettings: adminProcedure.input(settingsInput).mutation(async ({ input }) => {
      const db = await requireDb(); const values = { ...input, logoUrl: normalizeLegacyMediaUrl(input.logoUrl), heroImageUrl: normalizeLegacyMediaUrl(input.heroImageUrl) };
      await db.insert(siteSettings).values({ settingKey: "primary", ...values }).onDuplicateKeyUpdate({ set: values });
      return { success: true };
    }),
    upsertSection: adminProcedure.input(sectionInput.extend({ id: z.number().int().optional() })).mutation(async ({ input }) => {
      const db = await requireDb(); const { id, ...rawValues } = input; const values = { ...rawValues, imageUrl: normalizeLegacyMediaUrl(rawValues.imageUrl) };
      if (id) await db.update(contentSections).set(values).where(eq(contentSections.id, id)); else await db.insert(contentSections).values(values);
      return { success: true };
    }),
    deleteSection: adminProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ input }) => { const db = await requireDb(); await db.delete(contentSections).where(eq(contentSections.id, input.id)); return { success: true }; }),
    upsertService: adminProcedure.input(serviceInput.extend({ id: z.number().int().optional() })).mutation(async ({ input }) => {
      const db = await requireDb(); const { id, ...values } = input;
      if (id) await db.update(services).set(values).where(eq(services.id, id)); else await db.insert(services).values(values);
      return { success: true };
    }),
    deleteService: adminProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ input }) => { const db = await requireDb(); await db.delete(services).where(eq(services.id, input.id)); return { success: true }; }),
    upsertCompany: adminProcedure.input(companyInput.extend({ id: z.number().int().optional() })).mutation(async ({ input }) => {
      const db = await requireDb(); const { id, ...rawValues } = input; const values = { ...rawValues, logoUrl: normalizeLegacyMediaUrl(rawValues.logoUrl) };
      if (id) await db.update(supportedCompanies).set(values).where(eq(supportedCompanies.id, id)); else await db.insert(supportedCompanies).values(values);
      return { success: true };
    }),
    deleteCompany: adminProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ input }) => { const db = await requireDb(); await db.delete(supportedCompanies).where(eq(supportedCompanies.id, input.id)); return { success: true }; }),
    upsertLink: adminProcedure.input(linkInput.extend({ id: z.number().int().optional() })).mutation(async ({ input }) => {
      const db = await requireDb(); const { id, ...values } = input;
      if (id) await db.update(links).set(values).where(eq(links.id, id)); else await db.insert(links).values(values);
      return { success: true };
    }),
    deleteLink: adminProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ input }) => { const db = await requireDb(); await db.delete(links).where(eq(links.id, input.id)); return { success: true }; }),
    upsertScreenshot: adminProcedure.input(screenshotInput.extend({ id: z.number().int().optional() })).mutation(async ({ input }) => {
      const db = await requireDb(); const { id, ...rawValues } = input; const values = { ...rawValues, imageUrl: normalizeLegacyMediaUrl(rawValues.imageUrl) as string };
      if (id) await db.update(appScreenshots).set(values).where(eq(appScreenshots.id, id)); else await db.insert(appScreenshots).values(values);
      return { success: true };
    }),
    deleteScreenshot: adminProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ input }) => { const db = await requireDb(); await db.delete(appScreenshots).where(eq(appScreenshots.id, input.id)); return { success: true }; }),
    uploadMedia: adminProcedure.input(z.object({ name: z.string().min(1).max(255), mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp|gif)$/), dataUrl: z.string().max(7_000_000), altText: z.string().max(255).nullable() })).mutation(async ({ input, ctx }) => {
      const db = await requireDb(); const matched = input.dataUrl.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
      if (!matched) throw new Error("صيغة الصورة غير صالحة.");
      const bytes = Buffer.from(matched[2], "base64");
      if (bytes.length > 5 * 1024 * 1024) throw new Error("حجم الصورة يتجاوز الحد المسموح وهو 5 ميغابايت.");
      const extension = input.mimeType.split("/")[1] === "jpeg" ? "jpg" : input.mimeType.split("/")[1];
      const storageKey = `diaa-mobile/${Date.now()}-${input.name.replace(/[^a-zA-Z0-9._-]/g, "-")}.${extension}`;
      const stored = await storagePut(storageKey, bytes, input.mimeType);
      const [asset] = await db.insert(mediaAssets).values({ name: input.name, storageKey: stored.key, url: stored.url, mimeType: input.mimeType, altText: input.altText, createdBy: ctx.user.id }).$returningId();
      return { success: true, id: asset.id, url: stored.url };
    }),
  }),
});
