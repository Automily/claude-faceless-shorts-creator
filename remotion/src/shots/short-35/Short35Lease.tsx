import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #16: lease money factor × 2400 = APR
// =============================================================================
export const compositionConfig = {
  id: 'Short35Lease',
  durationInSeconds: 40.8,
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

// THE MATH: APR ≈ MF × 2400. .00375 → 9%, .0025 → 6%.
// Rent (interest) charge per month = (cap cost + residual) × MF = (35,000 + 21,000) × .00375 = $210; at .0025 = $140.
// Depreciation = (35,000 − 21,000) / 36 = $388.89. Savings: $70 × 36 = $2,520.

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(6.7);
const SETUP = F(6.95);
const DEC_IN = F(8.2); // "tiny decimal" @ 8.23
const MF_IN = F(9.42); // "money factor" @ 9.44
const MULT_IN = F(11.7); // "multiply by twenty-four hundred" @ 11.71
const PAUSE_FROM = F(14.1); // "Pause." @ 14.14
const PAUSE_DUR = F(5.5);
const REVEAL = F(19.7); // "Nine." @ 19.72
const APR_IN = F(21.03); // "nine percent APR" @ 21.06
const SPLIT_IN = F(22.75); // "On a thirty-five thousand dollar lease" @ 22.75
const RENT_IN = F(24.9); // "two hundred ten dollars" @ 24.93
const JUST_IN = F(26.5); // "just in interest" @ 26.50
const TWIST = F(27.8); // "And the money factor is negotiable" @ 27.84
const NEG_IN = F(28.94); // "negotiable" @ 28.94
const SIX_IN = F(30.93); // "six percent" @ 30.95
const SAVE_IN = F(32.78); // "twenty-five hundred dollars" @ 32.79
const OUTRO = F(35.5); // "So ask for the money factor." @ 35.53
const LOOP = F(39.75);
const END = F(40.8);

const BAR_X = 140;
const BAR_W = 780;
const MAX_MO = 600; // $ scale for the monthly bar

const Short35Lease: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const setupOff = prog(f, SETUP, SETUP + 10);
  const outro = prog(f, OUTRO, OUTRO + 14);
  const pay = (on: number) => Math.max(1 - setupOff, on, outro);

  // the contract card: f0, setup, outro
  const cardOp = pay(prog(f, SETUP, SETUP + 10)) * (1 - Math.min(prog(f, PAUSE_FROM - 8, PAUSE_FROM), 1 - outro));
  const mfGlow = Math.max(prog(f, DEC_IN, DEC_IN + 8), 1 - setupOff, outro);
  const aprLineOp = Math.max(1 - setupOff, outro);
  const multOp = prog(f, MULT_IN, MULT_IN + 8) * (1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM));

  // the conversion
  const convOp = prog(f, REVEAL, REVEAL + 8) * (1 - prog(f, SPLIT_IN - 8, SPLIT_IN));
  const aprOp = prog(f, APR_IN, APR_IN + 6);
  const aprPop = 1 + 0.12 * (1 - EASE_INOUT(prog(f, APR_IN, APR_IN + 10)));

  // the monthly payment split
  const splitOp = prog(f, SPLIT_IN, SPLIT_IN + 10) * (1 - prog(f, OUTRO - 8, OUTRO));
  const rentGrow = EASE_INOUT(prog(f, RENT_IN - 6, RENT_IN + 12));
  const toSix = EASE_INOUT(prog(f, SIX_IN, SIX_IN + 18));
  const rent = 210 - 70 * toSix;
  const mf = 0.00375 - 0.00125 * toSix;
  const justOp = prog(f, JUST_IN, JUST_IN + 6) * (1 - prog(f, TWIST - 6, TWIST));
  const negOp = prog(f, NEG_IN, NEG_IN + 6);
  const saveOp = prog(f, SAVE_IN, SAVE_IN + 6);

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 6, LOOP + 18));

  const line = (k: string, v: string, hi = 0) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '2px dashed rgba(15,18,22,0.25)' }}>
      <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: '#3a3f47' }}>{k}</span>
      <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30 + 16 * hi, color: hi > 0.5 ? '#c0392b' : INK, background: `rgba(245,215,110,${0.6 * hi})`, padding: '0 8px', borderRadius: 6 }}>{v}</span>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#1c2a28" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'LEASE MONEY FACTOR', color: '#ffffff' },
              { text: '× 2400 = YOUR APR', color: GOLD },
            ]}
            subtitle="the rate they don't print"
            y={110}
            size={74}
            warm
          />
        </div>

        <Kicker text="THE LEASE" color={TEAL} y={200} at={SETUP} until={F(14.0)} />
        <Kicker text="TRANSLATED" color={GOLD} y={200} at={REVEAL} until={F(22.6)} />
        <Kicker text="EVERY MONTH" color={RED} y={200} at={SPLIT_IN} until={F(27.6)} />
        <Kicker text="IT'S NEGOTIABLE" color={TEAL} y={200} at={TWIST} until={F(35.3)} />

        {/* the contract */}
        {cardOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 150, right: 190, top: 520, padding: '30px 40px', background: PAPER, borderRadius: 10, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', opacity: cardOp, transform: 'rotate(-1.5deg)' }}>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, color: '#6b6f76', letterSpacing: 4, marginBottom: 10 }}>LEASE AGREEMENT</div>
            {line('cap cost', '$35,000')}
            {line('residual', '$21,000')}
            {line('term', '36 mo')}
            {line('money factor', '0.00375', mfGlow)}
            <div style={{ marginTop: 18, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 54, color: '#c0392b', opacity: aprLineOp }}>= 9% APR</div>
          </div>
        ) : null}
        {multOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, color: GOLD, opacity: multOp }}>× 2,400</div>
        ) : null}

        {/* the conversion */}
        {convOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 100, right: 160, top: 560, textAlign: 'center', opacity: convOp }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, color: '#ffffff' }}>0.00375 × 2,400</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 170, color: RED, opacity: aprOp, transform: `scale(${aprPop})`, marginTop: 30 }}>= 9%</div>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 40, color: MUTED, opacity: aprOp }}>APR</div>
          </div>
        ) : null}

        {/* the monthly split */}
        {splitOp > 0.01 ? (
          <div style={{ opacity: splitOp }}>
            <div style={{ position: 'absolute', left: BAR_X, width: BAR_W, top: 480, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: MUTED }}>$35,000 lease · per month</div>
            <div style={{ position: 'absolute', left: BAR_X, width: BAR_W, top: 540, height: 110, borderRadius: 14, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: (BAR_W * 389) / MAX_MO, background: '#5a6470', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: '#ffffff' }}>$389</div>
              <div style={{ width: ((BAR_W * rent) / MAX_MO) * rentGrow, background: toSix > 0.5 ? TEAL : RED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: INK, overflow: 'hidden' }}>
                ${Math.round(rent)}
              </div>
            </div>
            <div style={{ position: 'absolute', left: BAR_X, width: (BAR_W * 389) / MAX_MO, top: 664, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: MUTED }}>the car</div>
            <div style={{ position: 'absolute', left: BAR_X + (BAR_W * 389) / MAX_MO - 30, width: 240, top: 664, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: toSix > 0.5 ? TEAL : RED, opacity: rentGrow }}>interest</div>

            <div style={{ position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', opacity: justOp }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: RED }}>$210/mo</div>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 40, color: '#e6e9ee' }}>just in interest</div>
            </div>

            {/* negotiable: the money factor dial */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 780, textAlign: 'center', opacity: negOp }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 44, color: '#ffffff' }}>
                MF {mf.toFixed(5)} → <span style={{ color: toSix > 0.5 ? TEAL : RED }}>{(mf * 2400).toFixed(1)}%</span>
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, color: GOLD, opacity: saveOp, marginTop: 40 }}>save $2,520</div>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: MUTED, opacity: saveOp }}>$70/mo × 36 months</div>
            </div>
          </div>
        ) : null}
        <Stamp text="NEGOTIABLE" color={TEAL} at={NEG_IN} until={F(30.6)} x={540} y={1090} />
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="0.00375 × 2,400 = ?" durSec={5.5} accent={GOLD} y={760} />
      </Sequence>

      <Captions lines={VO} y={1450} accent={GOLD} />
      <ProgressBar color={TEAL} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75, whiteSpace: 'nowrap' }}>
        excludes taxes &amp; fees · illustrative, not advice
      </div>
    </AbsoluteFill>
  );
};

export default Short35Lease;
