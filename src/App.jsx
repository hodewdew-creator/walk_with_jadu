import React, { useEffect, useRef, useState } from "react";

/** 파일: src/App.jsx — 팔레트 옆 'C' 이모티콘 링크 (https://walk-with-jadu-coup.vercel.app) / 하단 광고 제거 */

const COUPANG_URL = "https://walk-with-jadu-coup.vercel.app";

// 로컬 날짜 키(UTC 오프셋 이슈 방지)
const fmt = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const STORE_KEY = "walklog-v9"; // 그대로 유지 (기존 로컬 데이터 보존)

// (추후 교체) 초복이 사진 세트 매핑
const dogImages = {
  verylow: "/dog-temp.png", 
  low: "/dog-temp.png",
  mid: "/dog-temp.png",
  high: "/dog-temp.png",
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
      <div
        className="max-w-sm mx-auto p-5 flex flex-col items-center relative"
        style={{ paddingBottom: "10px" }}  // 하단 광고 제거 → 여유 패딩만 유지
      >

        {/* 🎨 팔레트 + C 이모티콘 링크 */}
        <div className="absolute top-3 right-3 flex items-center gap-3">
          <a
            href={COUPANG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg hover:opacity-80"
            title="쿠팡 링크"
            aria-label="쿠팡 링크"
          >
            C
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

        {/* 이하 내용 동일 (생략)… */}
      </div>
    </div>
  );
}




