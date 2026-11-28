import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Feels Wrong: Benford's law
// =============================================================================
export const compositionConfig = {
  id: 'Short30Benford',
  durationInSeconds: 40.8,
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

// THE DATA: first digits of 2^1 .. 2^1000 (computed, matches Benford log10(1+1/d)).
const COUNTS = [301, 176, 125, 97, 79, 69, 56, 52, 45];
// a made-up, "too even" set of 1,000 numbers (illustrative: what people tend to produce)
const FAKE = [118, 109, 114, 103, 116, 107, 111, 108, 114];
const POWERS = Array.from({ length: 16 }, (_, k) => String(BigInt(2) ** BigInt(k + 1)));

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(6.4);
const SETUP = F(6.6);
const FLAT_IN = F(8.5); // "about eleven percent" @ 8.55
const POW_IN = F(12.4); // "Two, four, eight, sixteen, and on." @ 12.50–15.3
const POW_OUT = F(16.1);
const PAUSE_FROM = F(16.2); // "Pause." @ 16.30
const PAUSE_DUR = F(2.8);
const GROW_IN = F(19.3); // "Three hundred and one." @ 19.30
const ONE_IN = F(19.9);
const NINE_IN = F(22.5); // "Just forty-five." @ 22.59
const NAME_IN = F(24.5); // "It's Benford's law." @ 24.50
const EX = [F(25.75), F(26.6), F(27.4)]; // populations, prices, river lengths
const FAKE_IN = F(31.0); // "makes numbers up" @ 30.99
const EVEN_IN = F(33.0); // "too even." @ 33.06
const AUDIT_IN = F(33.9); // "Auditors check for exactly that." @ 33.89
const OUTRO = F(36.5);
const LOOP = F(39.6);
const END = F(40.8);

const BASE = 1100;
const BX = 150;
const PITCH = 86;
const BW = 64;
const PX_PER = 1.6; // px per count (301 -> 482px)

const Short30Benford: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const setupOff = prog(f, SETUP, SETUP + 10);
  const outro = prog(f, OUTRO, OUTRO + 14);

  // bar heights: Benford at f0 / after the reveal; flat 111 during setup ("you'd expect")
  const toFlat = EASE_INOUT(prog(f, SETUP, SETUP + 20));
  const grow = Math.max(EASE_INOUT(prog(f, GROW_IN, GROW_IN + 40)), outro);
  const flatMix = f < GROW_IN ? toFlat : 1 - grow;
  const barsShown = 1;
  const flatLineOp = Math.min(prog(f, FLAT_IN, FLAT_IN + 8), 1 - prog(f, NAME_IN, NAME_IN + 10)) + 0.35 * Math.max(1 - setupOff, outro);

  const powOp = prog(f, POW_IN - 6, POW_IN + 4) * (1 - prog(f, POW_OUT - 8, POW_OUT));
  const powCount = Math.min(POWERS.length, Math.floor(POWERS.length * prog(f, POW_IN, POW_OUT - 10)) + 1);

  const labelOp = Math.max(1 - setupOff, prog(f, GROW_IN + 10, GROW_IN + 24), outro);
  const oneGlow = Math.min(prog(f, ONE_IN, ONE_IN + 6), 1 - prog(f, NAME_IN, NAME_IN + 8));
  const nineGlow = Math.min(prog(f, NINE_IN, NINE_IN + 6), 1 - prog(f, NAME_IN, NAME_IN + 8));
  const nameOp = Math.max(1 - setupOff, prog(f, NAME_IN, NAME_IN + 10) * (1 - prog(f, FAKE_IN - 8, FAKE_IN)), outro);
  const exOp = (i: number) => prog(f, EX[i], EX[i] + 6) * (1 - prog(f, FAKE_IN - 8, FAKE_IN));
  const fakeOp = prog(f, FAKE_IN, FAKE_IN + 12) * (1 - outro);
  const evenOp = prog(f, EVEN_IN, EVEN_IN + 8) * (1 - outro);
  const auditOp = prog(f, AUDIT_IN, AUDIT_IN + 8) * (1 - outro);

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 26));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#232050" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: '30% OF NUMBERS', color: '#ffffff' },
              { text: 'START WITH A 1', color: GOLD },
            ]}
            subtitle="Benford's law"
            y={130}
            size={80}
            warm
          />
        </div>

        <Kicker text="EVERY DIGIT 11%?" color={VIOLET} y={200} at={SETUP} until={F(16.1)} />
        <Kicker text="1,000 POWERS OF TWO" color={GOLD} y={200} at={F(19.3)} until={F(30.1)} />
        <Kicker text="HOW FAKES GET CAUGHT" color={RED} y={200} at={F(30.3)} until={F(36.3)} />
        <Kicker text="BENFORD'S LAW" color={GOLD} y={200} at={OUTRO} until={F(39.4)} />

        {/* the scrolling powers of two */}
        {powOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 120, right: 160, top: 330, opacity: powOp, display: 'flex', flexWrap: 'wrap', gap: '10px 26px', justifyContent: 'center' }}>
            {POWERS.slice(0, powCount).map((p) => (
              <span key={p} style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 40, color: '#cfd5dd' }}>
                <span style={{ color: GOLD, fontSize: 48 }}>{p[0]}</span>
                {p.slice(1)}
              </span>
            ))}
          </div>
        ) : null}

        {/* the histogram */}
        <div style={{ opacity: barsShown }}>
          <div style={{ position: 'absolute', left: BX - 20, width: 9 * PITCH + 20, top: BASE, borderTop: '3px solid rgba(255,255,255,0.3)' }} />
          {/* "11% each" expectation */}
          <div style={{ position: 'absolute', left: BX - 20, width: 9 * PITCH + 20, top: BASE - 111 * PX_PER, borderTop: `3px dashed rgba(183,155,224,${Math.min(1, flatLineOp)})` }} />
          <div style={{ position: 'absolute', left: BX + 9 * PITCH - 220, width: 230, textAlign: 'right', top: BASE - 111 * PX_PER - 44, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: VIOLET, opacity: Math.min(1, flatLineOp) }}>
            expected: 11%
          </div>
          {COUNTS.map((c, i) => {
            const v = c * (1 - flatMix) + 111 * flatMix;
            const h = v * PX_PER;
            const glow = i === 0 ? oneGlow : i === 8 ? nineGlow : 0;
            return (
              <div key={i}>
                <div
                  style={{
                    position: 'absolute',
                    left: BX + i * PITCH,
                    width: BW,
                    top: BASE - h,
                    height: h,
                    borderRadius: '8px 8px 2px 2px',
                    background: flatMix > 0.5 ? '#5b5e86' : `linear-gradient(180deg, ${GOLD}, #b8952f)`,
                    boxShadow: glow > 0.05 ? `0 0 ${34 * glow}px ${GOLD}` : 'none',
                  }}
                />
                <div style={{ position: 'absolute', left: BX + i * PITCH - 10, width: BW + 20, top: BASE - h - 46, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: i === 0 || i === 8 ? 34 : 26, color: '#ffffff', opacity: labelOp }}>
                  {c}
                </div>
                <div style={{ position: 'absolute', left: BX + i * PITCH, width: BW, top: BASE + 12, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: i === 0 ? GOLD : '#d8dde4' }}>
                  {i + 1}
                </div>
              </div>
            );
          })}
          {/* made-up numbers, overlaid */}
          {fakeOp > 0.01
            ? FAKE.map((c, i) => (
                <div key={`f${i}`} style={{ position: 'absolute', left: BX + i * PITCH + 6, width: BW - 12, top: BASE - c * PX_PER, height: c * PX_PER, border: `4px solid ${RED}`, borderRadius: 8, opacity: fakeOp }} />
              ))
            : null}
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center' }}>
          {nameOp > 0.01 ? <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: GOLD, opacity: nameOp * (1 - fakeOp) }}>BENFORD'S LAW</div> : null}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 26, marginTop: 10 }}>
            {['populations', 'prices', 'river lengths'].map((t, i) => (
              <span key={t} style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: '#cfd5dd', opacity: exOp(i) }}>{t}</span>
            ))}
          </div>
        </div>
        {fakeOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center', opacity: fakeOp }}>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 34, color: RED }}>▢ made-up numbers</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: RED, opacity: evenOp, marginTop: 6 }}>too even</div>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 36, color: '#e6e9ee', opacity: auditOp, marginTop: 4 }}>auditors flag exactly this</div>
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="how many start with a 1?" durSec={2.8} accent={GOLD} y={420} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={GOLD} />
      <ProgressBar color={VIOLET} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75 }}>
        first digits of 2¹ to 2¹⁰⁰⁰ · made-up set is illustrative
      </div>
    </AbsoluteFill>
  );
};

export default Short30Benford;
