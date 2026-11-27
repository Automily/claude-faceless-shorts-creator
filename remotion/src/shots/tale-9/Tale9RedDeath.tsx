import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { Captions, PauseCard, ProgressBar, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_EDITORIAL, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Candlelit Tales #9: The Masque of the Red Death (Poe, 1842), told by Prince Prospero
// Signature: the seven colored rooms; the chase is a color strobe through all seven, ending in black.
// =============================================================================
export const compositionConfig = {
  id: 'Tale9RedDeath',
  durationInSeconds: 82.4,
  fps: 30,
  width: 1080,
  height: 1920,
};

const INK = '#05060a';
const PALE = '#f7ecd0';
const GOLD = '#ffcf6b';
const BLOOD = '#c0182f';
const EASE = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);
const GROUND = 1260;

const ROOMS = ['#2a4bd0', '#6a2fa0', '#2a8a4a', '#e07a1a', '#e8e8e8', '#8a4fd0', '#050505'];
const ROOM_WORDS = [22.73, 23.34, 24.06, 24.95, 25.75, 26.45, 28.7];
const CHASE_WORDS = [59.1, 59.89, 60.68, 61.47, 62.37, 63.1, 64.42];

const S = {
  hook: [0, 5.25],
  plague: [5.25, 12.9],
  abbey: [12.9, 20.2],
  rooms: [20.2, 31.45],
  clock: [31.45, 40.5],
  guest: [40.5, 48.6],
  pause: [48.6, 53.4],
  seize: [53.4, 59.0],
  chase: [59.0, 65.9],
  death: [65.9, 69.35],
  empty: [69.35, 75.5],
  end: [75.5, 82.4],
} as const;
const sceneOp = (f: number, [a, b]: readonly [number, number], fade = 8) =>
  Math.min(prog(f, F(a) - fade, F(a)), 1 - prog(f, F(b) - fade, F(b)));

// =============================================================================
// PARTS
// =============================================================================
const Dancer: React.FC<{ x: number; s?: number; f: number; seed: number; frozen?: number; gown?: boolean }> = ({ x, s = 1, f, seed, frozen = 0, gown }) => {
  const sway = (1 - frozen) * 10 * Math.sin(f * 0.15 + seed);
  const bob = (1 - frozen) * 6 * Math.abs(Math.sin(f * 0.15 + seed));
  return (
    <g transform={`translate(${x + sway} ${GROUND - bob}) scale(${s})`} fill={INK}>
      <circle cx={0} cy={-300} r={32} />
      {/* party mask */}
      <rect x={-24} y={-312} width={48} height={14} rx={6} fill={GOLD} opacity={0.75} />
      {gown ? <path d="M -40 -262 Q 0 -280 40 -262 L 56 -150 L 100 0 L -100 0 L -56 -150 Z" /> : (
        <>
          <path d="M -46 -262 Q 0 -280 46 -262 L 60 -110 L -60 -110 Z" />
          <rect x={-38} y={-112} width={24} height={112} rx={10} />
          <rect x={14} y={-112} width={24} height={112} rx={10} />
        </>
      )}
    </g>
  );
};

const Clock: React.FC<{ x: number; f: number; swing?: number; s?: number }> = ({ x, f, swing = 1, s = 1 }) => (
  <g transform={`translate(${x} ${GROUND}) scale(${s})`}>
    <rect x={-90} y={-720} width={180} height={720} fill="#120a08" stroke="#2a1a12" strokeWidth={6} />
    <path d="M -110 -720 L 0 -800 L 110 -720 Z" fill="#120a08" />
    <circle cy={-600} r={70} fill="#d8cfbf" />
    <line x1={0} y1={-600} x2={0} y2={-650} stroke={INK} strokeWidth={8} />
    <line x1={0} y1={-600} x2={30} y2={-600} stroke={INK} strokeWidth={6} />
    <g transform={`translate(0 -480) rotate(${swing * 18 * Math.sin(f * 0.2)})`}>
      <line x1={0} y1={0} x2={0} y2={260} stroke="#8a6a3a" strokeWidth={6} />
      <circle cy={270} r={30} fill="#c9a24a" />
    </g>
  </g>
);

const Stranger: React.FC<{ x: number; s?: number; empty?: number; turn?: number }> = ({ x, s = 1, empty = 0, turn = 1 }) => (
  <g transform={`translate(${x} ${GROUND}) scale(${s})`}>
    <g opacity={1 - empty}>
      {/* grave clothes */}
      <path d="M -70 -380 Q 0 -440 70 -380 L 120 0 L -120 0 Z" fill="#cfc8bc" />
      <path d="M -70 -380 Q 0 -440 70 -380 L 80 -300 L -80 -300 Z" fill="#b8b0a2" />
      {/* the corpse mask */}
      <g opacity={turn}>
        <ellipse cy={-420} rx={46} ry={58} fill="#e8e2d6" />
        <ellipse cx={-17} cy={-430} rx={11} ry={14} fill="#1a1414" />
        <ellipse cx={17} cy={-430} rx={11} ry={14} fill="#1a1414" />
        <path d="M -18 -390 Q 0 -380 18 -390" stroke="#1a1414" strokeWidth={4} fill="none" />
        {[[-30, -455], [22, -400], [-8, -470], [34, -440], [-26, -396], [8, -415]].map(([dx, dy], i) => (
          <circle key={i} cx={dx} cy={dy} r={5 + (i % 3) * 2} fill={BLOOD} />
        ))}
      </g>
    </g>
    {/* the empty robe on the floor */}
    <g opacity={empty}>
      <path d="M -140 0 Q -60 -60 0 -40 Q 60 -70 150 0 Z" fill="#cfc8bc" />
      <ellipse cx={60} cy={-30} rx={40} ry={26} fill="#e8e2d6" />
    </g>
  </g>
);

const Prospero: React.FC<{ x: number; s?: number; dagger?: number; fall?: number; flip?: boolean }> = ({ x, s = 1, dagger = 0, fall = 0, flip }) => (
  <g transform={`translate(${x} ${GROUND}) scale(${flip ? -s : s} ${s}) rotate(${-85 * fall})`} fill={INK}>
    <circle cx={0} cy={-310} r={36} />
    <path d="M -36 -340 L -30 -372 L -12 -350 L 0 -378 L 12 -350 L 30 -372 L 36 -340 Z" fill={GOLD} />
    <path d="M -56 -272 Q 0 -292 56 -272 L 100 0 L -100 0 Z" fill="#3a0a12" />
    <g transform={`translate(40 -250) rotate(${-150 * dagger + 20})`}>
      <rect x={-11} y={0} width={22} height={120} rx={11} />
      <rect x={-4} y={115} width={8} height={70} fill="#d8d8e0" opacity={dagger} />
    </g>
  </g>
);

const Candles: React.FC<{ f: number; out?: number }> = ({ f, out = 0 }) => (
  <g>
    {[140, 940].map((x, i) => (
      <g key={i}>
        <rect x={x - 8} y={560} width={16} height={60} fill="#efe3c8" />
        <ellipse cx={x} cy={544} rx={8 * (1 - out)} ry={18 * (1 - out)} fill={GOLD} />
        <circle cx={x} cy={544} r={90} fill={GOLD} opacity={0.12 * (1 - out) * (1 + 0.1 * Math.sin(f * 0.6 + i))} />
      </g>
    ))}
  </g>
);

const Floor: React.FC<{ color?: string }> = ({ color = '#0a0606' }) => <rect x={0} y={GROUND} width={1080} height={660} fill={color} />;

// =============================================================================
const Tale9RedDeath: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;

  const loopBack = prog(f, F(81.0), F(82.3));
  const hookOp = Math.max(1 - prog(f, F(S.hook[1]) - 10, F(S.hook[1])), loopBack);
  const titleOp = Math.max(1 - prog(f, F(4.65), F(5.25)), loopBack);

  const label = (text: string, at: number, op: number, color = PALE, y = 470, x = 540, size = 60) => (
    <text x={x} y={y} fill={color} fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={size} textAnchor="middle" opacity={op * prog(f, F(at), F(at) + 5)}>
      {text}
    </text>
  );
  const push = (a: number, b: number, amt = 0.12) => 1 + amt * EASE(prog(f, F(a), F(b)));
  const pushT = (k: number, cx = 540, cy = 1000) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

  const weld = prog(f, F(15.4), F(16.4));
  const chime = prog(f, F(34.8), F(35.0)) * (1 - prog(f, F(35.6), F(36.4)));
  const frozen = prog(f, F(35.3), F(35.6)) * (1 - prog(f, F(38.6), F(39.0)));
  const guestIn = EASE(prog(f, F(41.6), F(42.6)));
  const dagger = prog(f, F(56.6), F(57.1));
  const turnAt = prog(f, F(66.0), F(66.4));
  const fall = EASE(prog(f, F(67.1), F(67.7)));
  const empty = prog(f, F(72.2), F(72.7));
  const lightsOut = prog(f, F(77.2), F(77.8));

  // which room color is flashing in the chase
  let chaseIdx = -1;
  CHASE_WORDS.forEach((w, i) => { if (t >= w) chaseIdx = i; });
  const chaseColor = chaseIdx >= 0 ? ROOMS[chaseIdx] : '#050505';
  const chaseFlash = chaseIdx >= 0 ? 1 - prog(f, F(CHASE_WORDS[chaseIdx]), F(CHASE_WORDS[chaseIdx]) + 10) : 0;

  const dancers = (fr: number) => (
    <g>
      {[150, 330, 760, 930].map((x, i) => <Dancer key={i} x={x} s={0.85} f={f} seed={i * 1.7} frozen={fr} gown={i % 2 === 1} />)}
    </g>
  );

  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0a0406 0%, #2a0a10 70%, #2a0a10 100%)' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* ---------- HOOK / LOOP: the black room, the clock, the dancers ---------- */}
        <g opacity={hookOp}>
          <rect x={0} y={0} width={1080} height={1920} fill="#160406" />
          <rect x={380} y={360} width={320} height={420} fill={BLOOD} opacity={0.35} />
          <Clock x={540} f={f} />
          {dancers(0)}
          <Floor />
        </g>

        {/* ---------- THE RED DEATH ---------- */}
        <g opacity={sceneOp(f, S.plague)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#2a0a0c" />
          <circle cx={540} cy={900} r={600} fill={BLOOD} opacity={0.18 + 0.05 * Math.sin(f * 0.1)} />
          {[180, 420, 700, 900].map((x, i) => (
            <g key={i} transform={`translate(${x} ${GROUND}) rotate(${i % 2 ? -80 * prog(f, F(8.5) + i * 12, F(8.5) + i * 12 + 10) : 0})`} fill={INK}>
              <circle cx={0} cy={-280} r={30} />
              <path d="M -42 -246 Q 0 -262 42 -246 L 54 0 L -54 0 Z" />
            </g>
          ))}
          <Floor />
          {label('THE RED DEATH', 5.6, 1 - prog(f, F(7.2), F(7.4)), BLOOD, 470, 540, 74)}
          {label('HALF AN HOUR', 7.4, 1, PALE)}
        </g>

        {/* ---------- THE ABBEY: gates welded shut ---------- */}
        <g opacity={sceneOp(f, S.abbey)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#140a10" />
          <circle cx={870} cy={660} r={70} fill={PALE} opacity={0.75} />
          <g fill="#0a0608">
            <path d={`M 80 ${GROUND} L 80 ${GROUND - 520} L 160 ${GROUND - 620} L 240 ${GROUND - 520} L 840 ${GROUND - 520} L 920 ${GROUND - 620} L 1000 ${GROUND - 520} L 1000 ${GROUND} Z`} />
          </g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={160 + i * 140} y={GROUND - 420} width={40} height={70} rx={20} fill={GOLD} opacity={0.6} />
          ))}
          {/* the gate */}
          <rect x={430} y={GROUND - 300} width={220} height={300} fill="#2a1a14" />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={440 + i * 36} y={GROUND - 300} width={8} height={300} fill="#5a4a3a" />)}
          {/* weld sparks */}
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx={540 + 80 * Math.cos(i + f * 0.6)} cy={GROUND - 150 + 60 * Math.sin(i * 2 + f * 0.5)} r={4} fill={GOLD} opacity={weld * (1 - prog(f, F(17.0), F(17.6))) * ((i + f) % 3 === 0 ? 1 : 0.4)} />
          ))}
          <Floor />
          {label('A THOUSAND FRIENDS', 13.5, 1 - prog(f, F(15.3), F(15.5)), PALE)}
          {label('GATES WELDED SHUT', 15.5, 1, GOLD)}
        </g>

        {/* ---------- THE SEVEN ROOMS ---------- */}
        <g opacity={sceneOp(f, S.rooms)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#0a0608" />
          {ROOMS.map((c, i) => {
            const on = prog(f, F(ROOM_WORDS[i]), F(ROOM_WORDS[i]) + 6);
            const w = 1080 / 7;
            return (
              <g key={i} opacity={on}>
                <rect x={i * w + 4} y={520} width={w - 8} height={GROUND - 520} fill={c} opacity={i === 6 ? 1 : 0.85} />
                {i === 6 ? <rect x={i * w + 30} y={620} width={w - 60} height={220} fill={BLOOD} /> : null}
              </g>
            );
          })}
          <Floor />
          {label('SEVEN ROOMS', 20.4, 1 - prog(f, F(29.6), F(29.9)), PALE)}
          {label('WINDOWS THE COLOR OF BLOOD', 30.0, 1, BLOOD, 470, 540, 48)}
        </g>

        {/* ---------- THE EBONY CLOCK ---------- */}
        <g opacity={sceneOp(f, S.clock)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#100404" />
          <rect x={380} y={360} width={320} height={420} fill={BLOOD} opacity={0.35} />
          <Clock x={540} f={f} />
          {dancers(frozen)}
          <circle cx={540} cy={GROUND - 600} r={140 + 260 * chime} fill="none" stroke={GOLD} strokeWidth={6} opacity={chime} />
          <Floor />
          {label('THE MUSIC STOPS', 35.9, 1 - prog(f, F(38.5), F(38.7)), PALE, 330)}
          {label('...THEN LAUGHS', 38.7, 1, GOLD, 330)}
        </g>

        {/* ---------- THE GUEST ---------- */}
        <g opacity={sceneOp(f, S.guest)} transform={pushT(push(44.6, 48.4, 0.15), 540, GROUND - 400)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#100404" />
          <Clock x={900} f={f} s={0.7} />
          <g transform={`translate(${-150 * guestIn} 0)`}>
            <Dancer x={300} s={0.85} f={f} seed={1} frozen={1} />
          </g>
          <g transform={`translate(${150 * guestIn} 0)`}>
            <Dancer x={760} s={0.85} f={f} seed={2} frozen={1} gown />
          </g>
          <g opacity={guestIn}>
            <Stranger x={540} s={1.15} />
          </g>
          <Floor />
          {label('MIDNIGHT', 40.7, 1 - prog(f, F(42.2), F(42.4)), PALE, 330)}
          {label('THE FACE OF A CORPSE', 45.6, 1, BLOOD, 330, 540, 54)}
        </g>

        {/* ---------- PAUSE ---------- */}
        <g opacity={sceneOp(f, S.pause)} transform={pushT(push(48.6, 53.2, 0.3), 540, GROUND - 480)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#0c0303" />
          <Stranger x={540} s={1.15} />
          <Floor />
        </g>

        {/* ---------- SEIZE HIM ---------- */}
        <g opacity={sceneOp(f, S.seize)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#100404" />
          <Prospero x={300} s={1.1} dagger={dagger} />
          {dancers(1)}
          <Stranger x={800} s={1.0} />
          <Floor />
          {label('SEIZE HIM!', 54.5, 1 - prog(f, F(55.3), F(55.4)), BLOOD, 330, 540, 80)}
          {label('NO ONE MOVES', 55.4, 1 - prog(f, F(56.5), F(56.6)), PALE, 330)}
          {label('MY DAGGER', 56.7, 1, PALE, 330)}
        </g>

        {/* ---------- THE CHASE: seven rooms ---------- */}
        <g opacity={sceneOp(f, S.chase, 4)}>
          <rect x={0} y={0} width={1080} height={1920} fill={chaseColor} />
          <rect x={0} y={0} width={1080} height={1920} fill="#ffffff" opacity={0.25 * chaseFlash} />
          {chaseIdx === 6 ? <rect x={380} y={460} width={320} height={380} fill={BLOOD} /> : null}
          <Stranger x={760 + 80 * ((t * 2) % 1)} s={0.95} />
          <Prospero x={300 + 80 * ((t * 2) % 1)} s={1.0} dagger={1} />
          <Floor color="#050304" />
        </g>

        {/* ---------- HE TURNS. I FALL. ---------- */}
        <g opacity={sceneOp(f, S.death)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#050505" />
          <rect x={380} y={460} width={320} height={380} fill={BLOOD} />
          <Stranger x={720} s={1.05} turn={turnAt} />
          <Prospero x={470} s={1.0} dagger={1 - fall} fall={fall} />
          <rect x={0} y={0} width={1080} height={1920} fill={BLOOD} opacity={0.4 * prog(f, F(67.4), F(67.5)) * (1 - prog(f, F(67.6), F(68.4)))} />
          <Floor color="#050304" />
          {label('HE TURNS', 66.1, 1 - prog(f, F(67.0), F(67.1)), PALE, 330)}
          {label('I FALL DEAD', 67.2, 1, BLOOD, 330, 540, 70)}
        </g>

        {/* ---------- NOTHING UNDER THE MASK ---------- */}
        <g opacity={sceneOp(f, S.empty)} transform={pushT(push(71.0, 74.5, 0.15), 540, GROUND - 200)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#100404" />
          <rect x={380} y={460} width={320} height={380} fill={BLOOD} opacity={0.6} />
          {[260, 820].map((x, i) => <Dancer key={i} x={x} s={0.9} f={f} seed={i} frozen={1} gown={i === 1} />)}
          <Stranger x={540} s={1.1} empty={empty} />
          <Floor />
          {label('NOTHING', 72.5, 1 - prog(f, F(73.6), F(73.8)), PALE, 330, 540, 74)}
          {label('NO ONE', 73.75, 1, BLOOD, 330, 540, 80)}
        </g>

        {/* ---------- THE CLOCK STOPS ---------- */}
        <g opacity={sceneOp(f, S.end) * (1 - loopBack)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#0c0204" />
          <rect x={380} y={360} width={320} height={420} fill={BLOOD} opacity={0.35 * (1 - lightsOut) + 0.15} />
          <Clock x={540} f={f} swing={1 - prog(f, F(75.8), F(76.4))} />
          <Candles f={f} out={lightsOut} />
          <rect x={0} y={0} width={1080} height={1920} fill={BLOOD} opacity={0.15 * prog(f, F(78.4), F(79.0))} />
          <Floor />
          {label('THE RED DEATH', 78.5, 1, BLOOD, 330, 540, 70)}
          {label('RULES OVER ALL', 79.2, 1, PALE, 400, 540, 52)}
        </g>
      </svg>

      {/* title card on the hook / loop */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: titleOp }}>
        <div style={{ fontFamily: FONT_EDITORIAL, fontWeight: 900, fontSize: 60, color: PALE, letterSpacing: 3, textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>THE MASQUE OF THE</div>
        <div style={{ fontFamily: FONT_EDITORIAL, fontWeight: 900, fontSize: 104, color: BLOOD, letterSpacing: 3, textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>RED DEATH</div>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: PALE, opacity: 0.8, letterSpacing: 8 }}>EDGAR ALLAN POE</div>
      </div>

      <Sequence from={F(48.75)} durationInFrames={F(4.6)}>
        <PauseCard title="PAUSE" subtitle="a stranger at your party. what do you do?" durSec={4.6} accent={GOLD} y={360} />
      </Sequence>

      <Captions lines={VO} y={1480} accent={GOLD} />
      <ProgressBar color={BLOOD} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: '#8b8fa5', opacity: 0.7 }}>
        retold from Edgar Allan Poe, 1842
      </div>
    </AbsoluteFill>
  );
};

export default Tale9RedDeath;
