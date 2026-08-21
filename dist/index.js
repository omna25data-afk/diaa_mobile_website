// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z3 } from "zod";

// shared/const.ts
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var EXTERNAL_SESSION_COOKIE = "diaa_admin_session";
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/externalAuth.ts
import { timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  adminName: process.env.ADMIN_NAME ?? "\u0645\u062F\u064A\u0631 \u0636\u064A\u0627\u0621 \u0645\u0648\u0628\u0627\u064A\u0644",
  s3Bucket: process.env.S3_BUCKET ?? "",
  s3Region: process.env.S3_REGION ?? "auto",
  s3Endpoint: process.env.S3_ENDPOINT ?? "",
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  mediaPublicBaseUrl: process.env.MEDIA_PUBLIC_BASE_URL ?? ""
};

// server/externalAuth.ts
function sessionKey() {
  if (ENV.jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be set to a long random value before enabling admin login.");
  }
  return new TextEncoder().encode(ENV.jwtSecret);
}
function sameValue(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
function makeAdminUser(session) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: `external-admin:${session.email}`,
    name: session.name,
    email: session.email,
    loginMethod: "environment-admin",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now
  };
}
function requestIsSecure(req) {
  const forwarded = req.headers["x-forwarded-proto"];
  const proto = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return req.protocol === "https" || proto === "https";
}
function externalCookieOptions(req) {
  return {
    httpOnly: true,
    secure: requestIsSecure(req),
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_MS
  };
}
function validateAdminCredentials(email, password) {
  if (!ENV.adminEmail || !ENV.adminPassword) return false;
  return email.trim().toLowerCase() === ENV.adminEmail.trim().toLowerCase() && sameValue(password, ENV.adminPassword);
}
async function createAdminSession() {
  if (!ENV.adminEmail || !ENV.adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be configured before logging in.");
  }
  const expiresAt = Math.floor((Date.now() + ONE_YEAR_MS) / 1e3);
  return new SignJWT({ email: ENV.adminEmail, name: ENV.adminName, role: "admin" }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expiresAt).sign(sessionKey());
}
async function authenticateExternalAdmin(req) {
  const token = req.headers.cookie?.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${EXTERNAL_SESSION_COOKIE}=`))?.slice(EXTERNAL_SESSION_COOKIE.length + 1);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ["HS256"] });
    if (payload.role !== "admin" || typeof payload.email !== "string" || typeof payload.name !== "string") return null;
    if (!ENV.adminEmail || payload.email.toLowerCase() !== ENV.adminEmail.toLowerCase()) return null;
    return makeAdminUser({ email: payload.email, name: payload.name, role: "admin" });
  } catch {
    return null;
  }
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers/site.ts
import { eq as eq2 } from "drizzle-orm";
import { z as z2 } from "zod";

// drizzle/schema.ts
import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar
} from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var siteSettings = mysqlTable("siteSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 64 }).notNull().unique(),
  platformName: varchar("platformName", { length: 120 }).notNull(),
  siteTitle: varchar("siteTitle", { length: 180 }).notNull(),
  heroTitle: text("heroTitle").notNull(),
  heroDescription: text("heroDescription").notNull(),
  aboutTitle: varchar("aboutTitle", { length: 180 }).notNull(),
  aboutDescription: text("aboutDescription").notNull(),
  mission: text("mission").notNull(),
  values: text("values").notNull(),
  phone: varchar("phone", { length: 48 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  logoUrl: text("logoUrl"),
  heroImageUrl: text("heroImageUrl"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var contentSections = mysqlTable("contentSections", {
  id: int("id").autoincrement().primaryKey(),
  sectionKey: varchar("sectionKey", { length: 80 }).notNull().unique(),
  page: mysqlEnum("page", ["home", "services", "about", "download", "contact"]).notNull(),
  label: varchar("label", { length: 120 }),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  body: text("body"),
  imageUrl: text("imageUrl"),
  isEnabled: boolean("isEnabled").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  category: mysqlEnum("category", ["telecom", "payments", "games"]).notNull(),
  title: varchar("title", { length: 140 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 64 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var supportedCompanies = mysqlTable("supportedCompanies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  description: varchar("description", { length: 220 }),
  logoUrl: text("logoUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull()
});
var links = mysqlTable("links", {
  id: int("id").autoincrement().primaryKey(),
  linkKey: varchar("linkKey", { length: 80 }).notNull().unique(),
  label: varchar("label", { length: 120 }).notNull(),
  url: text("url").notNull(),
  linkType: mysqlEnum("linkType", ["app", "social", "cta"]).notNull(),
  icon: varchar("icon", { length: 64 }),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var mediaAssets = mysqlTable("mediaAssets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  storageKey: varchar("storageKey", { length: 320 }).notNull(),
  url: text("url").notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  altText: varchar("altText", { length: 255 }),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var appScreenshots = mysqlTable("appScreenshots", {
  id: int("id").autoincrement().primaryKey(),
  imageUrl: text("imageUrl").notNull(),
  altText: varchar("altText", { length: 255 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull()
});

// server/db.ts
import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) _db = drizzle(process.env.DATABASE_URL);
  return _db;
}
async function getPublicSiteData() {
  const db = await getDb();
  if (!db) return null;
  const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, "primary")).limit(1);
  const [sections, serviceItems, companyItems, linkItems, screenshots] = await Promise.all([
    db.select().from(contentSections).where(eq(contentSections.isEnabled, true)).orderBy(asc(contentSections.sortOrder)),
    db.select().from(services).where(eq(services.isActive, true)).orderBy(asc(services.sortOrder)),
    db.select().from(supportedCompanies).where(eq(supportedCompanies.isActive, true)).orderBy(asc(supportedCompanies.sortOrder)),
    db.select().from(links).where(eq(links.isActive, true)).orderBy(asc(links.sortOrder)),
    db.select().from(appScreenshots).where(eq(appScreenshots.isActive, true)).orderBy(asc(appScreenshots.sortOrder))
  ]);
  return { settings, sections, services: serviceItems, companies: companyItems, links: linkItems, screenshots };
}
async function getAdminSiteData() {
  const db = await getDb();
  if (!db) return null;
  const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.settingKey, "primary")).limit(1);
  const [sections, serviceItems, companyItems, linkItems, screenshots, media] = await Promise.all([
    db.select().from(contentSections).orderBy(asc(contentSections.sortOrder)),
    db.select().from(services).orderBy(asc(services.sortOrder)),
    db.select().from(supportedCompanies).orderBy(asc(supportedCompanies.sortOrder)),
    db.select().from(links).orderBy(asc(links.sortOrder)),
    db.select().from(appScreenshots).orderBy(asc(appScreenshots.sortOrder)),
    db.select().from(mediaAssets).orderBy(asc(mediaAssets.createdAt))
  ]);
  return { settings, sections, services: serviceItems, companies: companyItems, links: linkItems, screenshots, media };
}

// server/storage.ts
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const index = relKey.lastIndexOf(".");
  return index === -1 ? `${relKey}_${hash}` : `${relKey.slice(0, index)}_${hash}${relKey.slice(index)}`;
}
function storageConfig() {
  if (!ENV.s3Bucket || !ENV.s3AccessKeyId || !ENV.s3SecretAccessKey || !ENV.mediaPublicBaseUrl) {
    throw new Error("S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY and MEDIA_PUBLIC_BASE_URL are required for media uploads.");
  }
  return {
    client: new S3Client({
      region: ENV.s3Region,
      endpoint: ENV.s3Endpoint || void 0,
      forcePathStyle: Boolean(ENV.s3Endpoint),
      credentials: { accessKeyId: ENV.s3AccessKeyId, secretAccessKey: ENV.s3SecretAccessKey }
    }),
    bucket: ENV.s3Bucket,
    publicBaseUrl: ENV.mediaPublicBaseUrl.replace(/\/+$/, "")
  };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { client, bucket, publicBaseUrl } = storageConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: data, ContentType: contentType }));
  return { key, url: `${publicBaseUrl}/${key}` };
}

// server/routers/site.ts
var urlField = z2.string().max(2048);
var settingsInput = z2.object({
  platformName: z2.string().min(2).max(120),
  siteTitle: z2.string().min(2).max(180),
  heroTitle: z2.string().min(2),
  heroDescription: z2.string().min(2),
  aboutTitle: z2.string().min(2).max(180),
  aboutDescription: z2.string().min(2),
  mission: z2.string().min(2),
  values: z2.string().min(2),
  phone: z2.string().min(4).max(48),
  email: z2.string().email(),
  logoUrl: z2.string().nullable(),
  heroImageUrl: z2.string().nullable()
});
var sectionInput = z2.object({ sectionKey: z2.string().min(2).max(80), page: z2.enum(["home", "services", "about", "download", "contact"]), label: z2.string().max(120).nullable(), title: z2.string().min(2), subtitle: z2.string().nullable(), body: z2.string().nullable(), imageUrl: z2.string().nullable(), isEnabled: z2.boolean(), sortOrder: z2.number().int() });
var serviceInput = z2.object({ category: z2.enum(["telecom", "payments", "games"]), title: z2.string().min(2).max(140), description: z2.string().min(2), icon: z2.string().min(2).max(64), isActive: z2.boolean(), sortOrder: z2.number().int() });
var companyInput = z2.object({ name: z2.string().min(2).max(120), description: z2.string().max(220).nullable(), logoUrl: z2.string().nullable(), isActive: z2.boolean(), sortOrder: z2.number().int() });
var linkInput = z2.object({ linkKey: z2.string().min(2).max(80), label: z2.string().min(2).max(120), url: urlField, linkType: z2.enum(["app", "social", "cta"]), icon: z2.string().max(64).nullable(), isActive: z2.boolean(), sortOrder: z2.number().int() });
var screenshotInput = z2.object({ imageUrl: urlField, altText: z2.string().min(2).max(255), isActive: z2.boolean(), sortOrder: z2.number().int() });
async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u064B\u0627.");
  return db;
}
function normalizeLegacyMediaUrl(value) {
  if (!value || !value.startsWith("/manus-storage/")) return value ?? null;
  if (value.includes("promo-dark")) return "/media/diaa-app-promo-dark.jpg";
  if (value.includes("promo-light")) return "/media/diaa-app-promo-light.jpg";
  if (value.includes("diaa-logo")) return "/media/diaa-logo.jpg";
  return "/media/diaa-app-icon.jpg";
}
function normalizeSiteData(data) {
  if (!data) return data;
  return {
    ...data,
    settings: data.settings ? { ...data.settings, logoUrl: normalizeLegacyMediaUrl(data.settings.logoUrl), heroImageUrl: normalizeLegacyMediaUrl(data.settings.heroImageUrl) } : data.settings,
    sections: data.sections?.map((section) => ({ ...section, imageUrl: normalizeLegacyMediaUrl(section.imageUrl) })),
    companies: data.companies?.map((company) => ({ ...company, logoUrl: normalizeLegacyMediaUrl(company.logoUrl) })),
    media: data.media?.map((asset) => ({ ...asset, url: normalizeLegacyMediaUrl(asset.url) })),
    screenshots: data.screenshots?.map((screenshot) => ({ ...screenshot, imageUrl: normalizeLegacyMediaUrl(screenshot.imageUrl) }))
  };
}
var siteRouter = router({
  publicData: publicProcedure.query(async () => normalizeSiteData(await getPublicSiteData())),
  admin: router({
    data: adminProcedure.query(async () => normalizeSiteData(await getAdminSiteData())),
    updateSettings: adminProcedure.input(settingsInput).mutation(async ({ input }) => {
      const db = await requireDb();
      const values = { ...input, logoUrl: normalizeLegacyMediaUrl(input.logoUrl), heroImageUrl: normalizeLegacyMediaUrl(input.heroImageUrl) };
      await db.insert(siteSettings).values({ settingKey: "primary", ...values }).onDuplicateKeyUpdate({ set: values });
      return { success: true };
    }),
    upsertSection: adminProcedure.input(sectionInput.extend({ id: z2.number().int().optional() })).mutation(async ({ input }) => {
      const db = await requireDb();
      const { id, ...rawValues } = input;
      const values = { ...rawValues, imageUrl: normalizeLegacyMediaUrl(rawValues.imageUrl) };
      if (id) await db.update(contentSections).set(values).where(eq2(contentSections.id, id));
      else await db.insert(contentSections).values(values);
      return { success: true };
    }),
    deleteSection: adminProcedure.input(z2.object({ id: z2.number().int() })).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.delete(contentSections).where(eq2(contentSections.id, input.id));
      return { success: true };
    }),
    upsertService: adminProcedure.input(serviceInput.extend({ id: z2.number().int().optional() })).mutation(async ({ input }) => {
      const db = await requireDb();
      const { id, ...values } = input;
      if (id) await db.update(services).set(values).where(eq2(services.id, id));
      else await db.insert(services).values(values);
      return { success: true };
    }),
    deleteService: adminProcedure.input(z2.object({ id: z2.number().int() })).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.delete(services).where(eq2(services.id, input.id));
      return { success: true };
    }),
    upsertCompany: adminProcedure.input(companyInput.extend({ id: z2.number().int().optional() })).mutation(async ({ input }) => {
      const db = await requireDb();
      const { id, ...rawValues } = input;
      const values = { ...rawValues, logoUrl: normalizeLegacyMediaUrl(rawValues.logoUrl) };
      if (id) await db.update(supportedCompanies).set(values).where(eq2(supportedCompanies.id, id));
      else await db.insert(supportedCompanies).values(values);
      return { success: true };
    }),
    deleteCompany: adminProcedure.input(z2.object({ id: z2.number().int() })).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.delete(supportedCompanies).where(eq2(supportedCompanies.id, input.id));
      return { success: true };
    }),
    upsertLink: adminProcedure.input(linkInput.extend({ id: z2.number().int().optional() })).mutation(async ({ input }) => {
      const db = await requireDb();
      const { id, ...values } = input;
      if (id) await db.update(links).set(values).where(eq2(links.id, id));
      else await db.insert(links).values(values);
      return { success: true };
    }),
    deleteLink: adminProcedure.input(z2.object({ id: z2.number().int() })).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.delete(links).where(eq2(links.id, input.id));
      return { success: true };
    }),
    upsertScreenshot: adminProcedure.input(screenshotInput.extend({ id: z2.number().int().optional() })).mutation(async ({ input }) => {
      const db = await requireDb();
      const { id, ...rawValues } = input;
      const values = { ...rawValues, imageUrl: normalizeLegacyMediaUrl(rawValues.imageUrl) };
      if (id) await db.update(appScreenshots).set(values).where(eq2(appScreenshots.id, id));
      else await db.insert(appScreenshots).values(values);
      return { success: true };
    }),
    deleteScreenshot: adminProcedure.input(z2.object({ id: z2.number().int() })).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.delete(appScreenshots).where(eq2(appScreenshots.id, input.id));
      return { success: true };
    }),
    uploadMedia: adminProcedure.input(z2.object({ name: z2.string().min(1).max(255), mimeType: z2.string().regex(/^image\/(jpeg|jpg|png|webp|gif)$/), dataUrl: z2.string().max(7e6), altText: z2.string().max(255).nullable() })).mutation(async ({ input, ctx }) => {
      const db = await requireDb();
      const matched = input.dataUrl.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
      if (!matched) throw new Error("\u0635\u064A\u063A\u0629 \u0627\u0644\u0635\u0648\u0631\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629.");
      const bytes = Buffer.from(matched[2], "base64");
      if (bytes.length > 5 * 1024 * 1024) throw new Error("\u062D\u062C\u0645 \u0627\u0644\u0635\u0648\u0631\u0629 \u064A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0648\u0647\u0648 5 \u0645\u064A\u063A\u0627\u0628\u0627\u064A\u062A.");
      const extension = input.mimeType.split("/")[1] === "jpeg" ? "jpg" : input.mimeType.split("/")[1];
      const storageKey = `diaa-mobile/${Date.now()}-${input.name.replace(/[^a-zA-Z0-9._-]/g, "-")}.${extension}`;
      const stored = await storagePut(storageKey, bytes, input.mimeType);
      const [asset] = await db.insert(mediaAssets).values({ name: input.name, storageKey: stored.key, url: stored.url, mimeType: input.mimeType, altText: input.altText, createdBy: ctx.user.id }).$returningId();
      return { success: true, id: asset.id, url: stored.url };
    })
  })
});

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    login: publicProcedure.input(z3.object({ email: z3.string().email(), password: z3.string().min(1).max(256) })).mutation(async ({ input, ctx }) => {
      if (!validateAdminCredentials(input.email, input.password)) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629." });
      }
      const token = await createAdminSession();
      ctx.res.cookie(EXTERNAL_SESSION_COOKIE, token, externalCookieOptions(ctx.req));
      return { success: true };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(EXTERNAL_SESSION_COOKIE, { ...externalCookieOptions(ctx.req), maxAge: -1 });
      return { success: true };
    })
  }),
  site: siteRouter
});

// server/_core/context.ts
async function createContext(opts) {
  return { req: opts.req, res: opts.res, user: await authenticateExternalAdmin(opts.req) };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: { outDir: path.resolve(import.meta.dirname, "dist/public"), emptyOutDir: true },
  server: { host: true }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.set("trust proxy", 1);
  app.use(express2.json({ limit: "10mb" }));
  app.use(express2.urlencoded({ limit: "10mb", extended: true }));
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = Number(process.env.PORT || 3e3);
  server.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}
startServer().catch((error) => {
  console.error("Server failed to start", error);
  process.exit(1);
});
