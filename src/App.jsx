import React, { useEffect, useRef, useState } from "react";

/**
 * 파일: src/App.jsx
 * 앱 이름: 산책하셨어요?
 * 목적: 오늘 걸음수(큰 원) + 3층 블럭 달력(1~10 / 11~20 / 21~30, 31일 원형)
 *
 * 이번 보완 포인트 (테스트 입력 지원)
 * - 메인 원 우상단 ✏️ 버튼 → "테스트용 수동 입력" 패널 열기
 * - 오늘 걸음수/층수를 직접 입력하고 저장 (localStorage 반영)
 * - 발바닥(달성/2배)은 여전히 "steps 값"으로만 표시, 사용자가 블럭 탭/롱탭으로는 변경 불가
 * - 회색(미달)일 때만 더블탭으로 "비(💧+X)" 토글, 달성일 롱탭 제외(🚫) 잠금 유지
 */

const fmt = (d) => d.toISOString().slice(0, 10);
const STORE_KEY = "walklog-v6";

export default function WalkTrackerApp() {
  const [today] = useState(() => { const d = new Date(); d.setHours(0,0,0,0); return d; });
  const [goal, setGoal] = useState(8000);
  const [data, setData] = useState({});
  const [themeColor, setThemeColor] = useState("#38bdf8");

  // ▶ 테스트용 수동 입력 패널 상태
  const [editOpen, setEditOpen] = useState(false);
  const [tmpSteps, setTmpSteps] = useState("");
  const [tmpFloors, setTmpFloors] = useState("");

  // 로드
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
  // 저장
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

  // 미달 ↔ 비 토글(미달일 때만 허용)
  function toggleRainIfGrey(key){
    setData((p)=>{
      const it = p[key] || {};
      const grey = !it.excluded && ((it.steps||0) < goal);
      if (!grey) return p; // 달성/2배/제외 상태에선 무시
      return { ...p, [key]: { ...it, rain: !it.rain } };
    });
  }

  // 제외 토글(달성 상태에선 동작 금지)
  function toggleExcludedSafe(key){
    setData((p)=>{
      const it = p[key] || {};
      const achieved = !it.excluded && (it.steps||0) >= goal;
      if (achieved) return p; // 발바닥 찍힌 날은 제외 토글 불가
      const next = !it.excluded;
      return { ...p, [key]: { ...it, excluded: next } };
    });
  }

  // ▶ 테스트용 수동 입력 열기/저장
  function openEditor(){
    setTmpSteps(String(t.steps ?? 0));
    setTmpFloors(String(t.floors ?? 0));
    setEditOpen(true);
  }
  function saveEditor(){
    const s = Math.max(0, parseInt(tmpSteps || "0", 10) || 0);
    const f = Math.max(0, parseInt(tmpFloors || "0", 10) || 0);
    setData(p => ({ ...p, [todayKey]: { ...(p[todayKey]||{}), steps: s, floors: f } }));
    setEditOpen(false);
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
      <div className="max-w-sm mx-auto p-5 pb-28 flex flex-col items-center relative">
        {/* 팔레트 버튼 */}
        <label className="absolute top-3 right-3 cursor-pointer" title="테마 색 변경">
          🎨
          <input type="color" value={themeColor} onChange={(e)=>setThemeColor(e.target.value)} className="opacity-0 w-0 h-0" />
        </label>

        {/* 상단: 초복이 사진 + 멘트 */}
        <div className="mb-4 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center text-6xl mb-2" aria-label="초복이">
            🐶
          </div>
          <div className="text-slate-700 font-semibold text-center">{msg.current}</div>
        </div>

        {/* 메인 원 */}
        <div className="relative w-64 h-64 rounded-full bg-white shadow-md flex flex-col items-center justify-center mb-3" style={{ border:`6px solid ${themeColor}` }}>
          {/* ✏️ 테스트 입력 버튼 */}
          <button
            onClick={openEditor}
            className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300"
            title="테스트용 수동 입력"
            aria-label="테스트용 수동 입력"
          >✏️</button>

          <div className="text-5xl font-extrabold text-slate-800">
            {typeof t.steps === 'number' ? t.steps.toLocaleString() : 0}
          </div>
          <div className="text-slate-500 text-sm mt-1">걸음수</div>
          <div className="absolute bottom-4 text-slate-400 text-xs">층수: {t.floors || 0}</div>
        </div>

        {/* ▶ 테스트용 수동 입력 패널 */}
        {editOpen && (
          <div className="w-full mb-4 p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="text-[11px] text-slate-500 mb-2">테스트용 수동 입력 (오늘)</div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-700">
                걸음수
                <input type="number" inputMode="numeric" className="mt-1 w-full px-2 py-1 border rounded"
                  value={tmpSteps} onChange={(e)=>setTmpSteps(e.target.value)} />
              </label>
              <label className="text-sm text-slate-700">
                층수
                <input type="number" inputMode="numeric" className="mt-1 w-full px-2 py-1 border rounded"
                  value={tmpFloors} onChange={(e)=>setTmpFloors(e.target.value)} />
              </label>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {/* 퀵 설정 버튼들 */}
              {[0, 5000, 8000, 16000].map(v => (
                <button key={v} onClick={()=>setTmpSteps(String(v))} className="px-2 py-1 text-xs rounded border bg-slate-50 hover:bg-slate-100">{v.toLocaleString()}보</button>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={()=>setEditOpen(false)} className="px-3 py-1 text-sm rounded border">취소</button>
              <button onClick={saveEditor} className="px-3 py-1 text-sm rounded text-white" style={{ background: themeColor }}>저장</button>
            </div>
          </div>
        )}

        {/* 달력 */}
        <section className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-3">
          <div className="flex flex-col-reverse gap-1">
            {rows.map((arr, idx) => (
              <div key={idx} className="grid grid-cols-10 gap-1">
                {arr.map((n) => (
                  <BlockCell
                    key={n}
                    y={y}
                    m={m}
                    n={n}
                    data={data}
                    goal={goal}
                    themeColor={themeColor}
                    onToggleRainIfGrey={toggleRainIfGrey}
                    onToggleExcluded={toggleExcludedSafe}
                  />
                ))}
              </div>
            ))}
          </div>
          {has31 && (
            <div className="flex justify-center mt-2">
              <Circle31
                y={y}
                m={m}
                data={data}
                goal={goal}
                themeColor={themeColor}
                onToggleRainIfGrey={toggleRainIfGrey}
                onToggleExcluded={toggleExcludedSafe}
              />
            </div>
          )}

          {/* 범례 */}
          <Legend themeColor={themeColor} />
        </section>
      </div>
    </div>
  );
}

/** 개별 날짜 블럭 (1~30일) */
function BlockCell({ y, m, n, data, goal, themeColor, onToggleRainIfGrey, onToggleExcluded }){
  const date = new Date(y, m, n);
  const key = fmt(date);
  const item = data[key] || {};
  const color = dayClass(item, goal, themeColor);

  const achieved = !item.excluded && (item.steps||0) >= goal;
  const isDouble = !item.excluded && (item.steps||0) >= goal*2;
  const isGrey = !item.excluded && (item.steps||0) < goal;
  const pawSize = isDouble ? 22 : 18; // 2배 달성 = 더 큰 발바닥 1개

  // 제스처: 달성일은 모든 상호작용 비활성화(사용자 임의 변경 방지)
  const longRef = useRef(false);
  const timerRef = useRef(null);
  const down = () => {
    if (achieved) return; // 발바닥 찍힌 날은 롱탭 무시
    longRef.current = false;
    timerRef.current = setTimeout(() => { longRef.current = true; onToggleExcluded(key); }, 500);
  };
  const up = () => { if (timerRef.current) clearTimeout(timerRef.current); };
  const click = () => { /* 클릭으로 상태 변경 불가 (실시간만) */ };
  const dbl = () => { if (isGrey) onToggleRainIfGrey(key); };

  const label = `${key} · ${item.excluded? '제외' : (isDouble? '2배 달성' : (achieved? '달성' : '미달'))}${(isGrey && item.rain)? ' · 비' : ''}`;

  return (
    <div
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onClick={click}
      onDoubleClick={dbl}
      className="relative h-8 rounded flex items-center justify-center text-[12px] select-none"
      style={{ backgroundColor: color, color: "white" }}
      title={label}
      aria-label={label}
    >
      {achieved ? <PawIcon color="#ffffff" size={pawSize} /> : n}
      {/* 비 아이콘: 회색 상태에서만 표시 */}
      {isGrey && item.rain && (
        <div className="absolute top-0.5 right-0.5" title="비로 인해 산책 못함">
          <RainCancelIcon />
        </div>
      )}
      {item.excluded && "🚫"}
    </div>
  );
}

/** 31일 원형 블럭 */
function Circle31({ y, m, data, goal, themeColor, onToggleRainIfGrey, onToggleExcluded }){
  const date = new Date(y, m, 31);
  const key = fmt(date);
  const item = data[key] || {};
  const color = dayClass(item, goal, themeColor);

  const achieved = !item.excluded && (item.steps||0) >= goal;
  const isDouble = !item.excluded && (item.steps||0) >= goal*2;
  const isGrey = !item.excluded && (item.steps||0) < goal;
  const pawSize = isDouble ? 22 : 18;

  const longRef = useRef(false);
  const timerRef = useRef(null);
  const down = () => {
    if (achieved) return;
    longRef.current = false;
    timerRef.current = setTimeout(() => { longRef.current = true; onToggleExcluded(key); }, 500);
  };
  const up = () => { if (timerRef.current) clearTimeout(timerRef.current); };
  const click = () => {};
  const dbl = () => { if (isGrey) onToggleRainIfGrey(key); };

  const label = `${key} · ${item.excluded? '제외' : (isDouble? '2배 달성' : (achieved? '달성' : '미달'))}${(isGrey && item.rain)? ' · 비' : ''}`;

  return (
    <div
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onClick={click}
      onDoubleClick={dbl}
      className="relative w-8 h-8 rounded-full flex items-center justify-center text-[12px] select-none"
      style={{ backgroundColor: color, color: "white" }}
      title={label}
      aria-label={label}
    >
      {achieved ? <PawIcon color="#ffffff" size={pawSize} /> : "31"}
      { isGrey && item.rain && (
        <div className="absolute top-0.5 right-0.5" title="비로 인해 산책 못함">
          <RainCancelIcon />
        </div>
      )}
      {item.excluded && "🚫"}
    </div>
  );
}

/** 상태 → 블럭 배경색 (테마색/진한테마/밝은회색/주황) */
function dayClass(item, goal, themeColor){
  if (!item) return "#e2e8f0";          // 미입력: 아주 밝은 회색
  if (item.excluded) return "#fbbf24";   // 제외: 주황
  const s = item.steps || 0;
  if (s >= goal*2) return darkenHex(themeColor, 0.7); // 2배: 테마색 진하게
  if (s >= goal)   return themeColor;                 // 달성: 테마색
  return "#cbd5e1";                                   // 미달: 밝은 회색
}

/** HEX 색을 조금 더 어둡게 (factor 0~1, 작을수록 더 어둡게) */
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
    return hex;
  }
}

/** 흰색 발바닥 아이콘 (SVG) */
function PawIcon({ color = "#ffffff", size = 14 }){
  const stroke = "#ffffff";
  const sw = 1.2;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 발가락 4개 */}
      <circle cx="7" cy="7" r="3" fill={color} stroke={stroke} strokeWidth={sw} />
      <circle cx="17" cy="7" r="3" fill={color} stroke={stroke} strokeWidth={sw} />
      <circle cx="4" cy="12" r="3" fill={color} stroke={stroke} strokeWidth={sw} />
      <circle cx="20" cy="12" r="3" fill={color} stroke={stroke} strokeWidth={sw} />
      {/* 패드 */}
      <path d="M7 18c0-3 3-5 5-5s5 2 5 5c0 2-2 4-5 4s-5-2-5-4z" fill={color} stroke={stroke} strokeWidth={sw} />
    </svg>
  );
}

/** 비 취소 아이콘(💧+X 느낌, 파란 계열) */
function RainCancelIcon(){
  const blue = "#3b82f6"; // tailwind blue-600 느낌
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      {/* 물방울 */}
      <path d="M12 2 C9 6,6 9,6 13 a6 6 0 0 0 12 0 c0-4-3-7-6-11z" fill={blue} />
      {/* X 표시 */}
      <path d="M9 13 l6 6 M15 13 l-6 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/** 범례(legend) 섹션 */
function Legend({ themeColor }){
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
      <LegendItem color="#cbd5e1" label="미달"/>
      <LegendItem color={themeColor} label="달성(≥8000)" icon/>
      <LegendItem color={darkenHex(themeColor, 0.7)} label="2배 달성(≥16000)" iconBig/>
      <LegendItem color="#fbbf24" label="제외(산책 아님)" note="길게 누르기"/>
      <div className="col-span-2 flex items-center justify-end gap-1">
        <RainCancelIcon />
        <span>비(미달일만 표시, 더블탭)</span>
      </div>
    </div>
  );
}
function LegendItem({ color, label, icon=false, iconBig=false, note }){
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-4 rounded" style={{ backgroundColor: color }} />
      {icon && <PawIcon size={14} />}
      {iconBig && <PawIcon size={18} />}
      <span>{label}{note?` · ${note}`:''}</span>
    </div>
  );
}
