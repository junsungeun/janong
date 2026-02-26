// 자농(JANONG) 작물별 재배 타임라인 — 자연농업(KNF) 기준
// 화학비료 → 천혜녹즙/한방영양제, 농약 → 토착미생물/천연방제로 전환

export const SUPPORTED_CROPS = [
  '고추', '토마토', '오이', '가지', '배추', '무', '상추', '시금치',
  '감자', '고구마', '옥수수', '콩', '딸기', '수박', '참외', '기타',
];

// days: 파종/정식일 기준 경과일
const TIMELINES = {
  '고추': [
    { days: 7,   icon: '🌱', label: '활착 확인',             note: '시든 잎은 제거, 충분한 수분. 직사광선 차광' },
    { days: 14,  icon: '🦠', label: '토착미생물 1차 관수',   note: '500배 희석 관수 — 뿌리 균형 잡기' },
    { days: 21,  icon: '🌿', label: '1차 웃거름',            note: '천혜녹즙 300배 엽면살포. 성장 촉진' },
    { days: 35,  icon: '✂️', label: '곁순 제거 + 유인',      note: '2~3줄기 유인끈 설치. 첫 꽃 아래 곁순 전부 제거' },
    { days: 50,  icon: '🌸', label: '개화기 — 면역 강화',   note: '한방영양제 500배 엽면살포. 수분 상태 점검' },
    { days: 65,  icon: '🫑', label: '착과기 — 칼슘 보충',   note: '천혜녹즙 + 한방영양제 혼합 500배 살포' },
    { days: 90,  icon: '🌶', label: '초기 수확 시작',        note: '청고추 수확 시작. 과숙 전 적기 수확' },
    { days: 120, icon: '🔴', label: '홍고추 성수기 수확',    note: '주 2~3회 수확. 착색 좋은 것부터 선별' },
  ],
  '토마토': [
    { days: 7,   icon: '🌱', label: '활착 확인',             note: '식재 후 충분한 수분. 저온 야간 보온' },
    { days: 14,  icon: '🦠', label: '토착미생물 관수',       note: '500배 희석 — 뿌리 활성 유도' },
    { days: 21,  icon: '✂️', label: '곁순 제거 + 1줄기 유인', note: '원줄기 1줄기로 관리. 곁순 조기 제거' },
    { days: 35,  icon: '🌿', label: '1차 웃거름',            note: '천혜녹즙 300배 엽면살포' },
    { days: 50,  icon: '🌸', label: '개화기 — 수분 관리',   note: '진동 수분 또는 벌 활용. 과습 금지' },
    { days: 65,  icon: '🍅', label: '착과기 — 적과',         note: '1화방 3~4개 남기고 적과. 균일 착과 유도' },
    { days: 80,  icon: '🌿', label: '2차 웃거름',            note: '한방영양제 + 천혜녹즙 혼합 500배' },
    { days: 100, icon: '🔴', label: '수확 시작',             note: '착색 80~90% 시 수확. 저장성 고려' },
  ],
  '오이': [
    { days: 5,   icon: '🌱', label: '활착 확인',             note: '고온 주의. 오전 관수. 뿌리 건조 금지' },
    { days: 14,  icon: '✂️', label: '지주 설치 + 유인',      note: '주지 유인끈 설치. 하위 곁순 제거' },
    { days: 21,  icon: '🦠', label: '토착미생물 관수',       note: '뿌리 균형. 600배 희석' },
    { days: 30,  icon: '🌸', label: '개화 — 환기 관리',      note: '환기 원활히. 습도 70% 이상 유지' },
    { days: 40,  icon: '🥒', label: '초기 수확',             note: '20cm 내외 수확. 작은 것부터 수확해 부담 경감' },
    { days: 55,  icon: '🌿', label: '웃거름 + 미생물 살포',  note: '천혜녹즙 300배 + 토착미생물 병행' },
    { days: 70,  icon: '🥒', label: '성수기 수확',           note: '매일 수확 필요. 과숙 방지' },
  ],
  '가지': [
    { days: 7,   icon: '🌱', label: '활착 확인',             note: '충분한 관수. 바람 막기' },
    { days: 21,  icon: '✂️', label: '곁순 정리 + 지주',      note: '2~3줄기 유인. 불필요 곁순 제거' },
    { days: 35,  icon: '🌿', label: '1차 웃거름',            note: '천혜녹즙 400배 엽면살포' },
    { days: 50,  icon: '🌸', label: '개화기 관리',           note: '한방영양제 500배. 꽃 건강 확인' },
    { days: 65,  icon: '🍆', label: '수확 시작',             note: '과장 10~15cm, 광택 있을 때 수확' },
    { days: 90,  icon: '✂️', label: '갱신전정 고려',         note: '노화 가지 자르고 새 가지 유도 가능' },
  ],
  '배추': [
    { days: 10,  icon: '🌱', label: '활착 + 솎음',           note: '겉흙 건조 시 관수. 약한 모 제거' },
    { days: 20,  icon: '🦠', label: '토착미생물 관수',       note: '뿌리 활성화. 500배 희석' },
    { days: 30,  icon: '🌿', label: '1차 웃거름',            note: '천혜녹즙 300배 엽면살포. 포기 형성 지원' },
    { days: 45,  icon: '🥬', label: '결구 시작',             note: '외엽 성장 확인. 결구 불량 시 칼슘 보충' },
    { days: 55,  icon: '🌿', label: '2차 웃거름',            note: '한방영양제 500배 + 토착미생물 관수' },
    { days: 70,  icon: '🥬', label: '수확',                  note: '결구 단단히 찼는지 눌러 확인 후 수확' },
  ],
  '무': [
    { days: 10,  icon: '🌱', label: '솎음 작업',             note: '본엽 2~3장 시 1포기 남기고 솎음' },
    { days: 20,  icon: '🦠', label: '토착미생물 관수',       note: '뿌리 비대 초기 — 미생물 활성 필수' },
    { days: 30,  icon: '🌿', label: '웃거름',                note: '천혜녹즙 300배 엽면살포' },
    { days: 50,  icon: '🌿', label: '2차 웃거름',            note: '한방영양제 + 천혜녹즙 혼합 500배' },
    { days: 65,  icon: '🥕', label: '수확 확인',             note: '어깨 부분 3cm 이상 노출 시 수확 적기' },
  ],
  '상추': [
    { days: 7,   icon: '🌱', label: '활착 확인',             note: '반음지 조건 유지. 고온 주의' },
    { days: 14,  icon: '🦠', label: '토착미생물 관수',       note: '600배 희석. 뿌리 균형' },
    { days: 21,  icon: '🥬', label: '초기 수확 가능',        note: '외엽 수확법 — 아래 잎부터 4~5장씩' },
    { days: 35,  icon: '🌿', label: '웃거름',                note: '천혜녹즙 400배 엽면살포' },
    { days: 50,  icon: '🥬', label: '지속 수확',             note: '추대(꽃대) 발생 전 집중 수확' },
  ],
  '시금치': [
    { days: 10,  icon: '🌱', label: '솎음',                  note: '포기 간격 5~7cm 확보' },
    { days: 20,  icon: '🦠', label: '미생물 관수',           note: '500배 희석 관수' },
    { days: 30,  icon: '🌿', label: '웃거름',                note: '천혜녹즙 400배 엽면살포' },
    { days: 40,  icon: '🥬', label: '수확',                  note: '초장 20cm 내외 수확. 뿌리째 또는 잎 수확' },
  ],
  '감자': [
    { days: 14,  icon: '🌱', label: '출아 확인',             note: '맹아 나오면 복토 추가. 서리 주의' },
    { days: 28,  icon: '✂️', label: '싹따기 (적아)',          note: '줄기 2~3개만 남기고 나머지 제거' },
    { days: 40,  icon: '🌿', label: '웃거름 + 배토',         note: '천혜녹즙 300배. 줄기 주변 흙 올리기' },
    { days: 55,  icon: '🌸', label: '개화기',                note: '꽃 제거로 덩이줄기 비대 집중. 미생물 관수' },
    { days: 90,  icon: '🥔', label: '수확 준비',             note: '지상부 황변 시 수확 적기. 맑은 날 수확' },
  ],
  '고구마': [
    { days: 14,  icon: '🌱', label: '활착 확인',             note: '시든 잎 정상. 뿌리 내리면 회복됨' },
    { days: 30,  icon: '🌿', label: '덩굴 유인',             note: '덩굴 한 방향 정리. 기생뿌리 제거' },
    { days: 50,  icon: '🦠', label: '토착미생물 관수',       note: '뿌리 비대 지원. 500배 희석' },
    { days: 70,  icon: '🌿', label: '웃거름',                note: '천혜녹즙 300배 엽면살포' },
    { days: 120, icon: '🍠', label: '수확',                  note: '서리 전 수확. 굴취 후 통풍 건조' },
  ],
  '옥수수': [
    { days: 10,  icon: '🌱', label: '솎음',                  note: '2~3포기 중 1포기 남기기' },
    { days: 25,  icon: '🌿', label: '1차 웃거름',            note: '천혜녹즙 300배 + 미생물 관수' },
    { days: 40,  icon: '🌽', label: '수염 발생',             note: '수분 완료 확인. 과습 주의' },
    { days: 55,  icon: '🌽', label: '수확 적기',             note: '수염 갈색화 후 2~3주. 눌러서 즙 나오면 수확' },
  ],
  '콩': [
    { days: 10,  icon: '🌱', label: '발아 확인',             note: '발아율 낮으면 보식' },
    { days: 25,  icon: '✂️', label: '순지르기 (선택)',        note: '2~3마디서 적심 — 분지 발달' },
    { days: 40,  icon: '🦠', label: '미생물 관수',           note: '근류균 활성화 지원. 자연 질소 공급' },
    { days: 60,  icon: '🌸', label: '개화기 — 건조 주의',   note: '개화 시 충분한 수분. 천혜녹즙 살포' },
    { days: 90,  icon: '🌿', label: '협 비대기',             note: '한방영양제 500배. 과습 금지' },
    { days: 110, icon: '🫘', label: '수확',                  note: '잎 노랗게 + 꼬투리 갈색화 시 수확' },
  ],
  '딸기': [
    { days: 14,  icon: '🌱', label: '활착 + 크라운 확인',   note: '크라운 위치 지면과 맞게. 저온 적정 여부 확인' },
    { days: 28,  icon: '🦠', label: '토착미생물 관수',       note: '뿌리 활성화. 500배 희석' },
    { days: 45,  icon: '🌸', label: '개화기',                note: '보조 수분 필요(벌 or 붓). 한방영양제 살포' },
    { days: 60,  icon: '🍓', label: '착과기 — 칼슘 보충',   note: '천혜녹즙 400배 엽면살포' },
    { days: 75,  icon: '🍓', label: '수확 시작',             note: '착색 90% 이상 시 수확. 꼭지 포함 수확' },
    { days: 90,  icon: '🌿', label: '런너 관리',             note: '런너 제거로 모체 수량 집중. 자묘 받을 것만 남김' },
  ],
  '수박': [
    { days: 10,  icon: '🌱', label: '활착 확인',             note: '충분한 수분. 저온 야간 보온' },
    { days: 25,  icon: '✂️', label: '순지르기 + 덩굴 유인',  note: '본잎 5~6장에 적심. 자지 2~3개 유인' },
    { days: 40,  icon: '🌸', label: '개화기 — 착과 관리',   note: '18~20마디 꽃 착과. 오전 10시 전 인공수분' },
    { days: 55,  icon: '🍉', label: '착과 확인',             note: '착과 후 안정 여부 확인. 수분 균일 공급' },
    { days: 80,  icon: '🍉', label: '수확 판단',             note: '수분 후 35~40일. 덩굴손 마름 + 두드려서 확인' },
  ],
  '참외': [
    { days: 10,  icon: '🌱', label: '활착 + 보온',           note: '야간 15°C 이상 유지. 충분한 관수' },
    { days: 21,  icon: '✂️', label: '순지르기',              note: '본엽 4~5장에 적심. 아들덩굴 2~3개 남김' },
    { days: 35,  icon: '🌸', label: '착과 관리',             note: '손자덩굴 2~3마디 암꽃 착과. 인공수분' },
    { days: 50,  icon: '🍈', label: '착과 확인',             note: '비정형과 조기 제거. 착과 성공 여부 확인' },
    { days: 70,  icon: '🍈', label: '수확 판단',             note: '착과 후 25~30일. 향기 + 노란색 발현 시' },
  ],
};

// ── 정식일 기준 타임라인 생성 ─────────────────────────────────────────
export const getCropTimeline = (cropName, plantingDate) => {
  const base  = TIMELINES[cropName] || [];
  const start = new Date(plantingDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return base.map((item) => {
    const target = new Date(start);
    target.setDate(start.getDate() + item.days);
    target.setHours(0, 0, 0, 0);

    const diff = Math.round((target - today) / 86400000);
    return {
      ...item,
      date:        target.toISOString().slice(0, 10),
      daysFromNow: diff,
      isPast:      diff < 0,
      isToday:     diff === 0,
      isSoon:      diff > 0 && diff <= 7,
    };
  });
};

// ── 파종 후 경과일 계산 ─────────────────────────────────────────────
export const daysSincePlanting = (plantingDate) => {
  const start = new Date(plantingDate);
  const today = new Date();
  return Math.max(0, Math.round((today - start) / 86400000));
};
