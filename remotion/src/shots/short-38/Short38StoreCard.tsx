import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #19: Black Friday store card (immersive)
// =============================================================================
export const compositionConfig = {
  id: 'Short38StoreCard',
  durationInSeconds: 44.8,
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

// THE MATH: $600 TV − 20% = $480 on the store card. Bankrate 2025: retail cards avg 30.14% APR (general ~19.7%).
// $25/mo at 30% APR -> 27 months, $182 interest (monthly sim). Saved $120 -> net −$62.

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const POS_IN = F(1.75); // "The cashier leans in" @ 1.78
const OFFER_IN = F(3.8); // "open our card" @ 3.84
const HOOK_OUT = F(6.3);
const SETUP = F(6.5); // "You're buying a six hundred dollar TV" @ 6.55
const TV_IN = F(7.25);
const OFF_IN = F(8.35); // "Twenty percent off" @ 8.38
const SAVED_IN = F(10.0); // "saved a hundred and twenty" @ 10.03
const ONCARD_IN = F(11.95); // "Four eighty goes on the new card" @ 11.97
const APR_IN = F(15.6); // "thirty percent APR" @ 15.65
const REG_IN = F(17.3); // "One and a half times a regular card" @ 17.34
const PLAN_IN = F(20.7); // "twenty-five a month" @ 20.72
const PAUSE_FROM = F(22.5); // "Pause." @ 22.51
const PAUSE_DUR = F(2.95);
const REVEAL = F(25.5); // "Twenty-seven months" @ 25.54
const INT_IN = F(28.9); // "a hundred and eighty-two dollars" @ 28.91
const SCORE = F(30.65); // "You saved a hundred and twenty" @ 30.67
const PAID_IN = F(32.6); // "You paid a hundred eighty-two" @ 32.61
const NET_IN = F(34.8); // "sixty-two dollars" @ 34.82
const TWIST = F(36.5); // "The discount only wins if" @ 36.56
const OUTRO = F(40.35); // "Save twenty percent today." @ 40.38
const LOOP = F(43.6);
const END = F(44.8);

// the card terminal on the counter
const Terminal: React.FC<{ op: number; hi: number; stamp: number }> = ({ op, hi, stamp }) => (
  <div style={{ position: 'absolute', left: 200, width: 680, top: 560, opacity: op }}>
    <div style={{ borderRadius: 36, background: '#1d232b', border: '6px solid #2f3742', padding: 30, boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
      <div style={{ borderRadius: 18, background: '#e9f1f7', padding: '34px 28px', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: '#5b6672', letterSpacing: 3 }}>BLACK FRIDAY</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: '#0f1216', marginTop: 8 }}>Open our card</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: '#c0392b' }}>SAVE 20%</div>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 30, color: '#3a3f47' }}>on today's purchase!</div>
        <div style={{ display: 'flex', gap: 20, marginTop: 26, justifyContent: 'center' }}>
          <div style={{ padding: '16px 50px', borderRadius: 14, background: '#2e9e5b', color: '#fff', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, transform: `scale(${1 + 0.08 * hi})`, boxShadow: hi > 0.1 ? `0 0 ${30 * hi}px #2e9e5b` : 'none' }}>YES</div>
          <div style={{ padding: '16px 50px', borderRadius: 14, background: '#c9d2da', color: '#5b6672', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44 }}>no</div>
        </div>
      </div>
    </div>
    {stamp > 0.01 ? (
      <div style={{ position: 'absolute', right: -20, bottom: -60, transform: `rotate(-8deg) scale(${1.4 - 0.4 * stamp})`, opacity: stamp, border: `5px solid ${RED}`, borderRadius: 12, padding: '8px 22px', background: INK, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: RED }}>
        ~30% APR
      </div>
    ) : null}
  </div>
);

const Short38StoreCard: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const setupOff = prog(f, SETUP, SETUP + 10);
  const outro = prog(f, OUTRO, OUTRO + 14);

  // the terminal: f0 + hook + outro
  const termOp = Math.max(f < POS_IN ? 1 : 0, prog(f, POS_IN, POS_IN + 8) * (1 - setupOff), outro);
  const hi = f < POS_IN ? 1 : Math.max(prog(f, OFFER_IN + 20, OFFER_IN + 30), outro);
  const stamp = Math.max(1 - prog(f, F(0.3), F(0.6)), outro);

  // receipt
  const rcptOp = prog(f, SETUP, SETUP + 10) * (1 - prog(f, APR_IN - 10, APR_IN - 2));
  const tvOp = prog(f, TV_IN, TV_IN + 6);
  const offOp = prog(f, OFF_IN, OFF_IN + 6);
  const savedOp = prog(f, SAVED_IN, SAVED_IN + 6);
  const onCardOp = prog(f, ONCARD_IN, ONCARD_IN + 6);

  // APR bars + plan
  const aprOp = prog(f, APR_IN - 6, APR_IN + 4) * (1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM));
  const aprGrow = EASE_INOUT(prog(f, APR_IN, APR_IN + 16));
  const regOp = prog(f, REG_IN, REG_IN + 8);
  const planOp = prog(f, PLAN_IN, PLAN_IN + 6);

  // months grid
  const gridOp = prog(f, REVEAL, REVEAL + 8) * (1 - prog(f, SCORE - 8, SCORE));
  const months = Math.min(27, Math.floor(27 * prog(f, REVEAL + 4, INT_IN - 6)) + (f >= REVEAL ? 1 : 0));
  const intOp = prog(f, INT_IN, INT_IN + 6);

  // scoreboard
  const scoreOp = prog(f, SCORE, SCORE + 8) * (1 - prog(f, OUTRO - 8, OUTRO));
  const paidOp = prog(f, PAID_IN, PAID_IN + 6);
  const netOp = prog(f, NET_IN, NET_IN + 6);
  const netPop = 1 + 0.12 * (1 - EASE_INOUT(prog(f, NET_IN, NET_IN + 10)));
  const winOp = prog(f, TWIST, TWIST + 8);

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 6, LOOP + 18));

  const line = (k: string, v: string, color: string, op: number, big = false) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', opacity: op, borderBottom: '2px dashed rgba(15,18,22,0.25)' }}>
      <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: big ? 38 : 32, color: '#3a3f47' }}>{k}</span>
      <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: big ? 44 : 34, color }}>{v}</span>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#2a1c20" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'SAVE 20% TODAY', color: '#ffffff' },
              { text: 'PAY 30% ALL YEAR', color: RED },
            ]}
            subtitle="the Black Friday store card, in real math"
            y={110}
            size={76}
            warm
          />
        </div>

        <Kicker text="YOUR RECEIPT" color={TEAL} y={200} at={SETUP} until={F(15.2)} />
        <Kicker text="THE CARD'S RATE" color={RED} y={200} at={F(15.3)} until={F(22.3)} />
        <Kicker text="PAYING $25 A MONTH" color={GOLD} y={200} at={REVEAL} until={F(30.4)} />
        <Kicker text="THE SCORE" color={RED} y={200} at={SCORE} until={F(40.1)} />

        <Terminal op={termOp} hi={hi} stamp={stamp} />

        {/* the receipt */}
        {rcptOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 190, right: 230, top: 560, padding: '30px 40px', background: '#ece6d8', borderRadius: 8, transform: 'rotate(-1.2deg)', opacity: rcptOp, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: '#6b6f76', letterSpacing: 4, marginBottom: 8 }}>RECEIPT</div>
            {line('65" TV', '$600.00', INK, tvOp)}
            {line('CARD DISCOUNT 20%', '−$120.00', '#2e7d4f', offOp)}
            {line('ON NEW STORE CARD', '$480.00', '#c0392b', onCardOp, true)}
            <div style={{ textAlign: 'center', marginTop: 18, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: '#2e7d4f', opacity: savedOp }}>you saved $120!</div>
          </div>
        ) : null}

        {/* APR comparison + the plan */}
        {aprOp > 0.01 ? (
          <div style={{ opacity: aprOp }}>
            {[
              { k: 'store card', v: 30.1, c: RED, op: 1 },
              { k: 'regular card', v: 19.7, c: MUTED, op: regOp },
            ].map((r, i) => (
              <div key={r.k} style={{ position: 'absolute', left: 140, width: 780, top: 600 + i * 150, opacity: r.op }}>
                <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: MUTED, marginBottom: 8 }}>{r.k}</div>
                <div style={{ height: 80, width: (780 * r.v * (i === 0 ? aprGrow : 1)) / 32, borderRadius: 12, background: r.c, display: 'flex', alignItems: 'center', paddingLeft: 20, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: INK }}>
                  {r.v}%
                </div>
              </div>
            ))}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 72, color: GOLD, opacity: planOp }}>your plan: $25/mo</div>
          </div>
        ) : null}

        {/* the months */}
        {gridOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 150, right: 190, top: 520, opacity: gridOp, textAlign: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 12 }}>
              {Array.from({ length: 27 }, (_, i) => (
                <div key={i} style={{ height: 70, borderRadius: 10, background: i < months ? 'rgba(239,95,107,0.85)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 22, color: i < months ? INK : MUTED }}>
                  $25
                </div>
              ))}
            </div>
            <div style={{ marginTop: 34, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 90, color: '#ffffff' }}>{months} months</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: RED, opacity: intOp }}>$182 interest</div>
          </div>
        ) : null}

        {/* the score */}
        {scoreOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 150, right: 190, top: 540, opacity: scoreOp }}>
            {[
              { k: 'discount', v: '+$120', c: TEAL, op: 1 },
              { k: 'interest', v: '−$182', c: RED, op: paidOp },
            ].map((r) => (
              <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 0', borderBottom: '2px solid rgba(255,255,255,0.12)', opacity: r.op }}>
                <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 44, color: '#e6e9ee' }}>{r.k}</span>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: r.c }}>{r.v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 0', opacity: netOp, transform: `scale(${netPop})`, transformOrigin: 'right center' }}>
              <span style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 48, color: '#ffffff' }}>you</span>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, color: RED }}>−$62</span>
            </div>
            <div style={{ marginTop: 40, padding: '22px 26px', borderRadius: 16, border: `3px solid ${TEAL}`, textAlign: 'center', opacity: winOp }}>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 38, color: '#e6e9ee' }}>pay it all before the first bill</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: TEAL }}>keep the $120</div>
            </div>
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="save $120, pay $25/mo at 30%. ahead?" durSec={2.95} accent={GOLD} y={1180} />
      </Sequence>

      <Captions lines={VO} y={1450} accent={GOLD} />
      <ProgressBar color={RED} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75, whiteSpace: 'nowrap' }}>
        avg retail card APR: Bankrate 2025 · illustrative, not advice
      </div>
    </AbsoluteFill>
  );
};

export default Short38StoreCard;
