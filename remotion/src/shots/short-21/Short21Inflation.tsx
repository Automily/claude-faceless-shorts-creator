import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #7: inflation quietly halves your cash
// =============================================================================
export const compositionConfig = {
  id: 'Short21Inflation',
  durationInSeconds: 36.6,
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

// THE MATH: 3%/yr inflation (assumed, ~US long-run average). Buying power of $10,000 after t years
// = 10,000 / 1.03^t. t = 24 -> $4,919 (half at 23.45 yrs; Rule of 72 says 24). Groceries $100 -> $203.
const CASH = 10_000;
const power = (t: number) => CASH / Math.pow(1.03, t);

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(5.2);
const REWIND = F(5.4);
const PRICES_IN = F(6.2); // "about three percent a year" @ 6.24
const CASH_PULSE = F(7.8); // "Your cash doesn't." @ 7.80–8.6
const SLOW_IN = F(10.1); // "But it compounds, against you." @ 11.47–13.5
const SLOW_OUT = F(13.6);
const AGAINST = F(12.79);
const PAUSE_FROM = F(14.5); // "Pause." @ 14.60
const PAUSE_DUR = F(4.8);
const RULE_IN = F(19.4); // "Seventy-two divided by three." @ 19.40
const RUN_IN = F(21.2); // "Twenty-four years." @ 21.43–22.3
const RUN_OUT = F(22.3);
const SAYS_IN = F(23.4); // "still says ten thousand" @ 23.46–24.9
const BUYS_IN = F(26.1); // "buys five thousand worth" @ 26.15
const CART_IN = F(27.8); // "The cart of groceries that costs a hundred today?" @ 27.80
const CART_200 = F(30.75); // "About two hundred." @ 30.77–31.6
const CART_OUT = F(32.3);
const NUM_GLOW = F(32.9); // "The number never changes." @ 32.63–33.6
const BUY_GLOW = F(34.3); // "What it buys does." @ 34.04–34.9
const LOOP = F(35.5);
const END = F(36.6);

const BOTTOM = 1080;
const PX = 500 / CASH;
const BARS = [
  { key: 'says', x: 190, label: 'WHAT IT SAYS', color: '#d8dde4' },
  { key: 'buys', x: 650, label: 'WHAT IT BUYS', color: TEAL },
] as const;
const BW = 240;

const money0 = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;

const Short21Inflation: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  // ---- the year: 24 at f0, back to 0 in setup, a slow 0->10 crawl, then 10->24 on the reveal
  let years = 24 * (1 - EASE_INOUT(prog(f, REWIND, REWIND + 18)));
  if (f >= SLOW_IN) years = 10 * EASE_INOUT(prog(f, SLOW_IN, SLOW_OUT));
  if (f >= RUN_IN) years = 10 + 14 * EASE_INOUT(prog(f, RUN_IN, RUN_OUT));
  if (f >= LOOP) years = 24;
  const buys = power(years);
  const lostShare = 1 - buys / CASH;

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 26));
  const stampOp = Math.min(1, 1 - prog(f, REWIND, REWIND + 8) + prog(f, LOOP + 10, LOOP + 22));
  const yearOp = prog(f, REWIND, REWIND + 10) * (1 - prog(f, LOOP, LOOP + 10));

  const cartOp = prog(f, CART_IN, CART_IN + 10) * (1 - prog(f, CART_OUT - 8, CART_OUT));
  const barsDim = 1 - 0.7 * cartOp;
  const cartPrice = 100 + (Math.pow(1.03, 24) * 100 - 100) * EASE_INOUT(prog(f, CART_200 - 6, CART_200 + 12));

  const pricesOp = prog(f, PRICES_IN, PRICES_IN + 8) * (1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM));
  const ruleOp = prog(f, RULE_IN, RULE_IN + 8) * (1 - prog(f, SAYS_IN - 8, SAYS_IN));
  const bump = (a: number, len = 40) => Math.min(prog(f, a, a + 6), 1 - prog(f, a + len - 10, a + len));
  const glowSays = Math.max(bump(CASH_PULSE), bump(SAYS_IN, 45), bump(NUM_GLOW));
  const glowBuys = Math.max(bump(BUYS_IN), bump(BUY_GLOW));
  const against = prog(f, AGAINST, AGAINST + 10) * (1 - prog(f, LOOP, LOOP + 14));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#2a1c22" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'YOUR CASH SAYS $10,000', color: '#ffffff' },
              { text: 'IT BUYS HALF', color: RED },
            ]}
            subtitle="24 years at 3% inflation"
            y={130}
            size={70}
            warm
          />
        </div>

        <Kicker text="PRICES +3% A YEAR" color={GOLD} y={200} at={REWIND} until={F(14.4)} />
        <Kicker text="RULE OF 72" color={TEAL} y={200} at={RULE_IN} until={F(27.6)} />
        <Kicker text="AT THE STORE" color={GOLD} y={200} at={CART_IN} until={F(32.2)} />
        <Kicker text="SAYS VS BUYS" color={RED} y={200} at={F(32.4)} until={F(35.4)} />

        {/* year counter */}
        {yearOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: yearOp }}>
            <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 36, letterSpacing: 6, color: MUTED }}>YEAR </span>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: '#ffffff' }}>{Math.round(years)}</span>
          </div>
        ) : null}

        {/* the two bars */}
        <div style={{ opacity: barsDim }}>
          {BARS.map((b) => {
            const v = b.key === 'says' ? CASH : buys;
            const h = v * PX;
            const glow = b.key === 'says' ? glowSays : glowBuys;
            const col = b.key === 'buys' ? (against > 0 ? `color-mix(in srgb, ${TEAL} ${100 - 100 * against * lostShare * 1.6}%, ${RED})` : TEAL) : b.color;
            return (
              <div key={b.key}>
                <div style={{ position: 'absolute', left: b.x - 80, width: BW + 160, top: BOTTOM - CASH * PX - 60, textAlign: 'center', whiteSpace: 'nowrap', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, letterSpacing: 2, color: b.key === 'says' ? '#d8dde4' : TEAL }}>
                  {b.label}
                </div>
                {/* ghost outline of the full $10,000 */}
                <div style={{ position: 'absolute', left: b.x, width: BW, top: BOTTOM - CASH * PX, height: CASH * PX, borderRadius: 14, border: '2px dashed rgba(255,255,255,0.18)' }} />
                <div
                  style={{
                    position: 'absolute',
                    left: b.x,
                    width: BW,
                    top: BOTTOM - h,
                    height: h,
                    borderRadius: 14,
                    background: col,
                    boxShadow: `0 0 ${12 + 40 * glow}px ${b.key === 'says' ? '#ffffff' : TEAL}${glow > 0.1 ? 'aa' : '33'}`,
                  }}
                />
                <div style={{ position: 'absolute', left: b.x - 40, width: BW + 80, top: BOTTOM + 18, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 70, color: b.key === 'says' ? '#ffffff' : buys < 7000 ? RED : TEAL, transform: `scale(${1 + 0.1 * glow})` }}>
                  {money0(v)}
                </div>
              </div>
            );
          })}
        </div>

        {pricesOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', opacity: pricesOp, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 40, color: GOLD }}>
            prices +3%/yr · cash +0%
          </div>
        ) : null}
        {ruleOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center', opacity: ruleOp, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: TEAL }}>
            72 ÷ 3 = 24 YEARS
          </div>
        ) : null}

        {/* the grocery cart price tag */}
        {cartOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: cartOp, transform: `scale(${0.9 + 0.1 * cartOp})` }}>
            <div
              style={{
                display: 'inline-block',
                padding: '28px 60px',
                borderRadius: 28,
                background: 'rgba(15,18,22,0.95)',
                border: `4px solid ${GOLD}`,
              }}
            >
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 36, letterSpacing: 6, color: MUTED }}>CART OF GROCERIES</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 170, color: cartPrice > 150 ? RED : GOLD, lineHeight: 1.05 }}>{money0(cartPrice)}</div>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 34, color: MUTED }}>{cartPrice > 150 ? 'in 24 years' : 'today'}</div>
            </div>
          </div>
        ) : null}

        <div style={{ opacity: stampOp }}>
          <Stamp text="BUYS HALF AS MUCH" at={-14} color={RED} x={540} y={1300} size={60} rotate={-5} />
        </div>
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="when does it buy half as much?" durSec={4.8} accent={GOLD} y={1220} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={RED} />
      <ProgressBar color={RED} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 26, color: MUTED, opacity: 0.75 }}>
        3% inflation assumed · cash earning 0%
      </div>
    </AbsoluteFill>
  );
};

export default Short21Inflation;
