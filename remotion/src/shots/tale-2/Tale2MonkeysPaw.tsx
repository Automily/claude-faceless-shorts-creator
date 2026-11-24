import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { Captions, PauseCard, ProgressBar, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_EDITORIAL, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Candlelit Tales #2: The Monkey's Paw (W. W. Jacobs, 1902, retold)
// Shadow-puppet silhouettes, firelight. Everything drawn in code.
// Motif: the paw's three glowing fingertips = wishes left; each wish curls one finger.
// =============================================================================
export const compositionConfig = {
  id: 'Tale2MonkeysPaw',
  durationInSeconds: 68.1,
  fps: 30,
  width: 1080,
  height: 1920,
};

const INK = '#05060a';
const EMBER = '#ff9a3c';
const PALE = '#f7ecd0';
const EASE = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);
const GROUND = 1260;

// ---- scene windows (global seconds, from the real voice) --------------------
const S = {
  hook: [0, 6.4],
  soldier: [6.4, 9.0],
  paw: [9.0, 20.9],
  fire: [20.9, 25.45],
  wish1: [25.45, 30.1],
  factory: [30.1, 35.2],
  money: [35.2, 39.6],
  pause: [39.6, 44.2],
  wife: [44.2, 47.55],
  grave: [47.55, 52.7],
  knock: [52.7, 56.1],
  third: [56.1, 61.7],
  empty: [61.7, 66.2],
} as const;
const sceneOp = (f: number, [a, b]: readonly [number, number], fade = 8) =>
  Math.min(prog(f, F(a) - fade, F(a)), 1 - prog(f, F(b) - fade, F(b)));

// knocks (seconds) -> door shake + glow
const KNOCKS = [4.81, 5.02, 5.23, 54.68, 54.9, 55.12, 57.0, 57.22, 58.5, 58.72, 59.5, 59.72];
const knockAt = (t: number) =>
  KNOCKS.reduce((acc, k) => (t >= k && t < k + 0.25 ? Math.max(acc, 1 - (t - k) / 0.25) : acc), 0);

// =============================================================================
// SILHOUETTE PARTS
// =============================================================================
const Person: React.FC<{ x: number; y: number; s?: number; hat?: boolean; skirt?: boolean; arm?: number; flip?: boolean; lean?: number }> = ({
  x, y, s = 1, hat, skirt, arm = 0, flip, lean = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${lean})`} fill={INK}>
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
    {/* raised arm (0 = down, 1 = up high) */}
    <g transform={`translate(36 -240) rotate(${-150 * arm + 20})`}>
      <rect x={-11} y={0} width={22} height={120} rx={11} />
    </g>
  </g>
);

// the paw: palm + 3 long fingers + thumb; curl[i] 0..1 bends finger i down; tips glow while unwished
const Paw: React.FC<{ x: number; y: number; s?: number; curl: number[]; f: number; twitch?: number }> = ({ x, y, s = 1, curl, f, twitch = 0 }) => {
  const wob = twitch * 6 * Math.sin(f * 1.3);
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${wob})`}>
      {/* wrist + palm */}
      <path d="M -50 220 L -44 60 Q -70 -10 -40 -60 L 40 -60 Q 70 -10 44 60 L 50 220 Z" fill="#1c130d" stroke="#3a281a" strokeWidth={4} />
      {/* thumb */}
      <path d="M -40 -10 Q -110 -40 -120 -110 Q -96 -118 -86 -80 Q -70 -50 -36 -40 Z" fill="#1c130d" stroke="#3a281a" strokeWidth={4} />
      {[-30, 0, 30].map((dx, i) => {
        const c = curl[i] ?? 0;
        const len = i === 1 ? 210 : 180;
        return (
          <g key={i} transform={`translate(${dx} -56) rotate(${(dx / 3) + 150 * c})`}>
            <path d={`M -13 0 L -10 ${-len * 0.5} Q -12 ${-len * 0.55} -9 ${-len * 0.6} L -6 ${-len} Q 0 ${-len - 14} 6 ${-len} L 9 ${-len * 0.6} Q 12 ${-len * 0.55} 10 ${-len * 0.5} L 13 0 Z`} fill="#1c130d" stroke="#3a281a" strokeWidth={4} />
            <circle cx={0} cy={-len - 6} r={26} fill={EMBER} opacity={0.35 * (1 - c)} />
            <circle cx={0} cy={-len - 6} r={8} fill="#ffd9a0" opacity={1 - c} />
          </g>
        );
      })}
    </g>
  );
};

const Fireplace: React.FC<{ x: number; f: number; flare?: number }> = ({ x, f, flare = 0 }) => {
  const fl = 1 + 0.1 * Math.sin(f * 0.5) + 0.06 * Math.sin(f * 1.3) + 0.5 * flare;
  return (
    <g transform={`translate(${x} ${GROUND})`}>
      <circle cx={0} cy={-90} r={260 * fl} fill={EMBER} opacity={0.16} />
      <path d="M -170 0 L -170 -320 L 170 -320 L 170 0 L 110 0 L 110 -220 Q 0 -280 -110 -220 L -110 0 Z" fill={INK} />
      <rect x={-200} y={-350} width={400} height={34} fill={INK} />
      <ellipse cx={0} cy={-60} rx={70 * fl} ry={90 * fl} fill={EMBER} opacity={0.85} />
      <ellipse cx={-30} cy={-40} rx={34 * fl} ry={58 * fl} fill="#ffcf6b" opacity={0.9} />
      <ellipse cx={34} cy={-46} rx={30 * fl} ry={50 * fl} fill="#ffcf6b" opacity={0.8} />
      <rect x={-90} y={-14} width={180} height={14} rx={6} fill={INK} />
    </g>
  );
};

const Cottage: React.FC<{ x: number; open?: number; knock?: number; f: number }> = ({ x, open = 0, knock = 0 }) => (
  <g transform={`translate(${x} ${GROUND})`} fill={INK}>
    <path d="M -280 0 L -280 -300 L 0 -500 L 280 -300 L 280 0 Z" />
    <rect x={150} y={-560} width={60} height={160} />
    <rect x={-210} y={-230} width={110} height={100} fill="#ffcf6b" opacity={0.85} />
    <rect x={-159} y={-230} width={8} height={100} fill={INK} />
    <rect x={-210} y={-184} width={110} height={8} fill={INK} />
    {/* doorway light (shows when open) and the door itself */}
    <rect x={40} y={-260} width={130} height={260} fill="#ffcf6b" opacity={0.9 * open} />
    <g transform={`translate(${40 + knock * 4} 0)`}>
      <rect x={0} y={-260} width={130 * (1 - 0.85 * open)} height={260} fill="#0c0a10" stroke="#2a1e14" strokeWidth={3} />
    </g>
    <rect x={40} y={-4} width={130} height={4} fill="#ffcf6b" opacity={0.6 + 0.4 * knock} />
  </g>
);

const Lamp: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} ${GROUND})`}>
    <circle cx={0} cy={-470} r={110} fill="#ffe7a8" opacity={0.12} />
    <rect x={-7} y={-460} width={14} height={460} fill={INK} />
    <path d="M -26 -470 L 26 -470 L 18 -510 L -18 -510 Z" fill="#ffe7a8" opacity={0.85} />
    <rect x={-30} y={-516} width={60} height={10} fill={INK} />
  </g>
);

const Gear: React.FC<{ x: number; y: number; r: number; rot: number }> = ({ x, y, r, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} fill="#140d10">
    {Array.from({ length: 10 }, (_, i) => (
      <rect key={i} x={-r * 0.14} y={-r * 1.18} width={r * 0.28} height={r * 0.36} transform={`rotate(${i * 36})`} />
    ))}
    <circle r={r} />
    <circle r={r * 0.3} fill="#3a1f1a" />
  </g>
);

const Ground: React.FC = () => (
  <path d={`M 0 ${GROUND} Q 270 ${GROUND - 30} 540 ${GROUND - 6} T 1080 ${GROUND - 20} L 1080 1920 L 0 1920 Z`} fill={INK} />
);

// =============================================================================
const Tale2MonkeysPaw: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;

  const loopBack = prog(f, F(66.6), F(68.0));
  const blackout = Math.min(prog(f, F(65.6), F(66.3)), 1 - loopBack);
  const hookOp = Math.max(1 - prog(f, F(S.hook[1]) - 10, F(S.hook[1])), loopBack);
  const knock = knockAt(t);

  // sky per scene
  const sky: [string, string] =
    t < S.soldier[0] || t >= S.empty[0] ? ['#060816', '#27305e']
      : t < S.factory[0] ? ['#0d0806', '#3b1d0c']
      : t < S.money[0] ? ['#1b1a22', '#6c6a72']
      : t < S.grave[0] ? ['#0d0806', '#3b1d0c']
      : t < S.knock[0] ? ['#05070f', '#1e2a45']
      : ['#07050a', '#24140c'];

  // the wishes: finger curls
  const c1 = EASE(prog(f, F(26.5), F(27.2)));
  const c2 = EASE(prog(f, F(45.6), F(46.3)));
  const c3 = EASE(prog(f, F(60.1), F(60.8)));
  const curl = [c1, c2, c3];

  // fire scene: the throw and the rescue
  const thrown = EASE(prog(f, F(21.7), F(22.4)));
  const rescued = EASE(prog(f, F(23.8), F(24.5)));

  const titleOp = Math.max(1 - prog(f, F(5.8), F(6.4)), loopBack);
  const label = (text: string, at: number, op: number, color = PALE, y = 470) => (
    <text x={540} y={y} fill={color} fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={62} textAnchor="middle" opacity={op * prog(f, F(at), F(at) + 6)}>
      {text}
    </text>
  );

  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${sky[0]} 0%, ${sky[1]} 70%, ${sky[1]} 100%)` }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* ---------- HOOK / LOOP: a figure at the cottage door ---------- */}
        <g opacity={hookOp}>
          <circle cx={830} cy={560} r={90} fill={PALE} opacity={0.85} />
          <Cottage x={420} knock={knock} f={f} />
          <Lamp x={900} />
          <g style={{ filter: 'drop-shadow(0 0 10px #9fb4e6) drop-shadow(0 0 3px #9fb4e6)' }}>
            <Person x={660} y={GROUND} s={0.95} lean={-8} arm={0.55} flip />
          </g>
        </g>

        {/* ---------- SOLDIER brings the paw ---------- */}
        <g opacity={sceneOp(f, S.soldier)}>
          <Fireplace x={540} f={f} />
          <Person x={250} y={GROUND} hat arm={prog(f, F(7.5), F(8.2)) * 0.6} />
          <Person x={820} y={GROUND} s={0.95} />
          <Person x={950} y={GROUND} s={0.9} skirt />
        </g>

        {/* ---------- THE PAW close-up: the spell, 3 x 3 ---------- */}
        <g opacity={sceneOp(f, S.paw)}>
          <circle cx={540} cy={900} r={360} fill={EMBER} opacity={0.08} />
          <Paw x={540} y={1060} s={1.25} curl={[0, 0, 0]} f={f} twitch={prog(f, F(14.3), F(14.6)) * (1 - prog(f, F(15.4), F(15.8)))} />
          {label('FATE RULES', 14.3, 1 - prog(f, F(18.1), F(18.35)))}
          {label('MEDDLE AND SUFFER', 16.5, 1 - prog(f, F(18.1), F(18.35)), '#ff8a8a', 550)}
          {label('3 MEN × 3 WISHES', 18.5, 1)}
        </g>

        {/* ---------- FIRE: thrown in, pulled out ---------- */}
        <g opacity={sceneOp(f, S.fire)}>
          <Fireplace x={540} f={f} flare={prog(f, F(22.3), F(22.6)) * (1 - prog(f, F(22.6), F(23.4)))} />
          <Person x={260} y={GROUND} hat arm={0.5 * (1 - thrown)} />
          <Person x={760 - 140 * rescued} y={GROUND} lean={-20 * rescued * (1 - prog(f, F(24.6), F(25.2)))} arm={0.3 * rescued} />
          {/* the paw in flight: hand -> fire -> rescuer's hand */}
          <g opacity={1}>
            <Paw
              x={rescued > 0 ? 540 + 120 * rescued : 320 + 220 * thrown}
              y={rescued > 0 ? GROUND - 70 - 130 * rescued : GROUND - 260 + 190 * thrown - 160 * Math.sin(Math.PI * thrown)}
              s={0.22}
              curl={[0, 0, 0]}
              f={f}
            />
          </g>
        </g>

        {/* ---------- WISH 1: £200 ---------- */}
        <g opacity={sceneOp(f, S.wish1)}>
          <Fireplace x={860} f={f} />
          <Paw x={500} y={1000} s={1.0} curl={curl} f={f} twitch={prog(f, F(26.4), F(26.6)) * (1 - prog(f, F(27.4), F(27.8)))} />
          {label('WISH 1: £200', 27.3, 1, '#ffcf6b')}
        </g>

        {/* ---------- FACTORY: the man at the door ---------- */}
        <g opacity={sceneOp(f, S.factory)}>
          <rect x={720} y={GROUND - 760} width={90} height={500} fill="#140d10" />
          <path d={`M 560 ${GROUND} L 560 ${GROUND - 300} L 680 ${GROUND - 380} L 680 ${GROUND - 300} L 800 ${GROUND - 380} L 800 ${GROUND - 300} L 1000 ${GROUND - 380} L 1000 ${GROUND} Z`} fill="#140d10" />
          <g opacity={prog(f, F(33.7), F(34.1))}>
            <Gear x={760} y={GROUND - 520} r={110} rot={t * 140} />
            <Gear x={910} y={GROUND - 440} r={70} rot={-t * 220 + 18} />
          </g>
          <Person x={300} y={GROUND} hat />
          <Person x={140} y={GROUND} s={0.95} skirt />
          {label('HERBERT', 33.0, 1, '#ff8a8a')}
        </g>

        {/* ---------- COMPENSATION: £200 ---------- */}
        <g opacity={sceneOp(f, S.money)}>
          <Fireplace x={860} f={f} />
          <Person x={260} y={GROUND} hat arm={0.35} />
          <Person x={520} y={GROUND} s={0.95} />
          <rect x={300} y={GROUND - 250} width={90} height={56} rx={4} fill={PALE} opacity={prog(f, F(36.3), F(36.6))} transform={`rotate(-8 345 ${GROUND - 222})`} />
          {label('£200', 37.7, 1, '#ffcf6b')}
          {label('for their son', 38.0, 1, PALE, 540)}
        </g>

        {/* ---------- PAUSE: two wishes left ---------- */}
        <g opacity={sceneOp(f, S.pause)}>
          <circle cx={540} cy={1000} r={320} fill={EMBER} opacity={0.08} />
          <Paw x={540} y={1120} s={1.0} curl={curl} f={f} />
        </g>

        {/* ---------- WIFE: wish our boy alive ---------- */}
        <g opacity={sceneOp(f, S.wife)}>
          <Fireplace x={820} f={f} />
          <Person x={380} y={GROUND} skirt arm={prog(f, F(45.4), F(45.8))} />
          <Paw x={430} y={GROUND - 500 + 160 * (1 - prog(f, F(45.4), F(45.8)))} s={0.3} curl={curl} f={f} twitch={1} />
          <Person x={200} y={GROUND} s={0.95} />
          {label('WISH 2: BRING HIM BACK', 45.7, 1, '#ff8a8a')}
        </g>

        {/* ---------- GRAVE: ten days, two miles ---------- */}
        <g opacity={sceneOp(f, S.grave)}>
          <circle cx={540} cy={640} r={80} fill={PALE} opacity={0.8} />
          <path d={`M 0 ${GROUND - 140} Q 300 ${GROUND - 320} 640 ${GROUND - 220} T 1080 ${GROUND - 260} L 1080 ${GROUND} L 0 ${GROUND} Z`} fill="#0b0d16" />
          {[160, 300, 430, 760, 900].map((gx, i) => (
            <path key={i} d={`M ${gx - 26} ${GROUND - 210 - (i % 2) * 40} L ${gx - 26} ${GROUND - 270 - (i % 2) * 40} Q ${gx} ${GROUND - 300 - (i % 2) * 40} ${gx + 26} ${GROUND - 270 - (i % 2) * 40} L ${gx + 26} ${GROUND - 210 - (i % 2) * 40} Z`} fill={INK} />
          ))}
          <g transform={`translate(600 ${GROUND - 250})`} fill={INK}>
            <rect x={-8} y={-110} width={16} height={110} />
            <rect x={-46} y={-84} width={92} height={16} />
          </g>
          {label('BURIED 10 DAYS', 48.7, 1)}
          {label('2 MILES AWAY', 50.4, 1, '#9fb4e6', 550)}
        </g>

        {/* ---------- KNOCK: the door from inside ---------- */}
        <g opacity={Math.max(sceneOp(f, S.knock), sceneOp(f, S.third))}>
          <g transform={`translate(${540 + knock * 6} ${GROUND})`}>
            <rect x={-170} y={-600} width={340} height={600} fill="#120c09" stroke="#2c1d12" strokeWidth={6} />
            <rect x={-170} y={-600} width={340} height={600} fill="#ffcf6b" opacity={0.06 + 0.12 * knock} />
            <rect x={110} y={-330} width={50} height={16} rx={4} fill="#3c2a1a" />
            <rect x={-170} y={-8} width={340} height={8} fill="#9fb4e6" opacity={0.4 + 0.5 * knock} />
          </g>
          <text x={540} y={560} fill="#ff8a8a" fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={90} textAnchor="middle" opacity={knock}>
            KNOCK
          </text>
          {/* third wish: wife reaching for the bolt, husband on the floor */}
          <g opacity={sceneOp(f, S.third)}>
            <Person x={820} y={GROUND} skirt arm={0.75} flip />
            <g transform={`translate(230 ${GROUND - 40}) rotate(-70)`}>
              <Person x={0} y={0} s={0.85} arm={0.6} />
            </g>
            <g style={{ filter: 'drop-shadow(0 0 8px #ff9a3c)' }}>
              <Paw x={330} y={GROUND - 200} s={0.3} curl={curl} f={f} />
            </g>
            {label('WISH 3', 60.2, 1, '#ffcf6b', 470)}
          </g>
        </g>

        {/* ---------- EMPTY ROAD ---------- */}
        <g opacity={sceneOp(f, S.empty) * (1 - blackout)}>
          <circle cx={830} cy={560} r={90} fill={PALE} opacity={0.85} />
          <Cottage x={420} open={1} f={f} />
          <Lamp x={900} />
          <path d={`M 560 ${GROUND} L 1080 ${GROUND - 10}`} stroke="#3a4060" strokeWidth={4} />
          {label('EMPTY', 63.9, 1, '#9fb4e6')}
        </g>

        <Ground />
      </svg>

      {/* title card on the hook / loop */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', opacity: titleOp }}>
        <div style={{ fontFamily: FONT_EDITORIAL, fontWeight: 900, fontSize: 82, color: PALE, letterSpacing: 3, textShadow: '0 4px 30px rgba(0,0,0,0.6)' }}>THE MONKEY'S PAW</div>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: PALE, opacity: 0.8, letterSpacing: 8 }}>THREE WISHES</div>
      </div>

      <AbsoluteFill style={{ background: '#000', opacity: blackout }} />

      <Sequence from={F(39.6)} durationInFrames={F(4.6)}>
        <PauseCard title="PAUSE" subtitle="two wishes left. what would you wish for?" durSec={4.6} accent="#ffcf6b" y={360} />
      </Sequence>

      <Captions lines={VO} y={1480} accent="#ffcf6b" />
      <ProgressBar color="#ffcf6b" />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: '#8b8fa5', opacity: 0.7 }}>
        retold from W. W. Jacobs, 1902
      </div>
    </AbsoluteFill>
  );
};

export default Tale2MonkeysPaw;
