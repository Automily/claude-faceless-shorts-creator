import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #20: your tax refund is a 0% loan you made (immersive)
// =============================================================================
export const compositionConfig = {
  id: 'Short39Refund',
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

// THE MATH: $3,000 refund = $250/mo over-withheld.
// Savings at 4% (monthly deposits, 12 mo): +$55.62.
// $3,000 card balance at 22%: pay $250/mo -> $409 interest in 12 mo; pay lump at month 12 -> $731. Difference ≈ $322.

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const EMAIL_IN = F(1.6); // "An email" @ 1.62
const AMT_IN = F(4.4); // "Three thousand dollars" @ 4.43
const BONUS_IN = F(6.3); // "bonus" @ 6.35
const HOOK_OUT = F(6.9);
const SETUP = F(7.05); // "It isn't." @ 7.09
const MONTHS_IN = F(9.5); // "You overpaid two hundred fifty dollars every single month" @ 9.52 – 12.6
const MONTHS_END = F(12.6);
const HELD_IN = F(13.65); // "The government held it all year" @ 13.68
const ZERO_IN = F(16.42); // "zero interest" @ 16.45
const PAUSE_FROM = F(18.25); // "Pause." @ 18.26
const PAUSE_DUR = F(4.6);
const REVEAL = F(23.45); // "In a savings account at four percent" @ 23.47
const SAV_NUM = F(25.9); // "about fifty-five dollars more" @ 25.92
const CARD_IN = F(27.9); // "Against a credit card at twenty-two percent" @ 27.94
const CARD_NUM = F(30.72); // "three hundred twenty dollars" @ 30.75
const TWIST = F(33.45); // "A big refund isn't a win." @ 33.49
const LOAN_IN = F(35.55); // "It's a year-long, zero percent loan." @ 35.59
const FROMYOU_IN = F(38.35); // "From you." @ 38.38
const OUTRO = F(39.65); // "Your refund is approved." @ 39.69
const LOOP = F(43.6);
const END = F(44.8);

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

const Phone: React.FC<{ op: number; mail: number; amt: number; bonus: number; stamp: number }> = ({ op, mail, amt, bonus, stamp }) => (
  <div style={{ position: 'absolute', left: 250, width: 580, top: 500, height: 800, borderRadius: 60, border: '10px solid #2b3038', background: '#151a20', opacity: op, padding: '70px 30px' }}>
    <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: MUTED }}>INBOX</div>
    <div style={{ marginTop: 20, padding: '26px 24px', borderRadius: 22, background: '#232a33', opacity: mail, transform: `translateY(${(1 - mail) * 30}px)` }}>
      <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 24, color: MUTED }}>Tax refund status</div>
      <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 38, color: '#e6e9ee', marginTop: 6 }}>Your refund is approved ✅</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, color: TEAL, opacity: amt, marginTop: 10 }}>$3,000</div>
    </div>
    <div style={{ marginTop: 40, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: GOLD, opacity: bonus }}>🎉 a bonus?</div>
    {stamp > 0.01 ? (
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 90, textAlign: 'center', transform: `rotate(-6deg) scale(${1.4 - 0.4 * stamp})`, opacity: stamp, border: `5px solid ${RED}`, borderRadius: 12, padding: '10px 16px', background: INK, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: RED, whiteSpace: 'nowrap' }}>
        your money · 0% interest
      </div>
    ) : null}
  </div>
);

const Short39Refund: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const setupOff = prog(f, SETUP, SETUP + 10);
  const outro = prog(f, OUTRO, OUTRO + 14);

  // the phone: f0, hook, outro
  const phoneOp = Math.max(1 - setupOff, outro);
  const mail = Math.max(f < EMAIL_IN ? 1 : 0, prog(f, EMAIL_IN, EMAIL_IN + 8), outro);
  const amt = Math.max(f < EMAIL_IN ? 1 : 0, prog(f, AMT_IN, AMT_IN + 6), outro);
  const bonus = prog(f, BONUS_IN - 4, BONUS_IN + 4) * (1 - outro);
  const stamp = Math.max(1 - prog(f, F(0.3), F(0.6)), prog(f, F(42.4), F(42.8)));

  // the twelve months
  const monthsOp = prog(f, SETUP, SETUP + 10) * (1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM));
  const monthsFilled = 12 * prog(f, MONTHS_IN, MONTHS_END);
  const heldOp = prog(f, HELD_IN, HELD_IN + 8);
  const zeroOp = prog(f, ZERO_IN, ZERO_IN + 6);
  const zeroPop = 1 + 0.15 * (1 - EASE_INOUT(prog(f, ZERO_IN, ZERO_IN + 10)));

  // the alternatives
  const altOp = prog(f, REVEAL, REVEAL + 8) * (1 - prog(f, TWIST - 8, TWIST));
  const savNumOp = prog(f, SAV_NUM, SAV_NUM + 6);
  const cardOp = prog(f, CARD_IN, CARD_IN + 8);
  const cardNumOp = prog(f, CARD_NUM, CARD_NUM + 6);

  // the loan
  const loanOp = prog(f, TWIST, TWIST + 8) * (1 - prog(f, OUTRO - 8, OUTRO));
  const loan2Op = prog(f, LOAN_IN, LOAN_IN + 6);
  const fromYouOp = prog(f, FROMYOU_IN, FROMYOU_IN + 6);

  const titleOp = Math.min(1, 1 - prog(f, F(0.4), F(0.8)) + prog(f, LOOP + 6, LOOP + 18));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#1c2a28" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'YOUR TAX REFUND', color: '#ffffff' },
              { text: 'IS A 0% LOAN. FROM YOU.', color: GOLD },
            ]}
            subtitle="$3,000 back = $250 a month you lent out"
            y={110}
            size={68}
            warm
          />
        </div>

        <Kicker text="EVERY PAYCHECK" color={RED} y={200} at={SETUP} until={F(18.1)} />
        <Kicker text="WHAT $250/MO COULD DO" color={TEAL} y={200} at={REVEAL} until={F(33.3)} />
        <Kicker text="THE TRUTH" color={GOLD} y={200} at={TWIST} until={F(39.5)} />

        <Phone op={phoneOp} mail={mail} amt={amt} bonus={bonus} stamp={stamp} />

        {/* twelve months of over-withholding */}
        {monthsOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 140, right: 180, top: 520, opacity: monthsOp, textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 70, color: '#ffffff', marginBottom: 30 }}>it isn't. it's yours.</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
              {MONTHS.map((m, i) => {
                const on = Math.max(0, Math.min(1, monthsFilled - i));
                return (
                  <div key={i} style={{ height: 120, borderRadius: 14, border: `3px solid ${on > 0.5 ? RED : 'rgba(255,255,255,0.15)'}`, background: on > 0.5 ? 'rgba(239,95,107,0.15)' : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: MUTED }}>{m}</div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, color: RED, opacity: on }}>−$250</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 50, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 42, color: '#e6e9ee', opacity: heldOp }}>held all year · interest paid to you:</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 150, color: RED, opacity: zeroOp, transform: `scale(${zeroPop})` }}>$0</div>
          </div>
        ) : null}

        {/* what $250 a month could have done */}
        {altOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 140, right: 180, top: 560, opacity: altOp }}>
            <div style={{ padding: '30px 34px', borderRadius: 20, border: `3px solid ${TEAL}`, background: 'rgba(77,184,168,0.07)' }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: MUTED }}>savings account · 4%</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: TEAL, opacity: savNumOp }}>+$55</div>
            </div>
            <div style={{ marginTop: 30, padding: '30px 34px', borderRadius: 20, border: `3px solid ${GOLD}`, background: 'rgba(245,215,110,0.06)', opacity: cardOp }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: MUTED }}>paying down a 22% card</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: GOLD, opacity: cardNumOp }}>−$322 <span style={{ fontFamily: FONT_BODY, fontSize: 40, color: '#e6e9ee' }}>interest</span></div>
            </div>
          </div>
        ) : null}

        {/* the loan */}
        {loanOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 120, right: 160, top: 560, textAlign: 'center', opacity: loanOp }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: '#ffffff' }}>a big refund</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: RED }}>isn't a win</div>
            <div style={{ marginTop: 50, padding: '30px 20px', borderRadius: 20, border: `3px dashed ${GOLD}`, opacity: loan2Op }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: GOLD }}>12-month loan · 0%</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: '#ffffff', opacity: fromYouOp, marginTop: 10 }}>lender: <span style={{ color: TEAL }}>YOU</span></div>
            </div>
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="what could $250 a month have done instead?" durSec={4.6} accent={GOLD} y={1000} />
      </Sequence>

      <Captions lines={VO} y={1450} accent={GOLD} />
      <ProgressBar color={TEAL} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75, whiteSpace: 'nowrap' }}>
        illustrative · your withholding depends on you · not tax advice
      </div>
    </AbsoluteFill>
  );
};

export default Short39Refund;
