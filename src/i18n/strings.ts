/**
 * Kamus teks Game A (GUNHIT) — Indonesia → Inggris.
 *
 * Kuncinya adalah teks Indonesia apa adanya, jadi pemakaiannya di komponen
 * cukup membungkus teks yang sudah ada: `{tr(language, 'Kembali')}`. Pendekatan
 * ini dipilih supaya tidak ada 300 kunci karangan yang harus dihafal, dan supaya
 * teks Indonesia tetap terbaca langsung di sumbernya.
 *
 * Aturan: setiap entri WAJIB berbeda dari kuncinya (tidak boleh "terjemahan"
 * yang sama), dan `tests/i18n-coverage.test.ts` memastikan tidak ada teks
 * Indonesia di Game A yang belum punya terjemahan.
 */
import type { Language } from './language';
import { DATA_EN } from './dataEn';
import { WEAPON_EN } from './weaponEn';

/** Indonesia → Inggris (UI dulu; data digabung di bawah). */
const CORE_EN: Record<string, string> = {
  // ---------------------------------------------------------------- umum
  MATI: 'OFF',
  AKTIF: 'ON',
  BATU: 'STONE',
  'TOP RUNS · OFFLINE': 'TOP RUNS · OFFLINE',
  'RUN #': 'RUN #',
  '5 Achievement': '5 Achievements',
  '10 Achievement': '10 Achievements',
  '20 Achievement': '20 Achievements',
  'Peluncur ayam karet klasik': 'The classic rubber-chicken launcher',
  'Ayam pompa berayun': 'A pump chicken on a spring',
  'Senjata UMUM random': 'A random COMMON weapon',
  'Senjata EPIC random': 'A random EPIC weapon',
  'Senjata LEGENDARIS random': 'A random LEGENDARY weapon',
  'Gentong': 'Jar',
  'Perisai': 'Shield',
  'Goblin': 'Goblin',
  'Bijih besi': 'Iron ore',
  'Landasan': 'Anvil',
  'Prajurit': 'Soldier',
  'Lentera gelap': 'Dark lantern',
  'Perisai hitam': 'Black shield',
  'Bayangan': 'Shadow',
  'Mahkota': 'Crown',
  'Perisai kerajaan': 'Royal shield',
  'Pengawal': 'Guard',
  'Kristal void': 'Void crystal',
  'Perisai retak': 'Cracked shield',
  'Penjaga gelap': 'Dark keeper',
  'Lentera Jepang': 'Japanese lantern',
  'Topeng Oni': 'Oni mask',
  'Goblin samurai': 'Samurai goblin',
  'Arang': 'Charcoal',
  'Perisai api': 'Flame shield',
  'Penjaga merah': 'Red guard',
  'Genderang': 'War drum',
  'Tameng': 'Buckler',
  'Prajurit Oni': 'Oni soldier',
  'Mahkota iblis': 'Demon crown',
  'Segel': 'Seal',
  'Pengawal iblis': 'Demon guard',
  'Bendera': 'Banner',
  'Katana': 'Katana',
  'Samurai': 'Samurai',
  'Roda gigi': 'Gear',
  'Pelat baja': 'Steel plate',
  'Robot penjaga': 'Guard robot',
  'Chip': 'Chip',
  'Perisai energi': 'Energy shield',
  'Drone': 'Drone',
  'Inti reaktor': 'Reactor core',
  'Armor berat': 'Heavy armour',
  'Robot tempur': 'Combat robot',
  'Kristal energi': 'Energy crystal',
  'Kubah': 'Dome',
  'Drone plasma': 'Plasma drone',
  'Baterai': 'Battery',
  'Robot elit': 'Elite robot',
  'Tong mesiu': 'Powder keg',
  'Jangkar': 'Anchor',
  'Bajak laut': 'Pirate',
  'Lentera hantu': 'Ghost lantern',
  'Jangkar karat': 'Rusted anchor',
  'Kerangka': 'Skeleton',
  'Kompas': 'Compass',
  'Meriam': 'Cannon',
  'Penjaga kerangka': 'Skeleton guard',
  'Mutiara gelap': 'Dark pearl',
  'Karang': 'Coral',
  'Penjaga laut': 'Sea guard',
  'Peti harta': 'Treasure chest',
  'Pedang kerajaan': 'Royal sword',
  'Pengawal elite': 'Elite guard',
  'Spesial': 'Special',
  'Senjata baru ': 'New weapon: ',
  tekan: 'press',
  ' dibeli · ': ' bought · ',
  ' masih terkunci. Per senjata: 500 diamond.': ' still locked. 500 diamonds each.',
  'Semua ': 'All ',
  ' senjata LANGKA terbuka · biaya 500 diamond per senjata.': ' RARE weapons unlocked · 500 diamonds each.',
  LEVEL: 'LEVEL',
  ' · LEVEL UP!': ' · LEVEL UP!',
  'Player level ': 'Player level ',
  ' SENJATA)': ' WEAPONS)',
  DEFAULT: 'DEFAULT',
  'PILIH #': 'PICK #',
  'STAGE 100 · FINAL BOSS': 'STAGE 100 · FINAL BOSS',
  'Misi baru dalam ': 'New missions in ',
  'Tutup pengaturan': 'Close settings',
  PENGATURAN: 'SETTINGS',
  KECEPATAN: 'SPEED',
  'Kalahkan 5 boss': 'Defeat 5 bosses',
  'MASTER SLAYER': 'MASTER SLAYER',
  '🎨 WARNA SAMA! +3': '🎨 SAME COLOUR! +3',
  'SERANGAN BOS!': 'BOSS ATTACK!',
  BOSS: 'BOSS',
  BONUS: 'BONUS',
  hapus: 'erase',
  lagi: 'to go',
  '🎨 warna terakhir ●': '🎨 last colour ●',
  kunci: 'lock',
  '🔋 tahan untuk charge': '🔋 hold to charge',
  '👻 kebal duri': '👻 immune to spikes',
  'DIAMOND BREAKER': 'DIAMOND BREAKER',
  '10 detik! Berondong petinya!': '10 seconds! Blast the crates!',
  'TAHAN LAYAR / SPASI = AUTO-FIRE': 'HOLD THE SCREEN / SPACE = AUTO-FIRE',
  'MUSIK & AMBIENCE': 'MUSIC & AMBIENCE',
  'Suasana lembut ala Perfect Shot': 'A soft Perfect Shot style ambience',
  Kembali: 'Back',
  'Kembali ke menu': 'Back to menu',
  Tutup: 'Close',
  Batal: 'Cancel',
  TERKUNCI: 'LOCKED',
  '🔒 TERKUNCI': '🔒 LOCKED',
  SELESAI: 'DONE',
  KLAIM: 'CLAIM',
  BELI: 'BUY',

  // ------------------------------------------------------------ menu/App
  PERINGKAT: 'RANKING',
  '🔓 SEMUA GEMBOK TERBUKA!': '🔓 ALL LOCKS OPEN!',
  '🔓 SEMUA STAGE TERBUKA': '🔓 ALL STAGES UNLOCKED',
  '🔒 PROGRES NORMAL': '🔒 NORMAL PROGRESS',
  ' · tekan ': ' · press ',
  ' untuk normal': ' for normal',
  ' untuk buka semua': ' to unlock all',
  'Kembali ke Menu Game': 'Back to Game Menu',
  'Pilih Game Lain': 'Choose Another Game',
  'BERLIAN BESAR DIDAPAT': 'BIG DIAMOND FOUND',
  'Buka koleksi senjata': 'Open the weapon collection',
  'Tutup pengaturan permainan': 'Close game settings',
  'Geser untuk atur volume efek': 'Drag to set the effects volume',
  'Volume suara saat bermain': 'In-game sound volume',
  '🎁 Peti hadiah milestone siap dibuka!': '🎁 The milestone reward chest is ready!',
  'PAKAI & LANJUT ➜': 'USE & CONTINUE ➜',
  'AMBIL HADIAH ➜': 'CLAIM REWARD ➜',
  'Lanjut tanpa ganti senjata': 'Continue without switching weapon',
  'SKOR AKHIR': 'FINAL SCORE',
  'REKOR TERBAIK': 'BEST RECORD',
  'DAPAT KOIN': 'COINS EARNED',

  // -------------------------------------------------------- panel setting
  'AUDIO · TEMA · GAME SGA': 'AUDIO · THEME · SGA GAME',
  'Bisukan semua efek': 'Mute all effects',
  '🎯 Efek': '🎯 Effects',
  '🎵 Musik': '🎵 Music',
  'TEMA LATAR': 'BACKGROUND THEME',
  'PENGATURAN LANJUTAN': 'ADVANCED SETTINGS',
  'Kecepatan peluru semua senjata': 'Bullet speed for every weapon',
  'COMBO TITIK': 'SPOT COMBO',
  'Tembak hampir tepat di bekas tembakan sebelumnya (minimal 80% akurat): 10 · 20 · 30 · 40 … masuk bonus coin. Kena peluru yang sudah nancep tidak dihitung pelanggaran. Koin yang ditembak bernilai 10.':
    'Land within 80% of the previous mark: 10 · 20 · 30 · 40 … into bonus coins. Hitting a round that is already stuck is not a violation. A shot coin is worth 10.',
  '⚡ KECEPATAN GAME SGA': '⚡ SGA GAME SPEED',
  'Portrait: senjata di bawah, menembak ke atas. Landscape: senjata di KIRI menembak ke KANAN, target & musuh di kanan.':
    'Portrait: gun at the bottom, firing up. Landscape: gun on the LEFT firing RIGHT, target & enemies on the right.',
  '🎬 PRESET ANIMASI SENJATA MENU': '🎬 MENU WEAPON ANIMATION PRESET',
  'Kecepatan & gaya masuk senjata. Tutup pengaturan untuk melihat dan mendengar animasinya.':
    'Speed & entrance style of the weapon. Close settings to see and hear the animation.',
  '✦ STAGE SPESIAL': '✦ SPECIAL STAGE',
  'Pilih langsung mode bonus SGA.': 'Pick an SGA bonus mode directly.',
  'BATU · 3': 'BOULDER · 3',
  'BONUS · 4': 'BONUS · 4',
  'HARTA · 6': 'TREASURE · 6',
  '▶ PUTAR ULANG INTRO SANS STUDIO': '▶ REPLAY SANS STUDIO INTRO',
  '🔒 KEBIJAKAN PRIVASI': '🔒 PRIVACY POLICY',
  'SIMPAN & KEMBALI': 'SAVE & BACK',

  // ------------------------------------------------------------- arsenal
  'Semua senjata LANGKA sudah dibeli.': 'All RARE weapons are already owned.',
  'Diamond belum cukup. Senjata LANGKA berharga 500 diamond masing-masing.':
    'Not enough diamonds. Every RARE weapon costs 500 diamonds.',
  'SEMUA SENJATA': 'ALL WEAPONS',
  'CUSTOM SKINS': 'CUSTOM SKINS',
  'SENJATA EPIC': 'EPIC WEAPONS',
  'SENJATA RARE': 'RARE WEAPONS',
  'SENJATA LEGEND': 'LEGEND WEAPONS',
  'SENJATA UMUM': 'COMMON WEAPONS',
  'ARSENAL · TOOLS': 'ARSENAL · TOOLS',
  'Tambah mata uang': 'Add currency',
  'Alat Arsenal': 'Arsenal tools',
  'Ganti desain dan efek': 'Change design and effects',
  'Kategori senjata': 'Weapon category',
  'Senjata, gulir untuk melihat semua': 'Weapons — scroll to see them all',
  'Default tersimpan': 'Saved default',
  'Senjata dan efek bergerak sesuai karakter boss.':
    'The weapon and effects move like the boss character.',
  'DEMO SERANGAN BOS': 'BOSS ATTACK DEMO',
  'TERBUKA & SIAP PAKAI': 'UNLOCKED & READY',

  // ------------------------------------------------------------- quest
  'Hadiah diambil': 'Reward claimed',
  'Klaim hadiah': 'Claim reward',
  'Tutup achievement': 'Close achievements',
  'Hadiah milestone di sepanjang jalur · Kado berisi senjata':
    'Milestone rewards along the track · Gifts hold weapons',
  SENJATA: 'WEAPON',

  // ---------------------------------------------------------- level map
  'STAGE SPESIAL': 'SPECIAL STAGE',
  'GUN HIT SGA · 100 STAGE · 11 BOS':
    'GUN HIT SGA · 100 STAGES · 11 BOSSES',
  'MULAI · STAGE 1': 'START · STAGE 1',
  ' terkunci': ' locked',
  'KAMU DI SINI': 'YOU ARE HERE',
  'STAGE SGA': 'SGA STAGE',
  'Stage spesial SGA: sistem tetap memilih Batu, Bonus, atau Harta Karun sesuai aturan stage yang sudah ada.':
    'Special SGA stage: the system still picks Boulder, Bonus or Treasure by the existing stage rules.',
  TEMA: 'THEME',
  PETA: 'MAP',

  // ------------------------------------------------------------- modal
  'PETI EMAS I': 'GOLD CHEST I',
  'PETI BERLIAN II': 'DIAMOND CHEST II',
  'PETI SULTAN III': 'SULTAN CHEST III',
  'KLAIM & LANJUT ▶': 'CLAIM & CONTINUE ▶',
  'LEWATI & LANJUT ▶': 'SKIP & CONTINUE ▶',
  'LANJUT OTOMATIS…': 'CONTINUING AUTOMATICALLY…',
  'SENJATA BARU!': 'NEW WEAPON!',
  'KOIN BONUS!': 'BONUS COINS!',
  'TAP UNTUK MEMBUKA!': 'TAP TO OPEN!',
  'TAP LAGI!': 'TAP AGAIN!',
  'SATU LAGI!!': 'ONE MORE!!',
  '★ BONUS REWARD STAGE ★': '★ BONUS REWARD STAGE ★',
  '🎁 Kotak hadiah boss didapat!': '🎁 Boss gift box collected!',

  // --------------------------------------------------------- star buff
  'TEMBAK 2X CEPAT': '2X FASTER FIRE',
  'Jeda antar tembakan lebih singkat': 'Shorter delay between shots',
  'AMMO 2X': '2X AMMO',
  'Dapat satu magasin tambahan': 'Gain one extra magazine',
  'DAYA 2X': '2X POWER',
  'Hit bos lebih kuat, batu lebih cepat terkikis':
    'Stronger boss hits, boulders crumble faster',
  'DUA SENJATA': 'DUAL WEAPONS',
  'Kembar kanan-kiri, pegangan menghadap keluar':
    'Twin left-right guns, grips facing outward',
  'Lebih banyak tembakan dalam 10 detik': 'More shots within 10 seconds',
  'Dua senjata berdampingan, dua peluru per tembakan':
    'Two guns side by side, two bullets per shot',
  'PELURU MINI': 'MINI BULLETS',
  'Berondong dengan jeda lebih rapat': 'Rapid fire with a tighter delay',
  'PELURU RAKSASA': 'GIANT BULLETS',
  'Koin dari setiap hit jadi 2x': 'Coins from every hit are doubled',
  'BONUS HARTA KARUN!': 'TREASURE BONUS!',
  'Waktu berhenti sejenak. Pilih satu kekuatan:':
    'Time stops for a moment. Pick one power:',

  // -------------------------------------------------------- leaderboard
  'Rekor Skor Tertinggi': 'Highest Score Record',
  'Stage Tertinggi Dicapai': 'Highest Stage Reached',
  'Koleksi Koin Emas': 'Golden Coin Collection',
  'Boss Tertinggi Ditaklukkan': 'Highest Boss Defeated',

  // ------------------------------------------------------ export modal
  'Export data default senjata massal': 'Bulk weapon default data export',
  'Tutup export default': 'Close default export',
  'KLIK BARIS UNTUK EDIT': 'CLICK A ROW TO EDIT',
  'PILIH DESAIN': 'PICK A DESIGN',
  'Teks data export default senjata': 'Weapon default export data text',

  // ------------------------------------------------ pilihan desain senjata
  'ARSENAL · PILIH DESAIN & DEFAULT': 'ARSENAL · PICK DESIGN & DEFAULT',
  'Tutup pilihan desain': 'Close design picker',
  '✓ DIPAKAI': '✓ IN USE',
  Baru: 'New',

  // ------------------------------------------------------------- hud/game
  '⏱ STOP WAKTU!': '⏱ TIME STOP!',
  '🦄 JADI KOIN!': '🦄 TURNED TO COINS!',
  'BERLIAN +10! +5 APEL': 'DIAMONDS +10! +5 APPLES',
  'BOS KALAH! +5 💰': 'BOSS DOWN! +5 💰',
  'BERLIAN BERSIH! +3 APEL': 'DIAMONDS CLEARED! +3 APPLES',
  '🪙 KOIN BERTEBARAN!': '🪙 COINS SCATTERED!',
  'WAKTU HABIS!': 'TIME UP!',
  'LEPAS UNTUK MENEMBAK': 'RELEASE TO SHOOT',
  '2 SENJATA': '2 WEAPONS',
  'BERONDONG PETI!': 'CRATE RAPID FIRE!',
  '🎯 tahan = kunci & luncurkan': '🎯 hold = lock & launch',
  '🪙 BONUS STAGE': '🪙 BONUS STAGE',
  '🧰 HARTA KARUN': '🧰 TREASURE',
  'Kikis batu hingga diamond bersih!': 'Chip the boulder until the diamonds are clear!',
  'Kikis batu, lalu tembak diamond 4x untuk mengambilnya!': 'Chip the rock, then hit the diamond 4 times to claim it!',
  'Bidik koin yang berputar!': 'Aim at the spinning coins!',
  'TAP = TEMBAK, TAHAN = CHARGE x4!': 'TAP = SHOOT, HOLD = CHARGE x4!',
  'TAHAN = BIDIK SLOW-MO, LEPAS = TEMBAK': 'HOLD = SLOW-MO AIM, RELEASE = SHOOT',
  'TAHAN LAYAR UNTUK MEMUTAR LARAS!': 'HOLD THE SCREEN TO SPIN UP!',
  'BONUS +3': 'BONUS +3',
  '❄ BEKU!': '❄ FROZEN!',
  'ISI ULANG…': 'RELOADING…',
  ' TERBUKA': ' UNLOCKED',
  'kurang ': 'short ',
  'RINGKASAN (': 'SUMMARY (',
  'SEMUA STAGE TERBUKA': 'ALL STAGES OPEN',
  'MENYIAPKAN SGA': 'LOADING SGA',
  'MEMUAT INTRO': 'LOADING INTRO',
  'SPACE · borong senjata RARE, 500 diamond per senjata': 'SPACE · buy every RARE weapon, 500 diamonds each',
  'DEFAULT: SKIN #': 'DEFAULT: SKIN #',
  'EFEK #': 'EFFECT #',
  'Pilih nomor skin & efek tembakan, tandai default per senjata, lalu export massal.':
    'Pick a skin number & shot effect, mark a default for each weapon, then bulk export.',
  '◀ SENJATA SBLM': '◀ PREV WEAPON',
  'SENJATA LANJUT ▶': 'NEXT WEAPON ▶',
  'Pilih desain ': 'Pick design ',
  'Pilih efek ': 'Pick effect ',
  ' untuk ': ' for ',
  'SKIN NO. ': 'SKIN NO. ',
  'PILIH SKIN #': 'PICK SKIN #',
  '✓ DIPAKAI (SKIN #': '✓ IN USE (SKIN #',
  'Pilihan efek tembakan': 'Shot effect options',
  '✦ EFEK TEMBAKAN · PILIH TERPISAH ✦': '✦ SHOT EFFECT · PICKED SEPARATELY ✦',
  'EFEK NO. ': 'EFFECT NO. ',
  'TERSIMPAN DEFAULT: SKIN NO. ': 'SAVED DEFAULT: SKIN NO. ',
  'UPDATE DEFAULT KE SKIN NO. ': 'UPDATE DEFAULT TO SKIN NO. ',
  'TANDAI SEBAGAI DEFAULT (SKIN NO. ': 'MARK AS DEFAULT (SKIN NO. ',
  'Hapus tanda default ': 'Remove the default mark for ',
  '✕ HAPUS': '✕ REMOVE',
  '📋 EXPORT DATA DEFAULT MASSAL (': '📋 BULK EXPORT DEFAULT DATA (',
  'GUNAKAN DESAIN ': 'USE DESIGN ',
  'EFEK ': 'EFFECT ',
  '{label}: {w} dengan bentuk, efek tembakan dan suara asli dari slide 5':
    '{label}: {w} with its shape, shot effect and original sound from slide 5',
  '{label}: {w} dengan bentuk, efek tembakan dan suara asli dari slide 4':
    '{label}: {w} with its shape, shot effect and original sound from slide 4',
  '{label}: {w} dengan bentuk dan efek sinar asli dari slide 2':
    '{label}: {w} with its original beam shape and effect from slide 2',
  '{label}: {w} dengan bentuk, efek tembakan dan suara asli dari slide 3':
    '{label}: {w} with its shape, shot effect and original sound from slide 3',
  '{label}: {w} dengan bentuk, efek tembakan dan suara asli dari Firework 8-Gun':
    '{label}: {w} with its shape, shot effect and original sound from Firework 8-Gun',
  '{label}: art SVG animasi (glow, kilau dan flash) dari svg-weapons-with-glow-animation.zip':
    '{label}: animated SVG art (glow, shimmer and flash) from svg-weapons-with-glow-animation.zip',
  'Gun kristal putih-marmer dengan filigree emas, berlian biru menyala dan kristal besar berputar di moncong (SVG animasi)':
    'A white-marble crystal gun with gold filigree, glowing blue diamonds and a big spinning crystal on the muzzle (animated SVG)',
  'Blaster galaksi bersel energi dengan muara plasma merah yang berkedip (SVG animasi)':
    'A galactic blaster with glowing energy cells and a flickering red plasma muzzle (animated SVG)',
  'Paintball gun neon dengan tabung cat, kilau pink dan cipratan cat (SVG animasi)':
    'A neon paintball gun with a paint tank, pink glow and paint splats (animated SVG)',
  'Shark launcher dengan rahang menggigit, mata menyala dan jet biru (SVG animasi)':
    'A shark launcher with snapping jaws, glowing eyes and a blue jet (animated SVG)',
  'Martian heat-ray dengan ekor manik hijau meliuk dan busur petir (SVG animasi)':
    'A martian heat-ray with a writhing green bead tail and lightning arcs (animated SVG)',
  '{label}: desain {w} di slide 1': '{label}: the slide 1 design of {w}',
  'Peluru, jejak, beam dan percikan berubah; damage, ammo, dan buff tetap.':
    'Bullets, trails, beams and sparks change; damage, ammo and buffs stay the same.',
  'Ketiga versi Moonbeam tetap tongkat ajaib, tanpa pegangan pistol.':
    'All three Moonbeam versions stay magic staffs, with no pistol grip.',
  'pada senjata lalu klik': 'on a weapon and then press',
  'TANDAI SEBAGAI DEFAULT': 'MARK AS DEFAULT',
  ', atau pilih tab': ', or pick the tab',
  'DATA EXPORT (SIAP COPAS KE CHAT):': 'EXPORT DATA (READY TO PASTE INTO CHAT):',
  'Bandingkan desain ': 'Compare the design of ',
  KEMBALI: 'BACK',
  'MULAI LEVEL ': 'START LEVEL ',
  'BOSS ': 'BOSS ',
  'Bos besar dengan pola serangan khusus dan tiga fase amukan.':
    'A large boss with its own attack pattern and three rage phases.',
  'Musuh dan aturan stage tetap memakai sistem SGA.':
    'Enemies and stage rules still use the SGA system.',
  ' SENJATA · AKHIR DAFTAR —': ' WEAPONS · END OF LIST —',
  'BELI · 500': 'BUY · 500',
  'SIKLUS ': 'CYCLE ',
  'Demo serangan ': 'Attack demo: ',
  'RESET DALAM ': 'RESETS IN ',
  'KLAIM SEMUA (': 'CLAIM ALL (',
  '⏱ Misi baru dalam ': '⏱ New missions in ',
  'Info achievement': 'Achievement info',
  'BUKA!': 'OPEN!',
  'TOTAL DIDAPAT: +': 'TOTAL EARNED: +',
  ' KOIN 💰': ' COINS 💰',
  ' DITAKLUKKAN!': ' DEFEATED!',
  ' achievement': ' achievements',
  ' milestone reward': ' milestone reward',
  'Selamat! Kamu berhasil menaklukkan Stage': 'Congrats! You cleared Stage',
  '! Buka Peti Hadiah Keberuntunganmu:': '! Open your lucky reward chests:',
  'Boss ${artBoss || theme.label}. Bos besar dengan pola serangan khusus dan tiga fase amukan.':
    'Boss ${artBoss || theme.label}. A large boss with its own attack pattern and three rage phases.',
  'Tema ikon peta: ': 'Map icon theme: ',
  'Tema ikon peta: ${theme.label}. Musuh dan aturan stage tetap memakai sistem SGA.':
    'Map icon theme: ${theme.label}. Enemies and stage rules still use the SGA system.',
  'Selesaikan misi DAILY dan SKILL untuk mendapatkan koin. Setiap milestone membuka hadiah senjata; progres tetap tersimpan di akun SGA.':
    'Finish DAILY and SKILL missions to earn coins. Every milestone unlocks a weapon reward; progress stays saved in your SGA account.',
  // ------------------------------------------------------- export massal
  '★ EXPORT DEFAULT MASSAL': '★ BULK DEFAULT EXPORT',
  'DATA PILIHAN DEFAULT SENJATA': 'WEAPON DEFAULT SELECTION DATA',
  'Copy data di bawah lalu paste langsung ke chat agar diset permanen sebagai default game.':
    'Copy the data below and paste it straight into the chat so it is saved permanently as the game default.',
  'Belum ada senjata di kategori ini. Buka': 'No weapons in this category yet. Open',
  'Skin #': 'Skin #',
  'Efek #': 'Effect #',
  ' baris': ' lines',
  '✓ BERHASIL DICOPY! TINGGAL PASTE KE CHAT': '✓ COPIED! NOW PASTE IT INTO THE CHAT',
  '📋 COPY DATA MASSAL (': '📋 COPY BULK DATA (',
  '⬇ UNDUH .TXT': '⬇ DOWNLOAD .TXT',
  '★ TANDAI DIUBAH': '★ MARK AS CHANGED',
  'YAKIN RESET?': 'RESET FOR SURE?',
  '↺ RESET TANDA': '↺ RESET MARKS',
  'DIUBAH / ★ (': 'CHANGED / ★ (',
  'HANYA ★ (': 'ONLY ★ (',
  'SEMUA (': 'ALL (',
  'Naga merah klasik': 'Classic red dragon',
  'Kepala naga, sayap terlipat, grip kulit': 'Dragon head, folded wings, leather grip',
  'Kristal bersinar modern': 'Modern glowing crystal',
  'Busur pelangi klasik': 'Classic rainbow bow',
  'Spektrum bercahaya': 'Glowing spectrum',
  'Prisma pelangi dalam pistol mutiara': 'Rainbow prism in a pearl pistol',
  'Batuan lava klasik': 'Classic lava rock',
  'Inti meteor menyala': 'Glowing meteor core',
  'Pistol emas klasik': 'Classic gold pistol',
  'Bulan sabit klasik': 'Classic crescent moon',
  'Tongkat bulan berbintang': 'Starry moon staff',
  'Meriam singularitas klasik slide 1': 'Classic slide 1 singularity cannon',
  'Ketapel kayu sawo slide 1': 'Slide 1 sapodilla-wood slingshot',
  'Sumpitan Dayak slide 1': 'Slide 1 Dayak blowgun',
  'Shotgun slide 1': 'Slide 1 shotgun',
  'Pistol air neon slide 1': 'Slide 1 neon water pistol',
  ' dengan bentuk, efek tembakan dan suara asli dari slide 5':
    ' with its original shape, shot effect and sound from slide 5',
  ' dengan bentuk, efek tembakan dan suara asli dari slide 4':
    ' with its original shape, shot effect and sound from slide 4',
  ' dengan bentuk dan efek sinar asli dari slide 2':
    ' with its original shape and beam effect from slide 2',
  ' dengan bentuk, efek tembakan dan suara asli dari slide 3':
    ' with its original shape, shot effect and sound from slide 3',
  ' dengan bentuk, efek tembakan dan suara asli dari Firework 8-Gun':
    ' with its original shape, shot effect and sound from Firework 8-Gun',
  ' di slide 1': ' from slide 1',
};

/** Kamus lengkap: UI + senjata + misi/tema/peta. */
export const EN: Record<string, string> = { ...CORE_EN, ...WEAPON_EN, ...DATA_EN };

/**
 * Inggris → Indonesia, untuk teks yang *sumbernya* sudah Inggris: data art
 * bersama (nama bos, gaya animasi, preset) ditulis dalam bahasa Inggris, jadi
 * Game A perlu arah sebaliknya untuk mode Indonesia.
 */
export const ID: Record<string, string> = {
  // nama bos (data art bersama berbahasa Inggris)
  'Pirate Captain': 'Kapten Bajak Laut',
  'Mad Jester': 'Jester Gila',
  'Dragon Head': 'Kepala Naga',
  'Skull King': 'Raja Tengkorak',
  'Tiki Totem': 'Tiki Totem',
  'Northern Viking': 'Viking Utara',
  'Oni Mask': 'Topeng Oni',
  'Robot X': 'Robot X',
  'Alien Zorg': 'Alien Zorg',
  'Count Vampire': 'Count Vampir',
  'Sun King': 'Raja Matahari',
  // deskripsi bos
  'Ruler of the seven seas. One eye is shut, but his aim never misses.':
    'Penguasa tujuh samudra. Satu mata ditutup, tapi bidikannya tidak pernah meleset.',
  'A court clown who laughs while spinning wildly. Do not trust that smile!':
    'Badut istana yang tertawa sambil berputar tak menentu. Jangan tertipu senyumnya!',
  'A horned fire dragon with steel-hard scales. It spins fast, then reverses direction.':
    'Naga api bertanduk dengan sisik sekeras baja. Berputar cepat lalu berbalik arah.',
  'Risen from an old graveyard. His eyes burn red in the dark.':
    'Bangkit dari kuburan tua. Matanya menyala merah di kegelapan.',
  'An ancient wooden totem guarding a tropical island. Its grin carries a curse.':
    'Totem kayu kuno penjaga pulau tropis. Seringainya membawa kutukan.',
  'A warrior from the land of ice with a horned helmet and braided beard.':
    'Pejuang dari negeri es dengan helm bertanduk dan janggut kepang.',
  'A fanged red demon from eastern legend. His rage sends the wheel spinning madly.':
    'Iblis merah bertaring dari legenda timur. Amarahnya membuat roda berputar gila.',
  'A combat machine with an LED visor. Its pattern is precise, as if computed.':
    'Mesin tempur dengan visor LED. Polanya presisi seperti dihitung komputer.',
  'A visitor from a distant galaxy with huge hypnotic black eyes.':
    'Pengunjung dari galaksi jauh dengan mata hitam raksasa yang menghipnotis.',
  'A high-collared noble of the night. He only appears under a red moon.':
    'Bangsawan malam berkerah tinggi. Hanya muncul saat bulan merah.',
  'Ruler of the solar system — Moon, Mars, Jupiter and Pluto all bow to him. His fiery tongue burns everything!':
    'Penguasa tata surya — Bulan, Mars, Jupiter & Pluto tunduk padanya. Lidah apinya membakar segalanya!',
  // gaya animasi menu & grupnya
  'The original animation': 'Animasi original',
  'Drop Up → Vortex Spin ↻ → Pop Blast (3 s)': 'Drop Up → Vortex Spin ↻ → Pop Blast (3 detik)',
  'Blasts out of a point + shockwave': 'Meledak dari titik + gelombang kejut',
  'Shoots up from below, squash & stretch': 'Melesat dari bawah, squash & stretch',
  'Falls from the sky & bounces': 'Jatuh dari langit & memantul',
  'Sweeps in from the side with motion blur': 'Menyapu dari samping dengan motion blur',
  'Spins out of a vortex': 'Berputar dari pusaran',
  'Flips over like a card': 'Membalik seperti kartu',
  'Wobbly elastic bounce': 'Kenyal elastis',
  'Digital distortion': 'Distorsi digital',
  Weapon: 'Visual Senjata',
  'Main Buttons': 'Tombol Utama',
  'Bottom Nav': 'Tombol Menu Bawah',
  'Title Logo': 'Logo Judul',
};

/** Terjemahan Inggris untuk teks Indonesia; teks asing dilewatkan apa adanya. */
export function tr(language: Language, text: string): string {
  if (language !== 'en') return text;
  return EN[text] ?? text;
}

/** Kebalikannya: teks data art bersama sudah Inggris, mode ID butuh Indonesia. */
export function trId(language: Language, text: string): string {
  if (language !== 'id') return text;
  return ID[text] ?? text;
}

/** Versi daftar: dipakai untuk baris-baris yang isinya teks Indonesia. */
export function trList(language: Language, texts: readonly string[]): string[] {
  return texts.map((text) => tr(language, text));
}

/** Label kelangkaan senjata; id-nya tetap dipakai untuk logika & simpanan. */
export const RARITY_ID: Record<string, string> = { UMUM: 'UMUM', LANGKA: 'RARE', EPIC: 'EPIC', LEGENDARIS: 'LEGEND' };
export const RARITY_EN: Record<string, string> = { UMUM: 'COMMON', LANGKA: 'RARE', EPIC: 'EPIC', LEGENDARIS: 'LEGEND' };

export function rarityLabel(rarity: string, language: Language): string {
  return (language === 'en' ? RARITY_EN : RARITY_ID)[rarity] ?? rarity;
}

/**
 * Label peta berbentuk `Nama LV<n>` (mis. `GENTONG LV1`): namanya diterjemahkan,
 * angka level dibiarkan apa adanya. Sumber labelnya ditulis kapital, jadi
 * pencariannya lewat indeks kapital.
 */
const UPPER_LABELS = new Map<string, string>();
for (const [id, en] of Object.entries(EN)) {
  if (id !== id.toUpperCase()) UPPER_LABELS.set(id.toUpperCase(), en);
}

export function trStageCaption(language: Language, caption: string): string {
  const match = /^(.*?)(\sLV\d+)$/.exec(caption);
  const name = match ? match[1] : caption;
  const suffix = match ? match[2] : '';
  if (language !== 'en') return caption;
  const translated = EN[name] ?? UPPER_LABELS.get(name.toUpperCase()) ?? name;
  return `${translated.toUpperCase()}${suffix}`;
}
