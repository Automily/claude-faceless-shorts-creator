import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #9: "no interest for 12 months" (deferred interest)
// =============================================================================
export const compositionConfig = {
  id: 'Short25Deferred',
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

// THE MATH: $1,200 at 29.99% APR, deferred. Pay $99.92/mo for 12 months -> $1 left.
// Interest accrued in the background on the declining balance (simplified monthly) = ~$195,
// all charged when the promo ends with any balance left.
const PRICE = 1200;
const R = 0.2999 / 12;
const PAY = 1199 / 12;
const MONTHS = Array.from({ length: 13 }, (_, m) => {
  let b = PRICE;
  let acc = 0;
  for (let k = 0; k < m; k++) {
    acc += b * R;
    b -= PAY;
  }
  return { bal: Math.max(1, b), acc };
});
const INTEREST = MONTHS[12].acc; // ~195

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(4.9);
const SETUP = F(5.8);
const ZERO_IN = F(8.2); // "Zero percent, if it's paid in full in a year." @ 8.24
const RATE_IN = F(12.5); // "about thirty percent" @ 12.52
const RUN_IN = F(13.66); // "quietly adding up the whole time" @ 13.66–15.6
const RUN_OUT = F(15.6);
const PAUSE_FROM = F(16.3); // "Pause." @ 16.40
const PAUSE_DUR = F(4.4);
const REVEAL = F(21.45); // "a hundred ninety-five dollars" @ 21.47
const ONCE_IN = F(22.9); // "all at once." @ 22.73–23.5
const DOLLAR_IN = F(25.4); // "Not on the dollar you missed." @ 25.41
const BACK_IN = F(26.6); // "On the full twelve hundred, back to day one." @ 26.59–28.9
const BACK_OUT = F(28.6);
const PRINT_IN = F(29.8); // "That's deferred interest." @ 29.80
const WORD_IN = F(34.6); // "Look for the word deferred." @ 34.69
const LOOP = F(38.0);
const END = F(39.4);

const GX = 160;
const GY = 470;
const CW = 180;
const CH = 74;
const GAP = 12;

const money0 = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;

const Short25Deferred: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const setupOff = prog(f, SETUP, SETUP + 10);
  const restore = prog(f, LOOP, LOOP + 12);

  // months elapsed: 12 at f0, 0 in the setup, run 0->12 on "quietly adding up", stays 12
  let months = 12 * (1 - setupOff);
  if (f >= RUN_IN) months = 12 * EASE_INOUT(prog(f, RUN_IN, RUN_OUT));
  if (f >= LOOP) months = 12;
  const mi = Math.floor(months);
  const frac = months - mi;
  const cur = mi >= 12 ? MONTHS[12] : { bal: MONTHS[mi].bal + (MONTHS[mi + 1].bal - MONTHS[mi].bal) * frac, acc: MONTHS[mi].acc + (MONTHS[mi + 1].acc - MONTHS[mi].acc) * frac };

  // the hidden interest becomes real on the reveal (and at f0 / loop)
  const real = Math.max(1 - setupOff, prog(f, REVEAL, REVEAL + 10), restore);
  const backFlash = (m: number) => prog(f, BACK_IN + m * 4, BACK_IN + m * 4 + 6) * (1 - prog(f, PRINT_IN - 8, PRINT_IN));

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 26));
  const stampOp = Math.max(1 - setupOff, prog(f, ONCE_IN, ONCE_IN + 8) * (1 - prog(f, DOLLAR_IN - 6, DOLLAR_IN)), prog(f, LOOP + 10, LOOP + 20));
  const zeroOp = prog(f, ZERO_IN, ZERO_IN + 8) * (1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM));
  const rateOp = prog(f, RATE_IN, RATE_IN + 8) * (1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM));
  const dollarOp = prog(f, DOLLAR_IN, DOLLAR_IN + 8) * (1 - prog(f, BACK_IN, BACK_IN + 8));
  const printOp = prog(f, PRINT_IN, PRINT_IN + 12) * (1 - prog(f, F(35.5), F(35.95)));
  const mainOp = Math.min(1, 1 - prog(f, PRINT_IN, PRINT_IN + 12) + prog(f, F(35.95), F(36.4)));
  const wordGlow = Math.max(prog(f, PRINT_IN + 6, PRINT_IN + 14) * 0.6, prog(f, WORD_IN, WORD_IN + 8));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#2a1c22" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: '"NO INTEREST FOR 12 MONTHS"', color: '#ffffff' },
              { text: 'MISS BY $1: PAY $195', color: RED },
            ]}
            subtitle="deferred interest"
            y={110}
            size={58}
            warm
          />
        </div>

        <Kicker text="$1,200 TV · STORE CARD" color={GOLD} y={200} at={SETUP} until={F(16.2)} />
        <Kicker text="THE PROMO ENDS" color={RED} y={200} at={F(20.8)} until={F(29.6)} />
        <Kicker text="READ THE FINE PRINT" color={GOLD} y={200} at={PRINT_IN} until={F(35.8)} />

        <div style={{ opacity: mainOp }}>
          {/* 12 months */}
          {Array.from({ length: 12 }, (_, m) => {
            const c = m % 4;
            const r = Math.floor(m / 4);
            const paid = months >= m + 1 ? 1 : months > m ? months - m : 0;
            const flash = backFlash(m);
            return (
              <div
                key={m}
                style={{
                  position: 'absolute',
                  left: GX + c * (CW + GAP),
                  top: GY + r * (CH + GAP),
                  width: CW,
                  height: CH,
                  borderRadius: 12,
                  border: `2px solid ${flash > 0.3 ? RED : 'rgba(255,255,255,0.2)'}`,
                  background: flash > 0.3 ? `${RED}55` : `rgba(77,184,168,${0.15 + 0.55 * paid})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: FONT_MONO,
                  fontWeight: 700,
                  fontSize: 28,
                  whiteSpace: 'nowrap',
                  color: flash > 0.3 ? '#ffd0d5' : '#e6e9ee',
                }}
              >
                {flash > 0.3 ? '+INTEREST' : `MONTH ${m + 1}`}
              </div>
            );
          })}

          {/* balance */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: MUTED }}>BALANCE</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 100, color: '#ffffff', lineHeight: 1.05 }}>{money0(cur.bal)}</div>
          </div>

          {/* hidden interest */}
          <div
            style={{
              position: 'absolute',
              left: 190,
              width: 700,
              top: 940,
              height: 150,
              borderRadius: 20,
              border: real > 0.5 ? `4px solid ${RED}` : '3px dashed rgba(239,95,107,0.5)',
              background: real > 0.5 ? `${RED}22` : 'transparent',
              textAlign: 'center',
              paddingTop: 14,
            }}
          >
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: RED, opacity: 0.6 + 0.4 * real }}>
              {real > 0.5 ? 'INTEREST CHARGED' : 'INTEREST BUILDING (HIDDEN)'}
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, color: RED, opacity: 0.3 + 0.7 * real }}>{money0(cur.acc)}</div>
          </div>

          {zeroOp > 0.01 ? (
            <div style={{ position: 'absolute', left: 0, right: 0, top: 1130, textAlign: 'center', opacity: zeroOp, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: GOLD }}>
              0% for 12 months*
            </div>
          ) : null}
          {rateOp > 0.01 ? (
            <div style={{ position: 'absolute', left: 0, right: 0, top: 1210, textAlign: 'center', opacity: rateOp, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 36, color: RED }}>
              *real rate: 29.99% APR
            </div>
          ) : null}
          {dollarOp > 0.01 ? (
            <div style={{ position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', opacity: dollarOp, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 44, color: MUTED }}>
              not on the $1 you missed...
            </div>
          ) : null}
        </div>

        {/* the fine print */}
        {printOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 150, width: 780, top: 560, opacity: printOp }}>
            {[
              'Promotional purchases: no interest if paid',
              'in full within 12 months. If the promo',
              'balance is not paid in full, interest will',
              'be charged from the purchase date. This is',
              'DEFERRED',
              'interest. Standard purchase APR: 29.99%.',
            ].map((line, i) =>
              line === 'DEFERRED' ? (
                <div key={i} style={{ margin: '18px 0' }}>
                  <span
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 700,
                      fontSize: 96,
                      color: RED,
                      padding: '0 22px',
                      borderRadius: 14,
                      background: `rgba(239,95,107,${0.12 + 0.2 * wordGlow})`,
                      border: `3px solid rgba(239,95,107,${wordGlow})`,
                      boxShadow: `0 0 ${40 * wordGlow}px ${RED}66`,
                    }}
                  >
                    DEFERRED
                  </span>
                </div>
              ) : (
                <div key={i} style={{ fontFamily: FONT_BODY, fontSize: 34, color: '#aeb6c2', lineHeight: 1.5 }}>
                  {line}
                </div>
              ),
            )}
          </div>
        ) : null}

        <div style={{ opacity: stampOp * mainOp }}>
          <Stamp text={`$1 LEFT = ${money0(INTEREST)} DUE`} at={-14} color={RED} x={540} y={1210} size={56} rotate={-5} />
        </div>
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="$1 left when the promo ends. what do you owe?" durSec={4.4} accent={GOLD} y={1180} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={RED} />
      <ProgressBar color={RED} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75 }}>
        example: 29.99% APR · simplified monthly calc · terms vary by card
      </div>
    </AbsoluteFill>
  );
};

export default Short25Deferred;
