import React, { useEffect, useRef, useState } from "react";

/** 파일: src/App.jsx — 오늘 걸음 원 + 월간 3~4층 블럭(31일은 4층, 21 위) + 테스트 입력 + 광고 */

// 로컬 날짜 키(UTC 오프셋 이슈 방지)
const fmt = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const STORE_KEY = "walklog-v9"; // v8→v9

// (추후 교체) 초복이 사진 세트 매핑 (빈 문자열은 이모지로 대체 렌더)
const dogImages = {
  verylow: "", // 0~2000 또는 제외
  low: "",     // 2001~6000
  mid: "",     // 6001~10000
  high: "",    // 10000+
};

export default function WalkTrackerApp() {
  const [today] = useState(() => { const d = new Date(); d.setHours(0,0,0,0); return d; });
  const [viewDate, setViewDate] = useState(() => { const d = new Date(); d.setHours(0,0,0,0); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [data, setData] = useState({});
  const [themeColor, setThemeColor] = useState("#38bdf8");

  // 테스트 입력 패널
  const [editOpen, setEditOpen] = useState(false);
  const [tmpDate, setTmpDate] = useState("");
  const [tmpSteps, setTmpSteps] = useState("");
  const [tmpFloors, setTmpFloors] = useState("");

  // 멘트 100개 + 1분마다 갱신(ON)
  const autoRotateMsg = true;
  const messages = [
    "오늘도 힘차게 걸어봐요! 🐶","초복이가 기다려요 💕","엄마 최고예요!","비 와도 마음은 맑음 ☔","작은 걸음이 큰 건강!","한 블럭 채워볼까요?","걷다 보면 기분 좋아져요","초복이 응원 중 🐾","바람 쐬러 가요 🌿","천천히 꾸준히 ✨","8천 보 도전!","발자국 도장 찍기!","구름도 산책 중 ☁️","작심삼일? 우린 작심매일!","햇살 맛집으로 ☀️","오늘 길은 어디로?","발걸음만큼 가벼운 마음","산책은 최고의 취미","작은 산책, 큰 행복","초복이랑 같이 가요","오늘도 건강 루틴","발끝부터 건강하게","한 바퀴만 돌아볼까요","마음도 스트레칭","물 많이 마시기 💧","하늘이 예쁜 날","발걸음에 박수 짝짝","걷기 명상 타임","공원까지 슝~","오늘도 완주!","숨이 탁 트여요","길냥이에게 인사","바람이 상쾌해요","발자국 톡톡","초복이 산책 레디!","한 걸음 더!","오늘도 나이스 페이스","리듬 타고 걷기","좋아하는 노래와 함께","꽃 냄새 맡아요 🌸","새소리 들려요?","발목 스트레칭 잊지말기","수고했어요 나 자신","어제보다 한 걸음","비 오면 우산 산책 ☔","시장 구경 산책","계단은 천천히","10분만 걸어도 좋아","관절이 좋아해요","목표는 도장 하나!","딱 5분만 나갔다 오자","집앞 한 바퀴 OK","심호흡 한 번","오 솔레 미오~","초복이 눈빛 레이저✨","응원 뿜뿜","비타민 D 충전","밤하늘 별 보기","노을이 예뻐요","비 온 뒤 공기 최고","끈 꽉 묶고 출발!","물병 챙겼나요?","모자 쓰고 나가요 🧢","가볍게 스트레칭","허리 쭉 펴요","힙! 업!","오늘도 칭찬 한 스푼","천천히도 충분해요","기분이 콩닥콩닥","발걸음이 노래해","포근한 바람","초복이의 응원 포효!","도시의 산책자","골목 탐험 가자","새로운 길 발견!","사진도 한 장 찰칵","안전 산책 약속","횡단보도 조심","따뜻한 차 한 잔 ☕","걷고 나면 개운해","오늘도 반짝반짝 ✨","작은 성취 모으기","스니커즈가 미소를","좋아하는 카페까지","햇살 따라 걷기","풀 냄새 맡아요","구름 그림자 밟기","하늘색 예술이네","가로수 하이파이브","오늘은 음악 산책","발끝에 힘!","몸이 가벼워져요","한숨 대신 산책","고양이처럼 유연하게","여유 한 스푼","바닥은 미끄럼 주의","마음에도 산책","창밖 보기 말고 나가요","오늘도 건강 적금","내일의 나에게 선물","초복이가 좋아해요","우리 오늘도 파이팅!"
  ];
  const [msgIndex, setMsgIndex] = useState(() => Math.floor(Math.random()*messages.length));
  const msgTimer = useRef(null);
  useEffect(()=>{
    if(!autoRotateMsg) return;
    msgTimer.current = setInterval(()=>{
      setMsgIndex((i)=> (i+1)%messages.length);
    }, 60_000);
    return ()=> { if(msgTimer.current) clearInterval(msgTimer.current); };
  },[autoRotateMsg]);

  // 로드/저장
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      if (saved) {
        setData(saved.data || {});
        if (saved.themeColor) setThemeColor(saved.themeColor);
      }
    } catch (e) {}
  }, []);
  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ data, themeColor }));
  }, [data, themeColor]);

  // 보이는 달 계산값
  const vy = viewDate.getFullYear();
  const vm = viewDate.getMonth();
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const monthStart = fmt(new Date(vy, vm, 1));
  const monthEnd = fmt(new Date(vy, vm, daysInMonth));
  const has31 = daysInMonth === 31;

  // 오늘 키/값 (메인 원 표시용 + 초복이 사진 상태)
  const todayKey = fmt(today);
  const t = data[todayKey] || {};
  const todaySteps = Math.max(0, t.steps || 0);
  const photoGroup = (t.excluded ? "verylow" : todaySteps <= 2000 ? "verylow" : todaySteps <= 6000 ? "low" : todaySteps <= 10000 ? "mid" : "high");

  // 유틸: 월 이동
  const shiftMonth = (base, diff) => new Date(base.getFullYear(), base.getMonth() + diff, 1);

  // 미달 ↔ 비 토글(미달일 때만 허용)
  function toggleRainIfGrey(key) {
    setData((p) => {
      const it = p[key] || {};
      const grey = !it.excluded && (it.steps || 0) < 8000;
      if (!grey) return p;
      return { ...p, [key]: { ...it, rain: !it.rain } };
    });
  }

  // 제외 토글(달성 상태에선 동작 금지)
  function toggleExcludedSafe(key) {
    setData((p) => {
      const it = p[key] || {};
      const achieved = !it.excluded && (it.steps || 0) >= 8000;
      if (achieved) return p;
      return { ...p, [key]: { ...it, excluded: !it.excluded } };
    });
  }

  // 테스트 입력 열기/저장
  function openEditor() {
    const inView = today.getFullYear() === vy && today.getMonth() === vm;
    const base = inView ? today : new Date(vy, vm, 1);
    const k = fmt(base);
    const it = data[k] || {};
    setTmpDate(k);
    setTmpSteps(String(it.steps ?? 0));
    setTmpFloors(String(it.floors ?? 0));
    setEditOpen(true);
  }
  function onChangeEditorDate(v) {
    if (!v) return;
    if (v < monthStart || v > monthEnd) return;
    setTmpDate(v);
    const it = data[v] || {};
    setTmpSteps(String(it.steps ?? 0));
    setTmpFloors(String(it.floors ?? 0));
  }
  function saveEditor() {
    const key = tmpDate && tmpDate >= monthStart && tmpDate <= monthEnd ? tmpDate : monthStart;
    const s = Math.max(0, parseInt(tmpSteps || "0", 10) || 0);
    const f = Math.max(0, parseInt(tmpFloors || "0", 10) || 0);
    setData((p) => ({ ...p, [key]: { ...(p[key] || {}), steps: s, floors: f } }));
    setEditOpen(false);
  }

  // 3층(1~30) + 4층(31) 구성
  const rows = [
    Array.from({ length: 10 }, (_, i) => i + 1),   // row1 (1~10)
    Array.from({ length: 10 }, (_, i) => i + 11),  // row2 (11~20)
    Array.from({ length: 10 }, (_, i) => i + 21),  // row3 (21~30)
  ];

  return (
    <div className="min-h-screen" style={{ background: themeColor + "10" }}>
      <div className="max-w-sm mx-auto p-5 pb-28 flex flex-col items-center relative">
        {/* 팔레트 버튼 */}
        <label className="absolute top-3 right-3 cursor-pointer" title="테마 색 변경">
          🎨
          <input type="color" value={themeColor} onChange={(e)=>setThemeColor(e.target.value)} className="opacity-0 w-0 h-0" />
        </label>

        {/* 상단: 초복이 사진 + 멘트 */}
        <div className="mb-4 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-6xl mb-2" aria-label="초복이">
            {dogImages[photoGroup] ? (
              <img src={dogImages[photoGroup]} alt="초복이" className="w-full h-full object-cover" />
            ) : (
              <span>{photoGroup==='verylow' ? '😴' : photoGroup==='low' ? '🙂' : photoGroup==='mid' ? '😄' : '🐶🔥'}</span>
            )}
          </div>
          <div className="text-slate-700 font-semibold text-center">{messages[msgIndex]}</div>
        </div>

        {/* 메인 원 */}
        <div className="relative w-64 h-64 rounded-full bg-white shadow-md flex flex-col items-center justify-center mb-3" style={{ border:`6px solid ${themeColor}` }}>
          {/* ✏️ 테스트 입력 버튼 */}
          <button onClick={openEditor} className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200" title="테스트용 수동 입력" aria-label="테스트용 수동 입력">✏️</button>

          <div className="text-5xl font-extrabold text-slate-800">{typeof t.steps === 'number' ? t.steps.toLocaleString() : 0}</div>
          <div className="text-slate-500 text-sm mt-1">걸음수</div>
          <div className="absolute bottom-4 text-slate-400 text-xs">층수: {t.floors || 0}</div>
        </div>

        {/* ▶ 테스트용 수동 입력 패널 */}
        {editOpen && (
          <div className="w-full mb-4 p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="text-[11px] text-slate-500 mb-2">테스트용 수동 입력 (현재 보이는 달에서만)</div>
            <div className="grid grid-cols-3 gap-3 items-end mb-3">
              <label className="col-span-2 text-sm text-slate-700">날짜
                <input type="date" className="mt-1 w-full px-2 py-1 border rounded" min={monthStart} max={monthEnd} value={tmpDate} onChange={(e)=>onChangeEditorDate(e.target.value)} />
              </label>
              <button onClick={()=>onChangeEditorDate(fmt(today))} className="px-2 py-1 text-xs rounded border bg-slate-50 hover:bg-slate-100" title="오늘로">오늘</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-700">걸음수
                <input type="number" inputMode="numeric" className="mt-1 w-full px-2 py-1 border rounded" value={tmpSteps} onChange={(e)=>setTmpSteps(e.target.value)} />
              </label>
              <label className="text-sm text-slate-700">층수
                <input type="number" inputMode="numeric" className="mt-1 w-full px-2 py-1 border rounded" value={tmpFloors} onChange={(e)=>setTmpFloors(e.target.value)} />
              </label>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
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

        {/* 달력 카드 */}
        <section className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-3">
          {/* 상단 바: 삼각 네비(작고 테두리X) / YYYY.M 라벨 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-slate-500">
              <button className="p-1 text-[13px] rounded hover:bg-slate-50" onClick={()=>setViewDate(d=>shiftMonth(d,-1))} aria-label="이전 달">◀</button>
              <button className="p-1 text-[13px] rounded hover:bg-slate-50" onClick={()=>setViewDate(d=>shiftMonth(d,+1))} aria-label="다음 달">▶</button>
            </div>
            <div className="text-[12px] text-slate-400">{vy}.{vm + 1}</div>
          </div>

          {/* 위→아래: [31층(옵션)] [21~30] [11~20] [1~10] */}
          <div className="flex flex-col gap-1">
            {has31 && (
              <div className="grid grid-cols-10 gap-1">
                <div className="col-span-1 flex">
                  <Circle31 y={vy} m={vm} data={data} goal={8000} themeColor={themeColor} onToggleRainIfGrey={toggleRainIfGrey} onToggleExcluded={toggleExcludedSafe} />
                </div>
              </div>
            )}

            {/* row3: 21~30 */}
            <div className="grid grid-cols-10 gap-1">
              {rows[2].map((n) => (
                <BlockCell key={n} y={vy} m={vm} n={n} maxDay={daysInMonth} data={data} goal={8000} themeColor={themeColor} onToggleRainIfGrey={toggleRainIfGrey} onToggleExcluded={toggleExcludedSafe} />
              ))}
            </div>
            {/* row2: 11~20 */}
            <div className="grid grid-cols-10 gap-1">
              {rows[1].map((n) => (
                <BlockCell key={n} y={vy} m={vm} n={n} maxDay={daysInMonth} data={data} goal={8000} themeColor={themeColor} onToggleRainIfGrey={toggleRainIfGrey} onToggleExcluded={toggleExcludedSafe} />
              ))}
            </div>
            {/* row1: 1~10 */}
            <div className="grid grid-cols-10 gap-1">
              {rows[0].map((n) => (
                <BlockCell key={n} y={vy} m={vm} n={n} maxDay={daysInMonth} data={data} goal={8000} themeColor={themeColor} onToggleRainIfGrey={toggleRainIfGrey} onToggleExcluded={toggleExcludedSafe} />
              ))}
            </div>
          </div>

          {/* 주석(한 줄: 달성/2배달성/제외) + 비 설명 */}
          <Legend themeColor={themeColor} />
        </section>
      </div>
      {/* 하단 고정: 쿠팡 파트너스 배너 (320x60 비율) */}
      <CoupangAd />
    </div>
  );
}

function BlockCell({ y, m, n, maxDay, data, goal, themeColor, onToggleRainIfGrey, onToggleExcluded }) {
  // 존재하지 않는 날짜 칸은 생성하지 않음
  if (n > maxDay) return null;
  const date = new Date(y, m, n);
  const key = fmt(date);
  const item = data[key] || {};
  const color = dayClass(item, goal, themeColor);

  const achieved = !item.excluded && (item.steps || 0) >= goal;
  const isDouble = !item.excluded && (item.steps || 0) >= goal * 2;
  const isGrey = !item.excluded && (item.steps || 0) < goal;
  const pawSize = isDouble ? 22 : 18;

  // 제스처: 달성일은 임의 변경 불가
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

  const label = `${key} · ${item.excluded ? '제외' : (isDouble ? '2배 달성' : (achieved ? '달성' : '미달'))}${(isGrey && item.rain) ? ' · 비' : ''}`;

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
      {achieved ? (
        <PawIcon color="#ffffff" size={pawSize} />
      ) : isGrey && item.rain ? (
        <RainCancelIcon size={pawSize} />
      ) : (
        n
      )}
      {item.excluded && "🚫"}
    </div>
  );
}

function Circle31({ y, m, data, goal, themeColor, onToggleRainIfGrey, onToggleExcluded }) {
  const date = new Date(y, m, 31);
  const key = fmt(date);
  const item = data[key] || {};
  const color = dayClass(item, goal, themeColor);

  const achieved = !item.excluded && (item.steps || 0) >= goal;
  const isDouble = !item.excluded && (item.steps || 0) >= goal * 2;
  const isGrey = !item.excluded && (item.steps || 0) < goal;
  const pawSize = isDouble ? 22 : 18;

  const longRef = useRef(false);
  const timerRef = useRef(null);
  const down = () => { if (achieved) return; longRef.current = false; timerRef.current = setTimeout(() => { longRef.current = true; onToggleExcluded(key); }, 500); };
  const up = () => { if (timerRef.current) clearTimeout(timerRef.current); };
  const click = () => {};
  const dbl = () => { if (isGrey) onToggleRainIfGrey(key); };

  const label = `${key} · ${item.excluded ? '제외' : (isDouble ? '2배 달성' : (achieved ? '달성' : '미달'))}${(isGrey && item.rain) ? ' · 비' : ''}`;

  return (
    <div
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onClick={click}
      onDoubleClick={dbl}
      className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] select-none mx-auto"
      style={{ backgroundColor: color, color: "white" }}
      title={label}
      aria-label={label}
    >
      {achieved ? <PawIcon color="#ffffff" size={pawSize} /> : (isGrey && item.rain ? <RainCancelIcon size={pawSize} /> : '31')}
      {item.excluded && "🚫"}
    </div>
  );
}

function dayClass(item, goal, themeColor) {
  if (!item) return "#e2e8f0"; // 미입력: 아주 밝은 회색
  if (item.excluded) return "#fbbf24"; // 제외: 주황
  const s = item.steps || 0;
  if (s >= goal * 2) return darkenHex(themeColor, 0.7); // 2배: 테마색 진하게
  if (s >= goal) return themeColor; // 달성: 테마색
  return "#cbd5e1"; // 미달: 밝은 회색
}

function darkenHex(hex, factor = 0.8) {
  try {
    let h = hex.replace('#','');
    if (h.length === 3) h = h.split('').map(c=>c+c).join('');
    const r = Math.round(parseInt(h.slice(0,2),16)*factor);
    const g = Math.round(parseInt(h.slice(2,4),16)*factor);
    const b = Math.round(parseInt(h.slice(4,6),16)*factor);
    const to2 = (n)=> n.toString(16).padStart(2,'0');
    return `#${to2(r)}${to2(g)}${to2(b)}`;
  } catch(e){ return hex; }
}

function PawIcon({ color = "#ffffff", size = 14 }) {
  const stroke = "#ffffff"; const sw = 1.2;
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

function RainCancelIcon({ size = 18 }) {
  const blue = "#3b82f6";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2 C9 6,6 9,6 13 a6 6 0 0 0 12 0 c0-4-3-7-6-11z" fill={blue} />
      <path d="M9 13 l6 6 M15 13 l-6 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function Legend({ themeColor }){
  return (
    <div className="mt-3">
      {/* 한 줄 주석 */}
      <div className="flex items-center gap-4 text-[11px] text-slate-600">
        <div className="flex items-center gap-2"><div className="w-6 h-4 rounded" style={{ backgroundColor: themeColor }} /><span>달성</span></div>
        <div className="flex items-center gap-2"><div className="w-6 h-4 rounded" style={{ backgroundColor: darkenHex(themeColor,0.7) }} /><span>2배달성</span></div>
        <div className="flex items-center gap-2"><div className="w-6 h-4 rounded" style={{ backgroundColor: '#fbbf24' }} /><span>제외(길게누르기)</span></div>
      </div>
      {/* 비 설명 */}
      <div className="mt-1 flex items-center gap-1 justify-end text-[11px] text-slate-500">
        <RainCancelIcon size={14} />
        <span>비 표시(미달일만, 더블탭)</span>
      </div>
    </div>
  );
}

function CoupangAd(){
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-white/95 border-t border-slate-200">
      <div style={{ position:'relative', width:'100%', paddingTop:'18.75%' }}>
        <iframe
          src="https://ads-partners.coupang.com/widgets.html?id=915461&template=carousel&trackingCode=AF3609977&subId=&width=600&height=100&tsource="
          style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:0 }}
          scrolling="no"
          referrerPolicy="unsafe-url"
          browsingtopics=""
          title="쿠팡 파트너스 광고"
        />
      </div>
    </div>
  );
}

