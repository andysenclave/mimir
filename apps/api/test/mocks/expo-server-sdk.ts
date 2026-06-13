// Test-only stub for `expo-server-sdk`.
//
// The real package ships strict ESM (`import assert from 'node:assert'`), which
// Jest's default `transformIgnorePatterns` (skip all node_modules) refuses to
// transform — so any spec whose import graph transitively reaches
// NotificationDispatchService (e.g. trading.service.spec via the order-fill
// notification processor) fails to even load.
//
// Mapped in via package.json#jest.moduleNameMapper. Production code imports the
// real SDK unchanged; this file exists only so unit tests that never exercise
// push delivery can load their module graph. The surface mirrors exactly what
// notification-dispatch.service.ts touches.

export class Expo {
  static isExpoPushToken(token: unknown): boolean {
    return typeof token === 'string' && token.startsWith('ExponentPushToken[');
  }

  chunkPushNotifications<T>(messages: T[]): T[][] {
    return messages.length > 0 ? [messages] : [];
  }

  async sendPushNotificationsAsync(_chunk: unknown[]): Promise<unknown[]> {
    return [];
  }
}

export default Expo;
