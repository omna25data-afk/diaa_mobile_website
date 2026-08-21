import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const siteSettings = mysqlTable("siteSettings", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contentSections = mysqlTable("contentSections", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  category: mysqlEnum("category", ["telecom", "payments", "games"]).notNull(),
  title: varchar("title", { length: 140 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 64 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const supportedCompanies = mysqlTable("supportedCompanies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  description: varchar("description", { length: 220 }),
  logoUrl: text("logoUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export const links = mysqlTable("links", {
  id: int("id").autoincrement().primaryKey(),
  linkKey: varchar("linkKey", { length: 80 }).notNull().unique(),
  label: varchar("label", { length: 120 }).notNull(),
  url: text("url").notNull(),
  linkType: mysqlEnum("linkType", ["app", "social", "cta"]).notNull(),
  icon: varchar("icon", { length: 64 }),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const mediaAssets = mysqlTable("mediaAssets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  storageKey: varchar("storageKey", { length: 320 }).notNull(),
  url: text("url").notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  altText: varchar("altText", { length: 255 }),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const appScreenshots = mysqlTable("appScreenshots", {
  id: int("id").autoincrement().primaryKey(),
  imageUrl: text("imageUrl").notNull(),
  altText: varchar("altText", { length: 255 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
