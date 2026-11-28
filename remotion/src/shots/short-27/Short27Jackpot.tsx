import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #10: a billion-dollar jackpot isn't a billion dollars
// =============================================================================
export const compositionConfig = {
  id: 'Short27Jackpot',
  durationInSeconds: 37,
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

// THE MATH: Powerball annuity = 1 immediate + 29 annual payments, each 5% larger.
// For a $1B jackpot: first payment $15.05M, last $61.95M. Cash option example: $1.04B -> $450.5M (~43%);
// recent cash shares ~43–46%, set by interest rates. Before taxes.
const JACKPOT = 1e9;
const GROWTH = Array.from({ length: 30 }, (_, k) => Math.pow(1.05, k));
const FIRST = JACKPOT / GROWTH.reduce((a, b) => a + b, 0);
const PAYS = GROWTH.map((g) => FIRST * g);
const CASH = 450e6;

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(3.6);
const SETUP = F(4.0);
const BARS_IN = F(4.65); // "thirty payments, spread over twenty-nine years" @ 4.67–6.6
const BARS_OUT = F(6.6);
const GROW_IN = F(8.55); // "Each one is five percent bigger" @ 8.57
const SUM_IN = F(10.45); // "Add them all up: one billion." @ 10.49–12.4
const SUM_OUT = F(11.95);
const PAUSE_FROM = F(13.1); // "Pause." @ 13.20
const PAUSE_DUR = F(4.6);
const CASH_IN = F(18.15); // "About four hundred fifty million." @ 18.19–19.5
const HALF_IN = F(20.3); // "Under half." @ 20.34
const TVM_IN = F(21.8); // "A dollar today is worth more..." @ 21.80
const FLOW_IN = F(26.6); // "The lottery invests that cash..." @ 26.60
const FLOW2 = F(28.3); // "to fund the payments" @ 28.29
const FLOW3 = F(30.1); // "The billion is what it grows into." @ 30.10
const OUTRO = F(32.4);
const LOOP = F(35.8);
const END = F(37.0);

const BASE = 1020;
const BX = 160;
const PITCH = 25;
const BW = 20;
const HMAX = 380;
const hOf = (v: number) => (v / PAYS[29]) * HMAX;

const fmtM = (v: number) => (v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : `$${Math.round(v / 1e6)}M`);

const Short27Jackpot: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const setupOff = prog(f, SETUP, SETUP + 10);
  const outro = prog(f, OUTRO, OUTRO + 14);
  const pay = (on: number) => Math.max(1 - setupOff, on, outro);

  // how many of the 30 payments are on screen (all at f0), and how steep they are
  const shown = f < SETUP ? 30 : 30 * prog(f, BARS_IN, BARS_OUT);
  const steep = pay(EASE_INOUT(prog(f, GROW_IN, GROW_IN + 30))); // 0 = flat, 1 = +5%/yr
  const sumP = f < SETUP ? 1 : EASE_INOUT(prog(f, SUM_IN, SUM_OUT));
  const total = JACKPOT * sumP;
  const sumOp = pay(prog(f, SUM_IN - 6, SUM_IN + 4));

  const barsOp = 1 - Math.min(prog(f, FLOW_IN - 6, FLOW_IN + 6), 1 - outro);
  const cmpOp = pay(prog(f, CASH_IN, CASH_IN + 8)) * (1 - Math.min(prog(f, FLOW_IN - 8, FLOW_IN), 1 - outro));
  const cashW = EASE_INOUT(prog(f, CASH_IN, CASH_IN + 18));
  const halfOp = pay(prog(f, HALF_IN, HALF_IN + 8)) * (1 - Math.min(prog(f, FLOW_IN - 8, FLOW_IN), 1 - outro));
  const tvmOp = prog(f, TVM_IN, TVM_IN + 8) * (1 - prog(f, FLOW_IN - 8, FLOW_IN));
  const flowOp = prog(f, FLOW_IN, FLOW_IN + 10) * (1 - prog(f, OUTRO - 8, OUTRO));
  const step = (a: number) => prog(f, a, a + 8);

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 10, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 26));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#2a2410" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: '$1 BILLION JACKPOT', color: '#ffffff' },
              { text: 'CASH: ~$450M', color: GOLD },
            ]}
            subtitle="the fine print on lottery jackpots"
            y={130}
            size={80}
            warm
          />
        </div>

        <Kicker text="30 PAYMENTS · 29 YEARS" color={GOLD} y={200} at={SETUP} until={F(13.0)} />
        <Kicker text="TAKE THE CASH TODAY" color={TEAL} y={200} at={F(17.8)} until={F(26.4)} />
        <Kicker text="WHERE THE BILLION COMES FROM" color={GOLD} y={200} at={FLOW_IN} until={F(32.2)} />
        <Kicker text="FUTURE VS TODAY" color={TEAL} y={200} at={OUTRO} until={F(35.6)} />

        {/* the 30 annuity payments */}
        <div style={{ opacity: barsOp }}>
          <div style={{ position: 'absolute', left: BX - 10, width: 30 * PITCH + 10, top: BASE, borderTop: '3px solid rgba(255,255,255,0.3)' }} />
          {PAYS.map((p, k) => {
            const on = Math.max(0, Math.min(1, shown - k));
            if (on <= 0) return null;
            const flat = hOf(PAYS[0]);
            const h = (flat + (hOf(p) - flat) * steep) * on;
            return <div key={k} style={{ position: 'absolute', left: BX + k * PITCH, width: BW, top: BASE - h, height: h, borderRadius: '6px 6px 2px 2px', background: `linear-gradient(180deg, ${GOLD}, #b8952f)` }} />;
          })}
          <div style={{ position: 'absolute', left: BX - 20, top: BASE + 14, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: MUTED }}>today</div>
          <div style={{ position: 'absolute', left: BX + 29 * PITCH - 120, width: 160, textAlign: 'right', top: BASE + 14, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: MUTED }}>year 29</div>
          <div style={{ position: 'absolute', left: BX - 10, top: BASE - hOf(PAYS[0]) * steep - 70, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: GOLD, opacity: steep }}>{fmtM(PAYS[0])}</div>
          <div style={{ position: 'absolute', left: BX + 29 * PITCH - 140, width: 170, textAlign: 'right', top: BASE - HMAX * Math.max(0.24, steep) - 50, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: GOLD, opacity: steep }}>{fmtM(PAYS[29])}</div>
        </div>

        {/* the sum */}
        {sumOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', opacity: sumOp * barsOp }}>
            <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: MUTED, letterSpacing: 4 }}>ALL 30 ADDED UP </span>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: GOLD }}>{total >= 999e6 ? '$1 BILLION' : fmtM(total)}</span>
          </div>
        ) : null}

        {/* advertised vs cash */}
        {cmpOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 160, width: 760, top: 1090, opacity: cmpOp }}>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: GOLD }}>ADVERTISED · $1B over 29 yrs</div>
            <div style={{ height: 40, borderRadius: 10, background: GOLD, marginTop: 6 }} />
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: TEAL, marginTop: 16 }}>CASH TODAY · ~$450M</div>
            <div style={{ height: 40, width: `${45 * cashW}%`, borderRadius: 10, background: TEAL, marginTop: 6 }} />
          </div>
        ) : null}
        {halfOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 160, top: 1236, textAlign: 'right', opacity: halfOp, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: TEAL }}>
            under half
          </div>
        ) : null}
        {tvmOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', opacity: tvmOp, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 44, color: '#e6e9ee' }}>
            $1 today &gt; $1 in 29 years
          </div>
        ) : null}

        {/* how the lottery funds it */}
        {flowOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 120, right: 160, top: 560, opacity: flowOp, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
            {[
              { t: '~$450M CASH', c: TEAL, a: FLOW_IN },
              { t: '↓ invested', c: MUTED, a: FLOW_IN + 10 },
              { t: 'FUNDS 30 GROWING CHECKS', c: GOLD, a: FLOW2 },
              { t: '↓ added up', c: MUTED, a: FLOW3 - 10 },
              { t: '= THE "$1 BILLION"', c: GOLD, a: FLOW3 },
            ].map((s) => (
              <div key={s.t} style={{ opacity: step(s.a), fontFamily: s.t.startsWith('↓') ? FONT_MONO : FONT_DISPLAY, fontWeight: 700, fontSize: s.t.startsWith('↓') ? 34 : 60, color: s.c, whiteSpace: 'nowrap' }}>
                {s.t}
              </div>
            ))}
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="take the cash today. how much?" durSec={4.6} accent={GOLD} y={1180} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={GOLD} />
      <ProgressBar color={GOLD} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75 }}>
        Powerball · before taxes · cash share varies (recently ~43–46%)
      </div>
    </AbsoluteFill>
  );
};

export default Short27Jackpot;
