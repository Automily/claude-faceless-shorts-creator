import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, ShortsBackdrop, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — The Fine Print #11: what a 30-year mortgage really costs
// =============================================================================
export const compositionConfig = {
  id: 'Short29Mortgage',
  durationInSeconds: 41,
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

// THE MATH: $400,000 at 6.5% fixed, 30 years (example; principal & interest only).
const LOAN = 400_000;
const R = 0.065 / 12;
const PMT = (LOAN * R) / (1 - Math.pow(1 + R, -360)); // 2,528.27
const INTEREST = PMT * 360 - LOAN; // 510,178
const FIRST_INT = LOAN * R; // 2,166.67
const FIRST_PRIN = PMT - FIRST_INT; // 361.61
const EXTRA = (() => {
  let b = LOAN;
  let m = 0;
  let i = 0;
  while (b > 0.01) {
    const it = b * R;
    i += it;
    b = b + it - (PMT + 200);
    m++;
  }
  return { months: m, interest: i };
})();
const SAVED = INTEREST - EXTRA.interest; // ~111,892

// =============================================================================
// CUES — global frames from the real voice
// =============================================================================
const HOOK_OUT = F(4.6);
const SETUP = F(5.2);
const PMT_IN = F(7.7); // "About twenty-five twenty-eight a month." @ 7.68
const SPLIT_IN = F(12.2); // "Twenty-one sixty-seven goes to interest." @ 12.22
const PRIN_IN = F(15.3); // "Only three sixty-two pays down the house." @ 15.31
const SPLIT_OUT = F(18.2);
const PAUSE_FROM = F(18.3); // "Pause." @ 18.40
const PAUSE_DUR = F(3.4);
const STACK_IN = F(21.8); // "Five hundred ten thousand." @ 21.80–23.4
const MORE_IN = F(24.0); // "More than the house itself." @ 24.02
const EXTRA_IN = F(26.0); // "Add two hundred a month to principal..." @ 26.00
const EARLY_IN = F(28.5); // "...done five and a half years early." @ 28.47–30.6
const KEEP_IN = F(32.5); // "a hundred twelve thousand dollars" @ 32.58
const OUTRO = F(35.8);
const LOOP = F(39.9);
const END = F(41.0);

const BASE = 1060;
const PXD = 520 / (LOAN + INTEREST);
const SX = 330;
const SW = 260;

const k = (v: number) => `$${Math.round(v / 1000)}K`;
const usd = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;

const Short29Mortgage: React.FC = () => {
  const f = useCurrentFrame();

  const punch =
    f < LOOP ? 1.05 - 0.05 * EASE_INOUT(prog(f, 0, 28)) : 1.0 + 0.05 * EASE_INOUT(prog(f, LOOP, END));

  const setupOff = prog(f, SETUP, SETUP + 10);
  const outro = prog(f, OUTRO, OUTRO + 14);
  const pay = (on: number) => Math.max(1 - setupOff, on, outro);

  // the total stack: payoff picture; principal block is shown during setup, interest grows on the reveal
  const stackOp = pay(prog(f, STACK_IN - 8, STACK_IN)) * (1 - Math.min(prog(f, EXTRA_IN - 8, EXTRA_IN), 1 - outro));
  const interestP = pay(EASE_INOUT(prog(f, STACK_IN, STACK_IN + 30)));
  const moreOp = pay(prog(f, MORE_IN, MORE_IN + 8));

  const pmtOp = prog(f, PMT_IN, PMT_IN + 8) * (1 - prog(f, SPLIT_OUT - 8, SPLIT_OUT));
  const loanOp = prog(f, SETUP + 4, SETUP + 12) * (1 - prog(f, PMT_IN - 6, PMT_IN));
  const splitOp = prog(f, F(10.4), F(10.4) + 10) * (1 - prog(f, SPLIT_OUT - 8, SPLIT_OUT));
  const intFill = EASE_INOUT(prog(f, SPLIT_IN, SPLIT_IN + 18));
  const prinFill = EASE_INOUT(prog(f, PRIN_IN, PRIN_IN + 12));

  const extraOp = prog(f, EXTRA_IN, EXTRA_IN + 10) * (1 - prog(f, OUTRO - 8, OUTRO));
  const shortBar = EASE_INOUT(prog(f, EARLY_IN, EARLY_IN + 24));
  const keepOp = prog(f, KEEP_IN, KEEP_IN + 8);

  const titleOp = Math.min(1, 1 - prog(f, HOOK_OUT - 12, HOOK_OUT) + prog(f, LOOP + 8, LOOP + 26));

  const prinH = LOAN * PXD;
  const intH = INTEREST * PXD * interestP;

  return (
    <AbsoluteFill style={{ background: INK }}>
      <ShortsBackdrop base={INK} glow="#2a1c22" />

      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <div style={{ opacity: titleOp }}>
          <BigTitle
            lines={[
              { text: '$400K HOUSE LOAN', color: '#ffffff' },
              { text: `COSTS ${k(PMT * 360)}`, color: RED },
            ]}
            subtitle="30 years at 6.5% (example)"
            y={130}
            size={80}
            warm
          />
        </div>

        <Kicker text="30 YEARS · 6.5%" color={GOLD} y={200} at={SETUP} until={F(18.2)} />
        <Kicker text="THE TOTAL" color={RED} y={200} at={F(21.8)} until={F(25.8)} />
        <Kicker text="+$200 A MONTH" color={TEAL} y={200} at={EXTRA_IN} until={F(35.6)} />
        <Kicker text="HOUSE VS LOAN" color={GOLD} y={200} at={OUTRO} until={F(39.8)} />

        {loanOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: loanOp }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 130, color: TEAL }}>$400,000</div>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 40, color: MUTED }}>30 years · 6.5% fixed</div>
          </div>
        ) : null}
        {pmtOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', opacity: pmtOp }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, color: '#ffffff' }}>{usd(PMT)}</span>
            <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 40, color: MUTED }}> /mo</span>
          </div>
        ) : null}

        {/* the first payment, split */}
        {splitOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 160, width: 760, top: 640, opacity: splitOp }}>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: '#d8dde4', letterSpacing: 3 }}>YOUR FIRST PAYMENT</div>
            <div style={{ display: 'flex', height: 90, marginTop: 14, borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
              <div style={{ width: `${(FIRST_INT / PMT) * 100 * intFill}%`, background: RED }} />
              <div style={{ width: `${(FIRST_PRIN / PMT) * 100 * prinFill}%`, background: TEAL }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 54, color: RED, opacity: intFill }}>{usd(FIRST_INT)} interest</span>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 54, color: TEAL, opacity: prinFill }}>{usd(FIRST_PRIN)}</span>
            </div>
            <div style={{ textAlign: 'right', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: TEAL, opacity: prinFill }}>to the house</div>
          </div>
        ) : null}

        {/* the total stack */}
        {stackOp > 0.01 ? (
          <div style={{ opacity: stackOp }}>
            <div style={{ position: 'absolute', left: SX - 40, width: SW + 80, top: BASE, borderTop: '3px solid rgba(255,255,255,0.3)' }} />
            <div style={{ position: 'absolute', left: SX, width: SW, top: BASE - prinH, height: prinH, background: `linear-gradient(180deg, ${TEAL}, #2f7f74)`, borderRadius: '4px 4px 4px 4px' }} />
            <div style={{ position: 'absolute', left: SX, width: SW, top: BASE - prinH - intH, height: intH, background: RED, borderRadius: '14px 14px 0 0', boxShadow: `0 0 30px ${RED}55` }} />
            <div style={{ position: 'absolute', left: SX + SW + 24, top: BASE - prinH / 2 - 40, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 52, color: TEAL }}>
              {k(LOAN)}
              <div style={{ fontFamily: FONT_MONO, fontSize: 28, color: MUTED }}>the house</div>
            </div>
            <div style={{ position: 'absolute', left: SX + SW + 24, top: BASE - prinH - (INTEREST * PXD) / 2 - 40, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 52, color: RED, opacity: interestP }}>
              {k(INTEREST)}
              <div style={{ fontFamily: FONT_MONO, fontSize: 28, color: MUTED }}>interest</div>
            </div>
            {moreOp > 0.01 ? (
              <div style={{ position: 'absolute', left: 60, width: SX - 80, top: BASE - prinH - INTEREST * PXD + 20, textAlign: 'right', opacity: moreOp, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: RED }}>
                more than the house
              </div>
            ) : null}
          </div>
        ) : null}

        {/* +$200 a month */}
        {extraOp > 0.01 ? (
          <div style={{ position: 'absolute', left: 160, width: 760, top: 560, opacity: extraOp }}>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: MUTED }}>STANDARD PAYMENT</div>
            <div style={{ height: 60, borderRadius: 10, background: RED, marginTop: 10 }} />
            <div style={{ textAlign: 'right', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: RED }}>30 years</div>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 32, color: TEAL, marginTop: 30 }}>+$200 A MONTH</div>
            <div style={{ height: 60, width: `${100 - (100 - (EXTRA.months / 360) * 100) * shortBar}%`, borderRadius: 10, background: TEAL, marginTop: 10 }} />
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: TEAL, opacity: shortBar }}>{(EXTRA.months / 12).toFixed(1)} years · {((360 - EXTRA.months) / 12).toFixed(1)} early</div>
            <div style={{ marginTop: 60, textAlign: 'center', opacity: keepOp }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, color: GOLD }}>{k(SAVED)}</span>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 40, color: MUTED }}>of interest you keep</div>
            </div>
          </div>
        ) : null}
      </AbsoluteFill>

      <Sequence from={PAUSE_FROM} durationInFrames={PAUSE_DUR}>
        <PauseCard title="PAUSE" subtitle="total interest over 30 years?" durSec={3.4} accent={GOLD} y={1150} />
      </Sequence>

      <Captions lines={VO} y={1470} accent={RED} />
      <ProgressBar color={RED} />

      <div style={{ position: 'absolute', left: 60, right: 160, bottom: 330, textAlign: 'center', fontFamily: FONT_BODY, fontSize: 24, color: MUTED, opacity: 0.75 }}>
        example: $400K at 6.5% fixed · principal & interest only
      </div>
    </AbsoluteFill>
  );
};

export default Short29Mortgage;
