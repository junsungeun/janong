// JANONG — Weather Proxy Edge Function
// 농촌진흥청 농업기상 API를 서버 사이드에서 호출해 CORS 문제를 우회한다

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://apis.data.go.kr/1390802/AgriWeather/WeatherObsrInfo/V3/GnrlWeather/getWeatherTimeList3';

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const url    = new URL(req.url);
    const apiKey = url.searchParams.get('serviceKey') || '';
    const station = url.searchParams.get('obsr_Spot_Cd') || '';
    const date    = url.searchParams.get('date_Time') || '';

    if (!apiKey || !station || !date) {
      return new Response(
        JSON.stringify({ error: '필수 파라미터 없음 (serviceKey, obsr_Spot_Cd, date_Time)' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    const target = new URL(BASE_URL);
    target.searchParams.set('serviceKey',   apiKey);
    target.searchParams.set('obsr_Spot_Cd', station);
    target.searchParams.set('date_Time',    date);
    target.searchParams.set('Page_No',      '1');
    target.searchParams.set('Page_Size',    '24');

    // 서버 사이드 호출 — CORS 없음
    const apiRes = await fetch(target.toString());

    if (!apiRes.ok) {
      throw new Error(`농업기상 API HTTP ${apiRes.status}`);
    }

    const xml = await apiRes.text();

    return new Response(xml, {
      headers: { ...CORS, 'Content-Type': 'application/xml; charset=utf-8' },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
});
