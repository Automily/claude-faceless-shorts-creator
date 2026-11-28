import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #22: 2% cash back vs 20% APR (immersive)
// =============================================================================
export const compositionConfig = {
  id: 'Short41Cashback',
  durationInSeconds: 42.8,
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

// THE MATH: $1,000 × 2% = $20 back. ~20% APR (Bankrate avg 19.71%) ≈ 1.67%/mo ≈ $17/mo on $1,000.
// Two months ≈ $33 interest > $20 reward → net ≈ −$13. (Simplified: ignores grace period & paydown.)

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const SWIPE_IN = F(1.4); // "You put a thousand dollars" @ 1.42
const REWARD_IN = F(4.35); // "Twenty dollars of free money" @ 4.37
const HOOK_OUT = F(5.75);
const SETUP = F(5.9); // "The bill comes." @ 5.95
const MIN_IN = F(7.9); // "the minimum" @ 7.93
const ROLL_IN = F(9.45); // "rolls over" @ 9.49
const APR_IN = F(12.4); // "twenty percent APR" @ 12.43
const PAUSE_FROM = F(14.6); // "Pause." @ 14.6
const PAUSE_DUR = F(4.85);
const REVEAL = F(19.65); // "Twenty percent a year" @ 19.70
const MO_IN = F(20.9); // "one point seven percent a month" @ 20.94
const SEVENTEEN = F(24.6); // "about seventeen dollars" @ 24.64
const LEDGER = F(26.3); // "One month" @ 26.35
const M2_IN = F(29.2); // "Two months" @ 29.20
const BANK_IN = F(30.3); // "you're paying the bank" @ 30.34
const TWIST = F(32.6); // "Cash back only works if you pay in full" @ 32.62
const COUPON_IN = F(36.2); // "a coupon for interest" @ 36.19
const OUTRO = F(37.65); // "Two percent back." @ 37.67
const LOOP = F(41.5);
const END = F(42.8);

const Short41Cashback: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const outro = prog(f, OUTRO, OUTRO + 14);
  const early = 1 - prog(f, F(0.3), F(0.7));

  // payoff tags (f0 + outro)
  const tagsOp = Math.max(early, outro);

  // hook: checkout
  const swipeOp = prog(f, SWIPE_IN, SWIPE_IN + 8) * (1 - prog(f, SETUP, SETUP + 8));
  const rewardOp = prog(f, REWARD_IN, REWARD_IN + 6);

  // statement
  const stmtOp = prog(f, SETUP, SETUP + 10) * (1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM));
  const minOp = prog(f, MIN_IN, MIN_IN + 6);
  const rollOp = prog(f, ROLL_IN, ROLL_IN + 6);
  const aprOp = prog(f, APR_IN, APR_IN + 6);

  // math
  const mathOp = prog(f, REVEAL, REVEAL + 8) * (1 - prog(f, LEDGER - 8, LEDGER));
  const moOp = prog(f, MO_IN, MO_IN + 6);
  const sevOp = prog(f, SEVENTEEN, SEVENTEEN + 6);

  // ledger
  const ledgerOp = prog(f, LEDGER, LEDGER + 8) * (1 - prog(f, TWIST - 8, TWIST));
  const interest = 16.67 * EASE_INOUT(prog(f, LEDGER + 4, LEDGER + 24)) + 16.67 * EASE_INOUT(prog(f, M2_IN, M2_IN + 20));
  const net = 20 - interest;
  const bankOp = prog(f, BANK_IN, BANK_IN + 6);

  // twist
  const twistOp = prog(f, TWIST, TWIST + 8) * (1 - prog(f, OUTRO - 8, OUTRO));
  const couponOp = prog(f, COUPON_IN, COUPON_IN + 6);

  const titleOp = Math.min(1, 1 - prog(f, F(0.3), F(0.7)) + prog(f, LOOP + 6, LOOP + 18));

  const SCALE = 16; // px per $
  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#1c2a28" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: '2% CASH BACK', color: TEAL },
              { text: '20% APR', color: RED },
            ]}
            subtitle="carry a balance and your reward flips"
            y={110}
            size={84}
            warm
          />
        </div>

        <Kicker text="THE BILL" color={MUTED} y={200} at={SETUP} until={F(14.4)} />
        <Kicker text="PER MONTH" color={GOLD} y={200} at={REVEAL} until={F(26.1)} />
        <Kicker text="REWARD VS INTEREST" color={RED} y={200} at={LEDGER} until={F(32.4)} />
        <Kicker text="THE ONLY WAY IT WORKS" color={TEAL} y={200} at={TWIST} until={F(37.5)} />

        {/* payoff: the two numbers + the result */}
        {tagsOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 140, right: 180, top: 600, textAlign: 'center', opacity: tagsOp }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 30 }}>
              <div style={{ padding: '24px 34px', borderRadius: 20, border: `4px solid ${TEAL}`, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 72, color: TEAL }}>+$20</div>
              <div style={{ padding: '24px 34px', borderRadius: 20, border: `4px solid ${RED}`, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 72, color: RED }}>−$33</div>
            </div>
            <div style={{ marginTop: 26, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: MUTED }}>reward vs 2 months of interest on $1,000</div>
          </div>
        ) : null}

        {/* hook: the checkout */}
        {swipeOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 190, right: 230, top: 560, opacity: swipeOp, textAlign: 'center' }}>
            <div style={{ margin: '0 auto', width: 520, height: 320, borderRadius: 28, background: 'linear-gradient(135deg, #2c6e64, #163a35)', padding: 34, textAlign: 'left', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', transform: `rotate(-4deg) translateY(${(1 - swipeOp) * 40}px)` }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: '#d0efe9' }}>CASH BACK ✦ 2%</div>
              <div style={{ width: 80, height: 60, borderRadius: 10, background: '#d9b35a', marginTop: 40 }} />
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: '#e6f4f1', marginTop: 40 }}>•••• 4021</div>
            </div>
            <div style={{ marginTop: 40, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 70, color: '#ffffff' }}>$1,000 charged</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, color: TEAL, opacity: rewardOp }}>+$20 back 🎉</div>
          </div>
        ) : null}

        {/* the statement */}
        {stmtOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 170, right: 210, top: 540, opacity: stmtOp }}>
            <div style={{ background: '#ece6d8', borderRadius: 10, padding: '30px 36px', transform: 'rotate(1deg)' }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: '#6b6f76', letterSpacing: 4 }}>STATEMENT</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 34, color: INK }}>
                <span>balance</span><span>$1,000.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 34, color: '#c0392b', opacity: minOp, background: `rgba(245,215,110,${0.5 * minOp})`, borderRadius: 6, padding: '0 6px' }}>
                <span>minimum due</span><span>$35.00</span>
              </div>
            </div>
            <div style={{ marginTop: 40, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: GOLD, opacity: rollOp }}>the rest rolls over ↻</div>
            <div style={{ marginTop: 24, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, color: RED, opacity: aprOp }}>~20% APR</div>
          </div>
        ) : null}

        {/* the monthly math */}
        {mathOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 100, right: 160, top: 580, textAlign: 'center', opacity: mathOp }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, color: '#ffffff' }}>20% ÷ 12</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: GOLD, opacity: moOp }}>≈ 1.7% / month</div>
            <div style={{ marginTop: 40, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 70, color: '#e6e9ee', opacity: sevOp }}>× $1,000 =</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 150, color: RED, opacity: sevOp }}>$17</div>
          </div>
        ) : null}

        {/* the ledger */}
        {ledgerOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 150, right: 190, top: 540, opacity: ledgerOp }}>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: MUTED }}>cash back</div>
            <div style={{ height: 90, width: 20 * SCALE, borderRadius: 12, background: TEAL, display: 'flex', alignItems: 'center', paddingLeft: 20, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 50, color: INK }}>+$20</div>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: MUTED, marginTop: 30 }}>interest {f >= M2_IN ? '· 2 months' : '· 1 month'}</div>
            <div style={{ height: 90, width: Math.max(8, interest * SCALE), borderRadius: 12, background: RED, display: 'flex', alignItems: 'center', paddingLeft: 20, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 50, color: INK, overflow: 'hidden' }}>−${Math.round(interest)}</div>
            <div style={{ marginTop: 50, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 130, color: net >= 0 ? TEAL : RED }}>
              {net >= 0 ? '+' : '−'}${Math.abs(Math.round(net))}
            </div>
            <div style={{ textAlign: 'center', fontFamily: FONT_BODY, fontWeight: 600, fontSize: 40, color: '#e6e9ee', opacity: bankOp }}>you're paying to use the card</div>
          </div>
        ) : null}

        {/* the twist */}
        {twistOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 140, right: 180, top: 560, opacity: twistOp }}>
            <div style={{ padding: '30px 34px', borderRadius: 20, border: `3px solid ${TEAL}`, background: 'rgba(77,184,168,0.07)', textAlign: 'center' }}>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 40, color: '#e6e9ee' }}>pay in full, every month</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 90, color: TEAL }}>+$20 ✓</div>
            </div>
            <div style={{ marginTop: 30, padding: '30px 34px', borderRadius: 20, border: `3px dashed ${RED}`, textAlign: 'center', opacity: couponOp }}>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 40, color: '#e6e9ee' }}>carry a balance</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 70, color: RED }}>a coupon for interest</div>
            </div>
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="how long until your $20 is gone?" durSec={4.85} accent={GOLD} y={1000} />
      </Sequence>

      <Captions lines={VO} y={1450} accent={TEAL} />
      <ProgressBar color={TEAL} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75, whiteSpace: 'nowrap' }}>
        avg APR ~20% (Bankrate) · simplified · not advice
      </div>
    </AbsoluteFill>
  );
};

export default Short41Cashback;
