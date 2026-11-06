import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import { readFileSync } from 'node:fs';

/**
 * Storage that a cross-origin frame may be refused.
 *
 * The hub is embedded by the host page, so every one of its frames is a
 * third-party context: a browser with third-party storage blocked throws
 * `SecurityError` the moment `localStorage` is touched. Slide 1 reads its coins,
 * weapon, collection and quests during the first render, so that throw unmounted
 * the whole tree and the page came up blank. The games' own engines read a saved
 * best score in their constructors, which blanked those slides the same way.
 *
 * This runs before any module on every page and swaps in an in-memory store when
 * the real one refuses to be used, so the games keep playing. The memory store is
 * backed by `window.name` (readable synchronously, survives a reload of the same
 * frame) and IndexedDB (survives real reloads where the browser allows it), so a
 * save usually outlives the reload even in that mode. `__gunhitStoragePending` and
 * `__gunhitStorageReady` let slide 1 wait for that restore before it reads. All of
 * it is best effort: if both extra stores are refused the game just runs on memory.
 */
const STORAGE_SHIM = `<script>
(function () {
  // A blocked frame throws on the *property*, so this has to be installed before
  // any module runs. Everything below is best effort: the memory store alone
  // already keeps the games playable, and each extra layer only adds persistence.
  var NAME_SLOT = '__gunhit_kv';
  var DB_NAME = 'gunhit_storage';
  var STORE = 'kv';
  var FLUSH_MS = 200;
  var OPEN_MS = 400;

  var finishHydrate = null;
  var hydrated = false;
  var ready = new Promise(function (resolve) {
    finishHydrate = function () {
      if (hydrated) return;
      hydrated = true;
      try { window.__gunhitStoragePending = false; } catch (e) { /* ignore */ }
      resolve();
    };
  });
  try { window.__gunhitStorageReady = ready; } catch (e) { /* ignore */ }

  function memoryStore(seed, onWrite) {
    var data = Object.create(null);
    if (seed) {
      for (var k in seed) if (typeof seed[k] === 'string') data[k] = seed[k];
    }
    return {
      getItem: function (key) { key = String(key); return key in data ? data[key] : null; },
      setItem: function (key, value) { key = String(key); data[key] = String(value); onWrite(key); },
      removeItem: function (key) { key = String(key); delete data[key]; onWrite(key); },
      clear: function () {
        data = Object.create(null);
        onWrite('*');
      },
      key: function (i) { return Object.keys(data)[i] || null; },
      get length() { return Object.keys(data).length; },
      // Used by this shim only; the games see a plain Storage.
      __dump: function () { return data; },
      __load: function (more) { for (var k in more) data[k] = more[k]; }
    };
  }

  function usable(name) {
    try {
      var store = window[name];
      if (!store) return false;
      store.getItem('__storage_probe');
      return true;
    } catch (e) {
      return false;
    }
  }

  // 1) window.name survives a reload of this frame and is not storage, so it is
  //    the one seed that can be read synchronously, before the first render.
  function readName() {
    try {
      var raw = window.name;
      if (!raw || raw.indexOf(NAME_SLOT) !== 0) return null;
      var parsed = JSON.parse(raw.slice(NAME_SLOT.length));
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (e) {
      return null;
    }
  }
  function writeName(data) {
    try { window.name = NAME_SLOT + JSON.stringify(data); } catch (e) { /* ignore */ }
  }

  // 2) IndexedDB survives real reloads even where localStorage is refused.
  var db = null;
  var dirty = Object.create(null);
  var flushTimer = 0;

  function openDb(cb) {
    var factory = null;
    try { factory = window.indexedDB; } catch (e) { factory = null; }
    if (!factory || !factory.open) { cb(null); return; }
    var done = false;
    function close(value) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      cb(value);
    }
    var timer = setTimeout(function () { close(null); }, OPEN_MS);
    try {
      var request = factory.open(DB_NAME, 1);
      request.onupgradeneeded = function () {
        try { request.result.createObjectStore(STORE); } catch (e) { /* already there */ }
      };
      request.onsuccess = function () { close(request.result); };
      request.onerror = function () { close(null); };
      request.onblocked = function () { close(null); };
    } catch (e) {
      close(null);
    }
  }

  function readAll(handle, cb) {
    try {
      var tx = handle.transaction(STORE, 'readonly');
      var objectStore = tx.objectStore(STORE);
      var keys = objectStore.getAllKeys();
      var values = objectStore.getAll();
      tx.oncomplete = function () {
        var out = Object.create(null);
        var ks = keys.result || [];
        var vs = values.result || [];
        for (var i = 0; i < ks.length; i++) {
          if (typeof vs[i] === 'string') out[String(ks[i])] = vs[i];
        }
        cb(out);
      };
      tx.onerror = function () { cb(null); };
      tx.onabort = function () { cb(null); };
    } catch (e) {
      cb(null);
    }
  }

  function writeMany(handle, puts, deletes) {
    try {
      var tx = handle.transaction(STORE, 'readwrite');
      var objectStore = tx.objectStore(STORE);
      for (var i = 0; i < puts.length; i++) objectStore.put(puts[i][1], puts[i][0]);
      for (var j = 0; j < deletes.length; j++) objectStore.delete(deletes[j]);
    } catch (e) { /* best effort */ }
  }

  var saved = null;

  function flush() {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = 0; }
    if (!saved) return;
    var data = saved.__dump();
    writeName(data);
    if (!db) return;
    var puts = [];
    var deletes = [];
    for (var key in dirty) {
      if (key in data) puts.push([key, data[key]]);
      else deletes.push(key);
    }
    dirty = Object.create(null);
    if (puts.length || deletes.length) writeMany(db, puts, deletes);
  }

  function touched(key) {
    if (key === '*') {
      var all = saved.__dump();
      for (var k in all) dirty[k] = true;
    } else {
      dirty[key] = true;
    }
    if (!flushTimer) flushTimer = setTimeout(flush, FLUSH_MS);
  }

  var localBlocked = !usable('localStorage');
  var sessionBlocked = !usable('sessionStorage');

  if (!localBlocked && !sessionBlocked) {
    finishHydrate();
    return;
  }

  if (sessionBlocked) {
    var sessionFallback = memoryStore(null, function () {});
    try {
      Object.defineProperty(window, 'sessionStorage', { configurable: true, get: function () { return sessionFallback; } });
    } catch (e) { /* ignore */ }
  }

  if (!localBlocked) {
    finishHydrate();
    return;
  }

  saved = memoryStore(readName(), touched);
  try {
    Object.defineProperty(window, 'localStorage', { configurable: true, get: function () { return saved; } });
  } catch (e) {
    try { window.localStorage = saved; } catch (e2) { /* nothing else to try */ }
  }

  try { window.__gunhitStoragePending = true; } catch (e) { /* ignore */ }
  try {
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('pagehide', flush);
      window.addEventListener('visibilitychange', function () {
        if (window.document && window.document.visibilityState === 'hidden') flush();
      });
    }
  } catch (e) { /* ignore */ }

  openDb(function (handle) {
    if (!handle) { finishHydrate(); return; }
    db = handle;
    readAll(handle, function (remote) {
      if (remote) {
        var fresh = Object.create(null);
        for (var key in remote) {
          // A value written during this session wins over the stored one.
          if (!(key in dirty)) fresh[key] = remote[key];
        }
        saved.__load(fresh);
        // The seed from window.name may hold newer values than the database.
        var nameSeed = readName();
        if (nameSeed) saved.__load(nameSeed);
      }
      finishHydrate();
    });
  });
})();
</script>`;

/**
 * Versi rilis, dibaca dari `android/version.properties` — satu-satunya tempat
 * angka versionCode/versionName diubah. Nilainya disuntik ke bundle sebagai
 * `__APP_VERSION__` supaya event telemetri selalu melaporkan versi build yang
 * benar-benar berjalan.
 */
function releaseVersion(): string {
  try {
    const raw = readFileSync(path.resolve(process.cwd(), 'android/version.properties'), 'utf8');
    const name = /^versionName\s*=\s*(.+)$/m.exec(raw)?.[1]?.trim() ?? '0.0.0';
    const code = /^versionCode\s*=\s*(\d+)$/m.exec(raw)?.[1]?.trim() ?? '0';
    return `${name}+${code}`;
  } catch {
    return 'dev';
  }
}

function standbyControlPlugin() {
  return {
    name: 'standby-control',
    transformIndexHtml(html: string, ctx: { path?: string }) {
      const withStorage = html.includes('__storage_probe')
        ? html
        : html.replace('</head>', `${STORAGE_SHIM}</head>`);
      if (!ctx.path || !ctx.path.includes('/games/')) return withStorage;
      return withStorage.replace(
        '</head>',
        `<script>
(function() {
  var isStandby = new URLSearchParams(window.location.search).get('standby') === '1';
  var running = !isStandby;
  var origRAF = window.requestAnimationFrame;
  var initialFrames = 0;
  var pendingCallback = null;

  window.requestAnimationFrame = function(cb) {
    if (!running && initialFrames >= 2) {
      pendingCallback = cb;
      return 0;
    }
    return origRAF.call(window, function(time) {
      initialFrames++;
      cb(time);
    });
  };

  function resume() {
    if (running) return;
    running = true;
    if (pendingCallback) {
      var cb = pendingCallback;
      pendingCallback = null;
      origRAF.call(window, cb);
    }
  }

  function pause() {
    running = false;
  }

  window.addEventListener('message', function(e) {
    var data = e.data;
    if (data === 'GAME_RESUME' || (data && data.type === 'GAME_RESUME')) resume();
    if (data === 'GAME_PAUSE' || (data && data.type === 'GAME_PAUSE')) pause();
  });

  window.addEventListener('pointerdown', resume, { capture: true });
  window.addEventListener('keydown', resume, { capture: true });
  window.__resumeGame = resume;
  window.__pauseGame = pause;
})();
</script></head>`
      );
    },
  };
}

/**
 * The menu's weapon showcase is the first thing a player looks at, but its art
 * sits behind a dynamic import (`menuGunArt` → `gunhit-art` → the gun modules →
 * the ported slides). Vite cannot preload a chain it only discovers *after*
 * `App.tsx` runs, so the weapon used to pop in a second or more after the title
 * every time the app opened.
 *
 * The chain is known at build time, so announce it in `index.html`: the browser
 * then downloads it beside the app shell instead of after it, and the gun is
 * parsed and on screen with the first paint.
 */
export function preloadMenuGunArt(): Plugin {
  /** Chunks the menu needs before it can draw a single weapon. */
  const MENU_ART = [
    /^menuGunArt-/, /^gunhit-art-/, /^gunhit-art-guns-/, /^gunhit-art-variants-/,
    /^ported-4-/, /^ported-6-/, /^ported-8-/, /^gunhit-audio-/,
  ];
  return {
    name: 'sga-menu-gun-art-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, context) {
        // Only scripts: a `modulepreload` on a stylesheet is meaningless.
        const files = Object.keys(context.bundle ?? {}).filter((file) => /\.m?js$/.test(file));
        const hrefs = files.filter((file) => MENU_ART.some((pattern) => pattern.test(file.split('/').pop() ?? '')));
        return {
          html,
          tags: hrefs.map((href) => ({
            tag: 'link',
            attrs: { rel: 'modulepreload', crossorigin: '', href: `/${href}` },
            injectTo: 'head' as const,
          })),
        };
      },
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), preloadMenuGunArt(), standbyControlPlugin()],
    resolve: {
      // The standalone Lite folder installs its own dev dependencies.
      // Embedded v2 must share the host's React instance (hooks/context).
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(process.cwd(), './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      allowedHosts: true,
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    /**
     * The preview server serves the production build, which is what the user
     * actually plays. It needs the same host/port as `dev` so the sandbox
     * preview keeps pointing at port 3000, and the same `allowedHosts` because
     * the hub is embedded by a host page (a cross-origin frame is a third-party
     * context, so the browser sends a different Host header than localhost).
     *
     * `vite preview` is the fast path: `dev` hands the browser ~215 unbundled,
     * unminified modules and re-transforms every file it touches, which is why
     * the game and the weapon showcase used to take seconds to appear.
     */
    preview: {
      host: '0.0.0.0',
      allowedHosts: true,
      port: 3000,
    },
    define: {
      __APP_VERSION__: JSON.stringify(releaseVersion()),
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(process.cwd(), 'index.html'),
        },
        output: {
          /**
           * Game A's artwork and its ported slides are reachable from both the
           * menu (the live gun showcase) and the engine, so the bundler used to
           * hoist them into the first chunk and the title screen waited for the
           * whole game to parse. Naming them keeps the entry chunk to the shell,
           * the menus and the weapon table; the art and the engine arrive as
           * their own files right after first paint.
           */
          advancedChunks: {
            groups: [
              // Small modules both the menu and the engine use. They get their
              // own chunk so the entry can import them without pulling the
              // engine (which owns the rest of Game.ts' graph) into first load.
              {
                name: 'shared-runtime',
                test: /[\\/](perfect-shot[\\/](anim[\\/]presets|audio[\\/]sfx)|gunhit[\\/]utils[\\/](mobilePerf|adaptiveCanvasDpr|frameCadence|useSgaBgTheme|useSgaGameSpeed))\.(ts|tsx)$/,
              },
              // Sound recipes the menu itself plays.
              {
                name: 'gunhit-audio',
                test: /[\\/]games[\\/]gunhit[\\/]game[\\/](audio|sfx2|sfx3|sfx4|sfx5|sfx6|slide2Audio|slide23Sfx|fireworkSlide2Sfx|setOneAudio|slideAudioBridge)\.ts$/,
              },
              // The data the menus read (weapon table, level rules, quests, save
              // keys) — no artwork, so it can stay next to the menu chunk.
              {
                name: 'gunhit-menu-data',
                test: /[\\/]games[\\/]gunhit[\\/]game[\\/](weapons|levels|layout|quests|stageMap|stageUnlock|gameSpeed|backgroundThemes|sunburstPalette|playerProgress|safeStorage|retiredWeapons|bossCatalog|bossIdentity)\.ts$/,
              },
              { name: 'ported-4', test: /[\\/]games[\\/]game-4[\\/]/ },
              { name: 'ported-6', test: /[\\/]games[\\/]game-6[\\/]/ },
              { name: 'ported-8', test: /[\\/]games[\\/]game-8[\\/]/ },
              { name: 'gunhit-art-guns', test: /[\\/]games[\\/]gunhit[\\/]game[\\/]art[\\/]guns[0-9]*\.ts$/ },
              { name: 'gunhit-art-variants', test: /[\\/]games[\\/]gunhit[\\/]game[\\/]art[\\/](legacyVariants|gunVariants|commonGunMotion|metrics|drawCentered|kit)\.ts$/ },
              { name: 'gunhit-art', test: /[\\/]games[\\/]gunhit[\\/]game[\\/]art[\\/]/ },
            ],
          },
        },
      },
    },
  };
});
