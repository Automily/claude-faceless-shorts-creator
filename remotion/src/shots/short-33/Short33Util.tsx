import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #14: paid in full, score still drops (utilization)
// =============================================================================
export const compositionConfig = {
  id: 'Short33Util',
  durationInSeconds: 43.6,
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

// THE MATH: limit $1,000, spend $900. Issuers typically report the STATEMENT balance -> 900/1000 = 90%.
// Amounts owed ~30% of a FICO score (myFICO). Under 10% tends to score best. Pay before the statement
// closes -> $50 reported -> 5%.

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(4.8);
const SETUP = F(4.95);
const LIMIT_IN = F(5.68); // "one thousand dollars" @ 5.68
const SPEND_IN = F(7.12); // "nine hundred" @ 7.12
const TL_IN = F(8.6); // timeline appears
const DUE_IN = F(9.45); // "due date" @ 9.47
const PAID_IN = F(10.2); // "No interest." @ 10.22
const PERFECT_IN = F(11.1); // "Perfect." @ 11.14
const REPORT_IN = F(13.25); // "reports your balance" @ 13.27
const EARLY_IN = F(14.2); // "weeks earlier" @ 14.24
const STMT_IN = F(15.45); // "statement date" @ 15.47
const PAUSE_FROM = F(16.95); // "Pause." @ 16.95
const PAUSE_DUR = F(4.1);
const REVEAL = F(21.1); // "Nine hundred out of a thousand" @ 21.13
const PCT_IN = F(23.15); // "Ninety percent" @ 23.16
const FICO_IN = F(25.35); // "Amounts owed" @ 25.36
const THIRTY_IN = F(27.05); // "thirty percent" @ 27.07
const TEN_IN = F(29.5); // "Under ten percent" @ 29.54
const TWIST = F(31.9); // "The fix is free" @ 31.95
const MOVE_IN = F(33.35); // "pay before the statement closes" @ 33.37
const FIFTY_IN = F(35.95); // "Fifty dollars reported" @ 35.97
const FIVE_IN = F(37.8); // "Five percent" @ 37.81
const OUTRO = F(39.4); // "Same card." @ 39.43
const LOOP = F(42.3);
const END = F(43.6);

// meter
const MX = 130;
const MW = 790;
const MY = 640;
const MH = 76;
// timeline (days 1..30)
const TX = 150;
const TW = 740;
const TY = 1010;
const dayX = (d: number) => TX + (TW * (d - 1)) / 29;
const STMT_DAY = 5;
const DUE_DAY = 26;

const Short33Util: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const setupOff = prog(f, SETUP, SETUP + 10);
  const outro = prog(f, OUTRO, OUTRO + 14);
  // the payoff comparison (frame 0 and the outro)
  const cmpOp = Math.max(1 - setupOff, outro);

  // meter: visible from the limit to the end of the twist
  const meterOp = prog(f, LIMIT_IN, LIMIT_IN + 8) * (1 - prog(f, OUTRO - 8, OUTRO));
  const spent =
    900 * EASE_INOUT(prog(f, SPEND_IN, SPEND_IN + 18)) - 850 * EASE_INOUT(prog(f, FIFTY_IN, FIFTY_IN + 18));
  const reportedOp = prog(f, REVEAL, REVEAL + 8);
  const pctOp = prog(f, PCT_IN, PCT_IN + 6);
  const zonesOp = prog(f, TEN_IN, TEN_IN + 8);
  const fiveOp = prog(f, FIVE_IN, FIVE_IN + 6);
  const pctNow = Math.round(spent / 10);
  const meterColor = spent > 300 ? RED : TEAL;

  // timeline: setup + twist; hidden for the FICO slice
  const tlOp = Math.max(
    prog(f, TL_IN, TL_IN + 8) * (1 - prog(f, FICO_IN - 8, FICO_IN)),
    prog(f, TWIST, TWIST + 10),
  ) * (1 - prog(f, OUTRO - 8, OUTRO));
  const dueOp = prog(f, DUE_IN, DUE_IN + 6);
  const paidOp = prog(f, PAID_IN, PAID_IN + 6);
  const perfectOp = prog(f, PERFECT_IN, PERFECT_IN + 6) * (1 - prog(f, REPORT_IN - 6, REPORT_IN));
  const stmtOp = Math.max(prog(f, EARLY_IN, EARLY_IN + 6), f >= TWIST ? 1 : 0);
  const reportOp = prog(f, STMT_IN, STMT_IN + 8) * (1 - prog(f, FICO_IN - 8, FICO_IN));
  const arrow = EASE_INOUT(prog(f, EARLY_IN, EARLY_IN + 20)) * (1 - prog(f, FICO_IN - 8, FICO_IN));
  // twist: the payment marker slides before the statement date
  const move = EASE_INOUT(prog(f, MOVE_IN, MOVE_IN + 24));
  const payDay = f >= TWIST ? DUE_DAY + (STMT_DAY - 2 - DUE_DAY) * move : DUE_DAY;

  // FICO pie
  const ficoOp = prog(f, FICO_IN, FICO_IN + 10) * (1 - prog(f, TWIST - 8, TWIST));
  const slice = EASE_INOUT(prog(f, THIRTY_IN, THIRTY_IN + 14));

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 22));

  const pie = (frac: number) => {
    const a = frac * Math.PI * 2;
    const r = 170;
    const x = Math.sin(a) * r;
    const y = -Math.cos(a) * r;
    return `M 0 0 L 0 ${-r} A ${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${x} ${y} Z`;
  };

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#1c2a28" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'PAID IN FULL.', color: '#ffffff' },
              { text: 'SCORE STILL DROPS.', color: RED },
            ]}
            subtitle="it's about the date, not the amount"
            y={110}
            size={78}
            warm
          />
        </div>

        <Kicker text="$1,000 LIMIT" color={TEAL} y={200} at={SETUP} until={F(16.8)} />
        <Kicker text="WHAT GETS REPORTED" color={RED} y={200} at={REVEAL} until={F(25.2)} />
        <Kicker text="YOUR FICO SCORE" color={GOLD} y={200} at={FICO_IN} until={F(31.7)} />
        <Kicker text="THE FREE FIX" color={TEAL} y={200} at={TWIST} until={F(39.2)} />

        {/* payoff comparison: frame 0 + outro */}
        {cmpOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 120, right: 160, top: 640, opacity: cmpOp }}>
            {[
              { k: 'pay on the due date', v: '90%', c: RED },
              { k: 'pay before the statement', v: '5%', c: TEAL },
            ].map((r) => (
              <div key={r.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '26px 34px', marginBottom: 24, borderRadius: 18, border: `3px solid ${r.c}`, background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 40, color: '#e6e9ee' }}>{r.k}</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, color: r.c }}>{r.v}</div>
              </div>
            ))}
            <div style={{ textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: MUTED }}>same card · same $900 spent</div>
          </div>
        ) : null}

        {/* the utilization meter */}
        {meterOp > 0.01 ? (
          <div style={{ opacity: meterOp }}>
            <div style={{ position: 'absolute', left: MX, width: MW, top: MY - 90, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: '#ffffff' }}>
                ${Math.round(spent).toLocaleString('en-US')}
                <span style={{ fontFamily: FONT_MONO, fontSize: 32, color: MUTED }}> {reportedOp > 0.5 ? 'reported' : 'spent'}</span>
              </div>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: MUTED }}>limit $1,000</div>
            </div>
            <div style={{ position: 'absolute', left: MX, width: MW, top: MY, height: MH, borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.2)', overflow: 'hidden' }}>
              {/* zones */}
              <div style={{ position: 'absolute', left: 0, width: MW * 0.1, top: 0, bottom: 0, background: 'rgba(77,184,168,0.25)', opacity: zonesOp }} />
              <div style={{ position: 'absolute', left: 0, width: (MW * spent) / 1000, top: 0, bottom: 0, background: meterColor, opacity: 0.9 }} />
            </div>
            {[10, 30].map((p) => (
              <div key={p} style={{ position: 'absolute', left: MX + (MW * p) / 100 - 2, top: MY - 8, width: 4, height: MH + 16, background: '#ffffff', opacity: 0.35 + 0.5 * zonesOp }} />
            ))}
            {[10, 30].map((p) => (
              <div key={`l${p}`} style={{ position: 'absolute', left: MX + (MW * p) / 100 - 60, width: 120, top: MY + MH + 14, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: p === 10 ? TEAL : MUTED, opacity: zonesOp }}>
                {p}%
              </div>
            ))}
            {/* the big percent */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: MY + MH + 60, textAlign: 'center', opacity: Math.max(pctOp * (1 - prog(f, FICO_IN - 8, FICO_IN)), fiveOp) }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 150, color: meterColor }}>{pctNow}%</span>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: MUTED, marginTop: -10 }}>utilization</div>
            </div>
          </div>
        ) : null}

        {/* the month timeline */}
        {tlOp > 0.01 ? (
          <div style={{ opacity: tlOp * (1 - Math.max(pctOp * (1 - prog(f, FICO_IN - 8, FICO_IN)), fiveOp)) }}>
            <div style={{ position: 'absolute', left: TX, width: TW, top: TY, borderTop: '4px solid rgba(255,255,255,0.35)' }} />
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} style={{ position: 'absolute', left: dayX(i + 1) - 1, top: TY - 10, width: 2, height: 20, background: 'rgba(255,255,255,0.25)' }} />
            ))}
            <div style={{ position: 'absolute', left: TX, top: TY + 22, fontFamily: FONT_MONO, fontSize: 24, color: MUTED }}>day 1</div>
            <div style={{ position: 'absolute', left: TX + TW - 90, width: 90, textAlign: 'right', top: TY + 22, fontFamily: FONT_MONO, fontSize: 24, color: MUTED }}>day 30</div>

            {/* statement date */}
            <div style={{ opacity: stmtOp }}>
              <div style={{ position: 'absolute', left: dayX(STMT_DAY) - 9, top: TY - 22, width: 18, height: 44, borderRadius: 6, background: RED }} />
              <div style={{ position: 'absolute', left: dayX(STMT_DAY) - 110, width: 220, top: TY + 60, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: RED }}>STATEMENT<br />DATE</div>
            </div>
            {/* reported to the bureau */}
            <div style={{ position: 'absolute', left: dayX(STMT_DAY) - 120, width: 240, top: TY - 150, textAlign: 'center', opacity: reportOp }}>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 32, color: '#e6e9ee' }}>reported to</div>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 32, color: '#e6e9ee' }}>the bureaus ↑</div>
            </div>
            {/* "weeks earlier" arrow from the due date back to the statement date */}
            {arrow > 0.01 ? (
              <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
                <path
                  d={`M ${dayX(DUE_DAY)} ${TY - 40} Q ${(dayX(DUE_DAY) + dayX(STMT_DAY)) / 2} ${TY - 200} ${dayX(STMT_DAY) + 30} ${TY - 40}`}
                  fill="none"
                  stroke={GOLD}
                  strokeWidth={5}
                  strokeDasharray="1000"
                  strokeDashoffset={1000 * (1 - arrow)}
                />
                <text x={(dayX(DUE_DAY) + dayX(STMT_DAY)) / 2} y={TY - 140} fill={GOLD} fontFamily={FONT_MONO} fontWeight={700} fontSize={30} textAnchor="middle" opacity={arrow}>
                  3 weeks earlier
                </text>
              </svg>
            ) : null}
            {/* the payment */}
            <div style={{ opacity: dueOp }}>
              <div style={{ position: 'absolute', left: dayX(payDay) - 9, top: TY - 22, width: 18, height: 44, borderRadius: 6, background: TEAL }} />
              {f >= TWIST ? (
                <div style={{ position: 'absolute', left: Math.max(130, dayX(payDay) - 120), width: 240, top: TY - 130, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: TEAL }}>
                  PAY HERE<br />↓
                </div>
              ) : (
                <div style={{ position: 'absolute', left: Math.max(130, dayX(payDay) - 120), width: 240, top: TY + 60, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: TEAL }}>
                  DUE DATE
                  <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 30, color: '#e6e9ee', opacity: paidOp }}>paid $900 ✓</div>
                </div>
              )}
            </div>
            <div style={{ position: 'absolute', left: dayX(DUE_DAY) - 150, width: 300, top: TY - 120, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 52, color: TEAL, opacity: perfectOp }}>
              0% interest
            </div>
          </div>
        ) : null}

        {/* FICO: amounts owed ~30% */}
        {ficoOp > 0.01 ? (
          <div style={{ opacity: ficoOp }}>
            <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
              <g transform="translate(340 1030)">
                <circle r={170} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" strokeWidth={3} />
                {slice > 0.01 ? <path d={pie(0.3 * slice)} fill={GOLD} /> : null}
              </g>
            </svg>
            <div style={{ position: 'absolute', left: 560, width: 380, top: 930 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 90, color: GOLD, opacity: slice }}>~30%</div>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 36, color: '#e6e9ee' }}>of a FICO score:<br />amounts owed</div>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: TEAL, opacity: zonesOp, marginTop: 18 }}>under 10% = best</div>
            </div>
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="what does the credit bureau see?" durSec={4.1} accent={GOLD} y={1270} />
      </Sequence>

      <Captions lines={VO} y={1430} accent={TEAL} />
      <ProgressBar color={TEAL} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75, whiteSpace: "nowrap" }}>
        most issuers report the statement balance · not advice
      </div>
    </AbsoluteFill>
  );
};

export default Short33Util;
