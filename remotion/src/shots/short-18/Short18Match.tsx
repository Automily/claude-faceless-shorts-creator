import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import { ChartFrame, Curve, EndDot, Ticker, lastPt, makeScale, money } from '../../lib/chart';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #5: the 401(k) match
// =============================================================================
export const compositionConfig = {
  id: 'Short18Match',
  durationInSeconds: 40.5,
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

// THE MATH: $60,000 salary, 100% match up to 4% -> you $2,400 + employer $2,400.
// The employer's half alone, $2,400/yr at 7% for 30 years (annual deposits) -> $226,706,
// matching the VO's "about two hundred twenty-seven thousand". FV(t) = P((1.07^t - 1)/0.07),
// sampled monthly so the curve is smooth.
const YOU = 2400;
const EMP = 2400;
const MATCH_SERIES = Array.from({ length: 30 * 12 + 1 }, (_, m) => {
  const t = m / 12;
  return { x: t, y: (EMP * (Math.pow(1.07, t) - 1)) / 0.07 };
});
const MATCH_30 = lastPt(MATCH_SERIES).y;
const BOX = { x: 150, y: 540, w: 740, h: 520 };
const S = makeScale([0, 30], [0, 250_000], BOX);

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(4.4);
const REWIND = F(5.0);
const YOU_IN = F(12.2); // "you put in twenty-four hundred" @ 12.20–13.6
const YOU_OUT = F(13.1);
const PAUSE_FROM = F(14.1); // "Pause." @ 14.20
const PAUSE_DUR = F(2.85);
const EMP_IN = F(17.0); // "Another twenty-four hundred." @ 17.00–18.3
const EMP_OUT = F(17.8);
const PCT_IN = F(19.0); // "A hundred percent return, on day one." @ 19.02
const CMP_IN = F(21.6); // "Stocks average around ten percent a year." @ 21.60
const CMP2_IN = F(23.8); // "This is a hundred, instantly." @ 23.84
const RAISE_IN = F(26.4); // "Skip it, and you're turning down a four percent raise." @ 26.40–28.9
const CHART_IN = F(29.8); // "Over thirty years..." @ 29.80
const GROW_OUT = F(33.6); // "...two hundred twenty-seven thousand." @ 32.58–34.2
const LOOP = F(38.8); // after "...will ever get." @ 38.12–38.7
const END = F(40.5);

// the stack
const BASE_Y = 1060;
const PXD = 440 / (YOU + EMP);
const SX = 330;
const SW = 300;

const Chip: React.FC<{ text: string; color: string; x: number; y: number; opacity: number; size?: number; center?: boolean }> = ({
  text,
  color,
  x,
  y,
  opacity,
  size = 38,
  center,
}) =>
  opacity > 0.01 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${center ? '-50%' : '0'}, -50%) translateY(${(1 - opacity) * 14}px)`,
        opacity,
        fontFamily: FONT_MONO,
        fontWeight: 700,
        fontSize: size,
        color,
        background: 'rgba(15,18,22,0.88)',
        border: `2px solid ${color}`,
        borderRadius: 14,
        padding: '6px 18px',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  ) : null;

const Short18Match: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const rewound = EASE_INOUT(prog(f, REWIND, REWIND + 18));
  const youP = Math.max(1 - rewound, EASE_INOUT(prog(f, YOU_IN, YOU_OUT)));
  const empP = Math.max(1 - rewound, EASE_INOUT(prog(f, EMP_IN, EMP_OUT)));

  // the chart takes over for the 30-year twist and hands back for the loop
  const chartOp = prog(f, CHART_IN - 4, CHART_IN + 10) * (1 - prog(f, LOOP, LOOP + 12));
  const stackOp = 1 - chartOp;
  const grow = EASE_INOUT(prog(f, CHART_IN + 6, GROW_OUT));

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 30));
  const stampOp = Math.min(1, 1 - prog(f, REWIND, REWIND + 8) + prog(f, LOOP + 10, LOOP + 22));
  const pctOp = Math.max(1 - prog(f, REWIND, REWIND + 8), prog(f, PCT_IN, PCT_IN + 8) * (1 - prog(f, CHART_IN - 6, CHART_IN)), prog(f, LOOP + 10, LOOP + 20));
  const youLbl = Math.max(1 - prog(f, REWIND, REWIND + 8), prog(f, YOU_OUT - 4, YOU_OUT + 6));
  const empLbl = Math.max(1 - prog(f, REWIND, REWIND + 8), prog(f, EMP_OUT - 4, EMP_OUT + 6));
  const cmp1 = prog(f, CMP_IN, CMP_IN + 8) * (1 - prog(f, RAISE_IN - 8, RAISE_IN));
  const cmp2 = prog(f, CMP2_IN, CMP2_IN + 8) * (1 - prog(f, RAISE_IN - 8, RAISE_IN));
  const raiseOp = prog(f, RAISE_IN + 8, RAISE_IN + 16) * (1 - prog(f, CHART_IN - 8, CHART_IN));
  const tickOp = prog(f, CHART_IN + 6, CHART_IN + 14) * (1 - prog(f, LOOP, LOOP + 10));

  const youH = YOU * PXD * youP;
  const empH = EMP * PXD * empP;
  const empTop = BASE_Y - YOU * PXD - empH;
  const empDrop = (1 - empP) * -120 * (f > EMP_IN ? 1 : 0);

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#1c2a28" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'THE ONLY INSTANT', color: '#ffffff' },
              { text: '100% RETURN', color: GOLD },
            ]}
            subtitle="your 401(k) match"
            y={130}
            size={80}
            warm
          />
        </div>

        <Kicker text="100% MATCH UP TO 4% OF PAY" color={TEAL} y={200} at={REWIND} until={F(14.0)} />
        <Kicker text="YOUR EMPLOYER ADDS" color={GOLD} y={200} at={EMP_IN} until={F(26.2)} />
        <Kicker text="SKIP IT AND..." color={RED} y={200} at={RAISE_IN} until={F(29.6)} />
        <Kicker text="30 YEARS OF THE FREE HALF" color={GOLD} y={200} at={CHART_IN} until={F(38.6)} />

        {/* ---- the stack ---- */}
        <div style={{ opacity: stackOp }}>
          <div style={{ position: 'absolute', left: SX - 60, width: SW + 120, top: BASE_Y, borderTop: '3px solid rgba(255,255,255,0.3)' }} />
          <div
            style={{
              position: 'absolute',
              left: SX,
              width: SW,
              top: BASE_Y - youH,
              height: youH,
              background: `linear-gradient(180deg, ${TEAL}, #2f7f74)`,
              borderRadius: '6px 6px 4px 4px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: SX,
              width: SW,
              top: empTop + empDrop,
              height: empH,
              background: `linear-gradient(180deg, ${GOLD}, #c9a940)`,
              borderRadius: '14px 14px 6px 6px',
              boxShadow: `0 0 ${30 * empP}px ${GOLD}55`,
            }}
          />
          <Chip text={`YOU ${money(YOU)}`} color={TEAL} x={SX + SW + 24} y={BASE_Y - (YOU * PXD) / 2} opacity={youLbl} size={34} />
          <Chip text={`EMPLOYER +${money(EMP)}`} color={GOLD} x={SX + SW + 24} y={BASE_Y - YOU * PXD - (EMP * PXD) / 2} opacity={empLbl} size={30} />
          {pctOp > 0.01 ? (
            <div
              style={{
                position: 'absolute',
                left: SX - 100,
                width: SW + 200,
                top: BASE_Y - 440 - 130,
                textAlign: 'center',
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: 96,
                color: GOLD,
                opacity: pctOp,
              }}
            >
              +100%
            </div>
          ) : null}

          <div style={{ opacity: stampOp }}>
            <Stamp text="ON DAY ONE" at={-14} color={GOLD} x={540} y={1210} size={60} rotate={-5} />
          </div>
          <Chip text="STOCKS ≈ 10% A YEAR" color={MUTED} x={540} y={1160} opacity={cmp1} center />
          <Chip text="THE MATCH: 100% NOW" color={GOLD} x={540} y={1250} opacity={cmp2} center size={42} />
          <Chip text="= TURNING DOWN A 4% RAISE" color={RED} x={540} y={1200} opacity={raiseOp} center size={40} />
        </div>

        {/* ---- the 30-year chart ---- */}
        <div style={{ opacity: chartOp }}>
          <ChartFrame scale={S} yTicks={[0, 100_000, 200_000]} xTicks={[0, 10, 20, 30]} />
          <Curve scale={S} pts={MATCH_SERIES} color={GOLD} p={grow} width={8} />
          <EndDot scale={S} pts={MATCH_SERIES} p={grow} color={GOLD} label="free half" dy={-58} anchor="end" plate opacity={prog(grow, 0.6, 0.9)} />
        </div>
        <Ticker value={MATCH_30} p={grow} label="just the employer's half, 30 yrs" color={GOLD} x={540} y={1215} size={96} format={money} opacity={tickOp} />
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="what does your employer put in?" durSec={2.85} accent={GOLD} y={1150} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={GOLD} />
      <ProgressBar color={GOLD} />

      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 160,
          bottom: 330,
          textAlign: 'center',
          fontFamily: FONT_BODY,
          fontSize: 26,
          color: MUTED,
          opacity: 0.75,
        }}
      >
        match terms and vesting vary · growth at 7%/yr assumed
      </div>
    </AbsoluteFill>
  );
};

export default Short18Match;
