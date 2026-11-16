import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import { ChartFrame, Curve, EndDot, ShareBar, Ticker, makeScale, money, type Pt } from '../../lib/chart';
import { FONT_BODY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #3: the minimum payment trap
// =============================================================================
export const compositionConfig = {
  id: 'Short14MinPay',
  durationInSeconds: 39.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const RED = '#ef5f6b';
const TEAL = '#4db8a8';
const GOLD = '#f5d76e';
const MUTED = '#8b96a5';
const INK = '#0f1216';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// =============================================================================
// THE MATH — computed here from the same rules as beats.json.money
//   $5,000 at 22% APR. Minimum = max($25, 1% of balance + that month's interest).
//   minimum only: 230 months (19.2 yrs), $13,100 paid, $8,100 interest
//   pay the FIRST minimum ($141.67) flat: 58 months (4.8 yrs), $3,121 interest -> ~$4,979 kept
// =============================================================================
const BAL = 5000;
const R = 0.22 / 12;
const runMin = () => {
  const pts: Pt[] = [{ x: 0, y: BAL }];
  let b = BAL;
  let paid = 0;
  let m = 0;
  const mins: number[] = [];
  while (b > 0.005) {
    const i = b * R;
    const pay = Math.min(Math.max(25, b * 0.01 + i), b + i);
    mins.push(pay);
    b = b + i - pay;
    paid += pay;
    m++;
    pts.push({ x: m / 12, y: Math.max(0, b) });
  }
  return { pts, paid, months: m, mins };
};
const runFlat = (pay: number) => {
  const pts: Pt[] = [{ x: 0, y: BAL }];
  let b = BAL;
  let paid = 0;
  let m = 0;
  while (b > 0.005) {
    const i = b * R;
    const p = Math.min(pay, b + i);
    b = b + i - p;
    paid += p;
    m++;
    pts.push({ x: m / 12, y: Math.max(0, b) });
  }
  return { pts, paid, months: m };
};
const MIN = runMin();
const FIRST_MIN = MIN.mins[0]; // 141.67
const FIRST_INTEREST = BAL * R; // 91.67
const FLAT = runFlat(FIRST_MIN);
const MIN_INTEREST = MIN.paid - BAL; // ~8,100
const SAVED = MIN.paid - FLAT.paid; // ~4,979
const MIN_AT_Y5 = MIN.mins[59]; // the minimum in month 60, ~$78

const BOX = { x: 150, y: 520, w: 740, h: 520 };
const S = makeScale([0, 20], [0, 5000], BOX);

// =============================================================================
// CUES — global frames from the REAL voice (vo.gen.ts)
// =============================================================================
const HOOK_OUT = F(4.5);
const REWIND_IN = F(4.8);
const REWIND_OUT = F(5.6);
const MINCHIP_IN = F(6.8); // "about one forty-two" @ 6.83
const SPLIT_IN = F(9.2); // "But sixty-five percent..." @ 9.44
const SPLIT_FILL = F(10.6);
const SPLIT_OUT = F(12.7);
const SHRINK_IN = F(13.3); // "as the balance drops, the minimum drops" @ 13.35–15.3
const SHRINK_OUT = F(15.3);
const MINCHIP_OUT = F(16.4);
const PAUSE_FROM = F(16.5); // "Pause." @ 16.60
const PAUSE_DUR = F(3.3);
const RED_IN = F(19.9); // "Nineteen years." @ 19.95–20.9
const RED_OUT = F(21.0);
const PAID_IN = F(21.25); // "Thirteen grand paid" @ 21.25–22.3
const PAID_OUT = F(22.3);
const INT_IN = F(23.1); // "Eight thousand of it, interest." @ 23.11–25.7
const INT_OUT = F(24.4);
const NUMBERS_OUT = F(25.8);
const TEAL_IN = F(26.6); // "...one forty-two every month, and never let it shrink" @ 26.94–29.5
const TEAL_OUT = F(29.4);
const GONE = F(30.0); // "Gone in under five years." @ 30.00–30.95
const SAVED_IN = F(32.15); // "You keep about five thousand dollars." @ 32.15–34.9
const SAVED_OUT = F(33.6);
const LOOP = F(37.85); // after "It's the bank's." @ 36.80–37.85
const END = F(39.5);

const bump = (f: number, a: number, b: number) => Math.min(prog(f, a, a + 5), 1 - prog(f, b - 9, b));

const Chip: React.FC<{ text: string; color: string; x: number; y: number; opacity: number; size?: number }> = ({
  text,
  color,
  x,
  y,
  opacity,
  size = 40,
}) =>
  opacity > 0.01 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translateY(${(1 - opacity) * 16}px)`,
        opacity,
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: size,
        color,
        background: 'rgba(15,18,22,0.88)',
        border: `2px solid ${color}`,
        borderRadius: 14,
        padding: '8px 22px',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  ) : null;

const Short14MinPay: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  // the minimum-only curve: full at f0 (the payoff), rewound in the setup, re-drawn on "Nineteen years"
  const rewound = EASE_INOUT(prog(f, REWIND_IN, REWIND_OUT));
  const redP = Math.max(1 - rewound, EASE_INOUT(prog(f, RED_IN, RED_OUT)));
  // the flat-$142 curve: only exists in the twist, fades for the loop (frame 0 never had it)
  const tealP = EASE_INOUT(prog(f, TEAL_IN, TEAL_OUT));
  const tealOp = 1 - prog(f, LOOP, LOOP + 14);

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 30));
  const stampOp = Math.min(1, 1 - prog(f, REWIND_IN, REWIND_IN + 8) + prog(f, LOOP + 10, LOOP + 22));

  // the minimum-payment chip, and how it shrinks with the balance
  const minChipOp = prog(f, MINCHIP_IN, MINCHIP_IN + 8) * (1 - prog(f, MINCHIP_OUT - 8, MINCHIP_OUT));
  const shrink = EASE_INOUT(prog(f, SHRINK_IN, SHRINK_OUT));
  const minShown = FIRST_MIN + (MIN_AT_Y5 - FIRST_MIN) * shrink;
  const minLabel = shrink > 0.02 ? `MINIMUM: $${Math.round(minShown)}/mo · year 5` : `MINIMUM: $${Math.round(FIRST_MIN)}/mo`;

  // the first payment, split into interest vs debt
  const splitOp = prog(f, SPLIT_IN, SPLIT_IN + 10) * (1 - prog(f, SPLIT_OUT - 8, SPLIT_OUT));
  const splitP = EASE_INOUT(prog(f, SPLIT_IN + 6, SPLIT_FILL));

  // reveal numbers
  const numbersOut = 1 - prog(f, NUMBERS_OUT - 8, NUMBERS_OUT);
  const paidOp = prog(f, PAID_IN - 6, PAID_IN + 4) * numbersOut;
  const paidP = EASE_INOUT(prog(f, PAID_IN, PAID_OUT));
  const intOp = prog(f, INT_IN - 6, INT_IN + 4) * numbersOut;
  const intP = EASE_INOUT(prog(f, INT_IN, INT_OUT));

  const savedOp = prog(f, SAVED_IN - 6, SAVED_IN + 4) * (1 - prog(f, LOOP, LOOP + 10));
  const savedP = EASE_INOUT(prog(f, SAVED_IN, SAVED_OUT));

  const redLabelOp = prog(redP, 0.97, 1);
  const redPulse = bump(f, RED_IN, F(21.0));
  const tealPulse = bump(f, GONE, F(31.0));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#2a1c22" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'MINIMUM PAYMENTS', color: '#ffffff' },
              { text: '= 19 YEARS', color: RED },
            ]}
            subtitle="$5,000 card · 22% APR"
            y={130}
            size={80}
            warm
          />
        </div>

        <Kicker text="$5,000 CARD · 22% APR" color={GOLD} y={200} at={REWIND_IN} until={F(16.3)} />
        <Kicker text="MINIMUM PAYMENTS ONLY" color={RED} y={200} at={F(19.9)} until={F(25.8)} />
        <Kicker text="PAY $142 FLAT INSTEAD" color={TEAL} y={200} at={F(25.95)} until={F(37.6)} />

        <ChartFrame scale={S} yTicks={[0, 2500, 5000]} xTicks={[0, 5, 10, 15, 20]} />

        <Curve scale={S} pts={MIN.pts} color={RED} p={redP} width={8} />
        <EndDot
          scale={S}
          pts={MIN.pts}
          p={redP}
          color={RED}
          label={`${(MIN.months / 12).toFixed(0)} yrs`}
          dy={-60}
          anchor="end"
          plate
          pulse={redPulse}
          opacity={redLabelOp}
        />

        <Curve scale={S} pts={FLAT.pts} color={TEAL} p={tealP} width={8} opacity={tealOp} />
        <EndDot
          scale={S}
          pts={FLAT.pts}
          p={tealP}
          color={TEAL}
          label={`${(FLAT.months / 12).toFixed(1)} yrs`}
          dy={-84}
          plate
          pulse={tealPulse}
          opacity={prog(tealP, 0.85, 1) * tealOp}
        />

        {/* frame-0 verdict */}
        <div style={{ opacity: stampOp }}>
          <Stamp text={`${money(MIN_INTEREST)} IN INTEREST`} at={-14} color={RED} x={540} y={1200} size={58} rotate={-5} />
        </div>

        <Chip text={minLabel} color={GOLD} x={540} y={1170} opacity={minChipOp} />

        <ShareBar
          x={150}
          y={1250}
          w={740}
          share={FIRST_INTEREST / FIRST_MIN}
          p={splitP}
          keepColor={TEAL}
          lostColor={RED}
          lostLabel={`${Math.round((FIRST_INTEREST / FIRST_MIN) * 100)}% INTEREST`}
          keepLabel={`$${Math.round(FIRST_MIN - FIRST_INTEREST)} TO THE DEBT`}
          opacity={splitOp}
        />

        <Ticker value={MIN.paid} p={paidP} label="total paid" color={'#e6e9ee'} x={300} y={1200} size={76} format={money} opacity={paidOp} />
        <Ticker value={MIN_INTEREST} p={intP} label="interest" color={RED} x={760} y={1200} size={76} format={money} opacity={intOp} />

        <Ticker value={SAVED} p={savedP} label="you keep" color={TEAL} x={540} y={1210} size={104} format={money} opacity={savedOp} />
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="how long until it's paid off?" durSec={3.3} accent={GOLD} y={1130} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={RED} />
      <ProgressBar color={RED} />

      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 160,
          bottom: 330,
          textAlign: 'center',
          fontFamily: FONT_BODY,
          fontSize: 26,
          color: MUTED,
          opacity: 0.75,
        }}
      >
        minimum = 1% of balance + interest, a common issuer formula
      </div>
    </AbsoluteFill>
  );
};

export default Short14MinPay;
