import { supabase } from '../lib/supabase';

const callGemini = async (prompt, imageBase64 = null) => {
  const body = { prompt };
  if (imageBase64) body.image = imageBase64;
  const { data, error } = await supabase.functions.invoke('gemini-proxy', { body });
  if (error) throw new Error(error.message || 'AI 분석 실패');
  return data?.result || data?.text || '';
};

const fileToBase64 = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result.split(',')[1]);
  reader.readAsDataURL(file);
});

// 온습도계 사진 → 온도/습도 추출
export const readMeter = async (imageFile) => {
  const base64 = await fileToBase64(imageFile);
  const prompt = `이 사진은 온도습도계(온습도계)입니다.
화면에 표시된 숫자를 읽어주세요.

반드시 아래 JSON 형식으로만 답해주세요:
{"temperature": 숫자, "humidity": 숫자}

숫자를 읽을 수 없으면:
{"temperature": null, "humidity": null, "error": "이유"}`;
  const text = await callGemini(prompt, base64);
  try {
    const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { temperature: null, humidity: null, error: '응답 파싱 실패' };
  }
};

// 작물 사진 → 상태 분석
export const analyzeCrop = async (imageFile) => {
  const base64 = await fileToBase64(imageFile);
  const prompt = `자연농업 전문가 관점으로 이 작물 사진을 분석해주세요.
화학농약/화학비료는 절대 언급 금지.

반드시 아래 JSON 형식으로만 답해주세요:
{"status": "좋음|보통|주의", "summary": "한 줄 요약", "details": "2-3줄 상세 관찰", "advice": "자연농업 조언 1가지"}`;
  const text = await callGemini(prompt, base64);
  try {
    const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { status: '보통', summary: text.slice(0, 100), details: text, advice: '' };
  }
};

// 병해충 진단
export const diagnosePest = async (imageFile) => {
  const base64 = await fileToBase64(imageFile);
  const prompt = `자연농업 병해충 전문가로서 이 작물 사진의 병해충을 진단해주세요.
화학농약은 절대 추천 금지. 자연농업 방제법만 제안.

반드시 아래 JSON 형식으로만 답해주세요:
{"pest": "병해충명", "cause": "발생 원인", "solutions": ["방법1", "방법2", "방법3"], "warning": "주의사항 또는 빈 문자열"}`;
  const text = await callGemini(prompt, base64);
  try {
    const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { pest: '판별 불가', cause: text, solutions: [], warning: '' };
  }
};
