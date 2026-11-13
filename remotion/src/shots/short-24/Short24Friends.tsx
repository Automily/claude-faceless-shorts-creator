import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Feels Wrong: the friendship paradox
// =============================================================================
export const compositionConfig = {
  id: 'Short24Friends',
  durationInSeconds: 36.6,
  fps: 30,
  width: 1080,
  height: 1920,
};

const GOLD = '#f5d76e';
const RED = '#ef5f6b';
const TEAL = '#4db8a8';
const VIOLET = '#b79be0';
const MUTED = '#8b96a5';
const INK = '#0f1020';
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const F = (s: number) => Math.round(s * 30);

// THE NETWORK: person 0 is friends with everyone (1..7); plus 1–2 and 3–4.
// Friend counts 7,2,2,2,2,1,1,1. Each of 1..7 has friends averaging 4.5 or 7 -> 7 of 8 have fewer
// friends than their friends do. Only the hub (7 vs avg 1.57) doesn't.
const EDGES: [number, number][] = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [1, 2], [3, 4]];
const N = 8;
const DEG = Array.from({ length: N }, (_, i) => EDGES.filter(([a, b]) => a === i || b === i).length);
const CX = 540;
const CY = 810;
const RAD = 300;
const POS = Array.from({ length: N }, (_, i) =>
  i === 0 ? { x: CX, y: CY } : { x: CX + RAD * Math.cos(-Math.PI / 2 + ((i - 1) * 2 * Math.PI) / 7), y: CY + RAD * Math.sin(-Math.PI / 2 + ((i - 1) * 2 * Math.PI) / 7) },
);

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(4.4);
const SETUP = F(5.8);
const COUNT_IN = F(7.15); // "Count each person's friends." @ 7.16–8.4
const SMALL_IN = F(9.2); // "Most have one or two." @ 9.20
const HUB_IN = F(10.6); // "One person knows everyone." @ 10.63
const PAUSE_FROM = F(12.7); // "Pause." @ 12.80
const PAUSE_DUR = F(4.6);
const MARK_IN = F(17.6); // "Seven out of eight." @ 17.60–18.8
const BIG_IN = F(18.15);
const LIST_IN = F(20.9); // "on everyone's list" @ 20.95
const AGAIN_IN = F(22.3); // "counted again and again" @ 22.33–23.6
const TWIST_IN = F(25.0); // "Epidemiologists use this." @ 25.00
const EARLY_IN = F(30.6); // "up to two weeks early" @ 30.47–31.7
const BACK = F(32.6); // "It's not you. It's who gets counted."
const LOOP = F(35.3);
const END = F(36.6);

// two outbreak curves: the friends' group peaks earlier
const curve = (shift: number) =>
  Array.from({ length: 61 }, (_, k) => {
    const x = k / 60;
    const y = Math.exp(-Math.pow((x - 0.55 + shift) / 0.14, 2));
    return `${k === 0 ? 'M' : 'L'} ${160 + x * 760} ${1080 - y * 360}`;
  }).join(' ');

const Short24Friends: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const setupOff = prog(f, SETUP, SETUP + 10);
  const back = prog(f, BACK, BACK + 14);
  const pay = (on: number) => Math.max(1 - setupOff, on, back);

  const badgeOn = (i: number) => pay(prog(f, COUNT_IN + i * 4, COUNT_IN + i * 4 + 6));
  const markOn = (i: number) => pay(prog(f, MARK_IN + (i - 1) * 3, MARK_IN + (i - 1) * 3 + 6));
  const bigOp = Math.max(1 - setupOff, prog(f, BIG_IN, BIG_IN + 8) * (1 - prog(f, TWIST_IN - 8, TWIST_IN)), prog(f, BACK + 6, BACK + 18));
  const hubGlow = Math.max(Math.min(prog(f, HUB_IN, HUB_IN + 8), 1 - prog(f, PAUSE_FROM - 8, PAUSE_FROM)), Math.min(prog(f, LIST_IN, LIST_IN + 8), 1 - prog(f, TWIST_IN - 8, TWIST_IN)));
  const smallPulse = Math.min(prog(f, SMALL_IN, SMALL_IN + 6), 1 - prog(f, HUB_IN - 4, HUB_IN + 4));
  const againOp = prog(f, AGAIN_IN, AGAIN_IN + 8) * (1 - prog(f, TWIST_IN - 8, TWIST_IN));
  const twistOp = prog(f, TWIST_IN, TWIST_IN + 12) * (1 - prog(f, BACK - 6, BACK + 6));
  const graphOp = 1 - twistOp;
  const earlyOp = prog(f, EARLY_IN, EARLY_IN + 8) * (1 - prog(f, BACK - 8, BACK));
  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 22));
  const curveDraw = EASE_INOUT(prog(f, TWIST_IN + 10, F(29.0)));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#232050" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: 'YOUR FRIENDS HAVE', color: '#ffffff' },
              { text: 'MORE FRIENDS THAN YOU', color: GOLD },
            ]}
            subtitle="the friendship paradox"
            y={130}
            size={72}
            warm
          />
        </div>

        <Kicker text="COUNT EVERYONE'S FRIENDS" color={VIOLET} y={200} at={SETUP} until={F(12.6)} />
        <Kicker text="WHO HAS FEWER THAN THEIR FRIENDS?" color={RED} y={200} at={MARK_IN} until={F(24.8)} />
        <Kicker text="HOW SCIENTISTS USE IT" color={TEAL} y={200} at={TWIST_IN} until={F(32.4)} />
        <Kicker text="IT'S WHO GETS COUNTED" color={GOLD} y={200} at={BACK} until={F(35.2)} />

        <div style={{ opacity: graphOp }}>
          <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
            {EDGES.map(([a, b], k) => {
              const hubEdge = a === 0;
              return (
                <line
                  key={k}
                  x1={POS[a].x}
                  y1={POS[a].y}
                  x2={POS[b].x}
                  y2={POS[b].y}
                  stroke={hubEdge && hubGlow > 0.1 ? GOLD : '#7d7fb8'}
                  strokeWidth={hubEdge ? 5 + 3 * hubGlow : 5}
                  strokeOpacity={0.55 + 0.4 * (hubEdge ? hubGlow : 0)}
                />
              );
            })}
          </svg>
          {POS.map((p, i) => {
            const isHub = i === 0;
            const r = isHub ? 62 : 46;
            const glow = isHub ? hubGlow : DEG[i] <= 2 ? smallPulse : 0;
            return (
              <div key={i}>
                <div
                  style={{
                    position: 'absolute',
                    left: p.x - r,
                    top: p.y - r,
                    width: r * 2,
                    height: r * 2,
                    borderRadius: r,
                    background: isHub ? '#2b2d58' : '#23254a',
                    border: `4px solid ${isHub ? GOLD : '#e8e6ff'}`,
                    boxShadow: glow > 0.05 ? `0 0 ${36 * glow}px ${isHub ? GOLD : VIOLET}` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: isHub ? 64 : 48, color: isHub ? GOLD : '#ffffff', opacity: badgeOn(i) }}>{DEG[i]}</span>
                </div>
                {!isHub ? (
                  <div
                    style={{
                      position: 'absolute',
                      left: p.x - 90,
                      width: 180,
                      whiteSpace: 'nowrap',
                      top: p.y + r + 6,
                      textAlign: 'center',
                      fontFamily: FONT_MONO,
                      fontWeight: 700,
                      fontSize: 32,
                      color: RED,
                      opacity: markOn(i),
                    }}
                  >
                    fewer ↓
                  </div>
                ) : null}
              </div>
            );
          })}
          {againOp > 0.01 ? (
            <div style={{ position: 'absolute', left: CX + 70, top: CY - 100, opacity: againOp, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 36, color: GOLD, background: 'rgba(15,16,32,0.9)', border: `2px solid ${GOLD}`, borderRadius: 12, padding: '4px 12px' }}>
              on 7 lists
            </div>
          ) : null}
        </div>

        {bigOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1170, textAlign: 'center', opacity: bigOp }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 120, color: RED }}>7 of 8</span>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 36, color: MUTED }}>have fewer friends than their friends</div>
          </div>
        ) : null}

        {twistOp > 0.01 ? (
          <div style={{ opacity: twistOp }}>
            <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
              <line x1={160} y1={1080} x2={920} y2={1080} stroke="rgba(255,255,255,0.3)" strokeWidth={3} />
              <path d={curve(0)} fill="none" stroke={MUTED} strokeWidth={7} strokeDasharray={`${2000 * curveDraw} 2000`} />
              <path d={curve(0.12)} fill="none" stroke={RED} strokeWidth={8} strokeDasharray={`${2000 * curveDraw} 2000`} />
            </svg>
            <div style={{ position: 'absolute', left: 160, top: 560, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: RED }}>● THEIR FRIENDS</div>
            <div style={{ position: 'absolute', left: 160, top: 606, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: MUTED }}>● RANDOM PEOPLE</div>
            <div style={{ position: 'absolute', left: 160, top: 1100, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 28, color: MUTED }}>flu cases over the season →</div>
            {earlyOp > 0.01 ? (
              <div style={{ position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center', opacity: earlyOp, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: RED }}>
                up to 2 weeks earlier
              </div>
            ) : null}
          </div>
        ) : null}

      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="who has fewer friends than their friends?" durSec={4.6} accent={GOLD} y={1200} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={GOLD} />
      <ProgressBar color={VIOLET} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.7 }}>
        outbreak finding: Christakis & Fowler, 2010 · curves illustrative
      </div>
    </AbsoluteFill>
  );
};

export default Short24Friends;
