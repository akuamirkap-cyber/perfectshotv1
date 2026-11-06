export type WeaponId =
  | 'golden'
  | 'blackhole'
  | 'ketapel'
  | 'sumpit'
  | 'shotgun'
  | 'soaker'
  | 'snowball'
  | 'sniper'
  | 'flame'
  | 'bubble'
  | 'bamboo'
  | 'banana'
  | 'harpoon'
  | 'chicken'
  | 'confetti'
  | 'seed'
  | 'pizza'
  | 'minigun'
  | 'crossbow'
  | 'plasma'
  | 'laser'
  | 'dragon'
  | 'gravity'
  | 'honey'
  | 'coconut'
  | 'angklung'
  | 'bee'
  | 'sakura'
  | 'firework'
  | 'keris'
  | 'moonbeam'
  | 'storm'
  | 'pencil'
  | 'sandal'
  | 'paintball'
  | 'wand'
  | 'shark'
  | 'ghost'
  | 'ufo'
  | 'rainbow'
  | 'meteor'
  | 'diamond'
  | 'fish'
  | 'rpg'
  | 'cricket'
  | 'electro'
  | 'bazooka'
  | 'freeze'
  | 'rail'
  | 'magnet'
  | 'shrink'
  | 'grow'
  | 'pirate'
  | 'card'
  | 'holy'
  | 'unicorn'
  | 'obliterator'
  | 'coin'
  | 'saber'
  | 'gauntlet'
  | 'ruby'
  | 'emerald'
  | 'sapphire'
  | 'crystal'
  | 'beerifle'
  | 'charge'
  | 'pulse'
  | 'cryo'
  | 'hyperdrive'
  | 'quantum'
  | 'wars';

export type Rarity = 'LEGEND' | 'EPIC' | 'RARE' | 'UMUM';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  rarity: Rarity;
  set: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  ammo: number;
  cooldown: number;
  accent: string;
  tagline: string;
  fx: { tembak: string; peluru: string; kena: string };
}

export const WEAPONS: WeaponDef[] = [
  // ───────────── SET 1 ─────────────
  {
    id: 'golden',
    name: 'GOLDEN GUN',
    rarity: 'LEGEND',
    set: 1,
    ammo: 8,
    cooldown: 0.2,
    accent: '#ffcc33',
    tagline: 'Pistol emas legendaris berukir',
    fx: {
      tembak: 'Kilatan moncong bintang emas, slide mundur, selongsong emas terlempar berputar & asap berkilau.',
      peluru: 'Peluru emas berpendar dengan jejak tracer cahaya & debu bintang berkelip.',
      kena: 'Ledakan cahaya emas, sinar dewa, gelombang kejut, percikan logam, serpihan daun emas & retakan menyala.',
    },
  },
  {
    id: 'blackhole',
    name: 'BLACK HOLE',
    rarity: 'LEGEND',
    set: 1,
    ammo: 6,
    cooldown: 0.6,
    accent: '#b77dff',
    tagline: 'Tongkat singularitas kosmik',
    fx: {
      tembak: 'Orb menyerap energi & petir ungu (charge), lalu melepas lubang hitam dengan gelombang kejut.',
      peluru: 'Singularitas hitam + cakram akresi berputar, lensa gravitasi yang membengkokkan ruang & partikel tersedot.',
      kena: 'Implosi menyedot serpihan kayu, lalu ledakan ungu, petir menjalar di permukaan roda & kawah hitam.',
    },
  },
  {
    id: 'ketapel',
    name: 'KETAPEL',
    rarity: 'UMUM',
    set: 1,
    ammo: 7,
    cooldown: 0.42,
    accent: '#e0a060',
    tagline: 'Ketapel kayu cabang alami',
    fx: {
      tembak: 'Karet merah melontar dengan pantulan pegas bergetar, kantong kulit mendorong batu.',
      peluru: 'Batu kali berputar dengan motion blur & garis angin.',
      kena: 'Debu kayu mengepul, serpihan kayu & pecahan batu terpental, retakan kayu, batu tertanam.',
    },
  },
  {
    id: 'sumpit',
    name: 'SUMPIT DAYAK',
    rarity: 'UMUM',
    set: 1,
    ammo: 8,
    cooldown: 0.3,
    accent: '#ef4444',
    tagline: 'Sumpit kayu ulin bermata tombak',
    fx: {
      tembak: 'Gelombang tiupan merambat di laras, semburan udara keluar & rumbai merah berayun.',
      peluru: 'Damek (anak sumpit) berujung racun ipoh dengan ekor gabus, melayang bergetar.',
      kena: 'Tertancap & bergetar (vibrasi), kabut racun hijau menyebar & noda racun meresap ke kayu.',
    },
  },
  {
    id: 'shotgun',
    name: 'SHOTGUN',
    rarity: 'UMUM',
    set: 1,
    ammo: 6,
    cooldown: 0.5,
    accent: '#ff7b39',
    tagline: 'Pump-action laras pelindung panas',
    fx: {
      tembak: 'Api moncong besar, cahaya menerangi layar, asap tebal, wad terlempar, kokang pompa & selongsong merah keluar.',
      peluru: '9 butir peluru panas menyebar seperti tracer.',
      kena: 'Pola lubang tembakan membara & berasap, percikan api, serpihan kayu besar terlempar.',
    },
  },
  {
    id: 'soaker',
    name: 'SUPER SOAKER',
    rarity: 'UMUM',
    set: 1,
    ammo: 7,
    cooldown: 0.3,
    accent: '#4cc9f0',
    tagline: 'Pistol air bertekanan tinggi',
    fx: {
      tembak: 'Air bertekanan menyembur dari nosel, air di tangki bergelombang, jarum tekanan turun & pompa bergerak.',
      peluru: 'Jet air transparan yang pecah menjadi tetesan (Plateau-Rayleigh) dengan kabut halus.',
      kena: 'Cipratan mahkota air, tetesan berhamburan, noda basah & tetes air terlempar oleh putaran roda.',
    },
  },
  // ───────────── SET 2 ─────────────
  {
    id: 'snowball',
    name: 'SNOWBALL CANNON',
    rarity: 'UMUM',
    set: 2,
    ammo: 7,
    cooldown: 0.4,
    accent: '#7fd3ff',
    tagline: 'Meriam salju bertema musim dingin',
    fx: {
      tembak: 'Letupan serbuk salju & kristal es, kilatan biru beku, kepingan salju berhamburan dari moncong.',
      peluru: 'Bola salju bergumpal berputar dengan ekor kabut dingin & snowflake berkilau.',
      kena: 'Ledakan serbuk salju, pecahan es & gumpalan salju terpental, retakan beku bercahaya, gundukan salju menempel di roda.',
    },
  },
  {
    id: 'sniper',
    name: 'SNIPER AWP',
    rarity: 'RARE',
    set: 2,
    ammo: 5,
    cooldown: 0.85,
    accent: '#9be15d',
    tagline: 'Senapan bolt-action jarak jauh',
    fx: {
      tembak: 'Laser merah membidik, kilatan moncong tajam dengan semburan samping & garis anamorfik, kokang bolt & selongsong kuningan terlempar.',
      peluru: 'Peluru super cepat dengan tracer menyilaukan, jejak uap & cincin kejut supersonik.',
      kena: 'Tembus tajam: kilatan bintang, cincin kejut tipis, serpihan kayu berkecepatan tinggi, lubang dalam & retakan panjang membara.',
    },
  },
  {
    id: 'flame',
    name: 'FLAMETHROWER',
    rarity: 'RARE',
    set: 2,
    ammo: 8,
    cooldown: 0.5,
    accent: '#ff8a2b',
    tagline: 'Penyembur api dengan tangki bahan bakar',
    fx: {
      tembak: 'Api pilot menyala di nosel, semburan api volumetrik dengan inti putih-kuning & cahaya oranye berkedip.',
      peluru: 'Aliran api kontinu: lidah api, bara & asap hitam mengepul dari ujung semburan.',
      kena: 'Api menjalar membungkus permukaan roda, hangus menghitam dengan retakan membara & api kecil tetap menyala.',
    },
  },
  {
    id: 'bubble',
    name: 'BUBBLE GUN',
    rarity: 'RARE',
    set: 2,
    ammo: 7,
    cooldown: 0.35,
    accent: '#ff7cc6',
    tagline: 'Pistol gelembung sabun warna-warni',
    fx: {
      tembak: 'Cincin sabun menggelembung, semprotan gelembung mini beraneka ukuran & kilau pelangi.',
      peluru: 'Gelembung sabun iridescent dengan lapisan film pelangi, pantulan cahaya & goyangan elastis.',
      kena: 'Pecah jadi cincin pelangi, serpihan film & tetes sabun; gugusan gelembung menempel di roda.',
    },
  },
  {
    id: 'bamboo',
    name: 'MERIAM BAMBU',
    rarity: 'RARE',
    set: 2,
    ammo: 6,
    cooldown: 0.7,
    accent: '#a6d84a',
    tagline: 'Meriam karbit tradisional dari bambu',
    fx: {
      tembak: 'Sumbu menyala, lalu dentuman api besar, cincin asap, bara & serpihan bambu, layar bergetar keras.',
      peluru: 'Bola meriam besi panas dengan ekor api & asap tebal.',
      kena: 'Ledakan bola api, gelombang kejut, asap hitam, serpihan kayu besar, kawah hangus & bola besi tertanam membara.',
    },
  },
  {
    id: 'banana',
    name: 'BANANA GUN',
    rarity: 'RARE',
    set: 2,
    ammo: 8,
    cooldown: 0.3,
    accent: '#ffd84a',
    tagline: 'Pistol pisang kartun',
    fx: {
      tembak: 'Ledakan "POW" kartun kuning, bintang berkilau & serpihan kulit pisang.',
      peluru: 'Pisang berputar dengan ekor bintang & bayangan gerak.',
      kena: 'Pisang muncrat: bubur pisang krem, irisan pisang & kulit terpental, noda lengket menetes di roda.',
    },
  },
  // ───────────── SET 3 ─────────────
  {
    id: 'harpoon',
    name: 'HARPOON GUN',
    rarity: 'RARE',
    set: 3,
    ammo: 6,
    cooldown: 0.6,
    accent: '#3be8d0',
    tagline: 'Senapan tombak bertenaga udara bertali baja',
    fx: {
      tembak: 'Letupan udara bertekanan dengan cincin kejut, cincin teal menyala, reel tali berputar & percikan dingin.',
      peluru: 'Tombak baja bermata kait dengan tali yang menegang & bergetar, cincin udara di ekornya.',
      kena: 'Menghujam dalam: serpihan kayu besar, retakan, cincin debu & gelombang kejut. Tombak bergetar keras, lalu talinya menyentak balik.',
    },
  },
  {
    id: 'chicken',
    name: 'RUBBER CHICKEN',
    rarity: 'RARE',
    set: 3,
    ammo: 6,
    cooldown: 0.5,
    accent: '#ffd23f',
    tagline: 'Peluncur ayam karet yang kocak',
    fx: {
      tembak: 'Ayam karet menguik: paruh membuka, badan menggembung, gelombang suara, bulu beterbangan & teks SQUEEK!',
      peluru: 'Ayam karet melayang goyang dengan sayap mengepak, jejak bulu & bintang.',
      kena: 'BWAK! Bulu berhamburan, awan debu, jejak cakar di kayu; ayam menancap berdiri & membal seperti pegas.',
    },
  },
  {
    id: 'confetti',
    name: 'CONFETTI CANNON',
    rarity: 'RARE',
    set: 3,
    ammo: 7,
    cooldown: 0.45,
    accent: '#ff5fa8',
    tagline: 'Meriam pesta berwarna-warni',
    fx: {
      tembak: 'Ledakan popper pesta: ratusan konfeti berkibar, pita melingkar & asap warna-warni.',
      peluru: 'Bola pelangi berkilau dengan pita-pita meliuk di ekor & konfeti mengorbit.',
      kena: 'Konfeti meledak dua kali, cincin pelangi, pita melayang, serpihan kertas menempel di roda & rosette pesta tertancap.',
    },
  },
  {
    id: 'seed',
    name: 'SEED GUN',
    rarity: 'RARE',
    set: 3,
    ammo: 7,
    cooldown: 0.35,
    accent: '#7ed957',
    tagline: 'Pistol biji tanaman rambat',
    fx: {
      tembak: 'Daun, kelopak & serbuk sari menyembur, tanah mengepul, tunas di moncong bergoyang.',
      peluru: 'Biji bergaris berputar 3D dengan aura hijau, daun melayang & debu sari.',
      kena: 'Biji menancap, tanah & serpihan kayu terpental, lalu tunas TUMBUH dari roda: batang, daun & bunga mekar.',
    },
  },
  {
    id: 'pizza',
    name: 'PIZZA LAUNCHER',
    rarity: 'RARE',
    set: 3,
    ammo: 6,
    cooldown: 0.5,
    accent: '#ff9a2b',
    tagline: 'Peluncur pizza renyah',
    fx: {
      tembak: 'Uap panas & keju menyembur, pepperoni terlempar, cahaya oven hangat.',
      peluru: 'Potongan pizza berputar dengan uap, remah keju & pepperoni yang lepas di jalur.',
      kena: 'SPLAT: keju meleleh & menetes, benang keju melar, saus muncrat, pepperoni & daun basil terpental.',
    },
  },
  {
    id: 'minigun',
    name: 'MINIGUN',
    rarity: 'EPIC',
    set: 3,
    ammo: 6,
    cooldown: 0.55,
    accent: '#c9d1da',
    tagline: 'Senapan putar 6 laras',
    fx: {
      tembak: 'Laras berputar makin cepat, rentetan kilatan moncong, selongsong kuningan beruntun, asap & getaran senjata.',
      peluru: 'Rentetan 9 peluru tracer berurutan.',
      kena: 'Deretan lubang peluru membara menjahit roda yang berputar, percikan beruntun & laras memerah panas.',
    },
  },
  {
    id: 'crossbow',
    name: 'CROSSBOW',
    rarity: 'UMUM',
    set: 3,
    ammo: 6,
    cooldown: 0.5,
    accent: '#d89a58',
    tagline: 'Busur silang kayu klasik',
    fx: {
      tembak: 'Tali bergetar, bilah busur melontar, debu angin & cincin udara.',
      peluru: 'Anak panah baja berbulu merah dengan bayangan gerak & garis angin.',
      kena: 'Menancap dengan hentakan, cincin debu, serpihan kayu, retakan & anak panah bergetar.',
    },
  },
  {
    id: 'plasma',
    name: 'PLASMA GUN',
    rarity: 'RARE',
    set: 3,
    ammo: 6,
    cooldown: 0.55,
    accent: '#4dff9a',
    tagline: 'Senjata plasma energi hijau',
    fx: {
      tembak: 'Sel energi menyala, partikel tersedot ke emitor, lalu letupan hijau dengan busur listrik.',
      peluru: 'Bola plasma berputar dengan busur listrik & ekor ion bercahaya.',
      kena: 'Ledakan energi hijau, petir menjalar di roda, kayu hangus dengan retakan menyala hijau & bola plasma tertanam berdenyut.',
    },
  },
  {
    id: 'laser',
    name: 'LASER BEAM',
    rarity: 'RARE',
    set: 3,
    ammo: 5,
    cooldown: 0.8,
    accent: '#ff4d5e',
    tagline: 'Meriam laser sinar merah',
    fx: {
      tembak: 'Cahaya merah mengerucut mengisi lensa, lalu sinar laser putih-merah menembus dengan cincin energi merambat.',
      peluru: 'Sinar instan berdenyut dengan inti putih, riak energi & kilau lensa.',
      kena: 'Membakar garis hangus di roda yang berputar, percikan menyebar, asap & titik lebur yang menyala.',
    },
  },
  // ───────────── SET 4 ─────────────
  {
    id: 'dragon',
    name: 'DRAGON BREATH',
    rarity: 'LEGEND',
    set: 4,
    ammo: 6,
    cooldown: 0.65,
    accent: '#ff6a2b',
    tagline: 'Meriam bersisik naga, bersayap & berapi',
    fx: {
      tembak: 'Rahang naga terbuka, semburan api raksasa berbentuk kerucut, lingkaran raungan, sayap mengepak & asap hitam.',
      peluru: 'Bola api berkepala naga: tanduk, mata menyala & rahang bertaring dengan ekor api meliuk seperti ular.',
      kena: 'Ledakan api, roh naga menyala yang meraung naik dari roda, retakan lava bercahaya, kawah hangus & sisik naga membara tertancap.',
    },
  },
  {
    id: 'gravity',
    name: 'GRAVITY GUN',
    rarity: 'LEGEND',
    set: 4,
    ammo: 6,
    cooldown: 0.7,
    accent: '#4aa8ff',
    tagline: 'Senjata gravitasi dengan orb biru',
    fx: {
      tembak: 'Orb mengerut menarik energi biru (charge), lalu dilepas dengan gelombang kejut cincin perspektif.',
      peluru: 'Bola gravitasi bercincin orbit yang melengkungkan ruang, serpihan kayu mengorbit & partikel tersedot.',
      kena: 'Serpihan kayu tersedot masuk, lalu HANTAMAN: gelombang kejut, kawah bercincin, serpihan terlontar & orb gravitasi melayang tertanam.',
    },
  },
  {
    id: 'honey',
    name: 'HONEY BLASTER',
    rarity: 'UMUM',
    set: 4,
    ammo: 7,
    cooldown: 0.4,
    accent: '#ffb81c',
    tagline: 'Penyembur madu bermotif sarang lebah',
    fx: {
      tembak: 'Madu menyembur dari nozel heksagon, tetesan hangat & serpihan sarang berkilau.',
      peluru: 'Gumpalan madu bening berkilau bergoyang elastis dengan benang madu memanjang di ekornya.',
      kena: 'Madu muncrat, benang lengket melar, heksagon berpendar, noda madu menetes di roda & dollop madu menempel.',
    },
  },
  {
    id: 'coconut',
    name: 'MERIAM KELAPA',
    rarity: 'UMUM',
    set: 4,
    ammo: 7,
    cooldown: 0.5,
    accent: '#9be15d',
    tagline: 'Meriam bambu tropis berpeluru kelapa',
    fx: {
      tembak: 'Dentuman bambu, asap putih, daun kelapa bergoyang & kelopak bunga kembang sepatu beterbangan.',
      peluru: 'Kelapa berserabut dengan tiga mata, berputar dengan ekor asap hijau & daun.',
      kena: 'Kelapa PECAH: tempurung terbelah, daging putih & air kelapa memercik, serabut beterbangan, noda basah menetes di roda.',
    },
  },
  {
    id: 'angklung',
    name: 'ANGKLUNG',
    rarity: 'RARE',
    set: 4,
    ammo: 6,
    cooldown: 0.5,
    accent: '#ffd23f',
    tagline: 'Alat musik bambu pelontar nada',
    fx: {
      tembak: 'Tabung bambu bergetar, nada-nada emas melayang & gelombang suara memancar.',
      peluru: 'Not balok emas berpendar dengan cincin gelombang suara & nada kecil di jejaknya.',
      kena: 'Gelombang sonik: cincin emas berlapis, ledakan nada, retakan resonansi & not emas bergetar menancap di roda.',
    },
  },
  {
    id: 'bee',
    name: 'BEE HIVE GUN',
    rarity: 'RARE',
    set: 4,
    ammo: 6,
    cooldown: 0.5,
    accent: '#ffc928',
    tagline: 'Sarang lebah pelontar kawanan',
    fx: {
      tembak: 'Sarang bergetar, kawanan lebah menyembur keluar dengan tetesan madu & dengung "BZZ".',
      peluru: 'Kawanan 11 lebah berdengung berputar-putar membentuk aliran terbang.',
      kena: 'Lebah menyerbu & menyebar ke segala arah, bekas sengat di kayu, madu menetes & satu lebah tertancap bersayap berdenyut.',
    },
  },
  {
    id: 'sakura',
    name: 'SAKURA BLOSSOM',
    rarity: 'RARE',
    set: 4,
    ammo: 7,
    cooldown: 0.45,
    accent: '#ff8fb5',
    tagline: 'Peluncur lakur merah dengan kipas sakura',
    fx: {
      tembak: 'Kipas mengembang, pusaran spiral merah muda & kelopak sakura berputar keluar.',
      peluru: 'Pusaran kelopak mengelilingi bunga sakura bercahaya, kelopak berguguran di jejaknya.',
      kena: 'Ledakan kelopak yang jatuh perlahan, cap bunga sakura menempel di roda & ranting bermekaran tertancap.',
    },
  },
  {
    id: 'firework',
    name: 'FIREWORK LAUNCHER',
    rarity: 'EPIC',
    set: 4,
    ammo: 6,
    cooldown: 0.55,
    accent: '#ff5f7e',
    tagline: 'Tiga tabung kembang api bergantian',
    fx: {
      tembak: 'Tabung merah-biru-kuning bergantian menembak dengan sumbu menyala, semburan percikan & asap.',
      peluru: 'Roket petasan berekor percikan emas yang meliuk, dengan api knalpot & glitter.',
      kena: 'Ledakan kembang api warna-warni: ratusan percikan jatuh, bintang berkelip, letupan susulan & roket menancap membara.',
    },
  },
  {
    id: 'keris',
    name: 'KERIS SAKTI',
    rarity: 'EPIC',
    set: 4,
    ammo: 5,
    cooldown: 0.6,
    accent: '#f2c14e',
    tagline: 'Keris emas berluk tujuh bertuah',
    fx: {
      tembak: 'Bilah emas menyala putih, lingkaran mandala berputar & roh keris melesat.',
      peluru: 'Keris emas bertuah dengan aura api emas meliuk, kilau & percikan pamor.',
      kena: 'Menghujam: cahaya emas, mandala sakti, kabut gaib, sinar dewa & keris bergetar menancap dengan aura berdenyut.',
    },
  },
  // ───────────── SET 5 ─────────────
  {
    id: 'moonbeam',
    name: 'MOONBEAM',
    rarity: 'LEGEND',
    set: 5,
    ammo: 6,
    cooldown: 0.55,
    accent: '#c8b8ff',
    tagline: 'Tongkat bulan perak berorb lavender',
    fx: {
      tembak: 'Orb menyerap cahaya bintang (charge) dengan lingkaran rune perak, lalu melepas sabit bulan bersama gelombang cahaya.',
      peluru: 'Sabit bulan bercahaya putih-lavender dengan bayangan sabit susulan, jejak debu bintang & bintang kecil mengorbit.',
      kena: 'Gelombang sabit bulan, lingkaran rune perak, sinar bulan, debu bintang melayang naik, kawah bulan bercahaya di roda & sabit bulan tertancap.',
    },
  },
  {
    id: 'storm',
    name: 'STORM CALLER',
    rarity: 'LEGEND',
    set: 5,
    ammo: 6,
    cooldown: 0.7,
    accent: '#6cc8ff',
    tagline: 'Penyeru badai bergelombang petir',
    fx: {
      tembak: 'Dua penangkal petir menyala dengan busur listrik yang menegang (charge), lalu bola petir dilepaskan.',
      peluru: 'Bola petir putih-biru dengan lengkung listrik acak & ekor petir bergerigi.',
      kena: 'Bola petir menyentuh roda, lalu SAMBARAN PETIR raksasa dari langit menghantam titik itu: layar berkilat, petir menjalar di roda & pola hangus Lichtenberg.',
    },
  },
  {
    id: 'pencil',
    name: 'PENCIL GUN',
    rarity: 'UMUM',
    set: 5,
    ammo: 8,
    cooldown: 0.3,
    accent: '#ffd23a',
    tagline: 'Pensil 2B yang menembakkan pensil',
    fx: {
      tembak: 'Ujung grafit berdebu, serutan kayu keriting, remah penghapus merah muda & coretan terlempar.',
      peluru: 'Pensil kuning berujung tajam dengan jejak coretan grafit berlekuk di belakangnya.',
      kena: '"TAK!" Pensil menancap bergetar, serutan kayu, serpihan, remah penghapus & coretan sketsa tergores di permukaan roda.',
    },
  },
  {
    id: 'sandal',
    name: 'SANDAL JEPIT',
    rarity: 'UMUM',
    set: 5,
    ammo: 7,
    cooldown: 0.5,
    accent: '#4a90ff',
    tagline: 'Peluncur sandal jepit "Enak Power"',
    fx: {
      tembak: 'Sandal terlontar dari moncong bergaris, awan debu & bintang kecil, lalu sandal berikutnya naik masuk (reload).',
      peluru: 'Sandal jepit biru berputar 3D dengan garis kecepatan & debu di belakangnya.',
      kena: '"PLAK!" ledakan komik, cincin debu, bintang pusing berputar di atas sandal yang menempel miring & bergetar di roda.',
    },
  },
  {
    id: 'paintball',
    name: 'PAINTBALL GUN',
    rarity: 'UMUM',
    set: 5,
    ammo: 8,
    cooldown: 0.28,
    accent: '#ff4f9a',
    tagline: 'Marker cat dengan hopper warna-warni',
    fx: {
      tembak: 'Letupan gas CO2 putih, kabut cat berwarna & tetes cat; warna berganti tiap tembakan (merah, biru, hijau, kuning, magenta).',
      peluru: 'Bola cat mengkilap dengan jejak cat cair & tetesan yang berterbangan.',
      kena: 'SPLAT! Cipratan cat berduri, tetesan cat, noda cat permanen di roda yang menetes ke bawah & gumpalan cat menempel.',
    },
  },
  {
    id: 'wand',
    name: 'MAGIC WAND',
    rarity: 'RARE',
    set: 5,
    ammo: 7,
    cooldown: 0.4,
    accent: '#c58bff',
    tagline: 'Tongkat sihir bergelombang bintang',
    fx: {
      tembak: 'Bintang di ujung tongkat menyala, pusaran spiral merah muda, lingkaran rune & percikan sihir.',
      peluru: 'Bintang emas-merah muda berputar dengan spiral titik-titik bintang menjuntai di belakangnya.',
      kena: 'Ledakan bintang & kilau glitter, lingkaran sihir bersinar, bintang sihir tercap di roda & bintang emas tertancap berkelip.',
    },
  },
  {
    id: 'shark',
    name: 'SHARK LAUNCHER',
    rarity: 'EPIC',
    set: 5,
    ammo: 6,
    cooldown: 0.55,
    accent: '#3fa7ff',
    tagline: 'Peluncur hiu dengan rahang bergigi',
    fx: {
      tembak: 'Rahang hiu menganga, semburan air berbuih, cipratan & gelembung berhamburan dari moncong.',
      peluru: 'Hiu kartun berenang di udara dengan mulut bergigi, ekor mengibas & jejak air berbuih.',
      kena: '"CHOMP!" Rahang hiu mengatup menggigit roda: bekas gigi, cipratan air, & hiu bergelantung dengan ekor mengibas.',
    },
  },
  {
    id: 'ghost',
    name: 'GHOST GUN',
    rarity: 'EPIC',
    set: 5,
    ammo: 6,
    cooldown: 0.55,
    accent: '#6ff7e6',
    tagline: 'Senjata hantu berapi arwah biru',
    fx: {
      tembak: 'Kabut dingin, cahaya arwah toska, wisp berpusar & teks "BOO!" dengan wajah hantu membuka mulut.',
      peluru: 'Hantu lucu tembus pandang dengan ekor bergelombang, mata menyala & wisp biru di jejaknya.',
      kena: 'Roh hantu meraung naik dari roda, cahaya dingin, retakan beku toska & hantu kecil menempel melayang.',
    },
  },
  {
    id: 'ufo',
    name: 'UFO RAY',
    rarity: 'EPIC',
    set: 5,
    ammo: 6,
    cooldown: 0.6,
    accent: '#7dff8f',
    tagline: 'Piring terbang pemancar sinar hijau',
    fx: {
      tembak: 'Kubah piring terbang menyala, energi hijau berdenyut & cincin sinar keluar dari moncong.',
      peluru: 'Piring terbang mini bercahaya dengan lampu pinggir berkedip & sinar penarik di belakangnya.',
      kena: 'Sinar penarik (tractor beam) menyedot serpihan roda, pola lingkaran alien hijau menyala & piring terbang menempel.',
    },
  },
  {
    id: 'rainbow',
    name: 'RAINBOW GUN',
    rarity: 'LEGEND',
    set: 5,
    ammo: 7,
    cooldown: 0.4,
    accent: '#ff8fd0',
    tagline: 'Senjata pelangi dengan awan ceria',
    fx: {
      tembak: 'Letupan pelangi tujuh warna, awan putih mengepul, bintang warna-warni & busur pelangi bersinar.',
      peluru: 'Komet putih berekor tujuh pita pelangi bergelombang & bintang berwarna di jejaknya.',
      kena: 'Tujuh cincin pelangi menyebar, glitter warna-warni, awan, busur pelangi tercap di roda & pelangi mini tertancap.',
    },
  },
  {
    id: 'meteor',
    name: 'METEOR LAUNCHER',
    rarity: 'LEGEND',
    set: 5,
    ammo: 5,
    cooldown: 0.9,
    accent: '#ff7a2b',
    tagline: 'Peluncur batu meteor berurat lava',
    fx: {
      tembak: 'Retakan lava menyala berdenyut (charge), lalu meletus: bola api, batu panas terlontar & guncangan layar.',
      peluru: 'Batu meteor berurat lava berputar dengan ekor api panjang, asap hitam & serpihan batu menyala.',
      kena: 'HANTAMAN: bola api raksasa, cincin kejut berlapis, hujan batu panas & percikan lava, kawah hangus berurat lava di roda & meteor menyala tertanam.',
    },
  },
  {
    id: 'diamond',
    name: 'DIAMOND GUN',
    rarity: 'LEGEND',
    set: 5,
    ammo: 7,
    cooldown: 0.4,
    accent: '#8fe3ff',
    tagline: 'Pistol kristal berintan berlian',
    fx: {
      tembak: 'Kilau bintang tajam, sinar prisma pelangi & serpihan kristal mini dari moncong.',
      peluru: 'Berlian berfacet berputar 3D dengan garis dispersi merah-hijau-biru & debu kristal.',
      kena: 'Berlian PECAH jadi serpihan kristal berfacet, kilatan prisma pelangi, retakan es bercahaya, kristal kecil menempel & berlian tertancap berkilau.',
    },
  },
  // ───────────── SET 6 ─────────────
  {
    id: 'fish',
    name: 'FISH GUN',
    rarity: 'RARE',
    set: 6,
    ammo: 7,
    cooldown: 0.4,
    accent: '#ff9a2b',
    tagline: 'Pistol berbentuk ikan oranye',
    fx: {
      tembak: 'Mulut ikan menganga, semburan air & gelembung, badan ikan menggembung.',
      peluru: 'Ikan kartun oranye berenang di udara dengan ekor mengibas, jejak air berbuih & gelembung.',
      kena: '"PLASH!" Ikan menampar roda: cipratan mahkota air, sisik berkilau beterbangan, noda basah menetes & ikan menggelepar menancap.',
    },
  },
  {
    id: 'rpg',
    name: 'RPG-7',
    rarity: 'RARE',
    set: 6,
    ammo: 6,
    cooldown: 0.7,
    accent: '#8fd13f',
    tagline: 'Peluncur granat berhulu ledak hijau',
    fx: {
      tembak: 'Letupan api & asap di moncong, semburan asap samping, granat meluncur lalu hulu ledak baru naik (reload).',
      peluru: 'Granat bersirip dengan motor roket menyala: melaju makin cepat dengan ekor api & asap tebal.',
      kena: 'LEDAKAN: bola api, cincin kejut, serpihan kayu & batu, kawah hangus berasap & hulu ledak tertancap membara.',
    },
  },
  {
    id: 'cricket',
    name: 'NOISY CRICKET',
    rarity: 'EPIC',
    set: 6,
    ammo: 5,
    cooldown: 0.75,
    accent: '#c58bff',
    tagline: 'Pistol mungil berdentum dahsyat',
    fx: {
      tembak: 'Antena berkedip, "KRIK!", lalu ledakan plasma ungu raksasa dengan hentakan keras & gelombang kejut.',
      peluru: 'Bola plasma ungu-putih berpilin spiral dengan lengkung listrik & ekor cahaya.',
      kena: 'Ledakan plasma dahsyat: layar berkilat & berguncang, cincin kejut berlapis, kawah ungu menyala & bola plasma tertanam.',
    },
  },
  {
    id: 'electro',
    name: 'ELECTRO GUN',
    rarity: 'EPIC',
    set: 6,
    ammo: 7,
    cooldown: 0.45,
    accent: '#5cc8ff',
    tagline: 'Senjata tesla berkoil emas',
    fx: {
      tembak: 'Koil emas menyala berurutan, busur petir membelit laras & percikan listrik.',
      peluru: 'Bola listrik biru-putih dengan lengkung petir acak bercabang & ekor bergerigi.',
      kena: 'Petir BERANTAI melompat ke senjata yang sudah tertancap, menjalar di permukaan roda, pola hangus & simpul tesla menyala.',
    },
  },
  {
    id: 'bazooka',
    name: 'BAZOOKA',
    rarity: 'EPIC',
    set: 6,
    ammo: 5,
    cooldown: 0.85,
    accent: '#a3c24a',
    tagline: 'Peluncur roket hijau zaitun',
    fx: {
      tembak: 'Letupan api, cincin asap menyebar & semburan belakang, roket melesat dengan guncangan layar.',
      peluru: 'Roket ramping berujung merah dengan ekor asap putih berpilin panjang & api knalpot.',
      kena: 'Ledakan besar, gelombang kejut debu, awan jamur menjulang, hujan serpihan, kawah hangus & selongsong roket tertancap.',
    },
  },
  {
    id: 'freeze',
    name: 'FREEZE RAY',
    rarity: 'LEGEND',
    set: 6,
    ammo: 6,
    cooldown: 0.75,
    accent: '#7fe8ff',
    tagline: 'Sinar pembeku berkristal es',
    fx: {
      tembak: 'Kabut dingin berpusar menyedot ke kristal, lalu sinar es cyan menyembur dengan kepingan salju.',
      peluru: 'Sinar beku instan berkilau, kristal es mekar di sepanjang jalurnya & kabut dingin.',
      kena: 'Roda MEMBEKU: embun beku merambat dengan kristal bercabang, ledakan es, serpihan kristal & bongkahan es tertancap.',
    },
  },
  {
    id: 'rail',
    name: 'RAILGUN',
    rarity: 'EPIC',
    set: 6,
    ammo: 5,
    cooldown: 0.9,
    accent: '#6ab0ff',
    tagline: 'Meriam rel elektromagnetik',
    fx: {
      tembak: 'Koil menyala berurutan dari belakang (charge), lalu DUAR: sinar biru-putih menembus dengan cincin elektromagnetik.',
      peluru: 'Proyektil hiper-cepat berekor biru menyilaukan, cincin kejut sepanjang jalur & busur listrik.',
      kena: 'Menembus tajam: kilatan putih, garis kejut radial, lubang berpinggir menyala, roda terhentak keras & peluru berpijar tertancap.',
    },
  },
  {
    id: 'magnet',
    name: 'MAGNET GUN',
    rarity: 'EPIC',
    set: 6,
    ammo: 6,
    cooldown: 0.55,
    accent: '#ff5a5a',
    tagline: 'Magnet tapal kuda berkoil tembaga',
    fx: {
      tembak: 'Medan magnet merah-biru berdenyut di antara kutub, garis gaya & percikan.',
      peluru: 'Magnet tapal kuda berputar dengan garis medan & serbuk besi yang tertarik mengikuti.',
      kena: 'Serbuk besi tersedot ke titik tumbukan membentuk pola garis medan di roda; magnet menempel dengan medan berdenyut.',
    },
  },
  {
    id: 'shrink',
    name: 'SHRINK RAY',
    rarity: 'EPIC',
    set: 6,
    ammo: 6,
    cooldown: 0.5,
    accent: '#4dff8a',
    tagline: 'Sinar pengecil hijau',
    fx: {
      tembak: 'Cincin hijau menyusut ke dalam di sepanjang antena, lalu sinar melesat.',
      peluru: 'Orb hijau dengan cincin menyempit yang ikut mengecil selama terbang.',
      kena: 'Cincin menyusut ke pusat dan RODA MENGECIL sesaat lalu membal kembali, tanda "SHRINK!" & orb mini tertancap.',
    },
  },
  {
    id: 'grow',
    name: 'GROW RAY',
    rarity: 'EPIC',
    set: 6,
    ammo: 6,
    cooldown: 0.5,
    accent: '#ff9a2b',
    tagline: 'Sinar pembesar oranye',
    fx: {
      tembak: 'Cincin oranye mengembang keluar di sepanjang antena, lalu sinar melesat.',
      peluru: 'Orb oranye dengan cincin melebar yang membesar selama terbang.',
      kena: 'Cincin meledak keluar dan RODA MEMBENGKAK sesaat lalu membal, tanda "GROW!" & orb yang tumbuh besar menancap.',
    },
  },
  {
    id: 'pirate',
    name: 'MERIAM BAJAK LAUT',
    rarity: 'EPIC',
    set: 6,
    ammo: 5,
    cooldown: 0.85,
    accent: '#ffcc33',
    tagline: 'Meriam besi berlambang tengkorak',
    fx: {
      tembak: 'Sumbu menyala, dentuman mesiu, cincin asap tebal & koin emas terlontar.',
      peluru: 'Bola meriam besi berlambang tengkorak dengan ekor asap & percikan sumbu.',
      kena: 'Hantaman berat: serpihan kayu besar, koin emas berhamburan, asap tebal, kawah retak & bola tengkorak tertanam.',
    },
  },
  {
    id: 'card',
    name: 'CARD GUN',
    rarity: 'EPIC',
    set: 6,
    ammo: 8,
    cooldown: 0.3,
    accent: '#ff4f6a',
    tagline: 'Penembak kartu remi',
    fx: {
      tembak: 'Kartu terlontar dari slot dengan kilau bintang & kartu-kartu mini berhamburan; jenis kartu berganti (♥ ♠ ♦ ♣).',
      peluru: 'Kartu remi berputar tajam dengan simbol sekop/hati/wajik/keriting & jejak bintang.',
      kena: 'Kartu menancap tegak bergetar, lalu ledakan kartu mini & simbol kartu beterbangan seperti pesulap.',
    },
  },
  // ───────────── SET 7 ─────────────
  {
    id: 'holy',
    name: 'HOLY LIGHT GUN',
    rarity: 'LEGEND',
    set: 7,
    ammo: 6,
    cooldown: 0.5,
    accent: '#ffe08a',
    tagline: 'Senjata suci bersayap malaikat',
    fx: {
      tembak: 'Cincin halo menyala di moncong, bulu & cahaya suci memancar, sayap mengepak.',
      peluru: 'Bola cahaya suci bersayap kecil berhalo, jejak bintang emas & bulu melayang.',
      kena: 'Pilar cahaya turun dari langit, cincin halo menyebar, bulu beterbangan, salib suci tercap di roda & salib emas menancap.',
    },
  },
  {
    id: 'unicorn',
    name: 'RAINBOW UNICORN',
    rarity: 'LEGEND',
    set: 7,
    ammo: 7,
    cooldown: 0.4,
    accent: '#ff8fd0',
    tagline: 'Unicorn imut berpelangi',
    fx: {
      tembak: 'Tanduk menyala, ledakan pelangi tujuh warna, hati & bintang berhamburan.',
      peluru: 'Tanduk unicorn berspiral dengan pita pelangi bergelombang di belakangnya.',
      kena: 'Tanduk menancap, ledakan pelangi & cincin pelangi, hati merah muda melayang, glitter warna-warni & tanduk berkilau tertancap.',
    },
  },
  {
    id: 'obliterator',
    name: 'OBLITERATOR 9000',
    rarity: 'LEGEND',
    set: 7,
    ammo: 5,
    cooldown: 0.8,
    accent: '#7dff4a',
    tagline: 'Penghancur radioaktif hijau',
    fx: {
      tembak: 'Tabung hijau berdenyut mengisi energi (charge), lalu orb radioaktif dilepas dengan semburan racun.',
      peluru: 'Orb radioaktif berlambang nuklir berputar dengan jejak lendir racun & gelembung.',
      kena: 'Ledakan radiasi: cincin hijau berdenyut, awan racun, lendir hijau menetes di roda, lambang radiasi tercap & orb menyala tertanam.',
    },
  },
  {
    id: 'coin',
    name: 'COIN GUN',
    rarity: 'EPIC',
    set: 7,
    ammo: 8,
    cooldown: 0.3,
    accent: '#ffd23a',
    tagline: 'Penembak koin emas',
    fx: {
      tembak: 'Koin terlontar dari cincin emas, koin-koin mini & kilau bintang emas berhamburan.',
      peluru: 'Koin emas berputar membalik dengan jejak kilau & koin kecil.',
      kena: '"CLING!" Koin-koin berhamburan, kilau emas, koin besar menancap tegak di roda & bergetar.',
    },
  },
  {
    id: 'saber',
    name: 'PHOTON SABER',
    rarity: 'LEGEND',
    set: 7,
    ammo: 6,
    cooldown: 0.45,
    accent: '#6fe0ff',
    tagline: 'Pedang cahaya biru',
    fx: {
      tembak: 'Pedang diayunkan menebas, jejak busur cahaya & percikan foton.',
      peluru: 'Gelombang tebasan foton berbentuk sabit cyan menyilaukan dengan bayangan susulan.',
      kena: 'Tebasan menyayat roda: garis belah bercahaya, percikan foton, cincin energi & bilah foton menancap berdenging.',
    },
  },
  {
    id: 'gauntlet',
    name: 'GAUNTLET CANNON',
    rarity: 'LEGEND',
    set: 7,
    ammo: 5,
    cooldown: 0.6,
    accent: '#ff6a3a',
    tagline: 'Sarung tinju robot peluncur',
    fx: {
      tembak: 'Sarung tinju robot terlontar keluar dengan uap hidrolik, lalu sarung tinju baru naik (reload).',
      peluru: 'Sarung tinju robot melesat dengan roket kecil, makin cepat.',
      kena: '"POW!" Sarung tinju menghantam & MENANCAP di roda: retakan dalam, cekungan berlapis, serpihan logam & guncangan dahsyat.',
    },
  },
  {
    id: 'ruby',
    name: 'RUBY REVOLVER',
    rarity: 'RARE',
    set: 7,
    ammo: 8,
    cooldown: 0.35,
    accent: '#ff4a6a',
    tagline: 'Revolver emas bertatah rubi',
    fx: {
      tembak: 'Silinder berputar satu langkah, kilatan merah rubi, kilau & asap tipis.',
      peluru: 'Peluru rubi berfacet dengan jejak kilau merah.',
      kena: 'Rubi pecah jadi serpihan berfacet, kilatan merah, retakan bercahaya & rubi menancap berkilau.',
    },
  },
  {
    id: 'emerald',
    name: 'EMERALD LASER',
    rarity: 'EPIC',
    set: 7,
    ammo: 6,
    cooldown: 0.7,
    accent: '#3dff9a',
    tagline: 'Laser zamrud berkristal',
    fx: {
      tembak: 'Zamrud menyerap cahaya (charge) dengan sinar berputar, lalu laser hijau menembus.',
      peluru: 'Sinar laser zamrud berkilau dengan percikan kristal & riak energi.',
      kena: 'Sinar membakar garis hijau di roda, serpihan zamrud & kristal zamrud TUMBUH dari titik tembak.',
    },
  },
  {
    id: 'sapphire',
    name: 'SAPPHIRE SHOTGUN',
    rarity: 'EPIC',
    set: 7,
    ammo: 6,
    cooldown: 0.6,
    accent: '#5a9bff',
    tagline: 'Shotgun laras ganda bertatah safir',
    fx: {
      tembak: 'Kilatan biru besar, serpihan safir menyembur, asap & guncangan keras.',
      peluru: '7 butir serpihan safir menyebar seperti tracer biru.',
      kena: 'Pola lubang bercahaya biru, serpihan kristal safir terpental & gem kecil menempel di roda.',
    },
  },
  {
    id: 'crystal',
    name: 'CRYSTAL CANNON',
    rarity: 'EPIC',
    set: 7,
    ammo: 6,
    cooldown: 0.6,
    accent: '#c27aff',
    tagline: 'Meriam berkristal ungu',
    fx: {
      tembak: 'Kristal ungu di moncong menyala berdenyut, pecahan kristal & debu kristal beterbangan.',
      peluru: 'Kristal ametis besar berputar dengan kristal kecil mengorbit & jejak debu ungu.',
      kena: 'Kristal pecah berhamburan, lalu gugusan kristal ungu TUMBUH dari roda dengan kilau bercahaya.',
    },
  },
  {
    id: 'beerifle',
    name: 'BEE RIFLE',
    rarity: 'EPIC',
    set: 7,
    ammo: 7,
    cooldown: 0.5,
    accent: '#ffc928',
    tagline: 'Senapan lebah bertombak sengat',
    fx: {
      tembak: 'Sengat naik ke moncong (reload), kawanan lebah menyembur dengan dengung "BZZ".',
      peluru: 'Sengat lebah belang kuning-hitam dengan lebah-lebah kecil mengitari.',
      kena: 'Sengat menancap bergetar, kawanan lebah menyebar, madu menetes & "BZZT!".',
    },
  },
  {
    id: 'charge',
    name: 'CHARGE BLASTER',
    rarity: 'EPIC',
    set: 7,
    ammo: 8,
    cooldown: 0.26,
    accent: '#4ac8ff',
    tagline: 'Mega Buster lengan robot, tembak cepat',
    fx: {
      tembak: 'Meriam lengan menyerap energi sangat singkat (charge cepat), lalu plasma cyan ditembakkan dengan jeda antar tembakan yang pendek.',
      peluru: 'Bola plasma besar cyan-putih berpilin dengan ekor energi.',
      kena: '"BLAST!" Ledakan plasma cyan, cincin kejut, kawah menyala & bola plasma menempel.',
    },
  },
  {
    id: 'pulse',
    name: 'PULSE RIFLE',
    rarity: 'RARE',
    set: 7,
    ammo: 8,
    cooldown: 0.35,
    accent: '#4ad8ff',
    tagline: 'Senapan pulsa energi',
    fx: {
      tembak: 'Cincin pulsa cyan merambat naik di laras, kilatan kecil bergetar.',
      peluru: 'Baut pulsa cyan memanjang dengan 2 bayangan susulan & cincin kejut.',
      kena: 'Tiga denyut cincin kejut beruntun, bekas hangus bercahaya & baut pulsa menancap.',
    },
  },
  {
    id: 'cryo',
    name: 'CRYO BLASTER',
    rarity: 'RARE',
    set: 7,
    ammo: 7,
    cooldown: 0.4,
    accent: '#8fe8ff',
    tagline: 'Penyembur es nitrogen cair',
    fx: {
      tembak: 'Kabut dingin menyembur dari nozel, kepingan salju & kristal es beterbangan.',
      peluru: 'Tombak es heksagonal memanjang dengan kabut beku & kilau dingin.',
      kena: 'Es mekar dari titik tumbukan, serpihan es, noda beku & gugusan es menancap tumbuh.',
    },
  },
  {
    id: 'hyperdrive',
    name: 'HYPERDRIVE CANNON',
    rarity: 'RARE',
    set: 7,
    ammo: 6,
    cooldown: 0.55,
    accent: '#7ab8ff',
    tagline: 'Meriam kecepatan cahaya',
    fx: {
      tembak: 'Cincin akselerator menyala berurutan ke moncong, lalu lompatan cahaya (warp).',
      peluru: 'Garis kecepatan putih-biru sangat panjang dengan cincin warp.',
      kena: 'Ledakan garis warp radial, cincin kejut & roda tertarik melar sesaat lalu membal, inti warp menempel.',
    },
  },
  {
    id: 'quantum',
    name: 'QUANTUM DESTABILIZER',
    rarity: 'EPIC',
    set: 7,
    ammo: 6,
    cooldown: 0.6,
    accent: '#c070ff',
    tagline: 'Pengacau kuantum ungu',
    fx: {
      tembak: 'Koil spiral berputar, laras berkedip ganda (glitch) & piksel kuantum berhamburan.',
      peluru: 'Orb kuantum ungu dengan 3 klon fase berkedip & serpihan glitch.',
      kena: 'Roda "terdestabilisasi": bergetar glitch, kotak piksel ungu-cyan, cincin partikel & pusaran kuantum tertanam.',
    },
  },
  {
    id: 'wars',
    name: 'WARS BLASTER',
    rarity: 'LEGEND',
    set: 7,
    ammo: 8,
    cooldown: 0.3,
    accent: '#ff3b3b',
    tagline: 'Blaster hitam bercahaya merah',
    fx: {
      tembak: 'Kilatan merah singkat dari lensa, hentakan tajam & asap tipis.',
      peluru: 'Baut laser merah dengan inti putih menyilaukan dan jejak cahaya.',
      kena: 'Percikan merah, lubang hangus berpijar, cincin merah kecil & asap tipis.',
    },
  },
];

export const WEAPON_MAP: Record<WeaponId, WeaponDef> = WEAPONS.reduce(
  (m, w) => {
    m[w.id] = w;
    return m;
  },
  {} as Record<WeaponId, WeaponDef>,
);

export interface StuckItem {
  weapon: WeaponId;
  angle: number; // local angle on the wheel
  half: number; // angular half width (collision)
  protrude: number; // how far it sticks out from the rim
  t: number; // age
  seed: number;
  front: boolean; // drawn above wheel
  shape?: number[];
  rotS?: number;
  beads?: { da: number; s: number }[];
  wob?: number;
  up?: number; // rotation that cancels wheel rotation (world "up" frame)
  world: { x: number; y: number };
}

export interface WeaponAnim {
  /** Optional mirrored saber swing for the Gun Hit integration. */
  saberSide?: -1 | 1;
  fireT: number;
  recoil: number;
  recoilV: number;
  slide: number;
  pump: number;
  pumpStart: number;
  charge: number;
  charging: boolean;
  orb: number;
  pouchY: number;
  pouchV: number;
  pouchTarget: number;
  loaded: boolean;
  bandWob: number;
  pulse: number;
  tassel: number;
  tasselV: number;
  water: number;
  slosh: number;
  gauge: number;
  pumpS: number;
  intro: number;
  bolt: number;
  lift: number;
  boltStart: number;
  fuse: number;
  fan: number;
  spin: number;
  spinV: number;
  heat: number;
  idx: number;
}

export function newAnim(): WeaponAnim {
  return {
    fireT: 99,
    recoil: 0,
    recoilV: 0,
    slide: 0,
    pump: 0,
    pumpStart: -1,
    charge: 0,
    charging: false,
    orb: 1,
    pouchY: 46,
    pouchV: 0,
    pouchTarget: 46,
    loaded: true,
    bandWob: 0,
    pulse: -1,
    tassel: 0,
    tasselV: 0,
    water: 1,
    slosh: 0,
    gauge: 0.92,
    pumpS: 0,
    intro: 0,
    bolt: 0,
    lift: 0,
    boltStart: -1,
    fuse: 0,
    fan: 0,
    spin: 0,
    spinV: 0,
    heat: 0,
    idx: 0,
  };
}
