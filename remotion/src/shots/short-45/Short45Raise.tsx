import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #26: your 3% raise is a pay cut (immersive, 61.8s)
// =============================================================================
export const compositionConfig = {
  id: 'Short45Raise',
  durationInSeconds: 61.8,
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

// THE MATH (illustrative 3.5% inflation): $60,000 × 1.03 = $61,800; to keep pace: $60,000 × 1.035 = $62,100 → −$300.
// Three years, no raise, 3.5%/yr: 60,000 / 1.035^3 = $54,117 of buying power.

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const LETTER_IN = F(2.1); // "Great news" @ 2.18
const RAISE_IN = F(3.3); // "a three percent raise" @ 3.33
const SHOULDNT = F(6.0); // "You shouldn't." @ 6.03
const HOOK_OUT = F(7.6);
const SETUP = F(7.8); // "You make sixty thousand" @ 7.85
const SIXTY_IN = F(8.25);
const PLUS_IN = F(10.9); // "eighteen hundred more" @ 10.94
const PRICES_IN = F(13.6); // "prices went up three and a half" @ 13.61
const RENT_IN = F(16.3);
const GROC_IN = F(17.1);
const GAS_IN = F(18.1);
const PAUSE_FROM = F(21.05); // "Pause." @ 21.09
const PAUSE_DUR = F(4.3);
const REVEAL = F(25.45); // "Sixty thousand plus three percent" @ 25.5
const PAY_NUM = F(27.4); // "sixty-one thousand eight hundred" @ 27.39
const NEED_NUM = F(31.75); // "sixty-two thousand one hundred" @ 31.77
const BEHIND_IN = F(33.95); // "three hundred dollars behind" @ 33.98
const CUT_IN = F(37.6); // "pay cut" @ 37.68
const STUB_IN = F(38.85); // "The number on your paycheck" @ 38.87
const UP_IN = F(40.1); // "went up" @ 40.14
const DOWN_IN = F(41.3); // "went down" @ 41.34
const TWIST = F(43.45); // "And three years with no raise" @ 43.5
const FIFTY4 = F(48.7); // "fifty-four thousand" @ 48.74
const LETTER2 = F(50.9); // "No one sends you a letter" @ 50.91
const STILL_IN = F(54.1); // "still says sixty thousand" @ 54.15
const OUTRO = F(56.9); // "So when your boss says great news" @ 56.92
const LOOP = F(60.3);
const END = F(61.8);

const BX = 150;
const BW = 760;
const SCALE = (v: number) => (BW * (v - 58000)) / 5000; // zoomed axis: 58K..63K

const Short45Raise: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const outro = prog(f, OUTRO, OUTRO + 14);
  const early = 1 - prog(f, F(0.3), F(0.7));
  const payoffOp = Math.max(early, outro);

  // hook: the raise letter
  const hookOp = prog(f, F(0.3), F(0.7)) * (1 - prog(f, SETUP, SETUP + 8));
  const letterOp = prog(f, LETTER_IN, LETTER_IN + 8);
  const raiseOp = prog(f, RAISE_IN, RAISE_IN + 6);
  const sour = prog(f, SHOULDNT, SHOULDNT + 8);

  // setup
  const setupOp = prog(f, SETUP, SETUP + 10) * (1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM));
  const sixtyOp = prog(f, SIXTY_IN, SIXTY_IN + 6);
  const plusOp = prog(f, PLUS_IN, PLUS_IN + 6);
  const pricesOp = prog(f, PRICES_IN, PRICES_IN + 6);
  const icons = [RENT_IN, GROC_IN, GAS_IN].map((c) => prog(f, c, c + 6));

  // reveal: the race of two bars
  const raceOp = prog(f, REVEAL, REVEAL + 8) * (1 - prog(f, STUB_IN - 8, STUB_IN));
  const payGrow = EASE_INOUT(prog(f, REVEAL + 4, PAY_NUM + 6));
  const needGrow = EASE_INOUT(prog(f, F(30.0), NEED_NUM + 6));
  const behindOp = prog(f, BEHIND_IN, BEHIND_IN + 6);

  // the paycheck stub
  const stubOp = prog(f, STUB_IN, STUB_IN + 8) * (1 - prog(f, TWIST - 8, TWIST));
  const upOp = prog(f, UP_IN, UP_IN + 6);
  const downOp = prog(f, DOWN_IN, DOWN_IN + 6);

  // twist: three years
  const twistOp = prog(f, TWIST, TWIST + 8) * (1 - prog(f, LETTER2 - 8, LETTER2));
  const shrink = EASE_INOUT(prog(f, F(46.0), FIFTY4 + 6));
  const buys = 60000 - (60000 - 54117) * shrink;

  // no letter
  const noLetterOp = prog(f, LETTER2, LETTER2 + 8) * (1 - prog(f, OUTRO - 8, OUTRO));
  const stillOp = prog(f, STILL_IN, STILL_IN + 6);

  const titleOp = Math.min(1, 1 - prog(f, F(0.3), F(0.7)) + prog(f, LOOP + 6, LOOP + 18));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#1c2a28" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'YOUR 3% RAISE', color: '#ffffff' },
              { text: 'IS A PAY CUT', color: RED },
            ]}
            subtitle="when prices rise 3.5%"
            y={110}
            size={82}
            warm
          />
        </div>

        <Kicker text="THE MATH" color={GOLD} y={200} at={SETUP} until={F(20.9)} />
        <Kicker text="KEEPING UP" color={RED} y={200} at={REVEAL} until={F(43.2)} />
        <Kicker text="THREE YEARS LATER" color={RED} y={200} at={TWIST} until={F(56.7)} />

        {/* payoff (f0 + outro) */}
        {payoffOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 140, right: 180, top: 600, opacity: payoffOp }}>
            {[
              { k: 'your pay', v: '+3.0%', c: TEAL },
              { k: 'prices', v: '+3.5%', c: RED },
            ].map((r) => (
              <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 30px', marginBottom: 22, borderRadius: 18, border: `3px solid ${r.c}`, background: 'rgba(255,255,255,0.03)' }}>
                <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 44, color: '#e6e9ee' }}>{r.k}</span>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: r.c }}>{r.v}</span>
              </div>
            ))}
            <div style={{ textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: RED }}>= −0.5% real pay</div>
          </div>
        ) : null}

        {/* hook: the raise letter */}
        {hookOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 170, right: 210, top: 560, opacity: hookOp }}>
            <div style={{ background: PAPER, borderRadius: 10, padding: '34px 36px', transform: `rotate(-2deg) translateY(${(1 - letterOp) * 60}px)`, opacity: letterOp, filter: `grayscale(${sour})` }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 24, color: '#6b6f76', letterSpacing: 4 }}>FROM: YOUR BOSS</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: INK, marginTop: 12 }}>Great news! 🎉</div>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 36, color: '#3a3f47', marginTop: 10 }}>Your raise is approved:</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 130, color: '#2e7d4f', opacity: raiseOp }}>+3%</div>
            </div>
            {Array.from({ length: 18 }, (_, i) => (
              <div key={i} style={{ position: 'absolute', left: (i * 97) % 700, top: -120 + ((i * 53 + (f - RAISE_IN) * (3 + (i % 3)) * (1 - sour)) % 900), width: 16, height: 24, background: ['#f5d76e', '#4db8a8', '#ef5f6b', '#b79be0'][i % 4], opacity: raiseOp * (1 - sour) * 0.9, transform: `rotate(${i * 40 + f * 5}deg)` }} />
            ))}
          </div>
        ) : null}

        {/* setup: salary + prices */}
        {setupOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 120, right: 160, top: 520, opacity: setupOp, textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, color: '#ffffff', opacity: sixtyOp }}>$60,000</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: TEAL, opacity: plusOp }}>+$1,800 (3%)</div>
            <div style={{ marginTop: 60, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 44, color: '#e6e9ee', opacity: pricesOp }}>but prices went up</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: RED, opacity: pricesOp }}>+3.5%</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 50, marginTop: 30 }}>
              {['🏠 rent', '🛒 groceries', '⛽ gas'].map((k, i) => (
                <div key={k} style={{ opacity: icons[i], transform: `scale(${0.8 + 0.2 * icons[i]})`, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 38, color: '#e6e9ee' }}>{k}<div style={{ color: RED, fontFamily: FONT_MONO, fontSize: 28 }}>+3.5%</div></div>
              ))}
            </div>
          </div>
        ) : null}

        {/* the race: your pay vs what you need */}
        {raceOp > 0.01 ? (
          <div style={{ opacity: raceOp }}>
            {[
              { k: 'your new pay', v: 61800, g: payGrow, c: TEAL, y: 600, op: 1 },
              { k: 'needed to keep up', v: 62100, g: needGrow, c: RED, y: 860, op: prog(f, F(30.0), F(30.4)) },
            ].map((r) => (
              <div key={r.k} style={{ position: 'absolute', left: BX, width: BW, top: r.y, opacity: r.op }}>
                <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: MUTED, marginBottom: 8 }}>{r.k}</div>
                <div style={{ height: 90, width: Math.max(8, SCALE(58000 + (r.v - 58000) * r.g)), borderRadius: 12, background: r.c }} />
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 72, color: r.c, marginTop: 6 }}>${Math.round(58000 + (r.v - 58000) * r.g).toLocaleString('en-US')}</div>
              </div>
            ))}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 1130, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 90, color: RED, opacity: behindOp }}>−$300</div>
          </div>
        ) : null}
        <Stamp text="PAY CUT" color={RED} at={CUT_IN} until={F(38.8)} x={540} y={1290} size={96} />

        {/* the paycheck stub */}
        {stubOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 170, right: 210, top: 560, opacity: stubOp }}>
            <div style={{ background: PAPER, borderRadius: 10, padding: '30px 36px' }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 24, color: '#6b6f76', letterSpacing: 4 }}>PAY STUB</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12 }}>
                <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 34, color: INK }}>annual</span>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: '#2e7d4f' }}>$61,800 <span style={{ opacity: upOp }}>▲</span></span>
              </div>
            </div>
            <div style={{ marginTop: 60, textAlign: 'center', opacity: downOp }}>
              <div style={{ fontSize: 120 }}>🛒</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 70, color: RED }}>buys less ▼</div>
            </div>
          </div>
        ) : null}

        {/* twist: three years */}
        {twistOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 120, right: 160, top: 560, opacity: twistOp, textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: MUTED }}>no raise · 3 years · 3.5%/yr</div>
            <div style={{ margin: '40px auto 0', width: 760, height: 120, borderRadius: 16, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ width: (760 * buys) / 60000, height: '100%', background: TEAL, opacity: 0.9 }} />
            </div>
            <div style={{ marginTop: 30, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 42, color: '#e6e9ee' }}>$60,000 now buys what</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 120, color: RED }}>${Math.round(buys / 100) / 10}K</div>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 42, color: '#e6e9ee' }}>used to</div>
          </div>
        ) : null}

        {/* no letter */}
        {noLetterOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 170, right: 210, top: 580, opacity: noLetterOp, textAlign: 'center' }}>
            <div style={{ position: 'relative', margin: '0 auto', width: 360, height: 240, background: PAPER, borderRadius: 10 }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 0, borderLeft: '180px solid transparent', borderRight: '180px solid transparent', borderTop: '130px solid #d8cfbc' }} />
              <div style={{ position: 'absolute', left: -20, right: -20, top: 110, height: 14, background: RED, transform: 'rotate(-28deg)' }} />
            </div>
            <div style={{ marginTop: 60, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 42, color: '#e6e9ee', opacity: stillOp }}>the paycheck still says</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, color: '#ffffff', opacity: stillOp }}>$60,000</div>
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="+3% pay, +3.5% prices. did you get a raise?" durSec={4.3} accent={GOLD} y={1100} />
      </Sequence>

      <Captions lines={VO} y={1450} accent={GOLD} />
      <ProgressBar color={TEAL} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75, whiteSpace: 'nowrap' }}>
        3.5% inflation is illustrative · not advice
      </div>
    </AbsoluteFill>
  );
};

export default Short45Raise;
