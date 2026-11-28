import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FONT_BODY, FONT_DISPLAY, FONT_EDITORIAL, FONT_MONO } from '../../fonts';

// =============================================================================
// STYLE SAMPLES — one scene ("someone is at the door at night") in four code-drawn styles.
// frames 0–29 pixel art · 30–59 comic · 60–89 woodcut · 90–119 text-message horror
// =============================================================================
export const compositionConfig = {
  id: 'StyleSamples',
  durationInSeconds: 4,
  fps: 30,
  width: 1080,
  height: 1920,
};

// ---------- 1. PIXEL ART (16-bit) -------------------------------------------
const P = 20; // px per pixel -> 54 x 96 grid
const px = (x: number, y: number, w: number, h: number, c: string, k?: string) => (
  <rect key={k ?? `${x}-${y}-${c}`} x={x * P} y={y * P} width={w * P} height={h * P} fill={c} />
);
const Pixel: React.FC<{ f: number }> = ({ f }) => {
  const r: React.ReactNode[] = [];
  const sky = ['#120a2a', '#1c1040', '#2a1658', '#3a1e6a'];
  for (let y = 0; y < 60; y++) {
    const band = Math.min(3, Math.floor(y / 15));
    for (let x = 0; x < 54; x++) {
      const c = (x + y) % 2 === 0 && y % 15 > 12 ? sky[Math.min(3, band + 1)] : sky[band];
      r.push(px(x, y, 1, 1, c, `s${x}-${y}`));
    }
  }
  // stars
  [[5, 6], [12, 3], [20, 9], [33, 4], [47, 7], [40, 14], [8, 18]].forEach(([x, y], i) => r.push(px(x, y, 1, 1, (f + i * 7) % 20 < 14 ? '#ffffff' : '#9a8acb', `st${i}`)));
  // moon
  for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) if ((x - 3) ** 2 + (y - 3) ** 2 <= 10) r.push(px(40 + x, 10 + y, 1, 1, (x + y) % 4 === 0 ? '#e8dfb0' : '#fff3c4', `m${x}-${y}`));
  // ground
  r.push(px(0, 60, 54, 36, '#0e1a12', 'g'));
  for (let x = 0; x < 54; x += 2) r.push(px(x, 60, 1, 1, '#1e3a24', `gg${x}`));
  // house
  r.push(px(8, 38, 26, 22, '#3a2a3e', 'h'));
  for (let i = 0; i < 14; i++) r.push(px(6 + i, 38 - i, 30 - 2 * i, 1, '#5a1e2a', `roof${i}`));
  r.push(px(12, 44, 6, 6, (f % 30) < 26 ? '#ffd36a' : '#e0a83a', 'win'));
  r.push(px(14, 44, 1, 6, '#3a2a3e', 'wf1'));
  r.push(px(12, 46, 6, 1, '#3a2a3e', 'wf2'));
  r.push(px(23, 48, 7, 12, '#1a1018', 'door'));
  r.push(px(28, 54, 1, 1, '#ffd36a', 'knob'));
  // the figure at the door
  const bob = f % 20 < 10 ? 0 : 1;
  r.push(px(32, 47 + bob, 4, 4, '#d8e4ee', 'head'));
  r.push(px(33, 48 + bob, 1, 1, '#ff2a2a', 'eye1'));
  r.push(px(35, 48 + bob, 1, 1, '#ff2a2a', 'eye2'));
  r.push(px(31, 51 + bob, 6, 9 - bob, '#b8c4ce', 'body'));
  r.push(px(29, 52 + bob, 2, 1, '#b8c4ce', 'arm'));
  // dialog box (RPG style)
  r.push(px(3, 70, 48, 16, '#0a0a18', 'db'));
  r.push(px(3, 70, 48, 1, '#ffffff', 'db1'));
  r.push(px(3, 85, 48, 1, '#ffffff', 'db2'));
  r.push(px(3, 70, 1, 16, '#ffffff', 'db3'));
  r.push(px(50, 70, 1, 16, '#ffffff', 'db4'));
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <svg width={1080} height={1920} shapeRendering="crispEdges">{r}</svg>
      <div style={{ position: 'absolute', left: 110, right: 110, top: 1440, fontFamily: FONT_MONO, fontWeight: 700, fontSize: 46, color: '#ffffff', lineHeight: 1.35 }}>
        &gt; SOMEONE IS KNOCKING.<br />&gt; OPEN THE DOOR? <span style={{ color: '#ffd36a' }}>▶ YES</span>  NO
      </div>
      <Tag text="PIXEL ART · 16-BIT" />
    </AbsoluteFill>
  );
};

// ---------- 2. COMIC / GRAPHIC NOVEL -----------------------------------------
const Comic: React.FC<{ f: number }> = ({ f }) => {
  const shake = Math.sin(f * 2) * 4;
  return (
    <AbsoluteFill style={{ background: '#f3ead2' }}>
      <svg width={1080} height={1920}>
        <defs>
          <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="9" cy="9" r="4" fill="#1a2a5a" opacity="0.55" />
          </pattern>
          <pattern id="dotsRed" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="8" cy="8" r="4.5" fill="#c0182f" opacity="0.6" />
          </pattern>
        </defs>
        {/* panel 1: house at night */}
        <rect x={40} y={140} width={1000} height={700} fill="#243a7a" stroke="#111" strokeWidth={10} />
        <rect x={40} y={140} width={1000} height={700} fill="url(#dots)" />
        <circle cx={860} cy={300} r={80} fill="#fff6c8" stroke="#111" strokeWidth={8} />
        <path d="M 160 840 L 160 520 L 420 360 L 680 520 L 680 840 Z" fill="#2a1a2a" stroke="#111" strokeWidth={10} />
        <rect x={220} y={580} width={120} height={110} fill="#ffd36a" stroke="#111" strokeWidth={8} />
        <rect x={460} y={640} width={130} height={200} fill="#140c10" stroke="#111" strokeWidth={8} />
        {/* the figure */}
        <path d="M 720 840 L 740 640 Q 760 590 800 590 Q 840 590 856 640 L 876 840 Z" fill="#111" />
        <circle cx={798} cy={565} r={42} fill="#111" />
        {/* KNOCK burst */}
        <g transform={`translate(${720 + shake} 300) rotate(-8)`}>
          <path d="M 0 -120 L 40 -50 L 120 -80 L 80 -10 L 150 30 L 70 50 L 90 130 L 20 80 L -40 140 L -40 60 L -130 70 L -70 0 L -130 -60 L -40 -50 Z" fill="#ffd400" stroke="#111" strokeWidth={8} />
          <text x={10} y={20} textAnchor="middle" fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={64} fill="#c0182f" stroke="#111" strokeWidth={3}>KNOCK</text>
        </g>
        {/* panel 2: eye at the peephole */}
        <rect x={40} y={880} width={480} height={460} fill="#f3ead2" stroke="#111" strokeWidth={10} />
        <rect x={40} y={880} width={480} height={460} fill="url(#dotsRed)" />
        <ellipse cx={280} cy={1110} rx={170} ry={100} fill="#fff" stroke="#111" strokeWidth={10} />
        <circle cx={280} cy={1110} r={64} fill="#3a6a9a" stroke="#111" strokeWidth={8} />
        <circle cx={280} cy={1110} r={30} fill="#111" />
        {/* panel 3: speech */}
        <rect x={560} y={880} width={480} height={460} fill="#1a1a1a" stroke="#111" strokeWidth={10} />
        <path d="M 600 940 L 1000 940 L 1000 1160 L 760 1160 L 700 1240 L 720 1160 L 600 1160 Z" fill="#fff" stroke="#111" strokeWidth={8} />
        <text x={800} y={1040} textAnchor="middle" fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={54} fill="#111">WHO'S</text>
        <text x={800} y={1110} textAnchor="middle" fontFamily={FONT_DISPLAY} fontWeight={700} fontSize={54} fill="#111">THERE?</text>
      </svg>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 1400, padding: '24px 30px', background: '#ffe98a', border: '8px solid #111', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 46, color: '#111' }}>
        3:07 A.M. NOBODY ELSE WAS AWAKE.
      </div>
      <Tag text="COMIC · HALFTONE PANELS" />
    </AbsoluteFill>
  );
};

// ---------- 3. WOODCUT / ENGRAVING (old storybook print) ---------------------
const Woodcut: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: '#e9dcc0' }}>
    <svg width={1080} height={1920}>
      <defs>
        <pattern id="hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="12" stroke="#2a1a10" strokeWidth="4" />
        </pattern>
        <pattern id="hatch2" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)">
          <line x1="0" y1="0" x2="0" y2="10" stroke="#2a1a10" strokeWidth="3" />
        </pattern>
      </defs>
      {/* ornate frame */}
      <rect x={60} y={150} width={960} height={1180} fill="none" stroke="#2a1a10" strokeWidth={12} />
      <rect x={84} y={174} width={912} height={1132} fill="none" stroke="#2a1a10" strokeWidth={4} />
      {/* sky hatching */}
      <rect x={84} y={174} width={912} height={600} fill="url(#hatch)" opacity={0.55} />
      <rect x={84} y={174} width={912} height={300} fill="url(#hatch2)" opacity={0.45} />
      {/* moon carved out */}
      <circle cx={800} cy={360} r={100} fill="#e9dcc0" stroke="#2a1a10" strokeWidth={6} />
      {Array.from({ length: 10 }, (_, i) => (
        <line key={i} x1={800 + 120 * Math.cos(i * 0.63)} y1={360 + 120 * Math.sin(i * 0.63)} x2={800 + 170 * Math.cos(i * 0.63)} y2={360 + 170 * Math.sin(i * 0.63)} stroke="#2a1a10" strokeWidth={5} />
      ))}
      {/* house: solid black with carved highlights */}
      <path d="M 160 1300 L 160 820 L 430 640 L 700 820 L 700 1300 Z" fill="#1e120a" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={180} y1={860 + i * 36} x2={300} y2={860 + i * 36} stroke="#e9dcc0" strokeWidth={3} />)}
      <rect x={240} y={900} width={130} height={130} fill="#e9dcc0" />
      <line x1={305} y1={900} x2={305} y2={1030} stroke="#1e120a" strokeWidth={10} />
      <line x1={240} y1={965} x2={370} y2={965} stroke="#1e120a" strokeWidth={10} />
      <rect x={470} y={1060} width={140} height={240} fill="#e9dcc0" stroke="#1e120a" strokeWidth={8} />
      <rect x={470} y={1060} width={140} height={240} fill="url(#hatch)" />
      {/* figure */}
      <path d="M 760 1300 L 780 1060 Q 800 1010 840 1010 Q 880 1010 896 1060 L 916 1300 Z" fill="#1e120a" />
      <circle cx={838} cy={985} r={40} fill="#1e120a" />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={790 + i * 20} y1={1080} x2={780 + i * 22} y2={1290} stroke="#e9dcc0" strokeWidth={2} />)}
      {/* ground */}
      <rect x={84} y={1300} width={912} height={6} fill="#1e120a" />
    </svg>
    <div style={{ position: 'absolute', left: 80, right: 80, top: 1380, textAlign: 'center', fontFamily: FONT_EDITORIAL, fontWeight: 900, fontSize: 54, color: '#2a1a10', letterSpacing: 2 }}>
      ❦ The Third Knock ❦
    </div>
    <div style={{ position: 'absolute', left: 120, right: 120, top: 1460, textAlign: 'center', fontFamily: FONT_EDITORIAL, fontStyle: 'italic', fontSize: 40, color: '#2a1a10' }}>
      “And though the hour was late, still it knocked.”
    </div>
    <Tag text="WOODCUT · STORYBOOK ENGRAVING" dark />
  </AbsoluteFill>
);

// ---------- 4. TEXT-MESSAGE HORROR --------------------------------------------
const Texts: React.FC<{ f: number }> = ({ f }) => {
  const msgs: { me: boolean; t: string }[] = [
    { me: false, t: 'are you home?' },
    { me: true, t: 'yeah why' },
    { me: false, t: "i'm outside your door" },
    { me: true, t: "what?? i'm not expecting anyone" },
    { me: false, t: "i know. that's why i'm knocking" },
  ];
  return (
    <AbsoluteFill style={{ background: '#05060a' }}>
      <div style={{ position: 'absolute', left: 120, right: 120, top: 150, bottom: 380, borderRadius: 70, border: '12px solid #23262e', background: '#0d0f14', overflow: 'hidden' }}>
        <div style={{ padding: '40px 30px 20px', borderBottom: '2px solid #1c1f26', textAlign: 'center' }}>
          <div style={{ width: 90, height: 90, borderRadius: 45, background: '#2a2d36', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_DISPLAY, fontSize: 44, color: '#8b96a5' }}>?</div>
          <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 34, color: '#e6e9ee', marginTop: 10 }}>Unknown Number</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 24, color: '#6b7280' }}>Today 3:07 AM</div>
        </div>
        <div style={{ padding: 30, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: '78%', padding: '18px 26px', borderRadius: 34, background: m.me ? '#2f7cf6' : '#262a33', color: '#fff', fontFamily: FONT_BODY, fontSize: 38, lineHeight: 1.25 }}>
              {m.t}
            </div>
          ))}
          <div style={{ alignSelf: 'flex-start', padding: '18px 26px', borderRadius: 34, background: '#262a33', display: 'flex', gap: 10 }}>
            {[0, 1, 2].map((k) => (
              <div key={k} style={{ width: 16, height: 16, borderRadius: 8, background: '#8b96a5', opacity: (f + k * 5) % 15 < 8 ? 1 : 0.35 }} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1580, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 58, color: '#ff4a5a' }}>*knock knock knock*</div>
      <Tag text="TEXT-MESSAGE HORROR" />
    </AbsoluteFill>
  );
};

const Tag: React.FC<{ text: string; dark?: boolean }> = ({ text, dark }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 50, textAlign: 'center' }}>
    <span style={{ padding: '12px 26px', borderRadius: 30, background: dark ? '#2a1a10' : '#ffffff', color: dark ? '#e9dcc0' : '#111', fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, letterSpacing: 3 }}>{text}</span>
  </div>
);

const StyleSamples: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 30) return <Pixel f={f} />;
  if (f < 60) return <Comic f={f} />;
  if (f < 90) return <Woodcut f={f} />;
  return <Texts f={f} />;
};

export default StyleSamples;
