/** Former roster entries kept only as implementation ids for imported renderers.
 * They must not be offered, awarded, exported, or counted as owned weapons. */
export const RETIRED_WEAPONS: ReadonlySet<string> = new Set([
  'helix_pulsar', 'pred', 'yautja', 'chrono_rifle', 'prism_lance',
  'pulse_rifle', 'quantum_destabilizer', 'buster', 'acid', 'anchor',
  // Player request: the two size rays are out of the roster. Their artwork and
  // the size effect stay addressable as internal ids (slide 7 renders them by
  // id), but they are never offered, awarded or counted as owned weapons.
  'shrink', 'grow',
]);
