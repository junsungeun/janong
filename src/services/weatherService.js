// 농촌진흥청 농업기상 일반 관측데이터 V3 — 자농(JANONG)
// 엔드포인트: V3/GnrlWeather/getWeatherTimeList3
// 응답 형식: XML  /  날짜 파라미터: date_Time (yyyy-MM-dd)

const BASE_URL =
  'https://apis.data.go.kr/1390802/AgriWeather/WeatherObsrInfo/V3/GnrlWeather/getWeatherTimeList3';

// ── Mock 날씨 데이터 (호출 실패 시 fallback) ──────────────────────────
export const mockWeather = {
  temp:  18.5,
  rh:    68.2,
  re:    0.0,
  ws:    1.8,
  si:    520.3,
  ms10:  35.6,
  ts5:   16.2,
  wd:    180,
  isMock: true,
};

// ── 날씨 조건 → 자연농업 추천 매핑 ────────────────────────────────────
export const getNaturalFarmingAdvice = (w) => {
  const advice = [];
  const { temp, rh, re, si, ms10 } = w;

  if (rh >= 85) {
    advice.push({
      icon: '🦠', title: '토착미생물 살포 적기',
      reason: `습도 ${Math.round(rh)}% — 희석배율 높여 살포 권장`, type: 'good',
    });
  }
  if (re > 5) {
    advice.push({
      icon: '🌿', title: '비 오기 전 엽면살포 권장',
      reason: `강수량 ${re.toFixed(1)}mm — 천혜녹즙 엽면살포 후 비 맞히면 효과↑`, type: 'good',
    });
  }
  if (temp < 10) {
    advice.push({
      icon: '🌡', title: '미생물 활동 둔화 주의',
      reason: `기온 ${temp}°C — 토착미생물 투입 보류, 보온 처리 검토`, type: 'warning',
    });
  }
  if (temp >= 25 && si > 500) {
    advice.push({
      icon: '☀', title: '고온·강광 스트레스 완화',
      reason: `기온 ${temp}°C, 강한 일사 — 한방영양제 희석 살포 권장`, type: 'warning',
    });
  }
  if (ms10 !== null && ms10 < 20) {
    advice.push({
      icon: '💧', title: '토양수분 부족',
      reason: `토양수분 ${ms10}% — 관수 필요, 멀칭 상태 점검`, type: 'warning',
    });
  }
  if (ms10 !== null && ms10 > 70) {
    advice.push({
      icon: '🌊', title: '과습 주의',
      reason: `토양수분 ${ms10}% — 배수로 점검, 뿌리 산소 공급 확인`, type: 'warning',
    });
  }
  if (rh >= 60 && rh < 85 && temp >= 15 && temp < 25 && re === 0) {
    advice.push({
      icon: '🌿', title: '천혜녹즙 엽면살포 적기',
      reason: `습도 ${Math.round(rh)}%, 기온 ${temp}°C — 흡수 최적 조건`, type: 'good',
    });
  }
  if (advice.length === 0) {
    advice.push({
      icon: '✅', title: '오늘은 관찰과 기록에 집중하세요',
      reason: '특별한 기상 조건 없음. 작물 상태 꼼꼼히 살피는 날', type: 'good',
    });
  }
  return advice.slice(0, 3);
};

// ── 풍향 코드 → 한글 ─────────────────────────────────────────────────
const windDir = (deg) => {
  if (deg === null || deg === undefined) return '-';
  const dirs = ['북','북북동','북동','동북동','동','동남동','남동','남남동',
                '남','남남서','남서','서남서','서','서북서','북서','북북서'];
  return dirs[Math.round(deg / 22.5) % 16];
};

// ── 오늘 날짜 yyyy-MM-dd ─────────────────────────────────────────────
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ── XML에서 태그 값 추출 ─────────────────────────────────────────────
const getXmlVal = (doc, tag) => {
  const el = doc.querySelector(tag);
  return el ? el.textContent.trim() : null;
};

// ── 메인 API 호출 (XML 파싱) ─────────────────────────────────────────
export const fetchWeather = async (stationCode, apiKey) => {
  if (!stationCode || !apiKey) {
    return { ...mockWeather, isMock: true };
  }

  try {
    const params = new URLSearchParams({
      serviceKey:   apiKey,
      obsr_Spot_Cd: stationCode,
      date_Time:    todayStr(),
      Page_No:      '1',
      Page_Size:    '24',   // 하루 최대 24시간
    });

    const response = await fetch(`${BASE_URL}?${params}`, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const xml  = await response.text();
    const parser = new DOMParser();
    const doc    = parser.parseFromString(xml, 'text/xml');

    // 결과코드 확인
    const code = getXmlVal(doc, 'result_Code');
    if (code !== '200') {
      throw new Error(`API 오류 코드: ${code} — ${getXmlVal(doc, 'result_Msg')}`);
    }

    // 가장 최근 시간 데이터 (마지막 item)
    const items = doc.querySelectorAll('item');
    if (!items.length) throw new Error('데이터 없음');
    const last = items[items.length - 1];

    const g = (tag) => {
      const el = last.querySelector(tag);
      return el ? el.textContent.trim() : null;
    };

    // 필드 매핑
    // temp      = 기온 (°C)
    // hum       = 습도 (%)
    // rn        = 강수량 (mm)
    // wind      = 풍속 (m/s)
    // widdir    = 풍향 (°)
    // soil_Wt   = 토양수분 (%)
    // gr_Temp   = 지중온도 (°C)
    // srqty     = 일사량 (MJ/m²)
    // date      = 관측시각 (yyyy-MM-dd HH:mm)
    return {
      temp:       parseFloat(g('temp'))     || 0,
      rh:         parseFloat(g('hum'))      || 0,
      re:         parseFloat(g('rn'))       || 0,
      ws:         parseFloat(g('wind'))     || 0,
      si:         parseFloat(g('srqty'))    || 0,
      ms10:       g('soil_Wt') ? parseFloat(g('soil_Wt'))  : null,
      ts5:        g('gr_Temp') ? parseFloat(g('gr_Temp'))  : null,
      wd:         parseFloat(g('widdir'))   || 0,
      windDir:    windDir(parseFloat(g('widdir'))),
      observedAt: g('date') || '',
      isMock:     false,
    };

  } catch (err) {
    console.warn('[JANONG] 날씨 API 오류, Mock 데이터 사용:', err.message);
    return { ...mockWeather, isMock: true };
  }
};
