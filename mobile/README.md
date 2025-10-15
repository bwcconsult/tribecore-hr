# TribeCore ATS Mobile App (React Native)

Enterprise-grade mobile recruiting app for iOS and Android.

## 📱 Features

### For Recruiters
- ✅ View and manage applications on-the-go
- ✅ Review candidate profiles
- ✅ Schedule interviews
- ✅ Move candidates through pipeline
- ✅ Submit interview feedback
- ✅ Push notifications for key events
- ✅ Offline mode with sync

### For Hiring Managers
- ✅ Review pending approvals
- ✅ View candidate scorecards
- ✅ Approve/reject requisitions
- ✅ View team interviews
- ✅ Real-time notifications

### For Candidates
- ✅ Track application status
- ✅ View interview schedule
- ✅ Upload documents
- ✅ Chat with recruiters
- ✅ Receive job alerts

## 🛠️ Tech Stack

- **Framework**: React Native (Expo)
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **API**: Axios with JWT authentication
- **Storage**: AsyncStorage + SQLite (offline)
- **Push Notifications**: Firebase Cloud Messaging
- **Biometric Auth**: react-native-biometrics
- **Camera**: expo-camera (document scanning)

## 📦 Installation

```bash
# Install dependencies
cd mobile
npm install

# iOS
npx pod-install
npm run ios

# Android
npm run android

# Start Metro bundler
npm start
```

## 🏗️ Project Structure

```
mobile/
├── src/
│   ├── screens/
│   │   ├── applications/
│   │   │   ├── ApplicationListScreen.tsx
│   │   │   ├── ApplicationDetailScreen.tsx
│   │   │   └── PipelineKanbanScreen.tsx
│   │   ├── interviews/
│   │   │   ├── InterviewListScreen.tsx
│   │   │   ├── InterviewDetailScreen.tsx
│   │   │   └── ScorecardScreen.tsx
│   │   ├── candidates/
│   │   │   ├── CandidateSearchScreen.tsx
│   │   │   └── CandidateProfileScreen.tsx
│   │   ├── approvals/
│   │   │   └── ApprovalsScreen.tsx
│   │   └── auth/
│   │       ├── LoginScreen.tsx
│   │       └── BiometricAuthScreen.tsx
│   ├── components/
│   │   ├── ApplicationCard.tsx
│   │   ├── CandidateCard.tsx
│   │   ├── InterviewCard.tsx
│   │   └── PipelineColumn.tsx
│   ├── services/
│   │   ├── api.service.ts
│   │   ├── storage.service.ts
│   │   └── notification.service.ts
│   ├── store/
│   │   ├── slices/
│   │   │   ├── applicationsSlice.ts
│   │   │   ├── interviewsSlice.ts
│   │   │   └── authSlice.ts
│   │   └── store.ts
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── AuthNavigator.tsx
│   └── utils/
│       ├── theme.ts
│       └── constants.ts
├── app.json
├── package.json
└── tsconfig.json
```

## 🎨 Key Screens

### Application List
```typescript
import React, { useEffect } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApplications } from '../store/slices/applicationsSlice';

export function ApplicationListScreen() {
  const dispatch = useDispatch();
  const { applications, loading } = useSelector(state => state.applications);

  useEffect(() => {
    dispatch(fetchApplications());
  }, []);

  return (
    <FlatList
      data={applications}
      renderItem={({ item }) => <ApplicationCard application={item} />}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={() => dispatch(fetchApplications())} />
      }
    />
  );
}
```

### Pipeline Kanban
```typescript
import React from 'react';
import { ScrollView, View } from 'react-native';
import { DragDropContext, Droppable, Draggable } from 'react-native-drag-drop';

export function PipelineKanbanScreen() {
  const stages = ['NEW', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED'];
  
  return (
    <ScrollView horizontal>
      {stages.map(stage => (
        <PipelineColumn key={stage} stage={stage} />
      ))}
    </ScrollView>
  );
}
```

## 🔔 Push Notifications

```typescript
import messaging from '@react-native-firebase/messaging';

// Request permission
const authStatus = await messaging().requestPermission();

// Get FCM token
const token = await messaging().getToken();

// Listen for messages
messaging().onMessage(async remoteMessage => {
  console.log('Notification:', remoteMessage);
});

// Background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background notification:', remoteMessage);
});
```

## 📱 Deep Links

```typescript
// Handle deep links
Linking.addEventListener('url', ({ url }) => {
  // tribecore://application/app_123
  // tribecore://interview/int_456
  const route = parseDeepLink(url);
  navigation.navigate(route.screen, route.params);
});
```

## 🔐 Biometric Authentication

```typescript
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

// Check if biometrics available
const { available, biometryType } = await rnBiometrics.isSensorAvailable();

// Authenticate
const { success } = await rnBiometrics.simplePrompt({
  promptMessage: 'Confirm your identity'
});
```

## 📴 Offline Mode

```typescript
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Detect connectivity
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    syncOfflineData();
  }
});

// Queue actions offline
async function queueAction(action) {
  const queue = await AsyncStorage.getItem('offline_queue');
  const actions = queue ? JSON.parse(queue) : [];
  actions.push(action);
  await AsyncStorage.setItem('offline_queue', JSON.stringify(actions));
}

// Sync when back online
async function syncOfflineData() {
  const queue = await AsyncStorage.getItem('offline_queue');
  if (queue) {
    const actions = JSON.parse(queue);
    for (const action of actions) {
      await api.execute(action);
    }
    await AsyncStorage.removeItem('offline_queue');
  }
}
```

## 🚀 Deployment

### iOS (TestFlight)
```bash
# Build
eas build --platform ios

# Submit to TestFlight
eas submit --platform ios
```

### Android (Google Play)
```bash
# Build
eas build --platform android

# Submit to Play Store
eas submit --platform android
```

## 📊 Analytics

```typescript
import analytics from '@react-native-firebase/analytics';

// Track screen
await analytics().logScreenView({
  screen_name: 'ApplicationList',
  screen_class: 'ApplicationListScreen',
});

// Track event
await analytics().logEvent('application_moved', {
  from_stage: 'SCREENING',
  to_stage: 'INTERVIEW',
});
```

## 🔄 Code Push (OTA Updates)

```bash
# Install CodePush
npm install react-native-code-push

# Release update
appcenter codepush release-react TribeCore/iOS production

# Users get instant updates without App Store review
```

## 📱 App Store Listing

### iOS App Store
- **Name**: TribeCore - Recruitment ATS
- **Category**: Business
- **Price**: Free (with in-app subscriptions)
- **Screenshots**: 6.5" iPhone, 12.9" iPad
- **Keywords**: recruiting, ATS, hiring, HR, jobs

### Google Play Store
- **Name**: TribeCore - Recruitment ATS
- **Category**: Business
- **Content Rating**: Everyone
- **Screenshots**: Phone, 7" Tablet, 10" Tablet

## 🎯 Future Enhancements

- [ ] Video interview recording
- [ ] Document scanning with OCR
- [ ] Voice commands (Siri/Google Assistant)
- [ ] Smartwatch app (Apple Watch, Wear OS)
- [ ] AR business card scanner
- [ ] Offline-first architecture with CRDTs

---

**Status**: ✅ Architecture & documentation complete. Ready for implementation.
