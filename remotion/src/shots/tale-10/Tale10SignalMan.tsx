import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { Captions, PauseCard, ProgressBar, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_EDITORIAL, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Candlelit Tales #10: The Signal-Man (Dickens, 1866), told by the visitor
// Signature: the red danger light at the tunnel mouth; the gesture (one arm over the face, the other waving).
// =============================================================================
export const compositionConfig = {
  id: 'Tale10SignalMan',
  durationInSeconds: 76.2,
  fps: 30,
  width: 1080,
  height: 1920,
};

const INK = '#05060a';
const PALE = '#f7ecd0';
const GOLD = '#ffcf6b';
const RED = '#ff2a2a';
const GHOST = '#d8e4ee';
const EASE = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);
const GROUND = 1260;

const S = {
  hook: [0, 7.85],
  cutting: [7.85, 17.2],
  figure: [17.2, 27.6],
  past: [27.6, 34.8],
  bell: [34.8, 42.5],
  pause: [42.5, 47.2],
  crowd: [47.2, 53.0],
  dawn: [53.0, 56.7],
  driver: [56.7, 64.2],
  twist: [64.2, 71.2],
  end: [71.2, 76.2],
} as const;
const sceneOp = (f: number, [a, b]: readonly [number, number], fade = 8) =>
  Math.min(prog(f, F(a) - fade, F(a)), 1 - prog(f, F(b) - fade, F(b)));

// =============================================================================
// PARTS
// =============================================================================
// the railway cutting: steep walls, tracks to a tunnel mouth, the red light above
const Cutting: React.FC<{ f: number; lamp?: number; dusk?: number }> = ({ f, lamp = 1, dusk = 0 }) => (
  <g>
    <rect x={0} y={0} width={1080} height={1920} fill={dusk ? '#1a1220' : '#06080e'} />
    {/* walls */}
    <path d={`M 0 0 L 360 0 L 470 820 L 380 ${GROUND} L 0 ${GROUND} Z`} fill="#0c0f14" />
    <path d={`M 1080 0 L 720 0 L 610 820 L 700 ${GROUND} L 1080 ${GROUND} Z`} fill="#0c0f14" />
    {/* tunnel mouth */}
    <path d="M 460 880 L 460 760 Q 540 680 620 760 L 620 880 Z" fill="#000000" />
    <path d="M 440 890 L 440 750 Q 540 650 640 750 L 640 890" fill="none" stroke="#1c2028" strokeWidth={14} />
    {/* the red danger light */}
    <g transform="translate(540 640)">
      <rect x={-6} y={0} width={12} height={60} fill="#1c2028" />
      <circle r={110} fill={RED} opacity={0.12 * lamp * (0.85 + 0.15 * Math.sin(f * 0.2))} />
      <circle r={16} fill={RED} opacity={lamp} />
    </g>
    {/* tracks */}
    <path d={`M 520 880 L 330 ${GROUND} M 560 880 L 750 ${GROUND}`} stroke="#3a3e48" strokeWidth={6} />
    {Array.from({ length: 9 }, (_, i) => {
      const k = i / 8;
      const y = 890 + (GROUND - 890) * k * k;
      const w = 40 + 420 * k * k;
      return <rect key={i} x={540 - w / 2} y={y} width={w} height={4 + 8 * k} fill="#2a2018" />;
    })}
  </g>
);

const Spectre: React.FC<{ x: number; y: number; s?: number; f: number; op?: number; color?: string }> = ({ x, y, s = 1, f, op = 1, color = GHOST }) => {
  const wave = Math.sin(f * 0.35);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op} fill={color}>
      <circle r={90} cy={-200} fill={color} opacity={0.12} />
      <circle cx={0} cy={-300} r={32} />
      <path d="M -46 -262 Q 0 -280 46 -262 L 70 0 L -70 0 Z" opacity={0.9} />
      {/* arm over the face */}
      <path d="M 30 -250 L -10 -300 L -40 -300 L -40 -284 L -16 -284 L 20 -232 Z" />
      {/* the waving arm */}
      <g transform={`translate(-40 -250) rotate(${150 + 25 * wave})`}>
        <rect x={-10} y={0} width={20} height={130} rx={10} />
      </g>
    </g>
  );
};

const Person: React.FC<{ x: number; y: number; s?: number; lamp?: number; look?: number; flip?: boolean; cap?: boolean }> = ({ x, y, s = 1, lamp = 0, look = 0, flip, cap }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill={INK}>
    <circle cx={0} cy={-300} r={34} />
    {cap ? <path d="M -40 -320 L 40 -320 L 46 -306 L -40 -306 Z M -30 -320 L -30 -340 L 30 -340 L 30 -320 Z" /> : null}
    <path d="M -48 -262 Q 0 -280 48 -262 L 62 -110 L -62 -110 Z" />
    <rect x={-40} y={-112} width={26} height={112} rx={10} />
    <rect x={14} y={-112} width={26} height={112} rx={10} />
    {look > 0 ? (
      <g>
        <circle cx={-12} cy={-306} r={4} fill={PALE} opacity={look} />
        <circle cx={12} cy={-306} r={4} fill={PALE} opacity={look} />
      </g>
    ) : null}
    {lamp > 0 ? (
      <g>
        <circle cx={70} cy={-150} r={70} fill={GOLD} opacity={0.18 * lamp} />
        <rect x={58} y={-170} width={24} height={34} rx={6} fill={GOLD} opacity={lamp} />
      </g>
    ) : null}
  </g>
);

const Engine: React.FC<{ x: number; f: number; lamp?: number }> = ({ x, f, lamp = 1 }) => (
  <g transform={`translate(${x} ${GROUND})`} fill="#0a0c10">
    <rect x={-260} y={-300} width={420} height={240} rx={10} />
    <rect x={160} y={-380} width={140} height={320} />
    <rect x={-200} y={-380} width={50} height={90} />
    {[-200, -60, 80].map((wx) => <circle key={wx} cx={wx} cy={-50} r={50} fill="#14171c" stroke="#2a2e36" strokeWidth={6} />)}
    <circle cx={-270} cy={-220} r={26} fill={GOLD} opacity={lamp} />
    <path d={`M -280 -220 L -1080 -420 L -1080 -40 Z`} fill={GOLD} opacity={0.12 * lamp} />
    {/* steam */}
    {[0, 1, 2].map((k) => (
      <circle key={k} cx={-175 + 20 * k} cy={-420 - ((f * 2 + k * 40) % 120)} r={30 + k * 8} fill="#3a3e48" opacity={0.3} />
    ))}
  </g>
);

// =============================================================================
const Tale10SignalMan: React.FC = () => {
  const f = useCurrentFrame();

  const loopBack = prog(f, F(74.6), F(76.0));
  const hookOp = Math.max(1 - prog(f, F(S.hook[1]) - 10, F(S.hook[1])), loopBack, sceneOp(f, S.end));
  const titleOp = Math.max(1 - prog(f, F(7.2), F(7.85)), loopBack);

  const label = (text: string, at: number, op: number, color = PALE, y = 470, x = 540, size = 60) => (
    <text x={x} y={y} fill={color} fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={size} textAnchor="middle" opacity={op * prog(f, F(at), F(at) + 5)}>
      {text}
    </text>
  );
  const push = (a: number, b: number, amt = 0.12) => 1 + amt * EASE(prog(f, F(a), F(b)));
  const pushT = (k: number, cx = 540, cy = 1000) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

  const descend = EASE(prog(f, F(8.0), F(10.5)));
  const look = prog(f, F(14.6), F(15.2));
  const spectreIn = prog(f, F(19.7), F(20.6));
  const crash = prog(f, F(29.6), F(29.8)) * (1 - prog(f, F(30.0), F(30.9)));
  const ring = prog(f, F(36.4), F(36.6)) * (1 - prog(f, F(38.6), F(39.2)));
  const shout = prog(f, F(60.2), F(60.4));
  const engineX = 1500 - 900 * EASE(prog(f, F(56.8), F(60.6)));
  const gesture = prog(f, F(65.4), F(66.0));
  const match = prog(f, F(68.6), F(69.2));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {/* ---------- HOOK / END: the spectre under the red light ---------- */}
        <g opacity={hookOp}>
          <Cutting f={f} />
          <Spectre x={540} y={GROUND - 40} s={0.55} f={f} />
          {label('LOOK OUT', 73.2, sceneOp(f, S.end) * (1 - loopBack), RED, 470, 540, 70)}
        </g>

        {/* ---------- THE CUTTING: down to the signal box ---------- */}
        <g opacity={sceneOp(f, S.cutting)} transform={`translate(0 ${-300 * (1 - descend)})`}>
          <Cutting f={f} />
          <g transform={`translate(800 ${GROUND})`}>
            <rect x={-80} y={-300} width={200} height={300} fill="#14100c" />
            <rect x={-50} y={-250} width={140} height={80} fill={GOLD} opacity={0.6} />
            <path d="M -100 -300 L 20 -360 L 140 -300 Z" fill="#14100c" />
          </g>
          <Person x={640} y={GROUND} s={0.8} lamp={1} look={look} flip />
          {label('A DEEP RAILWAY CUTTING', 9.3, 1 - prog(f, F(13.3), F(13.5)), PALE, 360, 540, 52)}
          {label("HE'S SEEN ME BEFORE", 15.0, 1, GOLD, 360, 540, 56)}
        </g>

        {/* ---------- THE FIGURE UNDER THE LIGHT ---------- */}
        <g opacity={sceneOp(f, S.figure)} transform={pushT(push(19.6, 27.4, 0.35), 540, 700)}>
          <Cutting f={f} />
          <Spectre x={540} y={GROUND - 40} s={0.55} f={f} op={spectreIn} />
          {label('ONE ARM OVER ITS FACE', 22.3, 1 - prog(f, F(25.2), F(25.4)), GHOST, 330, 540, 50)}
          {label('HALLOA! BELOW THERE!', 25.4, 1, RED, 330, 540, 58)}
        </g>

        {/* ---------- THE PAST: the crash, the bride ---------- */}
        <g opacity={sceneOp(f, S.past)}>
          <Cutting f={f} lamp={0.6} />
          <circle cx={540} cy={800} r={120 + 500 * crash} fill={GOLD} opacity={0.7 * crash} />
          <g opacity={prog(f, F(31.2), F(31.6))}>
            <rect x={240} y={560} width={600} height={360} rx={20} fill="#140e12" stroke="#3a2a30" strokeWidth={8} />
            <rect x={300} y={610} width={480} height={240} fill="#2a1e2a" />
            <g transform="translate(540 850)">
              <circle cx={0} cy={-150} r={34} fill={INK} />
              <path d="M -30 -180 Q -80 -100 -70 0 L -40 0 Q -50 -100 0 -176 Z" fill="#cfc6b8" opacity={0.9} />
              <path d="M -44 -112 Q 0 -130 44 -112 L 60 0 L -60 0 Z" fill={INK} />
            </g>
          </g>
          {label('FIRST: A CRASH', 28.5, 1 - prog(f, F(31.1), F(31.3)), GOLD, 360)}
          {label('SECOND: A BRIDE', 31.3, 1, GHOST, 360)}
        </g>

        {/* ---------- THE BELL THAT NEVER RINGS ---------- */}
        <g opacity={sceneOp(f, S.bell)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#1a140e" />
          <rect x={120} y={500} width={300} height={200} fill="#0a0c14" stroke="#3a2a1a" strokeWidth={8} />
          <circle cx={270} cy={600} r={14} fill={RED} opacity={0.8} />
          <g transform={`translate(760 640) rotate(${ring * 14 * Math.sin(f * 2.5)})`}>
            <path d="M -70 60 Q -70 -60 0 -70 Q 70 -60 70 60 Z" fill="#c9a24a" />
            <circle cy={70} r={14} fill="#8a6a2a" />
          </g>
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M ${860 + k * 30} ${560 - k * 10} Q ${890 + k * 30} 640 ${860 + k * 30} ${720 + k * 10}`} stroke={GOLD} strokeWidth={5} fill="none" opacity={ring} />
          ))}
          <Person x={420} y={GROUND} s={1.0} look={1} lamp={0.6} />
          {label('A BELL THAT NEVER RINGS', 37.4, 1 - prog(f, F(39.3), F(39.5)), GOLD, 360, 540, 52)}
          {label('WARNING HIM OF WHAT?', 39.5, 1, PALE, 360, 540, 54)}
        </g>

        {/* ---------- PAUSE ---------- */}
        <g opacity={sceneOp(f, S.pause)} transform={pushT(push(42.5, 47.0, 0.45), 540, 700)}>
          <Cutting f={f} />
          <Spectre x={540} y={GROUND - 40} s={0.55} f={f} />
        </g>

        {/* ---------- THE CROWD AT THE TUNNEL ---------- */}
        <g opacity={sceneOp(f, S.crowd)}>
          <Cutting f={f} dusk={1} />
          {[300, 400, 690, 790].map((x, i) => <Person key={x} x={x} y={GROUND} s={0.75} lamp={i % 2} flip={x > 540} />)}
          <path d="M 440 1240 Q 540 1200 650 1240 L 650 1262 L 440 1262 Z" fill="#2a2420" />
          {label('A CROWD AT THE TUNNEL', 49.8, 1, PALE, 360, 540, 54)}
        </g>

        {/* ---------- STRUCK AT DAWN ---------- */}
        <g opacity={sceneOp(f, S.dawn)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#2a1a24" />
          <rect x={0} y={GROUND - 60} width={1080} height={60} fill="#3a2e30" />
          <Engine x={700} f={f} lamp={0.5} />
          {label('THE SIGNAL-MAN', 53.3, 1, PALE, 380)}
          {label('STRUCK AT DAWN', 54.7, 1, RED, 460)}
        </g>

        {/* ---------- THE DRIVER'S STORY ---------- */}
        <g opacity={sceneOp(f, S.driver)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#1a1622" />
          <rect x={0} y={GROUND - 30} width={1080} height={30} fill="#3a3e48" />
          <Engine x={engineX} f={f} />
          <Person x={200} y={GROUND} s={0.8} lamp={1} />
          {label('BELOW THERE!', 60.3, 1 - prog(f, F(61.0), F(61.1)), RED, 400, 540, 70)}
          {label('LOOK OUT!', 61.1, 1 - prog(f, F(61.9), F(62.0)), RED, 400, 540, 80)}
          {label('CLEAR THE WAY!', 62.0, 1, RED, 400, 540, 70)}
          <rect x={0} y={0} width={1080} height={1920} fill="#ffffff" opacity={0.14 * shout * (1 - prog(f, F(60.5), F(61.2)))} />
        </g>

        {/* ---------- THE GESTURE ---------- */}
        <g opacity={sceneOp(f, S.twist)} transform={pushT(push(68.6, 71.0, 0.1), 540, 1000)}>
          <rect x={0} y={0} width={1080} height={1920} fill="#34303e" />
          <rect x={0} y={GROUND} width={1080} height={660} fill="#0a0a10" />
          {/* the driver, making the gesture */}
          <g transform={`translate(${-230 * match} 0)`}>
            <Spectre x={540} y={GROUND} s={1.1} f={f} color={INK} op={gesture} />
            <Person x={540} y={GROUND} s={1.1} cap />
          </g>
          {/* the ghost, side by side */}
          <g opacity={match}>
            <Spectre x={770} y={GROUND} s={1.1} f={f} />
          </g>
          <rect x={0} y={0} width={1080} height={1920} fill="#0a0a10" opacity={0} />
          {label('ONE ARM OVER HIS EYES', 66.3, 1 - prog(f, F(68.5), F(68.6)), PALE, 360, 540, 54)}
          {label('EXACTLY LIKE THE GHOST', 68.7, 1, GHOST, 360, 540, 56)}
        </g>
        {/* hide the driver body once the gesture is drawn, so only the gesture silhouette shows */}
      </svg>

      {/* title card on the hook / loop */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', opacity: titleOp }}>
        <div style={{ fontFamily: FONT_EDITORIAL, fontWeight: 900, fontSize: 96, color: PALE, letterSpacing: 3, textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>THE SIGNAL-MAN</div>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: PALE, opacity: 0.8, letterSpacing: 8 }}>CHARLES DICKENS</div>
      </div>

      <Sequence from={F(42.75)} durationInFrames={F(4.4)}>
        <PauseCard title="PAUSE" subtitle="a ghost is warning you. of what?" durSec={4.4} accent={RED} y={1080} />
      </Sequence>

      <Captions lines={VO} y={1480} accent={GOLD} />
      <ProgressBar color={RED} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: '#8b8fa5', opacity: 0.7 }}>
        retold from Charles Dickens, 1866
      </div>
    </AbsoluteFill>
  );
};

export default Tale10SignalMan;
