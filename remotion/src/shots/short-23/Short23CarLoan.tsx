import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #8: the 72-month car loan
// =============================================================================
export const compositionConfig = {
  id: 'Short23CarLoan',
  durationInSeconds: 39.4,
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

// THE MATH: $40,000 at 7% APR (example rate), standard amortization.
const PRICE = 40_000;
const R = 0.07 / 12;
const pmt = (n: number) => (PRICE * R) / (1 - Math.pow(1 + R, -n));
const LOANS = [48, 72, 84].map((n) => ({ n, pmt: pmt(n), interest: pmt(n) * n - PRICE }));
const EXTRA = LOANS[1].interest - LOANS[0].interest; // ~3,124

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(5.0);
const SETUP = F(5.6);
const C48_IN = F(8.8); // "Over four years, the payment is nine fifty-eight a month." @ 8.80
const P48_IN = F(10.3);
const C72_IN = F(12.6); // "Stretch it to six years, and it drops to six eighty-two." @ 12.60
const P72_IN = F(14.45);
const PAUSE_FROM = F(16.5); // "Pause." @ 16.60
const PAUSE_DUR = F(3.6);
const I48_IN = F(21.0); // "about six thousand in interest" @ 21.07–22.6
const I72_IN = F(23.7); // "Six years: over nine thousand." @ 23.32–24.9
const EXTRA_IN = F(24.8);
const COUNT_IN = F(26.5); // "spreads more interest over more months" @ 26.89–29.0
const C84_IN = F(30.2); // "Seven years?" @ 30.20
const I84_IN = F(31.75); // "Over ten thousand in interest" @ 31.73
const OLD_IN = F(33.6); // "on a car that's seven years old" @ 33.45–34.9
const LOOP = F(37.9); // after "A smaller payment isn't a cheaper car." @ 35.80–37.84
const END = F(39.4);

const BASE = 1060;
const PX = 0.0098; // px per dollar
const CX = [250, 520, 790];
const CW = 190;

const money0 = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;

const Short23CarLoan: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const setupOff = prog(f, SETUP, SETUP + 10);
  const restore = prog(f, LOOP, LOOP + 12);
  const pay = (on: number) => Math.max(1 - setupOff, on, restore);

  const colOn = [pay(prog(f, C48_IN, C48_IN + 12)), pay(prog(f, C72_IN, C72_IN + 12)), pay(prog(f, C84_IN, C84_IN + 12))];
  const pmtOn = [pay(prog(f, P48_IN, P48_IN + 8)), pay(prog(f, P72_IN, P72_IN + 8)), pay(prog(f, C84_IN + 10, C84_IN + 18))];
  const intOn = [
    pay(EASE_INOUT(prog(f, I48_IN, I48_IN + 14))),
    pay(EASE_INOUT(prog(f, I72_IN, I72_IN + 14))),
    pay(EASE_INOUT(prog(f, I84_IN, I84_IN + 14))),
  ];
  const extraOp = pay(prog(f, EXTRA_IN, EXTRA_IN + 8));
  const countOp = prog(f, COUNT_IN, COUNT_IN + 8) * (1 - prog(f, C84_IN - 6, C84_IN));
  const oldOp = prog(f, OLD_IN, OLD_IN + 8) * (1 - prog(f, LOOP, LOOP + 8));

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 26));
  const stampOp = Math.min(1, 1 - prog(f, SETUP, SETUP + 8) + prog(f, LOOP + 10, LOOP + 22));
  const priceOp = prog(f, SETUP + 10, SETUP + 18) * (1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#2a1c22" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'LOWER PAYMENT', color: '#ffffff' },
              { text: `+${money0(EXTRA)} COST`, color: RED },
            ]}
            subtitle="$40,000 car · 7% APR (example)"
            y={130}
            size={80}
            warm
          />
        </div>

        <Kicker text="$40,000 CAR · 7% APR" color={GOLD} y={200} at={SETUP} until={F(16.4)} />
        <Kicker text="TOTAL INTEREST" color={RED} y={200} at={F(20.2)} until={F(30.0)} />
        <Kicker text="NOW 7 YEARS" color={RED} y={200} at={C84_IN} until={F(35.6)} />
        <Kicker text="PAYMENT ≠ PRICE" color={GOLD} y={200} at={F(35.8)} until={F(37.8)} />

        {priceOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', opacity: priceOp, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, color: '#ffffff' }}>
            $40,000 <span style={{ color: GOLD }}>@ 7%</span>
          </div>
        ) : null}

        <div style={{ position: 'absolute', left: 140, width: 800, top: BASE, borderTop: '3px solid rgba(255,255,255,0.3)' }} />
        {LOANS.map((l, i) => {
          const op = colOn[i];
          if (op <= 0.01) return null;
          const pH = PRICE * PX;
          const iH = l.interest * PX * intOn[i];
          const x = CX[i] - CW / 2;
          return (
            <div key={l.n} style={{ opacity: op }}>
              <div style={{ position: 'absolute', left: x, width: CW, top: BASE - pH, height: pH, borderRadius: '4px 4px 4px 4px', background: 'linear-gradient(180deg, #5b6472, #3c434d)' }} />
              <div style={{ position: 'absolute', left: x, width: CW, top: BASE - pH - iH, height: iH, borderRadius: '12px 12px 0 0', background: RED, boxShadow: iH > 2 ? `0 0 24px ${RED}66` : 'none' }} />
              <div style={{ position: 'absolute', left: x - 30, width: CW + 60, top: BASE - pH - iH - 62, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 50, color: RED, opacity: intOn[i] }}>
                +{money0(l.interest)}
              </div>
              <div style={{ position: 'absolute', left: x, width: CW, top: BASE - pH / 2 - 26, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: '#d8dde4' }}>
                {l.n / 12} YRS
              </div>
              <div style={{ position: 'absolute', left: x - 30, width: CW + 60, top: BASE + 18, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 40, color: GOLD, opacity: pmtOn[i] }}>
                ${Math.round(l.pmt)}/mo
              </div>
              <div style={{ position: 'absolute', left: x - 30, width: CW + 60, top: BASE + 70, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: MUTED, opacity: countOp }}>
                × {l.n} payments
              </div>
            </div>
          );
        })}

        {/* +$3,124 bracket between 4 and 6 years */}
        {extraOp > 0.01 ? (
          <div style={{ position: 'absolute', left: CX[0], width: CX[1] - CX[0], top: BASE - PRICE * PX - LOANS[1].interest * PX - 130, textAlign: 'center', opacity: extraOp }}>
            <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 36, color: '#ffffff', background: 'rgba(15,18,22,0.92)', border: `2px solid ${RED}`, borderRadius: 12, padding: '4px 12px' }}>
              +{money0(EXTRA)}
            </span>
          </div>
        ) : null}

        {oldOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center', opacity: oldOp, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 42, color: MUTED }}>
            still paying on a 7-year-old car
          </div>
        ) : null}

        <div style={{ opacity: stampOp }}>
          <Stamp text="SMALLER PAYMENT ≠ CHEAPER" at={-14} color={RED} x={540} y={1250} size={52} rotate={-5} />
        </div>
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="which loan costs more in total?" durSec={3.6} accent={GOLD} y={1200} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={RED} />
      <ProgressBar color={RED} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 26, color: MUTED, opacity: 0.75 }}>
        example: $40,000 at 7% APR, standard amortization
      </div>
    </AbsoluteFill>
  );
};

export default Short23CarLoan;
