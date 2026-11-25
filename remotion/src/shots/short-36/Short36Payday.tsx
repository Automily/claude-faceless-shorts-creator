import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #17: the payday loan (immersive, second person)
// =============================================================================
export const compositionConfig = {
  id: 'Short36Payday',
  durationInSeconds: 47.9,
  fps: 30,
  width: 1080,
  height: 1920,
};

const TEAL = '#4db8a8';
const GOLD = '#f5d76e';
const RED = '#ef5f6b';
const NEON = '#ff4f8b';
const MUTED = '#8b96a5';
const INK = '#0f1216';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// THE MATH (CFPB): $15 per $100 for 14 days -> 15% x 26 = 390% (CFPB: 391%).
// $400 loan, $60 fee. Roll over 5x -> $300 in fees, still owe $400.
// CFPB: within a month, almost 70% of payday borrowers take out a second payday loan.

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const PHONE_IN = F(0.35); // "You're four hundred dollars short." @ 0.40
const RENT_IN = F(2.5); // "Rent is due Friday." @ 2.54
const SIGN_IN = F(4.35); // "The sign says" @ 4.41
const HOOK_OUT = F(8.8);
const SETUP = F(9.0); // "You walk in." @ 9.04
const CASH_IN = F(10.5); // "four hundred dollars" @ 10.52
const FEE_IN = F(11.85); // "The fee is sixty" @ 11.86
const DUE_IN = F(12.65); // "due in two weeks" @ 12.66
const PCT_IN = F(14.0); // "Fifteen percent." @ 14.01
const CARD_IN = F(16.45); // "like a credit card" @ 16.49
const PAUSE_FROM = F(18.0); // "Pause." @ 18.0
const PAUSE_DUR = F(3.5);
const REVEAL = F(21.55); // "Fifteen percent every two weeks" @ 21.59
const X26_IN = F(23.55); // "Twenty-six of those" @ 23.56
const APR_IN = F(25.05); // "Three hundred ninety percent" @ 25.08
const TWIST = F(26.7); // "Two weeks later" @ 26.76
const ATE_IN = F(27.7); // "rent ate your paycheck" @ 27.71
const ROLL_IN = F(30.9); // "roll it over" @ 30.95
const FIVE_IN = F(32.6); // "Do that five times" @ 32.66
const PAID_IN = F(34.55); // "three hundred dollars" @ 34.57
const OWE_IN = F(36.0); // "still owe the four hundred" @ 36.03
const STAT = F(38.15); // "Federal regulators found" @ 38.21
const SEVENTY_IN = F(39.75); // "seventy percent" @ 39.76
const OUTRO = F(43.8); // "Cash today." @ 43.86
const LOOP = F(46.7);
const END = F(47.9);

// the neon storefront sign
const Sign: React.FC<{ f: number; op: number; apr: number }> = ({ f, op, apr }) => {
  const flick = 0.85 + 0.15 * Math.sin(f * 0.9) * Math.sin(f * 0.37);
  return (
    <div style={{ position: 'absolute', left: 130, right: 170, top: 660, opacity: op }}>
      <div style={{ border: `6px solid ${NEON}`, borderRadius: 26, padding: '40px 20px', textAlign: 'center', boxShadow: `0 0 ${50 * flick}px ${NEON}, inset 0 0 ${30 * flick}px ${NEON}`, background: 'rgba(255,79,139,0.06)' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, color: '#fff3f8', textShadow: `0 0 ${24 * flick}px ${NEON}`, letterSpacing: 4 }}>CASH TODAY</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: GOLD, marginTop: 10 }}>just $15 per $100</div>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: MUTED, marginTop: 18 }}>no credit check · walk-ins welcome</div>
      </div>
      {apr > 0.01 ? (
        <div style={{ position: 'absolute', right: -10, bottom: -70, transform: `rotate(-8deg) scale(${1.4 - 0.4 * apr})`, opacity: apr, border: `5px solid ${RED}`, borderRadius: 12, padding: '8px 22px', background: INK, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: RED }}>
          = 390% APR
        </div>
      ) : null}
    </div>
  );
};

const Short36Payday: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const outro = prog(f, OUTRO, OUTRO + 14);

  // hook: frame 0 = sign + 390% stamp (payoff); then the phone, then the sign again
  const phoneOp = prog(f, PHONE_IN, PHONE_IN + 8) * (1 - prog(f, SIGN_IN - 6, SIGN_IN + 2));
  const signOp = Math.max(f < PHONE_IN ? 1 : 0, prog(f, SIGN_IN, SIGN_IN + 8) * (1 - prog(f, HOOK_OUT, SETUP + 6)), outro);
  const signApr = Math.max(1 - prog(f, PHONE_IN, PHONE_IN + 6), outro);
  const rentOp = prog(f, RENT_IN, RENT_IN + 6);

  // the counter: cash + receipt
  const counterOp = prog(f, SETUP, SETUP + 10) * (1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM));
  const cash = EASE_INOUT(prog(f, CASH_IN, CASH_IN + 16));
  const feeOp = prog(f, FEE_IN, FEE_IN + 6);
  const dueOp = prog(f, DUE_IN, DUE_IN + 6);
  const pctOp = prog(f, PCT_IN, PCT_IN + 6);
  const cardOp = prog(f, CARD_IN, CARD_IN + 6);

  // the APR math
  const mathOp = prog(f, REVEAL, REVEAL + 8) * (1 - prog(f, TWIST - 8, TWIST));
  const x26Op = prog(f, X26_IN, X26_IN + 6);
  const aprOp = prog(f, APR_IN, APR_IN + 6);
  const aprPop = 1 + 0.12 * (1 - EASE_INOUT(prog(f, APR_IN, APR_IN + 10)));

  // the rollover trap
  const trapOp = prog(f, TWIST, TWIST + 10) * (1 - prog(f, STAT - 8, STAT));
  const ateOp = prog(f, ATE_IN, ATE_IN + 6);
  const rollOp = prog(f, ROLL_IN, ROLL_IN + 6);
  const chips = f < FIVE_IN ? (f >= ROLL_IN ? 1 : 0) : Math.min(5, 1 + Math.floor(4 * prog(f, FIVE_IN, FIVE_IN + 40)));
  const paidOp = prog(f, PAID_IN, PAID_IN + 6);
  const oweOp = prog(f, OWE_IN, OWE_IN + 6);

  // the stat
  const statOp = prog(f, STAT, STAT + 10) * (1 - prog(f, OUTRO - 8, OUTRO));
  const ring = EASE_INOUT(prog(f, SEVENTY_IN, SEVENTY_IN + 20));

  const titleOp = Math.min(1, 1 - prog(f, F(0.3), F(0.7)) + prog(f, LOOP + 6, LOOP + 18));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#2a1626" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'THE PAYDAY LOAN', color: '#ffffff' },
              { text: '$15 PER $100 = 390%', color: RED },
            ]}
            subtitle="you're $400 short. rent's due Friday."
            y={110}
            size={76}
            warm
          />
        </div>

        <Kicker text="AT THE COUNTER" color={TEAL} y={200} at={SETUP} until={F(17.8)} />
        <Kicker text="AS AN APR" color={GOLD} y={200} at={REVEAL} until={F(26.5)} />
        <Kicker text="TWO WEEKS LATER" color={RED} y={200} at={TWIST} until={F(38.0)} />
        <Kicker text="CFPB DATA" color={TEAL} y={200} at={STAT} until={F(43.6)} />

        {/* your phone: the problem */}
        {phoneOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 250, width: 580, top: 520, height: 760, borderRadius: 60, border: '10px solid #2b3038', background: '#151a20', opacity: phoneOp, transform: `translateY(${(1 - phoneOp) * 60}px)`, padding: '70px 34px' }}>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: MUTED }}>CHECKING</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: '#ffffff' }}>$800</div>
            <div style={{ marginTop: 40, padding: '24px 26px', borderRadius: 22, background: '#232a33', opacity: rentOp }}>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 30, color: '#e6e9ee' }}>🏠 Rent due Friday</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: RED }}>$1,200</div>
            </div>
            <div style={{ marginTop: 40, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: RED, opacity: rentOp }}>−$400 short</div>
          </div>
        ) : null}

        <Sign f={f} op={signOp} apr={signApr} />

        {/* at the counter */}
        {counterOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 120, right: 160, top: 600, opacity: counterOp, textAlign: 'center' }}>
            {/* cash slides across the counter */}
            <div style={{ position: 'relative', height: 220 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ position: 'absolute', left: 230 + i * 18 - 500 * (1 - cash), top: 20 + i * 14, width: 300, height: 140, borderRadius: 12, background: '#3f7a52', border: '4px solid #2a5236', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: '#d7f0dc', opacity: cash }}>$100</div>
              ))}
            </div>
            <div style={{ marginTop: 40, display: 'inline-block', textAlign: 'left', background: '#ece6d8', borderRadius: 8, padding: '22px 36px', transform: 'rotate(1.5deg)', opacity: feeOp }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: '#3a3f47' }}>LOAN ........ $400</div>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: '#c0392b' }}>FEE ......... $60</div>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: '#3a3f47', opacity: dueOp }}>DUE ..... in 14 days</div>
            </div>
            <div style={{ marginTop: 34, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: GOLD, opacity: pctOp }}>
              15%<span style={{ fontFamily: FONT_BODY, fontSize: 44, color: '#e6e9ee', opacity: cardOp }}> ≈ a credit card?</span>
            </div>
          </div>
        ) : null}

        {/* the APR math */}
        {mathOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 100, right: 160, top: 620, textAlign: 'center', opacity: mathOp }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 90, color: '#ffffff' }}>15% <span style={{ fontFamily: FONT_MONO, fontSize: 40, color: MUTED }}>/ 2 weeks</span></div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: '#e6e9ee', opacity: x26Op, marginTop: 20 }}>× 26</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 150, color: RED, opacity: aprOp, transform: `scale(${aprPop})`, marginTop: 30 }}>390%</div>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 40, color: MUTED, opacity: aprOp }}>APR</div>
          </div>
        ) : null}

        {/* the rollover trap */}
        {trapOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 120, right: 160, top: 600, textAlign: 'center', opacity: trapOp }}>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 44, color: '#e6e9ee', opacity: ateOp }}>paycheck → <span style={{ color: RED }}>rent</span></div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: GOLD, opacity: rollOp, marginTop: 16 }}>pay $60 · roll it over ↻</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 36, height: 110 }}>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} style={{ width: 130, height: 110, borderRadius: 16, background: 'rgba(239,95,107,0.18)', border: `3px solid ${RED}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: '#ffffff', opacity: i < chips ? 1 : 0.08, transform: `scale(${i < chips ? 1 : 0.9})` }}>
                  $60
                </div>
              ))}
            </div>
            <div style={{ marginTop: 40, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, color: '#ffffff', opacity: paidOp }}>$300 paid</div>
            <div style={{ marginTop: 10, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, color: RED, opacity: oweOp }}>still owe $400</div>
          </div>
        ) : null}

        {/* the stat */}
        {statOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 580, textAlign: 'center', opacity: statOp }}>
            <svg width={420} height={420} viewBox="-210 -210 420 420">
              <circle r={170} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={40} />
              <circle r={170} fill="none" stroke={RED} strokeWidth={40} strokeDasharray={`${2 * Math.PI * 170 * 0.7 * ring} 2000`} transform="rotate(-90)" strokeLinecap="round" />
              <text y={30} textAnchor="middle" fill="#ffffff" fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={110}>~{Math.round(70 * ring)}%</text>
            </svg>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 42, color: '#e6e9ee', marginTop: 20, opacity: ring }}>take a 2nd payday loan</div>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 42, color: '#e6e9ee', opacity: ring }}>within a month</div>
          </div>
        ) : null}
        <Stamp text="TRAP" color={RED} at={OWE_IN + 6} until={F(38.0)} x={540} y={1310} size={80} />
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="$60 on $400 for 2 weeks. what's the APR?" durSec={3.5} accent={GOLD} y={1180} />
      </Sequence>

      <Captions lines={VO} y={1450} accent={GOLD} />
      <ProgressBar color={RED} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75, whiteSpace: 'nowrap' }}>
        CFPB research · fees vary by state · not advice
      </div>
    </AbsoluteFill>
  );
};

export default Short36Payday;
