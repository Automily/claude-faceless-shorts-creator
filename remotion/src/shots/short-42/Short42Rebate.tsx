import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #23: 0% financing or $3,000 cash back? (immersive)
// =============================================================================
export const compositionConfig = {
  id: 'Short42Rebate',
  durationInSeconds: 46.5,
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

// THE MATH: $30,000 car, 60 months.
// A) 0% -> $500/mo, $30,000 total.
// B) $3,000 rebate -> $27,000 financed. 6.5%: $528.29/mo, $31,697. 4%: $497.25/mo, $29,835. Break-even ≈ 4.23%.
const pmt = (P: number, apr: number, n = 60) => (apr === 0 ? P / n : (P * (apr / 12)) / (1 - (1 + apr / 12) ** -n));

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const CARDS_IN = F(4.1); // "slides two offers" @ 4.15
const HOOK_OUT = F(6.2);
const SETUP = F(6.4); // "Offer one" @ 6.43
const A_RATE = F(7.85); // "zero percent financing" @ 7.87
const A_PMT = F(10.55); // "Five hundred a month" @ 10.60
const B_IN = F(12.3); // "Offer two" @ 12.32
const B_CASH = F(13.35); // "three thousand dollars cash back" @ 13.39
const B_BANK = F(15.4); // "You finance the rest at your bank" @ 15.43
const PAUSE_FROM = F(17.8); // "Pause." @ 17.81
const PAUSE_DUR = F(4.0);
const REVEAL = F(21.85); // "Zero percent costs exactly thirty thousand" @ 21.88
const A_TOT = F(23.35);
const B_BORROW = F(26.35); // "twenty-seven thousand" @ 26.36
const B_PMT = F(29.9); // "five twenty-eight a month" @ 29.91
const B_TOT = F(31.4); // "Thirty-one seven hundred" @ 31.41
const A_WINS = F(33.3); // "Zero percent wins." @ 33.32
const TWIST = F(35.15); // "But if your bank gives you four percent" @ 35.16
const FOUR_IN = F(36.2); // "four percent" @ 36.25
const B_WINS = F(37.35); // "the rebate wins" @ 37.38
const LINE_IN = F(39.85); // "about four point two percent" @ 39.90
const OUTRO = F(41.9); // "So before you sit down" @ 41.95
const LOOP = F(45.2);
const END = F(46.5);

const Short42Rebate: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const outro = prog(f, OUTRO, OUTRO + 14);
  const early = 1 - prog(f, F(0.3), F(0.7));

  // the two offer cards: f0 (full), slide in at the hook, stay through the video
  const cardsIn = Math.max(early, EASE_INOUT(prog(f, CARDS_IN, CARDS_IN + 12)));
  const aFocus = prog(f, SETUP, SETUP + 8) * (1 - prog(f, B_IN - 6, B_IN));
  const bFocus = prog(f, B_IN, B_IN + 8) * (1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM));
  const show = (at: number) => Math.max(early, prog(f, at, at + 6), outro);

  // the rate used for offer B in the totals
  const rate = f < TWIST ? 0.065 : 0.065 - 0.025 * EASE_INOUT(prog(f, FOUR_IN - 4, FOUR_IN + 14));
  const bPmt = pmt(27000, rate);
  const bTot = bPmt * 60;

  const totOp = prog(f, REVEAL, REVEAL + 8) * (1 - outro);
  const aTotOp = prog(f, A_TOT, A_TOT + 6);
  const bBorrowOp = prog(f, B_BORROW, B_BORROW + 6);
  const bPmtOp = prog(f, B_PMT, B_PMT + 6);
  const bTotOp = prog(f, B_TOT, B_TOT + 6);
  const aWins = prog(f, A_WINS, A_WINS + 6) * (1 - prog(f, FOUR_IN, FOUR_IN + 10));
  const bWins = prog(f, B_WINS, B_WINS + 6) * (1 - outro);
  const lineOp = Math.max(prog(f, LINE_IN, LINE_IN + 6), early, outro);

  const titleOp = Math.min(1, 1 - prog(f, F(0.3), F(0.7)) + prog(f, LOOP + 6, LOOP + 18));

  const card = (x: number, label: string, big: string, sub: string, glow: number, win: number, color: string, bigOp: number, subOp: number) => (
    <div style={{ position: 'absolute', left: x, width: 370, top: 520, transform: `translateY(${(1 - cardsIn) * 260}px) rotate(${x < 500 ? -2 : 2}deg) scale(${1 + 0.05 * glow})`, opacity: cardsIn }}>
      <div style={{ background: PAPER, borderRadius: 12, padding: '26px 24px', minHeight: 330, boxShadow: glow > 0.1 || win > 0.1 ? `0 0 ${40 * Math.max(glow, win)}px ${win > 0.1 ? TEAL : GOLD}` : '0 20px 50px rgba(0,0,0,0.5)', border: win > 0.1 ? `5px solid ${TEAL}` : '5px solid transparent' }}>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: '#6b6f76', letterSpacing: 3 }}>{label}</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color, marginTop: 10, opacity: bigOp, lineHeight: 1.05 }}>{big}</div>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 32, color: '#3a3f47', marginTop: 14, opacity: subOp }}>{sub}</div>
      </div>
      {win > 0.01 ? (
        <div style={{ textAlign: 'center', marginTop: 16, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 54, color: TEAL, opacity: win }}>WINS ✓</div>
      ) : null}
    </div>
  );

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#2a2016" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: '0% FINANCING', color: '#ffffff' },
              { text: 'OR $3,000 BACK?', color: GOLD },
            ]}
            subtitle="a $30,000 car, 60 months"
            y={110}
            size={80}
            warm
          />
        </div>

        <Kicker text="OFFER ONE" color={GOLD} y={200} at={SETUP} until={F(12.1)} />
        <Kicker text="OFFER TWO" color={GOLD} y={200} at={B_IN} until={F(17.6)} />
        <Kicker text="THE TOTALS" color={TEAL} y={200} at={REVEAL} until={F(34.9)} />
        <Kicker text="IT DEPENDS ON YOUR RATE" color={RED} y={200} at={TWIST} until={F(41.7)} />

        {/* the desk */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, height: 520, background: 'linear-gradient(180deg, #3a2716, #2a1c10)', opacity: cardsIn * 0.9 }} />

        {card(110, 'OFFER 1', '0% APR', '60 months · $500/mo', aFocus, aWins, '#c0392b', show(A_RATE), show(A_PMT))}
        {card(560, 'OFFER 2', '$3,000 back', 'finance the rest at your bank', bFocus, bWins, '#2e7d4f', show(B_CASH), show(B_BANK))}

        {/* break-even line */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1010, textAlign: 'center', opacity: lineOp * (1 - totOp * (1 - prog(f, LINE_IN, LINE_IN + 6))) }}>
          <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: MUTED }}>your bank rate break-even</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: GOLD }}>≈ 4.2%</div>
        </div>

        {/* the totals */}
        {totOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 110, right: 150, top: 1010, opacity: totOp * (1 - prog(f, LINE_IN - 6, LINE_IN)), display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 370, textAlign: 'center' }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: MUTED }}>total paid</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: '#ffffff', opacity: aTotOp }}>$30,000</div>
            </div>
            <div style={{ width: 400, textAlign: 'center' }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: MUTED, opacity: bBorrowOp }}>borrow $27,000 @ {(rate * 100).toFixed(1)}%</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 52, color: '#e6e9ee', opacity: bPmtOp }}>${Math.round(bPmt)}/mo</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: bTot > 30000 ? RED : TEAL, opacity: bTotOp }}>${Math.round(bTot).toLocaleString('en-US')}</div>
            </div>
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="0% for 60 months, or $3,000 back?" durSec={4.0} accent={GOLD} y={1130} />
      </Sequence>

      <Captions lines={VO} y={1450} accent={GOLD} />
      <ProgressBar color={TEAL} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75, whiteSpace: 'nowrap' }}>
        excludes taxes &amp; fees · offers vary · not advice
      </div>
    </AbsoluteFill>
  );
};

export default Short42Rebate;
