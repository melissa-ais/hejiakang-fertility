const questions = [
  { title: '目前較接近哪一個階段？', options: ['正在做日常準備', '已開始備孕一段時間', '正在與醫療專業人員討論', '先了解相關資訊'] },
  { title: '目前有固定補充營養品嗎？', options: ['尚未開始', '有，品項較單純', '有，同時補充多種', '不確定目前內容是否合適'] },
  { title: '最希望先整理哪個方向？', options: ['飲食與生活習慣', '常見備孕營養素', '目前補充品的搭配', '與藥師討論的重點'] },
  { title: '是否有需要特別留意的情況？', options: ['目前沒有', '懷孕或可能懷孕', '有慢性疾病或長期用藥', '不確定，想先詢問藥師'] }
];

let current = 0;
const answers = [];
const quiz = document.querySelector('#quiz');
const step = document.querySelector('#step');
const bar = document.querySelector('#bar');
const result = document.querySelector('#res');

function renderQuestion() {
  if (!quiz || !step || !bar) return;
  const question = questions[current];
  step.textContent = `第 ${current + 1} 題，共 ${questions.length} 題`;
  bar.style.width = `${(current / questions.length) * 100}%`;
  quiz.innerHTML = `<h2>${question.title}</h2><div class="quiz-options">${question.options.map((option, index) => `<button class="quiz-option" type="button" data-index="${index}">${option}</button>`).join('')}</div>`;
  quiz.querySelectorAll('.quiz-option').forEach((button) => button.addEventListener('click', () => selectAnswer(Number(button.dataset.index))));
}

function selectAnswer(index) {
  answers[current] = questions[current].options[index];
  current += 1;
  if (current < questions.length) renderQuestion(); else showResult();
}

function summaryText() {
  return questions.map((question, index) => `${index + 1}. ${question.title}\n${answers[index]}`).join('\n\n');
}

function showResult() {
  quiz.hidden = true;
  step.textContent = '評估完成';
  bar.style.width = '100%';
  document.querySelector('#rtype').textContent = '您的備孕營養討論重點';
  document.querySelector('#summary').textContent = `${summaryText()}\n\n建議：可將以上整理帶著與藥師討論。若有懷孕、疾病或長期用藥等情況，請主動告知醫療專業人員。`;
  result.classList.add('show');
}

window.copySummary = async function () {
  const text = document.querySelector('#summary').textContent;
  try { await navigator.clipboard.writeText(text); alert('已複製評估結果'); }
  catch { alert('無法自動複製，請長按文字手動複製。'); }
};

window.sendLine = function () {
  window.open('https://lin.ee/Olm3eqO', '_blank', 'noopener');
};

renderQuestion();
