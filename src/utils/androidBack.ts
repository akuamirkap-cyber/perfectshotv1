import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { pushBackHandler, runBackHandlers, type BackHandler } from './backStack';

/**
 * Native plumbing for the Android back button (`@capacitor/app`).
 *
 * The listeners are loaded lazily so the web build never pays for them, and
 * every call is a no-op outside a Capacitor shell (browser, tests).
 */
export function isNativeShell(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Register a screen's back handler for as long as `active` is true. The handler
 * receives no arguments and returns `true` when it consumed the press.
 */
export function useAndroidBack(handler: BackHandler, active = true): void {
  const latest = useRef(handler);
  latest.current = handler;
  useEffect(() => {
    if (!active) return;
    return pushBackHandler(() => latest.current());
  }, [active]);
}

/**
 * Attach the hardware listener once. Unhandled presses call `onUnhandled`
 * (normally "leave the app").
 */
export async function installAndroidBack(onUnhandled: () => void): Promise<() => void> {
  if (!isNativeShell()) return () => {};
  const { App } = await import('@capacitor/app');
  const listener = await App.addListener('backButton', () => {
    if (runBackHandlers()) return;
    onUnhandled();
  });
  return () => {
    void listener.remove();
  };
}

/** Close the app (Android only). */
export async function exitAndroidApp(): Promise<void> {
  if (!isNativeShell()) return;
  const { App } = await import('@capacitor/app');
  await App.exitApp();
}
