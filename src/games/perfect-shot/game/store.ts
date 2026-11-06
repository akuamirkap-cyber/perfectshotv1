import { useSyncExternalStore } from "react";

export type GameState = {
  coins: number;
  gems: number;
  claimed: string[]; // achievement ids
  chests: number[]; // milestone thresholds already opened
  owned: number[]; // weapon ids unlocked via rewards
  stage: number; // highest unlocked quest stage
  stars: Record<number, number>;
  giftStops: number[]; // achievement-track gifts already opened
  gifts: number; // free gift boxes available
  opened: number; // total gifts opened
};

let state: GameState = { coins: 120, gems: 10, claimed: [], chests: [], owned: [], stage: 4, stars: { 1: 3, 2: 2, 3: 3 }, giftStops: [], gifts: 3, opened: 0 };
const ls = new Set<() => void>();
const set = (p: Partial<GameState>) => {
  state = { ...state, ...p };
  ls.forEach((f) => f());
};

export const game = {
  get: () => state,
  subscribe: (f: () => void) => {
    ls.add(f);
    return () => ls.delete(f);
  },
  addCoins(n: number) {
    set({ coins: state.coins + n });
  },
  claim(id: string, coins: number, gems: number) {
    if (state.claimed.includes(id)) return;
    set({ claimed: [...state.claimed, id], coins: state.coins + coins, gems: state.gems + gems });
  },
  claimChest(at: number, weaponId: number, dup: boolean) {
    if (state.chests.includes(at)) return;
    set({
      chests: [...state.chests, at],
      owned: dup ? state.owned : [...state.owned, weaponId],
      coins: state.coins + (dup ? 300 : 0),
    });
  },
  addGems(n: number) {
    set({ gems: state.gems + n });
  },
  spendGems(n: number) {
    if (state.gems < n) return false;
    set({ gems: state.gems - n });
    return true;
  },
  grantWeapon(id: number) {
    if (!state.owned.includes(id)) set({ owned: [...state.owned, id] });
  },
  claimGiftStop(at: number) {
    if (!state.giftStops.includes(at)) set({ giftStops: [...state.giftStops, at], opened: state.opened + 1 });
  },
  useGift() {
    set({ gifts: Math.max(0, state.gifts - 1), opened: state.opened + 1 });
  },
  addGift(n = 1) {
    set({ gifts: state.gifts + n });
  },
  clearStage(n: number, stars: number, coins: number) {
    set({
      stars: { ...state.stars, [n]: Math.max(state.stars[n] ?? 0, stars) },
      stage: Math.min(100, Math.max(state.stage, n + 1)),
      coins: state.coins + coins,
    });
  },
};

export const useGame = () => useSyncExternalStore(game.subscribe, game.get, game.get);
