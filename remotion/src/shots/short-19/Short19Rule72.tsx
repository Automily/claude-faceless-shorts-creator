import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import { ChartFrame, Curve, makeScale, type Pt } from '../../lib/chart';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #6: the Rule of 72
// =============================================================================
export const compositionConfig = {
  id: 'Short19Rule72',
  durationInSeconds: 41.5,
  fps: 30,
  width: 1080,
  height: 1920,
};

const TEAL = '#4db8a8';
const GOLD = '#f5d76e';
const RED = '#ef5f6b';
const INK = '#0f1216';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// THE MATH: 72/8 = 9 years per doubling (exact: 9.006). $10K at 8% for 36 years = $159,682 ~ $160K.
// A 24% APR card (monthly compounding) doubles in 2.92 years ~ "about three".
const P0 = 10_000;
const SERIES: Pt[] = Array.from({ length: 36 * 12 + 1 }, (_, m) => ({ x: m / 12, y: P0 * Math.pow(1.08, m / 12) }));
const BOX = { x: 150, y: 580, w: 740, h: 470 };
const S = makeScale([0, 36], [0, 170_000], BOX);
const DOUBLINGS = [
  { t: 9, mult: '×2', money: '$20K' },
  { t: 18, mult: '×4', money: '$40K' },
  { t: 27, mult: '×8', money: '$80K' },
  { t: 36, mult: '×16', money: '$160K' },
];

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(4.9);
const REWIND = F(5.2);
const FORMULA_IN = F(7.1); // "Seventy-two divided by eight is nine." @ 7.10–9.0
const NINE_IN = F(8.65);
const D1_IN = F(9.8); // "Nine years to double." @ 9.80–10.8
const D1_OUT = F(10.6);
const D2_IN = F(11.38); // "Nine more to double again." @ 11.38–12.6
const D2_OUT = F(12.4);
const FORMULA_OUT = F(13.2);
const PAUSE_FROM = F(13.3); // "Pause." @ 13.40
const PAUSE_DUR = F(5.3);
const MONEY_IN = F(19.49); // "Twenty," — the multiples become dollars
const D3_IN = F(19.5); // "...forty, eighty, a hundred sixty thousand." @ 20.20–23.4
const D3_OUT = F(21.4);
const D4_OUT = F(22.9);
const RULE_IN = F(24.1); // "No calculator. Just seventy-two." @ 24.10–26.6
const RULE_OUT = F(27.5);
const DEBT_IN = F(27.7); // "But it works on debt too..." @ 27.70
const DEBT_F_IN = F(31.2); // "Seventy-two divided by twenty-four." @ 31.20–33.5
const DEBT_3 = F(32.45);
const DEBT_X2 = F(34.4); // "doubles in about three years" @ 34.51–35.9
const SIDES_IN = F(37.9); // "It just depends which side you're on." @ 37.93–39.9
const LOOP = F(40.0);
const END = F(41.5);

const Formula: React.FC<{ a: string; b: string; c: string; color: string; y: number; op: number; showC: number; size?: number; note?: string }> = ({
  a,
  b,
  c,
  color,
  y,
  op,
  showC,
  size = 110,
  note,
}) =>
  op > 0.01 ? (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: op, transform: `translateY(${(1 - op) * 18}px)` }}>
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size, color: '#ffffff' }}>{a}</span>
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: size * 0.8, color: '#8b96a5', margin: '0 18px' }}>÷</span>
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size, color }}>{b}</span>
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size, color, opacity: showC, marginLeft: 18 }}>= {c}</span>
      {note ? <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, letterSpacing: 3, color, marginTop: 4 }}>{note}</div> : null}
    </div>
  ) : null;

const Short19Rule72: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  // ---- how many years of the curve are drawn ----
  const rewound = EASE_INOUT(prog(f, REWIND, REWIND + 18));
  let years = 36 * (1 - rewound);
  if (f >= D1_IN) years = 9 * EASE_INOUT(prog(f, D1_IN, D1_OUT));
  if (f >= D2_IN) years = 9 + 9 * EASE_INOUT(prog(f, D2_IN, D2_OUT));
  if (f >= D3_IN) years = 18 + 9 * EASE_INOUT(prog(f, D3_IN, D3_OUT)) + 9 * EASE_INOUT(prog(f, D3_OUT, D4_OUT));
  if (f >= LOOP) years = 36;
  const curveP = years / 36;
  const showMoney = f < REWIND || f >= MONEY_IN;

  // the chart steps back for the debt twist, and comes forward again for the loop
  const dim = Math.min(prog(f, DEBT_IN, DEBT_IN + 12), 1 - prog(f, LOOP, LOOP + 12));
  const chartOp = 1 - 0.75 * dim;

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 30));
  const stampOp = Math.min(1, 1 - prog(f, REWIND, REWIND + 8) + prog(f, LOOP + 10, LOOP + 22));

  const f1Op = Math.max(
    prog(f, FORMULA_IN, FORMULA_IN + 8) * (1 - prog(f, FORMULA_OUT - 8, FORMULA_OUT)),
    prog(f, RULE_IN, RULE_IN + 8) * (1 - prog(f, RULE_OUT - 8, RULE_OUT)),
  );
  const f1C = f >= RULE_IN ? 1 : prog(f, NINE_IN, NINE_IN + 6);
  const debtOp = prog(f, DEBT_F_IN, DEBT_F_IN + 8) * (1 - prog(f, SIDES_IN - 8, SIDES_IN));
  const debtC = prog(f, DEBT_3, DEBT_3 + 6);
  const x2Op = prog(f, DEBT_X2, DEBT_X2 + 8) * (1 - prog(f, SIDES_IN - 8, SIDES_IN));
  const sidesOp = prog(f, SIDES_IN, SIDES_IN + 10) * (1 - prog(f, LOOP, LOOP + 10));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#1c2a28" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'WHEN DOES IT DOUBLE?', color: '#ffffff' },
              { text: '72 ÷ THE RATE', color: TEAL },
            ]}
            subtitle="the Rule of 72"
            y={130}
            size={80}
            warm
          />
        </div>

        <Kicker text="EARN 8% A YEAR" color={TEAL} y={200} at={REWIND} until={F(13.2)} />
        <Kicker text="$10,000 · 8% · 36 YEARS" color={GOLD} y={200} at={F(18.8)} until={F(27.5)} />
        <Kicker text="NOW A CREDIT CARD" color={RED} y={200} at={DEBT_IN} until={F(39.8)} />

        <div style={{ opacity: chartOp }}>
          <ChartFrame scale={S} yTicks={[0, 80_000, 160_000]} xTicks={[0, 9, 18, 27, 36]} />
          <Curve scale={S} pts={SERIES} color={TEAL} p={curveP} width={8} />
          {DOUBLINGS.map((d) => {
            const on = prog(years, d.t - 0.4, d.t);
            if (on <= 0.01) return null;
            const x = S.sx(d.t);
            const y = S.sy(P0 * Math.pow(1.08, d.t));
            return (
              <div key={d.t} style={{ opacity: on }}>
                <div style={{ position: 'absolute', left: x - 12, top: y - 12, width: 24, height: 24, borderRadius: 12, background: GOLD }} />
                <div
                  style={{
                    position: 'absolute',
                    left: x - 160,
                    width: 140,
                    top: y - 30,
                    textAlign: 'right',
                    fontFamily: FONT_MONO,
                    fontWeight: 700,
                    fontSize: 34,
                    color: GOLD,
                  }}
                >
                  {showMoney ? d.money : d.mult}
                </div>
              </div>
            );
          })}
        </div>

        <Formula a="72" b="8" c="9 YRS" color={TEAL} y={360} op={f1Op} showC={f1C} />
        <Formula a="72" b="24" c="3 YRS" color={RED} y={360} op={debtOp} showC={debtC} />
        {x2Op > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1170, textAlign: 'center', opacity: x2Op }}>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontWeight: 700,
                fontSize: 44,
                color: RED,
                background: 'rgba(15,18,22,0.9)',
                border: `2px solid ${RED}`,
                borderRadius: 14,
                padding: '8px 22px',
              }}
            >
              YOUR BALANCE ×2 IN ~3 YRS
            </span>
          </div>
        ) : null}
        {sidesOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 120, right: 160, top: 1110, display: 'flex', justifyContent: 'space-between', opacity: sidesOp }}>
            {[
              { t: 'YOU EARN', s: '×2 in 9 yrs', c: TEAL },
              { t: 'YOU OWE', s: '×2 in 3 yrs', c: RED },
            ].map((b) => (
              <div
                key={b.t}
                style={{
                  width: 370,
                  textAlign: 'center',
                  border: `3px solid ${b.c}`,
                  borderRadius: 18,
                  padding: '14px 0',
                  background: 'rgba(15,18,22,0.9)',
                }}
              >
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 52, color: b.c }}>{b.t}</div>
                <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 34, color: '#e6e9ee' }}>{b.s}</div>
              </div>
            ))}
          </div>
        ) : null}

        <div style={{ opacity: stampOp }}>
          <Stamp text="×2 EVERY 9 YEARS AT 8%" at={-14} color={TEAL} x={540} y={1210} size={54} rotate={-5} />
        </div>
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="$10,000 at 8% for 36 years?" durSec={5.3} accent={GOLD} y={1150} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={TEAL} />
      <ProgressBar color={TEAL} />
    </AbsoluteFill>
  );
};

export default Short19Rule72;
