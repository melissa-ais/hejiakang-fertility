const topics = [
  {
    key: 'energy', label: '精神與體力',
    life: '先檢查睡眠時數、三餐是否規律，以及蛋白質、蔬菜是否足夠。很多疲勞感和作息、飲食有關。',
    info: '常被詢問的營養資訊有 B 群、鐵等。鐵是否不足需要抽血確認，不建議自行長期補充。',
    doctor: '疲勞持續好幾週沒有改善，或伴隨體重明顯變化、喘、心悸、經血量變多時，請就醫檢查。'
  },
  {
    key: 'sleep', label: '睡眠與作息',
    life: '盡量固定起床時間，睡前一小時減少滑手機，下午以後少喝咖啡、茶等含咖啡因飲料。',
    info: '市面上與睡眠相關的產品常見成分有 GABA、色胺酸、鎂等。正在吃安眠藥、抗焦慮或抗憂鬱藥物的人，使用前請先問藥師。',
    doctor: '失眠持續超過三個月、白天嚴重嗜睡，或家人說你睡覺時大聲打鼾、呼吸會停，請就醫評估。'
  },
  {
    key: 'eyes', label: '長時間用眼',
    life: '用眼 20 分鐘，就看 6 公尺外的地方 20 秒；螢幕亮度不要比環境亮太多，記得多眨眼。',
    info: '常被詢問的營養資訊有葉黃素、玉米黃素、魚油等。魚油和抗凝血藥物併用需要注意。',
    doctor: '視力突然模糊、看到閃光、飛蚊突然變多，或眼睛紅痛時，請儘快看眼科。'
  },
  {
    key: 'gut', label: '腸道與消化',
    life: '多吃蔬菜、水果、全穀類，水分要足夠，並保持規律活動。',
    info: '常被詢問的營養資訊有益生菌、膳食纖維等。免疫力較低或正在接受治療的人，使用益生菌前請先問醫師。',
    doctor: '出現血便、黑便、排便習慣突然改變，或體重莫名減輕時，請就醫檢查。'
  },
  {
    key: 'bones', label: '骨骼與關節',
    life: '規律做走路、爬樓梯等負重運動，適度曬太陽，飲食中加入奶類、豆製品等含鈣食物。',
    info: '常被詢問的營養資訊有鈣、維生素 D、葡萄糖胺等。鈣片會影響部分藥物吸收，需要錯開時間；有腎結石病史的人請先詢問。',
    doctor: '關節紅、腫、熱、痛，或跌倒受傷後持續疼痛，請就醫。'
  },
  {
    key: 'unsure', label: '還不確定',
    life: '先回想最近最困擾的一件事，例如累、睡不好、眼睛酸、腸胃不順，從那裡開始整理。',
    info: '不急著選產品。先把目前的飲食、作息和正在使用的藥物整理好，和藥師一起找方向。',
    doctor: '若有持續的不適或新出現的症狀，請先就醫找出原因。'
  }
];

const questions = [
  { title: '目前最想照顧的是哪個方向？', help: '選一個最在意的就好，之後可以再做一次。', options: topics.map((topic) => topic.label) },
  { title: '年齡層是？', help: '不同年齡需要留意的重點不太一樣。', options: ['18–39 歲', '40–64 歲', '65 歲以上'] },
  { title: '平常飲食比較接近哪一種？', help: '依多數日子的情況選擇。', options: ['三餐規律，蔬果、蛋白質都有吃', '外食多，蔬果吃得少', '常常不吃早餐或用餐時間不固定', '有特定飲食方式（例如吃素、控制體重）'] },
  { title: '目前有吃保健食品嗎？', help: '不需要填品牌，先整理數量就好。', options: ['沒有', '有 1–2 種', '有 3 種以上', '不確定自己吃的是什麼'] },
  { title: '有沒有需要先告訴藥師的情況？', help: '若不確定，選最後一項即可。', options: ['沒有特別情況', '有慢性病或長期吃藥', '懷孕、哺乳或正在備孕', '近期要手術或拔牙', '不確定，想先問藥師'] },
  { title: '最希望先做什麼？', help: '結果會依這個排列討論重點。', options: ['了解這個方向的營養資訊', '檢查目前吃的保健食品有沒有重複', '先從生活習慣調整', '直接和藥師聊聊'] }
];

let current = 0;
let answers = Array(questions.length).fill(null);

const quiz = document.querySelector('#quiz');
const step = document.querySelector('#step');
const stepLabel = document.querySelector('#step-label');
const bar = document.querySelector('#bar');
const progress = document.querySelector('.progress');
const result = document.querySelector('#res');
const resultType = document.querySelector('#rtype');
const resultIntro = document.querySelector('#result-intro');
const priorities = document.querySelector('#priorities');
const summary = document.querySelector('#summary');
const copyStatus = document.querySelector('#copy-status');

const presetTopic = topics.findIndex((topic) => topic.key === new URLSearchParams(location.search).get('topic'));
if (presetTopic >= 0) answers[0] = presetTopic;

function setProgress(value, label) {
  step.textContent = label;
  stepLabel.textContent = `${value}%`;
  bar.style.width = `${value}%`;
  progress.setAttribute('aria-valuenow', String(value));
}

function renderQuestion() {
  const question = questions[current];
  setProgress(Math.round(((current + 1) / questions.length) * 100), `第 ${current + 1} 題，共 ${questions.length} 題`);
  quiz.hidden = false;
  quiz.innerHTML = `
    <span class="question-eyebrow">保健需求整理</span>
    <h2 id="assessment-title">${question.title}</h2>
    <p class="question-help">${question.help}</p>
    <div class="quiz-options" role="radiogroup" aria-labelledby="assessment-title">
      ${question.options.map((option, index) => `<button class="quiz-option${answers[current] === index ? ' selected' : ''}" type="button" role="radio" aria-checked="${answers[current] === index}" data-index="${index}">${option}</button>`).join('')}
    </div>
    <p class="validation-message" id="validation" role="alert"></p>
    <div class="quiz-nav">
      <button class="btn btn-soft" id="previous" type="button"${current === 0 ? ' disabled' : ''}>上一題</button>
      <button class="btn btn-line" id="next" type="button">${current === questions.length - 1 ? '查看整理結果' : '下一題'}</button>
    </div>`;
  quiz.querySelectorAll('.quiz-option').forEach((button) => button.addEventListener('click', () => selectAnswer(Number(button.dataset.index))));
  quiz.querySelector('#previous').addEventListener('click', () => { if (current > 0) { current -= 1; renderQuestion(); } });
  quiz.querySelector('#next').addEventListener('click', nextQuestion);
}

function selectAnswer(index) {
  answers[current] = index;
  quiz.querySelectorAll('.quiz-option').forEach((button, optionIndex) => {
    button.classList.toggle('selected', optionIndex === index);
    button.setAttribute('aria-checked', String(optionIndex === index));
  });
  quiz.querySelector('#validation').textContent = '';
}

function nextQuestion() {
  if (answers[current] === null) {
    quiz.querySelector('#validation').textContent = '請先選擇一個最接近的答案。';
    quiz.querySelector('.quiz-option')?.focus();
    return;
  }
  if (current < questions.length - 1) {
    current += 1;
    renderQuestion();
  } else {
    showResult();
  }
}

function buildPriorities() {
  const topic = topics[answers[0]];
  const [, age, diet, supplements, situation, goal] = answers;
  const items = [];

  if (situation > 0) {
    const reasons = ['', '有慢性病或長期吃藥', '懷孕、哺乳或正在備孕', '近期要手術或拔牙', '想先確認自己的情況'];
    items.push({ title: '先確認個人情況', text: `你提到「${reasons[situation]}」。開始任何保健食品前，請先把正在吃的藥和身體狀況告訴藥師或醫師，再決定適不適合。` });
  }
  if (supplements >= 2 && goal !== 1) {
    items.push({ title: '整理目前的保健食品', text: '吃的種類越多，越容易有成分重複或和藥物互相影響。把外盒或成分標示帶來，請藥師一起檢查。', link: { href: './article-supplement-drug.html', text: '延伸閱讀：保健食品和藥可以一起吃嗎？' } });
  }
  if (age === 2) {
    items.push({ title: '留意多重用藥', text: '65 歲以上常同時吃好幾種藥，加上保健食品更需要整理。可以用〈用藥清單〉先列出來。', link: { href: './medication.html', text: '整理我的用藥清單' } });
  }
  if (diet > 0 && goal !== 2) {
    items.push({ title: '飲食也是重點', text: '外食、不吃早餐或特定飲食方式，都會影響營養攝取。先從一餐開始調整，往往比多吃一種補充品更實際。' });
  }

  const goalCards = [
    { title: `${topic.label}：營養資訊`, text: topic.info },
    { title: '檢查有沒有重複', text: '把正在吃的保健食品排在一起，看成分欄是否有相同成分（例如多種產品都含 B 群或鈣），再請藥師確認。' },
    { title: `${topic.label}：生活習慣`, text: topic.life },
    { title: '和藥師聊聊', text: '把這份整理結果傳到 LINE，或帶到門市，藥師可以依你的情況一起討論。' }
  ];
  items.unshift(goalCards[goal]);
  if (goal !== 2) items.push({ title: `${topic.label}：生活習慣`, text: topic.life });
  return items.slice(0, 3);
}

function summaryText() {
  const topic = topics[answers[0]];
  const responseLines = questions.map((question, index) => `${index + 1}. ${question.title}\n${question.options[answers[index]]}`).join('\n\n');
  const priorityLines = buildPriorities().map((item, index) => `${index + 1}. ${item.title}：${item.text}`).join('\n');
  return `禾佳康藥局｜保健品需求整理\n\n${responseLines}\n\n建議討論重點\n${priorityLines}\n\n何時要就醫\n${topic.doctor}\n\n提醒：本結果僅協助整理討論重點，保健食品不能取代藥物治療，也不作為診斷、治療或個別劑量建議。`;
}

function showResult() {
  const topic = topics[answers[0]];
  quiz.hidden = true;
  setProgress(100, '整理完成');
  resultType.textContent = `「${topic.label}」的討論重點`;
  resultIntro.textContent = '以下依你的回答整理，可以帶著和藥師討論。';
  priorities.innerHTML = buildPriorities().map((item, index) => `<div class="priority-card"><strong>${index + 1}. ${item.title}</strong><p>${item.text}</p>${item.link ? `<a class="text-link" href="${item.link.href}">${item.link.text} →</a>` : ''}</div>`).join('')
    + `<div class="priority-card doctor-card"><strong>出現這些情況，請先就醫</strong><p>${topic.doctor}</p></div>`;
  summary.textContent = summaryText();
  result.classList.add('show');
  resultType.focus({ preventScroll: true });
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(summaryText());
    copyStatus.textContent = '已複製整理結果。';
    return true;
  } catch {
    copyStatus.textContent = '瀏覽器無法自動複製，請展開完整回答後長按文字複製。';
    return false;
  }
}

document.querySelector('#copy-result').addEventListener('click', copyResult);
document.querySelector('#copy-line').addEventListener('click', async () => {
  if (await copyResult()) copyStatus.textContent = '已複製整理結果，正在開啟 LINE；可直接貼上與藥師討論。';
  window.open('https://lin.ee/Olm3eqO', '_blank', 'noopener');
});
document.querySelector('#restart').addEventListener('click', () => {
  current = 0;
  answers = Array(questions.length).fill(null);
  result.classList.remove('show');
  copyStatus.textContent = '';
  renderQuestion();
  document.querySelector('.app').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
renderQuestion();
