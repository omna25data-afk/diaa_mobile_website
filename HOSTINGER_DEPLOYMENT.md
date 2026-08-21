# نشر ضياء موبايل على Hostinger

## نوع التطبيق

هذا المشروع **Node.js Full-Stack** مبني بـ React وVite وExpress وtRPC وMySQL. لا تختَر Next.js في hPanel. اختر تطبيق Node.js أو خيار نشر تطبيق مخصص من مستودع GitHub.

## إعدادات النشر

| الحقل في Hostinger | القيمة |
|---|---|
| المستودع | `omna25data-afk/diaa_mobile_website` |
| الفرع | `main` |
| إصدار Node.js | 20 أو 22 |
| أمر التثبيت | `pnpm install --frozen-lockfile` |
| أمر البناء | `pnpm build` |
| أمر التشغيل | `pnpm start` |
| المجلد الجذري | جذر المستودع، حيث يوجد `package.json` |

لا تضبط منفذًا ثابتًا في Hostinger؛ يستخدم التطبيق قيمة `PORT` التي توفرها الاستضافة تلقائيًا.

## متغيرات البيئة المطلوبة

انسخ أسماء المتغيرات من `.env.example` إلى قسم Environment Variables في hPanel، ثم أدخل القيم الحقيقية. لا ترفع ملف `.env` إلى GitHub.

| المجموعة | المتغيرات |
|---|---|
| قاعدة البيانات | `DATABASE_URL` |
| جلسة الإدارة | `JWT_SECRET` و`ADMIN_EMAIL` و`ADMIN_PASSWORD` و`ADMIN_NAME` |
| تخزين الصور | `S3_BUCKET` و`S3_REGION` و`S3_ENDPOINT` و`S3_ACCESS_KEY_ID` و`S3_SECRET_ACCESS_KEY` و`MEDIA_PUBLIC_BASE_URL` |

يتطلب الموقع قاعدة MySQL فارغة على Hostinger. بعد إنشاء القاعدة وإضافة `DATABASE_URL`، شغّل مرة واحدة من الطرفية أو أمر التشغيل اليدوي في hPanel:

```bash
pnpm db:migrate
pnpm db:seed
```

ينشئ الأمر الأول الجداول، بينما يضيف الثاني محتوى ضياء موبايل الافتتاحي وروابط التطبيق والصور المحلية. لا يعيد `db:seed` إدراج البيانات إذا وُجدت الإعدادات الرئيسية.

## تخزين الوسائط

تعمل صور الموقع الافتتاحية من المجلد `client/public/media` فور النشر. أما رفع صور جديدة من لوحة التحكم فيتطلب تخزينًا S3-compatible؛ يمكن استخدام Amazon S3 أو Cloudflare R2 أو Backblaze B2. أدخل الرابط العام للحاوية في `MEDIA_PUBLIC_BASE_URL` بعد تهيئة الوصول للقراءة العامة أو نطاق وسائط مخصص.

## التحقق بعد النشر

افتح الصفحة الرئيسية ثم `/admin`. سجّل الدخول باستخدام البريد وكلمة المرور المحددين في `ADMIN_EMAIL` و`ADMIN_PASSWORD`. اختبر تعديل عنوان بسيط ورابط Google Play، ثم أعد فتح الصفحة العامة للتأكد من حفظ التغيير. راقب سجلات Deployment Logs في Hostinger عند أي فشل في البناء أو الاتصال بالقاعدة.
