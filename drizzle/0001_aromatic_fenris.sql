CREATE TABLE `appScreenshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imageUrl` text NOT NULL,
	`altText` varchar(255) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `appScreenshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentSections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectionKey` varchar(80) NOT NULL,
	`page` enum('home','services','about','download','contact') NOT NULL,
	`label` varchar(120),
	`title` text NOT NULL,
	`subtitle` text,
	`body` text,
	`imageUrl` text,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentSections_id` PRIMARY KEY(`id`),
	CONSTRAINT `contentSections_sectionKey_unique` UNIQUE(`sectionKey`)
);
--> statement-breakpoint
CREATE TABLE `links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`linkKey` varchar(80) NOT NULL,
	`label` varchar(120) NOT NULL,
	`url` text NOT NULL,
	`linkType` enum('app','social','cta') NOT NULL,
	`icon` varchar(64),
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `links_id` PRIMARY KEY(`id`),
	CONSTRAINT `links_linkKey_unique` UNIQUE(`linkKey`)
);
--> statement-breakpoint
CREATE TABLE `mediaAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`storageKey` varchar(320) NOT NULL,
	`url` text NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`altText` varchar(255),
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mediaAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` enum('telecom','payments','games') NOT NULL,
	`title` varchar(140) NOT NULL,
	`description` text NOT NULL,
	`icon` varchar(64) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `siteSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(64) NOT NULL,
	`platformName` varchar(120) NOT NULL,
	`siteTitle` varchar(180) NOT NULL,
	`heroTitle` text NOT NULL,
	`heroDescription` text NOT NULL,
	`aboutTitle` varchar(180) NOT NULL,
	`aboutDescription` text NOT NULL,
	`mission` text NOT NULL,
	`values` text NOT NULL,
	`phone` varchar(48) NOT NULL,
	`email` varchar(320) NOT NULL,
	`logoUrl` text,
	`heroImageUrl` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteSettings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `supportedCompanies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` varchar(220),
	`logoUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `supportedCompanies_id` PRIMARY KEY(`id`)
);
