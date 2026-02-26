// Gemini API 서비스 — 자농(JANONG) 자연농업 전용
// 모델: gemini-1.5-flash (무료, 이미지 분석 지원)
// 화학농약·화학비료는 절대 언급 금지

const BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// ── 자연농업 핵심 규칙 (모든 프롬프트에 적용) ─────────────────────────
const NATURAL_FARMING_RULE = `
반드시 지켜야 할 규칙:
- 화학농약, 화학비료, 제초제는 절대 언급 금지
- 자연농업, 유기농 방식의 해결책만 제안
- 토착미생물, 천연농자재, 환경 개선 관점으로만 평가
- 한국 자연농업(KNF) 원칙 기반으로 답변
`;

// ── 작물 성장 분석 프롬프트 ──────────────────────────────────────────
const CROP_ANALYSIS_PROMPT = `너는 한국 자연농업(KNF) 전문 컨설턴트야.
이 작물 사진을 보고 생태적 건강 상태를 분석해줘.
${NATURAL_FARMING_RULE}
출력 형식 (마크다운 없이 아래 형식 그대로 사용):
🌱 작물 상태: [한 줄 요약]
📊 생태 건강도: [좋음/보통/주의]
💡 관찰 포인트:
  - [포인트 1]
  - [포인트 2]
  - [포인트 3]
🌿 자연농업 조언:
  - [조언 1]
  - [조언 2]`;

// ── 병해충 진단 프롬프트 ─────────────────────────────────────────────
const PEST_DIAGNOSIS_PROMPT = `너는 한국 자연농업(KNF) 병해충 전문가야.
이 사진의 작물에서 병해충 또는 이상 증상을 진단해줘.
${NATURAL_FARMING_RULE}
출력 형식 (마크다운 없이 아래 형식 그대로 사용):
📍 진단 결과: [병해충명 또는 이상 증상]
📋 발생 원인: [생태적 불균형 관점 설명]
🌿 자연농업 방제법:
  1. [방법 1]
  2. [방법 2]
  3. [방법 3]
⚠️ 주의사항: [있으면 기재, 없으면 '해당 없음']`;

// ── 텍스트 전용 Gemini 호출 ──────────────────────────────────────────
const callGeminiText = async (prompt, apiKey) => {
  if (!apiKey) throw new Error('API_KEY_MISSING');

  const res = await fetch(`${BASE_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

// ── 이슈 해결 조언 프롬프트 ──────────────────────────────────────────
const makeIssuePrompt = ({ title, content, crop }) => `
너는 한국 자연농업(KNF) 전문 컨설턴트야.
아래 농장 이슈에 대해 자연농업 관점의 해결 방법을 알려줘.
${NATURAL_FARMING_RULE}

이슈 정보:
- 작물: ${crop || '미지정'}
- 제목: ${title}
- 증상/내용: ${content || '추가 정보 없음'}

출력 형식 (마크다운 없이 아래 형식 그대로):
📍 원인 분석: [생태적 불균형 관점 설명]
🌿 자연농업 해결법:
  1. [즉시 할 일]
  2. [단기 처치]
  3. [근본 개선]
⚠️ 주의사항: [있으면 기재, 없으면 '없음']
✅ 예방 포인트: [재발 방지 팁]
`.trim();

// ── 파일 → base64 변환 ───────────────────────────────────────────────
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ── Gemini API 공통 호출 ─────────────────────────────────────────────
const callGemini = async (base64Image, mimeType, prompt, apiKey) => {
  if (!apiKey) throw new Error('API_KEY_MISSING');

  const res = await fetch(`${BASE_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType || 'image/jpeg', data: base64Image } },
        ],
      }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 1024 },
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

// ── 공개 API ─────────────────────────────────────────────────────────
export const analyzeCrop = async (file, apiKey) => {
  const b64 = await toBase64(file);
  return callGemini(b64, file.type, CROP_ANALYSIS_PROMPT, apiKey);
};

export const diagnosePest = async (file, apiKey) => {
  const b64 = await toBase64(file);
  return callGemini(b64, file.type, PEST_DIAGNOSIS_PROMPT, apiKey);
};

export const adviseIssue = async (issue, apiKey) => {
  return callGeminiText(makeIssuePrompt(issue), apiKey);
};

// ── Mock 응답 (API 키 없을 때 표시) ─────────────────────────────────
export const MOCK_CROP_ANALYSIS = `🌱 작물 상태: 전반적으로 건강한 성장 중
📊 생태 건강도: 좋음
💡 관찰 포인트:
  - 잎색이 진하고 광택 있어 광합성 활발
  - 줄기 굵기 균형적, 웃자람 없음
  - 절간 간격 적당, 도장 없음
🌿 자연농업 조언:
  - 현재 상태 유지, 토착미생물 주 1회 관수 병행 추천
  - 한방영양제 500배 희석 엽면살포로 면역력 강화`;

export const MOCK_ISSUE_ADVICE = `📍 원인 분석: 과습 또는 질소 과잉으로 인한 생태 불균형 가능성
🌿 자연농업 해결법:
  1. 토착미생물 관수로 토양 생태 회복 (즉시)
  2. 목초액 500배 엽면살포로 면역 강화 (3일 간격)
  3. 멀칭 정비 및 배수로 점검으로 근본 환경 개선
⚠️ 주의사항: 증상 악화 시 인근 작물로 전파 가능, 조기 격리 검토
✅ 예방 포인트: 정기적인 토착미생물 투입과 한방영양제로 작물 면역력 유지`;

export const MOCK_PEST_DIAGNOSIS = `📍 진단 결과: 진딧물 (추정)
📋 발생 원인: 과질소 공급, 밀식으로 인한 통풍 불량으로 생태 불균형 발생
🌿 자연농업 방제법:
  1. 님오일 1000배 희석 엽면살포 (3일 간격 2~3회)
  2. 마늘·고추 천연농약 제조 후 살포
  3. 천적(무당벌레) 서식 환경 조성 — 꽃 혼식재배 권장
⚠️ 주의사항: 비 예보 없는 날 오전 이른 시간 살포 권장`;
