import React from 'react';
import { AbsoluteFill, Easing, Sequence, interpolateColors, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import { Ticker } from '../../lib/chart';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #2: "A raise can't lower your pay"
// =============================================================================
export const compositionConfig = {
  id: 'Short13Tax',
  durationInSeconds: 40,
  fps: 30,
  width: 1080,
  height: 1920,
};

const TEAL = '#4db8a8';
const GOLD = '#f5d76e';
const RED = '#ef5f6b';
const INK = '#0f1216';
const MUTED = '#8b96a5';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// =============================================================================
// THE MATH — IRS 2026 single-filer brackets (Rev. Proc. 2025-32). Federal income tax only.
//   taxable $50,000 -> $5,752   ·   $51,000 -> $5,932   ·   the raise costs $180, keeps $820
//   $400 of the raise fills the 12% bucket ($48), $600 spills into 22% ($132)
//   effective rate on $51,000 = 11.63%
// =============================================================================
const BRACKETS = [
  { rate: 0.1, lo: 0, hi: 12_400, color: TEAL, cap: 'first $12.4K' },
  { rate: 0.12, lo: 12_400, hi: 50_400, color: GOLD, cap: 'up to $50.4K' },
  { rate: 0.22, lo: 50_400, hi: 105_700, color: RED, cap: 'over $50.4K' },
] as const;
const BEFORE = 50_000;
const AFTER = 51_000;
const taxOn = (x: number) =>
  BRACKETS.reduce((t, b) => t + Math.max(0, Math.min(x, b.hi) - b.lo) * b.rate, 0);
const RAISE_TAX = taxOn(AFTER) - taxOn(BEFORE); // 180
const KEPT = AFTER - BEFORE - RAISE_TAX; // 820
const EFFECTIVE = taxOn(AFTER) / AFTER; // 0.1163
const SPILL = AFTER - BRACKETS[2].lo; // 600

// =============================================================================
// CUES — global frames, from the REAL ElevenLabs word times (vo.gen.ts)
// =============================================================================
const HOOK_OUT = F(4.3);
const DRAIN_IN = F(4.6); // "Say your taxable..."
const DRAIN_OUT = F(5.5);
const FILL_IN = F(5.6); // "...income is fifty thousand" @ 6.04
const FILL_OUT = F(6.6);
const RAISE_IN = F(7.55); // "a thousand dollar raise" @ 7.58–8.6
const RAISE_OUT = F(8.6);
const LINE_IN = F(10.0); // "At fifty thousand four hundred, twelve becomes twenty-two"
const LINE_OUT = F(13.6);
const PAUSE_FROM = F(14.1); // "Pause." @ 14.20
const PAUSE_DUR = F(3.8);
const MYTH_IN = F(15.2); // "Is your whole paycheck taxed at twenty-two now?"
const MYTH_OUT = F(18.0); // "No."
const REPOUR_DRAIN = F(18.7); // "Brackets are buckets."
const REPOUR_IN = F(20.2); // "Each dollar fills one, then spills into the next." @ 20.22–22.4
const REPOUR_OUT = F(22.4);
const SPILL_SAY = F(23.4); // "Only the six hundred above the line" @ 23.46
const SPILL_END = F(26.4);
const COST_IN = F(27.4); // "the raise costs" @ 27.46
const TOTAL_IN = F(28.25); // "a hundred eighty" @ 27.95–28.6
const KEPT_IN = F(30.25); // "eight twenty" @ 30.31
const COST_OUT = F(31.5);
const RATE_IN = F(33.2); // "Eleven point six percent." @ 34.18–35.3
const RATE_LAND = F(34.9);
const NOT22_IN = F(35.0);
const LOOP = F(38.6); // after "top dollars." @ 37.92–38.5
const END = F(40.0);

// =============================================================================
// THE BUCKETS — one persistent canvas. Each bracket is a glass bucket; income is water
// that fills bucket 1, then 2, then spills into 3. Every bucket is the same height, so
// the fill is "how full is this bracket", which is exactly the idea.
// The 22% sliver is tiny on purpose ($600 of a $55,300 bucket): it gets a minimum visible
// height so the eye can find it, and a callout so nobody mistakes it for a rounding error.
// =============================================================================
const B_TOP = 600;
const B_H = 440;
const B_W = 230;
const B_X = [135, 425, 715]; // left edges; right edge 945 stays clear of the UI column at 920
const SLIVER_PX = 34;

const Bucket: React.FC<{
  i: number;
  amount: number;
  myth: number; // 0..1: the "whole paycheck at 22%" misconception tints everything red
  glow: number; // 0..1 rim glow
  labelOp: number;
}> = ({ i, amount, myth, glow, labelOp }) => {
  const b = BRACKETS[i];
  const inBucket = Math.max(0, Math.min(amount, b.hi) - b.lo);
  const frac = inBucket / (b.hi - b.lo);
  // bucket 3 is the sliver: grows to its minimum visible height as the $600 arrives
  const h = i === 2 ? Math.min(1, inBucket / SPILL) * SLIVER_PX : frac * B_H;
  const water = interpolateColors(myth, [0, 1], [b.color, RED]);
  const rateText = myth > 0.5 ? '22%?' : `${Math.round(b.rate * 100)}%`;
  const rateColor = interpolateColors(myth, [0, 1], [b.color, RED]);
  const x = B_X[i];
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: B_TOP - 110,
          width: B_W,
          textAlign: 'center',
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 76,
          color: rateColor,
          opacity: labelOp,
        }}
      >
        {rateText}
      </div>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: B_TOP,
          width: B_W,
          height: B_H,
          borderRadius: '10px 10px 26px 26px',
          border: `3px solid rgba(255,255,255,${0.22 + 0.5 * glow})`,
          background: 'rgba(255,255,255,0.04)',
          boxShadow: glow > 0.01 ? `0 0 ${40 * glow}px ${b.color}66` : 'none',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: h,
            background: water,
            opacity: 0.92,
            boxShadow: h > 2 ? `0 -2px 0 rgba(255,255,255,0.35) inset` : 'none',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: x - 10,
          top: B_TOP + B_H + 18,
          width: B_W + 20,
          textAlign: 'center',
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: 30,
          color: MUTED,
          opacity: labelOp,
        }}
      >
        {b.cap}
      </div>
    </>
  );
};

// a row of the cost breakdown: "$400 × 12% = $48"
const MathRow: React.FC<{ y: number; left: string; right: string; color: string; p: number; big?: boolean }> = ({
  y,
  left,
  right,
  color,
  p,
  big,
}) => {
  if (p <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 150,
        right: 150,
        top: y,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        fontFamily: big ? FONT_DISPLAY : FONT_MONO,
        fontWeight: 700,
        fontSize: big ? 58 : 44,
        color: big ? color : '#e6e9ee',
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
      }}
    >
      <span>{left}</span>
      <span style={{ color }}>{right}</span>
    </div>
  );
};

const money0 = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;

const Short13Tax: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  // ---- the water level (dollars) — the single value the buckets are derived from ----------
  // f0 = AFTER (payoff composed). Setup drains, fills to $50K, then the raise lands. The reveal
  // drains and re-pours it slowly so you SEE each bucket fill before the next one starts.
  const drain1 = EASE_INOUT(prog(f, DRAIN_IN, DRAIN_OUT));
  const fill1 = EASE_INOUT(prog(f, FILL_IN, FILL_OUT));
  const raise = EASE_INOUT(prog(f, RAISE_IN, RAISE_OUT));
  const drain2 = EASE_INOUT(prog(f, REPOUR_DRAIN, REPOUR_DRAIN + 12));
  const repour = prog(f, REPOUR_IN, REPOUR_OUT); // linear pour reads as "one dollar after another"
  let amount: number;
  if (f < DRAIN_IN) amount = AFTER;
  else if (f < FILL_IN) amount = AFTER * (1 - drain1);
  else if (f < RAISE_IN) amount = BEFORE * fill1;
  else if (f < REPOUR_DRAIN) amount = BEFORE + (AFTER - BEFORE) * raise;
  else if (f < REPOUR_IN) amount = AFTER * (1 - drain2);
  else amount = AFTER * repour;

  const myth = Math.min(prog(f, MYTH_IN, MYTH_IN + 10), 1 - prog(f, MYTH_OUT, MYTH_OUT + 10));

  // the 12%/22% boundary glows when he names it, and again on "above the line"
  const line12 = Math.min(prog(f, LINE_IN, LINE_IN + 8), 1 - prog(f, LINE_OUT - 8, LINE_OUT));
  const spillGlow = Math.min(prog(f, SPILL_SAY, SPILL_SAY + 8), 1 - prog(f, SPILL_END - 8, SPILL_END));

  // the $600 callout: on at f0 (part of the payoff), off through setup, on when the raise
  // spills over, and loudest when he says "six hundred"
  const calloutOp = Math.max(
    1 - prog(f, DRAIN_IN, DRAIN_IN + 8),
    prog(f, RAISE_OUT - 4, RAISE_OUT + 6) * (1 - prog(f, REPOUR_DRAIN, REPOUR_DRAIN + 8)),
    prog(f, REPOUR_OUT - 2, REPOUR_OUT + 8) * (1 - prog(f, COST_IN - 6, COST_IN + 4)),
    prog(f, LOOP, LOOP + 12),
  ) * (1 - myth);

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 30));
  const stampOp = Math.min(1, 1 - prog(f, DRAIN_IN, DRAIN_IN + 8) + prog(f, LOOP + 10, LOOP + 22));

  const costOp = 1 - prog(f, COST_OUT, COST_OUT + 10);
  const row1 = prog(f, COST_IN, COST_IN + 9) * costOp;
  const row2 = prog(f, COST_IN + 5, COST_IN + 14) * costOp;
  const rowTotal = prog(f, TOTAL_IN, TOTAL_IN + 9) * costOp;
  const rowKept = prog(f, KEPT_IN, KEPT_IN + 9) * costOp;

  const rateP = EASE_INOUT(prog(f, RATE_IN, RATE_LAND));
  const rateOp = prog(f, RATE_IN - 10, RATE_IN) * (1 - prog(f, LOOP, LOOP + 10));
  const not22 = prog(f, NOT22_IN, NOT22_IN + 8) * (1 - prog(f, LOOP, LOOP + 10));

  // spill label sits just above the sliver in bucket 3
  const sliverTop = B_TOP + B_H - SLIVER_PX;
  const calloutScale = 1 + 0.12 * spillGlow;

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#1c2a28" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: "A RAISE CAN'T", color: '#ffffff' },
              { text: 'LOWER YOUR PAY', color: TEAL },
            ]}
            subtitle="2026 federal tax brackets, single filer"
            y={130}
            size={80}
            warm
          />
        </div>

        <Kicker text="TAXABLE INCOME: $50,000" color={GOLD} y={200} at={DRAIN_IN} until={LINE_IN} />
        <Kicker text="THE LINE: $50,400" color={RED} y={200} at={LINE_IN} until={F(13.9)} />
        <Kicker text="BRACKETS ARE BUCKETS" color={TEAL} y={200} at={F(18.7)} until={F(22.8)} />
        <Kicker text="WHAT THE RAISE COSTS" color={RED} y={200} at={F(23.0)} until={F(31.5)} />
        <Kicker text="YOUR REAL RATE" color={TEAL} y={200} at={F(31.8)} until={F(38.4)} />

        {[0, 1, 2].map((i) => (
          <Bucket
            key={i}
            i={i}
            amount={amount}
            myth={myth}
            glow={i === 1 ? line12 : i === 2 ? Math.max(line12, spillGlow) : 0}
            labelOp={1}
          />
        ))}

        {/* the $600 spill callout, pinned above the sliver */}
        <div
          style={{
            position: 'absolute',
            left: B_X[2],
            top: sliverTop - 74,
            width: B_W,
            textAlign: 'center',
            opacity: calloutOp,
            transform: `scale(${calloutScale})`,
          }}
        >
          <span
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 700,
              fontSize: 40,
              color: RED,
              background: 'rgba(15,18,22,0.85)',
              border: `2px solid ${RED}`,
              borderRadius: 12,
              padding: '4px 14px',
            }}
          >
            {money0(SPILL)}
          </span>
        </div>

        {/* frame-0 verdict */}
        <div style={{ opacity: stampOp }}>
          <Stamp text={`ONLY ${money0(SPILL)} AT 22%`} at={-14} color={RED} x={540} y={1215} size={60} rotate={-5} />
        </div>

        {/* what the raise actually costs */}
        <MathRow y={1135} left={`$400 × 12%`} right={`$48`} color={GOLD} p={row1} />
        <MathRow y={1195} left={`$600 × 22%`} right={`$132`} color={RED} p={row2} />
        <MathRow y={1262} left="tax on the raise" right={`+${money0(RAISE_TAX)}`} color={RED} p={rowTotal} big />
        {rowKept > 0.01 ? (
          <div
            style={{
              position: 'absolute',
              left: 150,
              right: 150,
              top: 1335,
              textAlign: 'right',
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 46,
              color: TEAL,
              opacity: rowKept,
              letterSpacing: 2,
            }}
          >
            YOU KEEP {money0(KEPT)}
          </div>
        ) : null}

        {/* the effective rate */}
        <Ticker
          value={EFFECTIVE * 100}
          p={rateP}
          label="your real rate on $51,000"
          color={TEAL}
          x={540}
          y={1225}
          size={120}
          format={(v) => `${v.toFixed(1)}%`}
          opacity={rateOp}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1318,
            textAlign: 'center',
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 44,
            color: RED,
            opacity: not22 * 0.9,
          }}
        >
          <span style={{ textDecoration: 'line-through', textDecorationThickness: 5 }}>22%</span>
        </div>

      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="is ALL of it taxed at 22% now?" durSec={3.8} accent={GOLD} y={1130} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={TEAL} />
      <ProgressBar color={TEAL} />

      {/* honesty footnote, small and constant */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 160,
          bottom: 360,
          textAlign: 'center',
          fontFamily: FONT_BODY,
          fontSize: 26,
          color: MUTED,
          opacity: 0.75,
        }}
      >
        federal income tax only · excludes payroll and state tax
      </div>
    </AbsoluteFill>
  );
};

export default Short13Tax;
