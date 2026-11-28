import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { Captions, ProgressBar, prog } from '../../lib/shorts';
import { FONT_DISPLAY } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG — Blocky Town pilot: "In this town… except me. Huss. Huss. Huss."
// Original blocky characters and world (no Roblox assets/branding). 100% code-drawn.
// =============================================================================
export const compositionConfig = {
  id: 'Blox1Pilot',
  durationInSeconds: 28.1,
  fps: 30,
  width: 1080,
  height: 1920,
};

const F = (s: number) => Math.round(s * 30);
const EASE = Easing.bezier(0.37, 0, 0.63, 1);
const GROUND = 1240;

// every "Huss." word time (from the real voice)
const HUSS = [4.48, 4.979, 5.409, 11.48, 11.933, 12.316, 18.45, 18.822, 19.147, 25.2, 25.548, 25.85];
const hussPulse = (t: number) =>
  HUSS.reduce((acc, h) => (t >= h && t < h + 0.32 ? Math.max(acc, 1 - (t - h) / 0.32) : acc), 0);
const hussCount = (t: number, from: number) => HUSS.filter((h) => h >= from && h <= t).length;

const S = {
  night: [0, 6.75],
  chicken: [6.75, 13.95],
  lava: [13.95, 20.25],
  mayor: [20.25, 26.9],
  loop: [26.9, 28.1],
} as const;
const on = (t: number, [a, b]: readonly [number, number]) => t >= a && t < b;

// =============================================================================
// THE BLOCKY CAST
// =============================================================================
type Pose = 'stand' | 'pushup' | 'lift' | 'surf' | 'flee';
const Blox: React.FC<{
  x: number; y: number; s?: number; pose?: Pose; pump?: number; head?: string; shirt?: string; pants?: string;
  band?: boolean; mustache?: boolean; tophat?: boolean; scared?: boolean; flip?: boolean; f?: number;
}> = ({ x, y, s = 1, pose = 'stand', pump = 0, head = '#e9a66b', shirt = '#d8343e', pants = '#1e2430', band = true, mustache, tophat, scared, flip, f = 0 }) => {
  const squash = 1 - 0.08 * pump;
  const stretch = 1 + 0.06 * pump;
  const run = pose === 'flee' ? Math.sin(f * 0.9) : 0;
  const body = (
    <g>
      {/* legs */}
      <rect x={-46} y={-170} width={42} height={170} fill={pants} transform={`rotate(${25 * run} -25 -170)`} />
      <rect x={4} y={-170} width={42} height={170} fill={pants} transform={`rotate(${-25 * run} 25 -170)`} />
      {/* torso */}
      <rect x={-60} y={-330} width={120} height={165} rx={6} fill={shirt} />
      <rect x={-60} y={-330} width={120} height={18} fill="#000" opacity={0.12} />
      {/* arms */}
      {pose === 'lift' ? (
        <>
          <rect x={-104} y={-470} width={40} height={160} rx={8} fill={shirt} transform={`rotate(${-8 + 6 * pump} -84 -320)`} />
          <rect x={64} y={-470} width={40} height={160} rx={8} fill={shirt} transform={`rotate(${8 - 6 * pump} 84 -320)`} />
        </>
      ) : scared || pose === 'flee' ? (
        <>
          <rect x={-104} y={-460} width={40} height={150} rx={8} fill={shirt} transform="rotate(-25 -84 -320)" />
          <rect x={64} y={-460} width={40} height={150} rx={8} fill={shirt} transform="rotate(25 84 -320)" />
        </>
      ) : (
        <>
          <rect x={-102} y={-326} width={40} height={150} rx={8} fill={shirt} transform={`rotate(${10 + 20 * pump} -82 -320)`} />
          <rect x={62} y={-326} width={40} height={150} rx={8} fill={shirt} transform={`rotate(${-10 - 20 * pump} 82 -320)`} />
        </>
      )}
      {/* head */}
      <g transform="translate(0 -400)">
        <rect x={-62} y={-62} width={124} height={124} rx={14} fill={head} />
        {band ? <rect x={-64} y={-44} width={128} height={20} fill="#ffffff" /> : null}
        {band ? <rect x={-64} y={-44} width={128} height={20} fill="#d8343e" opacity={0.85} /> : null}
        {/* eyes */}
        <rect x={-34} y={-14} width={16} height={scared ? 26 : 20} rx={4} fill="#111" />
        <rect x={18} y={-14} width={16} height={scared ? 26 : 20} rx={4} fill="#111" />
        {/* determined brows */}
        {!scared ? <rect x={-40} y={-24} width={26} height={7} fill="#111" transform="rotate(12 -27 -20)" /> : null}
        {!scared ? <rect x={14} y={-24} width={26} height={7} fill="#111" transform="rotate(-12 27 -20)" /> : null}
        {/* mouth: open on each huss */}
        {pump > 0.2 || scared ? <ellipse cx={0} cy={30} rx={14} ry={16 * Math.max(pump, scared ? 0.8 : 0)} fill="#111" /> : <rect x={-18} y={26} width={36} height={7} rx={3} fill="#111" />}
        {mustache ? <path d="M -40 18 Q -20 6 0 16 Q 20 6 40 18 Q 30 30 0 24 Q -30 30 -40 18 Z" fill="#3a2a1a" /> : null}
        {tophat ? (
          <g>
            <rect x={-56} y={-74} width={112} height={14} fill="#111" />
            <rect x={-40} y={-170} width={80} height={100} fill="#111" />
            <rect x={-40} y={-100} width={80} height={14} fill="#c9a24a" />
          </g>
        ) : null}
      </g>
    </g>
  );
  let tf = `translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`;
  if (pose === 'pushup') {
    // lying horizontal, bobbing with the pump
    return (
      <g transform={`translate(${x} ${y - 40 - 30 * pump}) scale(${s}) rotate(-80)`}>{body}</g>
    );
  }
  return <g transform={`${tf} scale(${1 / stretch} ${squash * stretch})`}>{body}</g>;
};

const Chicken: React.FC<{ x: number; y: number; s?: number; f: number; up?: number }> = ({ x, y, s = 1, f, up = 0 }) => {
  const stomp = up > 0 ? 0 : Math.abs(Math.sin(f * 0.25)) * 18;
  return (
    <g transform={`translate(${x} ${y - stomp}) scale(${s}) rotate(${-20 * up})`}>
      <rect x={-90} y={-40} width={22} height={140} fill="#f0a020" />
      <rect x={60} y={-40} width={22} height={140} fill="#f0a020" />
      <rect x={-200} y={-340} width={400} height={300} rx={30} fill="#f6f2ea" />
      <rect x={-260} y={-320} width={120} height={180} rx={20} fill="#ece6d8" />
      <rect x={60} y={-560} width={180} height={240} rx={24} fill="#f6f2ea" />
      <rect x={90} y={-620} width={40} height={60} fill="#d8343e" />
      <rect x={130} y={-640} width={40} height={80} fill="#d8343e" />
      <rect x={170} y={-620} width={40} height={60} fill="#d8343e" />
      <rect x={240} y={-470} width={80} height={40} fill="#f0a020" />
      <rect x={170} y={-500} width={28} height={28} fill="#111" />
      <rect x={210} y={-430} width={30} height={50} fill="#d8343e" />
    </g>
  );
};

const House: React.FC<{ x: number; w?: number; h?: number; roof?: string; wall?: string; lit?: number; z?: number; f?: number }> = ({ x, w = 220, h = 260, roof = '#8a3a2a', wall = '#d8c4a0', lit = 0, z = 0, f = 0 }) => (
  <g transform={`translate(${x} ${GROUND})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} fill={wall} />
    <path d={`M ${-w / 2 - 20} ${-h} L 0 ${-h - 110} L ${w / 2 + 20} ${-h} Z`} fill={roof} />
    <rect x={-w / 4 - 30} y={-h + 50} width={60} height={60} fill={lit ? '#ffd36a' : '#2a3048'} />
    <rect x={w / 4 - 30} y={-h + 50} width={60} height={60} fill="#2a3048" />
    <rect x={-25} y={-90} width={50} height={90} fill="#5a3a24" />
    {z > 0
      ? ['z', 'Z', 'z'].map((c, i) => (
          <text key={i} x={w / 4 + 10 + i * 22} y={-h - 30 - i * 34 - ((f + i * 15) % 45)} fill="#cfd8ff" fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={36 + i * 8} opacity={z * 0.85}>{c}</text>
        ))
      : null}
  </g>
);

const Ground: React.FC<{ color?: string }> = ({ color = '#4caf50' }) => (
  <g>
    <rect x={0} y={GROUND} width={1080} height={680} fill={color} />
    <rect x={0} y={GROUND} width={1080} height={20} fill="#000" opacity={0.12} />
  </g>
);

const HussPop: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => {
  const idx = HUSS.findIndex((h) => t >= h && t < h + 0.45);
  if (idx < 0) return null;
  const k = (t - HUSS[idx]) / 0.45;
  const rot = [-10, 6, -4][idx % 3];
  const dx = [-120, 60, 160][idx % 3];
  return (
    <g transform={`translate(${x + dx} ${y - 60 * k}) rotate(${rot}) scale(${1.4 - 0.4 * Math.min(1, k * 3)})`} opacity={1 - Math.max(0, k - 0.6) * 2.5}>
      <text x={0} y={0} textAnchor="middle" fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={130} fill="#ffe14a" stroke="#111" strokeWidth={10} paintOrder="stroke">HUSS</text>
    </g>
  );
};

const Puff: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => {
  const p = hussPulse(t);
  if (p <= 0.01) return null;
  return (
    <g opacity={p}>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={x + 30 + i * 34 * (1.6 - p)} y={y - 10 - i * 14} width={34 - i * 6} height={34 - i * 6} rx={6} fill="#ffffff" opacity={0.85 - i * 0.2} />
      ))}
    </g>
  );
};

// =============================================================================
const Blox1Pilot: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const pump = hussPulse(t);
  const punch = 1 + 0.035 * pump;

  // a tiny "except me" freeze-zoom on each scene
  const exceptAt = [2.64, 9.86, 17.06, 23.26];
  const exceptZoom = exceptAt.reduce((acc, e) => Math.max(acc, t >= e && t < e + 1.3 ? EASE(prog(f, F(e), F(e) + 8)) : 0), 0);

  // night scene
  const moonGrow = 1 + 0.25 * hussCount(t, 4.4);
  // chicken scene
  const lifted = EASE(prog(f, F(11.3), F(11.7)));
  const chickenX = 760 - 260 * prog(f, F(7.0), F(9.8));
  // lava scene
  const lava = prog(f, F(15.3), F(15.8));
  const surfX = 200 + 600 * prog(f, F(17.0), F(20.2));
  // mayor scene
  const paperDrop = EASE(prog(f, F(23.3), F(23.8)));

  const titleOp = Math.max(1 - prog(f, F(0.3), F(0.8)), prog(f, F(27.0), F(27.6)));

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(540 1000) scale(${punch * (1 + 0.12 * exceptZoom)}) translate(-540 -1000)`}>
          {/* ---------- 1. EVERYONE SLEEPS. EXCEPT ME. ---------- */}
          {on(t, S.night) || on(t, S.loop) ? (
            <g>
              <rect x={0} y={0} width={1080} height={1920} fill="#141a3a" />
              {[[120, 200], [300, 120], [520, 260], [880, 160], [700, 330], [960, 420]].map(([sx, sy], i) => (
                <rect key={i} x={sx} y={sy} width={10} height={10} fill="#ffffff" opacity={(f + i * 9) % 40 < 30 ? 0.9 : 0.4} />
              ))}
              <g transform={`translate(820 420) scale(${on(t, S.loop) ? 1 : moonGrow})`}>
                <rect x={-80} y={-80} width={160} height={160} rx={30} fill="#fff3c4" />
                <rect x={-40} y={-30} width={30} height={30} rx={6} fill="#e8dcaa" />
                <rect x={20} y={20} width={24} height={24} rx={6} fill="#e8dcaa" />
              </g>
              <House x={180} lit={0} z={1} f={f} />
              <House x={820} roof="#2a5a8a" wall="#c8d0d8" lit={0} z={1} f={f + 10} />
              <House x={500} w={260} h={300} roof="#5a2a6a" wall="#e0c8b0" lit={t >= 2.64 ? 1 : 0} z={t < 2.64 ? 1 : 0} f={f + 20} />
              <Ground color="#1e3a24" />
              {/* him, on the roof of the middle house, doing pushups */}
              {t >= 2.64 && on(t, S.night) ? (
                <g>
                  {t >= 4.4 ? (
                    <g transform={`translate(0 ${30 * pump})`}>
                      <rect x={330} y={GROUND - 690} width={340} height={14} fill="#9aa0aa" />
                      <rect x={316} y={GROUND - 720} width={34} height={74} rx={6} fill="#2a2a30" />
                      <rect x={650} y={GROUND - 720} width={34} height={74} rx={6} fill="#2a2a30" />
                    </g>
                  ) : null}
                  <Blox x={500} y={GROUND - 410} s={0.55} pose={t >= 4.4 ? 'lift' : 'stand'} pump={pump} f={f} />
                  <Puff t={t} x={500} y={GROUND - 640} />
                </g>
              ) : null}
            </g>
          ) : null}

          {/* ---------- 2. THE GIANT CHICKEN ---------- */}
          {on(t, S.chicken) ? (
            <g>
              <rect x={0} y={0} width={1080} height={1920} fill="#7ec8ff" />
              <rect x={120} y={260} width={180} height={60} rx={30} fill="#ffffff" />
              <rect x={640} y={180} width={240} height={70} rx={35} fill="#ffffff" />
              <House x={160} roof="#c0392b" wall="#f0e0c0" />
              <House x={920} roof="#2a7a5a" wall="#f0e8d8" />
              <Ground />
              {/* fleeing townsfolk */}
              {t < 11.3
                ? [0, 1, 2].map((i) => (
                    <Blox key={i} x={120 + i * 150 - 220 * prog(f, F(7.2), F(9.9))} y={GROUND} s={0.42} pose="flee" scared f={f + i * 7} head={['#f2c79a', '#a8714a', '#e0b080'][i]} shirt={['#3a7bd5', '#e6b422', '#8e44ad'][i]} band={false} />
                  ))
                : null}
              {lifted > 0.01 ? (
                <g>
                  <Chicken x={540} y={GROUND - 520 - 120 * lifted + 30 * pump} s={0.62} f={f} up={1} />
                  <Blox x={540} y={GROUND} s={0.85} pose="lift" pump={pump} f={f} />
                  <Puff t={t} x={560} y={GROUND - 400} />
                </g>
              ) : (
                <g>
                  <Chicken x={chickenX} y={GROUND} s={0.85} f={f} />
                  {t >= 9.86 ? <Blox x={300} y={GROUND} s={0.85} pose="stand" f={f} /> : null}
                </g>
              )}
            </g>
          ) : null}

          {/* ---------- 3. THE FLOOR IS LAVA (EVERY TUESDAY) ---------- */}
          {on(t, S.lava) ? (
            <g>
              <rect x={0} y={0} width={1080} height={1920} fill={lava > 0.5 ? '#ff9a5a' : '#7ec8ff'} />
              <House x={180} roof="#c0392b" wall="#f0e0c0" />
              <House x={900} roof="#2a7a5a" wall="#f0e8d8" />
              {/* townsfolk stuck on the roofs */}
              {lava > 0.5
                ? [180, 900].map((hx, i) => (
                    <Blox key={hx} x={hx} y={GROUND - 370} s={0.32} scared f={f} head={['#f2c79a', '#a8714a'][i]} shirt={['#3a7bd5', '#e6b422'][i]} band={false} />
                  ))
                : null}
              <Ground color={lava > 0.5 ? '#ff5a1a' : '#4caf50'} />
              {lava > 0.5
                ? Array.from({ length: 8 }, (_, i) => (
                    <rect key={i} x={((i * 151 + f * 3) % 1080)} y={GROUND + 30 + (i % 3) * 120} width={50} height={50} rx={14} fill="#ffd14a" opacity={0.6 + 0.4 * Math.sin(f * 0.3 + i)} />
                  ))
                : null}
              <text x={540} y={300} textAnchor="middle" fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={80} fill="#ffffff" stroke="#111" strokeWidth={8} paintOrder="stroke" opacity={prog(f, F(15.9), F(16.2))}>TUESDAY</text>
              {t >= 17.0 ? (
                <g>
                  {/* the door, surfed */}
                  <rect x={surfX - 150} y={GROUND - 30} width={300} height={40} rx={6} fill="#6a4a2a" />
                  <rect x={surfX + 110} y={GROUND - 22} width={14} height={14} fill="#ffd14a" />
                  <Blox x={surfX} y={GROUND - 30} s={0.75} pose="stand" pump={pump} f={f} />
                  <Puff t={t} x={surfX + 20} y={GROUND - 380} />
                </g>
              ) : null}
            </g>
          ) : null}

          {/* ---------- 4. THE MAYOR'S FACE ---------- */}
          {on(t, S.mayor) ? (
            <g>
              <rect x={0} y={0} width={1080} height={1920} fill="#6a2a3a" />
              {/* curtains */}
              <rect x={0} y={0} width={170} height={1920} fill="#a8203a" />
              <rect x={910} y={0} width={170} height={1920} fill="#a8203a" />
              <rect x={0} y={0} width={1080} height={120} fill="#c0284a" />
              <rect x={300} y={300} width={480} height={110} rx={10} fill="#f0e0c0" />
              <text x={540} y={378} textAnchor="middle" fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={64} fill="#6a2a3a">TOWN HALL</text>
              <Blox x={540} y={GROUND} s={0.95} pose="stand" pump={pump} f={f} mustache tophat shirt="#1e2430" band={false} />
              {/* the podium */}
              <rect x={380} y={GROUND - 300} width={320} height={300} fill="#5a3a24" />
              <rect x={360} y={GROUND - 320} width={360} height={30} fill="#7a5a3a" />
              <circle cx={540} cy={GROUND - 180} r={50} fill="#c9a24a" />
              {/* the newspaper hiding his face, dropping on "except me" */}
              <g transform={`translate(540 ${GROUND - 500 + 700 * paperDrop}) rotate(${40 * paperDrop})`} opacity={1 - paperDrop * 0.6}>
                <rect x={-170} y={-120} width={340} height={240} fill="#f4f1e8" stroke="#111" strokeWidth={4} />
                <rect x={-150} y={-100} width={300} height={40} fill="#111" />
                {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-150} y={-40 + i * 24} width={i % 2 ? 300 : 220} height={10} fill="#8a8a8a" />)}
              </g>
              <Ground color="#3a1a22" />
              {/* the townsfolk audience */}
              {[150, 300, 780, 930].map((ax, i) => (
                <Blox key={ax} x={ax} y={GROUND + 200} s={0.38} scared={paperDrop > 0.5} f={f} head={['#f2c79a', '#a8714a', '#e0b080', '#c88a5a'][i]} shirt={['#3a7bd5', '#e6b422', '#8e44ad', '#2a9a6a'][i]} band={false} />
              ))}
              <Puff t={t} x={560} y={GROUND - 410} />
              <text x={540} y={560} textAnchor="middle" fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={84} fill="#ffe14a" stroke="#111" strokeWidth={8} paintOrder="stroke" opacity={prog(f, F(23.7), F(24.0))}>IT WAS ME</text>
            </g>
          ) : null}

          {/* the HUSS pops */}
          <HussPop t={t} x={540} y={760} />
        </g>
      </svg>

      {/* title */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: titleOp }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, color: '#ffe14a', letterSpacing: 2, textShadow: '5px 5px 0 #111, -5px -5px 0 #111, 5px -5px 0 #111, -5px 5px 0 #111, 0 8px 0 #111' }}>IN THIS TOWN...</div>
      </div>

      <Captions lines={VO} y={1500} accent="#ffe14a" />
      <ProgressBar color="#ffe14a" />
    </AbsoluteFill>
  );
};

export default Blox1Pilot;
