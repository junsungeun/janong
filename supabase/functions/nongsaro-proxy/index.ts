// JANONG — Nongsaro Proxy Edge Function
// 농사로 OpenAPI를 서버 사이드에서 호출해 CORS 문제를 우회한다
// XML 응답을 JSON으로 변환해서 클라이언트로 반환한다

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://api.nongsaro.go.kr/service';

// XML 단일 태그 값 추출 (CDATA 처리 포함)
function getTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`);
  const m  = xml.match(re);
  return m ? m[1].trim() : '';
}

// <item>...</item> 블록들을 객체 배열로 변환
function parseItems(xml: string): Record<string, string>[] {
  const items: Record<string, string>[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;

  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const obj: Record<string, string> = {};
    const tagRe = /<([A-Za-z_][A-Za-z0-9_]*)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/\1>/g;
    let t: RegExpExecArray | null;
    while ((t = tagRe.exec(block)) !== null) {
      obj[t[1]] = t[2].trim();
    }
    items.push(obj);
  }
  return items;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const url      = new URL(req.url);
    const apiKey   = url.searchParams.get('apiKey') || '';
    const endpoint = url.searchParams.get('endpoint') || '';

    if (!apiKey || !endpoint) {
      return new Response(
        JSON.stringify({ error: '필수 파라미터 없음 (apiKey, endpoint)' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    // endpoint·apiKey·format 제외한 나머지 파라미터 전달
    const forward = new URLSearchParams();
    forward.set('apiKey', apiKey);
    for (const [key, val] of url.searchParams.entries()) {
      if (key !== 'apiKey' && key !== 'endpoint' && key !== 'format') {
        forward.set(key, val);
      }
    }

    const target = `${BASE_URL}/${endpoint}?${forward}`;
    const apiRes = await fetch(target);
    if (!apiRes.ok) throw new Error(`농사로 API HTTP ${apiRes.status}`);

    const xml        = await apiRes.text();
    const resultCode = getTag(xml, 'resultCode');
    const resultMsg  = getTag(xml, 'resultMsg');

    if (resultCode !== '00') {
      return new Response(
        JSON.stringify({ resultCode, resultMsg, body: { items: { item: [] } } }),
        { headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    const items = parseItems(xml);

    return new Response(
      JSON.stringify({ resultCode, resultMsg, body: { items: { item: items } } }),
      { headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' } }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
});
