// SeedLog — 판매 상품 데이터
// 청년귀농장기교육 1기 허브과정 · 2026

// ── 작물별 상세 정보 ──────────────────────────────────────────
export const CROP_INFO = {
  'blue-sage': {
    tagline: '보랏빛 꽃이 피는 향기로운 허브',
    description: '블루세이지는 라벤더처럼 보랏빛 꽃이 피며 허브 중에서도 아름다운 자태를 자랑합니다. 자연농업 방식으로 재배해 화학비료 없이 자란 건강한 작물입니다.',
    care: [
      { title: '물주기', desc: '흙이 완전히 마른 후 충분히 주세요. 주 1~2회가 적당합니다.' },
      { title: '햇빛', desc: '하루 6시간 이상 직사광선이 드는 곳에 두면 가장 잘 자랍니다.' },
      { title: '온도', desc: '10~30°C에서 잘 자랍니다. 영하 기온에서는 실내로 들여야 합니다.' },
      { title: '관리 팁', desc: '꽃이 핀 후 줄기를 1/3 정도 잘라주면 더 풍성하게 자랍니다.' },
    ],
  },
  'hot-lip-sage': {
    tagline: '빨간 입술을 닮은, 강렬한 색감의 세이지',
    description: '핫립세이지는 붉은색과 흰색이 조화를 이루는 독특한 꽃이 특징입니다. 관상용으로도 훌륭하며 허밍버드가 좋아하는 허브입니다.',
    care: [
      { title: '물주기', desc: '흙 표면이 마르면 주세요. 과습에 주의해야 합니다.' },
      { title: '햇빛', desc: '양지 혹은 반양지에서 잘 자랍니다. 직사광선도 견딥니다.' },
      { title: '온도', desc: '서늘한 기후를 좋아하며, 강한 서리는 피해야 합니다.' },
      { title: '관리 팁', desc: '꽃이 지면 바로 잘라줘야 새로운 꽃이 계속 핍니다.' },
    ],
  },
  'stevia': {
    tagline: '설탕보다 300배 단, 천연 감미료 허브',
    description: '스테비아는 천연 당으로 설탕 대체재로 널리 사용됩니다. 음료, 요리, 차에 바로 활용할 수 있어 실용적인 허브입니다.',
    care: [
      { title: '물주기', desc: '겉흙이 마르면 충분히 주세요. 여름에는 2~3일에 한 번씩.' },
      { title: '햇빛', desc: '햇빛을 좋아하지만 한여름 강한 직사광선은 차광이 필요합니다.' },
      { title: '온도', desc: '18~25°C에서 가장 잘 자랍니다. 추위에 약합니다.' },
      { title: '관리 팁', desc: '꽃이 피기 전에 잎을 따서 사용하면 단맛이 가장 강합니다.' },
    ],
  },
  'french-lavender': {
    tagline: '지중해의 향기, 일상을 위로하는 라벤더',
    description: '프랜치라벤더(스토이카스 계열)는 특유의 리본 모양 꽃이 매력적입니다. 향기와 시각적 아름다움을 동시에 즐길 수 있습니다.',
    care: [
      { title: '물주기', desc: '건조하게 키워야 합니다. 겉흙이 바싹 마른 후 주세요.' },
      { title: '햇빛', desc: '하루 6시간 이상 햇빛이 필수입니다. 그늘에서는 꽃이 잘 안 핍니다.' },
      { title: '온도', desc: '고온다습에 약합니다. 장마철 환기에 특히 신경써야 합니다.' },
      { title: '관리 팁', desc: '꽃이 진 후 줄기를 짧게 정리해주면 다음 철에 더 많이 핍니다.' },
    ],
  },
  'dill': {
    tagline: '연어 요리의 단짝, 시원하고 청량한 딜',
    description: '딜은 생선 요리, 피클, 샐러드에 두루 쓰이는 요리용 허브입니다. 특유의 청량한 향이 입맛을 살려줍니다.',
    care: [
      { title: '물주기', desc: '흙이 촉촉한 상태를 유지해 주세요. 건조하면 꽃이 일찍 핍니다.' },
      { title: '햇빛', desc: '충분한 직사광선이 필요합니다. 하루 6시간 이상 확보해주세요.' },
      { title: '온도', desc: '서늘한 기후를 좋아합니다. 더운 여름에는 볕을 약간 가려주세요.' },
      { title: '관리 팁', desc: '씨앗이 맺히기 전에 잎을 수확해야 향기가 가장 풍부합니다.' },
    ],
  },
  'rosemary': {
    tagline: '기억과 집중력의 허브, 요리부터 목욕까지',
    description: '로즈마리는 지중해 원산의 다년생 허브입니다. 고기 요리, 감자 요리, 포푸리, 미용까지 활용도가 매우 높습니다.',
    care: [
      { title: '물주기', desc: '건조하게 관리해야 합니다. 흙이 완전히 마른 후 주세요.' },
      { title: '햇빛', desc: '햇빛을 매우 좋아합니다. 하루 종일 볕이 드는 자리가 최적입니다.' },
      { title: '온도', desc: '영하에도 비교적 잘 견디나, 혹한 시엔 실내로 들이세요.' },
      { title: '관리 팁', desc: '새순을 자주 따주면 가지가 풍성해집니다. 목질화 부분은 피해 정리하세요.' },
    ],
  },
  'marigold': {
    tagline: '밝은 주황빛 꽃, 정원을 지키는 천연 방충 허브',
    description: '마리골드는 강한 향으로 해충을 쫓는 동반식물로 유명합니다. 식용 꽃으로도 활용되며, 수확 내내 화려한 꽃을 피웁니다.',
    care: [
      { title: '물주기', desc: '흙 표면이 마르면 주세요. 물이 너무 많으면 뿌리가 썩습니다.' },
      { title: '햇빛', desc: '양지바른 곳을 좋아합니다. 햇빛이 부족하면 줄기가 웃자랍니다.' },
      { title: '온도', desc: '15~30°C에서 잘 자랍니다. 추위에 약하므로 서리 전에 옮기세요.' },
      { title: '관리 팁', desc: '진 꽃을 바로 제거하면 더 오래 꽃을 볼 수 있습니다.' },
    ],
  },
  'little-tuck': {
    tagline: '앙증맞은 크기, 더 오래 피는 마리골드',
    description: '리틀덕 마리골드는 일반 마리골드보다 작지만 꽃이 더 오래가고 풍성합니다. 실내 화분, 베란다 가든에 특히 잘 어울립니다.',
    care: [
      { title: '물주기', desc: '흙 표면이 마르면 주세요. 화분 받침에 물이 고이지 않도록 하세요.' },
      { title: '햇빛', desc: '직사광선 6시간 이상 필요합니다. 햇빛이 충분해야 꽃이 많이 핍니다.' },
      { title: '온도', desc: '서리에 약합니다. 5°C 이하에서는 실내로 들여주세요.' },
      { title: '관리 팁', desc: '진 꽃대를 제거해주면 새 꽃봉오리가 계속 올라옵니다.' },
    ],
  },
  'basil-genovese': {
    tagline: '이탈리안 요리의 기본, 달콤한 바질의 정석',
    description: '슈퍼 스위트 제노비스는 페스토의 원조 품종입니다. 큰 잎과 강한 향이 특징으로 요리에 바로 활용하기 좋습니다.',
    care: [
      { title: '물주기', desc: '흙이 마르지 않게 촉촉하게 유지해 주세요. 건조하면 꽃이 일찍 핍니다.' },
      { title: '햇빛', desc: '햇빛을 아주 좋아합니다. 하루 6시간 이상 직사광선이 필요합니다.' },
      { title: '온도', desc: '따뜻한 환경을 좋아합니다. 15°C 이하에서는 성장이 멈춥니다.' },
      { title: '관리 팁', desc: '꽃이 피기 시작하면 잎의 향이 줄어드니 꽃대를 바로 제거하세요.' },
    ],
  },
  'basil-nufar': {
    tagline: '풍성한 잎, 병에 강한 바질의 걸작',
    description: '스위트 누파는 흰가루병에 강한 개량 품종입니다. 수확량이 많고 관리가 쉬워 처음 기르는 분께도 추천합니다.',
    care: [
      { title: '물주기', desc: '흙 겉면이 마르면 물을 충분히 주세요. 저녁보다 아침 물주기를 권장합니다.' },
      { title: '햇빛', desc: '햇빛이 좋아야 향이 진해집니다. 창가 또는 베란다가 좋습니다.' },
      { title: '온도', desc: '따뜻한 기후가 좋습니다. 추운 계절에는 실내에서 키우세요.' },
      { title: '관리 팁', desc: '아래 잎부터 수확하면서 위 줄기가 계속 자라도록 해주세요.' },
    ],
  },
  'basil-ruffle': {
    tagline: '보랏빛 프릴 잎, 보는 것도 맛보는 것도 특별한',
    description: '맘모스 러플은 주름진 자주빛 잎이 인상적인 관상용 바질입니다. 향도 뛰어나 요리와 플레이팅 모두에 활용됩니다.',
    care: [
      { title: '물주기', desc: '흙이 마르지 않게 유지하되 뿌리에 물이 고이지 않도록 하세요.' },
      { title: '햇빛', desc: '직사광선보다 밝은 간접광에서 색감이 더욱 선명하게 납니다.' },
      { title: '온도', desc: '일반 바질과 같이 따뜻한 환경을 좋아합니다. 15°C 이상 유지.' },
      { title: '관리 팁', desc: '잎이 크게 자랄수록 향이 강해집니다. 꽃대 제거는 필수입니다.' },
    ],
  },
  'rucola': {
    tagline: '샐러드의 품격, 톡 쏘는 매콤한 루꼴라',
    description: '루꼴라는 이탈리아 요리에 빠질 수 없는 허브입니다. 생으로 샐러드에 얹거나 피자 위에 올려 먹으면 맛있습니다.',
    care: [
      { title: '물주기', desc: '서늘하고 촉촉한 환경을 좋아합니다. 흙이 마르지 않도록 관리하세요.' },
      { title: '햇빛', desc: '반양지에서도 잘 자랍니다. 여름 강한 햇빛은 약간 가려주세요.' },
      { title: '온도', desc: '서늘한 기후를 좋아합니다. 봄·가을에 가장 잘 자랍니다.' },
      { title: '관리 팁', desc: '잎이 어릴 때 수확해야 쓴맛이 적고 향긋합니다.' },
    ],
  },
};

export const PRODUCTS = [
  // ── 1조 ──
  { id: 'blue-sage',        name: '블루세이지',           size: '15cm', price: 5000, group: '1조',  stock: 35,  color: '#5C8A6A', image: '/assets/crops/blue-sage.png' },
  { id: 'hot-lip-sage',     name: '핫립세이지',           size: '15cm', price: 8000, group: '1조',  stock: null, color: '#C06060', image: '/assets/crops/hot-lip-sage.png' },
  { id: 'stevia',           name: '스테비아',             size: '10cm', price: 2000, group: '1조',  stock: null, color: '#7A9E7E', image: '/assets/crops/stevia.png' },

  // ── 2조 ──
  { id: 'french-lavender',  name: '프랜치라벤더',         size: '15cm', price: 4500, group: '2조',  stock: 10,  color: '#9B8EC4', image: '/assets/crops/lavender.png', note: '2포트 8,000원' },

  // ── 3조 ──
  { id: 'dill',             name: '딜',                   size: '15cm', price: 6000, group: '3조',  stock: 50,  color: '#6B9E6B', image: '/assets/crops/dill.png' },

  // ── 4조 ──
  { id: 'rosemary',         name: '로즈마리',             size: '15cm', price: 5000, group: '4조',  stock: 41,  color: '#5B8B8B', image: '/assets/crops/rosemary.png' },
  { id: 'marigold',         name: '마리골드',             size: '15cm', price: 5000, group: '4조',  stock: 33,  color: '#D4A03A', image: '/assets/crops/marigold.png' },
  { id: 'little-tuck',      name: '리틀덕 마리골드',      size: '10cm', price: 3000, group: '4조',  stock: 280, color: '#C8902A', image: '/assets/crops/little-duck.png' },

  // ── 바질류 ──
  { id: 'basil-genovese',   name: '슈퍼 스위트 제노비스', size: '10cm', price: 2000, group: '바질', stock: null, color: '#4A8A5A', image: '/assets/crops/basil-genovese.png' },
  { id: 'basil-nufar',      name: '스위트 누파',           size: '10cm', price: 2000, group: '바질', stock: null, color: '#3D7A4D', image: '/assets/crops/basil-nufar.png' },
  { id: 'basil-ruffle',     name: '맘모스 러플',           size: '10cm', price: 2000, group: '바질', stock: null, color: '#6B4A8A', image: '/assets/crops/basil-ruffle.png' },
  { id: 'rucola',           name: '루꼴라',                size: '10cm', price: 2000, group: '바질', stock: null, color: '#8AAA5A', image: '/assets/crops/rucola.png' },
];

export const GROUPS = [
  { key: '1조', label: '1조' },
  { key: '2조', label: '2조' },
  { key: '3조', label: '3조' },
  { key: '4조', label: '4조' },
  { key: '바질', label: '바질류' },
];

export const STATUS_LABELS = {
  pending:   '접수',
  confirmed: '확인됨',
  done:      '완료',
  cancelled: '취소',
};

export const STATUS_COLORS = {
  pending:   { bg: '#FFF8E1', text: '#F9A825' },
  confirmed: { bg: '#E8F5E9', text: '#2E7D32' },
  done:      { bg: '#E3F2FD', text: '#1565C0' },
  cancelled: { bg: '#FFEBEE', text: '#C62828' },
};
