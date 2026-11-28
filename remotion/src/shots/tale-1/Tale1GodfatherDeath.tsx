import React from 'react';
import { AbsoluteFill, Easing, Sequence, interpolateColors, useCurrentFrame } from 'remotion';
import { Captions, PauseCard, ProgressBar, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_EDITORIAL, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Tales #1: Godfather Death (Brothers Grimm, retold)
// Shadow-puppet silhouettes on glowing skies. Everything drawn in code.
// =============================================================================
export const compositionConfig = {
  id: 'Tale1GodfatherDeath',
  durationInSeconds: 53.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const INK = '#05060a';
const EASE = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);
const GROUND = 1260;

// ---- scene windows (global seconds, from the real voice) --------------------
const S = {
  hook: [0, 5.2],
  godfather: [5.2, 11.2],
  gift: [11.2, 15.6],
  rule: [15.6, 21.2],
  fame: [21.2, 24.8],
  princess: [24.8, 32.4],
  spin: [32.4, 37.8],
  cave: [37.8, 47.2],
  fall: [47.2, 51.6],
} as const;
const sceneOp = (f: number, [a, b]: readonly [number, number], fade = 10) =>
  Math.min(prog(f, F(a) - fade, F(a)), 1 - prog(f, F(b) - fade, F(b)));

// sky palettes per scene
const SKIES: Record<string, [string, string]> = {
  dusk: ['#1b1036', '#e0894a'],
  night: ['#070b1f', '#3a3f7a'],
  royal: ['#160b26', '#b0465b'],
  cave: ['#030304', '#2a1a0c'],
};

// =============================================================================
// SILHOUETTE PARTS
// =============================================================================
const Person: React.FC<{ x: number; y: number; s?: number; hat?: boolean; bag?: boolean; baby?: boolean; lantern?: number }> = ({ x, y, s = 1, hat, bag, baby, lantern = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={INK}>
    <circle cx={0} cy={-300} r={34} />
    {hat ? <path d="M -46 -322 L 46 -322 L 30 -330 L 26 -372 L -26 -372 L -30 -330 Z" /> : null}
    <path d="M -48 -262 Q 0 -280 48 -262 L 62 -110 L -62 -110 Z" />
    <rect x={-40} y={-112} width={26} height={112} rx={10} />
    <rect x={14} y={-112} width={26} height={112} rx={10} />
    {bag ? <rect x={52} y={-150} width={58} height={44} rx={8} /> : null}
    {baby ? <ellipse cx={-62} cy={-200} rx={42} ry={26} /> : null}
    {lantern > 0 ? (
      <g>
        <line x1={58} y1={-190} x2={70} y2={-150} stroke={INK} strokeWidth={6} />
        <circle cx={72} cy={-132} r={60} fill="#ffcf6b" opacity={0.18 * lantern} />
        <rect x={60} y={-150} width={24} height={34} rx={6} fill="#ffcf6b" opacity={lantern} />
      </g>
    ) : null}
  </g>
);

const Death: React.FC<{ x: number; y: number; s?: number; point?: number; eyes?: number; flip?: boolean }> = ({ x, y, s = 1, point = 0, eyes = 0, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill={INK}>
    {/* scythe */}
    <line x1={-90} y1={-520} x2={-70} y2={0} stroke={INK} strokeWidth={10} strokeLinecap="round" />
    <path d="M -92 -520 Q -10 -560 70 -470 Q -10 -505 -88 -490 Z" />
    {/* hooded cloak */}
    <path d="M 0 -460 Q 58 -458 64 -380 L 96 0 L -96 0 L -62 -380 Q -56 -458 0 -460 Z" />
    {/* pointing arm */}
    <path d={`M 30 -330 L ${60 + 140 * point} ${-300 + 40 * point} L ${60 + 140 * point} ${-282 + 40 * point} L 30 -300 Z`} />
    {/* eyes */}
    <circle cx={-12} cy={-392} r={5} fill="#e6f3ff" opacity={eyes} />
    <circle cx={12} cy={-392} r={5} fill="#e6f3ff" opacity={eyes} />
  </g>
);

const Bed: React.FC<{ x: number; y: number; rot?: number; sleeper?: number }> = ({ x, y, rot = 0, sleeper = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} fill={INK}>
    <rect x={-210} y={-120} width={22} height={120} rx={6} />
    <rect x={188} y={-80} width={22} height={80} rx={6} />
    <rect x={-210} y={-90} width={420} height={44} rx={10} />
    <g opacity={sleeper}>
      <circle cx={-150} cy={-118} r={28} />
      <ellipse cx={20} cy={-104} rx={150} ry={26} />
    </g>
  </g>
);

const Candle: React.FC<{ x: number; y: number; h: number; f: number; seed: number; lit?: number; s?: number }> = ({ x, y, h, f, seed, lit = 1, s = 1 }) => {
  const flick = 1 + 0.12 * Math.sin(f * 0.45 + seed * 1.7) + 0.06 * Math.sin(f * 0.9 + seed);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-h - 22} r={46 * flick} fill="#ffb347" opacity={0.18 * lit} />
      <rect x={-12} y={-h} width={24} height={h} rx={4} fill="#efe3c8" opacity={0.92} />
      <ellipse cx={0} cy={-h - 18} rx={8 * flick} ry={18 * flick} fill="#ffd27a" opacity={lit} />
      <ellipse cx={0} cy={-h - 14} rx={4} ry={9} fill="#fff6d8" opacity={lit} />
    </g>
  );
};

const Castle: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) scale(0.62)`} fill="#1a1024" opacity={0.9}>
    <path d="M -300 0 L -300 -260 L -270 -260 L -270 -290 L -240 -290 L -240 -260 L -210 -260 L -210 -340 L -180 -400 L -150 -340 L -150 -260 L 150 -260 L 150 -340 L 180 -400 L 210 -340 L 210 -260 L 240 -260 L 240 -290 L 270 -290 L 270 -260 L 300 -260 L 300 0 Z" />
    <rect x={-40} y={-150} width={80} height={150} rx={40} fill="#2a1410" />
  </g>
);

const Ground: React.FC<{ color?: string }> = ({ color = INK }) => (
  <path d={`M 0 ${GROUND} Q 270 ${GROUND - 40} 540 ${GROUND - 10} T 1080 ${GROUND - 30} L 1080 1920 L 0 1920 Z`} fill={color} />
);

// =============================================================================
const Tale1GodfatherDeath: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;

  // which sky: blend between palettes
  const sky = (() => {
    if (t < S.godfather[0]) return SKIES.royal;
    if (t < S.rule[0]) return SKIES.dusk;
    if (t < S.princess[0]) return SKIES.night;
    if (t < S.cave[0]) return SKIES.royal;
    return SKIES.cave;
  })();
  const loopBack = prog(f, F(51.9), F(53.4)); // fade up from black into the hook frame
  const blackout = Math.min(prog(f, F(50.5), F(51.2)), 1 - loopBack);

  const hookOp = Math.max(1 - prog(f, F(S.hook[1]) - 10, F(S.hook[1])), loopBack);

  // rule scene: Death moves from head to feet
  const ruleMove = EASE(prog(f, F(18.8), F(19.4)));
  // spin: bed rotates, Death ends at the head
  const spin = EASE(prog(f, F(32.9), F(33.8)));
  const lives = prog(f, F(35.9), F(36.6));
  // cave: zoom toward the stub on "Yours"
  const zoom = EASE(prog(f, F(43.4), F(45.6)));
  const newCandle = prog(f, F(48.1), F(48.6));
  const fall = prog(f, F(50.1), F(50.9));

  const titleOp = Math.max(1 - prog(f, F(4.6), F(5.2)), loopBack);

  return (
    <AbsoluteFill style={{ background: INK }}>
      {/* sky */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${sky[0]} 0%, ${sky[1]} 68%, ${sky[1]} 100%)` }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* moon (outdoor scenes) */}
        <circle cx={820} cy={640} r={100} fill="#f7ecd0" opacity={t < S.cave[0] || loopBack > 0 ? 0.85 : 0} />

        {/* ---------- HOOK: the doctor, the bed, Death at the feet ---------- */}
        <g opacity={hookOp}>
          <Castle x={760} y={GROUND - 30} />
          <Bed x={560} y={GROUND} />
          <Death x={860} y={GROUND} s={0.95} eyes={1} flip />
          <Person x={230} y={GROUND} hat bag />
          <Candle x={330} y={GROUND - 100} h={60} f={f} seed={1} s={0.9} />
        </g>

        {/* ---------- GODFATHER: poor man with baby, Death arrives ---------- */}
        <g opacity={sceneOp(f, S.godfather)}>
          <Person x={330} y={GROUND} baby />
          <g opacity={prog(f, F(6.3), F(7.3))} transform={`translate(${(1 - prog(f, F(6.3), F(7.8))) * 160} 0)`}>
            <Death x={760} y={GROUND} eyes={0.8} flip />
          </g>
        </g>

        {/* ---------- GIFT: Death and the grown boy ---------- */}
        <g opacity={sceneOp(f, S.gift)}>
          <Person x={330} y={GROUND} hat bag />
          <Death x={740} y={GROUND} eyes={prog(f, F(14.4), F(14.8))} point={prog(f, F(14.3), F(14.9))} flip />
        </g>

        {/* ---------- RULE: head lives, feet are mine ---------- */}
        <g opacity={sceneOp(f, S.rule)}>
          <Bed x={540} y={GROUND} />
          <Death x={220 + 640 * ruleMove} y={GROUND} s={0.9} eyes={1} flip={ruleMove > 0.5} />
          <text x={220} y={GROUND - 790} fill="#9be7b0" fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={64} textAnchor="middle" opacity={prog(f, F(16.6), F(17.0)) * (1 - ruleMove)}>HEAD: LIVES</text>
          <text x={860} y={GROUND - 790} fill="#ff8a8a" fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={64} textAnchor="middle" opacity={ruleMove}>FEET: MINE</text>
        </g>

        {/* ---------- FAME: the doctor walks, windows light up ---------- */}
        <g opacity={sceneOp(f, S.fame)}>
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${120 + i * 240} ${GROUND})`} fill={INK}>
              <path d="M -90 0 L -90 -170 L 0 -250 L 90 -170 L 90 0 Z" />
              <rect x={-24} y={-130} width={48} height={48} rx={4} fill="#ffcf6b" opacity={prog(f, F(22.0) + i * 6, F(22.0) + i * 6 + 6)} />
            </g>
          ))}
          <Person x={140 + 800 * prog(f, F(21.2), F(24.8))} y={GROUND + 40} s={0.8} hat bag lantern={1} />
        </g>

        {/* ---------- PRINCESS + SPIN ---------- */}
        <g opacity={Math.max(sceneOp(f, S.princess), sceneOp(f, S.spin))}>
          <Castle x={760} y={GROUND - 30} />
          {/* during the spin the bed is redrawn mirrored around its center */}
          <g transform={`translate(540 0) scale(${1 - 2 * spin} 1) translate(-540 0)`}>
            <Bed x={540} y={GROUND} />
          </g>
          <Death x={860} y={GROUND} s={0.95} eyes={1} flip />
          <Person x={190} y={GROUND} hat bag />
          <text x={540} y={GROUND - 790} fill={interpolateColors(spin, [0, 1], ['#ff8a8a', '#9be7b0'])} fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={60} textAnchor="middle" opacity={prog(f, F(27.4), F(28.0))}>
            {spin > 0.5 ? 'NOW AT HER HEAD' : 'AT HER FEET'}
          </text>
          <circle cx={700} cy={GROUND - 120} r={160} fill="#ffe7a8" opacity={0.25 * lives} />
        </g>

        {/* ---------- CAVE OF CANDLES ---------- */}
        <g opacity={Math.max(sceneOp(f, S.cave), sceneOp(f, S.fall) * (1 - blackout))}>
          <g transform={`translate(0 ${-420 * zoom}) translate(600 ${GROUND}) scale(${1 + 1.4 * zoom}) translate(-600 ${-GROUND})`}>
            {Array.from({ length: 42 }, (_, i) => {
              const row = Math.floor(i / 14);
              const col = i % 14;
              const h = 40 + ((i * 37) % 120);
              return <Candle key={i} x={60 + col * 70 + row * 20} y={GROUND - 260 + row * 120} h={h} f={f} seed={i} s={0.7 + row * 0.15} />;
            })}
            {/* the stub */}
            <Candle x={600} y={GROUND} h={16} f={f} seed={99} s={1.1} lit={1 - fall} />
            {/* the flame falling */}
            <ellipse cx={600} cy={GROUND - 40 + 220 * fall} rx={9} ry={18} fill="#ffd27a" opacity={(1 - fall) * (fall > 0 ? 1 : 0)} />
          </g>
          <Death x={900} y={GROUND} s={0.95} eyes={1} point={prog(f, F(43.4), F(44.2))} flip />
          <g opacity={newCandle * (1 - blackout)}>
            <Candle x={760} y={GROUND - 330} h={150} f={f} seed={7} s={0.8} />
          </g>
          <Person x={260} y={GROUND} hat />
        </g>

        <Ground />
      </svg>

      {/* title card on the hook / loop */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', opacity: titleOp }}>
        <div style={{ fontFamily: FONT_EDITORIAL, fontWeight: 900, fontSize: 104, color: '#f7ecd0', letterSpacing: 4, textShadow: '0 4px 30px rgba(0,0,0,0.6)' }}>GODFATHER DEATH</div>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: '#f7ecd0', opacity: 0.8, letterSpacing: 8 }}>A GRIMM TALE</div>
      </div>

      {/* blackout as the flame dies */}
      <AbsoluteFill style={{ background: '#000', opacity: blackout }} />

      <Sequence from={F(29.7)} durationInFrames={F(2.4)}>
        <PauseCard title="PAUSE" subtitle="what would you do?" durSec={2.4} accent="#ffcf6b" y={360} />
      </Sequence>

      <Captions lines={VO} y={1480} accent="#ffcf6b" />
      <ProgressBar color="#ffcf6b" />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: '#8b8fa5', opacity: 0.7 }}>
        retold from the Brothers Grimm, 1812
      </div>
    </AbsoluteFill>
  );
};

export default Tale1GodfatherDeath;
