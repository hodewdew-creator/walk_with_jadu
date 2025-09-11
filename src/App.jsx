import React, { useEffect, useRef, useState } from "react";
/** 파일: src/App.jsx — UI 수정 3차
 *  - '오늘' 블록 강조(테마색 링 + 오라) 추가
 *  - 비 배지(빗방울) 아이콘 크기 확대
 *  - 초복이 사진 영역을 반응형으로 더 크게 (스크롤 최소화 위한 clamp)
 *  - 31일: 사각형, 상단바 왼쪽 배치(◀ ▶은 오른쪽) — 이전 단계 유지
 *  - 팔레트 옆 🅲 링크 유지, 하단 광고 없음
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
  const [messages] = useState(messagesKO);
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

  // 오늘/키
  const todayKey = fmt(today);

  // 오늘 키/값 (메인 원 표시용 + 초복이 사진 상태)
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

  // 비 토글: 제한 없이
  function toggleRain(key) {
    setData((p) => {
      const it = p[key] || {};
      return { ...p, [key]: { ...it, rain: !it.rain } };
    });
  }

  // 제외 토글: 제한 없이
  function toggleExcluded(key) {
    setData((p) => {
      const it = p[key] || {};
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

        {/* 상단: 초복이 사진 + 멘트 (사진 더 크게, 반응형) */}
        <div className="mb-4 flex flex-col items-center">
          <div
            className="rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-6xl mb-2"
            aria-label="초복이"
            style={{ width: "clamp(140px, 38vw, 192px)", height: "clamp(140px, 38vw, 192px)" }}
          >
            {dogImages[photoGroup] ? (
              <img
                src={dogImages[photoGroup]}
                alt="초복이"
                className="w-full h-full object-cover"
              />
            ) : (
              <DogFallbackIcon size={160} />
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
                    onToggleRain={toggleRain}
                    onToggleExcluded={toggleExcluded}
                    cellWidth="2rem"
                    todayKey={todayKey}
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
                  onToggleRain={toggleRain}
                  onToggleExcluded={toggleExcluded}
                  todayKey={todayKey}
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
                  onToggleRain={toggleRain}
                  onToggleExcluded={toggleExcluded}
                  todayKey={todayKey}
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
                  onToggleRain={toggleRain}
                  onToggleExcluded={toggleExcluded}
                  todayKey={todayKey}
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
  onToggleRain,
  onToggleExcluded,
  cellWidth,
  todayKey,
}) {
  if (n > maxDay) return null; // 존재하지 않는 날짜 칸은 생성하지 않음
  const date = new Date(y, m, n);
  const key = fmt(date);
  const item = data[key] || {};
  const s = item.steps || 0;
  const color = dayClass(item, goal, themeColor);

  const achieved = !item.excluded && s >= goal;
  const isDouble = !item.excluded && s >= goal * 2;
  const isPartial = !item.excluded && s >= 4000 && s < goal;
  const isToday = key === todayKey;

  // 제스처: 길게 눌러 제외, 더블탭 비
  const timerRef = useRef(null);
  const down = () => {
    timerRef.current = setTimeout(() => onToggleExcluded(key), 500);
  };
  const up = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  const dbl = () => {
    onToggleRain(key);
  };

  const label =
    `${key} · ` +
    (item.excluded ? "제외" : isDouble ? "2배 달성" : achieved ? "달성" : isPartial ? "부분 달성" : "미달") +
    (item.rain ? " · 비" : "") +
    (isToday ? " · 오늘" : "");

  // 오늘 하이라이트 스타일: 테마색 링 + 은은한 오라 (레이아웃 영향 없음)
  const ringShadow = isToday && !item.excluded
    ? `0 0 0 2px ${themeColor}, 0 0 0 6px ${hexToRgba(themeColor, 0.22)}`
    : undefined;

  return (
    <div
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onDoubleClick={dbl}
      className="relative h-8 rounded flex items-center justify-center text-[12px] select-none"
      style={{ backgroundColor: color, color: "white", width: cellWidth || undefined, boxShadow: ringShadow }}
      title={label}
      aria-label={label}
    >
      {item.excluded ? (
        <ExcludeIcon size={22} />
      ) : achieved ? (
        <PawIcon size={isDouble ? 26 : 22} />
      ) : (
        n
      )}

      {/* 비 배지: 제외가 아닌 모든 상태에서 표시 가능 (사이즈 확대) */}
      {!item.excluded && item.rain ? (
        <div className="absolute top-[1px] left-[1px]">
          <RainCancelIcon size={18} />
        </div>
      ) : null}
    </div>
  );
}

function dayClass(item, goal, themeColor) {
  if (!item) return "#e2e8f0"; // 미입력: 아주 밝은 회색
  if (item.excluded) return "#ffffff"; // 제외: 흰 배경 (검은 X가 중앙)
  const s = item.steps || 0;
  if (s >= goal * 2) return darkenHex(themeColor, 0.7); // 2배: 테마색 진하게
  if (s >= goal) return themeColor; // 달성: 테마색
  if (s >= 4000) return lightenHex(themeColor, 0.55); // 부분 달성: 옅은 톤
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

function lightenHex(hex, factor = 0.5) {
  try {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const lr = Math.round(r + (255 - r) * factor);
    const lg = Math.round(g + (255 - g) * factor);
    const lb = Math.round(b + (255 - b) * factor);
    const to2 = (n) => n.toString(16).padStart(2, "0");
    return `#${to2(lr)}${to2(lg)}${to2(lb)}`;
  } catch (e) {
    return hex;
  }
}

// hex → rgba(a) 유틸
function hexToRgba(hex, a = 1) {
  try {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
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
        <RainCancelIcon size={16} />비 (더블탭)
      </span>
    </div>
  );
}

