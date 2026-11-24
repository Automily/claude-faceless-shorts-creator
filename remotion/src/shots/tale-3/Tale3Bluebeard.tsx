import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { Captions, PauseCard, ProgressBar, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_EDITORIAL, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Candlelit Tales #3: Bluebeard (Charles Perrault, 1697, retold)
// Shadow-puppet silhouettes. Blood is only ever red light / a red pool — no gore.
// Motif: the little key and its stain (hook == loop).
// =============================================================================
export const compositionConfig = {
  id: 'Tale3Bluebeard',
  durationInSeconds: 69.3,
  fps: 30,
  width: 1080,
  height: 1920,
};

const INK = '#05060a';
const PALE = '#f7ecd0';
const BLUE = '#3f6fd8';
const BLOOD = '#b3122a';
const GOLD = '#ffcf6b';
const EASE = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);
const GROUND = 1260;

const S = {
  hook: [0, 4.6],
  man: [4.6, 12.95],
  keys: [12.95, 19.8],
  journey: [19.8, 22.85],
  room: [22.85, 31.0],
  key: [31.0, 37.7],
  pause: [37.7, 42.5],
  threat: [42.5, 46.95],
  tower: [46.95, 57.2],
  sword: [57.2, 63.55],
  end: [63.55, 69.3],
} as const;
const sceneOp = (f: number, [a, b]: readonly [number, number], fade = 8) =>
  Math.min(prog(f, F(a) - fade, F(a)), 1 - prog(f, F(b) - fade, F(b)));

// =============================================================================
// SILHOUETTE PARTS
// =============================================================================
const Person: React.FC<{ x: number; y: number; s?: number; hat?: boolean; skirt?: boolean; arm?: number; flip?: boolean; beard?: boolean; sword?: number }> = ({
  x, y, s = 1, hat, skirt, arm = 0, flip, beard, sword = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill={INK}>
    <circle cx={0} cy={-300} r={34} />
    {hat ? <path d="M -54 -318 L 54 -318 L 30 -334 L 20 -366 L -20 -366 L -30 -334 Z" /> : null}
    {beard ? <path d="M -26 -292 Q 0 -200 30 -292 Q 4 -276 -26 -292 Z" fill={BLUE} /> : null}
    {skirt ? (
      <path d="M -44 -262 Q 0 -280 44 -262 L 54 -150 L 90 0 L -90 0 L -54 -150 Z" />
    ) : (
      <>
        <path d="M -52 -262 Q 0 -280 52 -262 L 66 -110 L -66 -110 Z" />
        <rect x={-40} y={-112} width={26} height={112} rx={10} />
        <rect x={14} y={-112} width={26} height={112} rx={10} />
      </>
    )}
    <g transform={`translate(36 -240) rotate(${-150 * arm + 20})`}>
      <rect x={-11} y={0} width={22} height={120} rx={11} />
      {sword > 0 ? (
        <g opacity={sword}>
          <rect x={-5} y={110} width={10} height={210} fill="#c9d2e0" />
          <rect x={-26} y={104} width={52} height={12} />
        </g>
      ) : null}
    </g>
  </g>
);

const Key: React.FC<{ x: number; y: number; s?: number; stain: number; rot?: number; glow?: number }> = ({ x, y, s = 1, stain, rot = 0, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <circle r={300} fill={GOLD} opacity={0.08 + 0.1 * glow} />
    {/* bow */}
    <circle cx={0} cy={-170} r={90} fill="none" stroke="#c9a24a" strokeWidth={34} />
    <circle cx={0} cy={-170} r={30} fill="#c9a24a" />
    {/* shaft */}
    <rect x={-20} y={-90} width={40} height={340} rx={10} fill="#c9a24a" />
    {/* bit */}
    <rect x={20} y={170} width={80} height={30} fill="#c9a24a" />
    <rect x={20} y={215} width={60} height={30} fill="#c9a24a" />
    {/* the stain */}
    <path d="M -22 120 Q 10 100 22 140 L 24 240 Q 70 230 96 250 L 90 200 Q 70 190 60 215 L 22 215 Q -30 230 -22 120 Z" fill={BLOOD} opacity={stain} />
    <circle cx={-6} cy={96} r={10} fill={BLOOD} opacity={stain} />
  </g>
);

const Castle: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = '#120c1c' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
    <path d="M -300 0 L -300 -260 L -270 -260 L -270 -290 L -240 -290 L -240 -260 L -210 -260 L -210 -340 L -180 -400 L -150 -340 L -150 -260 L 150 -260 L 150 -340 L 180 -400 L 210 -340 L 210 -260 L 240 -260 L 240 -290 L 270 -290 L 270 -260 L 300 -260 L 300 0 Z" />
    <rect x={-40} y={-150} width={80} height={150} rx={40} fill="#22161a" />
    <rect x={-190} y={-220} width={24} height={40} rx={12} fill={GOLD} opacity={0.7} />
    <rect x={166} y={-220} width={24} height={40} rx={12} fill={GOLD} opacity={0.7} />
  </g>
);

const Horse: React.FC<{ x: number; y: number; s?: number; f: number; beard?: boolean }> = ({ x, y, s = 1, f, beard }) => {
  const g = Math.sin(f * 0.6) * 10;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={INK}>
      <ellipse cx={0} cy={-170} rx={130} ry={55} />
      <path d="M 100 -200 L 170 -290 L 200 -280 L 205 -250 L 150 -190 Z" />
      <path d="M -125 -190 Q -175 -150 -160 -100 L -150 -110 Q -150 -150 -118 -170 Z" />
      <rect x={-100} y={-130} width={18} height={130} transform={`rotate(${g} -91 -130)`} />
      <rect x={-60} y={-130} width={18} height={130} transform={`rotate(${-g} -51 -130)`} />
      <rect x={60} y={-130} width={18} height={130} transform={`rotate(${-g} 69 -130)`} />
      <rect x={96} y={-130} width={18} height={130} transform={`rotate(${g} 105 -130)`} />
      {/* rider */}
      <g transform="translate(-10 -205) scale(0.7)">
        <circle cx={0} cy={-190} r={34} />
        {beard ? <path d="M -26 -182 Q 0 -90 30 -182 Q 4 -166 -26 -182 Z" fill={BLUE} /> : null}
        <path d="M -48 -152 Q 0 -170 48 -152 L 54 0 L -54 0 Z" />
      </g>
    </g>
  );
};

// a hallway in one-point perspective with a little door at the end
const Hall: React.FC<{ open: number; glow: number }> = ({ open, glow }) => (
  <g>
    <path d={`M 0 300 L 430 820 L 650 820 L 1080 300 L 1080 ${GROUND} L 650 1080 L 430 1080 L 0 ${GROUND} Z`} fill="#0e0a14" />
    <path d={`M 0 ${GROUND} L 430 1080 L 650 1080 L 1080 ${GROUND} Z`} fill="#151019" />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={110 + i * 105} y={560 + i * 90} width={22 - i * 5} height={40 - i * 8} rx={6} fill={GOLD} opacity={0.6} />
        <rect x={948 - i * 105} y={560 + i * 90} width={22 - i * 5} height={40 - i * 8} rx={6} fill={GOLD} opacity={0.6} />
      </g>
    ))}
    {/* the far door */}
    <rect x={480} y={880} width={120} height={200} fill={BLOOD} opacity={0.15 + 0.85 * open} />
    <rect x={480} y={880} width={120 * (1 - 0.85 * open)} height={200} fill="#2a1a14" stroke="#3c2a1a" strokeWidth={3} />
    <circle cx={540} cy={980} r={160 + 120 * open} fill={BLOOD} opacity={0.08 * glow + 0.25 * open} />
  </g>
);

const Hanging: React.FC<{ x: number; y: number; op: number; sway: number }> = ({ x, y, op, sway }) => (
  <g transform={`translate(${x} ${y}) rotate(${sway})`} opacity={op} fill="#3a0912">
    <rect x={-3} y={-80} width={6} height={80} />
    <circle cx={0} cy={18} r={22} />
    <path d="M -30 38 Q 0 30 30 38 L 46 220 L -46 220 Z" />
  </g>
);

const Ground: React.FC = () => (
  <path d={`M 0 ${GROUND} Q 270 ${GROUND - 30} 540 ${GROUND - 6} T 1080 ${GROUND - 20} L 1080 1920 L 0 1920 Z`} fill={INK} />
);

// =============================================================================
const Tale3Bluebeard: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;

  const loopBack = prog(f, F(67.6), F(69.0));
  const hookOp = Math.max(1 - prog(f, F(S.hook[1]) - 10, F(S.hook[1])), loopBack);
  const titleOp = Math.max(1 - prog(f, F(4.0), F(4.6)), loopBack);

  const sky: [string, string] =
    t < S.man[0] || t >= S.end[0] ? ['#050409', '#1a0f14']
      : t < S.keys[0] ? ['#0b1030', '#3b4f9c']
      : t < S.journey[0] ? ['#0d0806', '#2b1a10']
      : t < S.room[0] ? ['#1a1036', '#c77a48']
      : t < S.key[0] ? ['#07050a', '#1a0c10']
      : t < S.pause[0] ? ['#050409', '#1a0f14']
      : t < S.tower[0] ? ['#0b1030', '#3b4f9c']
      : t < S.sword[0] ? ['#2a1636', '#e89a52']
      : ['#0b1030', '#3b4f9c'];

  // key-scene: drop + scrub + stain returning
  const drop = EASE(prog(f, F(31.5), F(32.0)));
  const scrub = prog(f, F(32.8), F(34.3));
  const stainKey = f < F(32.8) ? drop : f < F(34.7) ? 1 - 0.8 * scrub : 0.2 + 0.8 * prog(f, F(34.7), F(35.3));

  // room scene
  const walk = EASE(prog(f, F(23.1), F(24.8)));
  const doorOpen = EASE(prog(f, F(25.0), F(25.8)));
  const wivesOp = prog(f, F(28.4), F(29.0));
  const sway = Math.sin(f * 0.05) * 3;

  // sword scene
  const raise = EASE(prog(f, F(57.6), F(58.2)));
  const gate = EASE(prog(f, F(59.2), F(59.6)));
  const ride = EASE(prog(f, F(60.3), F(61.6)));
  const flash = prog(f, F(61.6), F(61.75)) * (1 - prog(f, F(61.75), F(62.3)));
  const fall = EASE(prog(f, F(61.8), F(62.5)));

  // tower
  const dust = prog(f, F(55.3), F(56.2));

  const label = (text: string, at: number, op: number, color = PALE, y = 470, x = 540) => (
    <text x={x} y={y} fill={color} fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={62} textAnchor="middle" opacity={op * prog(f, F(at), F(at) + 6)}>
      {text}
    </text>
  );

  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${sky[0]} 0%, ${sky[1]} 70%, ${sky[1]} 100%)` }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* ---------- HOOK / LOOP: the stained key ---------- */}
        <g opacity={hookOp}>
          <Key x={540} y={880} s={1.05} stain={1} rot={-14} glow={1} />
        </g>

        {/* ---------- BLUEBEARD and his castle ---------- */}
        <g opacity={sceneOp(f, S.man)}>
          <circle cx={900} cy={760} r={70} fill={PALE} opacity={0.85} />
          <Castle x={640} y={GROUND} s={0.9} />
          <Person x={330} y={GROUND} s={1.15} hat beard />
          {/* villagers flee */}
          <g opacity={1 - prog(f, F(8.3), F(9.0))}>
            <Person x={80 - 160 * prog(f, F(7.6), F(8.8))} y={GROUND} s={0.75} flip />
            <Person x={170 - 200 * prog(f, F(7.6), F(8.8))} y={GROUND} s={0.7} skirt flip />
          </g>
          {/* six empty frames */}
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={150 + i * 135} y={330} width={100} height={130} rx={8} fill="none" stroke={GOLD} strokeWidth={6}
              opacity={prog(f, F(9.6) + i * 4, F(9.6) + i * 4 + 6) * 0.85} />
          ))}
          {label('WHERE ARE HIS WIVES?', 10.9, 1, '#ff8a8a', 570)}
        </g>

        {/* ---------- KEYS + the rule ---------- */}
        <g opacity={sceneOp(f, S.keys)}>
          <g opacity={1 - prog(f, F(16.9), F(17.3))}>
            <Person x={300} y={GROUND} s={1.1} hat beard arm={0.45} />
            <Person x={760} y={GROUND} skirt flip arm={0.4 * prog(f, F(14.4), F(14.8))} />
            <g transform={`translate(${540} ${GROUND - 330})`}>
              {[-50, -20, 10, 40].map((dx, i) => (
                <rect key={i} x={dx} y={0} width={14} height={70 + (i % 2) * 20} rx={4} fill={GOLD} opacity={prog(f, F(14.5), F(14.9))} />
              ))}
              <rect x={70} y={0} width={10} height={44} rx={3} fill={GOLD} opacity={prog(f, F(15.9), F(16.2))} />
              <circle cx={75} cy={20} r={40} fill={GOLD} opacity={0.25 * prog(f, F(15.9), F(16.2))} />
            </g>
            {label('EVERY KEY', 14.5, 1, GOLD)}
            {label('ONE RULE', 15.9, 1, PALE, 550)}
          </g>
          <g opacity={prog(f, F(17.0), F(17.4))}>
            <Hall open={0} glow={1} />
            {label('NEVER OPEN IT', 17.1, 1, '#ff8a8a', 470)}
          </g>
        </g>

        {/* ---------- JOURNEY ---------- */}
        <g opacity={sceneOp(f, S.journey)}>
          <circle cx={300} cy={760} r={120} fill="#ffd28a" opacity={0.8} />
          <Castle x={220} y={GROUND} s={0.7} />
          <Horse x={520 + 500 * prog(f, F(20.2), F(22.8))} y={GROUND} s={1.0} f={f} beard />
        </g>

        {/* ---------- THE LITTLE ROOM ---------- */}
        <g opacity={sceneOp(f, S.room)}>
          <Hall open={doorOpen} glow={1} />
          <g transform={`translate(540 ${GROUND + 40 - 220 * walk}) scale(${1 - 0.55 * walk}) translate(-540 ${-GROUND})`}>
            <Person x={540} y={GROUND} skirt />
          </g>
          {/* the wives, as shadows against the red light */}
          {[-2, -1, 1, 2].map((k, i) => (
            <Hanging key={k} x={540 + k * 150} y={500 + Math.abs(k) * 20} op={wivesOp * 0.95} sway={sway * (i % 2 ? 1 : -1)} />
          ))}
          <rect x={0} y={0} width={1080} height={1920} fill={BLOOD} opacity={0.12 * doorOpen} />
        </g>

        {/* ---------- THE KEY: dropped, scrubbed, the stain returns ---------- */}
        <g opacity={sceneOp(f, S.key)}>
          <ellipse cx={540} cy={1120} rx={320 * drop} ry={60 * drop} fill={BLOOD} opacity={0.75} />
          <Key x={540 + (f >= F(32.8) && f < F(34.4) ? 14 * Math.sin(f * 2.2) : 0)} y={760 + 160 * drop} s={0.9} stain={stainKey} rot={-14 + 70 * drop} glow={prog(f, F(36.2), F(36.6))} />
          {label('THE STAIN CAME BACK', 34.7, 1 - prog(f, F(36.0), F(36.3)), '#ff8a8a')}
          {label('ENCHANTED', 36.3, 1, GOLD)}
        </g>

        {/* ---------- PAUSE: he's home ---------- */}
        <g opacity={sceneOp(f, S.pause)}>
          <Castle x={540} y={GROUND} s={1.1} />
          <Horse x={260} y={GROUND} s={0.9} f={0} beard />
        </g>

        {/* ---------- THREAT ---------- */}
        <g opacity={sceneOp(f, S.threat)}>
          <Person x={420} y={GROUND} s={1.7} hat beard arm={0.55} />
          <g transform={`translate(560 ${GROUND - 590})`}>
            <rect x={0} y={0} width={10} height={44} rx={3} fill={GOLD} />
            <rect x={0} y={24} width={10} height={20} fill={BLOOD} />
          </g>
          <Person x={800} y={GROUND} s={0.85} skirt flip />
          {label('TAKE YOUR PLACE', 44.5, 1, '#ff8a8a', 470)}
        </g>

        {/* ---------- SISTER ANNE on the tower ---------- */}
        <g opacity={sceneOp(f, S.tower)}>
          <circle cx={300} cy={980} r={130} fill="#ffd28a" opacity={0.85} />
          <path d={`M 0 ${GROUND} L 360 ${GROUND - 120} L 380 ${GROUND - 120} L 300 ${GROUND}`} fill="#2a1a20" />
          <g fill={INK}>
            <rect x={700} y={GROUND - 760} width={200} height={760} />
            <path d={`M 680 ${GROUND - 760} L 920 ${GROUND - 760} L 920 ${GROUND - 800} L 880 ${GROUND - 800} L 880 ${GROUND - 780} L 840 ${GROUND - 780} L 840 ${GROUND - 800} L 760 ${GROUND - 800} L 760 ${GROUND - 780} L 720 ${GROUND - 780} L 720 ${GROUND - 800} L 680 ${GROUND - 800} Z`} />
            <rect x={780} y={GROUND - 460} width={40} height={70} rx={20} fill={GOLD} opacity={0.7} />
          </g>
          <Person x={800} y={GROUND - 800} s={0.55} skirt arm={prog(f, F(52.6), F(53.0)) * 0.5} flip />
          {/* dust on the road */}
          <circle cx={360 - 60 * dust} cy={GROUND - 140} r={30 + 50 * dust} fill="#e8c9a0" opacity={0.35 * dust} />
          <circle cx={320 - 60 * dust} cy={GROUND - 120} r={20 + 40 * dust} fill="#e8c9a0" opacity={0.3 * dust} />
          {label('SISTER ANNE…', 52.7, 1 - prog(f, F(55.1), F(55.3)), PALE, 470, 340)}
          {label('ONLY DUST', 55.3, 1, '#e8c9a0', 470, 340)}
        </g>

        {/* ---------- THE SWORD + THE BROTHERS ---------- */}
        <g opacity={sceneOp(f, S.sword)}>
          <Castle x={540} y={GROUND - 220} s={1.4} color="#141024" />
          <g transform={`translate(${600} ${GROUND}) rotate(${80 * fall}) translate(${-600} ${-GROUND})`}>
            <Person x={620} y={GROUND} s={1.2} hat beard arm={raise} sword={1 - fall} flip />
          </g>
          <Person x={850} y={GROUND} s={0.85} skirt />
          {/* the gate bursting */}
          <rect x={40} y={GROUND - 400} width={160 * (1 - gate)} height={400} fill="#2a1a14" />
          <rect x={40} y={GROUND - 400} width={160} height={400} fill={GOLD} opacity={0.35 * gate} />
          <Horse x={-200 + 600 * ride} y={GROUND} s={0.9} f={f} />
          <Horse x={-380 + 560 * ride} y={GROUND} s={0.85} f={f + 9} />
          <rect x={0} y={0} width={1080} height={1920} fill="#ffffff" opacity={0.5 * flash} />
          {label('HER BROTHERS', 60.4, 1, GOLD)}
        </g>

        {/* ---------- END: the key, forever stained ---------- */}
        <g opacity={sceneOp(f, S.end) * (1 - loopBack)}>
          <Key x={540} y={880} s={1.05} stain={1} rot={-14} glow={0.6 + 0.4 * prog(f, F(65.8), F(66.6))} />
          {label('FOREVER', 66.3, 1 - loopBack, '#ff8a8a', 360)}
        </g>

        {t >= S.man[0] && t < S.end[0] && !(t >= S.room[0] && t < S.key[0]) && !(t >= S.keys[0] + 4.1 && t < S.journey[0]) ? <Ground /> : null}
      </svg>

      {/* title card on the hook / loop */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', opacity: titleOp }}>
        <div style={{ fontFamily: FONT_EDITORIAL, fontWeight: 900, fontSize: 104, color: PALE, letterSpacing: 6, textShadow: '0 4px 30px rgba(0,0,0,0.6)' }}>BLUEBEARD</div>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: PALE, opacity: 0.8, letterSpacing: 8 }}>ONE KEY · ONE RULE</div>
      </div>

      <Sequence from={F(37.75)} durationInFrames={F(4.75)}>
        <PauseCard title="PAUSE" subtitle="he's home early. what do you do?" durSec={4.75} accent={GOLD} y={360} />
      </Sequence>

      <Captions lines={VO} y={1480} accent={GOLD} />
      <ProgressBar color={GOLD} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: '#8b8fa5', opacity: 0.7 }}>
        retold from Charles Perrault, 1697
      </div>
    </AbsoluteFill>
  );
};

export default Tale3Bluebeard;
