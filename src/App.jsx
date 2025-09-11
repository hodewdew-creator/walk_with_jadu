<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
  <title>walk_with_puppy · 소개 & 안내</title>
  <meta name="description" content="강아지 보호자용 산책 기록 앱 walk_with_puppy 소개 및 사용법, 광고 안내 페이지입니다." />

  <!-- Open Graph -->
  <meta property="og:title" content="walk_with_jadu · 소개 & 안내" />
  <meta property="og:description" content="강아지 보호자용 산책 기록 앱 소개 / 사용법 / 쿠팡 파트너스 안내" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="/og-image.png" />

  <style>
    :root{
      --bg:#0b1220; --fg:#0f172a; --muted:#64748b;
      --brand:#38bdf8; --brand-dark:#0ea5b8; --card:#ffffff;
      --border:#e5e7eb; --accent:#f8fafc;
    }
    *{box-sizing:border-box}
    html,body{margin:0; height:100%; background:#f6fafc; color:var(--fg); font-family:system-ui,-apple-system,Segoe UI,Roboto,Apple SD Gothic Neo,Noto Sans KR,sans-serif}
    a{color:var(--brand); text-decoration:none}
    a:hover{text-decoration:underline}
    .wrap{max-width:960px; margin:0 auto; padding:24px}
    .hero{
      background: linear-gradient(135deg, #e0f2fe 0%, #fafafa 100%);
      border-bottom:1px solid var(--border);
      text-align:center;
    }
    .hero-inner{max-width:960px; margin:0 auto; padding:40px 24px}
    .title{font-weight:800; font-size:28px; letter-spacing:-0.02em; color:#0f172a}
    .subtitle{margin-top:8px; color:#334155}
    .hero img{margin-top:16px; max-width:200px; border-radius:50%; box-shadow:0 4px 10px rgba(0,0,0,0.1)}
    .grid{display:grid; gap:16px}
    @media(min-width:768px){ .grid-2{grid-template-columns:1fr 1fr} }
    .card{
      background:var(--card); border:1px solid var(--border); border-radius:16px; padding:18px; box-shadow:0 2px 10px rgba(0,0,0,.04);
    }
    .card h3{margin:0 0 6px; font-size:18px}
    .card p{margin:6px 0; color:#334155; line-height:1.55}
    .list{margin:10px 0 0 16px}
    .list li{margin:6px 0}
    .note{font-size:13px; color:#475569}
    .disclosure{
      margin-top:24px; padding:14px; border-radius:12px;
      background:#fff; border:1px dashed #cbd5e1; color:#0f172a;
    }
    .ad-box{
      border:1px solid var(--border); border-radius:14px; padding:10px; background:#fff; text-align:center;
    }
    .ad-box iframe{max-width:468px; width:100%; height:60px; margin:0 auto; display:block}
    .footer{margin:40px 0 24px; text-align:center; color:#64748b; font-size:12px}
    .pill{display:inline-block; background:#ecfeff; color:#0e7490; border:1px solid #a5f3fc; padding:4px 8px; border-radius:999px; font-size:12px; font-weight:700}
  </style>
</head>
<body>

  <!-- HERO -->
  <header class="hero">
    <div class="hero-inner">
      <div class="title">walk_with_jadu <span class="pill">강아지 보호자용</span></div>
      <div class="subtitle">강아지와의 산책을 간단하고 즐겁게 기록해요. 목표(예: 8000보) 달성, 비 온 날/제외 처리 등 일상에 꼭 맞춘 가벼운 기록 도구입니다.</div>
      <img src="/images/hero-dog-320.jpg" alt="강아지 사진" />
    </div>
  </header>

  <!-- 소개 -->
  <main class="wrap">
    <!-- 스크린샷 섹션 -->
    <section class="card" style="margin-top:16px; text-align:center;">
      <h3>앱 스크린샷</h3>
      <p class="note">아래 이미지는 실제 앱 화면 예시입니다.</p>
      <div style="display:grid; gap:16px; grid-template-columns:1fr; place-items:center;">
        <img src="/images/app-capture-320x600.jpg" alt="앱 캡처" style="width:320px; height:600px; object-fit:cover; border-radius:16px; border:1px solid var(--border); box-shadow:0 4px 10px rgba(0,0,0,.06)" />
      </div>
    </section>
    <section class="grid grid-2">
      <div class="card">
        <h3>앱 소개</h3>
        <p><b>walk_with_jadu</b>는 “간단하지만 꼭 필요한 산책 기록”에 집중한 웹앱입니다.</p>
        <ul class="list">
          <li>오늘 걸음수 표시(원형 UI) + 층수</li>
          <li>월간 달력: 달성/2배달성/미달/제외/비 표시</li>
          <li>미달일 <b>더블탭 → 비</b>, 달성 전 <b>길게 눌러서 → 제외</b> 등 직관적인 제스처</li>
          <li>테마 색상 커스터마이즈, 로컬 저장(localStorage)</li>
        </ul>
      </div>

      <div class="card">
        <h3 id="howto">사용법</h3>
        <p>메인 화면 상단의 원은 <b>오늘 걸음수</b>입니다. ✏️ 아이콘으로 수동 입력이 가능하고, 월 단위 달력에는 각 날짜의 상태가 색상/아이콘으로 표시됩니다.</p>
        <ul class="list">
          <li><b>미달(회색)</b> 상태에서 날짜를 <b>더블탭</b> → <b>비</b>로 표기</li>
          <li><b>달성 전</b> 날짜를 <b>길게 누르기(0.5초)</b> → <b>제외</b> 전환</li>
          <li><b>달성(파랑)</b>, <b>2배달성(진한 파랑)</b>은 자동 계산</li>
          <li>오른쪽 위 <b>🎨</b>로 테마 색을 바꿀 수 있어요.</li>
        </ul>
        <p class="note">* 앱은 브라우저에 데이터를 저장합니다. 기기 변경 시 기록이 이동되지 않아요.</p>
      </div>
    </section>

    <!-- 광고/승인용 섹션 -->
    <section class="card" id="ad" style="margin-top:16px;">
      <h3>쿠팡 파트너스 안내</h3>
      <p class="note">아래 배너는 쿠팡 파트너스 프로그램 광고입니다.</p>

      <!-- 배너 영역 -->
      <div class="ad-box">
        <!-- 고정 320x480 배너 (스크립트 불필요) -->
        <a href="https://link.coupang.com/a/cQcw8V" target="_blank" rel="nofollow sponsored noopener" style="display:inline-block;">
          <img src="https://ads-partners.coupang.com/banners/920634?subId=&traceId=V0-301-7e6e8eb8ddfa1bfb-I920634&w=320&h=480" alt="쿠팡 배너" width="320" height="480" style="width:320px;height:480px;border-radius:12px;border:1px solid var(--border);" />
        </a>
      </div>

      <!-- 고지문 -->
      <div class="disclosure">
        <strong>광고 고지</strong><br/>
        본 페이지의 일부 링크는 <b>쿠팡 파트너스</b> 활동을 통해 일정액의 수수료를 제공받을 수 있습니다. (이용자 부담 추가 비용 없음)
      </div>
    </section>

    <div class="footer">© 2025 walk_with_jadu</div>
  </main>

  <script>
    const COUPANG_LINK = "https://COUPANG_LINK_HERE"; // TODO: 실제 파트너스 링크로 교체
    const frame = document.getElementById("coupangFrame");
    try { if(frame) frame.src = COUPANG_LINK; } catch(e){}
  </script>
</body>
</html>

