import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { Ticker } from '../../lib/chart';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Feels Wrong: the birthday paradox
// =============================================================================
export const compositionConfig = {
  id: 'Short16Bday',
  durationInSeconds: 35,
  fps: 30,
  width: 1080,
  height: 1920,
};

const INDIGO = '#8b8cf6';
const VIOLET = '#b79be0';
const GOLD = '#f5d76e';
const TEAL = '#4db8a8';
const INK = '#0f1020';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// P(at least one shared birthday among n people), 365 equally likely days, no Feb 29
const pMatch = (n: number) => {
  let q = 1;
  for (let k = 0; k < Math.floor(n); k++) q *= (365 - k) / 365;
  return 1 - q;
};
const pairs = (n: number) => (n * (n - 1)) / 2;

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(4.9);
const LINES_OFF = F(5.2); // setup: the web disappears, just 23 people
const DAYS_IN = F(5.75); // "three hundred sixty-five days" @ 5.54–6.9
const PEOPLE_IN = F(7.45); // "Twenty-three feels way too small" @ 7.49
const CHIPS_OUT = F(9.9);
const PAUSE_FROM = F(9.9); // "Pause." @ 10.00
const PAUSE_DUR = F(3.55);
const DRAW_IN = F(14.75); // "Two hundred fifty-three pairs." @ 14.79–16.2
const DRAW_OUT = F(16.3);
const PULSE_IN = F(17.5); // "every single pair is a chance to match" @ 17.04–18.9
const PULSE_OUT = F(19.4);
const LONGSHOT_IN = F(20.0); // "Each pair is a long shot." @ 19.80–21.0
const P_IN = F(21.75); // "Two hundred fifty-three long shots aren't." @ 21.79–24.0
const P_OUT = F(23.5);
const LONGSHOT_OUT = F(24.4);
const GROW50_IN = F(24.7); // "At fifty people, it's ninety-seven percent." @ 24.79–26.5
const GROW50_OUT = F(26.0);
const GROW70_IN = F(27.05); // "At seventy, it's basically certain." @ 27.06–29.0
const GROW70_OUT = F(28.6);
const SHRINK_IN = F(30.6); // "You're not matching your birthday." — back to 23
const SHRINK_OUT = F(31.6);
const LOOP = F(33.35); // after "Everyone is matching everyone." @ 32.52–33.33
const END = F(35.0);

// the room
const CX = 540;
const CY = 860;
const RAD = 300;
const MATCH = [3, 14]; // the pair that shares a birthday at n = 23

const Short16Bday: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  // ---- how many people are in the room (continuous, so new dots slide in) ----------------
  let n = 23;
  n += 27 * EASE_INOUT(prog(f, GROW50_IN, GROW50_OUT));
  n += 20 * EASE_INOUT(prog(f, GROW70_IN, GROW70_OUT));
  n -= 47 * EASE_INOUT(prog(f, SHRINK_IN, SHRINK_OUT));

  // ---- the web of pairs: full at f0, gone in the setup, drawn on "253 pairs", stays -------
  const webOff = prog(f, LINES_OFF, LINES_OFF + 12);
  const drawn = EASE_INOUT(prog(f, DRAW_IN, DRAW_OUT));
  const web = Math.max(1 - webOff, drawn);
  const pulse = Math.sin(Math.max(0, f - PULSE_IN) * 0.5) * 0.5 + 0.5;
  const pulseAmt = prog(f, PULSE_IN, PULSE_IN + 6) * (1 - prog(f, PULSE_OUT - 6, PULSE_OUT));
  const lineAlpha = 0.24 + 0.22 * pulseAmt * pulse - 0.08 * prog(n, 23, 70);

  // the matching pair: highlighted at f0, gone in the setup, back once the probability lands
  const matchOp = Math.max(1 - prog(f, LINES_OFF, LINES_OFF + 10), prog(f, P_OUT - 4, P_OUT + 6) * (1 - prog(f, GROW50_IN, GROW50_IN + 8)), prog(f, SHRINK_OUT, SHRINK_OUT + 10));

  // ---- probability ticker: on at f0 (50.7%), off in setup, counts up on "long shots aren't"
  const pNow = pMatch(Math.round(n));
  const pCount = EASE_INOUT(prog(f, P_IN, P_OUT));
  const pShown = f < P_IN ? pMatch(23) : f < GROW50_IN ? pMatch(23) * pCount : pNow;
  const pOp = Math.min(1, 1 - prog(f, LINES_OFF, LINES_OFF + 10) + prog(f, P_IN - 8, P_IN));

  // pair counter in the middle of the room
  const pairShown = f < GROW50_IN ? Math.round(pairs(23) * drawn) : Math.round(pairs(Math.round(n)));
  const pairOp = prog(f, DRAW_IN - 6, DRAW_IN + 4) * (1 - prog(f, LOOP - 12, LOOP));

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 30));
  const chipsOp = (a: number) => prog(f, a, a + 8) * (1 - prog(f, CHIPS_OUT - 8, CHIPS_OUT));
  const longOp = prog(f, LONGSHOT_IN, LONGSHOT_IN + 8) * (1 - prog(f, LONGSHOT_OUT - 8, LONGSHOT_OUT));

  // ---- geometry ------------------------------------------------------------------------
  const count = Math.ceil(n);
  const pos = (i: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { x: CX + RAD * Math.cos(a), y: CY + RAD * Math.sin(a) };
  };
  const pts = Array.from({ length: count }, (_, i) => ({ ...pos(i), op: Math.min(1, n - i) }));

  // lines: draw the first `web` fraction of all pairs, in a stable order
  const total = pairs(count);
  const showLines = Math.floor(total * web);
  const segs: React.ReactNode[] = [];
  let k = 0;
  for (let i = 0; i < count && k < showLines; i++) {
    for (let j = i + 1; j < count && k < showLines; j++, k++) {
      const a = pts[i];
      const b = pts[j];
      segs.push(
        <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={INDIGO} strokeWidth={1.6} strokeOpacity={Math.max(0.06, lineAlpha) * Math.min(a.op, b.op)} />,
      );
    }
  }
  const m0 = pts[MATCH[0]];
  const m1 = pts[MATCH[1]];

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#232050" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: '23 PEOPLE', color: '#ffffff' },
              { text: '50% SHARE A BIRTHDAY', color: GOLD },
            ]}
            subtitle="it feels wrong. it isn't."
            y={130}
            size={78}
            warm
          />
        </div>

        <Kicker text="365 DAYS · 23 PEOPLE" color={VIOLET} y={200} at={LINES_OFF} until={F(9.8)} />
        <Kicker text="COUNT THE PAIRS" color={GOLD} y={200} at={F(13.6)} until={F(24.4)} />
        <Kicker text="ADD MORE PEOPLE" color={TEAL} y={200} at={F(24.6)} until={F(30.5)} />
        <Kicker text="EVERYONE VS EVERYONE" color={GOLD} y={200} at={F(30.6)} until={F(33.2)} />

        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          {segs}
          {matchOp > 0.01 && m0 && m1 ? (
            <line x1={m0.x} y1={m0.y} x2={m1.x} y2={m1.y} stroke={GOLD} strokeWidth={6} strokeOpacity={matchOp} />
          ) : null}
          {pts.map((p, i) => {
            const isMatch = MATCH.includes(i) && matchOp > 0.01;
            return (
              <g key={i} opacity={p.op}>
                <circle cx={p.x} cy={p.y} r={n > 40 ? 11 : 16} fill={isMatch ? GOLD : '#e8e6ff'} />
                {isMatch ? <circle cx={p.x} cy={p.y} r={28} fill="none" stroke={GOLD} strokeWidth={4} opacity={matchOp} /> : null}
              </g>
            );
          })}
        </svg>

        {/* pair counter, center of the room */}
        {pairOp > 0.01 ? (
          <div
            style={{
              position: 'absolute',
              left: CX - 170,
              top: CY - 80,
              width: 340,
              textAlign: 'center',
              opacity: pairOp,
              background: 'rgba(15,16,32,0.82)',
              borderRadius: 24,
              padding: '14px 0',
            }}
          >
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: '#ffffff', lineHeight: 1 }}>{pairShown.toLocaleString('en-US')}</div>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: GOLD, letterSpacing: 4, marginTop: 6 }}>PAIRS</div>
          </div>
        ) : null}

        {/* setup chips */}
        {chipsOp(DAYS_IN) > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: CY - 60, textAlign: 'center', opacity: chipsOp(DAYS_IN) }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 92, color: '#ffffff' }}>365</span>
            <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 34, color: VIOLET, marginLeft: 16 }}>DAYS</span>
          </div>
        ) : null}
        {chipsOp(PEOPLE_IN) > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: CY + 40, textAlign: 'center', opacity: chipsOp(PEOPLE_IN) }}>
            <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 34, color: GOLD }}>ONLY 23 PEOPLE?</span>
          </div>
        ) : null}

        {/* the long shot */}
        {longOp > 0.01 ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: CY - RAD - 110,
              textAlign: 'center',
              opacity: longOp,
              fontFamily: FONT_MONO,
              fontWeight: 700,
              fontSize: 34,
              color: VIOLET,
            }}
          >
            each pair: 1 in 365
          </div>
        ) : null}

        <Ticker
          value={pShown * 100}
          p={1}
          label={`chance of a shared birthday · ${Math.round(n)} people`}
          color={GOLD}
          x={540}
          y={1300}
          size={104}
          format={(v) => `${v.toFixed(1)}%`}
          opacity={pOp}
        />
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="how many pairs are in this room?" durSec={3.55} accent={GOLD} y={1200} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={GOLD} />
      <ProgressBar color={VIOLET} />
    </AbsoluteFill>
  );
};

export default Short16Bday;
