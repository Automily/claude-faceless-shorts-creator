import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Feels Wrong: a million vs a billion seconds
// =============================================================================
export const compositionConfig = {
  id: 'Short17Billion',
  durationInSeconds: 33,
  fps: 30,
  width: 1080,
  height: 1920,
};

const INDIGO = '#8b8cf6';
const VIOLET = '#b79be0';
const GOLD = '#f5d76e';
const TEAL = '#4db8a8';
const OCHRE = '#d9925b';
const MUTED = '#8b96a5';
const INK = '#0f1020';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// 1e6 s = 11.6 days · 1e9 s = 31.7 years (Nov 2026 -> early 1995) · 1e12 s = 31,689 years
const YEAR_S = 365.2425 * 86400;
const NOW = 2026.87;
const BILLION_YEAR = NOW - 1e9 / YEAR_S; // 1995.2
const TRILLION_YEAR = NOW - 1e12 / YEAR_S; // -29,662

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(5.2);
const WORDS_IN = F(5.4); // "One letter apart..."
const WORDS_OUT = F(9.2);
const PAUSE_FROM = F(9.3); // "Pause." @ 9.40
const PAUSE_DUR = F(5.2);
const MIL_AGO = F(10.55); // "A million seconds ago was eleven days ago." @ 10.57–12.5
const BIL_Q = F(12.95); // "When was a billion?" @ 13.00
const ROLL_IN = F(14.6); // "Early nineteen ninety-five." @ 14.60–16.0
const ROLL_OUT = F(15.5);
const BARS_IN = F(16.8); // "A billion isn't a big million." @ 16.8
const BIL_GROW_OUT = F(18.2);
const THOUSAND = F(19.2); // "It's a thousand millions." @ 19.23
const TRI_IN = F(20.9); // "And a trillion seconds ago?" @ 20.93
const TRI_OUT = F(21.9);
const ROLL2_IN = F(22.6); // "Thirty-one thousand years." @ 22.61–24.0
const ROLL2_OUT = F(23.6);
const CAVE_IN = F(24.8); // "People were still painting cave walls." @ 24.80
const HI_M = F(27.8); // "Million," @ 27.80
const HI_B = F(28.38); // "billion," @ 28.38
const HI_T = F(28.94); // "trillion." @ 28.94
const LOOP = F(32.1); // after "...a thousand of the last." @ 31.40–32.1
const END = F(33.0);

const BAR_X = 160;
const BAR_W = 760;
const rows = [
  { key: 'M', label: 'A MILLION SECONDS', value: 1e6, note: '11 days', color: TEAL, y: 1050 },
  { key: 'B', label: 'A BILLION SECONDS', value: 1e9, note: '31.7 years', color: GOLD, y: 1150 },
  { key: 'T', label: 'A TRILLION SECONDS', value: 1e12, note: '31,700 years', color: OCHRE, y: 1250 },
] as const;

const yearText = (y: number) => {
  const r = Math.round(y);
  if (r > 0) return `${r}`;
  const bc = Math.round((1 - r) / 100) * 100;
  return `${bc.toLocaleString('en-US')} BC`;
};

const Short17Billion: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  // ---- the dial: what "ago" we are looking at ----------------------------------------------
  const roll1 = EASE_INOUT(prog(f, ROLL_IN, ROLL_OUT));
  const roll2 = EASE_INOUT(prog(f, ROLL2_IN, ROLL2_OUT));
  const loopBack = EASE_INOUT(prog(f, LOOP, LOOP + 14));
  let dialBig: string;
  let dialLabel: string;
  let dialColor = GOLD;
  if (f < WORDS_IN) {
    dialBig = yearText(BILLION_YEAR);
    dialLabel = 'A BILLION SECONDS AGO';
  } else if (f < BIL_Q) {
    dialBig = '11 DAYS';
    dialLabel = 'A MILLION SECONDS AGO';
    dialColor = TEAL;
  } else if (f < ROLL_IN) {
    dialBig = '?';
    dialLabel = 'A BILLION SECONDS AGO';
  } else if (f < ROLL2_IN) {
    dialBig = yearText(NOW + (BILLION_YEAR - NOW) * roll1);
    dialLabel = 'A BILLION SECONDS AGO';
  } else if (f < LOOP) {
    // log-ish roll so the years visibly race
    const y = BILLION_YEAR + (TRILLION_YEAR - BILLION_YEAR) * Math.pow(roll2, 2.2);
    dialBig = yearText(y);
    dialLabel = 'A TRILLION SECONDS AGO';
    dialColor = OCHRE;
  } else {
    dialBig = yearText(BILLION_YEAR);
    dialLabel = 'A BILLION SECONDS AGO';
  }
  const dialOp = Math.min(
    1,
    1 - prog(f, WORDS_IN - 4, WORDS_IN + 6) + prog(f, MIL_AGO - 4, MIL_AGO + 6),
  ) * (1 - 0.0 * loopBack);

  // ---- the words view (setup) ----
  const wordsOp = prog(f, WORDS_IN, WORDS_IN + 8) * (1 - prog(f, WORDS_OUT - 8, WORDS_OUT));

  // ---- the bars: same scale for every row; the scale zooms out for the trillion ----------
  const zoom = EASE_INOUT(prog(f, TRI_IN, TRI_OUT)) * (1 - loopBack);
  const fullScale = Math.pow(10, 9 + 3 * zoom);
  const billionGrow = Math.max(1 - prog(f, WORDS_IN, WORDS_IN + 8), EASE_INOUT(prog(f, BARS_IN, BIL_GROW_OUT)));
  const barsOp = Math.min(1, 1 - prog(f, WORDS_IN, WORDS_IN + 8) + prog(f, BARS_IN - 6, BARS_IN + 4));
  const triOp = prog(f, TRI_IN - 6, TRI_IN + 4) * (1 - prog(f, LOOP, LOOP + 10));
  const hi = (a: number) => Math.min(prog(f, a, a + 4), 1 - prog(f, a + 14, a + 22));
  const hiFor = { M: hi(HI_M), B: hi(HI_B), T: hi(HI_T) } as const;

  const thousandOp = prog(f, THOUSAND, THOUSAND + 8) * (1 - prog(f, TRI_IN - 6, TRI_IN + 2));
  const caveOp = prog(f, CAVE_IN, CAVE_IN + 10) * (1 - prog(f, HI_M - 6, HI_M + 4));
  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 22));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#232050" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'A MILLION SECONDS: 11 DAYS', color: '#ffffff' },
              { text: 'A BILLION: 31 YEARS', color: GOLD },
            ]}
            subtitle="one letter apart"
            y={130}
            size={66}
            warm
          />
        </div>

        <Kicker text="ONE LETTER APART" color={VIOLET} y={200} at={WORDS_IN} until={F(9.2)} />
        <Kicker text="COUNT BACK IN TIME" color={GOLD} y={200} at={F(14.5)} until={F(20.5)} />
        <Kicker text="NOW A TRILLION" color={OCHRE} y={200} at={F(20.6)} until={F(27.6)} />
        <Kicker text="EACH IS 1,000× THE LAST" color={GOLD} y={200} at={HI_M} until={F(31.9)} />

        {/* the dial */}
        {dialOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: dialOp }}>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: MUTED }}>{dialLabel}</div>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: dialBig.length > 7 ? 150 : 200,
                lineHeight: 1.05,
                color: dialColor,
                textShadow: `0 0 40px ${dialColor}55`,
              }}
            >
              {dialBig}
            </div>
            {caveOp > 0.01 ? (
              <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 40, color: OCHRE, opacity: caveOp, marginTop: 10 }}>
                the age of cave paintings
              </div>
            ) : null}
          </div>
        ) : null}

        {/* the words view */}
        {wordsOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: wordsOp }}>
            {[
              { first: 'M', rest: 'ILLION', c: TEAL },
              { first: 'B', rest: 'ILLION', c: GOLD },
            ].map((w) => (
              <div key={w.first} style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 150, lineHeight: 1.1, color: '#ffffff' }}>
                <span style={{ color: w.c }}>{w.first}</span>
                {w.rest}
              </div>
            ))}
          </div>
        ) : null}

        {/* the bars, one shared scale */}
        {rows.map((r) => {
          const op = r.key === 'T' ? triOp : barsOp;
          if (op <= 0.01) return null;
          const grow = r.key === 'B' ? billionGrow : 1;
          const w = Math.min(BAR_W, Math.max(4, (BAR_W * r.value * grow) / fullScale));
          const h = hiFor[r.key];
          return (
            <div key={r.key} style={{ opacity: op }}>
              <div
                style={{
                  position: 'absolute',
                  left: BAR_X,
                  top: r.y - 40,
                  width: BAR_W,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: FONT_MONO,
                  fontWeight: 700,
                  fontSize: 26,
                  letterSpacing: 2,
                }}
              >
                <span style={{ color: '#cfd5dd' }}>{r.label}</span>
                <span style={{ color: r.color }}>{r.note}</span>
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: BAR_X,
                  top: r.y,
                  width: BAR_W,
                  height: 34,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: BAR_X,
                  top: r.y,
                  width: w,
                  height: 34,
                  borderRadius: 8,
                  background: r.color,
                  boxShadow: `0 0 ${10 + 30 * h}px ${r.color}${h > 0.1 ? 'cc' : '55'}`,
                  transform: `scaleY(${1 + 0.25 * h})`,
                }}
              />
            </div>
          );
        })}
        {thousandOp > 0.01 ? (
          <div
            style={{
              position: 'absolute',
              left: BAR_X,
              top: 1200,
              width: BAR_W,
              textAlign: 'right',
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 44,
              color: GOLD,
              opacity: thousandOp,
            }}
          >
            = 1,000 millions
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="when was a billion seconds ago?" durSec={5.2} accent={GOLD} y={1150} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={GOLD} />
      <ProgressBar color={VIOLET} />
    </AbsoluteFill>
  );
};

export default Short17Billion;
