# Mobile App Google OAuth Integration Guide

## Overview
This guide explains how to integrate Google OAuth authentication with your mobile app using the MoneyFlow API.

## Mobile App Flow

### 1. Install Google SDK
**For React Native:**
```bash
npm install @react-native-google-signin/google-signin
```

**For Flutter:**
```yaml
dependencies:
  google_sign_in: ^6.1.5
```

### 2. Configure Google OAuth

#### Android Configuration
1. Add your SHA-1 fingerprint to Firebase console
2. Download `google-services.json` and place in `android/app/`
3. Add to `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

#### iOS Configuration
1. Download `GoogleService-Info.plist` and add to iOS project
2. Add URL scheme to Info.plist

### 3. Implement Google Sign-In

#### React Native Example:
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID', // From Firebase console
  offlineAccess: true,
});

// Sign in function
const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    // Send to your API
    const response = await fetch('http://your-api.com/moneyflow/api/users/register/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userInfo.user.email,
        google_id: userInfo.user.id,
        name: userInfo.user.name,
        profile_picture: userInfo.user.photo,
        id_token: userInfo.idToken,
      }),
    });
    
    const user = await response.json();
    console.log('User registered/logged in:', user);
    
  } catch (error) {
    console.error('Google Sign-In error:', error);
  }
};
```

#### Flutter Example:
```dart
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;

final GoogleSignIn _googleSignIn = GoogleSignIn(
  scopes: ['email', 'profile'],
);

Future<void> signInWithGoogle() async {
  try {
    final GoogleSignInAccount? account = await _googleSignIn.signIn();
    if (account != null) {
      final GoogleSignInAuthentication auth = await account.authentication;
      
      // Send to your API
      final response = await http.post(
        Uri.parse('http://your-api.com/moneyflow/api/users/register/google'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': account.email,
          'google_id': account.id,
          'name': account.displayName,
          'profile_picture': account.photoUrl,
          'id_token': auth.idToken,
        }),
      );
      
      if (response.statusCode == 200) {
        final user = jsonDecode(response.body);
        print('User registered/logged in: $user');
      }
    }
  } catch (error) {
    print('Google Sign-In error: $error');
  }
}
```

## API Endpoint

### POST /moneyflow/api/users/register/google

**Request Body:**
```json
{
  "email": "user@example.com",
  "google_id": "1234567890abcdef",
  "name": "John Doe",
  "profile_picture": "https://lh3.googleusercontent.com/a/profile-pic",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "username": "user_123456",
  "is_active": true,
  "registered_at": "2025-07-08T09:00:00.000Z"
}
```

## Key Features

✅ **Mobile-Friendly**: Returns 200 OK for both new registrations and existing users
✅ **Auto-Generated Usernames**: Creates unique usernames from email addresses
✅ **Duplicate Handling**: Safely handles existing users without errors
✅ **Profile Pictures**: Supports Google profile picture URLs
✅ **ID Token Support**: Can verify Google ID tokens for additional security

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **Token Validation**: Consider validating Google ID tokens server-side
3. **Rate Limiting**: Implement rate limiting on authentication endpoints
4. **User Data**: Store minimal necessary user data

## Testing

You can test the endpoint using curl:
```bash
curl -X POST http://localhost:7000/moneyflow/api/users/register/google \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "google_id": "test123",
    "name": "Test User"
  }'
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200 OK`: User registered/logged in successfully
- `400 Bad Request`: Invalid request data
- `500 Internal Server Error`: Server error

Your mobile app should handle these responses gracefully and provide user feedback.
