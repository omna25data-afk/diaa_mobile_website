import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  appScreenshots,
  contentSections,
  links,
  mediaAssets,
  services,
  siteSettings,
  supportedCompanies,
  type InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) _db = drizzle(process.env.DATABASE_URL);
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { ...user, lastSignedIn: user.lastSignedIn ?? new Date() };
  if (!values.role && user.openId === ENV.ownerOpenId) values.role = "admin";
  await db.insert(users).values(values).onDuplicateKeyUpdate({
    set: { name: values.name, email: values.email, loginMethod: values.loginMethod, lastSignedIn: values.lastSignedIn },
  });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getPublicSiteData() {
  const db = await getDb();
  if (!db) return null;
  const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, "primary")).limit(1);
  const [sections, serviceItems, companyItems, linkItems, screenshots] = await Promise.all([
    db.select().from(contentSections).where(eq(contentSections.isEnabled, true)).orderBy(asc(contentSections.sortOrder)),
    db.select().from(services).where(eq(services.isActive, true)).orderBy(asc(services.sortOrder)),
    db.select().from(supportedCompanies).where(eq(supportedCompanies.isActive, true)).orderBy(asc(supportedCompanies.sortOrder)),
    db.select().from(links).where(eq(links.isActive, true)).orderBy(asc(links.sortOrder)),
    db.select().from(appScreenshots).where(eq(appScreenshots.isActive, true)).orderBy(asc(appScreenshots.sortOrder)),
  ]);
  return { settings, sections, services: serviceItems, companies: companyItems, links: linkItems, screenshots };
}

export async function getAdminSiteData() {
  const db = await getDb();
  if (!db) return null;
  const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, "primary")).limit(1);
  const [sections, serviceItems, companyItems, linkItems, screenshots, media] = await Promise.all([
    db.select().from(contentSections).orderBy(asc(contentSections.sortOrder)),
    db.select().from(services).orderBy(asc(services.sortOrder)),
    db.select().from(supportedCompanies).orderBy(asc(supportedCompanies.sortOrder)),
    db.select().from(links).orderBy(asc(links.sortOrder)),
    db.select().from(appScreenshots).orderBy(asc(appScreenshots.sortOrder)),
    db.select().from(mediaAssets).orderBy(asc(mediaAssets.createdAt)),
  ]);
  return { settings, sections, services: serviceItems, companies: companyItems, links: linkItems, screenshots, media };
}

export const tables = { siteSettings, contentSections, services, supportedCompanies, links, mediaAssets, appScreenshots };
