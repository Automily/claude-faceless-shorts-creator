import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { Captions, PauseCard, ProgressBar, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_EDITORIAL, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Candlelit Tales #5: The Robber Bridegroom (Grimm KHM 40), told by the bride
// First person, present tense. POV from behind the barrel. No gore: only the gold ring.
// =============================================================================
export const compositionConfig = {
  id: 'Tale5RobberBridegroom',
  durationInSeconds: 80.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const INK = '#05060a';
const PALE = '#f7ecd0';
const GOLD = '#ffcf6b';
const FIRE = '#ff9a3c';
const FROST = '#9fd0ff';
const EASE = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);
const GROUND = 1260;

const S = {
  hook: [0, 4.85],
  suitor: [4.85, 12.15],
  invite: [12.15, 18.55],
  peas: [18.55, 23.6],
  house: [23.6, 31.35],
  hide: [31.35, 38.65],
  pause: [38.65, 43.4],
  ring: [43.4, 51.8],
  escape: [51.8, 59.25],
  moon: [59.25, 66.3],
  feast: [66.3, 74.05],
  end: [74.05, 80.5],
} as const;
const sceneOp = (f: number, [a, b]: readonly [number, number], fade = 8) =>
  Math.min(prog(f, F(a) - fade, F(a)), 1 - prog(f, F(b) - fade, F(b)));

// =============================================================================
// SILHOUETTE PARTS
// =============================================================================
const Person: React.FC<{ x: number; y: number; s?: number; skirt?: boolean; arm?: number; flip?: boolean; hat?: boolean; bob?: number; veil?: boolean; eyes?: number; lean?: number; bent?: boolean }> = ({
  x, y, s = 1, skirt, arm = 0, flip, hat, bob = 0, veil, eyes = 0, lean = 0, bent,
}) => (
  <g transform={`translate(${x} ${y - bob}) scale(${flip ? -s : s} ${s}) rotate(${lean})`} fill={INK}>
    <circle cx={bent ? 20 : 0} cy={bent ? -270 : -300} r={34} />
    {hat ? <path d="M -54 -318 L 54 -318 L 30 -334 L 20 -366 L -20 -366 L -30 -334 Z" /> : null}
    {veil ? <path d="M -30 -330 Q -80 -250 -70 -150 L -40 -160 Q -50 -250 0 -326 Z" fill="#cfc6b8" opacity={0.85} /> : null}
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
    {eyes > 0 ? (
      <g>
        <circle cx={-12} cy={-306} r={5} fill="#ff5a5a" opacity={eyes} />
        <circle cx={12} cy={-306} r={5} fill="#ff5a5a" opacity={eyes} />
      </g>
    ) : null}
  </g>
);

const Tree: React.FC<{ x: number; s?: number; color?: string }> = ({ x, s = 1, color = '#0a0c14' }) => (
  <g transform={`translate(${x} ${GROUND}) scale(${s})`} fill={color}>
    <rect x={-22} y={-520} width={44} height={520} />
    <path d="M 0 -900 L 170 -560 L 90 -580 L 200 -380 L -200 -380 L -90 -580 L -170 -560 Z" />
  </g>
);

const Ring: React.FC<{ x: number; y: number; s?: number; glow?: number }> = ({ x, y, s = 1, glow = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={160} fill={GOLD} opacity={0.12 * glow} />
    <ellipse rx={90} ry={70} fill="none" stroke="#d9a63a" strokeWidth={26} />
    <ellipse rx={90} ry={70} fill="none" stroke="#ffe7a0" strokeWidth={6} opacity={0.8} />
    <path d="M -20 -78 L 0 -112 L 20 -78 Z" fill="#bfe8ff" />
  </g>
);

// POV frame: peeking from behind the barrel (dark staves on both sides, a slit of light between)
const BarrelPOV: React.FC<{ gap?: number }> = ({ gap = 1 }) => {
  const w = 300 - 80 * gap;
  return (
    <g>
      <path d={`M 0 0 L ${w} 0 Q ${w + 90} 960 ${w} 1920 L 0 1920 Z`} fill="#140c06" />
      <path d={`M 1080 0 L ${1080 - w} 0 Q ${990 - w} 960 ${1080 - w} 1920 L 1080 1920 Z`} fill="#140c06" />
      {[0.25, 0.5, 0.75].map((k) => (
        <g key={k}>
          <rect x={0} y={1920 * k - 14} width={w + 60} height={28} fill="#2a1a0c" />
          <rect x={1020 - w} y={1920 * k - 14} width={w + 60} height={28} fill="#2a1a0c" />
        </g>
      ))}
    </g>
  );
};

// the robbers' room by firelight
const Den: React.FC<{ f: number; girl?: number; robbers?: number; slump?: number }> = ({ f, girl = 0, robbers = 1, slump = 0 }) => {
  const fl = 1 + 0.08 * Math.sin(f * 0.5) + 0.05 * Math.sin(f * 1.3);
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="#1a0d06" />
      <circle cx={540} cy={GROUND - 140} r={420 * fl} fill={FIRE} opacity={0.22} />
      <ellipse cx={540} cy={GROUND - 60} rx={60 * fl} ry={90 * fl} fill={FIRE} opacity={0.9} />
      <ellipse cx={540} cy={GROUND - 40} rx={30 * fl} ry={50 * fl} fill="#ffcf6b" />
      <g opacity={robbers}>
        <Person x={360} y={GROUND} s={1.05} hat lean={-6 * slump} bent={slump > 0.5} />
        <Person x={720} y={GROUND} s={1.1} hat flip lean={8 * slump} bent={slump > 0.5} />
        <Person x={880} y={GROUND} s={0.95} flip lean={10 * slump} />
      </g>
      <g opacity={girl}>
        <Person x={250} y={GROUND} s={0.85} skirt lean={-12} />
      </g>
      <rect x={0} y={GROUND} width={1080} height={660} fill="#0c0604" />
    </g>
  );
};

// =============================================================================
const Tale5RobberBridegroom: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;

  const loopBack = prog(f, F(79.0), F(80.4));
  const hookOp = Math.max(1 - prog(f, F(S.hook[1]) - 10, F(S.hook[1])), loopBack);
  const titleOp = Math.max(1 - prog(f, F(4.3), F(4.85)), loopBack);

  const sky: [string, string] =
    t < S.invite[0] ? ['#1a1036', '#c77a48']
      : t < S.house[0] ? ['#0b1424', '#2e4a5c']
      : t < S.moon[0] ? ['#05070f', '#1a2238']
      : t < S.feast[0] ? ['#060a18', '#24365e']
      : ['#1a0d06', '#5a2a12'];

  const label = (text: string, at: number, op: number, color = PALE, y = 470, x = 540, size = 62) => (
    <text x={x} y={y} fill={color} fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={size} textAnchor="middle" opacity={op * prog(f, F(at), F(at) + 6)}>
      {text}
    </text>
  );
  const push = (a: number, b: number, amt = 0.12) => 1 + amt * EASE(prog(f, F(a), F(b)));
  const pushT = (k: number, cx = 540, cy = 1000) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

  // cues
  const cold = prog(f, F(10.8), F(11.6));
  const walkPeas = prog(f, F(18.7), F(23.4));
  const birdSing = prog(f, F(27.6), F(27.9));
  const hideIn = EASE(prog(f, F(33.2), F(34.3)));
  const doorLight = prog(f, F(39.5), F(40.3));
  const girlIn = prog(f, F(43.6), F(44.4));
  const roll = EASE(prog(f, F(46.8), F(49.4)));
  const ringBig = prog(f, F(50.1), F(50.5));
  const lampX = 540 + 360 * Math.sin((f - F(51.9)) * 0.06);
  const slump = EASE(prog(f, F(56.7), F(57.3)));
  const run = prog(f, F(57.65), F(57.95));
  const runX = prog(f, F(57.7), F(59.2));
  const sprout = prog(f, F(61.4), F(63.6));
  const ringOnTable = prog(f, F(72.1), F(72.6));
  const seize = EASE(prog(f, F(74.8), F(76.2)));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${sky[0]} 0%, ${sky[1]} 70%, ${sky[1]} 100%)` }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* ---------- HOOK / LOOP: from behind the barrel ---------- */}
        <g opacity={hookOp}>
          <Den f={f} />
          <BarrelPOV gap={1} />
        </g>

        {/* ---------- THE SUITOR ---------- */}
        <g opacity={sceneOp(f, S.suitor)} transform={pushT(push(9.0, 11.6, 0.18), 760, GROUND - 330)}>
          <rect x={760} y={GROUND - 380} width={0} height={0} />
          <Person x={250} y={GROUND} s={0.95} hat arm={prog(f, F(7.5), F(7.9)) * 0.5} />
          <Person x={470} y={GROUND} s={0.9} skirt />
          <Person x={760} y={GROUND} s={1.15} hat flip eyes={cold} />
          <rect x={0} y={0} width={1080} height={1920} fill={FROST} opacity={0.12 * cold} />
          {label('HE LOOKS AT ME', 9.5, 1 - prog(f, F(10.9), F(11.1)), PALE)}
          {label('COLD', 11.0, 1, FROST)}
        </g>

        {/* ---------- THE INVITATION: the forest, the ash path ---------- */}
        <g opacity={sceneOp(f, S.invite)}>
          {[80, 250, 860, 1000].map((x, i) => <Tree key={i} x={x} s={0.9 + (i % 2) * 0.2} />)}
          <Person x={520} y={GROUND} s={1.1} hat arm={0.45} flip />
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx={560 + i * 40} cy={GROUND - 4 - i * 6} r={6} fill="#9a9a9a" opacity={prog(f, F(15.3) + i * 2, F(15.3) + i * 2 + 4) * 0.8} />
          ))}
          {label('ASHES ON THE PATH', 15.3, 1, '#c8c8c8')}
        </g>

        {/* ---------- MY PEAS AND LENTILS ---------- */}
        <g opacity={sceneOp(f, S.peas)}>
          {[60, 230, 880, 1010].map((x, i) => <Tree key={i} x={x} s={0.9 + (i % 2) * 0.2} />)}
          <Person x={200 + 600 * walkPeas} y={GROUND} s={0.95} skirt bob={Math.abs(Math.sin(f * 0.35)) * 5} />
          {Array.from({ length: 24 }, (_, i) => {
            const px = 200 + i * 26;
            return <circle key={i} cx={px} cy={GROUND - 6} r={7} fill="#9be7b0" opacity={px < 200 + 600 * walkPeas - 20 ? 0.9 : 0} />;
          })}
          {label('A TRAIL OF MY OWN', 20.0, 1, '#9be7b0')}
        </g>

        {/* ---------- THE HOUSE + THE BIRD ---------- */}
        <g opacity={sceneOp(f, S.house)} transform={pushT(push(26.0, 30.5, 0.22), 560, 900)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#0a0806" />
          {/* the cage */}
          <g transform="translate(560 900)">
            <path d="M -120 0 Q -120 -260 0 -280 Q 120 -260 120 0 Z" fill="none" stroke="#c9a24a" strokeWidth={8} />
            {[-80, -40, 0, 40, 80].map((x) => <line key={x} x1={x} y1={0} x2={x * 0.6} y2={-260} stroke="#c9a24a" strokeWidth={5} />)}
            <rect x={-130} y={-6} width={260} height={20} fill="#c9a24a" />
            <g transform={`translate(0 -90) rotate(${birdSing * 10 * Math.sin(f * 0.8)})`}>
              <ellipse cx={0} cy={0} rx={46} ry={34} fill="#e6b422" />
              <circle cx={34} cy={-26} r={22} fill="#e6b422" />
              <path d="M 54 -26 L 74 -20 L 54 -16 Z" fill="#ff9a3c" />
              <circle cx={40} cy={-30} r={4} fill={INK} />
            </g>
            {[0, 1, 2].map((k) => {
              const p = ((f / 30 + k * 0.5) % 1.5) / 1.5;
              return <text key={k} x={90 + 60 * p} y={-150 - 100 * p} fill={GOLD} fontSize={44} opacity={birdSing * (1 - p)} fontFamily={FONT_EDITORIAL}>♪</text>;
            })}
          </g>
          {label('TURN BACK, YOUNG BRIDE', 27.65, 1 - prog(f, F(29.2), F(29.4)), GOLD, 470, 540, 54)}
          {label("A MURDERERS' HOUSE", 29.3, 1, '#ff8a8a', 470, 540, 58)}
        </g>

        {/* ---------- THE OLD WOMAN + THE BARREL ---------- */}
        <g opacity={sceneOp(f, S.hide)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#0e0905" />
          <circle cx={300} cy={GROUND - 300} r={200} fill={FIRE} opacity={0.12} />
          <Person x={330} y={GROUND} s={0.85} skirt bent arm={0.35} />
          <Person x={540 + 180 * hideIn} y={GROUND} s={0.95 - 0.1 * hideIn} skirt veil />
          {/* the barrel */}
          <g transform={`translate(760 ${GROUND})`}>
            <path d="M -130 0 Q -160 -220 -130 -440 L 130 -440 Q 160 -220 130 0 Z" fill="#2a1a0c" stroke="#3c2614" strokeWidth={6} />
            {[-360, -220, -80].map((y) => <rect key={y} x={-150} y={y} width={300} height={22} fill="#120a04" />)}
          </g>
          {label('BE STILL', 35.3, 1, PALE)}
          {label("OR YOU'RE DEAD", 36.9, 1, '#ff8a8a', 550)}
        </g>

        {/* ---------- PAUSE: footsteps (POV barrel, door light) ---------- */}
        <g opacity={sceneOp(f, S.pause)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#0a0604" />
          <rect x={420} y={GROUND - 520} width={240} height={520} fill={GOLD} opacity={0.6 * doorLight} />
          <g opacity={doorLight}>
            <Person x={540} y={GROUND} s={1.15} hat />
          </g>
          <rect x={0} y={GROUND} width={1080} height={660} fill="#0c0604" />
          <BarrelPOV gap={0.6} />
        </g>

        {/* ---------- THE RING ---------- */}
        <g opacity={sceneOp(f, S.ring)}>
          <Den f={f} girl={girlIn * (1 - prog(f, F(45.8), F(46.4)))} />
          {/* the ring rolls toward us */}
          <g opacity={1 - ringBig}>
            <Ring x={540 + 60 * Math.sin(roll * 6)} y={GROUND - 40 + 300 * roll} s={0.15 + 0.6 * roll} glow={roll} />
          </g>
          <BarrelPOV gap={1} />
          <g opacity={ringBig}>
            <rect x={0} y={0} width={1080} height={1920} fill="#0a0604" opacity={0.85} />
            <Ring x={540} y={900} s={2.2} />
          </g>
          {label('A GOLD RING', 50.4, 1, GOLD, 470)}
        </g>

        {/* ---------- THE LAMP, THE WINE, THE RUN ---------- */}
        <g opacity={sceneOp(f, S.escape)}>
          <g opacity={1 - run}>
            <Den f={f} slump={slump} />
            {/* the searching lamp */}
            <circle cx={lampX} cy={GROUND - 200} r={230} fill={GOLD} opacity={0.22 * (1 - prog(f, F(53.3), F(53.8)))} />
            <BarrelPOV gap={1} />
            {label('THEY SEARCH', 51.95, 1 - prog(f, F(53.3), F(53.6)), PALE)}
            {label('DRUGGED WINE', 55.8, 1 - prog(f, F(57.35), F(57.6)), '#c77ad8')}
          </g>
          <g opacity={run}>
            <rect x={0} y={0} width={1080} height={1920} fill="#1a2742" />
            <circle cx={820} cy={560} r={90} fill={PALE} opacity={0.8} />
            {[80, 300, 820, 1000].map((x, i) => <Tree key={i} x={x} s={1 + (i % 2) * 0.2} />)}
            <Person x={200 + 600 * runX} y={GROUND} s={0.95} skirt veil lean={14} bob={Math.abs(Math.sin(f * 0.7)) * 14} />
            <Person x={80 + 600 * runX} y={GROUND} s={0.85} skirt bent lean={14} bob={Math.abs(Math.sin(f * 0.7 + 1)) * 10} />
            {label('WE RUN', 57.75, 1, PALE)}
          </g>
        </g>

        {/* ---------- THE SPROUTED PATH ---------- */}
        <g opacity={sceneOp(f, S.moon)}>
          <circle cx={820} cy={560} r={100} fill={PALE} opacity={0.85} />
          {[60, 240, 900, 1020].map((x, i) => <Tree key={i} x={x} s={1 + (i % 2) * 0.15} />)}
          {Array.from({ length: 20 }, (_, i) => {
            const px = 120 + i * 44;
            const h = 30 * sprout * (0.6 + ((i * 7) % 5) * 0.12);
            return (
              <g key={i}>
                <circle cx={px} cy={GROUND - 4} r={20} fill="#9be7b0" opacity={0.15 * sprout} />
                <path d={`M ${px} ${GROUND} L ${px} ${GROUND - h} M ${px} ${GROUND - h * 0.7} Q ${px + 14} ${GROUND - h} ${px + 18} ${GROUND - h * 0.9} M ${px} ${GROUND - h * 0.5} Q ${px - 14} ${GROUND - h * 0.8} ${px - 18} ${GROUND - h * 0.7}`} stroke="#9be7b0" strokeWidth={4} fill="none" />
              </g>
            );
          })}
          <Person x={150 + 700 * prog(f, F(63.6), F(66.2))} y={GROUND} s={0.9} skirt veil bob={Math.abs(Math.sin(f * 0.35)) * 5} />
          {label('THE ASHES ARE GONE', 59.4, 1 - prog(f, F(61.2), F(61.4)), '#c8c8c8')}
          {label('MY PEAS SPROUTED', 61.4, 1, '#9be7b0')}
        </g>

        {/* ---------- THE WEDDING FEAST ---------- */}
        <g opacity={sceneOp(f, S.feast)} transform={pushT(push(71.4, 73.6, 0.15), 540, GROUND - 180)}>
          <circle cx={540} cy={500} r={300} fill={GOLD} opacity={0.08} />
          {[200, 330, 750, 880].map((x, i) => <Person key={i} x={x} y={GROUND - 40} s={0.8} skirt={i % 2 === 0} flip={x > 540} />)}
          <Person x={620} y={GROUND - 40} s={1.0} hat flip />
          <Person x={460} y={GROUND - 40} s={0.95} skirt veil />
          <rect x={80} y={GROUND - 170} width={920} height={40} rx={8} fill="#2a1a0c" />
          <rect x={120} y={GROUND - 130} width={30} height={130} fill="#2a1a0c" />
          <rect x={930} y={GROUND - 130} width={30} height={130} fill="#2a1a0c" />
          {[200, 330, 750, 880].map((x) => <circle key={x} cx={x} cy={GROUND - 190} r={10} fill={GOLD} opacity={0.6} />)}
          <g opacity={ringOnTable}>
            <Ring x={540} y={GROUND - 200} s={0.4} />
          </g>
          {label('MY DREAM', 69.6, 1 - prog(f, F(71.9), F(72.1)), PALE)}
          {label('THE RING', 72.1, 1, GOLD)}
        </g>

        {/* ---------- SEIZED; I STILL HAVE THE RING ---------- */}
        <g opacity={sceneOp(f, S.end) * (1 - loopBack)}>
          <g opacity={1 - prog(f, F(76.7), F(77.1))}>
            <Person x={760 + 120 * seize} y={GROUND} s={1.05} hat flip lean={-10 * seize} />
            {[0, 1, 2].map((i) => (
              <Person key={i} x={380 + i * 110 + 200 * seize} y={GROUND} s={0.9} arm={0.4 + 0.3 * seize} />
            ))}
            <rect x={960} y={GROUND - 460} width={120} height={460} fill={GOLD} opacity={0.35} />
          </g>
          <g opacity={prog(f, F(76.9), F(77.4))}>
            <rect x={0} y={0} width={1080} height={1920} fill="#0a0604" opacity={0.9} />
            <Ring x={540} y={900} s={2.0} />
            {label('I STILL HAVE IT', 77.5, 1, GOLD, 470)}
          </g>
        </g>

        {(t >= S.suitor[0] && t < S.house[0]) || (t >= S.escape[0] + 5.9 && t < S.feast[0]) || (t >= S.end[0] && t < 77) || (t >= S.feast[0] && t < S.end[0]) ? (
          <path d={`M 0 ${GROUND} Q 270 ${GROUND - 30} 540 ${GROUND - 6} T 1080 ${GROUND - 20} L 1080 1920 L 0 1920 Z`} fill={INK} />
        ) : null}
      </svg>

      {/* title card on the hook / loop */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', opacity: titleOp }}>
        <div style={{ fontFamily: FONT_EDITORIAL, fontWeight: 900, fontSize: 78, color: PALE, letterSpacing: 3, textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>THE ROBBER</div>
        <div style={{ fontFamily: FONT_EDITORIAL, fontWeight: 900, fontSize: 78, color: PALE, letterSpacing: 3, textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>BRIDEGROOM</div>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: PALE, opacity: 0.8, letterSpacing: 8 }}>TOLD BY THE BRIDE</div>
      </div>

      <Sequence from={F(38.7)} durationInFrames={F(4.7)}>
        <PauseCard title="PAUSE" subtitle="footsteps at the door. what do you do?" durSec={4.7} accent={GOLD} y={360} />
      </Sequence>

      <Captions lines={VO} y={1480} accent={GOLD} />
      <ProgressBar color={GOLD} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: '#8b8fa5', opacity: 0.7 }}>
        retold from the Brothers Grimm, 1812
      </div>
    </AbsoluteFill>
  );
};

export default Tale5RobberBridegroom;
