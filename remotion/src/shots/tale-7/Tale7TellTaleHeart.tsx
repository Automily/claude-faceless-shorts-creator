import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { Captions, PauseCard, ProgressBar, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_EDITORIAL, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Candlelit Tales #7: The Tell-Tale Heart (Poe, 1843), told by the narrator
// Signature: the pale vulture eye, and the heartbeat that grows until it shakes the frame.
// =============================================================================
export const compositionConfig = {
  id: 'Tale7TellTaleHeart',
  durationInSeconds: 80.2,
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

const S = {
  hook: [0, 4.8],
  man: [4.8, 8.3],
  eye: [8.3, 13.15],
  midnight: [13.15, 20.95],
  eighth: [20.95, 28.3],
  heart: [28.3, 40.9],
  pause: [40.9, 45.0],
  floor: [45.0, 51.7],
  knock: [51.7, 59.5],
  chairs: [59.5, 66.1],
  climax: [66.1, 75.6],
  end: [75.6, 80.2],
} as const;
const sceneOp = (f: number, [a, b]: readonly [number, number], fade = 8) =>
  Math.min(prog(f, F(a) - fade, F(a)), 1 - prog(f, F(b) - fade, F(b)));

// heartbeat: double-thump pulses with a period shrinking from p0 to p1 across [a, b]
const beat = (t: number, a: number, b: number, p0: number, p1: number) => {
  if (t < a || t > b) return 0;
  // integrate phase with linearly changing period
  let phase = 0;
  const steps = 60;
  const dt = (t - a) / steps;
  for (let i = 0; i < steps; i++) {
    const tt = a + i * dt;
    const p = p0 + (p1 - p0) * ((tt - a) / (b - a));
    phase += dt / p;
  }
  const fr = phase % 1;
  const thump = (x: number, c: number) => Math.max(0, 1 - Math.abs(x - c) / 0.07);
  return Math.max(thump(fr, 0.05), 0.7 * thump(fr, 0.22));
};

// =============================================================================
// PARTS
// =============================================================================
const Eye: React.FC<{ x: number; y: number; s?: number; open?: number; lit?: number }> = ({ x, y, s = 1, open = 1, lit = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={lit}>
    <path d={`M -300 0 Q 0 ${-210 * open} 300 0 Q 0 ${210 * open} -300 0 Z`} fill="#e8e2d6" />
    <clipPath id="eyeclip">
      <path d={`M -300 0 Q 0 ${-210 * open} 300 0 Q 0 ${210 * open} -300 0 Z`} />
    </clipPath>
    <g clipPath="url(#eyeclip)">
      <circle r={120} fill="#8fb6d6" />
      <circle r={120} fill="none" stroke="#5f86a8" strokeWidth={14} />
      <circle r={48} fill="#1a2430" />
      {/* the film */}
      <circle r={120} fill="#dfe6ea" opacity={0.55} />
      <circle cx={-38} cy={-40} r={18} fill="#ffffff" opacity={0.8} />
      {/* veins */}
      {[-1, 1].map((k) => (
        <path key={k} d={`M ${280 * k} ${-20} Q ${200 * k} ${-50} ${140 * k} ${-30} M ${270 * k} 30 Q ${210 * k} 50 ${150 * k} 40`} stroke="#c06070" strokeWidth={4} fill="none" opacity={0.6} />
      ))}
    </g>
    <path d={`M -300 0 Q 0 ${-210 * open} 300 0`} fill="none" stroke="#2a1a14" strokeWidth={14} />
  </g>
);

const Profile: React.FC<{ x: number; y: number; s?: number; smile?: number }> = ({ x, y, s = 1, smile = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={INK}>
    {/* head in profile, facing right */}
    <path d="M -120 -300 Q -150 -460 0 -500 Q 130 -500 150 -380 L 170 -330 L 150 -320 L 160 -290 Q 150 -270 140 -260 L 150 -240 Q 120 -200 70 -200 L 60 -120 L 160 -80 Q 220 -40 230 0 L -250 0 Q -240 -80 -120 -120 Z" />
    <path d={`M 120 -258 Q 135 ${-262 + 10 * smile} 148 ${-262 - 4 * smile}`} stroke={GOLD} strokeWidth={4} fill="none" opacity={smile} />
  </g>
);

const Bed: React.FC<{ x: number; sit?: number }> = ({ x, sit = 0 }) => (
  <g transform={`translate(${x} ${GROUND})`} fill={INK}>
    <rect x={-260} y={-180} width={30} height={180} rx={6} />
    <rect x={230} y={-120} width={30} height={120} rx={6} />
    <rect x={-260} y={-110} width={520} height={50} rx={10} />
    <ellipse cx={40} cy={-120} rx={200} ry={28} />
    {/* the old man: lying -> sitting up */}
    <g transform={`translate(-170 -130) rotate(${-80 * sit})`}>
      <rect x={-10} y={-30} width={160} height={60} rx={28} />
      <circle cx={-30} cy={0} r={34} />
    </g>
  </g>
);

const Officer: React.FC<{ x: number; y?: number; s?: number; seated?: boolean }> = ({ x, y = GROUND, s = 1, seated }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={INK}>
    <circle cx={0} cy={seated ? -230 : -300} r={34} />
    <path d={`M -44 ${seated ? -250 : -320} L 44 ${seated ? -250 : -320} L 34 ${seated ? -280 : -350} L -34 ${seated ? -280 : -350} Z`} />
    <rect x={-50} y={seated ? -258 : -328} width={100} height={10} rx={4} />
    <path d={`M -50 ${seated ? -194 : -262} L 50 ${seated ? -194 : -262} L 62 ${seated ? -60 : -110} L -62 ${seated ? -60 : -110} Z`} />
    {[5, 15].map((b) => <circle key={b} cx={0} cy={(seated ? -180 : -250) + b * 6} r={5} fill={GOLD} opacity={0.7} />)}
    {seated ? <rect x={-60} y={-70} width={130} height={22} /> : <><rect x={-40} y={-112} width={26} height={112} rx={10} /><rect x={14} y={-112} width={26} height={112} rx={10} /></>}
  </g>
);

const Chair: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} ${GROUND})`} fill="#1a120c">
    <rect x={-60} y={-130} width={120} height={16} />
    <rect x={-60} y={-130} width={12} height={130} />
    <rect x={48} y={-130} width={12} height={130} />
    <rect x={48} y={-300} width={12} height={170} />
  </g>
);

// =============================================================================
const Tale7TellTaleHeart: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;

  const loopBack = prog(f, F(78.7), F(80.0));
  const hookOp = Math.max(1 - prog(f, F(S.hook[1]) - 10, F(S.hook[1])), loopBack, sceneOp(f, S.end));
  const titleOp = Math.max(1 - prog(f, F(4.2), F(4.8)), loopBack);

  // the heart: first hearing (28.3–40.9), and the climax (64–75.6)
  const hb = Math.max(beat(t, 29.4, 38.6, 0.9, 0.45), beat(t, 64.4, 75.4, 0.85, 0.32));
  const hbAmp = t < 45 ? 0.5 + 0.5 * prog(f, F(29.4), F(38.4)) : 0.4 + 0.6 * prog(f, F(66.2), F(74.0));
  const pulse = hb * hbAmp;
  const shake = t > 66 && t < 75.6 ? pulse * 14 : t > 33 && t < 39.5 ? pulse * 6 : 0;
  const flash = prog(f, F(38.45), F(38.55)) * (1 - prog(f, F(38.6), F(39.3)));

  const label = (text: string, at: number, op: number, color = PALE, y = 470, x = 540, size = 62) => (
    <text x={x} y={y} fill={color} fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={size} textAnchor="middle" opacity={op * prog(f, F(at), F(at) + 5)}>
      {text}
    </text>
  );
  const push = (a: number, b: number, amt = 0.12) => 1 + amt * EASE(prog(f, F(a), F(b)));
  const pushT = (k: number, cx = 540, cy = 1000) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

  const doorOpen = EASE(prog(f, F(14.6), F(17.6)));
  const ray = prog(f, F(17.9), F(18.6));
  const slip = prog(f, F(23.95), F(24.1)) * (1 - prog(f, F(24.3), F(24.7)));
  const sit = EASE(prog(f, F(25.2), F(25.9)));
  const planks = EASE(prog(f, F(46.2), F(46.8))) * (1 - EASE(prog(f, F(47.6), F(48.4))));
  const knock = prog(f, F(52.95), F(53.05)) * (1 - prog(f, F(53.1), F(53.4)));
  const ringing = prog(f, F(64.4), F(65.0));
  const smile = Math.max(prog(f, F(56.5), F(57.0)) * (1 - prog(f, F(59.4), F(59.6))), 0);

  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #07060a 0%, #1a1008 70%, #1a1008 100%)' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${shake * Math.sin(f * 3.1)} ${shake * Math.cos(f * 2.3)})`}>
          {/* ---------- HOOK / END: calm narrator, one candle ---------- */}
          <g opacity={hookOp}>
            <circle cx={760} cy={GROUND - 260} r={260} fill={GOLD} opacity={0.12} />
            <rect x={750} y={GROUND - 240} width={20} height={80} fill="#efe3c8" />
            <ellipse cx={760} cy={GROUND - 262} rx={10} ry={22} fill={GOLD} />
            <Profile x={380} y={GROUND} s={1.4} smile={1} />
            {label("I'M NOT MAD", 76.9, sceneOp(f, S.end) * (1 - loopBack), PALE, 470)}
          </g>

          {/* ---------- THE OLD MAN ---------- */}
          <g opacity={sceneOp(f, S.man)}>
            <rect x={0} y={0} width={1080} height={1920} fill="#2a1d14" />
            <Bed x={540} />
            {label('I LOVED THE OLD MAN', 5.1, 1, PALE)}
          </g>

          {/* ---------- THE EYE ---------- */}
          <g opacity={sceneOp(f, S.eye)} transform={pushT(push(8.3, 13.0, 0.25), 540, 960)}>
            <rect x={0} y={0} width={1080} height={1920} fill="#0a0808" />
            <Eye x={540} y={960} s={1.4} open={0.9 + 0.1 * Math.sin(f * 0.07)} />
            {label('LIKE A VULTURE', 11.6, 1, '#9fb4c6', 540)}
          </g>

          {/* ---------- MIDNIGHT: the door, the ray ---------- */}
          <g opacity={sceneOp(f, S.midnight)}>
            <rect x={0} y={0} width={1080} height={1920} fill="#040304" />
            {/* the room beyond the door is black; a single ray lands on the eye */}
            <g opacity={ray}>
              <path d={`M 120 1000 L 760 890 L 760 930 Z`} fill={GOLD} opacity={0.35} />
              <g transform="translate(780 910)">
                <Eye x={0} y={0} s={0.35} open={1} />
              </g>
            </g>
            {/* the door, opening toward us */}
            <rect x={0} y={0} width={Math.max(0, 1080 - 1000 * doorOpen)} height={1920} fill="#1a120c" />
            <rect x={Math.max(0, 1080 - 1000 * doorOpen) - 10} y={0} width={10} height={1920} fill="#2a1a10" />
            {label('MIDNIGHT', 13.3, 1 - prog(f, F(16.0), F(16.2)), PALE, 360)}
            {label('SO SLOWLY', 16.8, 1 - prog(f, F(18.6), F(18.8)), PALE, 360)}
          </g>

          {/* ---------- THE EIGHTH NIGHT ---------- */}
          <g opacity={sceneOp(f, S.eighth)}>
            <rect x={0} y={0} width={1080} height={1920} fill="#2a1d14" />
            <g transform="translate(540 380)">
              {Array.from({ length: 8 }, (_, i) => (
                <rect key={i} x={-280 + i * 72} y={-50} width={14} height={100} fill={i === 7 ? '#ff8a8a' : PALE} opacity={prog(f, F(21.0) + i * 3, F(21.0) + i * 3 + 3)} transform={i === 4 ? 'rotate(0)' : undefined} />
              ))}
            </g>
            <Bed x={540} sit={sit} />
            <text x={540} y={700} fill={PALE} fontFamily={FONT_MONO} fontWeight={700} fontSize={56} textAnchor="middle" opacity={slip}>click.</text>
            {label("WHO'S THERE?", 26.8, 1, '#ff8a8a', 560)}
          </g>

          {/* ---------- THE HEART ---------- */}
          <g opacity={sceneOp(f, S.heart)}>
            <rect x={0} y={0} width={1080} height={1920} fill="#040203" />
            <circle cx={540} cy={900} r={120 + 220 * pulse} fill={BLOOD} opacity={0.18 + 0.4 * pulse} />
            <circle cx={540} cy={900} r={60 + 80 * pulse} fill={BLOOD} opacity={0.6 * pulse + 0.1} />
            {[0, 1, 2].map((k) => (
              <circle key={k} cx={540} cy={900} r={200 + 120 * k + 160 * pulse} fill="none" stroke={BLOOD} strokeWidth={4} opacity={0.4 * pulse} />
            ))}
            {label('LIKE A WATCH IN COTTON', 31.2, 1 - prog(f, F(33.2), F(33.4)), '#9fb4c6', 470, 540, 52)}
            {label('HIS HEART', 33.4, 1 - prog(f, F(34.3), F(34.4)), '#ff8a8a', 470)}
            {label('LOUDER', 34.4, 1 - prog(f, F(35.0), F(35.1)), '#ff8a8a', 470, 540, 80)}
            {label('LOUDER', 35.1, 1 - prog(f, F(37.6), F(37.7)), '#ff8a8a', 470, 540, 120)}
          </g>
          <rect x={0} y={0} width={1080} height={1920} fill="#ffffff" opacity={0.8 * flash} />

          {/* ---------- PAUSE: it's done ---------- */}
          <g opacity={sceneOp(f, S.pause)}>
            <rect x={0} y={0} width={1080} height={1920} fill="#2a1d14" />
            <Bed x={540} sit={0} />
            <g transform={`translate(260 ${GROUND - 20}) rotate(80)`}>
              <rect x={-20} y={-40} width={40} height={60} rx={6} fill="#3a2a1a" />
            </g>
          </g>

          {/* ---------- UNDER THE FLOOR ---------- */}
          <g opacity={sceneOp(f, S.floor)}>
            <rect x={0} y={0} width={1080} height={1920} fill="#0a0705" />
            {Array.from({ length: 7 }, (_, i) => {
              const lifted = i >= 2 && i <= 4 ? planks : 0;
              return (
                <g key={i} transform={`translate(${60 + i * 140} ${900 - 160 * lifted}) rotate(${-14 * lifted * (i - 3)})`}>
                  <rect x={0} y={0} width={130} height={360} rx={6} fill="#3a2614" stroke="#5a3a1e" strokeWidth={4} />
                  <circle cx={20} cy={20} r={5} fill="#1a120c" />
                  <circle cx={110} cy={340} r={5} fill="#1a120c" />
                </g>
              );
            })}
            <rect x={340} y={900} width={400} height={360} fill="#050303" opacity={planks} />
            {label('THREE PLANKS', 46.2, 1 - prog(f, F(48.9), F(49.1)), PALE)}
            {label('NO EYE COULD FIND IT', 49.2, 1, GOLD, 470, 540, 54)}
          </g>

          {/* ---------- 4 AM: THE OFFICERS ---------- */}
          <g opacity={sceneOp(f, S.knock)}>
            <rect x={0} y={0} width={1080} height={1920} fill="#2e2016" />
            <g transform={`translate(${knock * 8} 0)`}>
              <rect x={60} y={GROUND - 640} width={300} height={640} fill="#1a120c" stroke="#2c1d12" strokeWidth={6} />
            </g>
            <text x={540} y={560} fill={PALE} fontFamily={FONT_EDITORIAL} fontWeight={900} fontSize={80} textAnchor="middle" opacity={knock}>KNOCK</text>
            <g opacity={prog(f, F(53.7), F(54.3))}>
              {[480, 620, 760].map((x) => <Officer key={x} x={x} s={0.95} />)}
            </g>
            <Profile x={150} y={GROUND} s={0.85} smile={smile} />
            {label('4 A.M.', 51.9, 1 - prog(f, F(55.4), F(55.6)), PALE)}
            {label('COME IN. SEARCH.', 57.2, 1, GOLD)}
          </g>

          {/* ---------- THE CHAIRS ---------- */}
          <g opacity={sceneOp(f, S.chairs)}>
            <rect x={0} y={0} width={1080} height={1920} fill="#2e2016" />
            <rect x={340} y={GROUND - 6} width={400} height={8} fill={BLOOD} opacity={0.25 + 0.3 * ringing} />
            <Chair x={300} />
            <Chair x={780} />
            <Officer x={300} s={0.9} seated />
            <Officer x={780} s={0.9} seated />
            <Officer x={920} s={0.9} />
            <Chair x={540} />
            <Profile x={540} y={GROUND - 90} s={0.7} smile={1 - ringing} />
            {[0, 1, 2].map((k) => (
              <circle key={k} cx={560} cy={GROUND - 420} r={60 + 40 * k + 20 * Math.sin(f * 0.6 + k)} fill="none" stroke={PALE} strokeWidth={3} opacity={0.5 * ringing} />
            ))}
            {label('RIGHT OVER THE SPOT', 61.9, 1 - prog(f, F(64.2), F(64.4)), '#ff8a8a', 470, 540, 54)}
            {label('A RINGING', 64.4, 1, PALE)}
          </g>

          {/* ---------- CLIMAX ---------- */}
          <g opacity={sceneOp(f, S.climax)}>
            <rect x={0} y={0} width={1080} height={1920} fill="#2a1414" />
            <rect x={340} y={GROUND - 30} width={400} height={60} fill={BLOOD} opacity={0.3 + 0.7 * pulse} />
            <circle cx={540} cy={GROUND} r={150 + 300 * pulse} fill={BLOOD} opacity={0.25 * pulse} />
            <Officer x={250} s={0.9} seated />
            <Officer x={830} s={0.9} seated />
            <Officer x={960} s={0.9} />
            <g transform={`translate(540 ${GROUND - 90}) rotate(${-6 * prog(f, F(71.3), F(71.6))}) translate(-540 ${-(GROUND - 90)})`}>
              <Profile x={540} y={GROUND - 90} s={0.7} />
            </g>
            {label('LOUDER', 68.5, 1 - prog(f, F(70.1), F(70.2)), '#ff8a8a', 470, 540, 90)}
            {label("THEY'RE MOCKING ME", 70.2, 1 - prog(f, F(71.2), F(71.3)), '#ff8a8a', 470, 540, 64)}
            {label('TEAR UP THE PLANKS!', 71.3, 1 - prog(f, F(72.8), F(72.9)), PALE, 470, 540, 64)}
            {label('HIS HIDEOUS HEART', 72.9, 1, BLOOD, 470, 540, 74)}
          </g>
        </g>
      </svg>

      {/* title card on the hook / loop */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', opacity: titleOp }}>
        <div style={{ fontFamily: FONT_EDITORIAL, fontWeight: 900, fontSize: 86, color: PALE, letterSpacing: 3, textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>THE TELL-TALE</div>
        <div style={{ fontFamily: FONT_EDITORIAL, fontWeight: 900, fontSize: 86, color: BLOOD, letterSpacing: 3, textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>HEART</div>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: PALE, opacity: 0.8, letterSpacing: 8 }}>EDGAR ALLAN POE</div>
      </div>

      <Sequence from={F(41.0)} durationInFrames={F(4.0)}>
        <PauseCard title="PAUSE" subtitle="it's done. where do you hide him?" durSec={4.0} accent={GOLD} y={360} />
      </Sequence>

      <Captions lines={VO} y={1480} accent={GOLD} />
      <ProgressBar color={BLOOD} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: '#8b8fa5', opacity: 0.7 }}>
        retold from Edgar Allan Poe, 1843
      </div>
    </AbsoluteFill>
  );
};

export default Tale7TellTaleHeart;
