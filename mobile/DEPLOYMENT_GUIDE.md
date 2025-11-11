# TravelJoy Mobile App Deployment Guide

## Prerequisites

### Required Accounts

1. **Expo Account**

   - Sign up at https://expo.dev
   - Install EAS CLI: `npm install -g eas-cli`
   - Login: `eas login`

2. **Apple Developer Account** (for iOS)

   - Enroll at https://developer.apple.com
   - Cost: $99/year
   - Required for App Store submission

3. **Google Play Developer Account** (for Android)

   - Sign up at https://play.google.com/console
   - One-time fee: $25
   - Required for Play Store submission

4. **Stripe Account** (Production)
   - Production API keys
   - Webhook endpoint configured

### Development Tools

- Node.js 18+ and npm
- Expo CLI
- EAS CLI
- Xcode (for iOS builds - Mac only)
- Android Studio (for Android builds)

## Environment Configuration

### Production Environment Variables

Create `mobile/.env.production`:

```env
EXPO_PUBLIC_API_URL=https://api.traveljoy.com
```

### Update app.json

1. Set your Expo username in `owner` field
2. Get your project ID: `eas init`
3. Update `extra.eas.projectId` with your project ID

## Build Configuration

### iOS Build Setup

1. **Configure Bundle Identifier**

   ```json
   "ios": {
     "bundleIdentifier": "com.traveljoy.app"
   }
   ```

2. **Set Up Credentials**

   ```bash
   eas credentials
   ```

   - Choose iOS
   - Select "Set up Push Notifications"
   - Generate or upload certificates

3. **Configure App Store Connect**
   - Create app in App Store Connect
   - Get App ID and Team ID
   - Update `eas.json` submit configuration

### Android Build Setup

1. **Configure Package Name**

   ```json
   "android": {
     "package": "com.traveljoy.app"
   }
   ```

2. **Set Up Keystore**

   ```bash
   eas credentials
   ```

   - Choose Android
   - Generate new keystore (or upload existing)

3. **Configure Google Play Console**
   - Create app in Google Play Console
   - Set up service account for automated submission
   - Download JSON key file
   - Save as `google-service-account.json` (don't commit!)

## Building the App

### Development Build

For testing on physical devices:

```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### Preview Build

For internal testing:

```bash
# iOS (TestFlight)
eas build --profile preview --platform ios

# Android (APK)
eas build --profile preview --platform android
```

### Production Build

For app store submission:

```bash
# iOS
eas build --profile production --platform ios

# Android
eas build --profile production --platform android

# Both platforms
eas build --profile production --platform all
```

## Testing Builds

### iOS Testing (TestFlight)

1. **Submit to TestFlight**

   ```bash
   eas submit --platform ios
   ```

2. **Add Internal Testers**

   - Go to App Store Connect
   - Select your app → TestFlight
   - Add internal testers (up to 100)

3. **Add External Testers**
   - Create external test group
   - Add testers via email
   - Submit for Beta App Review (required)

### Android Testing

1. **Internal Testing**

   ```bash
   eas submit --platform android --track internal
   ```

2. **Closed Testing**

   - Create closed testing track in Play Console
   - Add testers via email list or Google Group
   - Share testing link

3. **Open Testing**
   - Create open testing track
   - Anyone with link can join
   - Good for public beta

## App Store Submission

### iOS App Store

1. **Prepare App Store Connect**

   - Complete app information
   - Upload screenshots (see APP_STORE_METADATA.md)
   - Set pricing and availability
   - Add app description and keywords
   - Upload privacy policy and support URLs

2. **Submit for Review**

   ```bash
   eas submit --platform ios --latest
   ```

3. **App Review Process**

   - Provide test account credentials
   - Add review notes if needed
   - Typical review time: 24-48 hours
   - Respond to any rejection feedback

4. **Release**
   - Choose manual or automatic release
   - Monitor crash reports and reviews

### Android Play Store

1. **Prepare Play Console**

   - Complete store listing
   - Upload screenshots and graphics
   - Set content rating (questionnaire)
   - Set pricing and distribution
   - Add privacy policy

2. **Submit for Review**

   ```bash
   eas submit --platform android --track production
   ```

3. **Review Process**

   - Typical review time: Few hours to 7 days
   - May require additional information
   - Address any policy violations

4. **Release**
   - Choose staged rollout (recommended)
   - Start with 20% → 50% → 100%
   - Monitor crash reports and ratings

## Post-Deployment

### Monitoring

1. **Crash Reporting**

   - Set up Sentry or similar service
   - Monitor crash-free rate
   - Fix critical issues quickly

2. **Analytics**

   - Track user engagement
   - Monitor conversion rates
   - Analyze user flows

3. **Performance**
   - Monitor app load times
   - Track API response times
   - Optimize slow screens

### Updates

1. **Version Numbering**

   - Increment `version` in app.json (e.g., 1.0.0 → 1.0.1)
   - Increment `buildNumber` (iOS) and `versionCode` (Android)

2. **Release Notes**

   - Write clear, user-friendly notes
   - Highlight new features
   - Mention bug fixes

3. **Update Process**

   ```bash
   # Update version in app.json
   # Build new version
   eas build --profile production --platform all

   # Submit to stores
   eas submit --platform all --latest
   ```

## Over-The-Air (OTA) Updates

Expo supports OTA updates for JavaScript changes (no native code changes):

```bash
# Publish update
eas update --branch production --message "Bug fixes and improvements"
```

**Note:** OTA updates work for:

- JavaScript code changes
- Asset updates
- Configuration changes

**Requires new build for:**

- Native dependency changes
- app.json native configuration changes
- Expo SDK version updates

## Rollback Strategy

### If Critical Bug Found

1. **Immediate Action**

   ```bash
   # Rollback OTA update
   eas update --branch production --message "Rollback to stable version"
   ```

2. **App Store Rollback**

   - iOS: Can't rollback, must submit new version
   - Android: Can halt rollout or deactivate release

3. **Communication**
   - Notify users via in-app message
   - Post on social media
   - Update app store description if needed

## Checklist

### Pre-Launch

- [ ] All features tested on iOS and Android
- [ ] Performance optimized (load times < 3s)
- [ ] Crash-free rate > 99%
- [ ] Privacy policy and terms published
- [ ] Support email/website set up
- [ ] Test account created for reviewers
- [ ] Screenshots and app preview prepared
- [ ] App store metadata completed
- [ ] Production backend deployed and tested
- [ ] Stripe production keys configured
- [ ] Analytics and crash reporting set up

### iOS Specific

- [ ] Apple Developer account active
- [ ] App created in App Store Connect
- [ ] Bundle identifier registered
- [ ] Certificates and provisioning profiles set up
- [ ] Push notification certificates configured
- [ ] TestFlight testing completed
- [ ] App Store review guidelines reviewed

### Android Specific

- [ ] Google Play Developer account active
- [ ] App created in Play Console
- [ ] Package name registered
- [ ] Keystore generated and backed up
- [ ] Service account for automated submission
- [ ] Content rating completed
- [ ] Closed testing completed
- [ ] Play Store policies reviewed

### Post-Launch

- [ ] Monitor crash reports daily
- [ ] Respond to user reviews
- [ ] Track key metrics (DAU, retention, conversion)
- [ ] Plan first update (bug fixes)
- [ ] Gather user feedback
- [ ] Optimize based on analytics

## Common Issues and Solutions

### Build Failures

**Issue:** iOS build fails with certificate error
**Solution:** Run `eas credentials` and regenerate certificates

**Issue:** Android build fails with keystore error
**Solution:** Ensure keystore is properly configured in EAS

### Submission Rejections

**Issue:** iOS rejected for missing privacy policy
**Solution:** Ensure privacy policy URL is accessible and complete

**Issue:** Android rejected for permissions
**Solution:** Justify all permissions in Play Console

### Performance Issues

**Issue:** Slow app startup
**Solution:** Optimize bundle size, lazy load screens

**Issue:** High memory usage
**Solution:** Optimize images, implement proper cleanup

## Support Resources

- Expo Documentation: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- EAS Submit: https://docs.expo.dev/submit/introduction/
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Play Store Policies: https://play.google.com/about/developer-content-policy/

## Contact

For deployment assistance:

- Email: dev@traveljoy.com
- Slack: #deployment channel
