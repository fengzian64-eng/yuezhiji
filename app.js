(function () {
  "use strict";

  // Safe localStorage helpers
  function loadStore(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveStore(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      // Ignore storage errors in restricted environments
    }
  }

  // Toast helper
  var toastEl = document.getElementById("toast");
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  function copyText(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast(successMsg || "已复制，可以直接粘贴分享！");
      }).catch(function () {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast(successMsg || "已复制，可以直接粘贴分享！");
    } catch (e) {
      showToast("当前浏览器不支持自动复制，请长按截图分享");
    }
    document.body.removeChild(ta);
  }

  // Navigation Tabs
  var navTabs = document.querySelectorAll(".nav-tab");
  var panels = document.querySelectorAll(".module-panel");

  navTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.getAttribute("data-target");
      navTabs.forEach(function (t) {
        t.classList.toggle("active", t === tab);
      });
      panels.forEach(function (p) {
        p.classList.toggle("active", p.id === target);
      });
    });
  });

  // =========================================================
  // Module 1: Aesthetic Style Quiz (10 questions, 4 styles)
  // =========================================================
  var STYLE_PROFILES = {
    cool: {
      name: "清冷智性风",
      season: "夏季冷调 / 柔冷色系",
      tag: "自带书卷气与距离美",
      quote: "「不用用力凹造型，极简剪裁和冷调留白就是你的高级感。」",
      swatches: [
        { name: "雾霭蓝", hex: "#9EB2C4" },
        { name: "冷燕麦", hex: "#E7E3DC" },
        { name: "干枯玫瑰", hex: "#B88A8E" },
        { name: "烟灰炭", hex: "#4D545C" }
      ],
      advice: "首选垂坠感西装、真丝/天丝衬衫、直筒西裤与细框银饰；妆容强调干净清透的哑光底妆与低饱和豆沙/梅子调唇色。",
      avoid: "避开过于繁复的蕾丝荷叶边、高饱和荧光橘以及大面积土黄色，容易显得沉闷或俗气。"
    },
    gentle: {
      name: "温柔千金风",
      season: "春季暖调 / 浅净色系",
      tag: "明媚舒展 · 好嫁又显贵",
      quote: "「把温柔穿在身上，像春日午后刚沏好的一杯伯爵奶茶。」",
      swatches: [
        { name: "奶油杏", hex: "#F3E5D4" },
        { name: "蜜桃裸粉", hex: "#E5B4AE" },
        { name: "香槟金", hex: "#D6BC96" },
        { name: "浅摩卡", hex: "#9E8271" }
      ],
      advice: "适合小香风短外套、针织开衫、A字半身裙与珍珠/浅金色耳饰；妆容重点在于水光肌感、粉嫩腮红与清甜杏粉色唇釉。",
      avoid: "尽量少穿全身沉重暗黑或过于硬朗的机能工装，容易压住你原本明媚轻盈的气色。"
    },
    relaxed: {
      name: "松弛感日常风",
      season: "秋季柔暖 / 大地莫兰迪",
      tag: "不费力时髦 · 耐看氛围感",
      quote: "「舒服比完美更重要，你走过的地方连风都慢了半拍。」",
      swatches: [
        { name: "鼠尾草绿", hex: "#8B9C8B" },
        { name: "焦糖拿铁", hex: "#A87B5D" },
        { name: "米白亚麻", hex: "#F4EFE6" },
        { name: "橄榄深棕", hex: "#5C5248" }
      ],
      advice: "多选棉麻、羊绒、水洗丹宁等天然肌理面料，用廓形风衣、宽松卫衣叠穿营造松弛度，搭配琥珀或做旧金属配饰。",
      avoid: "避开紧绷反光的化纤亮片材质和过度甜腻的荧光粉，会破坏整体的天然高级感。"
    },
    sweetcool: {
      name: "元气甜酷风",
      season: "冬季高对比 / 净色系",
      tag: "一眼惊艳 · 辣妹与少女并存",
      quote: "「规矩是用来打破的，黑与红之间，你就是全场焦点。」",
      swatches: [
        { name: "正黑墨", hex: "#262324" },
        { name: "车厘子红", hex: "#9E3640" },
        { name: "冷光白", hex: "#F7F8FA" },
        { name: "电光牛仔", hex: "#445E82" }
      ],
      advice: "大胆尝试“上紧下松”或“甜美+硬朗”混搭（如缎面吊带裙配皮衣/马丁靴），用高对比度配色和流畅眼线放大五官明艳度。",
      avoid: "避开灰蒙蒙、毫无对比度的浑浊浅色系全身叠穿，容易让你看起来气色发灰、没精神。"
    }
  };

  var STYLE_QUESTIONS = [
    {
      q: "照镜子时，你觉得自己最容易被夸的氛围感是？",
      opts: [
        { k: "A", t: "看起来很聪明冷静，自带距离感和书卷气", s: "cool" },
        { k: "B", t: "笑起来很甜很亲切，像被宠爱长大的女生", s: "gentle" },
        { k: "C", t: "舒服自然、不紧绷，相处起来特别让人放松", s: "relaxed" },
        { k: "D", t: "五官明艳有记忆点，酷里带点古灵精怪", s: "sweetcool" }
      ]
    },
    {
      q: "挑金属饰品时，戴在手上哪一种更显你手白、更有质感？",
      opts: [
        { k: "A", t: "银色、铂金或冷调碎钻，越细越高级", s: "cool" },
        { k: "B", t: "玫瑰金、浅金色或温润珍珠", s: "gentle" },
        { k: "C", t: "复古做旧金、木质或琥珀感饰品", s: "relaxed" },
        { k: "D", t: "存在感强的亮银链条或异形设计款", s: "sweetcool" }
      ]
    },
    {
      q: "打开你的衣柜，占比最高的颜色通常是？",
      opts: [
        { k: "A", t: "灰蓝、冷白、浅灰、藏青等冷调基础色", s: "cool" },
        { k: "B", t: "奶白、浅杏、淡粉、浅鹅黄等柔亮浅色", s: "gentle" },
        { k: "C", t: "燕麦色、卡其、军绿、咖啡棕等大地色", s: "relaxed" },
        { k: "D", t: "纯黑、纯白、正红或高饱和撞色", s: "sweetcool" }
      ]
    },
    {
      q: "周末和闺蜜去逛街喝下午茶，你最想穿哪一套出门？",
      opts: [
        { k: "A", t: "垂坠感蓝色衬衫 + 白色直筒西裤 + 乐福鞋", s: "cool" },
        { k: "B", t: "软糯针织开衫 + 奶杏色百褶裙 + 玛丽珍鞋", s: "gentle" },
        { k: "C", t: "宽松条纹T恤 + 阔腿牛仔裤 + 帆布托特包", s: "relaxed" },
        { k: "D", t: "短款修身上衣 + 工装半裙 + 厚底小皮靴", s: "sweetcool" }
      ]
    },
    {
      q: "买口红时，你涂上嘴最显气色、最常回购的色系是？",
      opts: [
        { k: "A", t: "灰调豆沙粉、冷梅子色或玫瑰茶棕", s: "cool" },
        { k: "B", t: "蜜桃乌龙、水蜜桃粉或清透肉桂奶茶", s: "gentle" },
        { k: "C", t: "暖调红茶棕、焦糖南瓜或吃土裸橘色", s: "relaxed" },
        { k: "D", t: "复古正红、车厘子色或浓郁浆果色", s: "sweetcool" }
      ]
    },
    {
      q: "你买衣服最容易“踩雷闲置”的款式通常是？",
      opts: [
        { k: "A", t: "太甜太碎花、到处是蝴蝶结的款式，穿不出门", s: "cool" },
        { k: "B", t: "过于暗沉老气、版型死板的深灰黑职业装", s: "gentle" },
        { k: "C", t: "勒得慌、面料硬邦邦且需要时刻吸肚子的衣服", s: "relaxed" },
        { k: "D", t: "毫无特色、灰扑扑没精神的路人款基础衫", s: "sweetcool" }
      ]
    },
    {
      q: "挑一个日常通勤/上课每天都要背的包包，你会选？",
      opts: [
        { k: "A", t: "线条利落的冷灰或黑色极简风琴包/公文包", s: "cool" },
        { k: "B", t: "奶白色小羊皮链条包或精致小巧的水桶包", s: "gentle" },
        { k: "C", t: "柔软能装的麂皮半月包或法式草编/帆布包", s: "relaxed" },
        { k: "D", t: "造型感强的银色腋下包或酷感铆钉小方包", s: "sweetcool" }
      ]
    },
    {
      q: "如果去拍一组个人写真，你最偏爱的光影和场景是？",
      opts: [
        { k: "A", t: "美术馆白墙、雨后玻璃窗边，清冷干净的胶片感", s: "cool" },
        { k: "B", t: "花园草坪、法式甜品店，阳光柔和的复古少女感", s: "gentle" },
        { k: "C", t: "海边日落、森林木屋或旧书店，风吹乱头发的自然感", s: "relaxed" },
        { k: "D", t: "城市霓虹街头、黑白棚拍闪光灯，张力拉满的大片感", s: "sweetcool" }
      ]
    },
    {
      q: "你平时买穿搭单品时，最优先考虑哪个要素？",
      opts: [
        { k: "A", t: "剪裁版型是否高级，能不能穿出干练质感", s: "cool" },
        { k: "B", t: "显不显温柔白净，细节是不是精致甜美", s: "gentle" },
        { k: "C", t: "面料亲肤度和活动自如度，要能穿很多年", s: "relaxed" },
        { k: "D", t: "有没有设计亮点，上身够不够惊艳出片", s: "sweetcool" }
      ]
    },
    {
      q: "选一款最能代表你理想状态的香调，你会选？",
      opts: [
        { k: "A", t: "雪松、冷冽白茶或雨后青苔的清冷木质调", s: "cool" },
        { k: "B", t: "白桃、橙花与淡淡奶香交织的清甜花果调", s: "gentle" },
        { k: "C", t: "无花果叶、晒过太阳的棉麻与淡淡柑橘调", s: "relaxed" },
        { k: "D", t: "黑醋栗、广藿玫瑰或带点微醺感的辛辣花香", s: "sweetcool" }
      ]
    }
  ];

  var quizState = { idx: 0, answers: new Array(STYLE_QUESTIONS.length).fill(null), lastKey: null };
  var quizStage = document.getElementById("quiz-stage");
  var quizResultWrap = document.getElementById("quiz-result-wrap");
  var qNumEl = document.getElementById("quiz-q-num");
  var qFillEl = document.getElementById("quiz-q-fill");
  var qTitleEl = document.getElementById("quiz-q-title");
  var qOptsEl = document.getElementById("quiz-q-opts");
  var qPrevBtn = document.getElementById("quiz-prev-btn");

  function renderStyleQuiz() {
    var i = quizState.idx;
    var item = STYLE_QUESTIONS[i];
    qNumEl.textContent = (i + 1) + " / " + STYLE_QUESTIONS.length;
    qFillEl.style.width = Math.round(((i + 1) / STYLE_QUESTIONS.length) * 100) + "%";
    qTitleEl.textContent = (i + 1) + ". " + item.q;
    qOptsEl.innerHTML = "";

    item.opts.forEach(function (o) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-opt-btn" + (quizState.answers[i] === o.s ? " selected" : "");
      btn.innerHTML = '<span class="quiz-opt-key">' + o.k + '</span><span>' + o.t + '</span>';
      btn.addEventListener("click", function () {
        quizState.answers[i] = o.s;
        if (i < STYLE_QUESTIONS.length - 1) {
          quizState.idx += 1;
          renderStyleQuiz();
        } else {
          showStyleResult();
        }
      });
      qOptsEl.appendChild(btn);
    });

    qPrevBtn.disabled = i === 0;
  }

  function showStyleResult() {
    var counts = { cool: 0, gentle: 0, relaxed: 0, sweetcool: 0 };
    quizState.answers.forEach(function (s) {
      if (s && counts[s] !== undefined) counts[s] += 1;
    });
    var winner = Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a];
    })[0];

    quizState.lastKey = winner;
    var profile = STYLE_PROFILES[winner];

    document.getElementById("res-season").textContent = profile.season;
    document.getElementById("res-tag").textContent = profile.tag;
    document.getElementById("res-style-name").textContent = profile.name;
    document.getElementById("res-quote").textContent = profile.quote;
    document.getElementById("res-advice").textContent = profile.advice;
    document.getElementById("res-avoid").textContent = profile.avoid;

    var paletteEl = document.getElementById("res-palette");
    paletteEl.innerHTML = "";
    profile.swatches.forEach(function (sw) {
      var div = document.createElement("div");
      div.className = "swatch-item";
      div.innerHTML =
        '<div class="swatch-color" style="background:' + sw.hex + '"></div>' +
        '<div class="swatch-name">' + sw.name + '</div>';
      paletteEl.appendChild(div);
    });

    quizStage.style.display = "none";
    quizResultWrap.style.display = "block";
  }

  qPrevBtn.addEventListener("click", function () {
    if (quizState.idx > 0) {
      quizState.idx -= 1;
      renderStyleQuiz();
    }
  });

  document.getElementById("quiz-retry-btn").addEventListener("click", function () {
    document.body.classList.remove("poster-mode");
    quizState = { idx: 0, answers: new Array(STYLE_QUESTIONS.length).fill(null), lastKey: null };
    quizResultWrap.style.display = "none";
    quizStage.style.display = "block";
    renderStyleQuiz();
  });

  document.getElementById("quiz-poster-btn").addEventListener("click", function () {
    document.body.classList.add("poster-mode");
    showToast("已进入纯净截图模式，可直接截屏发小红书或朋友圈！");
  });

  document.getElementById("poster-exit-btn").addEventListener("click", function () {
    document.body.classList.remove("poster-mode");
  });

  document.getElementById("quiz-copy-btn").addEventListener("click", function () {
    if (!quizState.lastKey) return;
    var p = STYLE_PROFILES[quizState.lastKey];
    copyText(
      "【悦己志 · 审美风格自测】\n我的本命风格是：" + p.name + "（" + p.season + "）\n" +
      p.quote + "\n显白配色：" + p.swatches.map(function (s) { return s.name; }).join(" / "),
      "已复制风格结果文案！"
    );
  });

  renderStyleQuiz();

  // =========================================================
  // Module 2: Mood Blind Box & Daily Fortune
  // =========================================================
  var FORTUNES = [
    { no: "第 01 签 · 清醒上上签", kw: "稳住内核", text: "今天不必讨好任何人。把精力收回来放在自己身上，你只要把今天这一小步走踏实，就已经胜过百分之八十的焦虑。", colorName: "鼠尾草绿", colorHex: "#6F8272", item: "冰美式 / 热乌龙" },
    { no: "第 02 签 · 治愈上签", kw: "允许慢半拍", text: "允许自己今天效率低一点，也允许有些事暂时没答案。先好好吃一顿热饭，太阳下山前烦恼会变轻的。", colorName: "奶油杏", colorHex: "#E8D5BE", item: "香薰蜡烛" },
    { no: "第 03 签 · 好运旺旺签", kw: "直觉准星", text: "今天你第一眼觉得靠谱的人或选择，大概率就是对的。相信自己的女性直觉，别在细节里反复内耗。", colorName: "玫瑰豆沙", colorHex: "#B56565", item: "珍珠耳钉" },
    { no: "第 04 签 · 丰盛签", kw: "值得更好的", text: "不要因为打折或凑单就买将就的东西。你值得把预算留给真正让你眼睛发亮、穿戴十次依然喜欢的好物。", colorName: "香槟金", colorHex: "#D6BC96", item: "真丝发圈" },
    { no: "第 05 签 · 松弛签", kw: "屏蔽噪音", text: "别人的进度条和你无关。关掉让你焦虑的社交动态，今天只专注做好手头一件能让你变美或变强的事。", colorName: "雾霭蓝", colorHex: "#9EB2C4", item: "降噪耳机" },
    { no: "第 06 签 · 破局签", kw: "先做再说", text: "拖延了很久的那件小事，其实只需要五分钟就能开个头。动起来之后，完美主义的恐惧就会立刻散去。", colorName: "焦糖拿铁", colorHex: "#A87B5D", item: "顺滑中性笔" },
    { no: "第 07 签 · 桃花与灵感签", kw: "自带光芒", text: "今天很适合涂一支喜欢的口红出门走走。当你开始认真欣赏自己，好消息和善意也会顺着风找上门。", colorName: "蜜桃粉", colorHex: "#E5B4AE", item: "镜面唇釉" },
    { no: "第 08 签 · 招财聚气签", kw: "清醒消费", text: "守住钱包也是高级自律！下单前先等三分钟，把省下来的钱放进自己的旅行或技能基金里，底气会越来越足。", colorName: "橄榄绿", colorHex: "#7A8B71", item: "记账小本" }
  ];

  var CALM_MSGS = [
    "呼气——那些不重要的人和事，退退退！",
    "烦恼清零 +1，今天只准自己开心。",
    "深呼吸，你已经做得够好了，放过自己五分钟。",
    "没关系，地球少了你的内耗一样转得很好。",
    "坏情绪已打包丢进回收站，请查收好心情！"
  ];

  var currentFortuneIdx = new Date().getDate() % FORTUNES.length;
  var calmData = loadStore("yjz_calm", { date: new Date().toDateString(), count: 0 });
  if (calmData.date !== new Date().toDateString()) {
    calmData = { date: new Date().toDateString(), count: 0 };
    saveStore("yjz_calm", calmData);
  }

  function renderFortune() {
    var f = FORTUNES[currentFortuneIdx];
    document.getElementById("fortune-no").textContent = f.no;
    document.getElementById("fortune-kw").textContent = f.kw;
    document.getElementById("fortune-text").textContent = f.text;
    document.getElementById("fortune-color-dot").style.background = f.colorHex;
    document.getElementById("fortune-color-name").textContent = f.colorName;
    document.getElementById("fortune-item").textContent = f.item;
  }

  document.getElementById("fortune-draw-btn").addEventListener("click", function () {
    var nextIdx = Math.floor(Math.random() * FORTUNES.length);
    if (nextIdx === currentFortuneIdx) nextIdx = (nextIdx + 1) % FORTUNES.length;
    currentFortuneIdx = nextIdx;
    renderFortune();
  });

  document.getElementById("fortune-copy-btn").addEventListener("click", function () {
    var f = FORTUNES[currentFortuneIdx];
    copyText("【悦己志 · 今日灵感签】\n" + f.no + "｜" + f.kw + "\n“" + f.text + "”\n今日幸运色：" + f.colorName + " · 幸运小物：" + f.item, "已复制今日签文！");
  });

  var calmCountEl = document.getElementById("calm-count");
  var calmMsgEl = document.getElementById("calm-msg");
  calmCountEl.textContent = calmData.count;

  document.getElementById("calm-tap-btn").addEventListener("click", function () {
    calmData.count += 1;
    saveStore("yjz_calm", calmData);
    calmCountEl.textContent = calmData.count;
    calmMsgEl.textContent = CALM_MSGS[calmData.count % CALM_MSGS.length];
  });

  renderFortune();

  // =========================================================
  // Module 3: Skincare Checker & Curated Decision List
  // =========================================================
  var INGREDIENTS = [
    { id: "vc", name: "原型维C" },
    { id: "nia", name: "烟酰胺" },
    { id: "acid", name: "水杨酸 / 果酸" },
    { id: "retinol", name: "A醇 / 视黄醇" },
    { id: "bose", name: "玻色因 / 胜肽" },
    { id: "b5", name: "B5 / 积雪草" }
  ];

  var selectedIngs = ["vc", "b5"];
  var ingWrap = document.getElementById("ing-chips");
  var checkerOut = document.getElementById("checker-output");

  function renderIngredients() {
    ingWrap.innerHTML = "";
    INGREDIENTS.forEach(function (ing) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip-btn" + (selectedIngs.indexOf(ing.id) !== -1 ? " active" : "");
      btn.textContent = ing.name;
      btn.addEventListener("click", function () {
        var pos = selectedIngs.indexOf(ing.id);
        if (pos === -1) selectedIngs.push(ing.id);
        else selectedIngs.splice(pos, 1);
        renderIngredients();
        evaluateSkincare();
      });
      ingWrap.appendChild(btn);
    });
  }

  function evaluateSkincare() {
    if (selectedIngs.length === 0) {
      checkerOut.innerHTML = '<div class="alert-item alert-ok">请点击上方你正在使用的护肤成分，自动为你检测冲突与早晚搭配顺序。</div>';
      return;
    }

    var has = function (id) { return selectedIngs.indexOf(id) !== -1; };
    var warnings = [];
    var morning = [];
    var night = [];

    if (has("acid") && has("retinol")) {
      warnings.push("高浓度「水杨酸/果酸」与「A醇」同晚叠加极易引起脱皮泛红，建议隔天交替使用（周一刷酸、周二A醇）。");
    }
    if (has("vc") && has("acid")) {
      warnings.push("「原型维C」与「酸类」均为低pH值酸性成分，同时叠加容易刺痛，建议维C放白天、酸类放晚上。");
    }
    if (has("nia") && has("vc")) {
      warnings.push("部分高浓度原型维C与烟酰胺同用可能出现轻微泛红（耐受皮可忽略），敏感肌建议早维C、晚烟酰胺分开用。");
    }

    if (has("vc")) morning.push("原型维C（抗氧化提亮）");
    if (has("nia") && !has("vc")) morning.push("烟酰胺（控油提亮）");
    if (has("bose")) morning.push("玻色因/胜肽（温和抗初老）");
    if (has("b5")) morning.push("B5/积雪草（日间维稳修护）");
    morning.push("防晒霜（白天必须！）");

    if (has("retinol")) night.push("A醇（夜间抗老淡纹，注意避光）");
    if (has("acid")) night.push("水杨酸/果酸（局部疏通闭口，每周1-2次）");
    if (has("nia") && has("vc")) night.push("烟酰胺（夜间配合修护）");
    if (has("bose")) night.push("玻色因/胜肽（加强夜间修护）");
    if (has("b5")) night.push("B5/积雪草（兜底舒缓屏障）");

    var html = "";
    if (warnings.length > 0) {
      warnings.forEach(function (w) {
        html += '<div class="alert-item alert-warn">⚠️ 冲突提醒：' + w + '</div>';
      });
    } else {
      html += '<div class="alert-item alert-ok">✅ 你勾选的成分搭配很安全，没有明显冲突！</div>';
    }

    html += '<div class="routine-box"><strong>☀️ 建议白天：</strong>' + morning.join(" → ") +
      '<br><strong>🌙 建议夜间：</strong>' + (night.length ? night.join(" → ") : "温和洁面 → 基础保湿霜即可") + '</div>';

    checkerOut.innerHTML = html;
  }

  renderIngredients();
  evaluateSkincare();

  var GOODS = [
    { name: "温和氨基酸洁面慕斯", budget: "low", scene: "skincare", price: "约 ¥59", fit: "早八宿舍党 / 混油敏肌", pit: "避坑：别选皂基强力去油款，越洗越干", code: "【预留好物口令：CLEAN01】" },
    { name: "轻薄水感防晒乳（SPF50+）", budget: "mid", scene: "skincare", price: "约 ¥138", fit: "通勤军训 / 怕搓泥人群", pit: "避坑：涂够一元硬币大小才有效，别只点涂", code: "【预留好物口令：SUN02】" },
    { name: "高浓度B5修护精华", budget: "mid", scene: "skincare", price: "约 ¥168", fit: "刷酸翻车 / 换季泛红肌", pit: "避坑：油皮夏天薄涂即可，厚敷容易闷", code: "【预留好物口令：REPAIR03】" },
    { name: "磁吸桌面折叠化妆镜（带补光）", budget: "low", scene: "dorm", price: "约 ¥69", fit: "宿舍光线暗 / 租房小桌面", pit: "避坑：选显色度 Ra≥95 的自然光款，别买冷白蓝光", code: "【预留好物口令：DORM04】" },
    { name: "便携静音无线直发梳", budget: "mid", scene: "dorm", price: "约 ¥159", fit: "宿舍限电 / 沙发炸毛星人", pit: "避坑：确认宿舍允许功率，优先选负离子防烫款", code: "【预留好物口令：HAIR05】" },
    { name: "头层牛皮大容量托特包", budget: "high", scene: "outfit", price: "约 ¥399", fit: "装14寸电脑 / 实习通勤女生", pit: "避坑：选空包自重低于650g的，不然背一天肩膀痛", code: "【预留好物口令：BAG06】" },
    { name: "可机洗垂感直筒西装裤", budget: "mid", scene: "outfit", price: "约 ¥149", fit: "梨形身材 / 伪素颜出门", pit: "避坑：看准裤长选高腰九分或拖地，别卡在脚踝最粗处", code: "【预留好物口令：PANTS07】" },
    { name: "真丝防压痕低敏发圈礼盒", budget: "low", scene: "outfit", price: "约 ¥45", fit: "细软塌发质 / 送闺蜜小礼物", pit: "避坑：认准 6A 级 22 姆米桑蚕丝，化纤仿丝易静电", code: "【预留好物口令：SILK08】" }
  ];

  var budgetFilter = document.getElementById("filter-budget");
  var sceneFilter = document.getElementById("filter-scene");
  var goodsGrid = document.getElementById("goods-grid");

  function renderGoods() {
    var b = budgetFilter.value;
    var s = sceneFilter.value;
    var list = GOODS.filter(function (g) {
      return (b === "all" || g.budget === b) && (s === "all" || g.scene === s);
    });

    goodsGrid.innerHTML = "";
    if (list.length === 0) {
      goodsGrid.innerHTML = '<p class="section-desc">该筛选条件下暂无清单，试试切换全部预算或场景。</p>';
      return;
    }

    list.forEach(function (g) {
      var card = document.createElement("div");
      card.className = "good-card";
      card.innerHTML =
        '<div>' +
          '<div class="good-top"><span class="good-name">' + g.name + '</span><span class="good-price">' + g.price + '</span></div>' +
          '<p class="good-meta" style="margin-top:6px;"><strong>适合：</strong>' + g.fit + '</p>' +
          '<p class="good-meta">' + g.pit + '</p>' +
        '</div>' +
        '<button type="button" class="btn btn-outline btn-sm">复制推荐口令 / 链接位</button>';

      card.querySelector("button").addEventListener("click", function () {
        copyText(g.name + " " + g.code, "已复制口令位（上线后可替换为你的真实推广链接）");
      });
      goodsGrid.appendChild(card);
    });
  }

  budgetFilter.addEventListener("change", renderGoods);
  sceneFilter.addEventListener("change", renderGoods);
  renderGoods();

  // =========================================================
  // Module 4: Self-Discipline & Habit Workbench
  // =========================================================
  var pomoTimer = null;
  var pomoModeMins = 25;
  var pomoSecs = 25 * 60;
  var pomoRunning = false;
  var pomoStats = loadStore("yjz_pomo", { date: new Date().toDateString(), done: 0 });
  if (pomoStats.date !== new Date().toDateString()) {
    pomoStats = { date: new Date().toDateString(), done: 0 };
    saveStore("yjz_pomo", pomoStats);
  }

  var pomoTimeEl = document.getElementById("pomo-time");
  var pomoDoneEl = document.getElementById("pomo-done");
  var pomoStartBtn = document.getElementById("pomo-start-btn");

  function updatePomoUI() {
    var m = String(Math.floor(pomoSecs / 60)).padStart(2, "0");
    var s = String(pomoSecs % 60).padStart(2, "0");
    pomoTimeEl.textContent = m + ":" + s;
    pomoDoneEl.textContent = pomoStats.done;
    pomoStartBtn.textContent = pomoRunning ? "暂停计时" : "开始专注";
  }

  document.querySelectorAll(".pomo-mode-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      clearInterval(pomoTimer);
      pomoRunning = false;
      pomoModeMins = Number(btn.getAttribute("data-mins")) || 25;
      pomoSecs = pomoModeMins * 60;
      document.querySelectorAll(".pomo-mode-btn").forEach(function (b) {
        b.classList.toggle("active", b === btn);
      });
      updatePomoUI();
    });
  });

  pomoStartBtn.addEventListener("click", function () {
    if (pomoRunning) {
      clearInterval(pomoTimer);
      pomoRunning = false;
      updatePomoUI();
      return;
    }
    pomoRunning = true;
    updatePomoUI();
    clearInterval(pomoTimer);
    pomoTimer = setInterval(function () {
      if (pomoSecs > 0) {
        pomoSecs -= 1;
        updatePomoUI();
      } else {
        clearInterval(pomoTimer);
        pomoRunning = false;
        if (pomoModeMins >= 20) {
          pomoStats.done += 1;
          saveStore("yjz_pomo", pomoStats);
        }
        pomoSecs = pomoModeMins * 60;
        updatePomoUI();
        showToast("这一轮专注完成啦！喝口水休息一下吧～");
      }
    }, 1000);
  });

  document.getElementById("pomo-reset-btn").addEventListener("click", function () {
    clearInterval(pomoTimer);
    pomoRunning = false;
    pomoSecs = pomoModeMins * 60;
    updatePomoUI();
  });

  updatePomoUI();

  // Countdowns
  function getDefaultCountdowns() {
    var d1 = new Date();
    d1.setDate(d1.getDate() + 28);
    var d2 = new Date();
    d2.setDate(d2.getDate() + 65);
    return [
      { id: "cd1", title: "30天变美习惯验收", date: d1.toISOString().slice(0, 10) },
      { id: "cd2", title: "下一场海边轻旅行", date: d2.toISOString().slice(0, 10) }
    ];
  }

  var countdowns = loadStore("yjz_countdowns", getDefaultCountdowns());
  var cdListEl = document.getElementById("countdown-list");

  function renderCountdowns() {
    cdListEl.innerHTML = "";
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    countdowns.forEach(function (cd) {
      var target = new Date(cd.date + "T00:00:00");
      var diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
      var label = diff > 0 ? "还有 " + diff + " 天" : (diff === 0 ? "就是今天！" : "已过 " + Math.abs(diff) + " 天");

      var row = document.createElement("div");
      row.className = "countdown-item";
      row.innerHTML =
        '<span>' + cd.title + ' <small style="color:#9a9089;">(' + cd.date + ')</small></span>' +
        '<div><span class="countdown-days">' + label + '</span><button type="button" class="del-btn" aria-label="删除">✕</button></div>';

      row.querySelector(".del-btn").addEventListener("click", function () {
        countdowns = countdowns.filter(function (item) { return item.id !== cd.id; });
        saveStore("yjz_countdowns", countdowns);
        renderCountdowns();
      });
      cdListEl.appendChild(row);
    });
  }

  document.getElementById("cd-add-btn").addEventListener("click", function () {
    var titleInput = document.getElementById("cd-title-input");
    var dateInput = document.getElementById("cd-date-input");
    var title = titleInput.value.trim();
    var date = dateInput.value;
    if (!title || !date) {
      showToast("请填写目标名称和日期哦");
      return;
    }
    countdowns.unshift({ id: "cd_" + Date.now(), title: title, date: date });
    saveStore("yjz_countdowns", countdowns);
    titleInput.value = "";
    dateInput.value = "";
    renderCountdowns();
  });

  renderCountdowns();

  // 30-day Micro Habits
  var HABIT_ITEMS = [
    { id: "h1", name: "23:30前放下手机" },
    { id: "h2", name: "喝够1500ml温水" },
    { id: "h3", name: "白天认真涂防晒" },
    { id: "h4", name: "阅读或学英语20分钟" },
    { id: "h5", name: "拉伸或燃脂15分钟" },
    { id: "h6", name: "不喝高糖奶茶" }
  ];

  var todayKey = new Date().toISOString().slice(0, 10);
  var habitLog = loadStore("yjz_habits", { days: {} });
  if (!habitLog.days[todayKey]) habitLog.days[todayKey] = [];

  var habitGridEl = document.getElementById("habit-grid");
  var habitDotsEl = document.getElementById("habit-dots");
  var habitSummaryEl = document.getElementById("habit-summary");

  function renderHabits() {
    var todayDone = habitLog.days[todayKey] || [];
    habitGridEl.innerHTML = "";

    HABIT_ITEMS.forEach(function (h) {
      var isDone = todayDone.indexOf(h.id) !== -1;
      var card = document.createElement("div");
      card.className = "habit-item" + (isDone ? " done" : "");
      card.innerHTML = '<span>' + h.name + '</span><span>' + (isDone ? "✓ 已打卡" : "○ 未完成") + '</span>';
      card.addEventListener("click", function () {
        var idx = todayDone.indexOf(h.id);
        if (idx === -1) todayDone.push(h.id);
        else todayDone.splice(idx, 1);
        habitLog.days[todayKey] = todayDone;
        saveStore("yjz_habits", habitLog);
        renderHabits();
      });
      habitGridEl.appendChild(card);
    });

    var activeDays = Object.keys(habitLog.days).filter(function (d) {
      return habitLog.days[d] && habitLog.days[d].length > 0;
    }).length;

    habitSummaryEl.textContent = "今日已完成 " + todayDone.length + " / " + HABIT_ITEMS.length + " 项 · 累计打卡 " + activeDays + " / 30 天";

    habitDotsEl.innerHTML = "";
    for (var i = 0; i < 30; i++) {
      var dot = document.createElement("span");
      dot.className = "dot-cell" + (i < activeDays ? " filled" : "");
      habitDotsEl.appendChild(dot);
    }
  }

  renderHabits();

  // =========================================================
  // Module 5: Weekend Inspiration Blind Box
  // =========================================================
  var WEEKEND_IDEAS = [
    { budget: "free", who: "solo", mood: "chill", title: "“房间电影院与沉浸式护理夜”", plan: "拉上窗帘点一盏暖光台灯，敷片补水面膜重温一部高分法式老电影，泡一杯热洋甘菊茶，把手机调成勿扰模式。", photo: "拍照灵感：拍一张暖光台灯+热茶+电影画面的俯拍虚化照，氛围感满分。", outfit: "穿搭公式：真丝或纯棉浅色睡衣套装 + 蓬松鲨鱼夹。" },
    { budget: "free", who: "bestie", mood: "photo", title: "“城市免费公园野餐与胶片扫街”", plan: "带上家里现有的水果和蓝牙音箱，去城市绿地或江边吹风聊天，顺便互相拍一组日落逆光大片。", photo: "拍照灵感：下午4点半黄金光线侧逆光抓拍撩头发、或者俯拍野餐垫上的手部干杯。", outfit: "穿搭公式：白色连衣裙或浅色针织衫 + 草编包。" },
    { budget: "low", who: "solo", mood: "food", title: "“菜市场寻宝 + 自制Brunch”", plan: "花50块钱逛一次早市买束鲜花、牛油果和贝果，回家给自己做一盘漂亮的早午餐，边听播客边慢慢吃。", photo: "拍照灵感：用纯白餐盘摆盘，窗边自然光斜射，拍完直接能发小红书。", outfit: "穿搭公式：宽松条纹T恤 + 牛仔短裤/阔腿裤 + 帆布包。" },
    { budget: "low", who: "bestie", mood: "photo", title: "“百元内社区咖啡馆 + 中古/买手店巡礼”", plan: "避开网红排队店，在老城区找一家安静的独立咖啡馆点杯特调，再去附近文艺小店逛一圈试戴墨镜和耳环。", photo: "拍照灵感：利用咖啡店门口的复古招牌或玻璃窗反光，拍半身侧颜很有杂志感。", outfit: "穿搭公式：小香风短开衫或西装外套 + 墨镜架在头顶。" },
    { budget: "low", who: "date", mood: "chill", title: "“傍晚美术馆 + 街角小酒馆散步”", plan: "下午一起看一场城市小型艺术展，散场后沿林荫路慢慢散步聊展品，再去街角吃一碗热腾腾的拉面或小火锅。", photo: "拍照灵感：在美术馆纯白几何走廊里拍背影牵手或看展侧影。", outfit: "穿搭公式：垂感针织长裙 + 简约单肩包 + 低马尾。" },
    { budget: "treat", who: "bestie", mood: "food", title: "“高空下午茶 + 微醺Bistro夜聊”", plan: "挑一家景观好的酒店或露台餐厅吃顿精致甜品，晚上转场去氛围柔和的Bistro喝杯低度果酒，吐槽近况庆祝活着。", photo: "拍照灵感：开启手机闪光灯拍夜间举杯碰杯照，皮肤通透又复古。", outfit: "穿搭公式：露肩针织上衣或缎面半裙 + 珍珠耳饰。" },
    { budget: "treat", who: "date", mood: "photo", title: "“城市周边温泉私汤 / 设计师民宿一晚”", plan: "周五下班或周六上午出发去近郊住一晚高颜值民宿，远离工作群彻底放空，顺便把这一周攒的疲惫泡进热水里。", photo: "拍照灵感：清晨推开民宿阳台门看山景/海景的背影照，或者浴袍+早餐托盘。", outfit: "穿搭公式：法式茶歇裙 + 软糯针织披肩。" },
    { budget: "treat", who: "solo", mood: "chill", title: "“独享高端SPA + 书店买一本喜欢的精装书”", plan: "给自己预约一次60分钟肩颈芳香SPA，结束后去安静的书店买一本平时舍不得买的画册或小说，做自己的高能量富养者。", photo: "拍照灵感：拍书店角落的暖灯与刚买的新书封面，配文“把钱花在让自己变松弛的地方”。", outfit: "穿搭公式：米色风衣/羊绒开衫 + 乐福鞋。" }
  ];

  var bbBudget = document.getElementById("bb-budget");
  var bbWho = document.getElementById("bb-who");
  var bbMood = document.getElementById("bb-mood");
  var lastIdea = null;

  function pickWeekendIdea() {
    var b = bbBudget.value;
    var w = bbWho.value;
    var m = bbMood.value;

    var scored = WEEKEND_IDEAS.map(function (item) {
      var score = 0;
      if (item.budget === b) score += 2;
      if (item.who === w) score += 2;
      if (item.mood === m) score += 1;
      return { item: item, score: score };
    }).sort(function (a, b) { return b.score - a.score; });

    var topScore = scored[0].score;
    var pool = scored.filter(function (x) { return x.score === topScore; }).map(function (x) { return x.item; });
    var chosen = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && lastIdea && chosen.title === lastIdea.title) {
      chosen = pool[(pool.indexOf(chosen) + 1) % pool.length];
    }
    lastIdea = chosen;

    document.getElementById("bb-title").textContent = chosen.title;
    document.getElementById("bb-plan").textContent = chosen.plan;
    document.getElementById("bb-photo").textContent = chosen.photo;
    document.getElementById("bb-outfit").textContent = chosen.outfit;
  }

  document.getElementById("bb-draw-btn").addEventListener("click", pickWeekendIdea);
  document.getElementById("bb-copy-btn").addEventListener("click", function () {
    if (!lastIdea) return;
    copyText(
      "【周末灵感盲盒】\n" + lastIdea.title + "\n" +
      "玩法：" + lastIdea.plan + "\n" +
      lastIdea.outfit + "\n" +
      lastIdea.photo,
      "已复制周末方案，快发给闺蜜或对象吧！"
    );
  });

  pickWeekendIdea();
})();
