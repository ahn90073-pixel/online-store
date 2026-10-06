# Mobile build

التطبيق يستخدم **Capacitor** فوق واجهة React الحالية؛ لذلك تبقى الواجهة المشتركة في `src/`، بينما توجد المشاريع الأصلية هنا:

- `android/`: مشروع Android أصلي يعمل عبر Gradle ويدعم إضافة Kotlin plugins.
- `ios/`: مشروع Xcode أصلي يعمل عبر Swift ويدعم إضافة Swift plugins.

## المعرّف الحالي

```text
com.ahn90073.onlinestore
```

يمكن تغيير المعرّف قبل النشر من `capacitor.config.ts` وإعدادات Android وiOS، مع استخدام معرّف Apple App ID مطابق.

## التشغيل محليًا

```bash
npm ci
npm run build
npx cap sync android
npx cap sync ios
npx cap open android
npx cap open ios
```

يتطلب Android Studio + Android SDK لبناء Android، ويتطلب iOS جهاز macOS مع Xcode وCocoaPods.

## GitHub Actions

- `Mobile CI`: يعمل تلقائيًا عند push/PR، ويتحقق من React/TypeScript وينتج APK debug.
- `Android Release`: تشغيل يدوي من Actions وينتج APK وAAB موقّعين.
- `iOS Release`: تشغيل يدوي على macOS وينتج IPA موقّع.
- `Publish OTA Web Bundle`: يعمل تلقائيًا بعد كل push إلى `main`، ويبني `dist` ويرفعه إلى إصدار GitHub باسم `ota-latest`.

## التحديث الهوائي OTA

يستخدم المشروع `@capgo/capacitor-updater` مع GitHub Releases كمخزن حزم. عميل OTA موجود في
`src/ota/githubOta.js`، ويقرأ `ota-manifest.json` من إصدار `ota-latest`، ثم ينزّل الحزمة
ويتحقق من SHA-256 ويضعها للتفعيل عند انتقال التطبيق للخلفية أو إعادة فتحه. إذا فشلت
الحزمة، يعيد Capacitor تلقائيًا آخر نسخة سليمة أو النسخة المضمنة داخل التطبيق.

**مهم:** الإصدار القديم `v1.0.0` لا يحتوي على عميل OTA. يجب أولًا نشر نسخة Native جديدة
مثل `v1.1.0` من Android وiOS، وبعد تثبيتها يمكن لتعديلات React/JSX/CSS اللاحقة الوصول
للمستخدمين عبر GitHub دون APK/IPA جديد. تغييرات Kotlin/Swift والصلاحيات والإضافات الأصلية
ما زالت تحتاج إصدارًا جديدًا من المتجر.

### اختبار OTA

1. شغّل `Android Release` باستخدام `v1.1.0`، وثبّت APK على جهاز اختبار. بالنسبة لـiOS استخدم TestFlight.
2. بعد ذلك عدّل واجهة React وادفع التعديل إلى `main`.
3. انتظر نجاح `Publish OTA Web Bundle`.
4. افتح التطبيق ثم أرسله للخلفية وأعد فتحه؛ سيُفعّل الحزمة الجديدة بأمان.

لا تغيّر اسم إصدار `ota-latest` ولا تحذف ملفات `web-bundle.zip` و`ota-manifest.json` من ذلك الإصدار.

## أسرار Android المطلوبة في GitHub

أضفها من **Settings → Secrets and variables → Actions → New repository secret**:

| الاسم | القيمة |
|---|---|
| `GOOGLE_SERVICES_JSON_BASE64` | محتوى `google-services.json` بعد تحويله إلى Base64؛ مطلوب لتفعيل Firebase Cloud Messaging |
| `ANDROID_KEYSTORE_BASE64` | محتوى keystore بعد تحويله إلى Base64 |
| `ANDROID_KEYSTORE_PASSWORD` | كلمة مرور keystore |
| `ANDROID_KEY_ALIAS` | اسم المفتاح داخل keystore |
| `ANDROID_KEY_PASSWORD` | كلمة مرور المفتاح |

إنشاء keystore محليًا (نفّذ على جهازك، وليس داخل Git):

```bash
keytool -genkeypair -v \
  -keystore online-store-release.jks \
  -alias online-store \
  -keyalg RSA -keysize 2048 -validity 10000
base64 -w 0 online-store-release.jks > online-store-release.jks.base64
```

## أسرار iOS المطلوبة

تحتاج إلى Apple Developer Account وApp Store Connect API Key وملف provisioning profile:

| الاسم | القيمة |
|---|---|
| `IOS_CERTIFICATE_BASE64` | شهادة التوزيع بصيغة `.p12` بعد Base64 |
| `IOS_CERTIFICATE_PASSWORD` | كلمة مرور ملف `.p12` |
| `APPSTORE_ISSUER_ID` | Issuer ID من App Store Connect |
| `APPSTORE_KEY_ID` | Key ID من App Store Connect |
| `APPSTORE_PRIVATE_KEY` | محتوى مفتاح App Store Connect `.p8` |
| `APPLE_TEAM_ID` | Team ID |
| `IOS_CODE_SIGN_IDENTITY` | غالبًا `Apple Distribution` |
| `IOS_PROVISIONING_PROFILE_NAME` | اسم App Store provisioning profile |

لا ترفع ملفات `.jks` أو `.keystore` أو `.p12` أو `.mobileprovision` أو `.p8` إلى المستودع. ملفات الأسرار لا تُنشأ أو تُضمّن هنا؛ GitHub Secrets هي المكان الصحيح لها.

## ملاحظات النشر

- زيادة `versionCode` في `android/app/build.gradle` لكل إصدار Android.
- زيادة `CURRENT_PROJECT_VERSION` و`MARKETING_VERSION` في مشروع iOS لكل إصدار.
- لا يمكن إنتاج IPA موقّع من Linux؛ Workflow iOS يستخدم `macos-14`.
- لا يمكن نشر التطبيق إلى Google Play أو App Store تلقائيًا بهذا الإعداد؛ الـWorkflows تنتج artifacts فقط، ويمكن إضافة خطوة رفع لاحقًا بعد مراجعة حسابات المتاجر.
