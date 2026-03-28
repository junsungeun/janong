// 기상청 초단기실황 API — 현재 기온/습도/강수 자동 조회
// GPS 기반으로 현재 위치의 실시간 날씨 가져오기

import { gpsToGrid } from '../utils/gpsToGrid';
import { CONFIG } from '../config';

const API_KEY = CONFIG.WEATHER_API_KEY;

// sky 코드 텍스트 변환 (단기예보 기준 — 초단기실황에는 SKY 없어 PTY 기반 파생)
// 1=맑음, 3=구름많음, 4=흐림
export const getSkyText = (sky) => {
  const map = { 1: '맑음', 3: '구름많음', 4: '흐림' };
  return map[sky] || '';
};
const BASE_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';

// 현재 위치 가져오기
const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('GPS 미지원'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 10000, maximumAge: 300000 }
    );
  });

// 발표 시각 계산 (매 정시, 40분 이후 생성)
const getBaseDateTime = () => {
  const now = new Date();
  // 40분 전 기준으로 발표 시각 결정
  if (now.getMinutes() < 40) {
    now.setHours(now.getHours() - 1);
  }
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const time = `${String(now.getHours()).padStart(2, '0')}00`;
  return { baseDate: date, baseTime: time };
};

// 캐시 (10분간 유지 — 기상청 데이터가 정시 기준이라 자주 호출할 필요 없음)
let _weatherCache = null;
let _weatherCacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10분

// 초단기실황 조회
export const fetchCurrentWeather = async () => {
  if (_weatherCache && Date.now() - _weatherCacheTime < CACHE_TTL) {
    return _weatherCache;
  }
  try {
    const { lat, lon } = await getCurrentPosition();
    const { nx, ny } = gpsToGrid(lat, lon);
    const { baseDate, baseTime } = getBaseDateTime();

    const params = new URLSearchParams({
      serviceKey: API_KEY,
      numOfRows: '10',
      pageNo: '1',
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx: String(nx),
      ny: String(ny),
    });

    const controller = new AbortController();
    const fetchTimer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${BASE_URL}?${params}`, { signal: controller.signal }).finally(() => clearTimeout(fetchTimer));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const items = json?.response?.body?.items?.item || [];

    const data = {};
    items.forEach(item => {
      data[item.category] = parseFloat(item.obsrValue);
    });

    // 초단기실황에는 SKY 없음 — PTY 기반으로 sky 파생 (1=맑음, 4=흐림)
    const pty = data.PTY ?? 0;
    const skyDerived = pty === 0 ? 1 : 4;

    const result = {
      temp: data.T1H ?? null,       // 기온 (°C)
      rh: data.REH ?? null,         // 습도 (%)
      rain: data.RN1 ?? 0,          // 1시간 강수량 (mm)
      rainType: pty,                // 강수형태 (0:없음, 1:비, 2:비/눈, 3:눈)
      sky: skyDerived,              // 하늘상태 파생 (1=맑음, 4=흐림)
      windSpeed: data.WSD ?? null,  // 풍속 (m/s)
      windDir: data.VEC ?? null,    // 풍향 (°)
      lat,
      lon,
      nx,
      ny,
      baseDate,
      baseTime,
      fetchedAt: new Date().toISOString(),
    };
    _weatherCache = result;
    _weatherCacheTime = Date.now();
    return result;
  } catch (err) {
    console.warn('[기상청 API] 날씨 조회 실패:', err.message);
    return null;
  }
};

// 강수형태 텍스트
export const getRainTypeText = (pty) => {
  const map = { 0: '', 1: '비', 2: '비/눈', 3: '눈', 5: '빗방울', 6: '진눈깨비', 7: '눈날림' };
  return map[pty] || '';
};
