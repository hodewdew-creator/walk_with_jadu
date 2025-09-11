import React, { useEffect, useRef, useState } from "react";

/** 파일: src/App.jsx — UI 수정 1차
 *  1) 31일: 사각형 블록으로 변경
 *  2) 31일이 있는 달: 상단 바 왼쪽에 31일 블록 배치 → 삼각 버튼 오른쪽으로 밀림
 *  3) 주석 한 줄: "달성 / 2배달성 / 제외 (길게) / 비 (더블탭)"
 *  - 팔레트 옆 🅲 링크는 그대로 유지
 *  - 하단 광고는 없음
 */

const COUPANG_URL = "https://walk-with-jadu-coup.vercel.app";

// 로컬 날짜 키(UTC 오프셋 이슈 방지)
const fmt = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const STORE_KEY = "walklog-v9"; // 기존 키 유지 (로컬 데이터 보존)

// (추후 교체) 초복이 사진 세트 매핑
const dogImages = {
  verylow: "/dog-temp.png",
  low: "/dog-temp.png",
  mid: "/dog-temp.png",
  high: "/dog-temp.png",
};

export default function WalkTrackerApp() {
  const [today] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [data, setData] = useState({});
  const [themeColor, setThemeColor] = useState("#38bdf8");

  // 테스트 입력 패널
  const [editOpen, setEditOpen] = useState(false);
  const [tmpDate, setTmpDate] = useState("");
  const [tmpSteps, setTmpSteps] = useState("");
  const [tmpFloors, setTmpFloors] = useState("");

  // 멘트 + 1분마다 갱신
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
  const [msgIndex, setMsgIndex] = useState(() => Math.floor(Math.random() * messages.length));
  const msgTimer = useRef(null);
  useEffect(() => {
    if (!autoRotateMsg) return;
    msgTimer.current = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 60_000);
    return () => {
      if (msgTimer.current) clearInterval(msgTimer.current);
    };
  }, [autoRotateMsg]);

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
  const photoGroup = t.excluded
    ? "verylow"
    : todaySteps <= 2000
    ? "verylow"
    : todaySteps <= 6000
    ? "low"
    : todaySteps <= 10000
    ? "mid"
    : "high";

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

  // 3층(1~30) 구성 (31일은 상단 바로 이동)
  const rows = [
    Array.from({ length: 10 }, (_, i) => i + 1),   // 1~10
    Array.from({ length: 10 }, (_, i) => i + 11),  // 11~20
    Array.from({ length: 10 }, (_, i) => i + 21),  // 21~30
  ];

  return (
    <div className="min-h-screen" style={{ background: themeColor + "10" }}>
      <div
        className="max-w-sm mx-auto p-5 flex flex-col items-center relative"
        style={{ paddingBottom: "10px" }} // 하단 광고 제거 → 여유 패딩만 유지
      >
        {/* 🎨 팔레트 + 🅲 링크 */}
        <div className="absolute top-3 right-3 flex items-center gap-3">
          <a
            href={COUPANG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg hover:opacity-80"
            title="쿠팡 링크"
            aria-label="쿠팡 링크"
          >
            🅲
          </a>
          <label className="cursor-pointer" title="테마 색 변경">
            🎨
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="opacity-0 w-0 h-0"
            />
          </label>
        </div>

        {/* 상단: 초복이 사진 + 멘트 */}
        <div className="mb-4 flex flex-col items-center">
          <div
            className="w-32 h-32 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-6xl mb-2"
            aria-label="초복이"
          >
            {dogImages[photoGroup] ? (
              <img
                src={dogImages[photoGroup]}
                alt="초복이"
                className="w-full h-full object-cover"
              />
            ) : (
              <DogFallbackIcon />
            )}
          </div>
          <div className="text-slate-700 font-semibold text-center">
            {messages[msgIndex]}
          </div>
        </div>

        {/* 메인 원 */}
        <div
          className="relative rounded-full bg-white shadow-md flex flex-col items-center justify-center mb-3"
          style={{
            width: "clamp(200px, 56vw, 256px)",
            height: "clamp(200px, 56vw, 256px)",
            border: `6px solid ${themeColor}`,
          }}
        >
          {/* ✏️ 테스트 입력 버튼 */}
          <button
            onClick={openEditor}
            className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200"
            title="테스트용 수동 입력"
            aria-label="테스트용 수동 입력"
          >
            ✏️
          </button>

          <div className="text-5xl font-extrabold text-slate-800">
            {typeof t.steps === "number" ? t.steps.toLocaleString() : 0}
          </div>
          <div className="text-slate-500 text-sm mt-1">걸음수</div>
          <div className="absolute bottom-4 text-slate-400 text-xs">
            층수: {t.floors || 0}
          </div>
        </div>

        {/* ▶ 테스트용 수동 입력 패널 */}
        {editOpen && (
          <div className="w-full mb-4 p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="text-[11px] text-slate-500 mb-2">
              테스트용 수동 입력 (현재 보이는 달에서만)
            </div>
            <div className="grid grid-cols-3 gap-3 items-end mb-3">
              <label className="col-span-2 text-sm text-slate-700">
                날짜
                <input
                  type="date"
                  className="mt-1 w-full px-2 py-1 border rounded"
                  min={monthStart}
                  max={monthEnd}
                  value={tmpDate}
                  onChange={(e) => onChangeEditorDate(e.target.value)}
                />
              </label>
              <button
                onClick={() => onChangeEditorDate(fmt(today))}
                className="px-2 py-1 text-xs rounded border bg-slate-50 hover:bg-slate-100"
                title="오늘로"
              >
                오늘
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-700">
                걸음수
                <input
                  type="number"
                  inputMode="numeric"
                  className="mt-1 w-full px-2 py-1 border rounded"
                  value={tmpSteps}
                  onChange={(e) => setTmpSteps(e.target.value)}
                />
              </label>
              <label className="text-sm text-slate-700">
                층수
                <input
                  type="number"
                  inputMode="numeric"
                  className="mt-1 w-full px-2 py-1 border rounded"
                  value={tmpFloors}
                  onChange={(e) => setTmpFloors(e.target.value)}
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {[0, 5000, 8000, 16000].map((v) => (
                <button
                  key={v}
                  onClick={() => setTmpSteps(String(v))}
                  className="px-2 py-1 text-xs rounded border bg-slate-50 hover:bg-slate-100"
                >
                  {v.toLocaleString()}보
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setEditOpen(false)}
                className="px-3 py-1 text-sm rounded border"
              >
                취소
              </button>
              <button
                onClick={saveEditor}
                className="px-3 py-1 text-sm rounded text-white"
                style={{ background: themeColor }}
              >
                저장
              </button>
            </div>
          </div>
        )}

        {/* 달력 카드 */}
        <section className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-3">
          {/* 상단 바: 왼쪽 31일(있을때만) / 가운데 YYYY.M / 오른쪽 ◀ ▶ */}
          <div className="flex items-center mb-2">
            {/* 왼쪽: 31일 블록 (사각형) */}
            <div className="flex items-center min-w-[2rem]">
              {has31 && (
                <div className="w-8">
                  <BlockCell
                    y={vy}
                    m={vm}
                    n={31}
                    maxDay={31}
                    data={data}
                    goal={8000}
                    themeColor={themeColor}
                    onToggleRainIfGrey={toggleRainIfGrey}
                    onToggleExcluded={toggleExcludedSafe}
                    cellWidth="2rem"
                  />
                </div>
              )}
            </div>

            {/* 가운데: YYYY.M */}
            <div className="flex-1 text-center text-[12px] text-slate-400">
              {vy}.{vm + 1}
            </div>

            {/* 오른쪽: 네비 버튼 */}
            <div className="flex items-center gap-1 text-slate-500">
              <button
                className="p-1 text-[13px] rounded hover:bg-slate-50"
                onClick={() => setViewDate((d) => shiftMonth(d, -1))}
                aria-label="이전 달"
              >
                ◀
              </button>
              <button
                className="p-1 text-[13px] rounded hover:bg-slate-50"
                onClick={() => setViewDate((d) => shiftMonth(d, +1))}
                aria-label="다음 달"
              >
                ▶
              </button>
            </div>
          </div>

          {/* 아래: 1~30 블록 3층 */}
          <div className="flex flex-col gap-1">
            {/* row3: 21~30 */}
            <div className="grid grid-cols-10 gap-1">
              {rows[2].map((n) => (
                <BlockCell
                  key={n}
                  y={vy}
                  m={vm}
                  n={n}
                  maxDay={daysInMonth}
                  data={data}
                  goal={8000}
                  themeColor={themeColor}
                  onToggleRainIfGrey={toggleRainIfGrey}
                  onToggleExcluded={toggleExcludedSafe}
                />
              ))}
            </div>
            {/* row2: 11~20 */}
            <div className="grid grid-cols-10 gap-1">
              {rows[1].map((n) => (
                <BlockCell
                  key={n}
                  y={vy}
                  m={vm}
                  n={n}
                  maxDay={daysInMonth}
                  data={data}
                  goal={8000}
                  themeColor={themeColor}
                  onToggleRainIfGrey={toggleRainIfGrey}
                  onToggleExcluded={toggleExcludedSafe}
                />
              ))}
            </div>
            {/* row1: 1~10 */}
            <div className="grid grid-cols-10 gap-1">
              {rows[0].map((n) => (
                <BlockCell
                  key={n}
                  y={vy}
                  m={vm}
                  n={n}
                  maxDay={daysInMonth}
                  data={data}
                  goal={8000}
                  themeColor={themeColor}
                  onToggleRainIfGrey={toggleRainIfGrey}
                  onToggleExcluded={toggleExcludedSafe}
                />
              ))}
            </div>
          </div>

          {/* 주석 한 줄 */}
          <LegendOneLine themeColor={themeColor} />
        </section>
      </div>
    </div>
  );
}

function BlockCell({
  y,
  m,
  n,
  maxDay,
  data,
  goal,
  themeColor,
  onToggleRainIfGrey,
  onToggleExcluded,
  cellWidth,
}) {
  if (n > maxDay) return null; // 존재하지 않는 날짜 칸은 생성하지 않음
  const date = new Date(y, m, n);
  const key = fmt(date);
  const item = data[key] || {};
  const color = dayClass(item, goal, themeColor);

  const achieved = !item.excluded && (item.steps || 0) >= goal;
  const isDouble = !item.excluded && (item.steps || 0) >= goal * 2;
  const isGrey = !item.excluded && (item.steps || 0) < goal;
  const iconSize = isDouble ? 26 : 22; // 발바닥 기본 크게, 2배는 더 크게

  // 제스처: 달성일은 임의 변경 불가
  const timerRef = useRef(null);
  const down = () => {
    if (achieved) return;
    timerRef.current = setTimeout(() => onToggleExcluded(key), 500);
  };
  const up = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  const dbl = () => {
    if (isGrey) onToggleRainIfGrey(key);
  };

  const label = `${key} · ${item.excluded ? "제외" : isDouble ? "2배 달성" : achieved ? "달성" : "미달"}${
    isGrey && item.rain ? " · 비" : ""
  }`;

  return (
    <div
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onDoubleClick={dbl}
      className="relative h-8 rounded flex items-center justify-center text-[12px] select-none"
      style={{ backgroundColor: color, color: "white", width: cellWidth || undefined }}
      title={label}
      aria-label={label}
    >
      {item.excluded ? (
        <ExcludeIcon size={iconSize} />
      ) : achieved ? (
        <PawIcon size={iconSize} />
      ) : isGrey && item.rain ? (
        <RainCancelIcon size={iconSize} />
      ) : (
        n
      )}
    </div>
  );
}

function dayClass(item, goal, themeColor) {
  if (!item) return "#e2e8f0"; // 미입력: 아주 밝은 회색
  if (item.excluded) return "#ffffff"; // 제외: 흰 배경 (검은 X가 중앙)
  const s = item.steps || 0;
  if (s >= goal * 2) return darkenHex(themeColor, 0.7); // 2배: 테마색 진하게
  if (s >= goal) return themeColor; // 달성: 테마색
  return "#cbd5e1"; // 미달: 밝은 회색
}

function darkenHex(hex, factor = 0.8) {
  try {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const r = Math.round(parseInt(h.slice(0, 2), 16) * factor);
    const g = Math.round(parseInt(h.slice(2, 4), 16) * factor);
    const b = Math.round(parseInt(h.slice(4, 6), 16) * factor);
    const to2 = (n) => n.toString(16).padStart(2, "0");
    return `#${to2(r)}${to2(g)}${to2(b)}`;
  } catch (e) {
    return hex;
  }
}

// 아이콘들
function PawIcon({ size = 22 }) {
  const c = "#ffffff",
    sw = 1.2;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="7" cy="7" r="3" fill={c} stroke={c} strokeWidth={sw} />
      <circle cx="17" cy="7" r="3" fill={c} stroke={c} strokeWidth={sw} />
      <circle cx="4" cy="12" r="3" fill={c} stroke={c} strokeWidth={sw} />
      <circle cx="20" cy="12" r="3" fill={c} stroke={c} strokeWidth={sw} />
      <path
        d="M7 18c0-3 3-5 5-5s5 2 5 5c0 2-2 4-5 4s-5-2-5-4z"
        fill={c}
        stroke={c}
        strokeWidth={sw}
      />
    </svg>
  );
}

function RainCancelIcon({ size = 22 }) {
  const blue = "#3b82f6"; // 파란 물방울 + 흰 X
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2 C9 6,6 9,6 13 a6 6 0 0 0 12 0 c0-4-3-7-6-11z" fill={blue} />
      <path d="M9 13 l6 6 M15 13 l-6 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ExcludeIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6 L18 18 M18 6 L6 18" stroke="#111" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function DogFallbackIcon({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#fde68a" />
      <circle cx="24" cy="28" r="6" fill="#fff"/>
      <circle cx="40" cy="28" r="6" fill="#fff"/>
      <circle cx="24" cy="28" r="3" fill="#111"/>
      <circle cx="40" cy="28" r="3" fill="#111"/>
      <path d="M24 44 q8 6 16 0" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M14 18 q6 -10 14 -2" stroke="#d97706" strokeWidth="6" strokeLinecap="round"/>
      <path d="M50 18 q-6 -10 -14 -2" stroke="#d97706" strokeWidth="6" strokeLinecap="round"/>
    </svg>
  );
}

function LegendOneLine({ themeColor }){
  return (
    <div className="mt-3 text-[11px] text-slate-600 flex items-center gap-4 flex-wrap">
      <span className="inline-flex items-center gap-1">
        <span className="w-6 h-3 rounded inline-block" style={{ backgroundColor: themeColor }}></span>달성
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="w-6 h-3 rounded inline-block" style={{ backgroundColor: darkenHex(themeColor,0.7) }}></span>2배달성
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="w-6 h-3 rounded inline-block border border-slate-300 bg-white"></span>제외 (길게)
      </span>
      <span className="inline-flex items-center gap-1">
        <RainCancelIcon size={14} />비 (더블탭)
      </span>
    </div>
  );
}
