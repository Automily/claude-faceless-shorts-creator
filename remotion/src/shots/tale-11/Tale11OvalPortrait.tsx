import React from 'react';
import { AbsoluteFill, Easing, Sequence, interpolateColors, useCurrentFrame } from 'remotion';
import { Captions, PauseCard, ProgressBar, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_EDITORIAL, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Candlelit Tales #11: The Oval Portrait (Poe, 1842), told by the painter's wife
// Retention rules v2: bright golden portrait as frame 0; danger in the first line; pause at ~18s; 63.6s.
// Signature: color drains from her as it fills the painting.
// =============================================================================
export const compositionConfig = {
  id: 'Tale11OvalPortrait',
  durationInSeconds: 63.6,
  fps: 30,
  width: 1080,
  height: 1920,
};

const INK = '#05060a';
const PALE = '#f7ecd0';
const GOLD = '#ffcf6b';
const EASE = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);
const GROUND = 1260;

const S = {
  hook: [0, 4.3],
  painter: [4.3, 9.1],
  tower: [9.1, 18.0],
  pause: [18.0, 22.4],
  hands: [22.4, 29.5],
  split: [29.5, 39.0],
  weeks: [39.0, 46.0],
  brush: [46.0, 49.9],
  life: [49.9, 54.6],
  dead: [54.6, 58.9],
  end: [58.9, 63.6],
} as const;
const sceneOp = (f: number, [a, b]: readonly [number, number], fade = 8) =>
  Math.min(prog(f, F(a) - fade, F(a)), 1 - prog(f, F(b) - fade, F(b)));

// color with "life" 0..1 (0 = grey/dead, 1 = full color)
const life = (c: string, t: number, grey = '#8a8a8e') => interpolateColors(Math.max(0, Math.min(1, t)), [0, 1], [grey, c]);

// =============================================================================
// PARTS
// =============================================================================
// a face (used for both the painting and the wife's close-ups), colored by `t`
const Face: React.FC<{ x: number; y: number; s?: number; t: number; eyesOpen?: number; lips?: number }> = ({ x, y, s = 1, t, eyesOpen = 1, lips = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* hair */}
    <path d="M -150 40 Q -170 -230 0 -250 Q 170 -230 150 40 Q 160 200 120 280 L -120 280 Q -160 200 -150 40 Z" fill={life('#3a2014', t, '#3a3a3e')} />
    {/* neck + shoulders */}
    <path d="M -46 170 L 46 170 L 60 240 Q 160 260 200 330 L -200 330 Q -160 260 -60 240 Z" fill={life('#e8c4a8', t, '#b8b8bc')} />
    <path d="M -200 330 Q -150 270 -60 262 Q 0 300 60 262 Q 150 270 200 330 Z" fill={life('#2a4bd0', t, '#5a5a62')} />
    {/* face */}
    <ellipse cx={0} cy={0} rx={112} ry={150} fill={life('#f0cdb0', t, '#c4c4c8')} />
    {/* cheeks */}
    <circle cx={-58} cy={40} r={30} fill="#e88a8a" opacity={0.55 * t} />
    <circle cx={58} cy={40} r={30} fill="#e88a8a" opacity={0.55 * t} />
    {/* eyes */}
    {[-42, 42].map((ex) => (
      <g key={ex}>
        <ellipse cx={ex} cy={-20} rx={22} ry={13 * eyesOpen + 1} fill="#ffffff" />
        <circle cx={ex} cy={-20} r={10 * Math.max(0.2, eyesOpen)} fill={life('#2a5a8a', t, '#4a4a4e')} />
      </g>
    ))}
    {/* nose + lips */}
    <path d="M 0 -6 Q -10 34 4 44" stroke={life('#b88a70', t, '#9a9a9e')} strokeWidth={5} fill="none" />
    <path d="M -34 84 Q 0 70 34 84 Q 0 104 -34 84 Z" fill={life('#c0182f', t * lips, '#9a9a9e')} />
  </g>
);

const OvalFrame: React.FC<{ x: number; y: number; s?: number; t: number; glow?: number; eyes?: number; lips?: number; blank?: number }> = ({ x, y, s = 1, t, glow = 0, eyes = 1, lips = 1, blank = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse rx={420} ry={540} fill={GOLD} opacity={0.12 * glow} />
    <ellipse rx={330} ry={430} fill="#c9a24a" />
    <ellipse rx={300} ry={400} fill="#8a6a2a" />
    <ellipse rx={284} ry={384} fill={life('#2a1a24', Math.max(0.3, t), '#3a3a40')} />
    <clipPath id="ovalclip"><ellipse rx={284} ry={384} /></clipPath>
    <g clipPath="url(#ovalclip)">
      <g opacity={1 - blank}>
        <Face x={0} y={-20} s={1.15} t={t} eyesOpen={eyes} lips={lips} />
      </g>
      <rect x={-300} y={-400} width={600} height={800} fill="#e8e0d0" opacity={blank} />
    </g>
    {Array.from({ length: 16 }, (_, i) => (
      <circle key={i} cx={316 * Math.cos((i / 16) * Math.PI * 2)} cy={416 * Math.sin((i / 16) * Math.PI * 2)} r={9} fill="#ffe7a0" opacity={0.8} />
    ))}
  </g>
);

const Painter: React.FC<{ x: number; s?: number; arms?: number; turn?: number }> = ({ x, s = 1, arms = 0, turn = 0 }) => (
  <g transform={`translate(${x} ${GROUND}) scale(${(1 - 2 * turn) * s} ${s})`} fill={INK}>
    <circle cx={0} cy={-300} r={34} />
    <path d="M -36 -322 Q 0 -350 40 -324 L 50 -312 L -40 -312 Z" />
    <path d="M -50 -262 Q 0 -280 50 -262 L 64 -110 L -64 -110 Z" />
    <rect x={-40} y={-112} width={26} height={112} rx={10} />
    <rect x={14} y={-112} width={26} height={112} rx={10} />
    <g transform={`translate(38 -240) rotate(${-60 - 90 * arms})`}>
      <rect x={-11} y={0} width={22} height={120} rx={11} />
      <rect x={-3} y={110} width={6} height={60} fill="#5a3a1a" />
      <circle cy={172} r={6} fill="#c0182f" />
    </g>
    <g transform={`translate(-38 -240) rotate(${40 + 100 * arms})`}>
      <rect x={-11} y={0} width={22} height={110} rx={11} />
      <ellipse cx={0} cy={120} rx={44} ry={26} fill="#3a2a1a" />
      {['#c0182f', '#2a4bd0', '#e6b422'].map((c, i) => <circle key={c} cx={-18 + i * 18} cy={116} r={7} fill={c} />)}
    </g>
  </g>
);

const Wife: React.FC<{ x: number; s?: number; t: number; slump?: number }> = ({ x, s = 1, t, slump = 0 }) => (
  <g transform={`translate(${x} ${GROUND}) scale(${s})`}>
    {/* chair */}
    <rect x={-70} y={-170} width={140} height={20} fill="#2a1a10" />
    <rect x={-70} y={-170} width={14} height={170} fill="#2a1a10" />
    <rect x={56} y={-170} width={14} height={170} fill="#2a1a10" />
    <rect x={-70} y={-380} width={14} height={210} fill="#2a1a10" />
    <g transform={`rotate(${-14 * slump} -40 -170)`}>
      <circle cx={0 + 20 * slump} cy={-330 + 30 * slump} r={34} fill={life('#f0cdb0', t, '#b8b8bc')} />
      <path d={`M -30 -350 Q 0 -380 34 -350 Q 44 -310 30 -290 L -30 -290 Q -44 -310 -30 -350 Z`} fill={life('#3a2014', t, '#3a3a3e')} transform={`translate(${20 * slump} ${30 * slump})`} />
      <path d="M -50 -290 Q 0 -306 50 -290 L 70 -160 L -70 -160 Z" fill={life('#2a4bd0', t, '#5a5a62')} />
      <path d="M -70 -170 L 110 -170 L 130 0 L 60 0 L 50 -110 L -70 -110 Z" fill={life('#24409e', t, '#4a4a52')} />
    </g>
  </g>
);

// =============================================================================
const Tale11OvalPortrait: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;

  const loopBack = prog(f, F(62.1), F(63.4));
  const hookOp = Math.max(1 - prog(f, F(S.hook[1]) - 10, F(S.hook[1])), loopBack, sceneOp(f, S.end));
  const titleOp = Math.max(1 - prog(f, F(3.7), F(4.3)), loopBack);

  const label = (text: string, at: number, op: number, color = PALE, y = 380, x = 540, size = 58) => (
    <text x={x} y={y} fill={color} fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={size} textAnchor="middle" opacity={op * prog(f, F(at), F(at) + 5)}>
      {text}
    </text>
  );
  const push = (a: number, b: number, amt = 0.12) => 1 + amt * EASE(prog(f, F(a), F(b)));
  const pushT = (k: number, cx = 540, cy = 1000) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

  // the transfer of life: painting progress p, her life = 1 - p
  const p = EASE(prog(f, F(9.5), F(52.0)));
  const her = Math.max(0, 1 - 1.05 * p) * (1 - prog(f, F(55.6), F(56.6)));
  const lipsDone = prog(f, F(47.2), F(47.6));
  const eyesDone = prog(f, F(48.5), F(48.9));
  const arms = EASE(prog(f, F(50.9), F(51.5)));
  const turn = EASE(prog(f, F(54.9), F(55.6)));
  const shake = 3 * Math.sin(f * 1.7);

  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #1a1018 0%, #3a2418 70%, #3a2418 100%)' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* ---------- HOOK / END: the finished portrait, glowing ---------- */}
        <g opacity={hookOp}>
          <rect x={0} y={0} width={1080} height={1920} fill="#2a1a12" />
          <circle cx={540} cy={860} r={620} fill={GOLD} opacity={0.18} />
          <OvalFrame x={540} y={880} s={1.0} t={1} glow={1} />
          {label('SHE NEVER LOOKED MORE ALIVE', 59.2, sceneOp(f, S.end) * (1 - loopBack), GOLD, 300, 540, 46)}
        </g>

        {/* ---------- THE PAINTER ---------- */}
        <g opacity={sceneOp(f, S.painter)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#2a1d14" />
          <g transform={`translate(700 ${GROUND})`}>
            <path d="M -20 0 L 40 -520 L 100 0" stroke="#3a2a1a" strokeWidth={14} fill="none" />
            <rect x={-80} y={-560} width={260} height={340} fill="#e8e0d0" stroke="#3a2a1a" strokeWidth={8} />
          </g>
          <Painter x={420} s={1.1} arms={0.2} />
          {label('HE LOVES HIS ART', 6.2, 1 - prog(f, F(7.7), F(7.8)), PALE)}
          {label('MORE THAN ME', 7.8, 1, '#ff8a8a')}
        </g>

        {/* ---------- THE TOWER ROOM ---------- */}
        <g opacity={sceneOp(f, S.tower)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#1e140e" />
          <rect x={430} y={300} width={140} height={220} fill="#cfe0f0" opacity={0.85} />
          <path d={`M 430 520 L 570 520 L 760 ${GROUND} L 200 ${GROUND} Z`} fill="#cfe0f0" opacity={0.12} />
          <Wife x={420} s={1.0} t={her} />
          <g transform={`translate(800 ${GROUND})`}>
            <path d="M -20 0 L 40 -520 L 100 0" stroke="#3a2a1a" strokeWidth={14} fill="none" />
            <rect x={-100} y={-560} width={260} height={340} fill="#e8e0d0" stroke="#3a2a1a" strokeWidth={8} />
          </g>
          <Painter x={680} s={0.95} arms={0.25 + 0.1 * Math.sin(f * 0.4)} />
          {label('WEEKS PASS', 14.2, 1 - prog(f, F(15.9), F(16.0)), PALE, 220)}
          {label("HE DOESN'T SEE ME", 16.0, 1, '#9fb4c6', 220)}
        </g>

        {/* ---------- PAUSE: close on her ---------- */}
        <g opacity={sceneOp(f, S.pause)} transform={pushT(push(18.0, 22.3, 0.12), 540, 1000)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#1e140e" />
          <Face x={540} y={880} s={1.35} t={her} />
        </g>

        {/* ---------- HER HANDS, THE SMOKE ---------- */}
        <g opacity={sceneOp(f, S.hands)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#1a120c" />
          <g transform="translate(820 600)">
            <rect x={-14} y={0} width={28} height={140} fill="#efe3c8" />
            <ellipse cx={0} cy={-16} rx={12} ry={26} fill={GOLD} />
            {[0, 1, 2].map((k) => (
              <path key={k} d={`M 0 ${-40 - k * 60} q ${30 * Math.sin(f * 0.1 + k)} -30 0 -60`} stroke="#8a8a8e" strokeWidth={6} fill="none" opacity={0.5} />
            ))}
          </g>
          {/* POV: her own hands in her lap, trembling */}
          <g transform={`translate(${540 + shake} 1050)`}>
            <path d="M -360 260 Q -300 60 -120 40 L 120 40 Q 300 60 360 260 Z" fill={life('#24409e', her, '#4a4a52')} />
            <ellipse cx={-90} cy={60} rx={110} ry={50} fill={life('#f0cdb0', her, '#b8b8bc')} />
            <ellipse cx={90} cy={70} rx={110} ry={50} fill={life('#f0cdb0', her, '#b8b8bc')} />
          </g>
          {label('MY HANDS SHAKE', 22.6, 1 - prog(f, F(26.2), F(26.3)), PALE)}
          {label('HOLD STILL', 26.4, 1, '#ff8a8a', 380, 540, 72)}
        </g>

        {/* ---------- SPLIT: painting warms, she cools ---------- */}
        <g opacity={sceneOp(f, S.split)}>
          <rect x={0} y={0} width={540} height={1920} fill="#3a2418" />
          <rect x={540} y={0} width={540} height={1920} fill="#14161c" />
          <g transform="translate(270 900) scale(0.55)">
            <OvalFrame x={0} y={0} t={p} glow={p} />
          </g>
          <Face x={810} y={920} s={1.05} t={her} />
          <line x1={540} y1={0} x2={540} y2={1920} stroke="#000" strokeWidth={6} />
          {label('WARMER', 33.2, 1, GOLD, 300, 270, 60)}
          {label('COLDER', 34.4, 1, '#9fb4c6', 300, 810, 60)}
          {label('HER CHEEKS. MINE.', 36.6, 1, PALE, 1300, 540, 50)}
        </g>

        {/* ---------- SEVEN WEEKS ---------- */}
        <g opacity={sceneOp(f, S.weeks)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#1e140e" />
          <rect x={60} y={GROUND - 600} width={220} height={600} fill={GOLD} opacity={0.25 * prog(f, F(41.8), F(42.4))} />
          <g opacity={prog(f, F(41.8), F(42.4))}>
            {[110, 200].map((x) => (
              <g key={x} transform={`translate(${x} ${GROUND})`} fill={INK}>
                <circle cx={0} cy={-280} r={30} />
                <path d="M -40 -246 Q 0 -262 40 -246 L 70 0 L -70 0 Z" />
              </g>
            ))}
          </g>
          <Wife x={540} s={1.05} t={her} slump={0.5} />
          <g transform="translate(860 700) scale(0.4)"><OvalFrame x={0} y={0} t={p} glow={p} /></g>
          {label('SEVEN WEEKS', 39.2, 1 - prog(f, F(41.7), F(41.8)), PALE)}
          {label('"SO BEAUTIFUL"', 43.3, 1, GOLD)}
        </g>

        {/* ---------- THE LAST BRUSHSTROKES ---------- */}
        <g opacity={sceneOp(f, S.brush)} transform={pushT(push(46.0, 49.8, 0.15), 540, 900)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#2a1a12" />
          <OvalFrame x={540} y={900} s={1.0} t={p} glow={p} lips={0.3 + 0.7 * lipsDone} eyes={0.4 + 0.6 * eyesDone} />
          <g transform={`translate(${lipsDone < 1 ? 600 : 620} ${eyesDone > 0 ? 780 : 960}) rotate(-30)`}>
            <rect x={-6} y={0} width={12} height={360} fill="#5a3a1a" />
            <path d="M -10 0 L 10 0 L 4 -40 L -4 -40 Z" fill="#c0182f" />
          </g>
        </g>

        {/* ---------- "THIS IS LIFE ITSELF!" ---------- */}
        <g opacity={sceneOp(f, S.life)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#2a1a12" />
          <circle cx={760} cy={800} r={500} fill={GOLD} opacity={0.15 * arms} />
          <g transform="translate(760 820) scale(0.6)"><OvalFrame x={0} y={0} t={1} glow={1} /></g>
          <Painter x={330} s={1.1} arms={arms} />
          {label('THIS IS LIFE ITSELF!', 51.8, 1, GOLD, 300, 540, 62)}
        </g>

        {/* ---------- ALREADY DEAD ---------- */}
        <g opacity={sceneOp(f, S.dead)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#14161c" />
          <Wife x={330} s={1.05} t={0} slump={1} />
          <Painter x={760} s={1.1} arms={1 - turn} turn={turn} />
          {label('ALREADY DEAD', 56.9, 1, '#c8c8d0', 380, 540, 76)}
        </g>
      </svg>

      {/* title card on the hook / loop */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: titleOp }}>
        <div style={{ fontFamily: FONT_EDITORIAL, fontWeight: 900, fontSize: 96, color: PALE, letterSpacing: 3, textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>THE OVAL PORTRAIT</div>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: PALE, opacity: 0.85, letterSpacing: 8 }}>TOLD BY HIS WIFE</div>
      </div>

      <Sequence from={F(18.1)} durationInFrames={F(4.2)}>
        <PauseCard title="PAUSE" subtitle="do you keep sitting for him?" durSec={4.2} accent={GOLD} y={300} />
      </Sequence>

      <Captions lines={VO} y={1480} accent={GOLD} />
      <ProgressBar color={GOLD} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: '#8b8fa5', opacity: 0.7 }}>
        retold from Edgar Allan Poe, 1842
      </div>
    </AbsoluteFill>
  );
};

export default Tale11OvalPortrait;
