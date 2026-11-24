import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #15: mortgage points, the 5-year break-even
// =============================================================================
export const compositionConfig = {
  id: 'Short34Points',
  durationInSeconds: 45.9,
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

// THE MATH: $300,000, 30y. 6.50% -> $1,896.20/mo; 6.25% -> $1,847.15/mo. Save $49.05/mo.
// 1 point = 1% = $3,000. 3000 / 49.05 = 61.2 months (~5 years 1 month).

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(5.6);
const SETUP = F(5.8);
const LOAN_IN = F(5.95); // "three hundred thousand" @ 5.97
const YRS_IN = F(7.6); // "Thirty years" @ 7.62
const RATE_IN = F(8.62); // "six and a half percent" @ 8.65
const POINT_IN = F(10.8); // "One point" @ 10.83
const PCT_IN = F(11.38); // "one percent" @ 11.39
const COST_IN = F(12.9); // "Three thousand dollars" @ 12.93
const CUT_IN = F(15.25); // "cuts the rate" @ 15.29
const PAUSE_FROM = F(18.0); // "Pause." @ 18.03
const PAUSE_DUR = F(4.95);
const REVEAL = F(23.0);
const P1_IN = F(24.25); // "eighteen ninety-six" @ 24.25
const P2_IN = F(27.27); // "eighteen forty-seven" @ 27.29
const SAVE_IN = F(29.15); // "forty-nine dollars" @ 29.16
const DIV_IN = F(31.0); // "Three thousand, divided by" @ 31.03
const MONTHS_IN = F(33.35); // "sixty-one months" @ 33.38
const TWIST = F(35.1); // "Just over five years" @ 35.15
const LOSS_IN = F(37.0); // "Sell or refinance before then" @ 37.06
const OUTRO = F(41.25); // "After that, it's all savings." @ 41.27
const SAVINGS_IN = F(42.35);
const FEE_IN = F(43.9); // "it's a fee" @ 43.93
const LOOP = F(44.6);
const END = F(45.9);

// timeline: 0..120 months
const TX = 130;
const TW = 790;
const TY = 960;
const mX = (m: number) => TX + (TW * m) / 120;
const BE = 61.2;

const Short34Points: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const setupOff = prog(f, SETUP, SETUP + 10);
  const outro = prog(f, OUTRO, OUTRO + 14);
  const pay = (on: number) => Math.max(1 - setupOff, on, outro);

  // setup panel
  const setupOp = prog(f, LOAN_IN, LOAN_IN + 8) * (1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM));
  const yrsOp = prog(f, YRS_IN, YRS_IN + 6);
  const rateOp = prog(f, RATE_IN, RATE_IN + 6);
  const pointOp = prog(f, POINT_IN, POINT_IN + 6);
  const pctOp = prog(f, PCT_IN, PCT_IN + 6);
  const costOp = prog(f, COST_IN, COST_IN + 6);
  const cutOp = prog(f, CUT_IN, CUT_IN + 8);

  // reveal panel
  const revOp = prog(f, REVEAL, REVEAL + 8) * (1 - prog(f, TWIST - 8, TWIST));
  const p1Op = prog(f, P1_IN, P1_IN + 6);
  const p2Op = prog(f, P2_IN, P2_IN + 6);
  const saveOp = prog(f, SAVE_IN, SAVE_IN + 6);
  const divOp = prog(f, DIV_IN, DIV_IN + 6);
  const monthsOp = prog(f, MONTHS_IN, MONTHS_IN + 6);
  const monthsPop = 1 + 0.12 * (1 - EASE_INOUT(prog(f, MONTHS_IN, MONTHS_IN + 10)));

  // timeline (frame 0, twist, outro)
  const tlOp = pay(prog(f, TWIST, TWIST + 10));
  const fill = f < SETUP || f >= OUTRO ? 1 : EASE_INOUT(prog(f, TWIST + 4, TWIST + 30));
  const greenOp = f < SETUP ? 1 : prog(f, SAVINGS_IN, SAVINGS_IN + 8);
  const lossOp = prog(f, LOSS_IN, LOSS_IN + 8) * (1 - outro);
  const feeLabelOp = pay(prog(f, TWIST + 20, TWIST + 30));

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 22));

  const row = (label: string, val: string, color: string, op: number) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '18px 30px', marginBottom: 18, borderRadius: 16, border: `3px solid ${color}`, background: 'rgba(255,255,255,0.03)', opacity: op }}>
      <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 40, color }}>{label}</span>
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 72, color: '#ffffff' }}>{val}<span style={{ fontFamily: FONT_MONO, fontSize: 30, color: MUTED }}>/mo</span></span>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#1c2a28" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'MORTGAGE POINTS', color: '#ffffff' },
              { text: 'BREAK EVEN: 61 MONTHS', color: GOLD },
            ]}
            subtitle="$3,000 now vs $49 a month"
            y={110}
            size={76}
            warm
          />
        </div>

        <Kicker text="THE LOAN" color={TEAL} y={200} at={SETUP} until={F(17.8)} />
        <Kicker text="THE PAYMENTS" color={GOLD} y={200} at={REVEAL} until={F(34.9)} />
        <Kicker text="THE BREAK-EVEN" color={RED} y={200} at={TWIST} until={F(41.0)} />
        <Kicker text="FEE, THEN SAVINGS" color={TEAL} y={200} at={OUTRO} until={F(44.4)} />

        {/* setup: the loan + the point */}
        {setupOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 120, right: 160, top: 470, textAlign: 'center', opacity: setupOp }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, color: '#ffffff' }}>$300,000</div>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 40, color: MUTED }}>
              <span style={{ opacity: yrsOp }}>30 years</span>
              <span style={{ opacity: rateOp }}> · <span style={{ color: '#ffffff' }}>6.50%</span></span>
            </div>
            <div style={{ marginTop: 70, padding: '26px 20px', borderRadius: 18, border: `3px solid ${GOLD}`, opacity: pointOp }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: GOLD }}>
                1 POINT <span style={{ opacity: pctOp }}>= 1%</span> <span style={{ opacity: costOp }}>= $3,000</span>
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: TEAL, marginTop: 14, opacity: cutOp }}>
                <span style={{ color: MUTED, textDecoration: 'line-through' }}>6.50%</span> → 6.25%
              </div>
            </div>
          </div>
        ) : null}

        {/* reveal: payments, savings, division */}
        {revOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 120, right: 160, top: 470, opacity: revOp }}>
            {row('6.50%', '$1,896', MUTED, p1Op)}
            {row('6.25%', '$1,847', TEAL, p2Op)}
            <div style={{ textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: TEAL, opacity: saveOp }}>
              save $49<span style={{ fontFamily: FONT_MONO, fontSize: 36, color: MUTED }}>/mo</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: 40, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 70, color: '#ffffff', opacity: divOp }}>
              $3,000 ÷ $49
            </div>
            <div style={{ textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 120, color: GOLD, opacity: monthsOp, transform: `scale(${monthsPop})` }}>
              = 61 months
            </div>
          </div>
        ) : null}

        {/* the timeline: fee zone then savings zone */}
        {tlOp > 0.01 ? (
          <div style={{ opacity: tlOp }}>
            <div style={{ position: 'absolute', left: TX, width: TW, top: TY, height: 90, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.2)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, width: (mX(BE) - TX) * fill, top: 0, bottom: 0, background: RED, opacity: 0.85 }} />
              <div style={{ position: 'absolute', left: mX(BE) - TX, right: 0, top: 0, bottom: 0, background: TEAL, opacity: 0.85 * greenOp }} />
            </div>
            {/* break-even marker */}
            <div style={{ position: 'absolute', left: mX(BE) - 3, top: TY - 30, width: 6, height: 124, background: GOLD, opacity: feeLabelOp }} />
            <div style={{ position: 'absolute', left: mX(BE) - 160, width: 320, top: TY - 90, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: GOLD, opacity: feeLabelOp }}>
              month 61 ≈ 5 yrs
            </div>
            {[0, 5, 10].map((y) => (
              <div key={y} style={{ position: 'absolute', left: mX(y * 12) - 60, width: 120, top: TY + 104, textAlign: 'center', fontFamily: FONT_MONO, fontSize: 26, color: MUTED }}>
                {y === 0 ? 'closing' : `${y} yrs`}
              </div>
            ))}
            <div style={{ position: 'absolute', left: TX, width: mX(BE) - TX, top: TY + 22, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: INK, opacity: feeLabelOp }}>
              FEE
            </div>
            <div style={{ position: 'absolute', left: mX(BE), width: TX + TW - mX(BE), top: TY + 22, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: INK, opacity: greenOp }}>
              SAVINGS
            </div>
            {/* sell/refi before -> loss */}
            <div style={{ position: 'absolute', left: TX, width: mX(BE) - TX, top: TY + 170, textAlign: 'center', opacity: lossOp }}>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 38, color: '#e6e9ee' }}>sell or refi here</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: RED }}>= money lost</div>
            </div>
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="how long until the $3,000 comes back?" durSec={4.95} accent={GOLD} y={1100} />
      </Sequence>

      <Captions lines={VO} y={1450} accent={GOLD} />
      <ProgressBar color={TEAL} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75, whiteSpace: 'nowrap' }}>
        rate cut per point varies by lender · illustrative, not advice
      </div>
    </AbsoluteFill>
  );
};

export default Short34Points;
