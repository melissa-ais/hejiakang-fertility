// AI 門市小幫手：純前端、以關鍵字比對回答門市常見問題。
// 不會傳送或保存訪客輸入的內容；用藥與症狀問題一律轉介藥師。
(() => {
  const STORE = {
    address: '台中市南區建國南路一段259號',
    phone: '04-2260-3775',
    tel: 'tel:+886422603775',
    line: 'https://lin.ee/Olm3eqO',
    map: 'https://maps.app.goo.gl/dLF4YW2kbzS7FJAn8',
    // 0 = 星期日
    hours: { 0: ['12:00', '21:00'], 1: ['09:30', '22:00'], 2: ['09:30', '22:00'], 3: ['09:30', '22:00'], 4: ['09:30', '22:00'], 5: ['09:30', '22:00'], 6: ['12:00', '21:00'] }
  };
  const DAY = ['日', '一', '二', '三', '四', '五', '六'];

  const link = (label, href, external) => ({ label, href, external: external ?? /^https?:/.test(href) });
  const L = {
    line: link('LINE 問藥師', STORE.line),
    call: link('撥打電話', STORE.tel, false),
    map: link('Google 地圖導航', STORE.map),
    store: link('門市資訊頁', './store.html')
  };

  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

  // 一律以台灣時間判斷，避免訪客裝置時區不同而算錯
  function taipeiNow(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Taipei', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
    const get = (t) => parts.find((x) => x.type === t).value;
    return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')), min: Number(get('hour')) * 60 + Number(get('minute')) };
  }

  function openStatus(now = new Date()) {
    const { day, min: cur } = taipeiNow(now);
    const [o, c] = STORE.hours[day];
    if (cur >= toMin(o) && cur < toMin(c)) return `現在營業中，今天開到 ${c}。`;
    if (cur < toMin(o)) return `現在還沒開門，今天 ${o} 開始營業。`;
    const next = (day + 1) % 7;
    return `今天已經打烊了，明天（星期${DAY[next]}）${STORE.hours[next][0]} 開門。`;
  }

  const URGENT = /胸痛|胸悶|呼吸困難|喘不過|昏倒|昏迷|意識不清|抽搐|吃太多|過量|誤食|中毒|大量出血|自殺|想死|嚴重過敏|喉嚨腫/;
  const MEDICAL = /吃什麼藥|什麼藥|一起吃|能不能吃|可以吃|可不可以吃|副作用|劑量|幾顆|吃幾|藥效|症狀|頭痛|發燒|咳嗽|感冒|胃痛|拉肚子|腹瀉|便秘|過敏|失眠|疼痛|痛|懷孕.*(吃|藥)|哺乳|餵奶|小孩.*藥|治療|診斷/;

  const INTENTS = [
    { keys: /營業|幾點|時間|開門|關門|打烊|有開|開到|休息|公休|假日|週末|周末|星期|禮拜|今天/,
      reply: () => ({
        text: [openStatus(), '營業時間：', '星期一～五　09:30–22:00', '星期六、日　12:00–21:00', '連假或臨時調整以 LINE 官方帳號公告為準。'],
        links: [L.store, L.line]
      }) },
    { keys: /地址|在哪|哪裡|位置|怎麼去|怎麼走|導航|地圖|停車|交通|公車|捷運/,
      reply: (q) => ({
        text: [`門市地址：${STORE.address}。`, /停車|交通|公車|捷運/.test(q) ? '停車與交通細節我這裡沒有資料，出發前可以先打電話問門市。' : '點下方按鈕就能直接用 Google 地圖導航。'],
        links: [L.map, L.call]
      }) },
    { keys: /電話|聯絡|聯繫|客服|打給/,
      reply: () => ({ text: [`門市電話：${STORE.phone}。`, '也可以加 LINE 官方帳號留言，藥師看到會回覆。'], links: [L.call, L.line] }) },
    { keys: /line|賴|官方帳號|加好友/i,
      reply: () => ({ text: ['點下方按鈕就能加入禾佳康 LINE 官方帳號，可以詢問商品、預約備藥或問用藥問題。'], links: [L.line] }) },
    { keys: /處方|慢箋|連續箋|領藥|拿藥|健保卡|備藥/,
      reply: () => ({
        text: ['慢性處方箋可以到門市領藥，請帶健保卡和連續處方箋。', '想減少等待，可以先透過 LINE 傳處方箋照片預約備藥。'],
        links: [L.line, L.store]
      }) },
    { keys: /血壓/,
      reply: () => ({ text: ['店內有血壓計，到店就可以量，也能順便記錄日常血壓變化。', '如果數值異常或有不舒服，請直接告訴現場藥師。'], links: [L.store] }) },
    { keys: /有貨|有沒有賣|有賣|庫存|訂貨|調貨|代訂|買得到|找不到|商品|價格|多少錢|價錢|優惠|折扣|特價/,
      reply: (q) => ({
        text: [/價格|多少錢|價錢|優惠|折扣|特價/.test(q)
          ? '商品價格與優惠會變動，我這裡沒有即時資料，請透過 LINE 或電話詢問門市。'
          : '商品是否有貨要以門市現況為準。可以先在 LINE 傳商品名稱或照片確認；店裡沒有的也可以請門市幫忙訂貨。'],
        links: [L.line, L.call]
      }) },
    { keys: /線上購物|網購|宅配|寄送|運費|外送/,
      reply: () => ({ text: ['線上購物相關的說明可以看「線上購物」頁面；配送細節請以 LINE 詢問為準。'], links: [link('線上購物', './shop.html'), L.line] }) },
    { keys: /回收|過期|不要的藥|剩藥|丟藥/,
      reply: () => ({ text: ['本店目前沒有提供廢棄藥品回收服務，不好意思。', '過期或不再使用的藥要怎麼處理，可以參考食藥署的建議方式；不確定的話，歡迎傳 LINE 問藥師。'], links: [L.line] }) },
    { keys: /備孕|想懷孕|懷孕準備|葉酸|生育|試管|受孕/,
      reply: () => ({
        text: ['網站有「備孕營養評估」，回答幾題就能整理出可以和藥師討論的營養方向。', '整理好的結果可以帶到門市，或截圖傳 LINE 給藥師。'],
        links: [link('開始備孕營養評估', './fertility.html'), L.line]
      }) },
    { keys: /保健|營養品|維他命|維生素|魚油|益生菌|鈣|葉黃素/,
      reply: () => ({
        text: ['可以先用「保健品需求評估」整理自己的需求，或看看依需求整理的推薦方向。', '如果正在吃藥，選保健品前請先問藥師會不會互相影響。'],
        links: [link('保健品需求評估', './supplements.html'), link('依需求推薦', './products.html')]
      }) },
    { keys: /用藥清單|藥單|整理藥|藥袋/,
      reply: () => ({ text: ['「用藥資訊整理」頁面可以把正在吃的藥和保健品列成清單，看診或問藥師時更方便。'], links: [link('用藥資訊整理', './medication.html')] }) },
    { keys: /文章|專欄|衛教/,
      reply: () => ({ text: ['健康專欄整理了民眾常問的用藥問題，例如普拿疼怎麼吃、藥可不可以配飲料。'], links: [link('健康專欄', './articles.html')] }) },
    { keys: /服務|可以做什麼|有什麼/,
      reply: () => ({
        text: ['門市服務包括：慢性處方箋領藥、用藥諮詢、備孕營養討論、血壓量測、代客訂貨、LINE 線上詢問。', '實際項目以門市現場為準。'],
        links: [link('看門市服務', './store.html#services')]
      }) },
    { keys: /^(你好|哈囉|嗨|hi|hello|安安|在嗎)/i,
      reply: () => ({ text: ['你好！我是禾佳康的 AI 門市小幫手，可以回答營業時間、地址、門市服務這些問題。想問什麼呢？'] }) },
    { keys: /謝謝|感謝|謝啦|3q/i,
      reply: () => ({ text: ['不客氣！還有其他問題隨時問我，用藥問題就交給藥師喔。'] }) }
  ];

  function answer(raw) {
    const q = raw.trim();
    if (URGENT.test(q)) {
      return {
        urgent: true,
        text: ['這聽起來可能需要立即處理。', '如果情況緊急，請馬上撥打 119 或前往最近的急診。', '誤食或用藥過量也可以撥打毒藥物諮詢專線 02-2875-7525。'],
        links: [link('撥打 119', 'tel:119', false)]
      };
    }
    const hit = INTENTS.find((i) => i.keys.test(q));
    // 門市類問題優先回答；純用藥或症狀問題轉介藥師
    if (hit && !(MEDICAL.test(q) && !/營業|地址|電話|處方|回收|血壓|有貨|訂貨/.test(q))) return hit.reply(q);
    if (MEDICAL.test(q)) {
      return {
        text: ['用藥和身體狀況需要了解你的情況才能判斷，我是門市小幫手，不能提供用藥建議。', '請直接問藥師：可以傳 LINE，或打電話到門市。'],
        links: [L.line, L.call, link('看健康專欄', './articles.html')]
      };
    }
    return {
      text: ['這個問題我還不會回答 🙇', '可以試試下方的常見問題，或直接透過 LINE、電話詢問門市人員。'],
      links: [L.line, L.call]
    };
  }

  const QUICK = ['現在有營業嗎？', '門市在哪裡？', '慢性處方箋怎麼領？', '商品有沒有貨？', '可以量血壓嗎？', '有哪些門市服務？'];

  // ---------- 介面 ----------
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  const launcher = el('button', 'ai-launcher');
  launcher.type = 'button';
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'ai-panel');
  launcher.setAttribute('aria-label', '開啟 AI 門市小幫手');
  launcher.append(el('span', 'ai-launcher-icon', '禾'), el('span', 'ai-launcher-text', '問小幫手'));

  const panel = el('div', 'ai-panel');
  panel.id = 'ai-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'AI 門市小幫手');

  const head = el('div', 'ai-head');
  const title = el('div', 'ai-title');
  title.append(el('span', 'ai-avatar', '禾'));
  const tt = el('div');
  tt.append(el('strong', null, 'AI 門市小幫手'), el('small', null, '回答門市常見問題・用藥問題請問藥師'));
  title.append(tt);
  const close = el('button', 'ai-close', '×');
  close.type = 'button';
  close.setAttribute('aria-label', '關閉小幫手');
  head.append(title, close);

  const log = el('div', 'ai-log');
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', 'polite');

  const chips = el('div', 'ai-chips');
  QUICK.forEach((q) => {
    const b = el('button', 'ai-chip', q);
    b.type = 'button';
    b.addEventListener('click', () => ask(q));
    chips.append(b);
  });

  const form = el('form', 'ai-form');
  const input = el('input', 'ai-input');
  input.type = 'text';
  input.maxLength = 200;
  input.placeholder = '輸入你的問題，例如：星期日幾點開？';
  input.setAttribute('aria-label', '輸入問題');
  input.autocomplete = 'off';
  const send = el('button', 'ai-send', '送出');
  send.type = 'submit';
  form.append(input, send);

  const note = el('p', 'ai-note', '小幫手依網站資料自動回覆，可能有誤，請以門市實際說明為準；輸入內容不會被儲存。');

  panel.append(head, log, chips, form, note);
  document.body.append(panel, launcher);

  function bubble(who, msg) {
    const row = el('div', `ai-msg ai-${who}${msg.urgent ? ' ai-urgent' : ''}`);
    const box = el('div', 'ai-bubble');
    (Array.isArray(msg.text) ? msg.text : [msg.text]).forEach((t) => box.append(el('p', null, t)));
    if (msg.links && msg.links.length) {
      const acts = el('div', 'ai-actions');
      msg.links.forEach((l) => {
        const a = el('a', 'ai-action', l.label);
        a.href = l.href;
        if (l.external) { a.target = '_blank'; a.rel = 'noopener'; }
        acts.append(a);
      });
      box.append(acts);
    }
    row.append(box);
    log.append(row);
    log.scrollTop = log.scrollHeight;
  }

  function ask(q) {
    const text = q.trim();
    if (!text) return;
    bubble('user', { text });
    input.value = '';
    const typing = el('div', 'ai-msg ai-bot ai-typing');
    typing.append(el('div', 'ai-bubble', '…'));
    log.append(typing);
    log.scrollTop = log.scrollHeight;
    setTimeout(() => { typing.remove(); bubble('bot', answer(text)); }, 380);
  }

  let greeted = false;
  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    launcher.classList.toggle('is-open', open);
    document.body.classList.toggle('ai-open', open);
    if (open) {
      if (!greeted) {
        greeted = true;
        bubble('bot', { text: ['你好，我是禾佳康的 AI 門市小幫手 👋', openStatus(), '可以問我營業時間、地址、領藥、商品詢問等問題。'] });
      }
      setTimeout(() => input.focus(), 50);
    } else {
      launcher.focus();
    }
  }

  launcher.addEventListener('click', () => setOpen(panel.hidden));
  close.addEventListener('click', () => setOpen(false));
  form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) setOpen(false); });

  // 方便測試
  window.__hjkAssistant = { answer, openStatus };
})();
