import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Feels Wrong: 0.999... = 1
// =============================================================================
export const compositionConfig = {
  id: 'Short26Point9',
  durationInSeconds: 36.2,
  fps: 30,
  width: 1080,
  height: 1920,
};

const GOLD = '#f5d76e';
const TEAL = '#4db8a8';
const VIOLET = '#b79be0';
const RED = '#ef5f6b';
const MUTED = '#8b96a5';
const INK = '#0f1020';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// THE MATH: 1/3 = 0.333...; ×3 -> 3/3 = 0.999...; 3/3 = 1. And there is no real number strictly between
// 0.999... and 1 (the gap after n nines is 10^-n, which shrinks below any positive number).

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(5.8);
const SETUP = F(6.0);
const THIRD_IN = F(6.26); // "One third" @ 6.26
const DIGITS_IN = F(6.84); // "is zero point three three three, forever." @ 6.84–8.9
const DIGITS_OUT = F(8.3);
const TIMES_IN = F(11.3); // "by three." @ 11.33
const PAUSE_FROM = F(12.3); // "Pause." @ 12.40
const PAUSE_DUR = F(4.4);
const Q_IN = F(13.8); // "What's three times..."
const NINES_IN = F(16.8); // "Zero point nine, repeating forever." @ 16.80–18.9
const NINES_OUT = F(18.4);
const ONE_IN = F(20.5); // "three thirds is one." @ 20.56
const SAME_IN = F(21.8); // "Same number. Written two ways." @ 21.80
const LINE_IN = F(24.4); // "Still not sure?"
const P1 = F(25.85); // "Try to find a number between them." @ 25.85–27.4
const P2 = F(26.5);
const P3 = F(27.1);
const NONE_IN = F(28.0); // "There isn't one." @ 28.00
const NOGAP_IN = F(29.6); // "no gap means no difference" @ 29.62–30.8
const OUTRO = F(31.6);
const LOOP = F(35.1);
const END = F(36.2);

// the number line: 0.9 at the left, 1.0 at the right
const LX = 160;
const LW = 760;
const LY = 1150;
const xOf = (v: number) => LX + ((v - 0.9) / 0.1) * LW;

const Row: React.FC<{ y: number; left: React.ReactNode; right: React.ReactNode; op: number; size?: number }> = ({ y, left, right, op, size = 96 }) =>
  op > 0.01 ? (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: op, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size, color: '#ffffff', whiteSpace: 'nowrap' }}>
      {left}
      <span style={{ color: MUTED, margin: '0 26px' }}>=</span>
      {right}
    </div>
  ) : null;

const Short26Point9: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const setupOff = prog(f, SETUP, SETUP + 10);
  const outro = prog(f, OUTRO, OUTRO + 14);
  const pay = (on: number) => Math.max(1 - setupOff, on, outro);

  // the proof rows live from the setup until "Same number"
  const digits = Math.floor(3 * prog(f, DIGITS_IN, DIGITS_OUT));
  const threes = digits >= 3 ? '0.333…' : `0.${'3'.repeat(Math.max(0, digits))}`;
  const timesOp = prog(f, TIMES_IN, TIMES_IN + 8);
  const row3Op = prog(f, Q_IN, Q_IN + 8);
  const nines = Math.floor(3 * prog(f, NINES_IN, NINES_OUT));
  const ninesTxt = f < NINES_IN ? '?' : nines >= 3 ? '0.999…' : `0.${'9'.repeat(Math.max(1, nines))}`;
  const oneMorph = prog(f, ONE_IN, ONE_IN + 8);
  const sameGlow = Math.min(prog(f, SAME_IN, SAME_IN + 8), 1 - prog(f, LINE_IN - 10, LINE_IN));
  const rowsOp = prog(f, SETUP, SETUP + 10) * (1 - prog(f, SAME_IN - 4, SAME_IN + 6));

  // the big equation: frame 0, "same number", and the outro
  const bigOp = pay(sameGlow);

  // the number line (twist), also part of the payoff picture
  const lineOp = pay(prog(f, LINE_IN, LINE_IN + 10));
  const pts = [
    { v: 0.9, at: P1, label: '0.9', gap: '0.1' },
    { v: 0.99, at: P2, label: '0.99', gap: '0.01' },
    { v: 0.999, at: P3, label: '0.999', gap: '0.001' },
  ];
  const ptOn = (at: number) => pay(prog(f, at, at + 6));
  const lastGap = f >= P3 ? '0.001' : f >= P2 ? '0.01' : '0.1';
  const gapOp = prog(f, P1, P1 + 6) * (1 - prog(f, NONE_IN - 4, NONE_IN + 4));
  const noneOp = pay(prog(f, NONE_IN, NONE_IN + 8));
  const stampOp = Math.max(1 - setupOff, prog(f, NOGAP_IN, NOGAP_IN + 8), prog(f, LOOP + 10, LOOP + 20));

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 26));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#232050" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: '0.999… = 1', color: '#ffffff' },
              { text: 'NOT ALMOST. EXACTLY.', color: GOLD },
            ]}
            subtitle="it feels wrong. it isn't."
            y={130}
            size={84}
            warm
          />
        </div>

        <Kicker text="START WITH ONE THIRD" color={VIOLET} y={200} at={SETUP} until={F(12.2)} />
        <Kicker text="TIMES THREE" color={GOLD} y={200} at={F(16.8)} until={F(24.2)} />
        <Kicker text="FIND THE GAP" color={TEAL} y={200} at={LINE_IN} until={F(31.4)} />
        <Kicker text="SAME NUMBER, TWO WAYS" color={GOLD} y={200} at={OUTRO} until={F(35.0)} />

        {/* the proof */}
        <div style={{ opacity: rowsOp }}>
          <Row y={430} op={prog(f, THIRD_IN, THIRD_IN + 8)} left={<span style={{ color: VIOLET }}>1/3</span>} right={<span>{threes}</span>} />
          {timesOp > 0.01 ? (
            <div style={{ position: 'absolute', left: 0, right: 0, top: 570, textAlign: 'center', opacity: timesOp, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 52, color: GOLD }}>
              × 3 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; × 3
            </div>
          ) : null}
          <Row
            y={680}
            op={row3Op}
            left={
              <span style={{ color: oneMorph > 0.5 ? TEAL : VIOLET }}>{oneMorph > 0.5 ? '1' : '3/3'}</span>
            }
            right={<span style={{ color: f >= NINES_IN ? GOLD : MUTED }}>{ninesTxt}</span>}
          />
        </div>

        {/* the big equation */}
        {bigOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: f < SETUP + 10 || f >= OUTRO ? 520 : 600, textAlign: 'center', opacity: bigOp, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 150, color: '#ffffff', textShadow: `0 0 ${40 * bigOp}px ${GOLD}66` }}>
            <span style={{ color: GOLD }}>0.999…</span> = <span style={{ color: TEAL }}>1</span>
          </div>
        ) : null}

        {/* the number line */}
        {lineOp > 0.01 ? (
          <div style={{ opacity: lineOp }}>
            <div style={{ position: 'absolute', left: LX, width: LW, top: LY, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.35)' }} />
            {[0.9, 1.0].map((v) => (
              <div key={v} style={{ position: 'absolute', left: xOf(v) - 60, width: 120, top: LY + 24, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 34, color: v === 1 ? TEAL : MUTED }}>
                {v === 1 ? '1' : '0.9'}
              </div>
            ))}
            <div style={{ position: 'absolute', left: xOf(1) - 14, top: LY - 11, width: 28, height: 28, borderRadius: 14, background: TEAL }} />
            {pts.map((p) => {
              const o = ptOn(p.at);
              return o > 0.01 ? (
                <div key={p.v} style={{ opacity: o }}>
                  <div style={{ position: 'absolute', left: xOf(p.v) - 10, top: LY - 7, width: 20, height: 20, borderRadius: 10, background: GOLD }} />
                  {p.v === 0.99 ? (
                    <div style={{ position: 'absolute', left: xOf(p.v) - 70, width: 140, top: LY - 64, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: GOLD }}>{p.label}</div>
                  ) : null}
                </div>
              ) : null;
            })}
            {gapOp > 0.01 ? (
              <div style={{ position: 'absolute', left: 0, right: 0, top: LY + 90, textAlign: 'center', opacity: gapOp, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 44, color: '#e6e9ee' }}>
                gap to 1: {lastGap} → …
              </div>
            ) : null}
            {noneOp > 0.01 ? (
              <div style={{ position: 'absolute', left: 0, right: 0, top: LY + 90, textAlign: 'center', opacity: noneOp, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 44, color: RED }}>
                nothing fits between
              </div>
            ) : null}
          </div>
        ) : null}

        <div style={{ opacity: stampOp }}>
          <Stamp text="NO GAP. NO DIFFERENCE." at={-14} color={TEAL} x={540} y={960} size={58} rotate={-5} />
        </div>
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="3 × 0.333… = ?" durSec={4.4} accent={GOLD} y={1180} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={GOLD} />
      <ProgressBar color={VIOLET} />
    </AbsoluteFill>
  );
};

export default Short26Point9;
