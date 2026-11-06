import type { Weapon } from '../types';
import { akWeapon, berettaWeapon, mp5ElectroWeapon, mp5Weapon, rifleElectroWeapon, rifleWeapon, sniperWeapon } from './firearms';
import { bowWeapon, dragonWeapon, swordWeapon } from './fantasy';
import { rareWeapons } from './rare';
import { rare2Weapons } from './rare2';
import { rare3Weapons } from './rare3';
import { discWeapon, phaserWeapon, protonWeapon } from './scifi';
import { predatorCaster } from './plasmacaster';
import { iconWeapons } from './icons';

export const WEAPONS: Weapon[] = [
  ...iconWeapons,
  ...rare3Weapons,
  ...rare2Weapons,
  ...rareWeapons,
  bowWeapon,
  akWeapon,
  rifleWeapon,
  rifleElectroWeapon,
  mp5Weapon,
  mp5ElectroWeapon,
  sniperWeapon,
  dragonWeapon,
  berettaWeapon,
  phaserWeapon,
  swordWeapon,
  predatorCaster,
  discWeapon,
  protonWeapon,
];
