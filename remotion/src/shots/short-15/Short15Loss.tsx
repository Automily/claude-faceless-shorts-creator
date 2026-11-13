import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, Stamp, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #4: a 20% loss needs a 25% gain
// =============================================================================
export const compositionConfig = {
  id: 'Short15Loss',
  durationInSeconds: 35,
  fps: 30,
  width: 1080,
  height: 1920,
};

const RED = '#ef5f6b';
const TEAL = '#4db8a8';
const GOLD = '#f5d76e';
const MUTED = '#8b96a5';
const INK = '#0f1216';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// THE MATH: gain needed to recover a loss L = 1/(1-L) - 1
const START = 10_000;
const DROPPED = START * 0.8; // 8,000
const PLUS20 = DROPPED * 1.2; // 9,600
const SHORT = START - PLUS20; // 400
const need = (loss: number) => 1 / (1 - loss) - 1;

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(4.3);
const RESET_IN = F(4.6); // "Ten thousand dollars." back to $10K
const RESET_OUT = F(5.2);
const DROP_IN = F(6.5); // "drops twenty percent" @ 6.52–7.5
const DROP_OUT = F(7.3);
const EIGHT = F(8.45); // "eight thousand" @ 8.48
const PAUSE_FROM = F(9.9); // "Pause." @ 10.00
const PAUSE_DUR = F(3.3);
const UP20_IN = F(14.0); // "...of eight thousand is only sixteen hundred" @ 14.08–16.2
const UP20_OUT = F(15.5);
const SHORT_IN = F(15.6);
const UP25_IN = F(17.5); // "You need twenty-five percent" @ 17.52
const UP25_OUT = F(18.4);
const TABLE_IN = F(22.0); // "And it gets worse."
const ROW50_IN = F(23.6); // "Lose half" @ 23.65
const ROW50_GAIN = F(24.6); // "need to double" @ 24.61
const ROW33_IN = F(26.4); // "Down thirty-three" @ 26.51
const ROW33_GAIN = F(27.3); // "needs up fifty" @ 27.33
const ROW50_SAY = F(28.5); // "Down fifty needs up a hundred" @ 28.48–30.5
const TABLE_OUT = F(33.3);
const LOOP = F(33.4); // after "Gains build on less." @ 33.06–33.76
const END = F(35.0);

// the column: $0 at y=1080, $11,000 at y=470
const ZERO_Y = 1080;
const PX = 610 / 11_000;
const yOf = (v: number) => ZERO_Y - v * PX;
const BAR_X = 250;
const BAR_W = 300;

const money0 = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;

const Chip: React.FC<{ text: string; color: string; x: number; y: number; opacity: number; size?: number }> = ({
  text,
  color,
  x,
  y,
  opacity,
  size = 40,
}) =>
  opacity > 0.01 ? (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translateY(-50%) translateX(${(1 - opacity) * -16}px)`,
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

const Row: React.FC<{ y: number; loss: number; op: number; gainOp: number; hi: number }> = ({ y, loss, op, gainOp, hi }) => {
  if (op <= 0.01) return null;
  const g = need(loss);
  return (
    <div
      style={{
        position: 'absolute',
        left: 140,
        right: 160,
        top: y,
        height: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
        borderRadius: 18,
        background: `rgba(255,255,255,${0.04 + 0.06 * hi})`,
        border: `2px solid rgba(245,215,110,${0.6 * hi})`,
        opacity: op,
        transform: `translateY(${(1 - op) * 24}px) scale(${1 + 0.04 * hi})`,
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        fontSize: 64,
      }}
    >
      <span style={{ color: RED }}>−{Math.round(loss * 100)}%</span>
      <span style={{ color: MUTED, fontSize: 44 }}>needs</span>
      <span style={{ color: TEAL, opacity: gainOp }}>+{Math.round(g * 100)}%</span>
    </div>
  );
};

const Short15Loss: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  // ---- the balance: the single value the bar is drawn from ----------------------------------
  let v: number;
  if (f < RESET_IN) v = PLUS20;
  else if (f < DROP_IN) v = PLUS20 + (START - PLUS20) * EASE_INOUT(prog(f, RESET_IN, RESET_OUT));
  else if (f < UP20_IN) v = START - (START - DROPPED) * EASE_INOUT(prog(f, DROP_IN, DROP_OUT));
  else if (f < UP25_IN) v = DROPPED + (PLUS20 - DROPPED) * EASE_INOUT(prog(f, UP20_IN, UP20_OUT));
  else if (f < LOOP) v = PLUS20 + (START - PLUS20) * EASE_INOUT(prog(f, UP25_IN, UP25_OUT));
  else v = START - (START - PLUS20) * EASE_INOUT(prog(f, LOOP, LOOP + 12));

  // the bar view gives way to the table in the twist, and comes back for the loop
  const barView = Math.min(1, 1 - prog(f, TABLE_IN, TABLE_IN + 12) + prog(f, LOOP, LOOP + 10));
  const tableOp = prog(f, TABLE_IN + 6, TABLE_IN + 18) * (1 - prog(f, TABLE_OUT - 8, TABLE_OUT));

  // the falling $2,000 chunk
  const fall = prog(f, DROP_IN, DROP_IN + 24);
  const fallOp = fall > 0 && fall < 1 ? 1 - fall : 0;

  // the $400 gap: on at f0, off through reset, on again after +20%, closed by +25%, back for loop
  const gapOp = Math.max(
    1 - prog(f, RESET_IN, RESET_IN + 8),
    prog(f, SHORT_IN, SHORT_IN + 8) * (1 - prog(f, UP25_IN, UP25_IN + 8)),
    prog(f, LOOP + 6, LOOP + 16),
  );

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 30));
  const stampOp = Math.min(1, 1 - prog(f, RESET_IN, RESET_IN + 8) + prog(f, LOOP + 12, LOOP + 24));

  const chipDrop = prog(f, DROP_IN + 4, DROP_IN + 12) * (1 - prog(f, UP20_IN - 10, UP20_IN));
  const chipUp20 = prog(f, UP20_IN + 4, UP20_IN + 12) * (1 - prog(f, UP25_IN - 6, UP25_IN + 4));
  const chipUp25 = prog(f, UP25_IN + 4, UP25_IN + 12) * (1 - prog(f, TABLE_IN - 6, TABLE_IN));
  const eightPulse = Math.min(prog(f, EIGHT, EIGHT + 5), 1 - prog(f, EIGHT + 20, EIGHT + 30));

  // bar colour: teal for whatever climbed back, ink-grey for the base
  const top = yOf(v);
  const evenY = yOf(START);
  const rows = {
    r10: tableOp,
    r20: tableOp,
    r33: prog(f, ROW33_IN, ROW33_IN + 8) * tableOp,
    r50: prog(f, ROW50_IN, ROW50_IN + 8) * tableOp,
  };

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#1c2a28" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'LOSE 20%, GAIN 20%', color: '#ffffff' },
              { text: 'STILL DOWN', color: RED },
            ]}
            subtitle="$10,000 → $8,000 → $9,600"
            y={130}
            size={80}
            warm
          />
        </div>

        <Kicker text="THE MARKET DROPS 20%" color={RED} y={200} at={RESET_IN} until={F(9.8)} />
        <Kicker text="+20% IS NOT ENOUGH" color={GOLD} y={200} at={F(13.3)} until={F(21.8)} />
        <Kicker text="WHAT A LOSS REALLY COSTS" color={GOLD} y={200} at={TABLE_IN} until={F(33.2)} />

        {/* ---- the bar view ---- */}
        <div style={{ opacity: barView }}>
          {/* break-even line */}
          <div
            style={{
              position: 'absolute',
              left: 150,
              width: 760,
              top: evenY,
              borderTop: `3px dashed rgba(255,255,255,0.45)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 600,
              top: evenY - 44,
              fontFamily: FONT_BODY,
              fontWeight: 600,
              fontSize: 30,
              color: '#cfd5dd',
              letterSpacing: 2,
            }}
          >
            $10,000 · EVEN
          </div>

          {/* base of the bar */}
          <div
            style={{
              position: 'absolute',
              left: BAR_X,
              width: BAR_W,
              top,
              height: ZERO_Y - top,
              borderRadius: '14px 14px 4px 4px',
              background: `linear-gradient(180deg, ${TEAL} 0%, #2f7f74 100%)`,
              boxShadow: `0 0 ${30 * eightPulse}px ${GOLD}`,
            }}
          />
          {/* the $400 shortfall */}
          <div
            style={{
              position: 'absolute',
              left: BAR_X,
              width: BAR_W,
              top: evenY,
              height: Math.max(0, yOf(PLUS20) - evenY),
              background: `repeating-linear-gradient(45deg, ${RED}55 0 10px, transparent 10px 20px)`,
              border: `2px solid ${RED}`,
              opacity: gapOp,
            }}
          />
          <Chip text={`SHORT ${money0(SHORT)}`} color={RED} x={BAR_X + BAR_W + 30} y={yOf(9_800) + 30} opacity={gapOp} size={38} />

          {/* the $2,000 that falls off */}
          <div
            style={{
              position: 'absolute',
              left: BAR_X,
              width: BAR_W,
              top: yOf(START) + fall * 420,
              height: (START - DROPPED) * PX,
              background: RED,
              opacity: fallOp * 0.9,
              transform: `rotate(${fall * 9}deg)`,
              borderRadius: 10,
            }}
          />

          {/* the balance itself */}
          <div
            style={{
              position: 'absolute',
              left: BAR_X,
              width: BAR_W,
              top: ZERO_Y + 20,
              textAlign: 'center',
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 76,
              color: '#ffffff',
              transform: `scale(${1 + 0.1 * eightPulse})`,
            }}
          >
            {money0(v)}
          </div>

          <Chip text="−20% = −$2,000" color={RED} x={BAR_X + BAR_W + 30} y={yOf(DROPPED) + 40} opacity={chipDrop} />
          <Chip text="+20% = +$1,600" color={GOLD} x={BAR_X + BAR_W + 30} y={yOf(DROPPED) + 40} opacity={chipUp20} />
          <Chip text="+25% = +$2,000" color={TEAL} x={BAR_X + BAR_W + 30} y={yOf(DROPPED) + 40} opacity={chipUp25} />

          <div style={{ opacity: stampOp }}>
            <Stamp text={`STILL DOWN ${money0(SHORT)}`} at={-14} color={RED} x={540} y={1250} size={60} rotate={-5} />
          </div>
        </div>

        {/* ---- the twist: the loss/gain table ---- */}
        <Row y={560} loss={0.1} op={rows.r10} gainOp={1} hi={0} />
        <Row y={700} loss={0.2} op={rows.r20} gainOp={1} hi={prog(f, TABLE_IN + 10, TABLE_IN + 18) * (1 - prog(f, ROW50_IN, ROW50_IN + 8))} />
        <Row y={840} loss={1 / 3} op={rows.r33} gainOp={prog(f, ROW33_GAIN, ROW33_GAIN + 8)} hi={Math.min(prog(f, ROW33_IN, ROW33_IN + 8), 1 - prog(f, ROW50_SAY, ROW50_SAY + 8))} />
        <Row y={980} loss={0.5} op={rows.r50} gainOp={prog(f, ROW50_GAIN, ROW50_GAIN + 8)} hi={Math.min(prog(f, ROW50_IN, ROW50_IN + 8), 1 - prog(f, ROW33_IN, ROW33_IN + 8)) + prog(f, ROW50_SAY, ROW50_SAY + 8)} />
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="what gain gets you back to even?" durSec={3.3} accent={GOLD} y={1180} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={TEAL} />
      <ProgressBar color={TEAL} />
    </AbsoluteFill>
  );
};

export default Short15Loss;
