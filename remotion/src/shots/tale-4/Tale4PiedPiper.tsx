import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { Captions, PauseCard, ProgressBar, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_EDITORIAL, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Candlelit Tales #4: The Pied Piper of Hamelin, told BY the Piper (first person)
// (Grimm, Deutsche Sagen 245). Shadow-puppet silhouettes; the piper's coat is the only colour.
// POV shots: his hands on the pipe, the mayor across the table.
// =============================================================================
export const compositionConfig = {
  id: 'Tale4PiedPiper',
  durationInSeconds: 75.7,
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
  hook: [0, 4.0],
  rats: [4.0, 12.07],
  walkin: [12.07, 16.7],
  deal: [16.7, 21.3],
  pipe1: [21.3, 22.65],
  river: [22.65, 29.2],
  laugh: [29.2, 33.2],
  ret: [33.2, 42.4],
  pause: [42.4, 46.55],
  pipe2: [46.55, 47.9],
  children: [47.9, 53.8],
  mountain: [53.8, 58.5],
  search: [58.5, 62.95],
  few: [62.95, 69.7],
  records: [69.7, 75.7],
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


// POV: the narrator's own hands raising the pipe (striped sleeves)
const PipeHands: React.FC<{ f: number; lift: number }> = ({ f, lift }) => {
  const y = 1180 - 260 * lift;
  return (
    <g>
      <defs>
        <pattern id="sleeve" width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <rect width="23" height="46" fill="#c0392b" />
          <rect x="23" width="23" height="46" fill="#e6b422" />
        </pattern>
      </defs>
      <path d={`M -40 ${y + 420} L 260 ${y + 40} L 360 ${y + 110} L 120 ${y + 520} Z`} fill="url(#sleeve)" stroke={INK} strokeWidth={6} />
      <path d={`M 1120 ${y + 420} L 820 ${y + 40} L 720 ${y + 110} L 960 ${y + 520} Z`} fill="url(#sleeve)" stroke={INK} strokeWidth={6} />
      <rect x={180} y={y - 10} width={720} height={44} rx={22} fill="#2a1a10" stroke={INK} strokeWidth={4} />
      {[0, 1, 2, 3, 4].map((k) => (
        <circle key={k} cx={420 + k * 70} cy={y + 12} r={11} fill={INK} />
      ))}
      <ellipse cx={300} cy={y + 30} rx={80} ry={56} fill={INK} />
      <ellipse cx={780} cy={y + 30} rx={80} ry={56} fill={INK} />
      {[0, 1, 2, 3].map((k) => {
        const p = ((f / 30 + k * 0.45) % 1.8) / 1.8;
        return (
          <text key={k} x={560 + 120 * Math.sin(k * 2 + p * 3)} y={y - 60 - 420 * p} fill={GOLD} fontSize={70} opacity={lift * (1 - p)} fontFamily={FONT_EDITORIAL} textAnchor="middle">♪</text>
        );
      })}
    </g>
  );
};

// POV: the mayor across the table (bust), optionally laughing
const Mayor: React.FC<{ f: number; laugh?: number; hand?: number }> = ({ f, laugh = 0, hand = 0 }) => {
  const shake = laugh * 8 * Math.sin(f * 1.4);
  return (
    <g>
      <g transform={`translate(540 ${1000 + shake})`} fill={INK}>
        <circle cx={0} cy={-420} r={120} />
        <path d="M -150 -520 L 150 -520 L 150 -540 L 100 -550 L 100 -660 L -100 -660 L -100 -550 L -150 -540 Z" />
        <path d="M -260 0 Q -260 -260 -110 -300 L 110 -300 Q 260 -260 260 0 Z" />
        <path d={`M -60 -380 Q 0 ${-380 + 60 * laugh + 10} 60 -380 Z`} fill="#3a0d14" opacity={0.3 + 0.7 * laugh} />
        <rect x={-90} y={-250} width={180} height={24} rx={12} fill={GOLD} opacity={0.75} />
      </g>
      {/* the table edge (we sit across from him) */}
      <rect x={0} y={1000} width={1080} height={80} fill="#1a120c" />
      <rect x={0} y={1000} width={1080} height={8} fill="#3a2a1a" />
      {/* coin purse on his side */}
      <g opacity={1 - laugh}>
        <ellipse cx={760} cy={985} rx={60} ry={34} fill="#3a2a14" />
        <circle cx={760} cy={950} r={12} fill={GOLD} opacity={0.8} />
      </g>
      {/* handshake */}
      {hand > 0 ? (
        <g opacity={hand}>
          <path d={`M -40 1260 L ${300 + 140 * hand} ${980} L ${360 + 140 * hand} ${1030} L 40 1320 Z`} fill="url(#sleeve)" stroke={INK} strokeWidth={6} />
          <path d={`M 1120 1200 L ${700 - 60 * hand} ${960} L ${650 - 60 * hand} ${1010} L 1040 1280 Z`} fill={INK} />
          <ellipse cx={540} cy={985} rx={70 * hand} ry={46 * hand} fill={INK} />
        </g>
      ) : null}
      {laugh > 0
        ? ['HA', 'HA', 'HA'].map((h, k) => (
            <text key={k} x={240 + k * 300} y={460 + (k % 2) * 80} fill="#ff8a8a" fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={90} textAnchor="middle" opacity={laugh * prog(f, F(31.6) + k * 5, F(31.6) + k * 5 + 4)}>
              {h}
            </text>
          ))
        : null}
    </g>
  );
};

// =============================================================================
const Tale4PiedPiper: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;

  const loopBack = prog(f, F(74.1), F(75.5));
  const hookOp = Math.max(1 - prog(f, F(S.hook[1]) - 10, F(S.hook[1])), loopBack);
  const titleOp = Math.max(1 - prog(f, F(3.5), F(4.0)), loopBack);

  const sky: [string, string] =
    t < S.rats[0] || t >= S.records[0] + 4.4 ? ['#1a1036', '#d9844a']
      : t < S.deal[0] ? ['#16122c', '#8c5a6a']
      : t < S.river[0] ? ['#0d0806', '#3b1d0c']
      : t < S.laugh[0] ? ['#16122c', '#8c5a6a']
      : t < S.ret[0] ? ['#0d0806', '#3b1d0c']
      : t < S.children[0] ? ['#2a1a3a', '#e3a868']
      : t < S.search[0] ? ['#1a1036', '#d9844a']
      : ['#070b1f', '#2b3466'];

  const label = (text: string, at: number, op: number, color = PALE, y = 470, x = 540, size = 62) => (
    <text x={x} y={y} fill={color} fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={size} textAnchor="middle" opacity={op * prog(f, F(at), F(at) + 6)}>
      {text}
    </text>
  );

  const procession = (lead: number, n: number, enter: number, scale = 0.42) =>
    Array.from({ length: n }, (_, i) => {
      const cx = lead - 90 - i * 62;
      return <Person key={i} x={cx} y={GROUND} s={scale + ((i * 7) % 5) * 0.02} skirt={i % 3 === 1} bob={Math.abs(Math.sin(f * 0.4 + i)) * 6} />;
    }).filter((_, i) => Math.min(1, Math.max(0, enter * n - i)) > 0);

  // camera push-ins on the moments of dread
  const push = (a: number, b: number, amt = 0.12) => 1 + amt * EASE(prog(f, F(a), F(b)));
  const pushT = (k: number, cx = 540, cy = 1000) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

  const walk = EASE(prog(f, F(12.15), F(14.6)));
  const shake = EASE(prog(f, F(19.6), F(20.2)));
  const lift1 = EASE(prog(f, F(21.4), F(21.95)));
  const riverWalk = prog(f, F(22.7), F(28.3));
  const laugh = prog(f, F(31.5), F(31.9));
  const doors = prog(f, F(47.95), F(48.7));
  const kids = prog(f, F(49.3), F(51.2));
  const march = prog(f, F(47.9), F(53.7));
  const toMtn = EASE(prog(f, F(53.9), F(56.0)));
  const mtnOpen = prog(f, F(56.4), F(56.9)) * (1 - prog(f, F(57.9), F(58.4)));

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

        {/* ---------- RATS: in the bread, in the cradles, in the walls ---------- */}
        <g opacity={sceneOp(f, S.rats)} transform={pushT(push(9.6, 12.0, 0.25), 540, GROUND - 100)}>
          <Town lit={0.4} />
          {Array.from({ length: 18 }, (_, i) => (
            <Rat key={i} x={((i * 137 + f * (5 + (i % 3) * 2)) % 1240) - 80} y={GROUND - 6 + (i % 3) * 10} s={0.8 + (i % 4) * 0.1} f={f} seed={i} />
          ))}
          {label('HAMELIN, 1284', 4.3, 1 - prog(f, F(9.4), F(9.7)), PALE)}
          {label('IN THE WALLS', 9.7, 1, '#ff8a8a')}
        </g>

        {/* ---------- I WALK IN ---------- */}
        <g opacity={sceneOp(f, S.walkin)}>
          <Town lit={0.5} />
          <Person x={760} y={GROUND} s={1.05} hat flip />
          <Piper x={-100 + 480 * walk} y={GROUND} s={1.05} f={f} playing={0} />
          {label('I MAKE AN OFFER', 15.3, 1, GOLD)}
        </g>

        {/* ---------- POV: across the table, the deal ---------- */}
        <g opacity={sceneOp(f, S.deal)}>
          <Mayor f={f} hand={shake} />
          {label('YOUR RATS, GONE', 16.9, 1 - prog(f, F(18.3), F(18.5)), PALE, 300)}
          {label('FOR A PRICE', 18.5, 1, GOLD, 300)}
        </g>

        {/* ---------- POV: I lift my pipe ---------- */}
        <g opacity={Math.max(sceneOp(f, S.pipe1, 6), sceneOp(f, S.pipe2, 6))}>
          <rect x={0} y={0} width={1080} height={1920} fill="#0d0806" opacity={0.75} />
          <rect x={0} y={GROUND} width={1080} height={660} fill={INK} />
          <PipeHands f={f} lift={f < F(40) ? lift1 : EASE(prog(f, F(46.6), F(47.2)))} />
        </g>

        {/* ---------- THE RIVER ---------- */}
        <g opacity={sceneOp(f, S.river)}>
          <rect x={0} y={GROUND - 20} width={1080} height={120} fill="#1d2d55" />
          <path d={`M 0 ${GROUND - 20} L 520 ${GROUND - 20} L 520 ${GROUND + 100} L 0 ${GROUND + 100} Z`} fill={INK} />
          <Piper x={180 + 300 * riverWalk} y={GROUND - 20} s={0.9} f={f} />
          {Array.from({ length: 14 }, (_, i) => {
            const rx = 100 + 300 * riverWalk + 140 + i * 55 - 60 * Math.sin(f * 0.1 + i);
            const inWater = rx > 540;
            return (
              <g key={i} opacity={inWater ? Math.max(0, 1 - (rx - 540) / 220) : 1}>
                <Rat x={rx} y={GROUND - 20 + (inWater ? Math.min(60, (rx - 540) * 0.3) : 0)} s={0.7} f={f} seed={i} />
              </g>
            );
          })}
          {label('EVERY RAT', 22.7, 1 - prog(f, F(27.3), F(27.5)), PALE)}
          {label('NOT ONE COMES OUT', 27.45, 1, '#9fb4e6')}
        </g>

        {/* ---------- POV: they laugh at me ---------- */}
        <g opacity={sceneOp(f, S.laugh)} transform={pushT(push(31.5, 33.0, 0.1), 540, 700)}>
          <Mayor f={f} laugh={laugh} />
          {label('MY PAY?', 29.9, 1 - laugh, GOLD, 300)}
        </g>

        {/* ---------- I LEAVE ... AND COME BACK (church morning) ---------- */}
        <g opacity={sceneOp(f, S.ret)}>
          <Town lit={1} />
          <g opacity={1 - prog(f, F(34.3), F(34.7))}>
            <Piper x={540 + 600 * prog(f, F(33.4), F(34.7))} y={GROUND} s={1.0} f={f} playing={0} />
          </g>
          {/* church windows glow: the parents are inside */}
          <circle cx={520} cy={GROUND - 520} r={120} fill={GOLD} opacity={0.25 * prog(f, F(36.7), F(37.3))} />
          {label('THE PARENTS ARE IN CHURCH', 36.8, 1 - prog(f, F(38.1), F(38.4)), PALE, 470, 540, 50)}
          <g opacity={prog(f, F(38.2), F(38.7))}>
            <Piper x={1000 - 300 * EASE(prog(f, F(38.2), F(39.6)))} y={GROUND} s={1.0} f={f} hunter flip playing={0} />
          </g>
          {label('A RED HAT', 40.7, 1, '#ff8a8a')}
        </g>

        {/* ---------- PAUSE ---------- */}
        <g opacity={sceneOp(f, S.pause)} transform={pushT(push(42.4, 46.5, 0.15), 540, GROUND - 200)}>
          <Town lit={1} />
          <Piper x={540} y={GROUND} s={1.0} f={f} hunter playing={0} />
        </g>

        {/* ---------- THE CHILDREN FOLLOW ---------- */}
        <g opacity={sceneOp(f, S.children)}>
          <Town lit={1} />
          {/* doors creak open */}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={20 + i * 215 + 60} y={GROUND - 110} width={50} height={110} fill={GOLD} opacity={0.75 * doors} />
          ))}
          <Piper x={540 + 420 * march} y={GROUND} s={0.95} f={f} hunter />
          {procession(540 + 420 * march, 9, kids)}
          {label('DOORS CREAK OPEN', 48.0, 1 - prog(f, F(51.0), F(51.2)), PALE)}
          {label('130 CHILDREN', 51.2, 1, GOLD)}
        </g>

        {/* ---------- INTO THE MOUNTAIN ---------- */}
        <g opacity={sceneOp(f, S.mountain)}>
          <path d={`M 300 ${GROUND} Q 700 ${GROUND - 700} 1080 ${GROUND - 760} L 1080 ${GROUND} Z`} fill="#0c0a14" />
          <ellipse cx={800} cy={GROUND - 120} rx={70 * mtnOpen} ry={120 * mtnOpen} fill={GOLD} opacity={0.9} />
          <circle cx={800} cy={GROUND - 120} r={260 * mtnOpen} fill={GOLD} opacity={0.12} />
          <g opacity={1 - prog(f, F(57.5), F(57.9))}>
            <Piper x={420 + 380 * toMtn} y={GROUND} s={0.8 - 0.3 * toMtn} f={f} hunter />
            {procession(420 + 380 * toMtn, 7, 1, 0.36 - 0.12 * toMtn)}
          </g>
          {label('IT OPENS FOR US', 56.5, 1, GOLD)}
        </g>

        {/* ---------- MOTHERS SCREAMING ---------- */}
        <g opacity={sceneOp(f, S.search)}>
          <rect x={620} y={GROUND - 10} width={460} height={110} fill="#1d2d55" />
          {[0, 1, 2].map((i) => (
            <Person key={i} x={200 + i * 230} y={GROUND} s={0.9} skirt lantern={1} flip={i === 1} arm={0.4 + 0.2 * Math.sin(f * 0.2 + i)} />
          ))}
          {label('NOTHING ANSWERS', 61.4, 1, '#9fb4e6')}
        </g>

        {/* ---------- THE FEW ---------- */}
        <g opacity={sceneOp(f, S.few)}>
          <g opacity={prog(f, F(64.9), F(65.3))}>
            <Person x={220} y={GROUND} s={0.8} stick />
            {label('BLIND', 65.2, 1, PALE, GROUND - 330, 220, 40)}
          </g>
          <g opacity={prog(f, F(65.9), F(66.3))}>
            <Person x={540} y={GROUND} s={0.8} mouth />
            {label('MUTE', 66.4, 1, PALE, GROUND - 330, 540, 40)}
          </g>
          <g opacity={prog(f, F(67.2), F(67.6))}>
            <Person x={840} y={GROUND} s={0.7} coat />
            {label('HIS COAT', 67.9, 1, GOLD, GROUND - 300, 840, 40)}
          </g>
          {label('TOO SLOW', 63.8, 1, PALE)}
        </g>

        {/* ---------- THE YEAR ---------- */}
        <g opacity={sceneOp(f, S.records) * (1 - loopBack)}>
          <g transform="translate(540 860) rotate(-3)">
            <rect x={-330} y={-300} width={660} height={600} rx={16} fill="#d9c9a3" />
            <rect x={-330} y={-300} width={660} height={600} rx={16} fill="none" stroke="#8a6a3a" strokeWidth={6} />
            <text x={0} y={-180} fill="#3a2a14" fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={54} textAnchor="middle">HAMELIN</text>
            <text x={0} y={-40} fill="#7a1a1a" fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={96} textAnchor="middle" opacity={prog(f, F(70.9), F(71.3))}>1284</text>
            <text x={0} y={110} fill="#3a2a14" fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={48} textAnchor="middle" opacity={prog(f, F(72.4), F(72.8))}>PAY THE PIPER</text>
          </g>
        </g>

        {t < S.deal[0] || (t >= S.river[0] && t < S.laugh[0]) || t >= S.ret[0] && !(t >= S.pipe2[0] && t < S.pipe2[1]) ? <Ground /> : null}
      </svg>

      {/* title card on the hook / loop */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', opacity: titleOp }}>
        <div style={{ fontFamily: FONT_EDITORIAL, fontWeight: 900, fontSize: 96, color: PALE, letterSpacing: 4, textShadow: '0 4px 30px rgba(0,0,0,0.6)' }}>THE PIED PIPER</div>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: PALE, opacity: 0.8, letterSpacing: 8 }}>IN HIS OWN WORDS</div>
      </div>

      <Sequence from={F(42.45)} durationInFrames={F(4.1)}>
        <PauseCard title="PAUSE" subtitle="if you were me, what would you play?" durSec={4.1} accent={GOLD} y={360} />
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
