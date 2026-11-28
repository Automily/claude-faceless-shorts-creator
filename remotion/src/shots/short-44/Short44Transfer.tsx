import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #25: the 0% balance transfer (immersive, 61s for TikTok rewards)
// =============================================================================
export const compositionConfig = {
  id: 'Short44Transfer',
  durationInSeconds: 61.2,
  fps: 30,
  width: 1080,
  height: 1920,
};

const TEAL = '#4db8a8';
const GOLD = '#f5d76e';
const RED = '#ef5f6b';
const MUTED = '#8b96a5';
const INK = '#0f1216';
const PAPER = '#ece6d8';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// THE MATH: $5,000 at 22%, $300/mo -> 21 months, ~$1,022 interest (sim).
// 3% fee = $150 -> $5,150 at 0% / $300 = 17.2 months -> $0 interest. Saves ~$872.
// Trap: $200/mo x 18 = $3,600 -> $1,550 left when the promo ends.

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const STMT_IN = F(0.8); // "You owe five thousand" @ 0.85
const MAIL_IN = F(4.4); // "Then the mail comes" @ 4.36
const OFFER_IN = F(5.65); // "zero percent for eighteen months" @ 5.69
const HOOK_OUT = F(8.1);
const SETUP = F(8.3); // "It's a balance transfer card." @ 8.32
const MOVE_IN = F(10.7); // "Move your debt over" @ 10.71
const FEE_IN = F(15.1); // "transfer fee" @ 15.17
const FEE150 = F(19.25); // "a hundred and fifty dollars" @ 19.27
const DAY1 = F(20.5); // "added on day one" @ 20.52
const BUDGET_IN = F(22.85); // "three hundred dollars a month" @ 22.86
const PAUSE_FROM = F(25.05); // "Pause." @ 25.08
const PAUSE_DUR = F(4.9);
const REVEAL = F(30.0); // "Stay on the old card" @ 30.05
const OLD_INT = F(33.5); // "about a thousand twenty dollars" @ 33.54
const NEW_IN = F(35.9); // "Transfer it" @ 35.96
const NEW_ZERO = F(42.1); // "Interest: zero." @ 42.14
const SAVE_IN = F(43.8); // "You save about eight hundred seventy" @ 43.82
const TWIST = F(46.2); // "But pay only two hundred a month" @ 46.21
const LEFT_IN = F(49.4); // "fifteen hundred is still there" @ 49.45
const RATE_IN = F(52.0); // "Now at the card's regular rate." @ 52.03
const OUTRO = F(55.0); // "Zero percent for eighteen months." @ 55.02
const LOOP = F(59.95);
const END = F(61.2);

const MW = 21; // months scale
const BX = 150;
const BW = 760;

const Short44Transfer: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const outro = prog(f, OUTRO, OUTRO + 14);
  const early = 1 - prog(f, F(0.3), F(0.7));
  const verdictOp = Math.max(early, outro);

  // hook
  const hookOp = prog(f, F(0.3), F(0.7)) * (1 - prog(f, SETUP, SETUP + 8));
  const stmtOp = prog(f, STMT_IN, STMT_IN + 6);
  const mailOp = prog(f, MAIL_IN, MAIL_IN + 8);
  const offerOp = prog(f, OFFER_IN, OFFER_IN + 6);

  // the transfer
  const xferOp = prog(f, SETUP, SETUP + 10) * (1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM));
  const move = EASE_INOUT(prog(f, MOVE_IN, MOVE_IN + 24));
  const feeOp = prog(f, FEE_IN, FEE_IN + 6);
  const fee150 = prog(f, FEE150, FEE150 + 6);
  const day1 = prog(f, DAY1, DAY1 + 6);
  const budgetOp = prog(f, BUDGET_IN, BUDGET_IN + 6);

  // the race
  const raceOp = prog(f, REVEAL, REVEAL + 8) * (1 - prog(f, OUTRO - 8, OUTRO));
  const oldGrow = EASE_INOUT(prog(f, REVEAL + 4, REVEAL + 40));
  const oldIntOp = prog(f, OLD_INT, OLD_INT + 6);
  const newOp = prog(f, NEW_IN, NEW_IN + 8);
  const newGrow = EASE_INOUT(prog(f, NEW_IN + 10, NEW_IN + 46));
  const zeroOp = prog(f, NEW_ZERO, NEW_ZERO + 6);
  const saveOp = prog(f, SAVE_IN, SAVE_IN + 6) * (1 - prog(f, TWIST - 6, TWIST));
  const trapOp = prog(f, TWIST, TWIST + 8);
  const leftOp = prog(f, LEFT_IN, LEFT_IN + 6);
  const rateOp = prog(f, RATE_IN, RATE_IN + 6);

  const titleOp = Math.min(1, 1 - prog(f, F(0.3), F(0.7)) + prog(f, LOOP + 6, LOOP + 18));

  const bar = (label: string, months: number, grow: number, color: string, y: number, op: number, right: React.ReactNode, rightOp: number, leftover = 0) => (
    <div style={{ position: 'absolute', left: BX, width: BW, top: y, opacity: op }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: MUTED, marginBottom: 8 }}>
        <span>{label}</span><span>{Math.round(months * grow)} months</span>
      </div>
      <div style={{ position: 'relative', height: 80, borderRadius: 12, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: (BW * months * grow) / MW, borderRadius: 12, background: color }} />
        {leftover > 0 ? <div style={{ position: 'absolute', left: (BW * months) / MW, top: 0, bottom: 0, width: (BW * 3) / MW * leftover, borderRadius: '0 12px 12px 0', background: RED, opacity: 0.9 }} /> : null}
      </div>
      <div style={{ marginTop: 8, opacity: rightOp }}>{right}</div>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#1c2a28" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: '0% FOR 18 MONTHS', color: TEAL },
              { text: 'WORTH THE FEE?', color: '#ffffff' },
            ]}
            subtitle="$5,000 of credit card debt, two ways"
            y={110}
            size={80}
            warm
          />
        </div>

        <Kicker text="THE TRANSFER" color={TEAL} y={200} at={SETUP} until={F(24.9)} />
        <Kicker text="THE RACE" color={GOLD} y={200} at={REVEAL} until={F(46.0)} />
        <Kicker text="THE TRAP" color={RED} y={200} at={TWIST} until={F(54.8)} />

        {/* verdict (f0 + outro) */}
        {verdictOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 130, right: 170, top: 580, opacity: verdictOp }}>
            {[
              { k: 'stay at 22%', v: '−$1,022', c: RED },
              { k: '0% + $150 fee', v: '−$150', c: TEAL },
            ].map((r) => (
              <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 30px', marginBottom: 22, borderRadius: 18, border: `3px solid ${r.c}`, background: 'rgba(255,255,255,0.03)' }}>
                <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 42, color: '#e6e9ee' }}>{r.k}</span>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 76, color: r.c }}>{r.v}</span>
              </div>
            ))}
            <div style={{ textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: GOLD }}>only if you finish in 18 months</div>
          </div>
        ) : null}

        {/* hook: statement + the mail */}
        {hookOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 170, right: 210, top: 540, opacity: hookOp }}>
            <div style={{ background: PAPER, borderRadius: 10, padding: '26px 32px', opacity: stmtOp, transform: 'rotate(-1.5deg)' }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 24, color: '#6b6f76', letterSpacing: 4 }}>YOUR CARD</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 36, color: INK, marginTop: 8 }}><span>balance</span><span>$5,000</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 36, color: '#c0392b' }}><span>APR</span><span>22%</span></div>
            </div>
            <div style={{ marginTop: 50, padding: '34px 30px', borderRadius: 10, background: '#f7f2e6', border: '4px dashed #c9a24a', textAlign: 'center', opacity: mailOp, transform: `rotate(2deg) translateY(${(1 - mailOp) * 60}px)` }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: '#6b6f76' }}>✉ YOU'RE PRE-APPROVED!</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: '#2e7d4f', opacity: offerOp }}>0% APR</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: INK, opacity: offerOp }}>for 18 months</div>
            </div>
          </div>
        ) : null}

        {/* the transfer + the fee */}
        {xferOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 130, right: 170, top: 540, opacity: xferOp }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {[
                { k: 'OLD CARD', r: '22%', c: '#5a2a32', bal: 5000 * (1 - move) },
                { k: 'NEW CARD', r: '0%', c: '#1f5a50', bal: 5000 * move + 150 * fee150 },
              ].map((cd) => (
                <div key={cd.k} style={{ width: 360, height: 230, borderRadius: 24, background: cd.c, padding: 26 }}>
                  <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 24, color: '#e6e9ee' }}>{cd.k} · {cd.r}</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 70, color: '#ffffff', marginTop: 50 }}>${Math.round(cd.bal).toLocaleString('en-US')}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', fontSize: 70, color: GOLD, marginTop: -150, opacity: move * (1 - move) * 4 }}>→</div>
            <div style={{ marginTop: 120, textAlign: 'center', opacity: feeOp }}>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 44, color: '#e6e9ee' }}>transfer fee: 3–5%</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 100, color: RED, opacity: fee150 }}>+$150</div>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: MUTED, opacity: day1 }}>added on day one</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: GOLD, opacity: budgetOp, marginTop: 30 }}>your budget: $300/mo</div>
            </div>
          </div>
        ) : null}

        {/* the race */}
        {raceOp > 0.01 ? (
          <div style={{ opacity: raceOp }}>
            {bar('old card · 22%', 21, oldGrow, '#8a4a52', 560, 1,
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: RED }}>~$1,022 interest</span>, oldIntOp)}
            {bar(trapOp > 0.5 ? '0% card · only $200/mo' : '0% card · $5,150', 18, trapOp > 0.5 ? 1 : newGrow, TEAL, 860, newOp,
              trapOp > 0.5 ? (
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 58, color: RED, opacity: leftOp }}>$1,550 left over</span>
              ) : (
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: TEAL }}>$0 interest</span>
              ), trapOp > 0.5 ? 1 : zeroOp, trapOp > 0.5 ? leftOp : 0)}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: GOLD, opacity: saveOp }}>you save ~$870</div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center', fontFamily: FONT_BODY, fontWeight: 700, fontSize: 46, color: RED, opacity: rateOp }}>…now at the regular APR</div>
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="pay $150 to move it to 0%?" durSec={4.9} accent={GOLD} y={1180} />
      </Sequence>

      <Captions lines={VO} y={1450} accent={TEAL} />
      <ProgressBar color={TEAL} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75, whiteSpace: 'nowrap' }}>
        card terms vary · illustrative, not advice
      </div>
    </AbsoluteFill>
  );
};

export default Short44Transfer;
