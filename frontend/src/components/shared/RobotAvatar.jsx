const ROBOTS = [
  // 0 — blocky classic: square head, square eyes, grill mouth, ball antenna
  <svg viewBox="0 0 20 20" fill="currentColor">
    <rect x="3"   y="4.5" width="14" height="12.5" rx="2.5"  opacity="0.15"/>
    <rect x="4.5" y="7.5" width="4"  height="3.5"  rx="1"   />
    <rect x="11.5" y="7.5" width="4" height="3.5"  rx="1"   />
    <rect x="5.2"  y="8.2" width="1.5" height="1.5" rx="0.4" opacity="0.2"/>
    <rect x="12.2" y="8.2" width="1.5" height="1.5" rx="0.4" opacity="0.2"/>
    <rect x="5"   y="12.7" width="2.2" height="1.1" rx="0.55" opacity="0.6"/>
    <rect x="8.9" y="12.7" width="2.2" height="1.1" rx="0.55" opacity="0.6"/>
    <rect x="12.8" y="12.7" width="2.2" height="1.1" rx="0.55" opacity="0.6"/>
    <rect x="9.3" y="2"   width="1.4" height="3"   rx="0.7"  opacity="0.65"/>
    <circle cx="10" cy="1.8" r="1.2"  opacity="0.9"/>
  </svg>,

  // 1 — cyclops visor: round head, single bar eye, twin antennae
  <svg viewBox="0 0 20 20" fill="currentColor">
    <circle cx="10" cy="11.5" r="8"               opacity="0.15"/>
    <rect x="3.5"  y="9.5"  width="13" height="4" rx="2"   />
    <rect x="3.5"  y="9.5"  width="5.5" height="4" rx="2"  opacity="0.22"/>
    <circle cx="10" cy="11.5" r="1.2"              opacity="0.18"/>
    <rect x="6.5"  y="15"  width="7"  height="1.1" rx="0.55" opacity="0.5"/>
    <circle cx="6.5" cy="3.8" r="1.3"/>
    <circle cx="13.5" cy="3.8" r="1.3"/>
    <rect x="5.8"  y="3.8"  width="1.4" height="2.8" rx="0.7" opacity="0.55"/>
    <rect x="12.8" y="3.8"  width="1.4" height="2.8" rx="0.7" opacity="0.55"/>
  </svg>,

  // 2 — hex warrior: hexagon head, big circle eyes, chin grill
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 1.5L17.5 6v8L10 18.5 2.5 14V6Z"  opacity="0.15"/>
    <circle cx="7.2"  cy="9.5" r="2.5"/>
    <circle cx="12.8" cy="9.5" r="2.5"/>
    <circle cx="7.2"  cy="9.5" r="1.1"             opacity="0.2"/>
    <circle cx="12.8" cy="9.5" r="1.1"             opacity="0.2"/>
    <rect x="6.5"  y="13.2" width="7" height="1.2" rx="0.6" opacity="0.55"/>
    <rect x="9.3"  y="0"    width="1.4" height="2" rx="0.5" opacity="0.7"/>
  </svg>,

  // 3 — cute round: circle head, circle eyes, dot-mouth smile, antenna
  <svg viewBox="0 0 20 20" fill="currentColor">
    <circle cx="10" cy="11" r="8.5"                opacity="0.15"/>
    <circle cx="7"  cy="9.5"  r="2.4"/>
    <circle cx="13" cy="9.5"  r="2.4"/>
    <circle cx="7"  cy="9.5"  r="1"               opacity="0.2"/>
    <circle cx="13" cy="9.5"  r="1"               opacity="0.2"/>
    <circle cx="7.5"  cy="14.2" r="0.9"           opacity="0.65"/>
    <circle cx="10"   cy="14.8" r="0.9"           opacity="0.9"/>
    <circle cx="12.5" cy="14.2" r="0.9"           opacity="0.65"/>
    <rect x="9.3" y="1.5" width="1.4" height="2.5" rx="0.7" opacity="0.7"/>
    <circle cx="10" cy="1.2" r="1.2"              opacity="0.9"/>
  </svg>,

  // 4 — angular jaw: cut-corner head, triangle eyes, wide mouth bar
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path d="M6 2.5h8l3.5 3.5v8L14 17.5H6L2.5 14V6Z" opacity="0.15"/>
    <path d="M5.5 12L8.2 7 10.9 12Z"/>
    <path d="M9.1 12L11.8 7 14.5 12Z"/>
    <rect x="5.5" y="13.5" width="9" height="1.5" rx="0.75" opacity="0.5"/>
    <circle cx="10" cy="3.2" r="1.1"              opacity="0.8"/>
    <rect x="9.3"  y="3.2" width="1.4" height="2" rx="0.5" opacity="0.55"/>
  </svg>,

  // 5 — dome helmet: dome top, full visor slit, chin guard, ear bolts
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 11.5C2 6.5 5.5 3 10 3s8 3.5 8 8.5v3.5c0 1.2-1 1.5-8 1.5S2 16.2 2 15Z" opacity="0.15"/>
    <rect x="3" y="9.5"  width="14" height="3.5" rx="1.75"/>
    <rect x="3" y="9.5"  width="6"  height="3.5" rx="1.75" opacity="0.22"/>
    <circle cx="10" cy="11.25" r="1"              opacity="0.18"/>
    <rect x="5.5" y="14.5" width="9" height="1.2" rx="0.6" opacity="0.45"/>
    <circle cx="2"  cy="11.5" r="1.2"             opacity="0.7"/>
    <circle cx="18" cy="11.5" r="1.2"             opacity="0.7"/>
  </svg>,

  // 6 — retro TV: wide rect head, big round eyes, grill slots, rabbit ears
  <svg viewBox="0 0 20 20" fill="currentColor">
    <rect x="2" y="5.5" width="16" height="11.5" rx="2"   opacity="0.15"/>
    <circle cx="7.5"  cy="10.5" r="2.5"/>
    <circle cx="12.5" cy="10.5" r="2.5"/>
    <circle cx="7.5"  cy="10.5" r="1"                     opacity="0.2"/>
    <circle cx="12.5" cy="10.5" r="1"                     opacity="0.2"/>
    <rect x="4"   y="14.2" width="2.5" height="0.9" rx="0.45" opacity="0.55"/>
    <rect x="8.8" y="14.2" width="2.5" height="0.9" rx="0.45" opacity="0.55"/>
    <rect x="13.5" y="14.2" width="2.5" height="0.9" rx="0.45" opacity="0.55"/>
    <rect x="5.5"  y="1.5" width="1.4" height="4.5" rx="0.7" opacity="0.6"/>
    <rect x="13.1" y="1.5" width="1.4" height="4.5" rx="0.7" opacity="0.6"/>
    <circle cx="6.2"  cy="1.5" r="1" opacity="0.8"/>
    <circle cx="13.8" cy="1.5" r="1" opacity="0.8"/>
  </svg>,

  // 7 — sleek alien: tall oval, almond eyes, double grill line, top ridge
  <svg viewBox="0 0 20 20" fill="currentColor">
    <ellipse cx="10" cy="10.5" rx="7.5" ry="9"            opacity="0.15"/>
    <path d="M4.5 9.5 C5.5 7 9.5 7 9.5 9.5 C9.5 12 5.5 12 4.5 9.5Z"/>
    <path d="M10.5 9.5 C11.5 7 15.5 7 15.5 9.5 C15.5 12 11.5 12 10.5 9.5Z"/>
    <circle cx="6.8"  cy="8.8"  r="0.9"                   opacity="0.25"/>
    <circle cx="13.2" cy="8.8"  r="0.9"                   opacity="0.25"/>
    <rect x="6.5"  y="13.5" width="7"   height="1"   rx="0.5" opacity="0.7"/>
    <rect x="8"    y="14.8" width="4"   height="0.8" rx="0.4" opacity="0.5"/>
    <ellipse cx="10" cy="1.8" rx="3" ry="1.1"             opacity="0.7"/>
  </svg>,
];

const RobotAvatar = ({ index = 0 }) => ROBOTS[index % ROBOTS.length];

export default RobotAvatar;
