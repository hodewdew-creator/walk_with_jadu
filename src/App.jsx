import React, { useEffect, useRef, useState } from "react";

/** 파일: src/App.jsx — 오늘 걸음 원 + 월간 3~4층 블럭(31일은 4층, 21 위) + 테스트 입력 */

// 로컬 날짜 키(UTC 오프셋 이슈 방지)
const fmt = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const STORE_KEY = "walklog-v9"; // 그대로 유지 (기존 로컬 데이터 보존)

// (추후 교체) 초복이 사진 세트 매핑 (빈 문자열은 SVG 강아지로 대체 렌더)
const dogImages = {
  verylow: "",
  low: "",
  mid: "",
  high: "",
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
    "초복이: 엄마, 산책 가요? 🐶","하늘이 너무 예뻐요 ✨","노을 감상 산책 🌇","한 바퀴만 살짝","바람이 초대했어요 🌿",
    "발자국 도장 찍기","골목길 작은 모험","구름 그림자 밟기","꽃 향기 맡고 가요 🌸","벤치에서 쉬었다 가요",
    "좋아하는 노래 ON ▶","카페까지 데이트 ☕","리듬 타는 발걸음","가로수랑 손인사","초복이 눈빛 레이저✨",
    "팔짝팔짝 신나는 날","작심매일 느낌","작은 설렘 챙기기","구름이 춤춰요 ☁️","마음도 산책 중",
    "달빛 길 걷기 🌙","길 위의 포근함","살랑살랑 바람소리","천천히도 멋져요","초복이의 응원 포효!",
    "미소가 따라와요","한숨 대신 산책","좋아하는 길로 GO","풀 향기 한 스푼","쉼표 같은 시간",
    "오늘도 반짝✨","마음이 가벼워져요","비 개인 하늘 예술","햇살 맛집 코스 ☀️","돌아오면 상쾌해요",
    "작은 성취 콕콕","박수 짝짝","도시의 산책자","계단은 천천히","시장 골목 산책",
    "노래 두 곡 거리","동네 길 100점","산책 레디!","미끄럼 주의 ⚠️","호기심 가득 눈빛",
    "오늘도 기분 촉촉","내일의 나에게 선물","하늘색 예쁘다","새소리 들리나요?","심호흡 한 번",
    "공원까지 슝~","바람이 상냥해요","숲 향기 하나 더","따뜻한 차 생각 ☕","카메라롤 채우기",
    "구석구석 탐험","발자국 톡톡톡","포토타임","오늘도 무드 좋다","웃음도 같이 걷기",
    "구름 예보: 귀여움","행복이 졸졸","조용조용 힐링","노을에 마음 녹음","꼬리 살랑",
    "하루의 마침표 ·","비 오는 날 감성","우산 톡톡 리듬","딱 5분도 좋아","집앞 한 바퀴 OK",
    "숨은 포토존 찾기","발걸음이 노래해","빨리빨리!","뿌듯함 챙겨오기","새길 발견 코너",
    "햇살에 반짝이는 길","발끝까지 행복","달님께 살짝 인사","별들에게 손인사","낮잠 대신 산책",
    "칭찬 한 스푼","반짝이 길 위로","작은 설렘 두 스푼","골목 끝 비밀 정원?","오늘도 우리만의 길",
    "나란히 나란히","포근한 공기 한 컵","고양이랑 인사","창문 밖 말고 밖으로","바삭한 공기 맛",
  ];
  const [msgIndex, setMsgIndex] = useState(() => Math.floor(Math.random()*messages.length));
  const msgTimer = useRef(null);
  useEffect(()=>{
    if(!autoRotateMsg) return;
    msgTimer.current = setInterval(()=>{ setMsgIndex((i)=> (i+1)%messages.length); }, 60_000);
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

  // 제외 토글(달성 상태에선 동작 금지) → 블랙 X 아이콘
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
    Array.from({ length: 10 }, (_, i) => i + 1),   // 1~10
    Array.from({ length: 10 }, (_, i) => i + 11),  // 11~20
    Array.from({ length: 10 }, (_, i) => i + 21),  // 21~30
  ];

  return (
    <div className="min-h-screen" style={{ background: themeColor + "10" }}>
      <div className="max-w-sm mx-auto p-5 flex flex-col items-center relative">
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
              <DogFallbackIcon />
            )}
          </div>
          <div className="text-slate-700 font-semibold text-center">{messages[msgIndex]}</div>
        </div>

        {/* 메인 원 */}
        <div className="relative rounded-full bg-white shadow-md flex flex-col items-center justify-center mb-3"
             style={{ width: "clamp(200px, 56vw, 256px)", height: "clamp(200px, 56vw, 256px)", border: `6px solid ${themeColor}` }}>
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
                <BlockCell key={n} y={vy} m={vm} n={n} maxDay={daysInMonth} data={data} goal
