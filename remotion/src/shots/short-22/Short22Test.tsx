import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { mulberry32 } from '../../lib/prob';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Feels Wrong: a 99%-accurate test says you're sick
// =============================================================================
export const compositionConfig = {
  id: 'Short22Test',
  durationInSeconds: 39.6,
  fps: 30,
  width: 1080,
  height: 1920,
};

const GOLD = '#f5d76e';
const RED = '#ef5f6b';
const TEAL = '#4db8a8';
const VIOLET = '#b79be0';
const MUTED = '#8b96a5';
const INK = '#0f1020';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// THE MATH: 1,000 people, 1 sick (0.1%). 99% sensitivity -> the sick one tests positive.
// 1% false-positive rate on 999 healthy -> ~10 false positives. P(sick | +) = 1/11 = 9.0%.
// A second, independent positive: 9.0% -> 90.7%.
const COLS = 40;
const ROWS = 25;
const N = COLS * ROWS;
const SICK = 12 * COLS + 21;
const FALSE_POS = (() => {
  const r = mulberry32(7);
  const s = new Set<number>();
  while (s.size < 10) {
    const i = Math.floor(r() * N);
    if (i !== SICK) s.add(i);
  }
  return [...s];
})();
const FP_ORDER = new Map(FALSE_POS.map((i, k) => [i, k]));

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(4.6);
const SETUP = F(5.4);
const SICK_IN = F(6.86); // "One in a thousand" @ 6.86
const SCAN_IN = F(9.6); // "Test a thousand people." @ 9.20–10.6
const SCAN_OUT = F(11.4);
const SICK_POS = F(12.95); // "tests positive." @ 12.97
const FP_IN = F(15.4); // "...the healthy ones test positive too." @ 15.45–17.0
const FP_OUT = F(16.9);
const PAUSE_FROM = F(18.3); // "Pause." @ 18.40
const PAUSE_DUR = F(4.2);
const DIM_IN = F(22.6); // "One real positive." @ 22.60
const REAL_CHIP = F(22.9);
const FALSE_CHIP = F(24.45); // "About ten false alarms." @ 24.47
const FRAC_IN = F(27.45); // "one in eleven" @ 27.47
const PCT_IN = F(28.8); // "Nine percent." @ 28.84
const RETEST_IN = F(30.6); // "Test positive twice..." @ 30.60
const PCT91_IN = F(33.2); // "ninety-one percent" @ 33.21
const RESTORE = F(35.2); // "Rare things stay rare..."
const LOOP = F(38.4);
const END = F(39.6);

const GX = 140;
const GY = 560;
const PITCH = 19;
const DOT = 13;

const Short22Test: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  // payoff state at f0, cleared in the setup, restored for the loop
  const setupOff = prog(f, SETUP, SETUP + 10);
  const restore = prog(f, RESTORE, RESTORE + 14);
  const pay = (on: number) => Math.max(1 - setupOff, on, restore);

  const sickRed = pay(prog(f, SICK_IN, SICK_IN + 8));
  const sickPos = pay(prog(f, SICK_POS, SICK_POS + 8));
  const fpOn = (k: number) => pay(prog(f, FP_IN + (k * (FP_OUT - FP_IN)) / 10, FP_IN + (k * (FP_OUT - FP_IN)) / 10 + 6));
  const retest = prog(f, RETEST_IN, RETEST_IN + 20) * (1 - restore);
  const dim = pay(prog(f, DIM_IN, DIM_IN + 12)); // everyone who tested negative fades back
  const scanY = GY + ROWS * PITCH * prog(f, SCAN_IN, SCAN_OUT);
  const scanOp = prog(f, SCAN_IN, SCAN_IN + 4) * (1 - prog(f, SCAN_OUT - 4, SCAN_OUT));

  const realChip = pay(prog(f, REAL_CHIP, REAL_CHIP + 8));
  const falseChip = pay(prog(f, FALSE_CHIP, FALSE_CHIP + 8)) * (1 - retest);
  const fracOp = prog(f, FRAC_IN, FRAC_IN + 8) * (1 - prog(f, PCT_IN - 4, PCT_IN + 4));
  const pct9 = Math.max(1 - setupOff, prog(f, PCT_IN, PCT_IN + 8) * (1 - prog(f, RETEST_IN - 6, RETEST_IN)), prog(f, RESTORE + 2, RESTORE + 14));
  const pct91 = prog(f, PCT91_IN, PCT91_IN + 8) * (1 - prog(f, RESTORE - 8, RESTORE));

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 26));

  const dots: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const c = i % COLS;
    const r = Math.floor(i / COLS);
    const x = GX + c * PITCH;
    const y = GY + r * PITCH;
    const isSick = i === SICK;
    const fk = FP_ORDER.get(i);
    const isFP = fk !== undefined;
    let color = '#5b5e86';
    let op = 0.85 - 0.6 * dim;
    let ring = 0;
    let ringColor = GOLD;
    if (isSick) {
      color = sickRed > 0.5 ? RED : '#5b5e86';
      op = 1;
      ring = Math.max(sickPos, sickRed);
      ringColor = RED;
    } else if (isFP) {
      const on = fpOn(fk) * (1 - retest);
      color = on > 0.5 ? GOLD : '#5b5e86';
      op = on > 0.5 ? 1 : 0.85 - 0.6 * dim;
      ring = on;
    }
    dots.push(
      <div key={i} style={{ position: 'absolute', left: x, top: y, width: DOT, height: DOT, borderRadius: DOT / 2, background: color, opacity: op }} />,
    );
    if (ring > 0.01) {
      dots.push(
        <div
          key={`r${i}`}
          style={{
            position: 'absolute',
            left: x - 9,
            top: y - 9,
            width: DOT + 18,
            height: DOT + 18,
            borderRadius: (DOT + 18) / 2,
            border: `3px solid ${ringColor}`,
            opacity: ring,
            boxShadow: `0 0 16px ${ringColor}`,
          }}
        />,
      );
    }
  }

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#232050" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: '99% ACCURATE TEST: SICK', color: '#ffffff' },
              { text: "YOU'RE PROBABLY FINE", color: GOLD },
            ]}
            subtitle="the base-rate trap"
            y={130}
            size={66}
            warm
          />
        </div>

        <Kicker text="1,000 PEOPLE · 1 IS SICK" color={RED} y={200} at={SETUP} until={F(18.2)} />
        <Kicker text="COUNT THE POSITIVES" color={GOLD} y={200} at={DIM_IN} until={F(30.4)} />
        <Kicker text="TEST AGAIN" color={TEAL} y={200} at={RETEST_IN} until={F(35.0)} />
        <Kicker text="RARE STAYS RARE" color={VIOLET} y={200} at={RESTORE} until={F(38.2)} />

        {dots}

        {scanOp > 0.01 ? (
          <div style={{ position: 'absolute', left: GX - 20, width: COLS * PITCH + 26, top: scanY - 3, height: 6, borderRadius: 3, background: TEAL, boxShadow: `0 0 24px ${TEAL}`, opacity: scanOp }} />
        ) : null}

        {/* counts */}
        <div style={{ position: 'absolute', left: GX, width: COLS * PITCH, top: GY + ROWS * PITCH + 34, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 42, color: RED, opacity: realChip }}>1 REAL +</span>
          <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 42, color: GOLD, opacity: falseChip }}>10 FALSE +</span>
        </div>

        {fracOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', opacity: fracOp, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, color: '#ffffff' }}>
            1 in 11
          </div>
        ) : null}
        {pct9 > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', opacity: pct9 * (1 - fracOp) }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 130, color: GOLD }}>9%</span>
            <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 40, color: MUTED, marginLeft: 20 }}>chance you're sick</span>
          </div>
        ) : null}
        {pct91 > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', opacity: pct91 }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 130, color: RED }}>91%</span>
            <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 40, color: MUTED, marginLeft: 20 }}>after 2 positives</span>
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="you tested positive. odds you're sick?" durSec={4.2} accent={GOLD} y={1160} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={GOLD} />
      <ProgressBar color={VIOLET} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 26, color: MUTED, opacity: 0.75 }}>
        illustration of base rates · not medical advice
      </div>
    </AbsoluteFill>
  );
};

export default Short22Test;
