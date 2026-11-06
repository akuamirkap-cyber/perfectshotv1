import type { Weapon } from '../types';
import { ak47, beretta, mp5, rifle } from './firearms';
import { mp5Electro, rifleElectro, sniperBeam } from './electro';
import { bow } from './bow';
import { dragonBreath } from './fire';
import { energySword, phaser, plasmacaster, protonPack, tripod } from './scifi';
import { identityDisc, repulsor } from './tech';
import { yautjaCaster } from './yautja';

export const WEAPONS: Weapon[] = [
  bow,
  ak47,
  rifle,
  rifleElectro,
  mp5,
  mp5Electro,
  sniperBeam,
  dragonBreath,
  beretta,
  phaser,
  energySword,
  plasmacaster,
  yautjaCaster,
  identityDisc,
  protonPack,
  tripod,
  repulsor,
];
