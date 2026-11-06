import { useId } from 'react';

/**
 * A wrapped present for the achievement route.
 *
 * The route used to show treasure chests; the reward is a gift, so it is drawn
 * as a gift box — but the three rarity colours stay: green for UMUM, purple for
 * EPIC and gold for LEGEND. The ribbon takes the opposite tone (gold ribbon on
 * the green and purple boxes, red ribbon on the gold one) so the box colour is
 * never lost against the blue achievement board.
 */
const TONES = {
  green: {
    top: '#86efac', mid: '#22c55e', low: '#15803d', rim: '#052e16',
    ribbonTop: '#fef3c7', ribbonLow: '#f59e0b', ribbonRim: '#a16207',
  },
  purple: {
    top: '#e9d5ff', mid: '#a855f7', low: '#6d28d9', rim: '#2e1065',
    ribbonTop: '#fef3c7', ribbonLow: '#f59e0b', ribbonRim: '#a16207',
  },
  gold: {
    top: '#fff6c2', mid: '#fbbf24', low: '#d97706', rim: '#7c2d12',
    ribbonTop: '#fecdd3', ribbonLow: '#e11d48', ribbonRim: '#881337',
  },
} as const;

export type GiftTone = keyof typeof TONES;

export default function MilestoneGift({ tone, open = false, className = '' }: { tone: GiftTone; open?: boolean; className?: string }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  const t = TONES[tone];
  return (
    <svg viewBox="0 0 100 104" className={className} overflow="visible" aria-hidden="true">
      <defs>
        <linearGradient id={`${u}box`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.top} />
          <stop offset=".46" stopColor={t.mid} />
          <stop offset="1" stopColor={t.low} />
        </linearGradient>
        <linearGradient id={`${u}rib`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.ribbonTop} />
          <stop offset="1" stopColor={t.ribbonLow} />
        </linearGradient>
      </defs>

      {/* light spilling out of an opened present — two flat ellipses instead of
          a gradient, so every renderer (and the headless proof) shows the same
          soft halo instead of a hard disc */}
      {open && (
        <g>
          <ellipse cx="50" cy="48" rx="48" ry="38" fill="#fde68a" opacity=".28" />
          <ellipse cx="50" cy="46" rx="34" ry="26" fill="#fffbeb" opacity=".45" />
        </g>
      )}
      <ellipse cx="50" cy="97" rx="30" ry="6" fill="#0b1220" opacity=".28" />

      {/* box body */}
      <rect x="16" y="50" width="68" height="42" rx="7" fill={`url(#${u}box)`} stroke={t.rim} strokeWidth="3" />
      <rect x="20" y="55" width="8" height="30" rx="4" fill="#fff" opacity=".28" />
      <rect x="16" y="50" width="68" height="7" rx="3.5" fill="#000" opacity=".13" />

      {/* vertical ribbon on the body, under the lid */}
      <rect x="43" y="50" width="14" height="42" fill={`url(#${u}rib)`} stroke={t.ribbonRim} strokeWidth="2" />
      <rect x="46.5" y="52" width="3" height="38" rx="1.5" fill="#fff" opacity=".45" />

      {/* lid + bow: tilts open once the reward is taken */}
      <g
        style={{
          transform: open ? 'translate(-8px,-24px) rotate(-16deg)' : 'none',
          transformOrigin: '18px 48px',
          transformBox: 'view-box',
          transition: 'transform .45s cubic-bezier(.2,1.7,.4,1)',
        }}
      >
        <rect x="11" y="34" width="78" height="17" rx="6" fill={`url(#${u}box)`} stroke={t.rim} strokeWidth="3" />
        <rect x="15" y="37.5" width="70" height="5" rx="2.5" fill="#fff" opacity=".34" />
        <rect x="43" y="34" width="14" height="17" fill={`url(#${u}rib)`} stroke={t.ribbonRim} strokeWidth="2" />
        <path d="M50 33 C35 13 23 22 34 31 C40 35 46 34 50 33 Z" fill={`url(#${u}rib)`} stroke={t.ribbonRim} strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M50 33 C65 13 77 22 66 31 C60 35 54 34 50 33 Z" fill={`url(#${u}rib)`} stroke={t.ribbonRim} strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M44 30 C38 22 31 25 35 29" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".5" />
        <ellipse cx="50" cy="32" rx="6.2" ry="5.2" fill={`url(#${u}rib)`} stroke={t.ribbonRim} strokeWidth="2.4" />
        <ellipse cx="48.2" cy="30.2" rx="2" ry="1.4" fill="#fff" opacity=".65" />
      </g>

      {/* sparkles over an unopened present that is ready to claim */}
      {!open && (
        <g opacity=".9">
          <path d="M84 24 l1.6 4.4 4.4 1.6 -4.4 1.6 -1.6 4.4 -1.6 -4.4 -4.4 -1.6 4.4 -1.6 Z" fill="#fff8d6" />
          <path d="M17 30 l1.2 3.2 3.2 1.2 -3.2 1.2 -1.2 3.2 -1.2 -3.2 -3.2 -1.2 3.2 -1.2 Z" fill="#fff8d6" opacity=".8" />
        </g>
      )}
    </svg>
  );
}
