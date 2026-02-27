// JANONG — Nongsaro Proxy Edge Function
// 농사로 OpenAPI를 서버 사이드에서 호출해 CORS 문제를 우회한다
// 지원 엔드포인트: /weeklyFarming, /cropGrwStndInfo, /varietyInfo 등

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://api.nongsaro.go.kr/service';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const url      = new URL(req.url);
    const apiKey   = url.searchParams.get('apiKey') || '';
    const endpoint = url.searchParams.get('endpoint') || ''; // ex) weeklyFarming/weeklyFarmingList

    if (!apiKey || !endpoint) {
      return new Response(
        JSON.stringify({ error: '필수 파라미터 없음 (apiKey, endpoint)' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    // endpoint 외 나머지 파라미터 전달 (apiKey, endpoint 제외)
    const forward = new URLSearchParams();
    forward.set('apiKey', apiKey);
    forward.set('format', url.searchParams.get('format') || 'json');
    for (const [key, val] of url.searchParams.entries()) {
      if (key !== 'apiKey' && key !== 'endpoint' && key !== 'format') {
        forward.set(key, val);
      }
    }

    const target = `${BASE_URL}/${endpoint}?${forward}`;
    const apiRes = await fetch(target);

    if (!apiRes.ok) throw new Error(`농사로 API HTTP ${apiRes.status}`);

    const text = await apiRes.text();

    return new Response(text, {
      headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
});
