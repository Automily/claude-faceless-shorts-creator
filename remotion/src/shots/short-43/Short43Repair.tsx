import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #24: the $1,200 car repair on minimum payments (immersive)
// =============================================================================
export const compositionConfig = {
  id: 'Short43Repair',
  durationInSeconds: 46.6,
  fps: 30,
  width: 1080,
  height: 1920,
};

const TEAL = '#4db8a8';
const GOLD = '#f5d76e';
const RED = '#ef5f6b';
const AMBER = '#ffb020';
const MUTED = '#8b96a5';
const INK = '#0f1216';
const PAPER = '#ece6d8';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// THE MATH: $1,200 at 22% APR, minimum = max($25, 1% of balance + interest) -> first payment ≈ $34.
// Simulated payoff: 88 months (7 yrs 4 mo), $1,133 interest, $2,333 total. Saving $100/mo x 12 = $1,200 cash.

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const ENGINE_IN = F(0.85); // "won't start" @ 0.87
const QUOTE_IN = F(3.2); // "twelve hundred dollars" @ 3.22
const BAL_IN = F(4.45); // "You don't have it." @ 4.46
const HOOK_OUT = F(5.8);
const SETUP = F(5.95); // "So it goes on the card." @ 6.00
const APR_IN = F(8.05); // "Twenty-two percent APR" @ 8.08
const MIN_IN = F(11.65); // "thirty-four dollars" @ 11.69
const PAUSE_FROM = F(14.1); // "Pause." @ 14.10
const PAUSE_DUR = F(4.75);
const REVEAL = F(19.0); // "Seven years and four months" @ 19.03
const INT_IN = F(21.1); // "Eleven hundred thirty-three" @ 21.13
const TOTAL_IN = F(26.0); // "twenty-three hundred" @ 26.04
const REWIND = F(27.8); // "Now rewind." @ 27.82
const JARS_IN = F(29.2); // "A hundred dollars a month" @ 29.21
const JARS_END = F(31.0);
const CASH_IN = F(33.2); // "Paid in cash." @ 33.24
const ZERO_IN = F(34.7); // "Zero interest." @ 34.75
const POINT = F(36.3); // "That's what an emergency fund is for." @ 36.34
const EXPENSIVE_IN = F(41.2); // "getting expensive" @ 41.22
const OUTRO = F(42.3); // "Your car won't start. This time..." @ 42.33
const LOOP = F(45.4);
const END = F(46.6);

const Short43Repair: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const outro = prog(f, OUTRO, OUTRO + 14);
  const early = 1 - prog(f, F(0.3), F(0.7));

  // payoff (f0 + outro): invoice PAID from savings
  const paidOp = Math.max(early, outro);

  // hook: dashboard, quote, balance
  const hookOp = prog(f, F(0.3), F(0.7)) * (1 - prog(f, SETUP, SETUP + 8));
  const engine = prog(f, ENGINE_IN, ENGINE_IN + 4) * (0.7 + 0.3 * Math.abs(Math.sin(f * 0.35)));
  const quoteOp = prog(f, QUOTE_IN, QUOTE_IN + 6);
  const balOp = prog(f, BAL_IN, BAL_IN + 6);

  // card
  const cardOp = prog(f, SETUP, SETUP + 10) * (1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM));
  const aprOp = prog(f, APR_IN, APR_IN + 6);
  const minOp = prog(f, MIN_IN, MIN_IN + 6);

  // the cost
  const costOp = prog(f, REVEAL, REVEAL + 8) * (1 - prog(f, REWIND - 8, REWIND));
  const months = Math.round(88 * EASE_INOUT(prog(f, REVEAL, REVEAL + 30)));
  const intGrow = EASE_INOUT(prog(f, INT_IN, INT_IN + 20));
  const totalOp = prog(f, TOTAL_IN, TOTAL_IN + 6);

  // rewind + jars
  const rewOp = prog(f, REWIND, REWIND + 8) * (1 - prog(f, POINT - 8, POINT));
  const rewindFlash = prog(f, REWIND, REWIND + 3) * (1 - prog(f, REWIND + 3, REWIND + 12));
  const jars = 12 * prog(f, JARS_IN, JARS_END);
  const cashOp = prog(f, CASH_IN, CASH_IN + 6);
  const zeroOp = prog(f, ZERO_IN, ZERO_IN + 6);

  // the point
  const pointOp = prog(f, POINT, POINT + 8) * (1 - prog(f, OUTRO - 8, OUTRO));
  const expOp = prog(f, EXPENSIVE_IN, EXPENSIVE_IN + 6);

  const titleOp = Math.min(1, 1 - prog(f, F(0.3), F(0.7)) + prog(f, LOOP + 6, LOOP + 18));

  const BASE_W = 300;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#2a2016" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'A $1,200 REPAIR', color: '#ffffff' },
              { text: 'ON MINIMUMS: $2,333', color: RED },
            ]}
            subtitle="or: why emergency funds exist"
            y={110}
            size={74}
            warm
          />
        </div>

        <Kicker text="ON THE CARD" color={RED} y={200} at={SETUP} until={F(13.9)} />
        <Kicker text="THE REAL COST" color={RED} y={200} at={REVEAL} until={F(27.6)} />
        <Kicker text="REWIND ⏪" color={TEAL} y={200} at={REWIND} until={F(36.1)} />
        <Kicker text="THE POINT" color={GOLD} y={200} at={POINT} until={F(42.1)} />

        {/* payoff: invoice paid from savings */}
        {paidOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 190, right: 230, top: 560, opacity: paidOp }}>
            <div style={{ background: PAPER, borderRadius: 10, padding: '30px 36px', transform: 'rotate(-1.5deg)', position: 'relative' }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: '#6b6f76', letterSpacing: 4 }}>AUTO REPAIR</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 34, color: INK }}><span>alternator</span><span>$1,200</span></div>
              <div style={{ position: 'absolute', right: 120, bottom: -70, transform: 'rotate(-10deg)', border: '5px solid #2e7d4f', borderRadius: 10, padding: '4px 18px', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 54, color: '#2e7d4f', background: PAPER }}>PAID</div>
            </div>
            <div style={{ marginTop: 110, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 46, color: TEAL, whiteSpace: 'nowrap' }}>from savings · $0 interest</div>
          </div>
        ) : null}

        {/* hook: dashboard + quote + balance */}
        {hookOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 150, right: 190, top: 520, opacity: hookOp, textAlign: 'center' }}>
            <div style={{ margin: '0 auto', width: 420, height: 220, borderRadius: '210px 210px 30px 30px', background: '#14181e', border: '6px solid #2b3038', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 150, top: 70, fontSize: 90, color: AMBER, opacity: engine, filter: `drop-shadow(0 0 ${20 * engine}px ${AMBER})` }}>⚠</div>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 20, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 24, color: AMBER, opacity: engine }}>CHECK ENGINE</div>
            </div>
            <div style={{ marginTop: 40, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 90, color: '#ffffff', opacity: quoteOp }}>$1,200</div>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: MUTED, opacity: quoteOp }}>mechanic's quote</div>
            <div style={{ marginTop: 30, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: RED, opacity: balOp }}>checking: $214</div>
          </div>
        ) : null}

        {/* the card */}
        {cardOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 150, right: 190, top: 540, opacity: cardOp, textAlign: 'center' }}>
            <div style={{ margin: '0 auto', width: 500, height: 300, borderRadius: 26, background: 'linear-gradient(135deg, #5a2a32, #2a1218)', padding: 30, textAlign: 'left' }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: '#f0d0d4' }}>CREDIT CARD</div>
              <div style={{ width: 80, height: 60, borderRadius: 10, background: '#d9b35a', marginTop: 30 }} />
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: '#ffffff', marginTop: 30 }}>−$1,200</div>
            </div>
            <div style={{ marginTop: 40, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: RED, opacity: aprOp }}>22% APR</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: GOLD, opacity: minOp }}>minimum: ~$34/mo</div>
          </div>
        ) : null}

        {/* the real cost */}
        {costOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 150, right: 190, top: 520, opacity: costOp, textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, color: '#ffffff' }}>{Math.floor(months / 12)} yrs {months % 12} mo</div>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: MUTED }}>{months} minimum payments</div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 0, marginTop: 60, height: 420 }}>
              <div style={{ width: 260, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ height: 0.19 * 1133 * intGrow, background: RED, borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: INK, overflow: 'hidden' }}>+$1,133</div>
                <div style={{ height: 0.19 * 1200, background: '#5a6470', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: '#ffffff' }}>$1,200</div>
              </div>
            </div>
            <div style={{ marginTop: 20, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: RED, opacity: totalOp }}>= $2,333</div>
          </div>
        ) : null}

        {/* rewind: the savings jars */}
        {rewOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 150, right: 190, top: 540, opacity: rewOp, textAlign: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
              {Array.from({ length: 12 }, (_, i) => {
                const fill = Math.max(0, Math.min(1, jars - i));
                return (
                  <div key={i} style={{ height: 130, borderRadius: '14px 14px 20px 20px', border: '4px solid rgba(255,255,255,0.3)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${fill * 100}%`, background: TEAL, opacity: 0.85 }} />
                    <div style={{ position: 'absolute', left: 0, right: 0, top: 46, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 24, color: '#ffffff' }}>$100</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 50, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, color: TEAL, opacity: cashOp }}>$1,200 cash</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, color: '#ffffff', opacity: zeroOp }}>$0 interest</div>
          </div>
        ) : null}
        <AbsoluteFill style={{ background: '#ffffff', opacity: 0.25 * rewindFlash }} />

        {/* the point */}
        {pointOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 120, right: 160, top: 600, opacity: pointOp, textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 48, color: MUTED }}>an emergency fund isn't</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: '#ffffff' }}>to get rich</div>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 48, color: MUTED, marginTop: 30, opacity: expOp }}>it stops emergencies from</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: GOLD, opacity: expOp }}>getting expensive</div>
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="$1,200 at 22%, minimum payments. how long?" durSec={4.75} accent={GOLD} y={1000} />
      </Sequence>

      <Captions lines={VO} y={1450} accent={GOLD} />
      <ProgressBar color={TEAL} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75, whiteSpace: 'nowrap' }}>
        minimum formulas vary by issuer · illustrative, not advice
      </div>
    </AbsoluteFill>
  );
};

export default Short43Repair;
