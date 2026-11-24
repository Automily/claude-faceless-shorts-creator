import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #12: how much to retire? × 25
// =============================================================================
export const compositionConfig = {
  id: 'Short31X25',
  durationInSeconds: 41,
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

// THE MATH: 4% initial withdrawal (inflation-adjusted after) -> need = spending / 0.04 = spending × 25.
// $40,000/yr × 25 = $1,000,000. Cutting $100/mo = $1,200/yr -> $30,000 less needed.

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(5.6);
const SETUP = F(5.8);
const RULE_IN = F(6.5); // "the four percent rule" @ 6.55
const W_IN = F(8.9); // "Take out four percent of your savings the first year" @ 8.93
const INF_IN = F(11.3); // "then raise it with inflation" @ 11.28
const YRS_IN = F(16.0); // "at least thirty years" @ 16.06
const SETUP_OUT = F(17.6);
const PAUSE_FROM = F(17.7); // "Pause." @ 17.80
const PAUSE_DUR = F(5.1);
const TIMES_IN = F(23.6); // "times twenty-five" @ 23.67
const FILL_IN = F(23.98);
const FILL_OUT = F(25.3);
const MIL_IN = F(25.35); // "One million dollars." @ 25.36
const ONE_IN = F(28.8); // "...is forty thousand." @ 28.83
const FLIP_IN = F(30.5); // "Flip it around:" @ 30.50
const X25_IN = F(33.95); // "twenty-five dollars you don't need to save" @ 33.96
const EX_IN = F(35.5);
const OUTRO = F(37.3);
const LOOP = F(39.65);
const END = F(41.0);

const GX = 178;
const GY = 540;
const PX = 150;
const PY = 96;
const CW = 136;
const CH = 80;

const Short31X25: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const setupOff = prog(f, SETUP, SETUP + 10);
  const outro = prog(f, OUTRO, OUTRO + 14);
  const pay = (on: number) => Math.max(1 - setupOff, on, outro);

  // the 25 blocks: all present at f0, cleared in setup, fill in on "times twenty-five"
  const filled = f < SETUP ? 25 : f >= OUTRO ? 25 : 25 * prog(f, FILL_IN, FILL_OUT);
  const gridOp = pay(prog(f, TIMES_IN - 6, TIMES_IN)) * (1 - Math.min(prog(f, FLIP_IN - 6, FLIP_IN + 6), 1 - outro));
  const oneGlow = Math.min(prog(f, ONE_IN, ONE_IN + 6), 1 - prog(f, FLIP_IN - 6, FLIP_IN));

  const eqOp = pay(prog(f, TIMES_IN - 10, TIMES_IN)) * (1 - Math.min(prog(f, FLIP_IN - 6, FLIP_IN + 6), 1 - outro));
  const milOp = pay(prog(f, MIL_IN, MIL_IN + 8));

  const setupOp = prog(f, RULE_IN, RULE_IN + 8) * (1 - prog(f, SETUP_OUT - 8, SETUP_OUT));
  const wOp = prog(f, W_IN, W_IN + 8);
  const infOp = prog(f, INF_IN, INF_IN + 8);
  const yrsOp = prog(f, YRS_IN, YRS_IN + 8);

  const flipOp = prog(f, FLIP_IN, FLIP_IN + 10) * (1 - prog(f, OUTRO - 8, OUTRO));
  const x25Op = prog(f, X25_IN, X25_IN + 8);
  const exOp = prog(f, EX_IN, EX_IN + 8);

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 22));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#1c2a28" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'HOW MUCH TO RETIRE?', color: '#ffffff' },
              { text: 'YEARLY SPEND × 25', color: TEAL },
            ]}
            subtitle="the 4% rule, in one line"
            y={110}
            size={76}
            warm
          />
        </div>

        <Kicker text="THE 4% RULE" color={TEAL} y={200} at={SETUP} until={F(17.5)} />
        <Kicker text="$40,000 A YEAR" color={GOLD} y={200} at={F(22.9)} until={F(30.3)} />
        <Kicker text="FLIP IT AROUND" color={GOLD} y={200} at={FLIP_IN} until={F(37.1)} />
        <Kicker text="× 25" color={TEAL} y={200} at={OUTRO} until={F(39.5)} />

        {/* the rule, explained */}
        {setupOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 120, right: 160, top: 470, opacity: setupOp, textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 120, color: TEAL }}>4%</div>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 44, color: '#e6e9ee', opacity: wOp, marginTop: 10 }}>of savings, year one</div>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 44, color: '#e6e9ee', opacity: infOp, marginTop: 10 }}>then + inflation each year</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: GOLD, opacity: yrsOp, marginTop: 40 }}>lasted 30+ years</div>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: MUTED, opacity: yrsOp }}>in historical US market data</div>
          </div>
        ) : null}

        {/* 25 years of spending */}
        <div style={{ opacity: gridOp }}>
          {Array.from({ length: 25 }, (_, i) => {
            const on = Math.max(0, Math.min(1, filled - i));
            const isOne = i === 0;
            const g = isOne ? oneGlow : 0;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: GX + (i % 5) * PX,
                  top: GY + Math.floor(i / 5) * PY,
                  width: CW,
                  height: CH,
                  borderRadius: 12,
                  background: g > 0.3 ? GOLD : `rgba(77,184,168,${0.25 + 0.6 * on})`,
                  border: `2px solid ${g > 0.3 ? GOLD : 'rgba(77,184,168,0.6)'}`,
                  opacity: 0.25 + 0.75 * on,
                  transform: `scale(${0.9 + 0.1 * on + 0.06 * g})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: FONT_MONO,
                  fontWeight: 700,
                  fontSize: 30,
                  color: g > 0.3 ? INK : '#e6e9ee',
                  boxShadow: g > 0.1 ? `0 0 30px ${GOLD}` : 'none',
                }}
              >
                $40K
              </div>
            );
          })}
          {oneGlow > 0.01 ? (
            <div style={{ position: 'absolute', left: GX, top: GY - 64, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 34, color: GOLD, opacity: oneGlow }}>
              4% of $1M = one year
            </div>
          ) : null}
        </div>

        {/* the equation */}
        {eqOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center', opacity: eqOp, whiteSpace: 'nowrap' }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 70, color: '#ffffff' }}>$40,000 × 25</span>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, color: TEAL, opacity: milOp }}>= $1,000,000</div>
          </div>
        ) : null}

        {/* flip it around */}
        {flipOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 120, right: 160, top: 520, opacity: flipOp, textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, color: '#ffffff' }}>
              −$1 <span style={{ fontFamily: FONT_MONO, fontSize: 40, color: MUTED }}>spent / yr</span>
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: MUTED, margin: '18px 0' }}>↓</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, color: TEAL, opacity: x25Op }}>
              −$25 <span style={{ fontFamily: FONT_MONO, fontSize: 40, color: MUTED }}>needed</span>
            </div>
            <div style={{ marginTop: 70, opacity: exOp }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 36, color: '#e6e9ee' }}>cut $100/month = $1,200/yr</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 72, color: GOLD, marginTop: 8 }}>$30,000 less to save</div>
            </div>
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="you spend $40K a year. how much do you need?" durSec={5.1} accent={GOLD} y={1100} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={TEAL} />
      <ProgressBar color={TEAL} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75 }}>
        rule of thumb from historical data (Bengen, 1994) · not a guarantee
      </div>
    </AbsoluteFill>
  );
};

export default Short31X25;
