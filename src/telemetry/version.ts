/**
 * Versi aplikasi yang ikut terkirim di setiap event telemetri.
 *
 * Nilainya disuntik saat build oleh `vite.config.ts` dari
 * `android/version.properties` — sumber yang sama dengan versionName di APK/AAB —
 * jadi sebuah event tidak bisa mengaku versi yang berbeda dari build-nya.
 * Di lingkungan tes (tsx, tanpa Vite) nilainya "dev".
 */
declare const __APP_VERSION__: string | undefined;

export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev';
