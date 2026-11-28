import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Feels Wrong: Simpson's paradox (kidney stones)
// =============================================================================
export const compositionConfig = {
  id: 'Short28Simpson',
  durationInSeconds: 43,
  fps: 30,
  width: 1080,
  height: 1920,
};

const A_COL = '#4db8a8';
const B_COL = '#b79be0';
const GOLD = '#f5d76e';
const RED = '#ef5f6b';
const MUTED = '#8b96a5';
const INK = '#0f1020';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// THE DATA (Charig et al., BMJ 1986): success / patients
//   small: A 81/87 (93%) · B 234/270 (87%)   large: A 192/263 (73%) · B 55/80 (69%)
//   all:   A 273/350 (78%) · B 289/350 (83%)  -> A wins each group, B wins overall.
const ROWS = [
  { key: 'small', label: 'SMALL STONES', a: 81 / 87, b: 234 / 270, win: 'A' },
  { key: 'large', label: 'LARGE STONES', a: 192 / 263, b: 55 / 80, win: 'A' },
  { key: 'all', label: 'ALL PATIENTS', a: 273 / 350, b: 289 / 350, win: 'B' },
] as const;

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(6.2);
const SETUP = F(6.4);
const SRC_IN = F(6.8);
const R1 = F(9.8);
const R1A = F(11.37);
const R1B = F(13.5);
const R2 = F(14.8);
const R2A = F(16.7);
const R2B = F(18.6);
const BOTH = F(19.95); // "A wins both." @ 19.97
const PAUSE_FROM = F(21.5); // "Pause." @ 21.60
const PAUSE_DUR = F(2.8);
const R3 = F(24.4); // "B. Eighty-three percent to seventy-eight." @ 24.40
const R3B = F(25.05);
const R3A = F(26.1);
const MIX_IN = F(27.6); // "Because A got the hard cases." @ 27.60
const LARGE_IN = F(31.0); // "had large stones" @ 31.02
const NAME_IN = F(34.2); // "It's called Simpson's paradox." @ 34.20
const FLIP_IN = F(37.6); // "the winner can flip." @ 37.64
const OUTRO = F(39.4);
const LOOP = F(41.7);
const END = F(43.0);

const RX = 150;
const RW = 640;
const ROW_Y = [470, 720, 970];

const pct = (v: number) => `${Math.round(v * 100)}%`;

const Short28Simpson: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const setupOff = prog(f, SETUP, SETUP + 10);
  const back = prog(f, NAME_IN, NAME_IN + 12);
  const pay = (on: number) => Math.max(1 - setupOff, on, back);

  const rowOn = [pay(prog(f, R1, R1 + 8)), pay(prog(f, R2, R2 + 8)), pay(prog(f, R3, R3 + 8))];
  const barA = [pay(EASE_INOUT(prog(f, R1A, R1A + 14))), pay(EASE_INOUT(prog(f, R2A, R2A + 14))), pay(EASE_INOUT(prog(f, R3A, R3A + 14)))];
  const barB = [pay(EASE_INOUT(prog(f, R1B, R1B + 14))), pay(EASE_INOUT(prog(f, R2B, R2B + 14))), pay(EASE_INOUT(prog(f, R3B, R3B + 14)))];
  const winOn = [pay(prog(f, BOTH, BOTH + 8)), pay(prog(f, BOTH, BOTH + 8)), pay(prog(f, R3A + 10, R3A + 18))];

  const mixOp = prog(f, MIX_IN, MIX_IN + 12) * (1 - back);
  const rowsOp = 1 - mixOp;
  const largeGlow = prog(f, LARGE_IN, LARGE_IN + 8);
  const nameOp = Math.max(1 - setupOff, prog(f, NAME_IN, NAME_IN + 10));
  const flip = Math.min(prog(f, FLIP_IN, FLIP_IN + 6), 1 - prog(f, OUTRO, OUTRO + 10));
  const srcOp = prog(f, SRC_IN, SRC_IN + 8) * (1 - prog(f, R1 - 6, R1));

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 22));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#232050" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'A WINS BOTH GROUPS', color: '#ffffff' },
              { text: 'B WINS OVERALL', color: GOLD },
            ]}
            subtitle="real kidney stone data"
            y={110}
            size={72}
            warm
          />
        </div>

        <Kicker text="A REAL STUDY" color={B_COL} y={200} at={SETUP} until={F(21.4)} />
        <Kicker text="NOW COMBINE THEM" color={GOLD} y={200} at={F(24.4)} until={F(27.4)} />
        <Kicker text="WHO GOT WHICH PATIENTS?" color={RED} y={200} at={MIX_IN} until={F(34.0)} />
        <Kicker text="SIMPSON'S PARADOX" color={GOLD} y={200} at={NAME_IN} until={F(41.5)} />

        {srcOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: srcOp, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 40, color: '#e6e9ee' }}>
            Charig et al., BMJ, 1986
            <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 32, color: MUTED, marginTop: 8 }}>700 patients · two treatments</div>
          </div>
        ) : null}

        {/* the three comparison rows */}
        <div style={{ opacity: rowsOp }}>
          {ROWS.map((r, i) => {
            const op = rowOn[i];
            if (op <= 0.01) return null;
            const y = ROW_Y[i];
            const isAll = r.key === 'all';
            const highlight = isAll ? flip : 0;
            return (
              <div key={r.key} style={{ opacity: op }}>
                <div
                  style={{
                    position: 'absolute',
                    left: RX - 20,
                    width: RW + 150,
                    top: y - 16,
                    height: 210,
                    borderRadius: 18,
                    border: `3px solid rgba(245,215,110,${isAll ? 0.25 + 0.75 * highlight : 0})`,
                    boxShadow: highlight > 0.1 ? `0 0 40px ${GOLD}55` : 'none',
                  }}
                />
                <div style={{ position: 'absolute', left: RX, top: y, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 34, letterSpacing: 3, color: isAll ? GOLD : '#d8dde4' }}>{r.label}</div>
                {(['a', 'b'] as const).map((k, j) => {
                  const v = r[k];
                  const p = k === 'a' ? barA[i] : barB[i];
                  const col = k === 'a' ? A_COL : B_COL;
                  const loses = isAll && k === 'a' && winOn[i] > 0.5;
                  return (
                    <div key={k}>
                      <div style={{ position: 'absolute', left: RX, top: y + 56 + j * 66, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: col, width: 40 }}>{k.toUpperCase()}</div>
                      <div style={{ position: 'absolute', left: RX + 50, top: y + 60 + j * 66, width: RW * v * p, height: 46, borderRadius: 8, background: loses ? RED : col, opacity: 0.9 }} />
                      <div style={{ position: 'absolute', left: RX + 60 + RW * v * p, top: y + 56 + j * 66, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: loses ? RED : '#ffffff', opacity: p }}>{pct(v)}</div>
                    </div>
                  );
                })}
                <div style={{ position: 'absolute', left: RX + RW - 40, top: y - 4, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: r.win === 'A' ? A_COL : B_COL, opacity: winOn[i] }}>
                  {r.win} wins
                </div>
              </div>
            );
          })}
        </div>

        {/* who got which patients */}
        {mixOp > 0.01 ? (
          <div style={{ opacity: mixOp }}>
            {[
              { k: 'A', small: 87, large: 263, col: A_COL, y: 560 },
              { k: 'B', small: 270, large: 80, col: B_COL, y: 820 },
            ].map((t) => (
              <div key={t.k}>
                <div style={{ position: 'absolute', left: RX, top: t.y - 60, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 46, color: t.col }}>{t.k}'s 350 patients</div>
                <div style={{ position: 'absolute', left: RX, top: t.y, width: (760 * t.small) / 350, height: 70, borderRadius: '10px 0 0 10px', background: `${t.col}66` }} />
                <div
                  style={{
                    position: 'absolute',
                    left: RX + (760 * t.small) / 350,
                    top: t.y,
                    width: (760 * t.large) / 350,
                    height: 70,
                    borderRadius: '0 10px 10px 0',
                    background: t.col,
                    boxShadow: t.k === 'A' && largeGlow > 0.1 ? `0 0 ${36 * largeGlow}px ${RED}` : 'none',
                    border: t.k === 'A' && largeGlow > 0.1 ? `3px solid ${RED}` : 'none',
                  }}
                />
                <div style={{ position: 'absolute', left: RX, top: t.y + 84, width: 760, display: 'flex', justifyContent: 'space-between', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: '#d8dde4' }}>
                  <span>{t.small} small</span>
                  <span style={{ color: t.k === 'A' && largeGlow > 0.5 ? RED : '#d8dde4' }}>{t.large} large</span>
                </div>
              </div>
            ))}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center', fontFamily: FONT_BODY, fontWeight: 600, fontSize: 42, color: RED, opacity: largeGlow }}>
              large stones fail more, for everyone
            </div>
          </div>
        ) : null}

        {nameOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1220, textAlign: 'center', opacity: nameOp * (1 - mixOp), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 50, color: GOLD }}>
            merge the groups → the winner flips
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="which one wins overall?" durSec={2.8} accent={GOLD} y={1020} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={GOLD} />
      <ProgressBar color={B_COL} />
    </AbsoluteFill>
  );
};

export default Short28Simpson;
