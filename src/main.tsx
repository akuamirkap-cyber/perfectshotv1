import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './fonts.css';
import './index.css';
// Shared motion/art stylesheet. Game A's menu, transitions and HUD keyframes
// (in-letter, in-bullet, mm-shine, sgaGunIn, stInCombo, …) live here, so it must
// load with the app, not with some lazy chunk: while Game B was a second pane
// its bundle happened to import this file at startup and hid the dependency.
import './games/perfect-shot/index.css';

createRoot(document.getElementById('root')!).render(<App />);
