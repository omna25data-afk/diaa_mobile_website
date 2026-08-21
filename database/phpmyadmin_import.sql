-- ضياء موبايل: مخطط MySQL والمحتوى الافتتاحي للاستيراد عبر phpMyAdmin.
-- اختر قاعدة البيانات المستهدفة في phpMyAdmin قبل استيراد هذا الملف.
SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS `users` (
  `id` int AUTO_INCREMENT NOT NULL,
  `openId` varchar(64) NOT NULL,
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_openId_unique` (`openId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `siteSettings` (
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
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `siteSettings_settingKey_unique` (`settingKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contentSections` (
  `id` int AUTO_INCREMENT NOT NULL,
  `sectionKey` varchar(80) NOT NULL,
  `page` enum('home','services','about','download','contact') NOT NULL,
  `label` varchar(120),
  `title` text NOT NULL,
  `subtitle` text,
  `body` text,
  `imageUrl` text,
  `isEnabled` tinyint(1) NOT NULL DEFAULT 1,
  `sortOrder` int NOT NULL DEFAULT 0,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `contentSections_sectionKey_unique` (`sectionKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `services` (
  `id` int AUTO_INCREMENT NOT NULL,
  `category` enum('telecom','payments','games') NOT NULL,
  `title` varchar(140) NOT NULL,
  `description` text NOT NULL,
  `icon` varchar(64) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `sortOrder` int NOT NULL DEFAULT 0,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `supportedCompanies` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` varchar(220),
  `logoUrl` text,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `sortOrder` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `links` (
  `id` int AUTO_INCREMENT NOT NULL,
  `linkKey` varchar(80) NOT NULL,
  `label` varchar(120) NOT NULL,
  `url` text NOT NULL,
  `linkType` enum('app','social','cta') NOT NULL,
  `icon` varchar(64),
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `sortOrder` int NOT NULL DEFAULT 0,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `links_linkKey_unique` (`linkKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `mediaAssets` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `storageKey` varchar(320) NOT NULL,
  `url` text NOT NULL,
  `mimeType` varchar(120) NOT NULL,
  `altText` varchar(255),
  `createdBy` int,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `appScreenshots` (
  `id` int AUTO_INCREMENT NOT NULL,
  `imageUrl` text NOT NULL,
  `altText` varchar(255) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `sortOrder` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `siteSettings`
  (`settingKey`, `platformName`, `siteTitle`, `heroTitle`, `heroDescription`, `aboutTitle`, `aboutDescription`, `mission`, `values`, `phone`, `email`, `logoUrl`, `heroImageUrl`)
VALUES
  ('primary', 'ضياء موبايل', 'ضياء موبايل لخدمات السداد', 'معاملاتك الرقمية، أسرع وأسهل في تطبيق واحد.', 'ضياء موبايل منصة رقمية لخدمات السداد والاتصالات والألعاب. اشحن رصيدك، سدّد فواتيرك، واستفد من خدمات الألعاب الرقمية من مكان واحد.', 'منصة تُسهّل احتياجاتك اليومية', 'ضياء موبايل لخدمات السداد هي منصة رقمية في مجال الخدمات الإلكترونية والاتصالات، تركز على إدارة وتوزيع الرصيد وتقديم خيارات السداد والباقات وخدمات الألعاب بصورة منظمة وسهلة الوصول.', 'أن نجعل الوصول إلى الخدمات الرقمية اليومية تجربة واضحة وعملية من خلال تطبيق واحد.', 'السهولة، الوضوح، تنوع الخدمات، والتواصل المباشر.', '+967 780 777 735', 'diaamobile01@gmail.com', '/media/diaa-app-icon.jpg', '/media/diaa-app-promo-dark.jpg');

INSERT IGNORE INTO `contentSections`
  (`sectionKey`, `page`, `label`, `title`, `subtitle`, `body`, `imageUrl`, `isEnabled`, `sortOrder`)
VALUES
  ('home_value', 'home', 'خدمات رقمية بوضوح أكبر', 'كل ما تحتاجه لمعاملاتك الرقمية في مكان واحد', 'اشحن، سدّد، وحوّل بسهولة.', 'تجمع ضياء موبايل خدمات الاتصالات والسداد والألعاب الرقمية في تجربة موحّدة تساعد المستخدم على اختيار الخدمة وتنفيذها من خلال التطبيق.', '/media/diaa-app-promo-light.jpg', 1, 1),
  ('services_intro', 'services', 'الخدمات', 'خدمات مصممة لاحتياجاتك اليومية', 'الاتصالات والسداد والألعاب الرقمية.', 'تعرّف على الخدمات المتاحة عبر ضياء موبايل، واختر الفئة المناسبة لمعاملتك قبل الانتقال إلى التطبيق.', '/media/diaa-app-icon.jpg', 1, 1),
  ('download_features', 'download', 'تثبيت التطبيق', 'حمّل ضياء موبايل وابدأ الآن', 'تجربة موحدة للخدمات اليومية.', 'حمّل التطبيق من Google Play، ثم اختر الخدمة التي تحتاجها واتبع التعليمات الظاهرة لإتمام معاملتك.', '/media/diaa-app-promo-dark.jpg', 1, 1),
  ('about_values', 'about', 'قيمنا', 'سهولة الوصول إلى الخدمات الرقمية', 'منصة عملية لتجربة أكثر تنظيمًا.', 'نضع الوضوح وسهولة الاستخدام في مقدمة تجربة ضياء موبايل، مع قنوات تواصل مباشرة وخدمات متاحة عبر التطبيق.', '/media/diaa-logo.jpg', 1, 1),
  ('contact_support', 'contact', 'الدعم والتواصل', 'نحن هنا لمساعدتك', 'تواصل مع فريق ضياء موبايل عبر القنوات الرسمية.', 'استخدم بيانات التواصل وروابط الحسابات الرسمية للحصول على المساعدة أو متابعة آخر المستجدات.', '/media/diaa-app-icon.jpg', 1, 1);

INSERT INTO `services` (`category`, `title`, `description`, `icon`, `isActive`, `sortOrder`)
SELECT 'telecom', 'شحن الرصيد', 'أعد شحن رصيدك من خلال الخيارات المتاحة داخل التطبيق، وبطريقة منظمة ومباشرة.', 'Smartphone', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM `services` WHERE `title` = 'شحن الرصيد');
INSERT INTO `services` (`category`, `title`, `description`, `icon`, `isActive`, `sortOrder`)
SELECT 'payments', 'سداد الفواتير', 'أنجز خدمات دفع الفواتير المتاحة من خلال تجربة رقمية موحّدة.', 'ReceiptText', 1, 2
WHERE NOT EXISTS (SELECT 1 FROM `services` WHERE `title` = 'سداد الفواتير');
INSERT INTO `services` (`category`, `title`, `description`, `icon`, `isActive`, `sortOrder`)
SELECT 'games', 'باقات الألعاب', 'احصل على خيارات رقمية مرتبطة بالألعاب من خلال خدمات ضياء موبايل.', 'Gamepad2', 1, 3
WHERE NOT EXISTS (SELECT 1 FROM `services` WHERE `title` = 'باقات الألعاب');
INSERT INTO `services` (`category`, `title`, `description`, `icon`, `isActive`, `sortOrder`)
SELECT 'telecom', 'باقات الاتصالات', 'اطّلع على الباقات المتاحة واختر ما يناسب احتياجك من خلال التطبيق.', 'Wifi', 1, 4
WHERE NOT EXISTS (SELECT 1 FROM `services` WHERE `title` = 'باقات الاتصالات');
INSERT INTO `services` (`category`, `title`, `description`, `icon`, `isActive`, `sortOrder`)
SELECT 'payments', 'التحويل', 'تشير المنصة إلى إمكانية التحويل ضمن خدماتها؛ راجع تفاصيل الخيارات المتاحة داخل التطبيق.', 'ArrowLeftRight', 1, 5
WHERE NOT EXISTS (SELECT 1 FROM `services` WHERE `title` = 'التحويل');
INSERT INTO `services` (`category`, `title`, `description`, `icon`, `isActive`, `sortOrder`)
SELECT 'games', 'PUBG وFortnite', 'اشترِ UC للعبة PUBG وخدمات مرتبطة بـ Fortnite وألعاب الفيديو وفق الخيارات المتاحة داخل التطبيق.', 'Trophy', 1, 6
WHERE NOT EXISTS (SELECT 1 FROM `services` WHERE `title` = 'PUBG وFortnite');

INSERT INTO `supportedCompanies` (`name`, `description`, `logoUrl`, `isActive`, `sortOrder`)
SELECT 'يمن موبايل', 'خدمات اتصالات مدعومة داخل التطبيق.', NULL, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM `supportedCompanies` WHERE `name` = 'يمن موبايل');
INSERT INTO `supportedCompanies` (`name`, `description`, `logoUrl`, `isActive`, `sortOrder`)
SELECT 'سبأفون', 'خدمات اتصالات مدعومة داخل التطبيق.', NULL, 1, 2
WHERE NOT EXISTS (SELECT 1 FROM `supportedCompanies` WHERE `name` = 'سبأفون');
INSERT INTO `supportedCompanies` (`name`, `description`, `logoUrl`, `isActive`, `sortOrder`)
SELECT 'يو', 'خدمات اتصالات مدعومة داخل التطبيق.', NULL, 1, 3
WHERE NOT EXISTS (SELECT 1 FROM `supportedCompanies` WHERE `name` = 'يو');

INSERT IGNORE INTO `links` (`linkKey`, `label`, `url`, `linkType`, `icon`, `isActive`, `sortOrder`)
VALUES
  ('google_play', 'تحميل التطبيق', 'https://play.google.com/store/apps/details?id=diaamobile.likhadmatsadad', 'app', 'Play', 1, 1),
  ('facebook', 'Facebook', 'https://www.facebook.com/diaamobile', 'social', 'Facebook', 1, 1),
  ('services_cta', 'استكشف الخدمات', '/services', 'cta', 'Grid2X2', 1, 1),
  ('instagram', 'Instagram', 'https://www.instagram.com/diaamobile', 'social', 'Instagram', 1, 2),
  ('contact_cta', 'تواصل معنا', '/contact', 'cta', 'MessageCircle', 1, 2),
  ('tiktok', 'TikTok', 'https://www.tiktok.com/@diaamobile', 'social', 'Music2', 1, 3);

INSERT INTO `appScreenshots` (`imageUrl`, `altText`, `isActive`, `sortOrder`)
SELECT '/media/diaa-app-promo-dark.jpg', 'واجهة ترويجية لتطبيق ضياء موبايل', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM `appScreenshots` WHERE `imageUrl` = '/media/diaa-app-promo-dark.jpg');
INSERT INTO `appScreenshots` (`imageUrl`, `altText`, `isActive`, `sortOrder`)
SELECT '/media/diaa-app-promo-light.jpg', 'لقطة تعريفية لتطبيق ضياء موبايل', 1, 2
WHERE NOT EXISTS (SELECT 1 FROM `appScreenshots` WHERE `imageUrl` = '/media/diaa-app-promo-light.jpg');
