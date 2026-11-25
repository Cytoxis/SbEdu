# SB EDU

React Native + Expo Router Android LMS using the existing Supabase RPC and session-header RLS foundation. No mock login, courses, payments, or scores.

## Configuration

Configure `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` through project environment settings. The URL is `https://susqldticqmwbourmnre.supabase.co`; the key must be the actual publishable/anon key, never a service-role key. The UI displays a configuration error if these are absent. This editing environment did not permit reading .env, so credential availability could not be verified.

Student registration creates a real account using the security question. The Official Staff Portal uses the existing administrator provisioned by the approved SQL migration. Bootstrap credentials from your specification should be rotated in the database before production; the app does not embed the administrator password.

## Staff workflow

1. Create courses and batches.
2. Create content sections, subjects, and chapters.
3. Add recorded lessons using 11-character YouTube IDs, materials using public HTTPS links, and live classes.
4. Create tests and their questions. Publish a test only after its questions are ready.
5. Replace the seeded payment image with your actual hosted bank-issued QR, set the UPI ID, and configure active WhatsApp contacts.
6. Verify payments against your bank account before approving pending enrollments.

QR configuration currently accepts hosted HTTPS image URLs. Gallery uploads require a dedicated Storage bucket and are not implemented. PDFs open in an external viewer; non-downloadable flags do not prevent copying externally hosted files. YouTube live content uses the same native watermarked player.

## Android build

Run `eas login`, `eas project:init`, then `eas build -p android --profile preview` after exporting the project and installing dependencies. The preview profile produces an APK; production produces an AAB. No APK build was executed in this editing session. EAS free-tier quotas depend on your current Expo plan.

The native YouTube player requires `react-native-youtube-iframe` and `react-native-webview`. Native capture protection uses `expo-screen-capture`; SecureStore holds the custom database session. The browser preview opens YouTube externally because the embedded native player cannot be verified there. Native fullscreen is disabled to retain the moving watermark. Capture blocking is not guaranteed DRM and does not stop external cameras, root-level capture, or leaked YouTube links.

## Verification checklist

Test on an installed Android build: student registration/login/recovery, administrator login, single-device invalidation, published-course browsing, free enrollment, pending paid enrollment, approval and expiry, demo versus paid lesson access, progress/resume, live playback, watermark movement, capture blocking, CBT answers and scoring, and every admin CRUD module. Test failed connectivity and missing configuration. No device or automated test runner was available in this session.

CBT scores are computed by RPC without exposing answer keys. The timer starts when the test loads and auto-submits locally; the current server RPC does not enforce deadlines or deduplicate submissions. Add server-recorded attempts before high-stakes exams. Recovery/login endpoints also need server-side rate limiting. UI styling is a tokenized React Native StyleSheet system rather than a NativeWind build pipeline.
