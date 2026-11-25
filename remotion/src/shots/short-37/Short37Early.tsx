import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #18: 10 years early beats 30 years late (immersive)
// =============================================================================
export const compositionConfig = {
  id: 'Short37Early',
  durationInSeconds: 46.7,
  fps: 30,
  width: 1080,
  height: 1920,
};

const TEAL = '#4db8a8';
const GOLD = '#f5d76e';
const RED = '#ef5f6b';
const VIOLET = '#b79be0';
const MUTED = '#8b96a5';
const INK = '#0f1216';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// THE MATH: 7%/yr compounded monthly, $200/mo.
// YOU: 25–35 ($24,000 in) -> $34,617 at 35 -> $280,968 at 65.
// FRIEND: 35–65 ($72,000 in) -> $243,994.  BOTH (25–65, $96,000 in) -> $524,963.
const R = 0.07 / 12;
const fv = (n: number) => (n <= 0 ? 0 : (200 * ((1 + R) ** n - 1)) / R);
const youAt = (age: number) => (age <= 35 ? fv((age - 25) * 12) : fv(120) * (1 + R) ** ((age - 35) * 12));
const friendAt = (age: number) => (age <= 35 ? 0 : fv((age - 35) * 12));
const bothAt = (age: number) => fv((age - 25) * 12);

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(5.9);
const SETUP = F(6.1); // "You're twenty-five." @ 6.12
const PUT_IN = F(7.45); // "two hundred dollars a month" @ 7.46
const LATER_IN = F(10.3); // "Your friend laughs: I'll start later." @ 10.32
const STOP_IN = F(13.8); // "you stop." @ 13.82
const FRIEND_IN = F(17.4); // "Your friend finally starts" @ 17.46
const PAUSE_FROM = F(21.75); // "Pause." @ 21.77
const PAUSE_DUR = F(7.4);
const IN24 = F(23.0); // "twenty-four thousand" @ 23.04
const IN72 = F(25.0); // "seventy-two" @ 25.06
const REVEAL = F(29.35); // "You do." @ 29.37
const YOU_NUM = F(30.55); // "two hundred eighty-one thousand" @ 30.59
const FR_NUM = F(32.1); // "two hundred forty-four" @ 32.16
const TEN_IN = F(34.5); // "ten extra years" @ 34.56
const TIME_IN = F(36.4); // "Time did the work" @ 36.43
const TWIST = F(38.7); // "And if you'd just kept going" @ 38.73
const BOTH_IN = F(41.2); // "About five hundred twenty-five thousand" @ 41.20
const OUTRO = F(43.25); // "Ten years early beats thirty years late." @ 43.27
const LOOP = F(45.5);
const END = F(46.7);

// chart geometry (ages 25..65)
const CX = 150;
const CW = 760;
const CY = 640;
const CH = 520;
const ageX = (a: number) => CX + (CW * (a - 25)) / 40;

const Short37Early: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const setupOff = prog(f, SETUP, SETUP + 10);
  const outro = prog(f, OUTRO, OUTRO + 14);
  const full = f < SETUP || f >= OUTRO;

  // how far each line is drawn (age)
  const youTo = full ? 65 : f < PUT_IN ? 25 : f < STOP_IN ? 25 + 10 * prog(f, PUT_IN, STOP_IN - 4) : 35 + 30 * EASE_INOUT(prog(f, FRIEND_IN, PAUSE_FROM - 6));
  const frTo = full ? 65 : f < FRIEND_IN ? 35 : 35 + 30 * EASE_INOUT(prog(f, FRIEND_IN, PAUSE_FROM - 6));
  const bothOp = prog(f, TWIST, TWIST + 8) * (1 - outro);
  const bothTo = 25 + 40 * EASE_INOUT(prog(f, TWIST + 6, BOTH_IN));
  // y-scale: $300K normally, $550K for the twist
  const yMax = 300000 + 250000 * EASE_INOUT(prog(f, TWIST, TWIST + 18)) * (1 - outro);
  const vY = (v: number) => CY + CH - (CH * v) / yMax;

  const chartOp = Math.max(1 - setupOff, prog(f, PUT_IN - 4, PUT_IN + 6), outro);
  const endLabels = Math.max(1 - setupOff, outro);
  const youNumOp = Math.max(endLabels, prog(f, YOU_NUM, YOU_NUM + 6));
  const frNumOp = Math.max(endLabels, prog(f, FR_NUM, FR_NUM + 6));
  const tenOp = prog(f, TEN_IN, TEN_IN + 8) * (1 - prog(f, TWIST - 6, TWIST));
  const timeOp = prog(f, TIME_IN, TIME_IN + 6) * (1 - prog(f, TWIST - 6, TWIST));

  const avatarOp = prog(f, SETUP, SETUP + 8) * (1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM));
  const youAge = f < STOP_IN ? 25 + Math.floor(10 * prog(f, PUT_IN, STOP_IN - 4)) : 35;
  const laterOp = prog(f, LATER_IN, LATER_IN + 6);
  const frStartOp = prog(f, FRIEND_IN, FRIEND_IN + 6);

  const inOp = prog(f, IN24, IN24 + 6) * (1 - prog(f, REVEAL - 6, REVEAL));
  const in72Op = prog(f, IN72, IN72 + 6);

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 6, LOOP + 18));

  const path = (fn: (a: number) => number, from: number, to: number) => {
    const pts: string[] = [];
    for (let a = from; a <= to + 0.001; a += 0.25) pts.push(`${ageX(a).toFixed(1)},${vY(fn(a)).toFixed(1)}`);
    if (to > from) pts.push(`${ageX(to).toFixed(1)},${vY(fn(to)).toFixed(1)}`);
    return pts.join(' ');
  };

  const kfmt = (v: number) => `$${Math.round(v / 1000)}K`;

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#1c2a28" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'YOU: 10 YEARS, THEN STOP', color: TEAL },
              { text: 'FRIEND: 30 YEARS', color: GOLD },
            ]}
            subtitle="same $200 a month · who ends up with more?"
            y={110}
            size={66}
            warm
          />
        </div>

        <Kicker text="YOU START AT 25" color={TEAL} y={200} at={SETUP} until={F(21.5)} />
        <Kicker text="AT 65" color={GOLD} y={200} at={REVEAL} until={F(38.5)} />
        <Kicker text="NEVER STOPPING" color={VIOLET} y={200} at={TWIST} until={F(43.0)} />

        {/* the two of you */}
        {avatarOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 130, right: 170, top: 300, display: 'flex', justifyContent: 'space-between', opacity: avatarOp }}>
            <div style={{ padding: '16px 26px', borderRadius: 16, border: `3px solid ${TEAL}`, background: 'rgba(77,184,168,0.08)' }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: TEAL }}>YOU · age {youAge}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: '#ffffff' }}>{f >= STOP_IN ? 'stopped' : '+$200/mo'}</div>
            </div>
            <div style={{ padding: '16px 26px', borderRadius: 16, border: `3px solid ${GOLD}`, background: 'rgba(245,215,110,0.06)', opacity: laterOp }}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: GOLD }}>FRIEND</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: '#ffffff' }}>{frStartOp > 0.5 ? '+$200/mo' : '"later"'}</div>
            </div>
          </div>
        ) : null}

        {/* the chart */}
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: chartOp }}>
          {/* the 10 extra years band */}
          <rect x={ageX(25)} y={CY} width={ageX(35) - ageX(25)} height={CH} fill={TEAL} opacity={0.14 * tenOp} />
          <line x1={CX} y1={CY + CH} x2={CX + CW} y2={CY + CH} stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
          {[25, 35, 45, 55, 65].map((a) => (
            <text key={a} x={ageX(a)} y={CY + CH + 44} fill={MUTED} fontFamily={FONT_MONO} fontWeight={700} fontSize={28} textAnchor="middle">{a}</text>
          ))}
          <polyline points={path(youAt, 25, youTo)} fill="none" stroke={TEAL} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" />
          {frTo > 35.01 ? <polyline points={path(friendAt, 35, frTo)} fill="none" stroke={GOLD} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" /> : null}
          {bothOp > 0.01 ? <polyline points={path(bothAt, 25, bothTo)} fill="none" stroke={VIOLET} strokeWidth={8} strokeDasharray="18 12" opacity={bothOp} /> : null}
          {/* end labels */}
          <text x={CX + 10} y={CY + 60} fill={TEAL} fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={60} textAnchor="start" opacity={youNumOp}>you {kfmt(youAt(65))}</text>
          <text x={CX + 10} y={CY + 140} fill={GOLD} fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={60} textAnchor="start" opacity={frNumOp}>friend {kfmt(friendAt(65))}</text>
          <text x={ageX(65) - 10} y={vY(bothAt(65)) - 26} fill={VIOLET} fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={56} textAnchor="end" opacity={bothOp * prog(f, BOTH_IN, BOTH_IN + 6)}>{kfmt(bothAt(65))}</text>
          <text x={(ageX(25) + ageX(35)) / 2} y={CY + CH / 2 + 40} fill={TEAL} fontFamily={FONT_MONO} fontWeight={700} fontSize={28} textAnchor="middle" opacity={tenOp}>+10 years</text>
        </svg>

        {/* what each of you put in */}
        {inOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 130, right: 170, top: 360, display: 'flex', justifyContent: 'space-between', opacity: inOp }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: TEAL, whiteSpace: 'nowrap' }}>you put in $24K</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: GOLD, opacity: in72Op, whiteSpace: 'nowrap' }}>they put in $72K</div>
          </div>
        ) : null}
        {timeOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 400, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: '#ffffff', opacity: timeOp }}>
            time did the work
          </div>
        ) : null}
        <Stamp text="STOP" color={RED} at={STOP_IN} until={F(16.8)} x={ageX(35)} y={vY(youAt(35)) - 90} size={64} />
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="$24K in vs $72K in. who has more at 65?" durSec={7.4} accent={GOLD} y={1215} />
      </Sequence>

      <Captions lines={VO} y={1450} accent={TEAL} />
      <ProgressBar color={TEAL} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75, whiteSpace: 'nowrap' }}>
        assumes 7%/yr average · returns vary · not advice
      </div>
    </AbsoluteFill>
  );
};

export default Short37Early;
