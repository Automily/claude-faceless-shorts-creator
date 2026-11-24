import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #13: Pay in 4's hidden 700% APR
// =============================================================================
export const compositionConfig = {
  id: 'Short32Bnpl',
  durationInSeconds: 42.6,
  fps: 30,
  width: 1080,
  height: 1920,
};

const TEAL = '#4db8a8';
const GOLD = '#f5d76e';
const RED = '#ef5f6b';
const MUTED = '#8b96a5';
const INK = '#0f1216';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// THE MATH: $100 order = 4 x $25 every 2 weeks. Miss one -> late fee up to $7 (Klarna US; Afterpay up to $8).
// $7 / $25 = 28% for ~2 weeks; 26 two-week periods a year -> 28% x 26 = 728% simple APR.
// Same $25 on a 22% APR card for 14 days: 25 x 0.22 x 14/365 = $0.21. 7 / 0.21 = 33x.

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(6.3);
const SETUP = F(6.5);
const ORDER_IN = F(6.8); // "A hundred dollar order" @ 6.82
const CARD_IN = [F(8.29), F(8.57), F(8.94), F(9.2)]; // "Four payments of twenty-five"
const WEEKS_IN = F(9.86); // "every two weeks"
const NOINT_IN = F(11.38); // "No interest." @ 11.39
const NOFEE_IN = F(12.07); // "No fees." @ 12.07
const ONTIME_IN = F(13.29); // "If you pay on time." @ 13.29
const MISS_IN = F(15.4); // "Miss one," @ 15.13
const FEE_IN = F(16.85); // "seven dollars" @ 16.89
const PAUSE_FROM = F(18.0); // "Pause." @ 18.04
const PAUSE_DUR = F(6.15);
const REVEAL = F(24.2); // "Seven over twenty-five" @ 24.26
const PCT_IN = F(25.6); // "twenty-eight percent" @ 25.62
const WK2_IN = F(26.95); // "In two weeks." @ 26.96
const X26_IN = F(28.65); // "twenty-six two-week stretches" @ 28.65
const APR_IN = F(31.75); // "seven hundred thirty percent" @ 31.80
const TWIST = F(33.7); // "The same twenty-five on a credit card" @ 33.85
const CC_IN = F(35.45); // "at twenty-two percent" @ 35.50
const CENTS_IN = F(36.95); // "About twenty cents." @ 37.0
const OUTRO = F(38.5); // "So yes." @ 38.57
const LOOP = F(41.1);
const END = F(42.6);

// payment cards
const CX = 140;
const CPITCH = 200;
const CW = 170;
const CY = 700;
const CH = 190;

const Short32Bnpl: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const setupOff = prog(f, SETUP, SETUP + 10);
  const outro = prog(f, OUTRO, OUTRO + 14);
  const pay = (on: number) => Math.max(1 - setupOff, on, outro);

  // the four payments: shown at f0 (payoff), cleared, rebuilt on cue, gone for the math, back for the loop
  const cardsOut = prog(f, REVEAL - 8, REVEAL) * (1 - outro);
  const cardOp = (i: number) => pay(prog(f, CARD_IN[i], CARD_IN[i] + 6)) * (1 - cardsOut);
  const weeksOp = pay(prog(f, WEEKS_IN, WEEKS_IN + 8));
  const missed = f < SETUP ? 1 : f >= OUTRO ? 1 : prog(f, MISS_IN, MISS_IN + 5);
  const feeOp = pay(prog(f, FEE_IN, FEE_IN + 6)) * (1 - cardsOut);
  const orderOp = prog(f, ORDER_IN, ORDER_IN + 8) * (1 - prog(f, MISS_IN - 8, MISS_IN));

  const badgesOp = (1 - prog(f, MISS_IN - 6, MISS_IN + 2));
  const noIntOp = prog(f, NOINT_IN, NOINT_IN + 6) * badgesOp;
  const noFeeOp = prog(f, NOFEE_IN, NOFEE_IN + 6) * badgesOp;
  const onTimeOp = prog(f, ONTIME_IN, ONTIME_IN + 6) * badgesOp;

  // the math
  const mathOp = prog(f, REVEAL, REVEAL + 8) * (1 - prog(f, TWIST - 8, TWIST));
  const pctOp = prog(f, PCT_IN, PCT_IN + 6);
  const wk2Op = prog(f, WK2_IN, WK2_IN + 6);
  const x26Op = prog(f, X26_IN, X26_IN + 6);
  const aprOp = prog(f, APR_IN, APR_IN + 6);
  const aprPop = 1 + 0.12 * (1 - EASE_INOUT(prog(f, APR_IN, APR_IN + 10)));

  // the comparison bars
  const barsOp = prog(f, TWIST, TWIST + 10) * (1 - prog(f, OUTRO - 8, OUTRO));
  const feeBar = EASE_INOUT(prog(f, TWIST + 4, TWIST + 22));
  const ccOp = prog(f, CC_IN, CC_IN + 8);
  const centsOp = prog(f, CENTS_IN, CENTS_IN + 6);

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 22));

  const BASE = 1260;
  const BAR_H = 520;

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#2a1c20" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'PAY IN 4: 0% INTEREST', color: '#ffffff' },
              { text: 'MISS ONE: ~730% APR', color: RED },
            ]}
            subtitle="the math on one $7 late fee"
            y={110}
            size={72}
            warm
          />
        </div>

        <Kicker text="PAY IN 4" color={TEAL} y={200} at={SETUP} until={F(15.0)} />
        <Kicker text="MISS ONE" color={RED} y={200} at={F(15.1)} until={F(24.0)} />
        <Kicker text="AS AN APR" color={GOLD} y={200} at={REVEAL} until={F(33.5)} />
        <Kicker text="VS A CREDIT CARD" color={TEAL} y={200} at={TWIST} until={F(38.3)} />

        {/* the order */}
        {orderOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 530, textAlign: 'center', opacity: orderOp }}>
            <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 34, color: MUTED }}>ORDER TOTAL </span>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: '#ffffff' }}>$100</span>
          </div>
        ) : null}

        {/* four payment cards */}
        {[0, 1, 2, 3].map((i) => {
          const op = cardOp(i);
          if (op < 0.01) return null;
          const isMiss = i === 1;
          const m = isMiss ? missed : 0;
          return (
            <div key={i}>
              <div
                style={{
                  position: 'absolute',
                  left: CX + i * CPITCH,
                  top: CY,
                  width: CW,
                  height: CH,
                  borderRadius: 18,
                  background: m > 0.5 ? 'rgba(239,95,107,0.18)' : 'rgba(77,184,168,0.16)',
                  border: `3px solid ${m > 0.5 ? RED : TEAL}`,
                  opacity: op,
                  transform: `scale(${0.92 + 0.08 * op})`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: '#ffffff' }}>$25</div>
                <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: MUTED, opacity: weeksOp, marginTop: 6 }}>
                  week {i * 2}
                </div>
              </div>
              {isMiss && m > 0.01 ? (
                <div
                  style={{
                    position: 'absolute',
                    left: CX + i * CPITCH - 20,
                    width: CW + 40,
                    top: CY + 128,
                    textAlign: 'center',
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    fontSize: 30,
                    color: RED,
                    border: `4px solid ${RED}`,
                    borderRadius: 10,
                    background: INK,
                    opacity: m * op,
                    transform: `rotate(-8deg) scale(${1.4 - 0.4 * m})`,
                  }}
                >
                  MISSED
                </div>
              ) : null}
            </div>
          );
        })}

        {/* +$7 late fee */}
        {feeOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 950, textAlign: "center", opacity: feeOp }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: RED }}>+$7</div>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: '#e6e9ee' }}>late fee</div>
          </div>
        ) : null}

        {/* the promises */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center' }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: TEAL, opacity: noIntOp }}>0% interest</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: TEAL, opacity: noFeeOp, marginTop: 6 }}>$0 fees</div>
          <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 44, color: GOLD, opacity: onTimeOp, marginTop: 18 }}>…if you pay on time</div>
        </div>

        {/* the APR math */}
        {mathOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 100, right: 160, top: 480, textAlign: "center", opacity: mathOp }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, color: '#ffffff' }}>$7 ÷ $25</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, color: GOLD, opacity: pctOp }}>= 28%</div>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 34, color: MUTED, opacity: wk2Op }}>for two weeks</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: '#e6e9ee', opacity: x26Op, marginTop: 40 }}>
              × 26 <span style={{ fontFamily: FONT_MONO, fontSize: 32, color: MUTED }}>two-week stretches / yr</span>
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 130, color: RED, opacity: aprOp, marginTop: 30, transform: `scale(${aprPop})` }}>
              ≈ 730% APR
            </div>
          </div>
        ) : null}

        {/* $7 vs $0.21 */}
        {barsOp > 0.01 ? (
          <div style={{ opacity: barsOp }}>
            <div style={{ position: 'absolute', left: 170, width: 720, top: BASE, borderTop: '3px solid rgba(255,255,255,0.3)' }} />
            {/* late fee bar */}
            <div style={{ position: 'absolute', left: 230, width: 220, top: BASE - BAR_H * feeBar, height: BAR_H * feeBar, borderRadius: '12px 12px 2px 2px', background: `linear-gradient(180deg, ${RED}, #a33a44)` }} />
            <div style={{ position: 'absolute', left: 230, width: 220, top: BASE - BAR_H - 100, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: RED, opacity: feeBar }}>$7.00</div>
            <div style={{ position: 'absolute', left: 200, width: 280, top: BASE + 16, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: '#e6e9ee' }}>Pay in 4 late fee</div>
            {/* credit card bar */}
            <div style={{ position: 'absolute', left: 610, width: 220, top: BASE - Math.max(6, BAR_H * (0.21 / 7)) * ccOp, height: Math.max(6, BAR_H * (0.21 / 7)) * ccOp, borderRadius: 4, background: TEAL }} />
            <div style={{ position: 'absolute', left: 610, width: 220, top: BASE - 110, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: TEAL, opacity: centsOp }}>$0.21</div>
            <div style={{ position: 'absolute', left: 580, width: 280, top: BASE + 16, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: '#e6e9ee', opacity: ccOp }}>
              card at 22% APR,<br />same 2 weeks
            </div>
            <div style={{ position: 'absolute', left: 560, width: 320, top: 600, textAlign: "center", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: GOLD, opacity: centsOp }}>
              33× less
            </div>
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="$7 to borrow $25 for 2 weeks. what's the APR?" durSec={6.15} accent={GOLD} y={1250} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={RED} />
      <ProgressBar color={TEAL} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75 }}>
        late fees up to $7–8 per missed payment (Klarna/Afterpay US) · varies by state · illustrative
      </div>
    </AbsoluteFill>
  );
};

export default Short32Bnpl;
