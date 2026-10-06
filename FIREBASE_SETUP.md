# إعداد Firebase

تمت إزالة إعداد Firebase القديم المضمّن من `src/lib/firebase.js`. لإضافة مشروعك:

1. انسخ `.env.example` إلى `.env`:

   ```bash
   cp .env.example .env
   ```

2. من Firebase Console افتح **Project settings → Your apps → Web app** وانسخ قيم إعدادات Web app إلى متغيرات `VITE_FIREBASE_*` في `.env`.
3. إذا كنت ستستخدم Firebase CLI، انسخ `.firebaserc.example` إلى `.firebaserc` واستبدل `YOUR_FIREBASE_PROJECT_ID` بمعرف مشروعك.
4. فعّل **Anonymous sign-in** من **Authentication → Sign-in method**.
5. انشر قواعد Firestore الموجودة في `firestore.rules`، أو طبّق القواعد المناسبة لمشروعك.
6. ابنِ التطبيق:

   ```bash
   npm install
   npm run build
   ```

## إشعارات Android عبر GitHub Actions

أضف سرًا في GitHub باسم `GOOGLE_SERVICES_JSON_BASE64`، وقيمته محتوى ملف
`google-services.json` بعد تحويله إلى Base64. يقوم Workflow بفكّه مؤقتًا إلى
`android/app/google-services.json` أثناء البناء فقط، ثم يستخدمه Firebase Cloud Messaging.

## تنبيه مهم

إعداد Firebase الخاص بالواجهة (`apiKey`, `appId` وغيرها) ليس مفتاح Admin سريًا؛ سيظهر ضمن حزمة المتصفح بطبيعته. لا تضع ملف خدمة Firebase Admin أو `private_key` أو أي مفتاح سري داخل `.env` الخاص بالواجهة أو داخل `VITE_*`. الأسرار الحقيقية يجب أن تبقى في Cloud Functions/خادم خلفي أو في GitHub Secrets/Firebase Secret Manager.

لا ترفع `.env` إلى Git؛ فهو مستثنى من `.gitignore`.
