import "dotenv/config";
import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required before running the seed script.");
const db = await mysql.createConnection(process.env.DATABASE_URL);
const [existing] = await db.query("SELECT id FROM siteSettings WHERE settingKey = 'primary' LIMIT 1");

if (existing.length) {
  console.log("Seed skipped: primary site settings already exist.");
  await db.end();
  process.exit(0);
}

await db.beginTransaction();
try {
  await db.query(
    `INSERT INTO siteSettings (settingKey, platformName, siteTitle, heroTitle, heroDescription, aboutTitle, aboutDescription, mission, values, phone, email, logoUrl, heroImageUrl)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ["primary", "ضياء موبايل", "ضياء موبايل لخدمات السداد", "معاملاتك الرقمية، أسرع وأسهل في تطبيق واحد.", "ضياء موبايل منصة رقمية لخدمات السداد والاتصالات والألعاب. اشحن رصيدك، سدّد فواتيرك، واستفد من خدمات الألعاب الرقمية من مكان واحد.", "منصة تُسهّل احتياجاتك اليومية", "ضياء موبايل لخدمات السداد هي منصة رقمية في مجال الخدمات الإلكترونية والاتصالات، تركز على إدارة وتوزيع الرصيد وتقديم خيارات السداد والباقات وخدمات الألعاب بصورة منظمة وسهلة الوصول.", "أن نجعل الوصول إلى الخدمات الرقمية اليومية تجربة واضحة وعملية من خلال تطبيق واحد.", "السهولة، الوضوح، تنوع الخدمات، والتواصل المباشر.", "+967 780 777 735", "diaamobile01@gmail.com", "/media/diaa-app-icon.jpg", "/media/diaa-app-promo-dark.jpg"],
  );
  await db.query(
    `INSERT INTO contentSections (sectionKey, page, label, title, subtitle, body, imageUrl, isEnabled, sortOrder) VALUES
    ('home_value', 'home', 'خدمات رقمية بوضوح أكبر', 'كل ما تحتاجه لمعاملاتك الرقمية في مكان واحد', 'اشحن، سدّد، وحوّل بسهولة.', 'تجمع ضياء موبايل خدمات الاتصالات والسداد والألعاب الرقمية في تجربة موحّدة تساعد المستخدم على اختيار الخدمة وتنفيذها من خلال التطبيق.', '/media/diaa-app-promo-light.jpg', 1, 1),
    ('services_intro', 'services', 'الخدمات', 'خدمات مصممة لاحتياجاتك اليومية', 'الاتصالات والسداد والألعاب الرقمية.', 'تعرّف على الخدمات المتاحة عبر ضياء موبايل، واختر الفئة المناسبة لمعاملتك قبل الانتقال إلى التطبيق.', '/media/diaa-app-icon.jpg', 1, 1),
    ('download_features', 'download', 'تثبيت التطبيق', 'حمّل ضياء موبايل وابدأ الآن', 'تجربة موحدة للخدمات اليومية.', 'حمّل التطبيق من Google Play، ثم اختر الخدمة التي تحتاجها واتبع التعليمات الظاهرة لإتمام معاملتك.', '/media/diaa-app-promo-dark.jpg', 1, 1),
    ('about_values', 'about', 'قيمنا', 'سهولة الوصول إلى الخدمات الرقمية', 'منصة عملية لتجربة أكثر تنظيمًا.', 'نضع الوضوح وسهولة الاستخدام في مقدمة تجربة ضياء موبايل، مع قنوات تواصل مباشرة وخدمات متاحة عبر التطبيق.', '/media/diaa-logo.jpg', 1, 1),
    ('contact_support', 'contact', 'الدعم والتواصل', 'نحن هنا لمساعدتك', 'تواصل مع فريق ضياء موبايل عبر القنوات الرسمية.', 'استخدم بيانات التواصل وروابط الحسابات الرسمية للحصول على المساعدة أو متابعة آخر المستجدات.', '/media/diaa-app-icon.jpg', 1, 1)`,
  );
  await db.query(
    `INSERT INTO services (category, title, description, icon, isActive, sortOrder) VALUES
    ('telecom', 'شحن الرصيد', 'أعد شحن رصيدك من خلال الخيارات المتاحة داخل التطبيق، وبطريقة منظمة ومباشرة.', 'Smartphone', 1, 1),
    ('payments', 'سداد الفواتير', 'أنجز خدمات دفع الفواتير المتاحة من خلال تجربة رقمية موحّدة.', 'ReceiptText', 1, 2),
    ('games', 'باقات الألعاب', 'احصل على خيارات رقمية مرتبطة بالألعاب من خلال خدمات ضياء موبايل.', 'Gamepad2', 1, 3),
    ('telecom', 'باقات الاتصالات', 'اطّلع على الباقات المتاحة واختر ما يناسب احتياجك من خلال التطبيق.', 'Wifi', 1, 4),
    ('payments', 'التحويل', 'تشير المنصة إلى إمكانية التحويل ضمن خدماتها؛ راجع تفاصيل الخيارات المتاحة داخل التطبيق.', 'ArrowLeftRight', 1, 5),
    ('games', 'PUBG وFortnite', 'اشترِ UC للعبة PUBG وخدمات مرتبطة بـ Fortnite وألعاب الفيديو وفق الخيارات المتاحة داخل التطبيق.', 'Trophy', 1, 6)`,
  );
  await db.query(
    `INSERT INTO supportedCompanies (name, description, logoUrl, isActive, sortOrder) VALUES
    ('يمن موبايل', 'خدمات اتصالات مدعومة داخل التطبيق.', NULL, 1, 1),
    ('سبأفون', 'خدمات اتصالات مدعومة داخل التطبيق.', NULL, 1, 2),
    ('يو', 'خدمات اتصالات مدعومة داخل التطبيق.', NULL, 1, 3)`,
  );
  await db.query(
    `INSERT INTO links (linkKey, label, url, linkType, icon, isActive, sortOrder) VALUES
    ('google_play', 'تحميل التطبيق', 'https://play.google.com/store/apps/details?id=diaamobile.likhadmatsadad', 'app', 'Play', 1, 1),
    ('facebook', 'Facebook', 'https://www.facebook.com/diaamobile', 'social', 'Facebook', 1, 1),
    ('services_cta', 'استكشف الخدمات', '/services', 'cta', 'Grid2X2', 1, 1),
    ('instagram', 'Instagram', 'https://www.instagram.com/diaamobile', 'social', 'Instagram', 1, 2),
    ('contact_cta', 'تواصل معنا', '/contact', 'cta', 'MessageCircle', 1, 2),
    ('tiktok', 'TikTok', 'https://www.tiktok.com/@diaamobile', 'social', 'Music2', 1, 3)`,
  );
  await db.query(
    `INSERT INTO appScreenshots (imageUrl, altText, isActive, sortOrder) VALUES
    ('/media/diaa-app-promo-dark.jpg', 'واجهة ترويجية لتطبيق ضياء موبايل', 1, 1),
    ('/media/diaa-app-promo-light.jpg', 'لقطة تعريفية لتطبيق ضياء موبايل', 1, 2)`,
  );
  await db.commit();
  console.log("Diaa Mobile initial content inserted.");
} catch (error) {
  await db.rollback();
  throw error;
} finally {
  await db.end();
}
