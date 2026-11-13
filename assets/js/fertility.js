const questions = [
  { title: '目前較接近哪一個階段？', help: '選擇最接近目前狀況的描述即可。', options: ['先了解備孕資訊', '正在做日常準備', '已開始備孕一段時間', '正在與醫療專業人員討論'] },
  { title: '目前有固定補充營養品嗎？', help: '不需要填品牌或劑量，先整理補充情況。', options: ['尚未開始', '有，品項較單純', '有，同時補充多種', '不確定目前內容是否合適'] },
  { title: '平常飲食狀況較接近哪一項？', help: '依多數日子的情況選擇。', options: ['飲食大致規律且多樣', '外食較多或用餐不固定', '有特定飲食方式或飲食限制', '不確定如何評估'] },
  { title: '生活作息目前較接近哪一項？', help: '這題用來整理後續可與藥師討論的生活重點。', options: ['作息大致規律', '常熬夜或睡眠不足', '近期壓力或疲勞較明顯', '作息變動大，不容易固定'] },
  { title: '是否有需要優先告知專業人員的情況？', help: '若不確定，選擇最後一項即可。', options: ['目前沒有特別情況', '懷孕、可能懷孕或哺乳中', '有疾病、過敏或長期用藥', '不確定，希望先詢問藥師'] },
  { title: '最希望先整理哪個方向？', help: '結果會依這個方向排列討論重點。', options: ['飲食與生活習慣', '常見備孕營養資訊', '目前補充品的搭配', '與藥師討論前的準備'] }
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

function progressValue() {
  return Math.round(((current + 1) / questions.length) * 100);
}

function renderQuestion() {
  const question = questions[current];
  const value = progressValue();
  step.textContent = `第 ${current + 1} 題，共 ${questions.length} 題`;
  stepLabel.textContent = `${value}%`;
  bar.style.width = `${value}%`;
  progress.setAttribute('aria-valuenow', String(value));
  quiz.hidden = false;
  quiz.innerHTML = `
    <span class="question-eyebrow">備孕需求整理</span>
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
  quiz.querySelector('#previous').addEventListener('click', previousQuestion);
  quiz.querySelector('#next').addEventListener('click', nextQuestion);
}

function selectAnswer(index) {
  answers[current] = index;
  quiz.querySelectorAll('.quiz-option').forEach((button, optionIndex) => {
    const selected = optionIndex === index;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-checked', String(selected));
  });
  quiz.querySelector('#validation').textContent = '';
}

function previousQuestion() {
  if (current === 0) return;
  current -= 1;
  renderQuestion();
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

function answerText(index) {
  return questions[index].options[answers[index]];
}

function buildPriorities() {
  const items = [];
  const specialSituation = answers[4];
  const supplements = answers[1];
  const lifestyle = answers[3];
  const goal = answers[5];
  if (specialSituation > 0) items.push({ title: '先確認個人情況', text: '把懷孕狀態、疾病、過敏或用藥情況主動告知醫師或藥師，再討論營養補充。' });
  if (supplements >= 2) items.push({ title: '整理目前補充清單', text: '記下正在使用的品項與外包裝資訊，請藥師協助確認是否有重複或需要留意的搭配。' });
  if (lifestyle > 0) items.push({ title: '把生活節奏一起納入', text: '作息、睡眠、壓力與飲食情況也是討論重點，可先挑一項最想調整的習慣。' });
  const goalCards = [
    { title: '先從日常習慣開始', text: '把常見的一日飲食、外食頻率與作息整理好，再與專業人員討論可行的調整方向。' },
    { title: '建立營養資訊清單', text: '記下最想了解的備孕營養主題，向藥師確認哪些資訊適合自己的情況。' },
    { title: '確認補充品搭配', text: '帶著產品外包裝或成分標示詢問藥師，避免只憑單一成分或宣稱做決定。' },
    { title: '準備三個討論重點', text: '目前階段、正在使用的補充品，以及需要優先告知的健康情況。' }
  ];
  items.push(goalCards[goal]);
  return items.slice(0, 3);
}

function summaryText() {
  const responseLines = questions.map((question, index) => `${index + 1}. ${question.title}\n${answerText(index)}`).join('\n\n');
  const priorityLines = buildPriorities().map((item, index) => `${index + 1}. ${item.title}：${item.text}`).join('\n');
  return `禾佳康藥局｜備孕營養需求整理\n\n${responseLines}\n\n建議討論重點\n${priorityLines}\n\n提醒：本結果僅協助整理討論重點，不作為診斷、治療、處方或個別營養劑量建議。`;
}

function showResult() {
  quiz.hidden = true;
  step.textContent = '評估完成';
  stepLabel.textContent = '100%';
  bar.style.width = '100%';
  progress.setAttribute('aria-valuenow', '100');
  const priorityItems = buildPriorities();
  resultType.textContent = '您的備孕營養討論重點';
  resultIntro.textContent = '以下內容依您的回答整理，可作為與藥師或其他醫療專業人員溝通的起點。';
  priorities.innerHTML = priorityItems.map((item, index) => `<div class="priority-card"><strong>${index + 1}. ${item.title}</strong><p>${item.text}</p></div>`).join('');
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

async function copyAndOpenLine() {
  const copied = await copyResult();
  if (copied) copyStatus.textContent = '已複製整理結果，正在開啟 LINE；可直接貼上與藥師討論。';
  window.open('https://lin.ee/Olm3eqO', '_blank', 'noopener');
}

function restartAssessment() {
  current = 0;
  answers = Array(questions.length).fill(null);
  result.classList.remove('show');
  copyStatus.textContent = '';
  renderQuestion();
  document.querySelector('.app').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelector('#copy-result').addEventListener('click', copyResult);
document.querySelector('#copy-line').addEventListener('click', copyAndOpenLine);
document.querySelector('#restart').addEventListener('click', restartAssessment);
renderQuestion();
