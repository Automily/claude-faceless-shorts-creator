import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { Captions, PauseCard, ProgressBar, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_EDITORIAL, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Candlelit Tales #6: Vasilisa & Baba Yaga (Afanasyev), told by Vasilisa
// First person, present tense. Signature light: the skulls' glowing eyes.
// =============================================================================
export const compositionConfig = {
  id: 'Tale6BabaYaga',
  durationInSeconds: 79.2,
  fps: 30,
  width: 1080,
  height: 1920,
};

const INK = '#05060a';
const PALE = '#f7ecd0';
const GOLD = '#ffcf6b';
const EYE = '#ff7a1a';
const BONE = '#d8cfbf';
const EASE = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);
const GROUND = 1260;

const S = {
  hook: [0, 5.9],
  home: [5.9, 13.5],
  doll: [13.5, 19.9],
  hut: [19.9, 28.95],
  witch: [28.95, 35.2],
  work: [35.2, 41.45],
  pause: [41.45, 46.5],
  magic: [46.5, 51.45],
  bless: [51.45, 60.75],
  skull: [60.75, 65.95],
  burn: [65.95, 74.0],
  end: [74.0, 79.2],
} as const;
const sceneOp = (f: number, [a, b]: readonly [number, number], fade = 8) =>
  Math.min(prog(f, F(a) - fade, F(a)), 1 - prog(f, F(b) - fade, F(b)));

// =============================================================================
// SILHOUETTE PARTS
// =============================================================================
const Person: React.FC<{ x: number; y: number; s?: number; skirt?: boolean; arm?: number; flip?: boolean; scarf?: boolean; bob?: number; lean?: number; tint?: string }> = ({
  x, y, s = 1, skirt, arm = 0, flip, scarf, bob = 0, lean = 0, tint = INK,
}) => (
  <g transform={`translate(${x} ${y - bob}) scale(${flip ? -s : s} ${s}) rotate(${lean})`} fill={tint}>
    <circle cx={0} cy={-300} r={34} />
    {scarf ? <path d="M -40 -300 Q 0 -360 40 -300 L 46 -262 L -46 -262 Z" /> : null}
    {skirt ? (
      <path d="M -44 -262 Q 0 -280 44 -262 L 54 -150 L 86 0 L -86 0 L -54 -150 Z" />
    ) : (
      <>
        <path d="M -48 -262 Q 0 -280 48 -262 L 62 -110 L -62 -110 Z" />
        <rect x={-40} y={-112} width={26} height={112} rx={10} />
        <rect x={14} y={-112} width={26} height={112} rx={10} />
      </>
    )}
    <g transform={`translate(36 -240) rotate(${-150 * arm + 20})`}>
      <rect x={-11} y={0} width={22} height={120} rx={11} />
    </g>
  </g>
);

const Skull: React.FC<{ x: number; y: number; s?: number; eyes: number; f: number }> = ({ x, y, s = 1, eyes, f }) => {
  const fl = 1 + 0.15 * Math.sin(f * 0.7 + x);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={70 * fl} fill={EYE} opacity={0.18 * eyes} />
      <path d="M -40 -10 Q -42 -56 0 -58 Q 42 -56 40 -10 Q 40 14 26 20 L 26 36 L -26 36 L -26 20 Q -40 14 -40 -10 Z" fill={BONE} />
      <ellipse cx={-16} cy={-10} rx={11} ry={13} fill={eyes > 0.05 ? EYE : '#2a2420'} opacity={0.4 + 0.6 * eyes} />
      <ellipse cx={16} cy={-10} rx={11} ry={13} fill={eyes > 0.05 ? EYE : '#2a2420'} opacity={0.4 + 0.6 * eyes} />
      <path d="M -4 6 L 0 -2 L 4 6 Z" fill="#2a2420" />
      {[-14, -5, 4, 13].map((tx) => <rect key={tx} x={tx - 2} y={24} width={4} height={10} fill="#2a2420" />)}
    </g>
  );
};

const Tree: React.FC<{ x: number; s?: number; color?: string }> = ({ x, s = 1, color = '#0a0c14' }) => (
  <g transform={`translate(${x} ${GROUND}) scale(${s})`} fill={color}>
    <rect x={-22} y={-520} width={44} height={520} />
    <path d="M 0 -900 L 170 -560 L 90 -580 L 200 -380 L -200 -380 L -90 -580 L -170 -560 Z" />
  </g>
);

// hut on chicken legs (turns: squash in x)
const Hut: React.FC<{ x: number; f: number; turn: number }> = ({ x, f, turn }) => {
  const step = Math.sin(f * 0.25) * 10;
  return (
    <g transform={`translate(${x} ${GROUND})`}>
      <g fill={INK}>
        <path d={`M -60 0 L -40 -150 L -20 -260`} stroke={INK} strokeWidth={22} fill="none" transform={`rotate(${step} -20 -260)`} />
        <path d={`M 60 0 L 40 -150 L 20 -260`} stroke={INK} strokeWidth={22} fill="none" transform={`rotate(${-step} 20 -260)`} />
        <path d="M -100 0 L -40 0 L -60 -20 Z M 30 0 L 100 0 L 70 -20 Z" />
      </g>
      <g transform={`translate(0 -260) scale(${Math.cos(turn * Math.PI)} 1)`} fill={INK}>
        <rect x={-170} y={-280} width={340} height={280} />
        <path d="M -200 -280 L 0 -420 L 200 -280 Z" />
        <rect x={-60} y={-200} width={120} height={110} fill={GOLD} opacity={0.75} />
        <rect x={-4} y={-200} width={8} height={110} fill={INK} />
      </g>
    </g>
  );
};

const Fence: React.FC<{ f: number; skulls: number; eyes: number }> = ({ f, skulls, eyes }) => (
  <g>
    {Array.from({ length: 8 }, (_, i) => {
      const px = 40 + i * 140;
      return (
        <g key={i}>
          <rect x={px - 10} y={GROUND - 300} width={20} height={300} fill={BONE} opacity={0.85} />
          <rect x={px - 70} y={GROUND - 200} width={140} height={14} fill={BONE} opacity={0.6} />
          <g opacity={prog(skulls * 8, i, i + 1)}>
            <Skull x={px} y={GROUND - 340} s={0.75} eyes={eyes} f={f} />
          </g>
        </g>
      );
    })}
  </g>
);

const Yaga: React.FC<{ x: number; y: number; s?: number; f: number; shriek?: number; mortar?: boolean }> = ({ x, y, s = 1, f, shriek = 0, mortar }) => {
  const shake = shriek * 6 * Math.sin(f * 2);
  return (
    <g transform={`translate(${x + shake} ${y}) scale(${s})`} fill={INK}>
      {mortar ? <path d="M -110 -120 L 110 -120 L 80 40 L -80 40 Z" fill="#1a1410" stroke="#3a2a1a" strokeWidth={6} /> : null}
      {/* hunched body + hood */}
      <path d="M -70 -120 Q -90 -300 10 -340 Q 90 -330 80 -120 Z" />
      <path d="M 30 -330 Q 110 -320 120 -280 L 80 -280 Z" />
      {/* nose */}
      <path d="M 70 -300 L 130 -270 L 70 -280 Z" />
      <circle cx={52} cy={-302} r={6} fill={EYE} opacity={0.9} />
      {/* broom */}
      <line x1={-60} y1={-220} x2={-220} y2={40} stroke="#2a1f14" strokeWidth={10} />
      <path d="M -240 20 L -190 30 L -250 120 Z" fill="#3a2a14" />
      {/* shriek mouth */}
      <ellipse cx={86} cy={-262} rx={12 * shriek} ry={16 * shriek} fill="#3a0d14" />
    </g>
  );
};

const Doll: React.FC<{ x: number; y: number; s?: number; glow?: number }> = ({ x, y, s = 1, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={120} cy={-60} fill={GOLD} opacity={0.18 * glow} />
    <circle cy={-120} r={30} fill="#e8d6b0" />
    <path d="M -34 -126 Q 0 -170 34 -126 L 40 -100 L -40 -100 Z" fill="#b3122a" />
    <path d="M -36 -92 L 36 -92 L 56 30 L -56 30 Z" fill="#b3122a" />
    <path d="M -50 -10 L 50 -10" stroke={GOLD} strokeWidth={6} />
    <circle cx={-10} cy={-120} r={4} fill={glow > 0.3 ? GOLD : INK} />
    <circle cx={10} cy={-120} r={4} fill={glow > 0.3 ? GOLD : INK} />
  </g>
);

const Ground: React.FC = () => (
  <path d={`M 0 ${GROUND} Q 270 ${GROUND - 30} 540 ${GROUND - 6} T 1080 ${GROUND - 20} L 1080 1920 L 0 1920 Z`} fill={INK} />
);

// =============================================================================
const Tale6BabaYaga: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;

  const loopBack = prog(f, F(77.8), F(79.1));
  const hookOp = Math.max(1 - prog(f, F(S.hook[1]) - 10, F(S.hook[1])), loopBack);
  const titleOp = Math.max(1 - prog(f, F(5.3), F(5.9)), loopBack);

  const sky: [string, string] =
    t < S.home[0] || t >= S.end[0] + 3.8 ? ['#05070f', '#1b2440']
      : t < S.hut[0] ? ['#0d0806', '#3b1d0c']
      : t < S.work[0] ? ['#05070f', '#20294a']
      : t < S.magic[0] ? ['#0d0806', '#2b170a']
      : t < S.bless[0] ? ['#1a1036', '#e3a868']
      : t < S.burn[0] ? ['#0d0806', '#2b170a']
      : t < S.end[0] ? ['#0d0806', '#4a1c08']
      : ['#1a1036', '#c77a48'];

  const label = (text: string, at: number, op: number, color = PALE, y = 470, x = 540, size = 62) => (
    <text x={x} y={y} fill={color} fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={size} textAnchor="middle" opacity={op * prog(f, F(at), F(at) + 6)}>
      {text}
    </text>
  );
  const push = (a: number, b: number, amt = 0.12) => 1 + amt * EASE(prog(f, F(a), F(b)));
  const pushT = (k: number, cx = 540, cy = 1000) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

  // cues
  const firesOut = prog(f, F(6.9), F(8.0));
  const turn = EASE(prog(f, F(21.5), F(22.6)));
  const skulls = prog(f, F(25.2), F(26.4));
  const eyes = prog(f, F(27.7), F(28.2));
  const fly = prog(f, F(29.0), F(33.0));
  const seedsSort = EASE(prog(f, F(47.6), F(49.4)));
  const dawn = prog(f, F(48.8), F(49.6));
  const shriek = prog(f, F(55.8), F(56.2)) * (1 - prog(f, F(58.6), F(59.0)));
  const thrown = EASE(prog(f, F(58.9), F(59.8)));
  const reach = EASE(prog(f, F(66.9), F(67.6)));
  const beam = prog(f, F(67.9), F(68.4));
  const burn = prog(f, F(69.0), F(72.3));
  const ash = prog(f, F(72.2), F(72.7));

  // the seeds (scattered -> sorted)
  const seeds = Array.from({ length: 60 }, (_, i) => {
    const sx = 240 + ((i * 97) % 600);
    const sy = GROUND - 60 - ((i * 53) % 140);
    const tx = i % 2 === 0 ? 360 + (i % 10) * 6 : 720 + (i % 10) * 6;
    const ty = GROUND - 40 - Math.floor(i / 10) * 8;
    return { x: sx + (tx - sx) * seedsSort, y: sy + (ty - sy) * seedsSort, poppy: i % 2 === 0 };
  });

  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${sky[0]} 0%, ${sky[1]} 70%, ${sky[1]} 100%)` }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* ---------- HOOK / LOOP: walking home with the skull ---------- */}
        <g opacity={hookOp}>
          {[60, 240, 880, 1020].map((x, i) => <Tree key={i} x={x} s={1 + (i % 2) * 0.15} />)}
          <Person x={480} y={GROUND} s={1.0} skirt scarf arm={0.6} bob={Math.abs(Math.sin(f * 0.3)) * 5} />
          <line x1={520} y1={GROUND - 280} x2={640} y2={GROUND - 460} stroke="#2a1f14" strokeWidth={8} />
          <Skull x={650} y={GROUND - 470} s={0.9} eyes={1} f={f} />
          <path d={`M 662 ${GROUND - 480} L 1080 ${GROUND - 700} L 1080 ${GROUND - 380} Z`} fill={EYE} opacity={0.07} />
        </g>

        {/* ---------- HOME: the fires go out ---------- */}
        <g opacity={sceneOp(f, S.home)} transform={pushT(push(9.0, 12.8, 0.14), 760, GROUND - 300)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#3a2416" />
          <rect x={0} y={GROUND - 700} width={1080} height={700} fill="#4a2e1a" />
          {[200, 420, 860].map((x, i) => (
            <g key={i}>
              <rect x={x - 10} y={GROUND - 520} width={20} height={70} fill="#efe3c8" opacity={0.9} />
              <ellipse cx={x} cy={GROUND - 540} rx={10} ry={20} fill={GOLD} opacity={1 - prog(f, F(6.9) + i * 6, F(6.9) + i * 6 + 8)} />
              <circle cx={x} cy={GROUND - 540} r={80} fill={GOLD} opacity={0.15 * (1 - prog(f, F(6.9) + i * 6, F(6.9) + i * 6 + 8))} />
            </g>
          ))}
          <Person x={300} y={GROUND} s={0.95} skirt scarf />
          <Person x={760} y={GROUND} s={1.1} skirt flip arm={prog(f, F(10.4), F(10.9)) * 0.5} />
          <path d="M 740 958 Q 762 976 784 958" stroke={EYE} strokeWidth={4} fill="none" opacity={prog(f, F(9.2), F(9.6))} />
          {label('BRING BACK FIRE', 12.3, 1, GOLD)}
                    <rect x={0} y={0} width={1080} height={1920} fill={INK} opacity={0.3 * firesOut} />
        </g>

        {/* ---------- POV: the doll in my hands ---------- */}
        <g opacity={sceneOp(f, S.doll)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#0b0705" />
          <Doll x={540} y={1060} s={2.2} glow={0.4 + 0.3 * Math.sin(f * 0.1)} />
          <ellipse cx={360} cy={1180} rx={140} ry={80} fill="#1a120c" />
          <ellipse cx={720} cy={1180} rx={140} ry={80} fill="#1a120c" />
          {label('WHAT SHE DOES TO GIRLS', 14.6, 1 - prog(f, F(16.2), F(16.4)), '#ff8a8a', 470, 540, 54)}
          {label('ALL I HAVE', 16.4, 1, GOLD)}
        </g>

        {/* ---------- THE HUT, THE FENCE, THE SKULLS ---------- */}
        <g opacity={sceneOp(f, S.hut)}>
          {[40, 1040].map((x, i) => <Tree key={i} x={x} s={1.1} />)}
          <Hut x={540} f={f} turn={turn} />
          <Fence f={f} skulls={skulls} eyes={eyes} />
          {label('CHICKEN LEGS', 22.2, 1 - prog(f, F(23.1), F(23.3)), PALE)}
          {label('A FENCE OF BONES', 23.4, 1 - prog(f, F(27.6), F(27.8)), BONE)}
          {label('THE EYES ARE GLOWING', 27.8, 1, EYE)}
        </g>

        {/* ---------- BABA YAGA in her mortar ---------- */}
        <g opacity={sceneOp(f, S.witch)}>
          <circle cx={820} cy={520} r={90} fill={PALE} opacity={0.8} />
          <Fence f={f} skulls={1} eyes={1} />
          <Yaga x={-200 + 900 * EASE(fly)} y={760 + 300 * EASE(fly)} s={1.0} f={f} mortar />
          {label('I SMELL A HUMAN', 33.4, 1, '#ff8a8a')}
        </g>

        {/* ---------- THE WORK ---------- */}
        <g opacity={sceneOp(f, S.work)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#0d0806" />
          <Yaga x={820} y={GROUND} s={1.2} f={f} />
          {seeds.map((s, i) => <circle key={i} cx={240 + ((i * 97) % 600)} cy={GROUND - 60 - ((i * 53) % 140)} r={6} fill={s.poppy ? '#2a2a2a' : '#8a6a3a'} opacity={prog(f, F(37.5), F(38.2))} />)}
          {label('COOK', 36.1, 1, PALE, 380, 300, 54)}
          {label('CLEAN', 36.6, 1, PALE, 380, 540, 54)}
          {label('SORT EVERY SEED', 37.5, 1, GOLD, 470, 540, 54)}
          {label("FAIL: I'LL EAT YOU", 39.8, 1, '#ff8a8a', 580, 540, 58)}
        </g>

        {/* ---------- PAUSE: alone at night with the doll ---------- */}
        <g opacity={sceneOp(f, S.pause)} transform={pushT(push(41.5, 46.4, 0.12), 540, GROUND - 200)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#0b0705" />
          <Person x={420} y={GROUND} s={1.0} skirt scarf arm={0.3} />
          <Doll x={560} y={GROUND - 170} s={0.55} glow={0.5} />
          {seeds.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={6} fill={s.poppy ? '#2a2a2a' : '#8a6a3a'} opacity={0.6} />)}
        </g>

        {/* ---------- THE DOLL'S MAGIC ---------- */}
        <g opacity={sceneOp(f, S.magic)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#0b0705" opacity={1 - dawn} />
          <Doll x={540} y={GROUND - 200} s={1.0} glow={1} />
          {seeds.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={6} fill={s.poppy ? '#2a2a2a' : '#8a6a3a'} />)}
          {Array.from({ length: 8 }, (_, k) => (
            <circle key={k} cx={540 + 260 * Math.cos(f * 0.08 + k)} cy={GROUND - 260 + 120 * Math.sin(f * 0.11 + k)} r={5} fill={GOLD} opacity={0.8 * (1 - dawn)} />
          ))}
          {label('EVERY TASK DONE', 49.6, 1, GOLD)}
        </g>

        {/* ---------- THE BLESSING ---------- */}
        <g opacity={sceneOp(f, S.bless)} transform={pushT(push(55.7, 57.5, 0.12), 640, 900)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#0d0806" />
          <Yaga x={680} y={GROUND} s={1.7} f={f} shriek={shriek} />
          <Person x={260 + 600 * thrown} y={GROUND} s={0.9} skirt scarf lean={30 * thrown} />
          {label("MY MOTHER'S BLESSING", 54.0, 1 - prog(f, F(56.6), F(56.8)), GOLD, 470, 540, 54)}
          {label('NO BLESSED ONES!', 56.8, 1, '#ff8a8a')}
        </g>

        {/* ---------- THE SKULL ---------- */}
        <g opacity={sceneOp(f, S.skull)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#05060a" />
          <Skull x={540} y={900} s={4.2} eyes={prog(f, F(63.0), F(63.6))} f={f} />
          {label('MY FIRE', 64.8, 1, EYE, 470)}
        </g>

        {/* ---------- THE BURNING ---------- */}
        <g opacity={sceneOp(f, S.burn)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#0d0806" />
          <Person x={260} y={GROUND} s={0.95} skirt scarf arm={0.5} />
          <line x1={300} y1={GROUND - 280} x2={380} y2={GROUND - 430} stroke="#2a1f14" strokeWidth={8} />
          <Skull x={390} y={GROUND - 440} s={0.9} eyes={1} f={f} />
          {/* the gaze */}
          <path d={`M 402 ${GROUND - 450} L 900 ${GROUND - 420} L 900 ${GROUND - 200} Z`} fill={EYE} opacity={0.25 * beam * (1 - ash)} />
          <g opacity={1 - ash}>
            <Person x={760 + 80 * burn} y={GROUND} s={1.1} skirt flip arm={0.5 * reach} tint={burn > 0.2 ? `rgb(${Math.round(40 + 180 * burn)},${Math.round(20 + 60 * burn)},10)` : INK} />
          </g>
          <ellipse cx={840} cy={GROUND - 10} rx={110 * ash} ry={24 * ash} fill="#5a5450" />
          {label('THE EYES FOLLOW HER', 68.0, 1 - prog(f, F(72.3), F(72.5)), EYE)}
          {label('ASH', 72.5, 1, '#c8c0b8')}
        </g>

        {/* ---------- THE GARDEN ---------- */}
        <g opacity={sceneOp(f, S.end) * (1 - loopBack)}>
          <path d={`M 560 ${GROUND} Q 700 ${GROUND - 70} 840 ${GROUND} Z`} fill="#2a1c12" />
          <Person x={380} y={GROUND} s={1.0} skirt scarf arm={0.35} />
          <Doll x={430} y={GROUND - 170} s={0.5} glow={0.6} />
          {label('I KEPT THE DOLL', 75.9, 1, GOLD)}
        </g>

        <Ground />
      </svg>

      {/* title card on the hook / loop */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', opacity: titleOp }}>
        <div style={{ fontFamily: FONT_EDITORIAL, fontWeight: 900, fontSize: 100, color: PALE, letterSpacing: 4, textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>BABA YAGA</div>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: PALE, opacity: 0.8, letterSpacing: 8 }}>TOLD BY VASILISA</div>
      </div>

      <Sequence from={F(41.6)} durationInFrames={F(4.9)}>
        <PauseCard title="PAUSE" subtitle="impossible work, one night. what do you do?" durSec={4.9} accent={GOLD} y={360} />
      </Sequence>

      <Captions lines={VO} y={1480} accent={GOLD} />
      <ProgressBar color={EYE} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: '#8b8fa5', opacity: 0.7 }}>
        retold from Russian folk tales, Afanasyev (1860s)
      </div>
    </AbsoluteFill>
  );
};

export default Tale6BabaYaga;
