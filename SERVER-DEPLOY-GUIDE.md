# SSHappy - Server Deployment Guide

This guide explains how to deploy the SSHappy React Native app using GitHub Actions and Expo Application Services (EAS).

## Prerequisites

### 1. Expo Account & EAS CLI
```bash
npm install -g eas-cli
eas login
```

### 2. GitHub Repository Secrets

Configure these secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

#### Required Secrets:
- `EXPO_TOKEN` - Your Expo access token (get from https://expo.dev/accounts/[account]/settings/access-tokens)

#### Optional Secrets (for production builds):
- `ANDROID_KEYSTORE` - Base64-encoded Android keystore file
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEY_ALIAS` - Key alias
- `ANDROID_KEY_PASSWORD` - Key password

### 3. Server Setup (Your VPS)

The server should have:
- Ubuntu 20.04+ or Debian 11+
- Docker & Docker Compose installed
- Tailscale configured (optional, for private network access)
- SSH access enabled

## Deployment Workflow

### Automatic Builds (CI/CD)

The repository is configured with GitHub Actions to automatically build when you push code:

1. **Push to `main` or `develop` branch:**
   ```bash
   git push origin main
   ```

2. **GitHub Actions workflow runs:**
   - Installs dependencies
   - Runs tests (`npm test`)
   - Type checks TypeScript (`tsc --noEmit`)
   - Builds preview APK with EAS

3. **Download build:**
   - Go to GitHub Actions tab
   - Click on the latest workflow run
   - Download the build artifact (or get from EAS dashboard)

### Manual Builds

#### Development Build (for testing):
```bash
cd server-manager
eas build --platform android --profile development
```

#### Preview Build (internal testing APK):
```bash
eas build --platform android --profile preview
```

#### Production Build (Google Play AAB):
```bash
eas build --platform android --profile production
```

## Build Profiles (eas.json)

### Development
- Development client enabled
- Internal distribution
- Debug APK
- Fast iteration, includes dev tools

### Preview
- Internal distribution
- Release APK
- For testing before production
- Smaller file size than development

### Production
- Google Play distribution
- AAB (Android App Bundle)
- Optimized and minified
- Ready for Play Store submission

## Environment Variables

The app uses these environment variables (configure in Expo dashboard or `eas.json`):

- `HEALTHCHECKS_API_KEY` - For server health monitoring integration (optional)
- `SENTRY_DSN` - For error tracking (optional)

## Installation on Android Device

### Via APK (Development/Preview):
1. Download APK from GitHub Actions artifacts or EAS dashboard
2. Transfer to Android device
3. Enable "Install from Unknown Sources" in Android settings
4. Install the APK

### Via Google Play (Production):
1. Build production AAB: `eas build --platform android --profile production`
2. Download AAB from EAS dashboard
3. Submit to Google Play Console
4. Follow Google Play review process

## Security Notes

### Credential Storage
- All server credentials stored in Android Keystore (hardware-backed)
- SSH private keys encrypted with `expo-secure-store`
- No credentials stored in plain text

### Network Security
- TLS/SSL enforced for all API calls
- SSH connections use industry-standard crypto
- Optional: Use Tailscale for zero-trust network access

### Permissions
The app requests these Android permissions:
- `INTERNET` - SSH connections and API calls
- `VIBRATE` - Haptic feedback for actions
- `RECEIVE_BOOT_COMPLETED` - Background monitoring service
- `FOREGROUND_SERVICE` - Health check notifications

## Monitoring & Health Checks

The app integrates with Healthchecks.io for server monitoring:

1. Create account at https://healthchecks.io
2. Get API key from account settings
3. Add to GitHub secrets as `HEALTHCHECKS_API_KEY`
4. Configure checks in app Settings screen

## Troubleshooting

### Build Fails
- Check GitHub Actions logs for specific errors
- Verify all secrets are correctly configured
- Ensure `eas.json` profiles match your requirements

### App Crashes on Launch
- Check Expo logs: `npx expo start`
- Verify all native dependencies are properly linked
- Clear cache: `npm start -- --clear`

### SSH Connection Issues
- Verify server SSH is running: `sudo systemctl status sshd`
- Check firewall rules allow SSH (port 22)
- Test connection manually: `ssh user@server`
- Ensure credentials are correct in app

### Health Checks Not Working
- Verify `HEALTHCHECKS_API_KEY` is set
- Check internet connectivity on device
- Ensure background tasks are enabled (Settings → Battery → Background restrictions)

## Updating the App

### Over-the-Air (OTA) Updates
Expo supports OTA updates for JavaScript/React changes:

```bash
eas update --branch production
```

Users will get updates automatically on next app launch.

### Native Updates (requires new build)
Changes to native code require a new build:
- Updated dependencies in `package.json`
- Changes to `app.json` configuration
- New native modules added

## Support

For issues or questions:
- GitHub Issues: https://github.com/dutchiono/sshappy/issues
- Expo Forums: https://forums.expo.dev
- React Native Docs: https://reactnative.dev

## Architecture Overview

```
SSHappy App
├── React Native UI (TypeScript)
├── Services Layer
│   ├── CredentialService (expo-secure-store)
│   ├── SSHService (react-native-ssh-sftp)
│   ├── ActionService (quick actions engine)
│   └── MonitoringService (health checks)
├── Navigation (React Navigation)
├── Background Tasks (expo-task-manager)
└── Push Notifications (expo-notifications)
```

## Next Steps

1. **Configure GitHub Secrets** (see Prerequisites above)
2. **Push code to trigger first build**
3. **Download and test preview build**
4. **Configure server monitoring** (optional)
5. **Build production and submit to Play Store** (when ready)

---

Built with React Native, Expo, and ❤️ by Dutch Iono
