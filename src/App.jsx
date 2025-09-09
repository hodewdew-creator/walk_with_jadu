import React, { useEffect, useRef, useState } from "react";

/**
 * 앱 이름: 산책하셨어요?
 * 엄마 전용 · 초복이 사진/멘트 + 오늘 동그란 메인 원 + 3~4층 블럭 달력(1층이 1~10일, 아래에서 위로 쌓임)
 */

const fmt = (d) => d.toISOString().slice(0, 10);
const STORE_KEY = "walklog-v6";

export default function App() {
  const [today] = useState(() => { const d = new Date(); d.setHours(0,0,0,0); return d; });
  const [goal, setGoal] = useState(8000);
  const [data, setData] = useState({});
  const [themeColor, setThemeColor] = useState("#38bdf8");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      if (saved) {
        setData(saved.data || {});
        setGoal(saved.goal || 8000);
        if (saved.themeColor) setThemeColor(saved.themeColor);
      }
    } catch (e) {}
  }, []);
  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ data, goal, themeColor }));
  }, [data, goal, themeColor]);

  const todayKey = fmt(today);
  const t = data[todayKey] || {};

  const messages = [
    "오늘도 힘차게 걸어봐요! 🐶",
    "초복이가 기다려요 💕",
    "엄마 최고예요!",
    "비 와도 마음은 맑음 ☔",
  ];
  const msg = useRef(messages[Math.floor(Math.random()*messages.length)]);

  function cycleDay(key) {
    const item = data[key] || {};
    const steps = item.steps || 0;
    if (item.excluded) { setData(p => ({ ...p, [key]: { excluded:false, steps:0 } })); return; }
    if (steps < goal) { setData(p => ({ ...p, [key]: { steps: goal } })); return; }
    if (steps < goal*2) { setData(p => ({ ...p, [key]: { steps: goal*2 } })); return; }
    setData(p => ({ ...p, [key]: { excluded:true } }));
  }

  const y = today.getFullYear();
  const m = today.getMonth();
  const daysInMonth = new Date(y, m+1, 0).getDate();
  const rows = [
    Array.from({length:10}, (_,i)=> i+1),
    Array.from({length:10}, (_,i)=> i+11),
    Array.from({length:10}, (_,i)=> i+21),
  ];
  const has31 = daysInMonth === 31;

  return (
    <div className="min-h-screen" style={{ background: themeColor+"10" }}>
      <div className="max-w-sm mx-auto p-5 pb-24 flex flex-col items-center relative">
        {/* 팔레트 버튼 */}
        <label className="absolute top-3 right-3 cursor-pointer" title="테마 색 변경">
          🎨
          <input type="color" value={themeColor} onChange={(e)=>setThemeColor(e.target.value)} className="opacity-0 w-0 h-0" />
        </label>

        {/* 상단: 초복이 사진 + 멘트 */}
        <div className="mb-4 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center text-6xl mb-2">
            🐶
          </div>
          <div className="text-slate-700 font-semibold text-center">{msg.current}</div>
        </div>

        {/* 메인 원 */}
        <div className="relative w-64 h-64 rounded-full bg-white shadow-md flex flex-col items-center justify-center mb-6" style={{ border:`6px solid ${themeColor}` }}>
          <div className="text-5xl font-extrabold text-slate-800">
            {typeof t.steps === 'number' ? t.steps.toLocaleString() : 0}
          </div>
          <div className="text-slate-500 text-sm mt-1">걸음수</div>
          <div className="absolute bottom-4 text-slate-400 text-xs">층수: {t.floors || 0}</div>
        </div>

        {/* 달력 */}
        <section className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-3">
          <div className="flex flex-col-reverse gap-1">
            {rows.map((arr, idx) => (
              <div key={idx} className="grid grid-cols-10 gap-1">
                {arr.map((n) => (
                  <BlockCell key={n} y={y} m={m} n={n} data={data} goal={goal} onClick={cycleDay} themeColor={themeColor} />
                ))}
              </div>
            ))}
          </div>
          {has31 && (
            <div className="flex justify-center mt-2">
              <Circle31 y={y} m={m} data={data} goal={goal} onClick={cycleDay} themeColor={themeColor} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function BlockCell({ y, m, n, data, goal, onClick, themeColor }){
  const date = new Date(y, m, n);
  const key = fmt(date);
  const item = data[key] || {};
  const color = dayClass(item, goal, themeColor);

  const showPaw = item.steps >= goal && !item.excluded;
  const isDouble = item.steps >= goal*2 && !item.excluded;
  const pawSize = isDouble ? 22 : 18; // 2배 달성은 더 큰 하나의 발바닥

  return (
    <div onClick={() => onClick(key)} className="h-8 rounded flex items-center justify-center text-[12px] select-none" style={{ backgroundColor: color, color: "white" }}>
      {showPaw ? (
        <PawIcon color="#ffffff" size={pawSize} />
      ) : n}
      {item.rain && "💧"}{item.excluded && "🚫"}
    </div>
  );
}

function Circle31({ y, m, data, goal, onClick, themeColor }){
  const date = new Date(y, m, 31);
  const key = fmt(date);
  const item = data[key] || {};
  const color = dayClass(item, goal, themeColor);

  const showPaw = item.steps >= goal && !item.excluded;
  const isDouble = item.steps >= goal*2 && !item.excluded;
  const pawSize = isDouble ? 22 : 18; // 2배 달성은 더 큰 하나의 발바닥

  return (
    <div onClick={() => onClick(key)} className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] select-none" style={{ backgroundColor: color, color: "white" }}>
      {showPaw ? (
        <PawIcon color="#ffffff" size={pawSize} />
      ) : "31"}
      {item.rain && "💧"}{item.excluded && "🚫"}
    </div>
  );
}

function dayClass(item, goal, themeColor){
  if (!item) return "#e2e8f0"; // 밝은 회색
  if (item.excluded) return "#fbbf24"; // 제외
  const s = item.steps || 0;
  if (s >= goal*2) return darkenHex(themeColor, 0.7); // 더 진한 테마색
  if (s >= goal) return themeColor; // 테마색
  return "#cbd5e1";
}

// 색상 유틸: HEX를 조금 더 어둡게
function darkenHex(hex, factor = 0.8){
  try{
    let h = hex.replace('#','');
    if (h.length === 3) h = h.split('').map(c=>c+c).join('');
    const r = Math.round(parseInt(h.slice(0,2),16)*factor);
    const g = Math.round(parseInt(h.slice(2,4),16)*factor);
    const b = Math.round(parseInt(h.slice(4,6),16)*factor);
    const to2 = (n)=> n.toString(16).padStart(2,'0');
    return `#${to2(r)}${to2(g)}${to2(b)}`;
  } catch(e){
    return hex; // 안전하게 원본 반환
  }
}

function PawIcon({ color = "#ffffff", size = 14 }){
  const stroke = "#ffffff";
  const sw = 1.2;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="3" fill={color} stroke={stroke} strokeWidth={sw} />
      <circle cx="17" cy="7" r="3" fill={color} stroke={stroke} strokeWidth={sw} />
      <circle cx="4" cy="12" r="3" fill={color} stroke={stroke} strokeWidth={sw} />
      <circle cx="20" cy="12" r="3" fill={color} stroke={stroke} strokeWidth={sw} />
      <path d="M7 18c0-3 3-5 5-5s5 2 5 5c0 2-2 4-5 4s-5-2-5-4z" fill={color} stroke={stroke} strokeWidth={sw} />
    </svg>
  );
}

export default App;
