import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { Captions, PauseCard, ProgressBar, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_EDITORIAL, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Candlelit Tales #8: The Cask of Amontillado (Poe, 1846), told by Montresor
// Torchlit vaults. Signature: the jester's bells; the wall rises over the camera, tier by tier.
// =============================================================================
export const compositionConfig = {
  id: 'Tale8Amontillado',
  durationInSeconds: 83.8,
  fps: 30,
  width: 1080,
  height: 1920,
};

const INK = '#05060a';
const PALE = '#f7ecd0';
const GOLD = '#ffcf6b';
const TORCH = '#ff9a3c';
const BONE = '#d8cfbf';
const EASE = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);
const GROUND = 1260;

const S = {
  hook: [0, 4.8],
  insult: [4.8, 13.4],
  carnival: [13.4, 22.95],
  vaults: [22.95, 30.55],
  turn: [30.55, 39.1],
  chain: [39.1, 46.1],
  pause: [46.1, 50.8],
  wall: [50.8, 71.8],
  bells: [71.8, 77.2],
  end: [77.2, 83.8],
} as const;
const sceneOp = (f: number, [a, b]: readonly [number, number], fade = 8) =>
  Math.min(prog(f, F(a) - fade, F(a)), 1 - prog(f, F(b) - fade, F(b)));

// =============================================================================
// PARTS
// =============================================================================
const Jester: React.FC<{ x: number; y: number; s?: number; f: number; sway?: number; flip?: boolean; chained?: boolean; laugh?: number }> = ({ x, y, s = 1, f, sway = 0, flip, chained, laugh = 0 }) => {
  const rot = sway * 6 * Math.sin(f * 0.18);
  const jig = laugh * 4 * Math.sin(f * 1.2);
  return (
    <g transform={`translate(${x} ${y + jig}) scale(${flip ? -s : s} ${s}) rotate(${rot})`}>
      <g fill={INK}>
        <circle cx={0} cy={-300} r={34} />
        <path d="M -48 -262 Q 0 -280 48 -262 L 62 -110 L -62 -110 Z" />
        <rect x={-40} y={-112} width={26} height={112} rx={10} />
        <rect x={14} y={-112} width={26} height={112} rx={10} />
        {/* cap with three drooping points */}
        <path d="M -36 -320 Q -90 -360 -96 -300 Q -60 -340 -20 -326 Z" />
        <path d="M -10 -330 Q 0 -400 30 -390 Q 10 -370 10 -330 Z" />
        <path d="M 30 -322 Q 96 -356 100 -296 Q 70 -336 36 -318 Z" />
        {chained ? (
          <g>
            <rect x={-70} y={-200} width={140} height={14} fill="#6a6a70" />
            <line x1={-70} y1={-193} x2={-140} y2={-260} stroke="#6a6a70" strokeWidth={8} />
            <line x1={70} y1={-193} x2={140} y2={-260} stroke="#6a6a70" strokeWidth={8} />
          </g>
        ) : null}
      </g>
      {/* the bells */}
      {[[-96, -300], [30, -390], [100, -296]].map(([bx, by], i) => (
        <g key={i}>
          <circle cx={bx} cy={by} r={13} fill={GOLD} />
          <circle cx={bx} cy={by} r={26} fill={GOLD} opacity={0.2 + 0.15 * Math.sin(f * 0.9 + i)} />
        </g>
      ))}
    </g>
  );
};

const Cloak: React.FC<{ x: number; y: number; s?: number; mask?: boolean; arm?: number; flip?: boolean }> = ({ x, y, s = 1, mask, arm = 0, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill={INK}>
    <circle cx={0} cy={-300} r={34} />
    <path d="M -36 -326 Q 0 -360 36 -326 L 30 -300 L -30 -300 Z" />
    {mask ? <rect x={-26} y={-312} width={52} height={20} rx={8} fill="#2a2a30" stroke={PALE} strokeWidth={2} /> : null}
    <path d="M -50 -268 Q 0 -286 50 -268 L 90 0 L -90 0 Z" />
    <g transform={`translate(36 -240) rotate(${-150 * arm + 20})`}>
      <rect x={-11} y={0} width={22} height={120} rx={11} />
    </g>
  </g>
);

const Torch: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => {
  const fl = 1 + 0.12 * Math.sin(f * 0.7) + 0.06 * Math.sin(f * 1.9);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cy={-40} r={260 * fl} fill={TORCH} opacity={0.14} />
      <rect x={-8} y={0} width={16} height={90} fill="#2a1a10" />
      <ellipse cy={-20} rx={22 * fl} ry={46 * fl} fill={TORCH} />
      <ellipse cy={-14} rx={10} ry={22} fill="#ffe08a" />
    </g>
  );
};

const BoneWall: React.FC<{ op?: number }> = ({ op = 1 }) => (
  <g opacity={op}>
    {Array.from({ length: 5 }, (_, row) =>
      Array.from({ length: 7 }, (_, col) => {
        const x = 60 + col * 150 + (row % 2) * 70;
        const y = 380 + row * 170;
        return (
          <g key={`${row}-${col}`} transform={`translate(${x} ${y})`} opacity={0.45}>
            <path d="M -26 -6 Q -28 -36 0 -38 Q 28 -36 26 -6 Q 26 10 16 14 L 16 24 L -16 24 L -16 14 Q -26 10 -26 -6 Z" fill={BONE} />
            <ellipse cx={-10} cy={-8} rx={7} ry={8} fill="#1a1410" />
            <ellipse cx={10} cy={-8} rx={7} ry={8} fill="#1a1410" />
            <rect x={-60} y={40} width={120} height={14} rx={7} fill={BONE} transform="rotate(8)" />
          </g>
        );
      }),
    )}
  </g>
);

// the wall: tiers rise from the floor over the frame; `fill` 0..1 (last brick separate)
const ROWS = 13;
const RH = 72;
const COLS = 6;
const BWID = 190;
const Wall: React.FC<{ fill: number; last: number }> = ({ fill, last }) => {
  const bricks: React.ReactNode[] = [];
  const total = ROWS * COLS;
  const placed = Math.floor(fill * (total - 1));
  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const isLast = row === ROWS - 6 && col === 3; // the gap at face height
    const on = isLast ? last : i <= placed ? 1 : 0;
    if (on <= 0) continue;
    const x = -60 + col * BWID + (row % 2) * 95;
    const y = GROUND - (row + 1) * RH;
    bricks.push(
      <rect key={i} x={x} y={y - (isLast ? 40 * (1 - last) : 0)} width={BWID - 8} height={RH - 8} rx={4} fill="#5a4636" stroke="#2a1e14" strokeWidth={4} opacity={on} />,
    );
  }
  return <g>{bricks}</g>;
};

const Ground: React.FC = () => (
  <path d={`M 0 ${GROUND} L 1080 ${GROUND} L 1080 1920 L 0 1920 Z`} fill="#0a0806" />
);

// =============================================================================
const Tale8Amontillado: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;

  const loopBack = prog(f, F(82.3), F(83.6));
  const hookOp = Math.max(1 - prog(f, F(S.hook[1]) - 10, F(S.hook[1])), loopBack);
  const titleOp = Math.max(1 - prog(f, F(4.2), F(4.8)), loopBack);

  const label = (text: string, at: number, op: number, color = PALE, y = 470, x = 540, size = 60) => (
    <text x={x} y={y} fill={color} fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={size} textAnchor="middle" opacity={op * prog(f, F(at), F(at) + 5)}>
      {text}
    </text>
  );
  const push = (a: number, b: number, amt = 0.12) => 1 + amt * EASE(prog(f, F(a), F(b)));
  const pushT = (k: number, cx = 540, cy = 1000) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

  // the wall: tiers from 54.4 to 63.2 reach ~all but the last brick
  const wallFill = EASE(prog(f, F(54.3), F(63.3)));
  const lastBrick = EASE(prog(f, F(78.2), F(78.7)));
  const rattle = prog(f, F(57.6), F(57.9)) * (1 - prog(f, F(58.6), F(59.0)));
  const descend = EASE(prog(f, F(24.4), F(26.4)));
  const chainOn = prog(f, F(44.2), F(44.6));
  const cough = prog(f, F(29.4), F(29.6)) * (1 - prog(f, F(30.2), F(30.5)));

  const vaultBg = <rect x={0} y={0} width={1080} height={1920} fill="#140e0a" />;

  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0a0706 0%, #24160c 70%, #24160c 100%)' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* ---------- HOOK / LOOP: the finished wall ---------- */}
        <g opacity={hookOp}>
          {vaultBg}
          <Wall fill={1} last={1} />
          <Torch x={140} y={560} f={f} s={0.9} />
        </g>

        {/* ---------- THE INSULT ---------- */}
        <g opacity={sceneOp(f, S.insult)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#2a1a24" />
          <Jester x={680} y={GROUND} s={1.05} f={f} laugh={1} flip />
          <Cloak x={330} y={GROUND} s={1.1} />
          {label('A THOUSAND INJURIES', 7.0, 1 - prog(f, F(8.6), F(8.8)), PALE, 470, 540, 56)}
          {label('THE INSULT', 9.0, 1 - prog(f, F(11.1), F(11.3)), '#ff8a8a')}
          {label('NEVER SEE IT COMING', 11.4, 1, GOLD, 470, 540, 56)}
        </g>

        {/* ---------- CARNIVAL ---------- */}
        <g opacity={sceneOp(f, S.carnival)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#2a1430" />
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={(i * 137 + f * 2) % 1080} y={((i * 251 + f * (3 + (i % 4))) % 900) + 200} width={10} height={16} fill={['#e6b422', '#c0392b', '#4db8a8', '#b79be0'][i % 4]} opacity={0.6} transform={`rotate(${i * 37 + f * 4} ${(i * 137 + f * 2) % 1080} ${((i * 251 + f * (3 + (i % 4))) % 900) + 200})`} />
          ))}
          {[200, 540, 880].map((x, i) => (
            <g key={i}>
              <line x1={x} y1={0} x2={x} y2={300} stroke="#1a0f1a" strokeWidth={4} />
              <circle cx={x} cy={320} r={40} fill={['#ff9a3c', '#e6b422', '#c0392b'][i]} opacity={0.8} />
            </g>
          ))}
          <Jester x={640} y={GROUND} s={1.05} f={f} sway={1} flip />
          <Cloak x={320} y={GROUND} s={1.1} mask arm={prog(f, F(19.0), F(19.5)) * 0.5} />
          <g opacity={prog(f, F(20.0), F(20.4))}>
            <path d="M 440 920 L 440 860 Q 440 840 455 830 L 455 800 L 475 800 L 475 830 Q 490 840 490 860 L 490 920 Z" fill="#3a1a2a" stroke={GOLD} strokeWidth={3} />
          </g>
          {label('AMONTILLADO', 20.07, 1 - prog(f, F(21.4), F(21.6)), GOLD)}
          {label('I HAVE MY DOUBTS', 21.6, 1, PALE)}
        </g>

        {/* ---------- DOWN INTO THE VAULTS ---------- */}
        <g opacity={sceneOp(f, S.vaults)} transform={pushT(push(24.4, 30.4, 0.15), 540, 900)}>
          {vaultBg}
          <BoneWall op={prog(f, F(26.6), F(27.3))} />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={120 + i * 60} y={GROUND - 40 - i * 40} width={420} height={40} fill="#24180e" opacity={1 - descend * 0.6} />
          ))}
          <Torch x={300 + 200 * descend} y={760} f={f} s={0.8} />
          <Cloak x={360 + 220 * descend} y={GROUND - 200 * (1 - descend)} s={0.9} arm={0.6} />
          <Jester x={560 + 200 * descend} y={GROUND - 260 * (1 - descend)} s={0.9} f={f} sway={1} />
          <text x={760} y={700} fill={PALE} fontFamily={FONT_MONO} fontWeight={700} fontSize={50} textAnchor="middle" opacity={cough}>*cough*</text>
          {label('BONES LINING THE WALLS', 26.8, 1, BONE, 300, 540, 54)}
        </g>

        {/* ---------- "I WON'T DIE OF A COUGH" ---------- */}
        <g opacity={sceneOp(f, S.turn)}>
          {vaultBg}
          <BoneWall />
          <Torch x={220} y={700} f={f} s={0.8} />
          <Cloak x={330} y={GROUND} s={1.0} arm={0.6} />
          <Jester x={700} y={GROUND} s={1.0} f={f} laugh={prog(f, F(33.4), F(33.8))} flip />
          {label("I WON'T DIE OF A COUGH", 35.6, 1 - prog(f, F(37.0), F(37.2)), '#ff8a8a', 470, 540, 54)}
          {label('TRUE.', 37.2, 1, GOLD, 470, 540, 80)}
        </g>

        {/* ---------- THE CRYPT, THE CHAIN ---------- */}
        <g opacity={sceneOp(f, S.chain)}>
          {vaultBg}
          <rect x={300} y={GROUND - 640} width={480} height={640} fill="#070504" />
          <rect x={300} y={GROUND - 640} width={480} height={640} fill="none" stroke="#3a2a1a" strokeWidth={10} />
          <Torch x={140} y={620} f={f} s={0.8} />
          <Jester x={540} y={GROUND} s={0.95} f={f} sway={1 - chainOn} chained={chainOn > 0.5} />
          <Cloak x={880} y={GROUND} s={1.05} arm={chainOn * 0.4} flip />
          {label('A SMALL CRYPT', 40.3, 1 - prog(f, F(43.8), F(44.0)), PALE)}
          {label('CHAINED', 44.3, 1, '#c8c8d0', 470, 540, 74)}
        </g>

        {/* ---------- PAUSE ---------- */}
        <g opacity={sceneOp(f, S.pause)} transform={pushT(push(46.1, 50.6, 0.15), 540, GROUND - 300)}>
          {vaultBg}
          <rect x={300} y={GROUND - 640} width={480} height={640} fill="#070504" />
          <Torch x={140} y={620} f={f} s={0.8} />
          <Jester x={540} y={GROUND} s={0.95} f={f} chained />
        </g>

        {/* ---------- THE WALL RISES (POV: we are building it) ---------- */}
        <g opacity={sceneOp(f, S.wall)}>
          {vaultBg}
          <rect x={300} y={GROUND - 640} width={480} height={640} fill="#070504" />
          <g transform={`translate(${rattle * 10 * Math.sin(f * 3)} 0)`}>
            <Jester x={540} y={GROUND} s={0.95} f={f} chained laugh={prog(f, F(64.8), F(65.2)) * (1 - prog(f, F(66.6), F(66.9)))} />
          </g>
          <Wall fill={wallFill} last={0} />
          <Torch x={140} y={620} f={f} s={0.8} />
          {label('TIER BY TIER', 55.0, 1 - prog(f, F(56.5), F(56.7)), PALE, 330)}
          {label('HE SCREAMS', 59.0, 1 - prog(f, F(60.1), F(60.3)), '#ff8a8a', 330)}
          {label('I SCREAM LOUDER', 60.3, 1 - prog(f, F(63.0), F(63.2)), TORCH, 330)}
          {label('A VERY GOOD JOKE!', 65.5, 1 - prog(f, F(66.6), F(66.8)), GOLD, 330, 540, 54)}
          {label('FOR THE LOVE OF GOD,', 66.8, 1 - prog(f, F(69.1), F(69.3)), '#ff8a8a', 300, 540, 52)}
          {label('MONTRESOR!', 67.7, 1 - prog(f, F(69.1), F(69.3)), '#ff8a8a', 370, 540, 60)}
          {label('YES. FOR THE LOVE OF GOD.', 69.3, 1, PALE, 330, 540, 50)}
        </g>

        {/* ---------- ONLY THE BELLS ---------- */}
        <g opacity={sceneOp(f, S.bells)} transform={pushT(push(71.8, 77.0, 0.35), 696, GROUND - 8 * RH + 36)}>
          {vaultBg}
          <rect x={300} y={GROUND - 640} width={480} height={640} fill="#070504" />
          <Wall fill={1} last={0} />
          {/* through the last gap: a glint of bells */}
          {[0, 1].map((k) => (
            <circle key={k} cx={680 + k * 32} cy={GROUND - 8 * RH + 40} r={10} fill={GOLD} opacity={prog(f, F(74.4), F(74.8)) * (0.5 + 0.5 * Math.sin(f * 1.6 + k))} />
          ))}
          <Torch x={140} y={620} f={f} s={0.8} />
          {label('NO ANSWER', 73.5, 1 - prog(f, F(74.3), F(74.5)), PALE, 330)}
          {label('...JINGLE', 74.8, 1, GOLD, 330)}
        </g>

        {/* ---------- THE LAST STONE ---------- */}
        <g opacity={sceneOp(f, S.end) * (1 - loopBack)}>
          {vaultBg}
          <Wall fill={1} last={lastBrick} />
          <Torch x={140} y={560} f={f} s={0.9} />
          {label('FIFTY YEARS', 79.25, 1 - prog(f, F(80.4), F(80.6)), PALE, 330)}
          {label('IN PACE REQUIESCAT', 80.5, 1, GOLD, 330, 540, 56)}
        </g>

        <Ground />
      </svg>

      {/* title card on the hook / loop */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', opacity: titleOp }}>
        <div style={{ fontFamily: FONT_EDITORIAL, fontWeight: 900, fontSize: 66, color: PALE, letterSpacing: 3, textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>THE CASK OF</div>
        <div style={{ fontFamily: FONT_EDITORIAL, fontWeight: 900, fontSize: 92, color: GOLD, letterSpacing: 3, textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>AMONTILLADO</div>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: PALE, opacity: 0.8, letterSpacing: 8 }}>EDGAR ALLAN POE</div>
      </div>

      <Sequence from={F(46.25)} durationInFrames={F(4.5)}>
        <PauseCard title="PAUSE" subtitle="he's chained. what happens next?" durSec={4.5} accent={GOLD} y={360} />
      </Sequence>

      <Captions lines={VO} y={1480} accent={GOLD} />
      <ProgressBar color={TORCH} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: '#8b8fa5', opacity: 0.7 }}>
        retold from Edgar Allan Poe, 1846
      </div>
    </AbsoluteFill>
  );
};

export default Tale8Amontillado;
