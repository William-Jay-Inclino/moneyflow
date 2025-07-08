# MoneyFlow Mobile App

A modern React Native application for expense tracking and financial management.

## Features

- 🔐 User authentication (Login/Register)
- 💰 Income and expense tracking
- 📊 Financial dashboard with overview
- 🏷️ Category management
- 📱 Modern UI with React Native Paper
- 🎨 Beautiful Material Design 3
- 📦 State management with Zustand
- 🔗 API integration ready
- 🚀 TypeScript support
- 🎯 Navigation with React Navigation

## Tech Stack

- **React Native** - Mobile app framework
- **TypeScript** - Type safety
- **React Navigation** - Navigation
- **React Native Paper** - UI components (Material Design 3)
- **Zustand** - State management
- **Axios** - API calls
- **React Native Vector Icons** - Icons
- **React Native Reanimated** - Animations

## Prerequisites

- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. iOS Setup (macOS only)

```bash
cd ios && pod install && cd ..
```

### 3. Android Setup

Make sure Android Studio is installed and configured with:
- Android SDK
- Android SDK Platform-Tools
- Android SDK Build-Tools
- Android Emulator

### 4. Configure API Endpoint

Update the API base URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'your-api-endpoint'; // Replace with your actual API URL
```

### 5. Run the App

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

### 6. Start Metro Bundler

```bash
npm start
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── navigation/          # Navigation configuration
├── screens/            # App screens
│   ├── auth/          # Authentication screens
│   └── main/          # Main app screens
├── services/          # API services
├── store/             # State management
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── theme.ts           # Theme configuration
└── App.tsx           # Main app component
```

## Available Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript check
- `npm test` - Run tests

## API Integration

The app is configured to work with the MoneyFlow API. Make sure your backend API is running and accessible.

### API Endpoints Expected:
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile
- `GET /user-expense` - Get transactions
- `POST /user-expense` - Create transaction
- `GET /user-category` - Get categories
- `POST /user-category` - Create category

## State Management

The app uses Zustand for state management with two main stores:

- **AuthStore**: Manages authentication state
- **TransactionStore**: Manages transactions and categories

## Customization

### Theme
Modify `src/theme.ts` to customize colors, typography, and spacing.

### Icons
The app uses React Native Vector Icons. You can customize icons in the navigation and screens.

### UI Components
All UI components use React Native Paper for consistent Material Design 3 styling.

## Development Tips

1. **Hot Reload**: Changes to JS files will hot reload automatically
2. **TypeScript**: Full TypeScript support with proper typing
3. **ESLint**: Code linting is configured
4. **Prettier**: Code formatting is set up
5. **Path Mapping**: Use `@/` for absolute imports from src

## Troubleshooting

### Common Issues:

1. **Metro bundler issues**: Try `npm start -- --reset-cache`
2. **Android build issues**: Clean project with `cd android && ./gradlew clean`
3. **iOS build issues**: Clean build folder in Xcode
4. **Package conflicts**: Delete `node_modules` and reinstall

### Android-specific:

1. Make sure `ANDROID_HOME` environment variable is set
2. Ensure Java 11 is installed
3. Check Android SDK tools are installed

### iOS-specific:

1. Make sure Xcode is installed
2. Run `cd ios && pod install` after installing new packages
3. Check iOS deployment target in Xcode

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
