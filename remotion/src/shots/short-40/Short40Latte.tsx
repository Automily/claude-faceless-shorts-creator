import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #21: the latte isn't your problem (immersive)
// =============================================================================
export const compositionConfig = {
  id: 'Short40Latte',
  durationInSeconds: 42.1,
  fps: 30,
  width: 1080,
  height: 1920,
};

const TEAL = '#4db8a8';
const GOLD = '#f5d76e';
const RED = '#ef5f6b';
const COFFEE = '#c08a5a';
const MUTED = '#8b96a5';
const INK = '#0f1216';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// THE MATH (7%/yr, monthly, 30 yrs): $6/day = $182.50/mo -> $222,645. $300/mo cheaper rent -> $365,991.
// 30 years of daily lattes = 10,950 skipped coffees.
const LATTE = 222645;
const RENT = 365991;

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const VOICE_IN = F(2.9); // "a voice in your head" @ 2.93
const BROKE_IN = F(4.6); // "that's why you're broke" @ 4.64
const HOOK_OUT = F(5.95);
const SETUP = F(6.15); // "Six dollars a day" @ 6.17
const MONTH_IN = F(7.65); // "a hundred and eighty a month" @ 7.66
const INVEST_IN = F(9.6); // "Invested for thirty years" @ 9.62
const LATTE_NUM = F(12.85); // "two hundred twenty thousand" @ 12.85
const GUILT_IN = F(15.25); // "Guilt unlocked." @ 15.25
const PAUSE_FROM = F(17.15); // "Pause." @ 17.19
const PAUSE_DUR = F(4.7);
const REVEAL = F(21.9); // "Now take the apartment." @ 21.95
const CHEAP_IN = F(24.1); // "three hundred dollars cheaper" @ 24.11
const RENT_GROW = F(26.4); // "Same thirty years" @ 26.42
const RENT_NUM = F(29.15); // "Three hundred sixty-six thousand" @ 29.16
const TWIST = F(31.85); // "One decision, made once" @ 31.90
const SKIP_IN = F(34.7); // "every single morning" @ 34.73
const OUTRO = F(36.8); // "So go ahead." @ 36.82
const LOOP = F(40.95);
const END = F(42.1);

const BX = 150;
const BW = 760;
const MAXV = 400000;

const Short40Latte: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const setupOff = prog(f, SETUP, SETUP + 10);
  const outro = prog(f, OUTRO, OUTRO + 14);
  const pay = (on: number) => Math.max(1 - prog(f, F(0.3), F(0.7)), on, outro);

  // hook: the coffee counter + the voice in your head
  const counterOp = prog(f, F(0.3), F(0.7)) * (1 - setupOff);
  const thoughtOp = prog(f, VOICE_IN, VOICE_IN + 8) * (1 - setupOff);
  const brokeOp = prog(f, BROKE_IN, BROKE_IN + 6);

  // the latte math
  const mathOp = prog(f, SETUP, SETUP + 10) * (1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM));
  const monthOp = prog(f, MONTH_IN, MONTH_IN + 6);

  // the two bars (f0 payoff, latte growth, rent growth, outro)
  const barsOp = pay(prog(f, INVEST_IN, INVEST_IN + 8)) * (1 - Math.min(prog(f, PAUSE_FROM - 8, PAUSE_FROM) * (1 - prog(f, RENT_GROW - 6, RENT_GROW)), 1 - outro));
  const latteGrow = f < SETUP || f >= OUTRO ? 1 : EASE_INOUT(prog(f, INVEST_IN + 6, LATTE_NUM));
  const rentGrow = f < SETUP || f >= OUTRO ? 1 : EASE_INOUT(prog(f, RENT_GROW + 6, RENT_NUM));
  const rentBarOp = pay(prog(f, RENT_GROW, RENT_GROW + 8));
  const latteNumOp = pay(prog(f, LATTE_NUM, LATTE_NUM + 6));
  const rentNumOp = pay(prog(f, RENT_NUM, RENT_NUM + 6));
  const guiltOp = prog(f, GUILT_IN, GUILT_IN + 6) * (1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM));

  // apartment listings
  const aptOp = prog(f, REVEAL, REVEAL + 8) * (1 - prog(f, RENT_GROW - 6, RENT_GROW));
  const cheapOp = prog(f, CHEAP_IN, CHEAP_IN + 6);

  // twist
  const twistOp = prog(f, TWIST, TWIST + 8) * (1 - prog(f, OUTRO - 8, OUTRO));
  const skipOp = prog(f, SKIP_IN, SKIP_IN + 6);

  const titleOp = Math.min(1, 1 - prog(f, F(0.3), F(0.7)) + prog(f, LOOP + 6, LOOP + 18));

  const bar = (label: string, v: number, grow: number, color: string, y: number, op: number, numOp: number) => (
    <div style={{ position: 'absolute', left: BX, width: BW, top: y, opacity: op }}>
      <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: MUTED, marginBottom: 8 }}>{label}</div>
      <div style={{ height: 100, width: Math.max(8, (BW * v * grow) / MAXV), borderRadius: 14, background: color }} />
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, color, opacity: numOp, marginTop: 8 }}>${Math.round((v * grow) / 1000)}K</div>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#2a2016" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'THE LATTE ISN’T', color: '#ffffff' },
              { text: 'YOUR PROBLEM', color: GOLD },
            ]}
            subtitle="30 years of math, side by side"
            y={110}
            size={78}
            warm
          />
        </div>

        <Kicker text="THE LATTE MATH" color={COFFEE} y={200} at={SETUP} until={F(17.0)} />
        <Kicker text="NOW YOUR RENT" color={TEAL} y={200} at={REVEAL} until={F(31.6)} />
        <Kicker text="ONE DECISION" color={GOLD} y={200} at={TWIST} until={F(36.6)} />

        {/* hook: at the counter */}
        {counterOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 160, right: 200, top: 540, opacity: counterOp, textAlign: 'center' }}>
            <div style={{ padding: '30px 20px', borderRadius: 20, background: '#1d1712', border: `3px solid ${COFFEE}` }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: MUTED, letterSpacing: 4 }}>MENU</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: '#f3e6d6' }}>
                <span>☕ latte</span>
                <span style={{ color: GOLD }}>$6</span>
              </div>
            </div>
            {thoughtOp > 0.01 ? (
              <div style={{ marginTop: 60, display: 'inline-block', padding: '26px 34px', borderRadius: 40, background: '#e9edf2', opacity: thoughtOp, transform: `scale(${0.9 + 0.1 * thoughtOp})` }}>
                <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 44, color: '#3a3f47', fontStyle: 'italic' }}>
                  “that's why you're <span style={{ color: '#c0392b', opacity: brokeOp }}>broke</span>”
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* the latte math */}
        {mathOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', opacity: mathOp }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: '#ffffff' }}>
              $6/day <span style={{ opacity: monthOp, color: COFFEE }}>≈ $182/mo</span>
            </div>
          </div>
        ) : null}

        {/* the bars */}
        {barsOp > 0.01 ? (
          <div style={{ opacity: barsOp }}>
            {bar('skip the latte · 30 yrs', LATTE, latteGrow, COFFEE, 560, 1, latteNumOp)}
            {bar('$300 cheaper rent · 30 yrs', RENT, rentGrow, TEAL, 860, rentBarOp, rentNumOp)}
            <div style={{ position: 'absolute', left: BX + 420, top: 650, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 44, color: GOLD, opacity: guiltOp }}>guilt unlocked 🔓</div>
          </div>
        ) : null}

        {/* the apartment */}
        {aptOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 150, right: 190, top: 520, opacity: aptOp }}>
            {[
              { k: '2BR · downtown', v: '$1,800/mo', c: MUTED, op: 1, strike: cheapOp > 0.5 },
              { k: '2BR · 10 min further', v: '$1,500/mo', c: TEAL, op: cheapOp, strike: false },
            ].map((r) => (
              <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '26px 30px', marginBottom: 22, borderRadius: 18, border: `3px solid ${r.c}`, background: 'rgba(255,255,255,0.03)', opacity: r.op }}>
                <div>
                  <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: MUTED }}>🏠 listing</div>
                  <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 32, color: '#e6e9ee' }}>{r.k}</div>
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 50, color: r.c, textDecoration: r.strike ? 'line-through' : 'none' }}>{r.v}</div>
              </div>
            ))}
            <div style={{ textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 90, color: TEAL, opacity: cheapOp }}>−$300/mo</div>
          </div>
        ) : null}

        {/* the twist */}
        {twistOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 120, right: 160, top: 1150, textAlign: 'center', opacity: twistOp }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 50, color: TEAL }}>1 decision</span>
            <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 40, color: MUTED }}> beats </span>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 50, color: COFFEE, opacity: skipOp }}>10,950 skipped lattes</span>
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="is the latte really your problem?" durSec={4.7} accent={GOLD} y={1000} />
      </Sequence>

      <Captions lines={VO} y={1450} accent={GOLD} />
      <ProgressBar color={TEAL} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75, whiteSpace: 'nowrap' }}>
        assumes 7%/yr average · illustrative, not advice
      </div>
    </AbsoluteFill>
  );
};

export default Short40Latte;
