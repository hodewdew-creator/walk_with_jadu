import React, { useEffect, useRef, useState } from "react";

/**
 * Walk With Jadu — Final Clean App.jsx
 * - 🅲 링크 유지 (https://walk-with-jadu-coup.vercel.app)
 * - 하단 광고 제거
 * - 31일: 사각형 블록 상단바(왼쪽), ◀ ▶은 오른쪽
 * - 비/제외 토글 제한 없음 (더블탭=비, 길게=제외)
 * - 4,000–7,999보: 테마색 옅은 톤, 발바닥 없음 (숫자만 표시)
 * - 오늘: 테마색 링 + 오라 하이라이트
 * - 초복이 사진 크게(clamp), 스크롤 방지
 * - 상단 멘트: /messages_ko.json fetch, 실패 시 기본 문구 폴백
 * - 층수(UI/저장) 제거
 */

const COUPANG_URL = "https://walk-with-jadu-coup.vercel.app";

// 날짜 → 키 포맷
const fmt = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const STORE_KEY = "walklog-v9";

// (임시) 초복이 사진 매핑
const dogImages = {
  verylow: "/dog-temp.png",
  low: "/dog-temp.png",
  mid: "/dog-temp.png",
  high: "/dog-temp.png",
};

export default function WalkTrackerApp() {
  // 오늘/보이는 달
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

  // 데이터/테마
  const [data, setData] = useState({});
  const [themeColor, setThemeColor] = useState("#38bdf8");

  // 상단 멘트
  const autoRotateMsg = true;
  const DEFAULT_MESSAGES = [
    "산책 좋아요 🐾",
    "마음도 산책 중",
    "오늘도 화이팅!",
    "초복이와 함께",
    "바람이 상쾌해요",
  ];
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [msgIndex, setMsgIndex] = useState(() =>
    Math.floor(Math.random() * Math.max(1, DEFAULT_MESSAGES.length))
  );
  const msgTimer = useRef(null);

  useEffect(() => {
    if (!autoRotateMsg) return;
    msgTimer.current = setInterval(() => {
      setMsgIndex((i) => (i + 1) % Math.max(1, messages.length));
    }, 60_000);
    return () => {
      if (msgTimer.current) clearInterval(msgTimer.current);
    };
  }, [autoRotateMsg, messages.length]);

  // 메시지 로드 (public/messages_ko.json)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/messages_ko.json", { cache: "no-store" });
        if (!res.ok) return;
        const arr = await res.json();
        if (alive && Array.isArray(arr) && arr.length) {
          setMessages(arr);
          setMsgIndex((i) => i % arr.length);
        }
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 로드/저장 (localStorage)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      if (saved) {
        setData(saved.data || {});
        if (saved.themeColor) setThemeColor(saved.themeColor);
      }
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ data, themeColor }));
  }, [data, themeColor]);

  // 보이는 달 계산
  const vy = viewDate.getFullYear();
  const vm = viewDate.getMonth();
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const has31 = daysInMonth === 31;

  // 오늘 상태
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

  // 월 이동
  const shiftMonth = (base, diff) => new Date(base.getFullYear(), base.getMonth() + diff, 1);

  // 비/제외 토글
  function toggleRain(key) {
    setData((p) => {
      const it = p[key] || {};
      return { ...p, [key]: { ...it, rain: !it.rain } };
    });
  }
  function toggleExcluded(key) {
    setData((p) => {
      const it = p[key] || {};
      return { ...p, [key]: { ...it, excluded: !it.excluded } };
    });
  }

  // 수동 입력 패널 상태
  const [editOpen, setEditOpen] = useState(false);
  const [tmpDate, setTmpDate] = useState("");
  const [tmpSteps, setTmpSteps] = useState("");

  function openEditor() {
    const inView = today.getFullYear() === vy && today.getMonth() === vm;
    const base = inView ? today : new Date(vy, vm, 1);
    const k = fmt(base);
    const it = data[k] || {};
    setTmpDate(k);
    setTmpSteps(String(it.steps ?? 0));
    setEditOpen(true);
  }

  function onChangeEditorDate(v) {
    const d = new Date(v);
    if (!v || isNaN(d)) return;
    d.setHours(0, 0, 0, 0);
    const k = fmt(d);
    setTmpDate(k);
    const it = data[k] || {};
    setTmpSteps(String(it.steps ?? 0));
    // 다른 달이면 달력 전환
    if (d.getFullYear() !== vy || d.getMonth() !== vm) {
      setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }

  function saveEditor() {
    const d = new Date(tmpDate);
    if (!tmpDate || isNaN(d)) {
      setEditOpen(false);
      return;
    }
    d.setHours(0, 0, 0, 0);
    const key = fmt(d);
    const s = Math.max(0, parseInt(tmpSteps || "0", 10) || 0);
    setData((p) => ({ ...p, [key]: { ...(p[key] || {}), steps: s } }));
    setEditOpen(false);
  }

  // 1~30 (3층), 31은 상단바
  const rows = [
    Array.from({ length: 10 }, (_, i) => i + 1),   // 1~10
    Array.from({ length: 10 }, (_, i) => i + 11),  // 11~20
    Array.from({ length: 10 }, (_, i) => i + 21),  // 21~30
  ];

  return (
    <div className="min-h-screen" style={{ background: themeColor + "10" }}>
      <div className="max-w-sm mx-auto p-5 flex flex-col items-center relative" style={{ paddingBottom: "10px" }}>
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
            className="rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-6xl mb-2"
            aria-label="초복이"
            style={{ width: "clamp(140px, 38vw, 192px)", height: "clamp(140px, 38vw, 192px)" }}
          >
            {dogImages[photoGroup] ? (
              <img src={dogImages[photoGroup]} alt="초복이" className="w-full h-full object-cover" />
            ) : (
              <DogFallbackIcon size={160} />
            )}
          </div>
          <div className="text-slate-700 font-semibold text-center">
            {messages[msgIndex] || DEFAULT_MESSAGES[msgIndex % DEFAULT_MESSAGES.length]}
          </div>
        </div>

        {/* 메인 원 */}
        <div
          className="relative rounded-full bg-white shadow-md flex flex-col items-center justify-center mb-3"
          style={{ width: "clamp(200px, 56vw, 256px)", height: "clamp(200px, 56vw, 256px)", border: `6px solid ${themeColor}` }}
        >
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
        </div>

        {/* ▶ 수동 입력 패널 */}
        {editOpen && (
          <div className="w-full mb-4 p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="text-[11px] text-slate-500 mb-2">테스트용 수동 입력 (어떤 날짜든 가능)</div>
            <div className="grid grid-cols-3 gap-3 items-end mb-3">
              <label className="col-span-2 text-sm text-slate-700">
                날짜
                <input
                  type="date"
                  className="mt-1 w-full px-2 py-1 border rounded"
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
            <div className="grid grid-cols-1 gap-3">
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
              <button onClick={() => setEditOpen(false)} className="px-3 py-1 text-sm rounded border">취소</button>
              <button onClick={saveEditor} className="px-3 py-1 text-sm rounded text-white" style={{ background: themeColor }}>저장</button>
            </div>
          </div>
        )}

        {/* 달력 카드 */}
        <section className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-3">
          {/* 상단 바: 왼쪽 31일 / 가운데 YYYY.M / 오른쪽 ◀ ▶ */}
          <div className="flex items-center mb-2">
            {/* 왼쪽: 31일 블록 */}
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
              <button className="p-1 text-[13px] rounded hover:bg-slate-50" onClick={() => setViewDate((d) => shiftMonth(d, -1))} aria-label="이전 달">◀</button>
              <button className="p-1 text-[13px] rounded hover:bg-slate-50" onClick={() => setViewDate((d) => shiftMonth(d, +1))} aria-label="다음 달">▶</button>
            </div>
          </div>

          {/* 아래: 1~30 (3층) */}
          <div className="flex flex-col gap-1">
            {/* row3: 21~30 */}
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 10 }, (_, i) => 21 + i).map((n) => (
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
              {Array.from({ length: 10 }, (_, i) => 11 + i).map((n) => (
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
              {Array.from({ length: 10 }, (_, i) => 1 + i).map((n) => (
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

          {/* 범례 한 줄 */}
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
  if (n > maxDay) return null;
  const date = new Date(y, m, n);
  const key = fmt(date);
  const item = data[key] || {};
  const s = item.steps || 0;
  const color = dayClass(item, goal, themeColor);

  const achieved = !item.excluded && s >= goal;
  const isDouble = !item.excluded && s >= goal * 2;
  const isPartial = !item.excluded && s >= 4000 && s < goal;
  const isToday = key === todayKey;

  // 제스처
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

  const ringShadow =
    isToday && !item.excluded
      ? `0 0 0 2px ${themeColor}, 0 0 0 6px ${hexToRgba(themeColor, 0.22)}`
      : undefined;

  return (
    <div
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onDoubleClick={dbl}
      className="relative h-8 rounded flex items-center justify-center text-[12px] select-none"
      style={{
        backgroundColor: color,
        color: "white",
        width: cellWidth || undefined,
        boxShadow: ringShadow,
      }}
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

      {!item.excluded && item.rain ? (
        <div className="absolute top-[1px] left-[1px]">
          <RainCancelIcon size={18} />
        </div>
      ) : null}
    </div>
  );
}

function dayClass(item, goal, themeColor) {
  if (!item) return "#e2e8f0"; // 미입력
  if (item.excluded) return "#ffffff"; // 제외
  const s = item.steps || 0;
  if (s >= goal * 2) return darkenHex(themeColor, 0.7); // 2배
  if (s >= goal) return themeColor; // 달성
  if (s >= 4000) return lightenHex(themeColor, 0.55); // 부분 달성
  return "#cbd5e1"; // 미달
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
  } catch {
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
  } catch {
    return hex;
  }
}

function hexToRgba(hex, a = 1) {
  try {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  } catch {
    return hex;
  }
}

// 아이콘
function PawIcon({ size = 22 }) {
  const c = "#ffffff", sw = 1.2;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="3" fill={c} stroke={c} strokeWidth={sw} />
      <circle cx="17" cy="7" r="3" fill={c} stroke={c} strokeWidth={sw} />
      <circle cx="4" cy="12" r="3" fill={c} stroke={c} strokeWidth={sw} />
      <circle cx="20" cy="12" r="3" fill={c} stroke={c} strokeWidth={sw} />
      <path d="M7 18c0-3 3-5 5-5s5 2 5 5c0 2-2 4-5 4s-5-2-5-4z" fill={c} stroke={c} strokeWidth={sw} />
    </svg>
  );
}

function RainCancelIcon({ size = 22 }) {
  const blue = "#3b82f6";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

function DogFallbackIcon({ size = 160 }) {
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

