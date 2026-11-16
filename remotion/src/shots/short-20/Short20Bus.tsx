import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Feels Wrong: why your bus is always late (inspection paradox)
// =============================================================================
export const compositionConfig = {
  id: 'Short20Bus',
  durationInSeconds: 41.6,
  fps: 30,
  width: 1080,
  height: 1920,
};

const TEAL = '#4db8a8';
const GOLD = '#f5d76e';
const RED = '#ef5f6b';
const VIOLET = '#b79be0';
const MUTED = '#8b96a5';
const INK = '#0f1020';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// THE MATH: real gaps 2,27,1,20,2,8 (sum 60, mean 10). A rider arriving at a random minute waits
// E[g²]/(2E[g]) = 10.0 min; evenly spaced buses give 5.0. Riders in the 27 + 20 gaps: 47/60 = 78%.
// Classes of 10 and 50: school average 30; average class a STUDENT is in = (10²+50²)/60 = 43.
const GAPS = [2, 27, 1, 20, 2, 8];
const REAL_T = GAPS.reduce<number[]>((acc, g) => [...acc, acc[acc.length - 1] + g], [0]); // 0,2,29,30,50,52,60
const EVEN_T = [0, 10, 20, 30, 40, 50, 60];
const LONG = [1, 3]; // gap indices that are long
const gapOf = (m: number) => {
  for (let i = 0; i < GAPS.length; i++) if (m < REAL_T[i + 1]) return i;
  return GAPS.length - 1;
};

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(5.8);
const SETUP = F(6.0);
const EVEN_WAIT = F(7.7); // "you'd wait five minutes" @ 7.71
const REAL_IN = F(10.2); // "But real buses bunch up." @ 10.20–11.5
const BUNCH_IN = F(11.0);
const BUNCH_OUT = F(11.6);
const GAPLBL_IN = F(12.6); // "one minute, some are twenty-seven" @ 12.62–14.0
const PAUSE_FROM = F(15.1); // "Pause." @ 15.20
const PAUSE_DUR = F(3.4);
const LONG_GLOW = F(18.8); // "The long one." @ 18.82
const RIDERS_GOLD = F(20.7); // "catches more people" @ 20.72–21.6
const SHARE_IN = F(23.3); // "four out of five riders" @ 23.34
const WAIT10_IN = F(28.4); // "but you wait the full ten" @ 28.23–29.4
const CLASS_IN = F(30.6); // "Same trick with class sizes." @ 30.60
const SCHOOL_IN = F(31.3);
const STUDENT_IN = F(34.3); // "...look way bigger than the school says" @ 34.35
const CLASS_OUT = F(37.0);
const LOOP = F(40.8); // after "...in the long gap." @ 40.07–40.7
const END = F(41.6);

const X0 = 120;
const PXM = 14; // px per minute
const ROW_A = 640;
const ROW_B = 1010;

const Bus: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <div
    style={{
      position: 'absolute',
      left: x - 26,
      top: y - 26,
      width: 52,
      height: 40,
      borderRadius: 8,
      background: color,
      boxShadow: `0 4px 14px rgba(0,0,0,0.5)`,
    }}
  >
    <div style={{ position: 'absolute', left: 7, right: 7, top: 7, height: 13, borderRadius: 3, background: 'rgba(15,16,32,0.75)' }} />
  </div>
);

const Chip: React.FC<{ text: string; color: string; x: number; y: number; op: number; size?: number }> = ({ text, color, x, y, op, size = 34 }) =>
  op > 0.01 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity: op,
        transform: `translateY(${(1 - op) * 12}px)`,
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: size,
        color,
        background: 'rgba(15,16,32,0.9)',
        border: `2px solid ${color}`,
        borderRadius: 12,
        padding: '4px 14px',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  ) : null;

const Short20Bus: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  // payoff state (f0 / loop) vs. the build-up
  const fromLoop = prog(f, CLASS_OUT, CLASS_OUT + 14);
  const setupOff = prog(f, SETUP, SETUP + 10); // payoff extras leave at the setup
  const pay = (on: number) => Math.max(1 - setupOff, on, fromLoop);

  const classOp = prog(f, CLASS_IN, CLASS_IN + 12) * (1 - prog(f, CLASS_OUT - 10, CLASS_OUT));
  const rowsOp = 1 - classOp;

  const rowBOp = pay(prog(f, REAL_IN, REAL_IN + 10));
  const bunch = f < SETUP ? 1 : Math.max(EASE_INOUT(prog(f, BUNCH_IN, BUNCH_OUT)), fromLoop);
  const realT = REAL_T.map((t, i) => EVEN_T[i] + (t - EVEN_T[i]) * bunch);
  const gapLbl = pay(prog(f, GAPLBL_IN, GAPLBL_IN + 10));
  const longGlow = pay(prog(f, LONG_GLOW, LONG_GLOW + 8));
  const ridersGold = pay(prog(f, RIDERS_GOLD, RIDERS_GOLD + 10));
  const shareOp = pay(prog(f, SHARE_IN, SHARE_IN + 8));
  const evenWait = pay(prog(f, EVEN_WAIT, EVEN_WAIT + 8));
  const realWait = pay(prog(f, WAIT10_IN, WAIT10_IN + 8));

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 30));

  const xOf = (m: number) => X0 + m * PXM;

  const row = (y: number, ts: number[], color: string, label: string, real: boolean, op: number) => (
    <div style={{ opacity: op }}>
      <div style={{ position: 'absolute', left: X0, top: y - 150, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 38, letterSpacing: 4, color }}>{label}</div>
      {/* the road */}
      <div style={{ position: 'absolute', left: X0, width: 60 * PXM, top: y, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.22)' }} />
      {/* long-gap glow */}
      {real
        ? LONG.map((gi) => (
            <div
              key={gi}
              style={{
                position: 'absolute',
                left: xOf(ts[gi]),
                width: (ts[gi + 1] - ts[gi]) * PXM,
                top: y - 92,
                height: 98,
                borderRadius: 10,
                background: `${GOLD}22`,
                border: `2px solid ${GOLD}`,
                opacity: longGlow,
              }}
            />
          ))
        : null}
      {/* riders: one per minute, arriving at random-ish but evenly spread times */}
      {Array.from({ length: 60 }, (_, m) => {
        const inLong = real && LONG.includes(gapOf(m + 0.5));
        const c = inLong && ridersGold > 0.5 ? GOLD : '#e8e6ff';
        const o = real && !inLong ? 1 - 0.55 * ridersGold : 0.9;
        return (
          <div
            key={m}
            style={{
              position: 'absolute',
              left: xOf(m + 0.5) - 7,
              top: y - 38 - (m % 3) * 17,
              width: 14,
              height: 14,
              borderRadius: 7,
              background: c,
              opacity: o,
            }}
          />
        );
      })}
      {ts.map((t, i) => (
        <Bus key={i} x={xOf(t)} y={y + 30} color={color} />
      ))}
      {real
        ? GAPS.map((g, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: xOf((ts[i] + ts[i + 1]) / 2) - 40,
                width: 80,
                top: y + 64,
                textAlign: 'center',
                fontFamily: FONT_MONO,
                fontWeight: 700,
                fontSize: g >= 20 ? 40 : 28,
                color: g >= 20 ? GOLD : MUTED,
                opacity: gapLbl * (g >= 20 || ts[i + 1] - ts[i] > 3 ? 1 : 0.0),
              }}
            >
              {g >= 20 ? `${g}m` : g}
            </div>
          ))
        : null}
    </div>
  );

  // the two classes for the twist
  const classGrid = (n: number, cols: number, x: number, y: number, color: string) => (
    <div style={{ position: 'absolute', left: x, top: y, width: cols * 56 }}>
      {Array.from({ length: n }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: (i % cols) * 56,
            top: Math.floor(i / cols) * 56,
            width: 42,
            height: 42,
            borderRadius: 21,
            background: color,
          }}
        />
      ))}
    </div>
  );

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#232050" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: "YOUR BUS ISN'T LATE", color: '#ffffff' },
              { text: "YOU'RE IN THE LONG GAP", color: GOLD },
            ]}
            subtitle="the inspection paradox"
            y={130}
            size={70}
            warm
          />
        </div>

        <Kicker text="A BUS EVERY 10 MINUTES" color={TEAL} y={200} at={SETUP} until={F(15.0)} />
        <Kicker text="WHERE DO RIDERS LAND?" color={GOLD} y={200} at={F(18.6)} until={F(30.4)} />
        <Kicker text="SAME TRICK: CLASS SIZES" color={VIOLET} y={200} at={CLASS_IN} until={F(37.0)} />
        <Kicker text="THE LONG GAPS CATCH YOU" color={GOLD} y={200} at={F(37.2)} until={F(40.6)} />

        <div style={{ opacity: rowsOp }}>
          {row(ROW_A, EVEN_T, TEAL, 'EVENLY SPACED', false, 1)}
          {row(ROW_B, realT, RED, 'REAL LIFE', true, rowBOp)}
          <Chip text="avg wait 5 min" color={TEAL} x={X0} y={ROW_A + 70} op={evenWait} size={42} />
          <Chip text="avg wait 10 min" color={RED} x={X0} y={ROW_B + 130} op={realWait * rowBOp} size={44} />
          <Chip text="78% of riders" color={GOLD} x={X0 + 480} y={ROW_B + 130} op={shareOp * rowBOp} size={44} />
        </div>

        {classOp > 0.01 ? (
          <div style={{ opacity: classOp }}>
            <div style={{ position: 'absolute', left: 130, top: 470, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 36, color: TEAL }}>CLASS A · 10 students</div>
            {classGrid(10, 10, 130, 525, TEAL)}
            <div style={{ position: 'absolute', left: 130, top: 620, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 36, color: VIOLET }}>CLASS B · 50 students</div>
            {classGrid(50, 10, 130, 675, VIOLET)}
            <Chip text="SCHOOL SAYS: avg 30" color={'#e6e9ee'} x={130} y={1010} op={prog(f, SCHOOL_IN, SCHOOL_IN + 8)} size={46} />
            <Chip text="STUDENTS SAY: avg 43" color={GOLD} x={130} y={1110} op={prog(f, STUDENT_IN, STUDENT_IN + 8)} size={46} />
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="which gap do you land in?" durSec={3.4} accent={GOLD} y={1150} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={GOLD} />
      <ProgressBar color={VIOLET} />
    </AbsoluteFill>
  );
};

export default Short20Bus;
