import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { Captions, PauseCard, ProgressBar, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_EDITORIAL, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Candlelit Tales #4: The Pied Piper of Hamelin (Grimm, Deutsche Sagen 245)
// Shadow-puppet silhouettes; the piper's coat is the only colour in the world.
// =============================================================================
export const compositionConfig = {
  id: 'Tale4PiedPiper',
  durationInSeconds: 62.0,
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
  hook: [0, 5.4],
  rats: [5.4, 9.95],
  stranger: [9.95, 15.6],
  river: [15.6, 20.5],
  refuse: [20.5, 23.1],
  ret: [23.1, 30.55],
  pause: [30.55, 33.8],
  children: [33.8, 39.0],
  mountain: [39.0, 43.45],
  search: [43.45, 48.1],
  few: [48.1, 55.3],
  records: [55.3, 62.0],
} as const;
const sceneOp = (f: number, [a, b]: readonly [number, number], fade = 8) =>
  Math.min(prog(f, F(a) - fade, F(a)), 1 - prog(f, F(b) - fade, F(b)));

// =============================================================================
// SILHOUETTE PARTS
// =============================================================================
const Person: React.FC<{ x: number; y: number; s?: number; skirt?: boolean; arm?: number; flip?: boolean; hat?: boolean; bob?: number; lantern?: number; stick?: boolean; mouth?: boolean; coat?: boolean }> = ({
  x, y, s = 1, skirt, arm = 0, flip, hat, bob = 0, lantern = 0, stick, mouth, coat,
}) => (
  <g transform={`translate(${x} ${y - bob}) scale(${flip ? -s : s} ${s})`} fill={INK}>
    <circle cx={0} cy={-300} r={34} />
    {hat ? <path d="M -40 -318 L 40 -318 L 40 -326 L 26 -330 L 26 -362 L -26 -362 L -26 -330 L -40 -326 Z" /> : null}
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
    {mouth ? <rect x={-30} y={-290} width={50} height={18} rx={9} /> : null}
    {stick ? <line x1={70} y1={-150} x2={110} y2={0} stroke={INK} strokeWidth={10} /> : null}
    {coat ? <path d="M 50 -230 L 120 -220 L 110 -140 L 50 -150 Z" /> : null}
    {lantern > 0 ? (
      <g>
        <circle cx={-70} cy={-150} r={60} fill={GOLD} opacity={0.2 * lantern} />
        <rect x={-82} y={-168} width={24} height={34} rx={6} fill={GOLD} opacity={lantern} />
      </g>
    ) : null}
  </g>
);

// the piper: motley coat (the only colour), feathered cap, pipe at the mouth
const Piper: React.FC<{ x: number; y: number; s?: number; f: number; hunter?: boolean; flip?: boolean; playing?: number }> = ({ x, y, s = 1, f, hunter, flip, playing = 1 }) => {
  const sway = playing * 3 * Math.sin(f * 0.25);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${sway})`}>
      <defs>
        <pattern id={`motley${hunter ? 'h' : ''}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="20" height="40" fill={hunter ? '#3f6b34' : '#c0392b'} />
          <rect x="20" width="20" height="40" fill={hunter ? '#2c4c24' : '#e6b422'} />
        </pattern>
      </defs>
      <circle cx={0} cy={-300} r={34} fill={INK} />
      {/* cap */}
      <path d="M -40 -318 Q 0 -370 46 -322 Z" fill={hunter ? '#b3122a' : INK} />
      <path d="M 30 -340 Q 80 -400 110 -380 Q 70 -370 44 -330 Z" fill={hunter ? '#b3122a' : '#e6b422'} />
      {/* coat */}
      <path d="M -52 -262 Q 0 -282 52 -262 L 80 -60 L -80 -60 Z" fill={`url(#motley${hunter ? 'h' : ''})`} stroke={INK} strokeWidth={4} />
      <rect x={-40} y={-64} width={26} height={64} rx={10} fill={INK} />
      <rect x={14} y={-64} width={26} height={64} rx={10} fill={INK} />
      {/* arms + pipe */}
      <path d="M 30 -240 L 70 -290 L 82 -280 L 44 -226 Z" fill={INK} />
      <rect x={24} y={-300} width={120} height={12} rx={6} fill={INK} transform="rotate(-8 24 -300)" />
      {/* notes */}
      {[0, 1, 2].map((k) => {
        const p = ((f / 30 + k * 0.6) % 1.8) / 1.8;
        return (
          <text key={k} x={150 + 60 * p} y={-330 - 120 * p} fill={GOLD} fontSize={40} opacity={playing * (1 - p)} fontFamily={FONT_EDITORIAL}>♪</text>
        );
      })}
    </g>
  );
};

const Rat: React.FC<{ x: number; y: number; s?: number; f: number; seed: number }> = ({ x, y, s = 1, f, seed }) => {
  const hop = Math.abs(Math.sin(f * 0.6 + seed)) * 8;
  return (
    <g transform={`translate(${x} ${y - hop}) scale(${s})`} fill="#5a4752" stroke="#8a7080" strokeWidth={2}>
      <ellipse cx={0} cy={-18} rx={34} ry={18} />
      <circle cx={30} cy={-24} r={12} />
      <circle cx={26} cy={-36} r={6} />
      <path d="M -32 -14 Q -70 -10 -84 -34" stroke="#8a7080" strokeWidth={4} fill="none" />
    </g>
  );
};

const Town: React.FC<{ x?: number; lit?: number; color?: string }> = ({ x = 0, lit = 1, color = '#221c38' }) => (
  <g transform={`translate(${x} ${GROUND})`} fill={color}>
    {[0, 1, 2, 3, 4].map((i) => {
      const w = 150 + (i % 2) * 40;
      const h = 260 + ((i * 53) % 120);
      const hx = 20 + i * 215;
      return (
        <g key={i}>
          <path d={`M ${hx} 0 L ${hx} ${-h} L ${hx + w / 2} ${-h - 110} L ${hx + w} ${-h} L ${hx + w} 0 Z`} />
          <rect x={hx + w / 2 - 18} y={-h + 40} width={36} height={46} rx={4} fill={GOLD} opacity={0.65 * lit} />
        </g>
      );
    })}
    {/* church spire */}
    <path d="M 480 -380 L 480 -560 L 520 -720 L 560 -560 L 560 -380 Z" />
  </g>
);

const Ground: React.FC = () => (
  <path d={`M 0 ${GROUND} Q 270 ${GROUND - 30} 540 ${GROUND - 6} T 1080 ${GROUND - 20} L 1080 1920 L 0 1920 Z`} fill={INK} />
);

// =============================================================================
const Tale4PiedPiper: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;

  const loopBack = prog(f, F(60.4), F(61.8));
  const hookOp = Math.max(1 - prog(f, F(S.hook[1]) - 10, F(S.hook[1])), loopBack);
  const titleOp = Math.max(1 - prog(f, F(4.8), F(5.4)), loopBack);

  const sky: [string, string] =
    t < S.rats[0] || t >= S.records[0] + 5 ? ['#1a1036', '#d9844a']
      : t < S.ret[0] ? ['#16122c', '#8c5a6a']
      : t < S.mountain[0] ? ['#070b1f', '#2b3466']
      : t < S.search[0] ? ['#1a1036', '#d9844a']
      : ['#070b1f', '#2b3466'];

  const label = (text: string, at: number, op: number, color = PALE, y = 470, x = 540, size = 62) => (
    <text x={x} y={y} fill={color} fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={size} textAnchor="middle" opacity={op * prog(f, F(at), F(at) + 6)}>
      {text}
    </text>
  );

  // the procession (hook + children + mountain)
  const procession = (lead: number, n: number, enter: number, scale = 0.42) =>
    Array.from({ length: n }, (_, i) => {
      const cx = lead - 90 - i * 62;
      const vis = Math.min(1, Math.max(0, enter * n - i));
      return <Person key={i} x={cx} y={GROUND} s={scale + ((i * 7) % 5) * 0.02} skirt={i % 3 === 1} bob={Math.abs(Math.sin(f * 0.4 + i)) * 6} />;
    }).filter((_, i) => Math.min(1, Math.max(0, enter * n - i)) > 0);

  // river scene
  const riverWalk = prog(f, F(15.8), F(20.3));
  // children scene
  const kids = prog(f, F(35.9), F(37.6));
  const march = prog(f, F(33.9), F(38.9));
  // mountain
  const toMtn = EASE(prog(f, F(39.0), F(40.9)));
  const mtnOpen = prog(f, F(39.6), F(40.1)) * (1 - prog(f, F(41.0), F(41.5)));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${sky[0]} 0%, ${sky[1]} 70%, ${sky[1]} 100%)` }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* ---------- HOOK / LOOP: the procession at dusk ---------- */}
        <g opacity={hookOp}>
          <circle cx={300} cy={820} r={130} fill="#ffd28a" opacity={0.75} />
          <path d={`M 560 ${GROUND} Q 820 ${GROUND - 520} 1080 ${GROUND - 600} L 1080 ${GROUND} Z`} fill="#0c0a14" />
          <ellipse cx={880} cy={GROUND - 260} rx={50} ry={80} fill={GOLD} opacity={0.6} />
          <Piper x={720} y={GROUND} s={0.95} f={f} />
          {procession(720, 7, 1)}
        </g>

        {/* ---------- RATS in Hamelin ---------- */}
        <g opacity={sceneOp(f, S.rats)}>
          <Town lit={0.4} />
          {Array.from({ length: 16 }, (_, i) => (
            <Rat key={i} x={((i * 137 + f * (5 + (i % 3) * 2)) % 1240) - 80} y={GROUND - 6 + (i % 3) * 10} s={0.8 + (i % 4) * 0.1} f={f} seed={i} />
          ))}
          {label('HAMELIN, 1284', 5.9, 1, PALE)}
        </g>

        {/* ---------- THE STRANGER ---------- */}
        <g opacity={sceneOp(f, S.stranger)}>
          <Town lit={0.5} />
          <Person x={260} y={GROUND} s={1.05} hat arm={prog(f, F(14.5), F(14.9)) * 0.5} />
          <g transform={`translate(${280 * (1 - EASE(prog(f, F(10.1), F(11.2))))} 0)`}>
            <Piper x={760} y={GROUND} s={1.05} f={f} flip playing={0} />
          </g>
          {label('FOR A PRICE', 13.0, 1 - prog(f, F(14.6), F(14.8)), GOLD)}
          {label('AGREED', 14.77, 1, PALE)}
        </g>

        {/* ---------- THE RIVER ---------- */}
        <g opacity={sceneOp(f, S.river)}>
          <rect x={0} y={GROUND - 20} width={1080} height={120} fill="#1d2d55" />
          <path d={`M 0 ${GROUND - 20} L 520 ${GROUND - 20} L 520 ${GROUND + 100} L 0 ${GROUND + 100} Z`} fill={INK} />
          <Piper x={180 + 300 * riverWalk} y={GROUND - 20} s={0.9} f={f} />
          {Array.from({ length: 12 }, (_, i) => {
            const rx = 100 + 300 * riverWalk + 140 + i * 60 - 60 * Math.sin(f * 0.1 + i);
            const inWater = rx > 540;
            return (
              <g key={i} opacity={inWater ? Math.max(0, 1 - (rx - 540) / 220) : 1}>
                <Rat x={rx} y={GROUND - 20 + (inWater ? Math.min(60, (rx - 540) * 0.3) : 0)} s={0.7} f={f} seed={i} />
              </g>
            );
          })}
          {label('EVERY RAT', 16.9, 1, PALE)}
          {label('DROWNED', 19.2, 1, '#9fb4e6', 550)}
        </g>

        {/* ---------- REFUSED ---------- */}
        <g opacity={sceneOp(f, S.refuse)}>
          <Town lit={0.5} />
          <Person x={330} y={GROUND} s={1.1} hat />
          <Piper x={760} y={GROUND} s={1.05} f={f} flip playing={0} />
          {label('REFUSED TO PAY', 21.4, 1, '#ff8a8a')}
        </g>

        {/* ---------- HE RETURNS as a hunter ---------- */}
        <g opacity={sceneOp(f, S.ret)}>
          <Town lit={0.8} />
          <g opacity={1 - prog(f, F(24.2), F(24.6))}>
            <Piper x={540 + 600 * prog(f, F(23.3), F(24.6))} y={GROUND} s={1.0} f={f} playing={0} />
          </g>
          <g opacity={prog(f, F(26.3), F(26.8))}>
            <Piper x={1000 - 300 * EASE(prog(f, F(26.3), F(27.6)))} y={GROUND} s={1.0} f={f} hunter flip playing={0} />
          </g>
          {label('HE CAME BACK', 26.5, 1, PALE)}
        </g>

        {/* ---------- PAUSE: alone in the street ---------- */}
        <g opacity={sceneOp(f, S.pause)}>
          <Town lit={1} />
          <Piper x={540} y={GROUND} s={1.0} f={f} hunter playing={0} />
        </g>

        {/* ---------- THE CHILDREN FOLLOW ---------- */}
        <g opacity={sceneOp(f, S.children)}>
          <Town lit={1} />
          <Piper x={540 + 420 * march} y={GROUND} s={0.95} f={f} hunter />
          {procession(540 + 420 * march, 9, kids)}
          {label('130 CHILDREN', 37.4, 1, GOLD)}
        </g>

        {/* ---------- INTO THE MOUNTAIN ---------- */}
        <g opacity={sceneOp(f, S.mountain)}>
          <path d={`M 300 ${GROUND} Q 700 ${GROUND - 700} 1080 ${GROUND - 760} L 1080 ${GROUND} Z`} fill="#0c0a14" />
          <ellipse cx={800} cy={GROUND - 120} rx={70 * mtnOpen} ry={120 * mtnOpen} fill={GOLD} opacity={0.9} />
          <circle cx={800} cy={GROUND - 120} r={260 * mtnOpen} fill={GOLD} opacity={0.12} />
          <g opacity={1 - prog(f, F(40.6), F(41.0))}>
            <Piper x={420 + 380 * toMtn} y={GROUND} s={0.8 - 0.3 * toMtn} f={f} hunter />
            {procession(420 + 380 * toMtn, 7, 1, 0.36 - 0.12 * toMtn)}
          </g>
          {label('NEVER SEEN AGAIN', 41.9, 1, PALE)}
        </g>

        {/* ---------- THE SEARCH ---------- */}
        <g opacity={sceneOp(f, S.search)}>
          <rect x={620} y={GROUND - 10} width={460} height={110} fill="#1d2d55" />
          {[0, 1, 2].map((i) => (
            <Person key={i} x={200 + i * 230} y={GROUND} s={0.9} skirt lantern={1} flip={i === 1} />
          ))}
          {label('NOTHING', 46.67, 1, '#9fb4e6')}
        </g>

        {/* ---------- THE FEW WHO CAME BACK ---------- */}
        <g opacity={sceneOp(f, S.few)}>
          <g opacity={prog(f, F(49.8), F(50.3))}>
            <Person x={220} y={GROUND} s={0.8} stick />
            {label('BLIND', 50.2, 1, PALE, GROUND - 330, 220, 40)}
          </g>
          <g opacity={prog(f, F(50.8), F(51.3))}>
            <Person x={540} y={GROUND} s={0.8} mouth />
            {label('MUTE', 51.4, 1, PALE, GROUND - 330, 540, 40)}
          </g>
          <g opacity={prog(f, F(52.4), F(52.9))}>
            <Person x={840} y={GROUND} s={0.7} coat />
            {label('HIS COAT', 53.0, 1, GOLD, GROUND - 300, 840, 40)}
          </g>
          {label('ONLY A FEW', 48.3, 1, PALE)}
        </g>

        {/* ---------- THE RECORDS ---------- */}
        <g opacity={sceneOp(f, S.records) * (1 - loopBack)}>
          <g transform="translate(540 860) rotate(-3)">
            <rect x={-330} y={-300} width={660} height={600} rx={16} fill="#d9c9a3" />
            <rect x={-330} y={-300} width={660} height={600} rx={16} fill="none" stroke="#8a6a3a" strokeWidth={6} />
            <text x={0} y={-180} fill="#3a2a14" fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={54} textAnchor="middle">HAMELIN</text>
            <text x={0} y={-40} fill="#7a1a1a" fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={96} textAnchor="middle" opacity={prog(f, F(57.4), F(57.9))}>1284</text>
            <text x={0} y={60} fill="#3a2a14" fontFamily={FONT_EDITORIAL} fontWeight={700} fontSize={40} textAnchor="middle" opacity={prog(f, F(58.5), F(59.0))}>the year</text>
            <text x={0} y={120} fill="#3a2a14" fontFamily={FONT_EDITORIAL} fontWeight={700} fontSize={40} textAnchor="middle" opacity={prog(f, F(58.5), F(59.0))}>our children left</text>
          </g>
        </g>

        <Ground />
      </svg>

      {/* title card on the hook / loop */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', opacity: titleOp }}>
        <div style={{ fontFamily: FONT_EDITORIAL, fontWeight: 900, fontSize: 96, color: PALE, letterSpacing: 4, textShadow: '0 4px 30px rgba(0,0,0,0.6)' }}>THE PIED PIPER</div>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: PALE, opacity: 0.8, letterSpacing: 8 }}>THE REAL ENDING</div>
      </div>

      <Sequence from={F(30.6)} durationInFrames={F(3.2)}>
        <PauseCard title="PAUSE" subtitle="what does he do?" durSec={3.2} accent={GOLD} y={360} />
      </Sequence>

      <Captions lines={VO} y={1480} accent={GOLD} />
      <ProgressBar color={GOLD} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: '#8b8fa5', opacity: 0.7 }}>
        retold from the Brothers Grimm, Deutsche Sagen (1816)
      </div>
    </AbsoluteFill>
  );
};

export default Tale4PiedPiper;
