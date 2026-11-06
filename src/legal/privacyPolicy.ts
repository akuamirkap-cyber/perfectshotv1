/**
 * Satu-satunya sumber teks kebijakan privasi.
 *
 * Teks ini dipakai dua tempat:
 *   1. halaman "KEBIJAKAN PRIVASI" di dalam game (src/components/PrivacyPage.tsx)
 *   2. dokumen docs/PRIVACY.md yang di-upload ke Play Console
 *      (dibuat dengan `npm run docs:privacy`, dan tes memastikan keduanya sama)
 *
 * Jangan menulis klaim yang tidak benar. Isi di bawah ini menggambarkan aplikasi
 * apa adanya: seluruh konten dibundel di dalam paket, tidak ada akun, tidak ada
 * iklan, tidak ada SDK analitik, dan tidak ada data yang dikirim ke server.
 */
export const PRIVACY_APP_NAME = 'Game Arcade Hub';
export const PRIVACY_PACKAGE_NAME = 'com.gamearcade.hub';
export const PRIVACY_CONTACT_EMAIL = 'akuamirkap2@gmail.com';
export const PRIVACY_LAST_UPDATED = '2 November 2026';
export const PRIVACY_POLICY_VERSION = '1.2.0';

export type PolicySection = {
  /** Stable id, also used as an anchor in docs/PRIVACY.md. */
  id: string;
  title: string;
  paragraphs: string[];
};

export const PRIVACY_SECTIONS_ID: PolicySection[] = [
  {
    id: 'ringkasan',
    title: 'Ringkasan',
    paragraphs: [
      `${PRIVACY_APP_NAME} adalah game arkade yang berjalan sepenuhnya di perangkatmu. Kami tidak punya akun pengguna, tidak punya server game, dan tidak mengumpulkan data pribadi apa pun.`,
      'Semua progres (skor, koin, senjata, misi, pengaturan) disimpan di penyimpanan lokal aplikasi. Kalau kamu menghapus aplikasi, data itu ikut terhapus.',
    ],
  },
  {
    id: 'data-di-perangkat',
    title: 'Data yang disimpan di perangkat',
    paragraphs: [
      'Aplikasi menyimpan data permainan berikut di penyimpanan lokal (localStorage / IndexedDB di dalam WebView, sandbox aplikasi Android):',
      '• skor tertinggi dan stage tertinggi;',
      '• jumlah koin dan diamond, senjata yang sudah dimiliki, serta senjata yang sedang dipakai;',
      '• progres misi, milestone, dan achievement;',
      '• pengaturan: volume, musik/efek suara, kecepatan permainan, tema latar, durasi animasi, bahasa aplikasi (Indonesia/Inggris), dan penanda bahwa layar CARA MAIN sudah pernah dilihat;',
      '• hitungan sesi lokal: jumlah kali aplikasi dibuka dan tanggal hari bermain (maksimal 90 hari). Angka ini dipakai game untuk menghitung statistik retensi **di perangkat saja** dan tidak dikirim ke mana pun — aplikasi tidak memuat SDK analitik.',
      '• papan skor lokal: sepuluh hasil permainan terbaikmu (skor, stage, koin, waktu) untuk layar PERINGKAT.',
      'Data ini tidak pernah dikirim keluar dari perangkat. Tidak ada backup ke cloud dan tidak ada sinkronisasi antar perangkat. Papan skor bersifat lokal: tidak ada leaderboard online, tidak ada nama pemain lain, dan tidak ada skor yang diunggah.',
    ],
  },
  {
    id: 'tidak-dikumpulkan',
    title: 'Data yang tidak kami kumpulkan',
    paragraphs: [
      'Kami tidak mengumpulkan, meminta, atau menyimpan: nama, alamat email, nomor telepon, kontak, lokasi (GPS maupun perkiraan), foto/galeri, mikrofon, kamera, ID perangkat keras, ID iklan, maupun riwayat penelusuran.',
      'Aplikasi tidak memakai iklan, tidak memakai SDK analitik, dan tidak memakai layanan pelaporan crash pihak ketiga. Tidak ada pelacakan lintas aplikasi.',
      'Aplikasi tidak memiliki fitur sosial: tidak ada chat, tidak ada daftar teman, dan tidak ada unggah konten.',
    ],
  },
  {
    id: 'izin',
    title: 'Izin aplikasi',
    paragraphs: [
      'APK/AAB hanya meminta izin INTERNET. Izin ini dibawa oleh WebView yang menampilkan game, sedangkan seluruh isi game (gambar, suara, font) sudah dibundel di dalam paket — jadi game tetap bisa dimainkan tanpa koneksi internet dan tidak ada data yang dikirim ke server kami.',
      'Aplikasi tidak meminta izin kamera, mikrofon, kontak, lokasi, penyimpanan, SMS, telepon, maupun akses ke akun.',
    ],
  },
  {
    id: 'anak',
    title: 'Anak-anak',
    paragraphs: [
      'Game ini ramah untuk segala usia dan tidak mengandung iklan, pembelian dalam aplikasi, chat, atau tautan keluar. Karena tidak ada data pribadi yang dikumpulkan sama sekali, aplikasi tidak memproses data anak-anak di bawah 13 tahun.',
    ],
  },
  {
    id: 'pihak-ketiga',
    title: 'Layanan pihak ketiga',
    paragraphs: [
      'Versi ini tidak memuat SDK pihak ketiga yang mengirim data (tidak ada AdMob, Firebase, Google Analytics, Facebook SDK, atau crash reporter).',
      'Game memakai pustaka open source (React, Capacitor, dan pustaka kecil lainnya) yang berjalan di dalam paket aplikasi dan tidak mengirim data ke mana pun.',
    ],
  },
  {
    id: 'keamanan',
    title: 'Keamanan & penyimpanan',
    paragraphs: [
      'Data permainan berada di dalam sandbox aplikasi Android, sehingga aplikasi lain tidak bisa membacanya. Data itu juga bisa ikut ter-backup oleh fitur backup Android milikmu sendiri (kebijakan Google, bukan kami).',
      'Untuk menghapus seluruh data: buka Setelan Android → Aplikasi → Game Arcade Hub → Penyimpanan → Hapus data, atau uninstall aplikasi.',
    ],
  },
  {
    id: 'hak',
    title: 'Hak kamu',
    paragraphs: [
      'Karena kami tidak menyimpan data apa pun di server, tidak ada data yang bisa kami akses, bagikan, atau jual. Permintaan penghapusan data cukup dilakukan di perangkat seperti pada bagian sebelumnya.',
      'Kalau kamu punya pertanyaan tentang privasi, kirim email ke alamat di bagian Kontak.',
    ],
  },
  {
    id: 'perubahan',
    title: 'Perubahan kebijakan',
    paragraphs: [
      `Versi kebijakan ini: ${PRIVACY_POLICY_VERSION} (diperbarui ${PRIVACY_LAST_UPDATED}). Kalau di masa depan aplikasi menambahkan fitur yang mengirim data (misalnya leaderboard online atau analitik), kebijakan ini akan diperbarui lebih dulu dan tanggal di atas ikut berubah, sebelum versi barunya dirilis.`,
    ],
  },
  {
    id: 'kontak',
    title: 'Kontak',
    paragraphs: [
      `Email: ${PRIVACY_CONTACT_EMAIL}`,
      `Aplikasi: ${PRIVACY_APP_NAME} (${PRIVACY_PACKAGE_NAME})`,
    ],
  },
];

export const PRIVACY_SECTIONS_EN: PolicySection[] = [
  {
    id: 'summary',
    title: 'Summary',
    paragraphs: [
      `${PRIVACY_APP_NAME} is an arcade game that runs entirely on your device. There are no user accounts, no game servers, and no personal data is collected.`,
      'All progress (score, coins, weapons, quests, settings) is stored in the app’s local storage. Uninstalling the app deletes that data.',
    ],
  },
  {
    id: 'on-device',
    title: 'Data stored on your device',
    paragraphs: [
      'The app keeps the following game data in local storage (localStorage / IndexedDB inside the WebView, in the Android app sandbox):',
      '• best score and highest stage;',
      '• coin and diamond balances, owned weapons, and the equipped weapon;',
      '• quest, milestone and achievement progress;',
      '• settings: volume, music/sound effects, game speed, background theme, animation speed, app language (Indonesian/English), and a flag that the HOW TO PLAY screen has been seen;',
      '• local session counters: how many times the app was opened and which days it was played (up to 90 days). The game uses these to compute retention statistics **on the device only**; there is no analytics SDK and nothing is transmitted.',
      '• local leaderboard: your ten best runs (score, stage, coins, time) for the RANKING screen.',
      'This data never leaves the device. There is no cloud backup and no sync between devices. The leaderboard is local: there is no online board, no other players\' names, and no score is ever uploaded.',
    ],
  },
  {
    id: 'not-collected',
    title: 'Data we do not collect',
    paragraphs: [
      'We do not collect or store names, email addresses, phone numbers, contacts, location (GPS or approximate), photos/gallery, microphone, camera, device identifiers, advertising IDs, or browsing history.',
      'The app shows no ads, contains no analytics SDK, and uses no third-party crash reporting. There is no cross-app tracking.',
      'The app has no social features: no chat, no friends list, and no user-generated content uploads.',
    ],
  },
  {
    id: 'permissions',
    title: 'App permissions',
    paragraphs: [
      'The APK/AAB requests only the INTERNET permission. The WebView that hosts the game carries it, while every game asset (images, sounds, fonts) ships inside the package — so the game runs offline and no data is sent to our servers.',
      'The app does not request camera, microphone, contacts, location, storage, SMS, phone, or account permissions.',
    ],
  },
  {
    id: 'children',
    title: 'Children',
    paragraphs: [
      'The game is suitable for all ages and contains no ads, no in-app purchases, no chat, and no external links. Because no personal data is collected at all, the app does not process data from children under 13.',
    ],
  },
  {
    id: 'third-parties',
    title: 'Third-party services',
    paragraphs: [
      'This version bundles no third-party SDK that transmits data (no AdMob, Firebase, Google Analytics, Facebook SDK, or crash reporter).',
      'The game uses open-source libraries (React, Capacitor, and a few small utilities) that run inside the app package and do not send data anywhere.',
    ],
  },
  {
    id: 'security',
    title: 'Security & storage',
    paragraphs: [
      'Game data lives inside the Android app sandbox, so other apps cannot read it. It may also be included in Android’s own device backup, if you have that enabled (that is Google’s policy, not ours).',
      'To delete all data: Android Settings → Apps → Game Arcade Hub → Storage → Clear data, or uninstall the app.',
    ],
  },
  {
    id: 'rights',
    title: 'Your rights',
    paragraphs: [
      'Because we store nothing on a server, there is no data for us to access, share, or sell. A deletion request is simply the on-device step described above.',
      'For any privacy question, email the address in the Contact section.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    paragraphs: [
      `Policy version ${PRIVACY_POLICY_VERSION} (updated ${PRIVACY_LAST_UPDATED}). If a future version of the app adds something that transmits data (for example an online leaderboard or analytics), this policy will be updated — and the date above changed — before that version ships.`,
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    paragraphs: [
      `Email: ${PRIVACY_CONTACT_EMAIL}`,
      `App: ${PRIVACY_APP_NAME} (${PRIVACY_PACKAGE_NAME})`,
    ],
  },
];

/** Markdown untuk docs/PRIVACY.md — dipakai apa adanya di Play Console. */
export function privacyPolicyMarkdown(): string {
  return [
    `# Kebijakan Privasi — ${PRIVACY_APP_NAME}`,
    '',
    `**Privacy Policy — ${PRIVACY_APP_NAME}**`,
    '',
    `Terakhir diperbarui / Last updated: **${PRIVACY_LAST_UPDATED}** · Versi ${PRIVACY_POLICY_VERSION}`,
    '',
    `Nama paket / Package name: \`${PRIVACY_PACKAGE_NAME}\` · Kontak / Contact: <${PRIVACY_CONTACT_EMAIL}>`,
    '',
    '> Dokumen ini dibuat dari `src/legal/privacyPolicy.ts` (`npm run docs:privacy`).',
    '> Halaman kebijakan privasi di dalam aplikasi memakai teks yang sama, jadi',
    '> keduanya tidak bisa berbeda.',
    '',
    '---',
    '',
    ...PRIVACY_SECTIONS_ID.flatMap((section) => [
      `## ${section.title}`,
      '',
      ...section.paragraphs.flatMap((paragraph) => [paragraph, '']),
    ]),
    '---',
    '',
    '# English',
    '',
    ...PRIVACY_SECTIONS_EN.flatMap((section) => [
      `## ${section.title}`,
      '',
      ...section.paragraphs.flatMap((paragraph) => [paragraph, '']),
    ]),
    '---',
    '',
    '## Ringkasan untuk Play Console / Play Console summary',
    '',
    '- **Data collected:** none.',
    '- **Data shared:** none.',
    '- **Data processed ephemerally:** none.',
    '- **Account creation:** not available (no accounts).',
    '- **Ads:** none.',
    '- **In-app purchases:** none.',
    `- **Privacy policy URL:** unggah dokumen ini ke URL publik (mis. GitHub Pages / Google Sites), lalu tempel URL-nya di Play Console. Kontak: ${PRIVACY_CONTACT_EMAIL}`,
    '',
  ].join('\n');
}
