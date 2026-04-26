# Mimir - Paper Trading Simulator

A React Native Expo application for paper trading in the Indian stock market. Built with TypeScript, React Navigation, and modern best practices.

## Overview

Mimir is a learning platform that allows users to practice trading stocks in a simulated environment without risking real money. It provides real-time market data, portfolio tracking, and a user-friendly interface for executing trades.

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Native Stack + Bottom Tabs)
- **State Management**: React Hooks (with planned Redux integration)
- **Storage**: AsyncStorage (local) + Secure Store (sensitive data)
- **Code Quality**: ESLint + Prettier + TypeScript

## Project Structure

```
src/
├── navigation/
│   ├── RootNavigator.tsx        # Main navigation router
│   ├── AuthStack.tsx             # Authentication screens
│   └── MainTabs.tsx              # Main app tabs
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── SignupScreen.tsx
│   ├── watchlist/
│   │   └── WatchlistScreen.tsx
│   ├── portfolio/
│   │   └── PortfolioScreen.tsx
│   ├── trade/
│   │   └── TradeScreen.tsx
│   └── profile/
│       └── ProfileScreen.tsx
├── constants/
│   ├── colors.ts                 # Color palette (dark mode ready)
│   └── layout.ts                 # Spacing, sizing, typography
├── types/
│   └── navigation.ts             # TypeScript type definitions
├── hooks/
│   └── useAuth.ts                # Authentication hook
└── App.tsx                        # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS or Android device/simulator

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd mimir
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm start
```

5. Run on device/simulator:
   - **iOS**: Press `i`
   - **Android**: Press `a`
   - **Web**: Press `w`

## Available Scripts

```bash
# Start development server
npm start

# Run on Android device/emulator
npm run android

# Run on iOS simulator
npm run ios

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check

# Format code with Prettier
npm run format

# Check if code is formatted correctly
npm run format:check
```

## Navigation Structure

### Authentication Flow
- **LoginScreen**: User login with email and password
- **SignupScreen**: New user registration

### Main Application (Bottom Tabs)
1. **Watchlist** (default home): Favorite stocks and market data
2. **Portfolio**: Holdings, performance, and gains/losses
3. **Trade**: Buy/sell orders, market and limit orders
4. **Profile**: User account, settings, and preferences

## Configuration

### Expo Configuration (`app.json`)
- Project name: Mimir
- Slug: mimir
- Version: 0.1.0
- Orientation: Portrait
- New Architecture: Enabled
- Owner: andysenclave

### Environment Variables
Create `.env` file based on `.env.example`:
```
HEIMDAL_API_URL=http://localhost:3000
```

## Code Quality

### ESLint
Configuration extends `eslint-config-expo` with TypeScript rules.

```bash
npm run lint       # Check for linting issues
npm run lint:fix   # Fix linting issues automatically
```

### Prettier
Code formatter configuration in `.prettierrc`:
- Print Width: 100
- Tab Width: 2
- Trailing Comma: All
- Single Quotes: true
- Semicolons: true

```bash
npm run format       # Format all code
npm run format:check # Check formatting
```

### TypeScript
Strict mode enabled with path aliases for clean imports:
```typescript
// Use path aliases
import { colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

// Instead of relative paths
import { colors } from '../constants/colors';
```

## Features

### Current
- User authentication (mock/placeholder)
- Bottom tab navigation
- Dark theme UI
- TypeScript support
- Code quality tools (ESLint, Prettier)
- Deep linking setup

### Planned
- Real stock market data integration (Heimdal API)
- Portfolio tracking with real-time P&L
- Advanced order types (Market, Limit, Stop-Loss)
- Watchlist management
- User account settings
- Transaction history
- Performance analytics

## API Integration

The app is configured to connect with the Heimdal backend API. See `HEIMDAL_API_URL` in `.env.example`.

Integration points planned for:
- User authentication
- Stock data and quotes
- Order execution
- Portfolio data
- Historical data and charts

## Development

### Adding a New Screen

1. Create screen file in `src/screens/[feature]/[ScreenName].tsx`
2. Import navigation types from `@/types/navigation`
3. Use constants from `@/constants/colors` and `@/constants/layout`
4. Add to appropriate navigation stack

### Adding a New Hook

1. Create hook file in `src/hooks/use[Hook].ts`
2. Export hook function with proper TypeScript types
3. Use in screens and components

### Styling

All styles use TypeScript StyleSheet for type safety. Colors and spacing use constants:

```typescript
import { colors, themeColors } from '@/constants/colors';
import { layout } from '@/constants/layout';

const styles = StyleSheet.create({
  container: {
    backgroundColor: themeColors.dark.background,
    paddingHorizontal: layout.spacing.lg,
  },
});
```

## Testing

Testing setup to be added. Recommended: Jest + React Native Testing Library

## Building

### Development Build
```bash
eas build --platform android --profile development
eas build --platform ios --profile development
```

### Preview Build
```bash
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

### Production Build
```bash
eas build --platform android
eas build --platform ios
```

## Deployment

Production builds are managed through EAS (Expo Application Services). See `eas.json` for build profiles.

## Contributing

1. Create a feature branch from `develop`
2. Follow the code structure and style guidelines
3. Run linting and formatting before committing
4. Create a pull request to `develop`

## License

See LICENSE file for details.

## Support

For issues or questions, contact the development team.