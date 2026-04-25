const petPhotos = [
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80"
];

const initialState = {
  user: {
    nickname: "Darius",
    city: "上海",
    interests: ["新手养宠", "附近遛狗", "健康提醒"]
  },
  pets: [
    {
      id: "p1",
      name: "奶盖",
      species: "猫",
      breed: "英短",
      sex: "妹妹",
      birthDate: "2023-05-12",
      city: "上海",
      visibility: "公开",
      avatar: petPhotos[0]
    }
  ],
  posts: [
    {
      id: "post1",
      petId: "p1",
      author: "Darius",
      body: "第一次给奶盖建立 PawPaw 档案，顺手记录今天体重 4.2kg。",
      city: "上海",
      topic: "成长记录",
      image: petPhotos[0],
      likes: 24,
      comments: ["好乖！", "这个档案页很适合记录疫苗。"],
      collected: false,
      status: "已通过"
    },
    {
      id: "post2",
      petId: "seed-dog",
      author: "附近宠友",
      body: "世纪公园晚上 7 点有小型犬散步局，位置只公开到片区。",
      city: "上海",
      topic: "附近约玩",
      image: petPhotos[1],
      likes: 41,
      comments: ["报名！", "可以带牵引绳和水碗。"],
      collected: true,
      status: "已通过"
    }
  ],
  questions: [
    {
      id: "q1",
      title: "幼猫第一次驱虫前需要注意什么？",
      tag: "驱虫",
      answers: 3,
      saved: false
    },
    {
      id: "q2",
      title: "狗狗换粮多久比较合适？",
      tag: "喂养",
      answers: 5,
      saved: true
    }
  ],
  healthRecords: [
    {
      id: "h1",
      petId: "p1",
      type: "体重",
      value: "4.2kg",
      date: "2026-04-24"
    },
    {
      id: "h2",
      petId: "p1",
      type: "驱虫",
      value: "外驱已完成",
      date: "2026-04-20"
    }
  ],
  reminders: [
    {
      id: "r1",
      petId: "p1",
      type: "疫苗",
      due: "2026-05-12",
      done: false
    }
  ],
  services: [
    {
      id: "s1",
      name: "毛球星球洗护",
      category: "洗护",
      district: "徐汇区",
      response: "8 分钟内响应",
      rating: "4.8",
      verified: true
    },
    {
      id: "s2",
      name: "安心寄养小屋",
      category: "寄养",
      district: "静安区",
      response: "15 分钟内响应",
      rating: "4.7",
      verified: true
    },
    {
      id: "s3",
      name: "城市宠物医院",
      category: "医院",
      district: "浦东新区",
      response: "电话优先",
      rating: "4.6",
      verified: true
    }
  ],
  leads: [
    {
      id: "l1",
      serviceId: "s1",
      petName: "奶盖",
      message: "想预约周末洗护，猫咪比较胆小。",
      status: "待响应",
      createdAt: "刚刚"
    }
  ],
  reports: [
    {
      id: "m1",
      target: "post2",
      reason: "线下活动需确认安全提示",
      status: "待审核"
    }
  ],
  activeTab: "home",
  feedFilter: "recommend",
  toast: ""
};

let state = loadState();

function loadState() {
  const saved = window.localStorage.getItem("pawpaw-demo-state");
  if (!saved) return structuredClone(initialState);
  try {
    return { ...structuredClone(initialState), ...JSON.parse(saved) };
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  window.localStorage.setItem("pawpaw-demo-state", JSON.stringify(state));
}

function setState(next) {
  state = { ...state, ...next };
  saveState();
  render();
}

function showToast(message) {
  state.toast = message;
  render();
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    state.toast = "";
    render();
  }, 2200);
}

function currentPet() {
  return state.pets[0];
}

function petName(id) {
  return state.pets.find((pet) => pet.id === id)?.name || "城市宠友";
}

function petAvatar(id) {
  return state.pets.find((pet) => pet.id === id)?.avatar || petPhotos[1];
}

function daysUntil(dateText) {
  const today = new Date("2026-04-24T00:00:00");
  const target = new Date(`${dateText}T00:00:00`);
  return Math.max(0, Math.round((target - today) / 86400000));
}

function createPet(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const pet = {
    id: `p${Date.now()}`,
    name: String(form.get("name") || "").trim() || "新宠物",
    species: form.get("species"),
    breed: String(form.get("breed") || "").trim() || "未知品种",
    sex: form.get("sex"),
    birthDate: form.get("birthDate") || "2025-01-01",
    city: state.user.city,
    visibility: "公开",
    avatar: petPhotos[state.pets.length % petPhotos.length]
  };
  state.pets.push(pet);
  saveState();
  showToast(`已创建宠物档案：${pet.name}`);
}

function createPost(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const petId = form.get("petId");
  const body = String(form.get("body") || "").trim();
  if (!body) return showToast("先写一点宠物动态吧");
  state.posts.unshift({
    id: `post${Date.now()}`,
    petId,
    author: state.user.nickname,
    body,
    city: state.user.city,
    topic: form.get("topic"),
    image: petAvatar(petId),
    likes: 0,
    comments: [],
    collected: false,
    status: "待审核"
  });
  state.reports.unshift({
    id: `m${Date.now()}`,
    target: "新动态",
    reason: "新发布内容待审核",
    status: "待审核"
  });
  saveState();
  event.currentTarget.reset();
  showToast("动态已发布，当前状态：待审核");
}

function addHealth(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const record = {
    id: `h${Date.now()}`,
    petId: form.get("petId"),
    type: form.get("type"),
    value: String(form.get("value") || "").trim() || "已记录",
    date: form.get("date") || "2026-04-24"
  };
  state.healthRecords.unshift(record);
  saveState();
  event.currentTarget.reset();
  showToast("健康记录已保存");
}

function addLead(serviceId) {
  const service = state.services.find((item) => item.id === serviceId);
  state.leads.unshift({
    id: `l${Date.now()}`,
    serviceId,
    petName: currentPet().name,
    message: `咨询 ${service.name} 的${service.category}服务`,
    status: "待响应",
    createdAt: "刚刚"
  });
  saveState();
  showToast("已提交服务线索，商家后台可查看");
}

function toggleLike(postId) {
  const post = state.posts.find((item) => item.id === postId);
  post.likes += 1;
  state.activeTab = "messages";
  saveState();
  showToast("点赞成功，消息中心已产生互动通知");
}

function toggleCollect(postId) {
  const post = state.posts.find((item) => item.id === postId);
  post.collected = !post.collected;
  saveState();
  showToast(post.collected ? "已收藏" : "已取消收藏");
}

function approveModeration(id) {
  const item = state.reports.find((report) => report.id === id);
  if (item) item.status = "已处理";
  state.posts.forEach((post) => {
    if (post.status === "待审核") post.status = "已通过";
  });
  saveState();
  showToast("审核任务已处理");
}

function resetDemo() {
  state = structuredClone(initialState);
  saveState();
  render();
  showToast("Demo 数据已重置");
}

function statCards() {
  const activePets = state.pets.length;
  const pending = state.reports.filter((item) => item.status === "待审核").length;
  const leads = state.leads.length;
  const reminderDays = daysUntil(state.reminders[0]?.due || "2026-04-24");
  return `
    <section class="stats" aria-label="核心指标">
      <article><span>${activePets}</span><p>有效宠物档案</p></article>
      <article><span>${state.posts.length}</span><p>宠物动态</p></article>
      <article><span>${leads}</span><p>服务线索</p></article>
      <article><span>${pending}</span><p>待审核</p></article>
      <article><span>${reminderDays}</span><p>天后疫苗提醒</p></article>
    </section>
  `;
}

function hero() {
  const pet = currentPet();
  return `
    <header class="hero">
      <div class="hero-copy">
        <p class="eyebrow">PawPaw MVP Demo</p>
        <h1>宠物档案、附近关系和轻工具先跑起来</h1>
        <p>
          这个 Demo 用一条主链路验证：创建宠物档案，发布宠物动态，记录健康事项，
          发现本地服务，并在后台看到审核和线索。
        </p>
        <div class="hero-actions">
          <button class="primary" data-tab="compose">发布动态</button>
          <button class="secondary" data-tab="health">记录健康</button>
        </div>
      </div>
      <div class="pet-spotlight">
        <img src="${pet.avatar}" alt="${pet.name} 的宠物照片" />
        <div>
          <strong>${pet.name}</strong>
          <span>${pet.species} · ${pet.breed} · ${pet.city}</span>
        </div>
      </div>
    </header>
  `;
}

function nav() {
  const tabs = [
    ["home", "首页"],
    ["nearby", "附近"],
    ["compose", "发布"],
    ["health", "健康"],
    ["services", "服务"],
    ["messages", "消息"],
    ["admin", "后台"]
  ];
  return `
    <nav class="top-nav" aria-label="主导航">
      <div class="brand">
        <span>PawPaw</span>
        <small>工具型宠物社区</small>
      </div>
      <div class="tabs">
        ${tabs
          .map(
            ([id, label]) => `
              <button class="${state.activeTab === id ? "active" : ""}" data-tab="${id}">
                ${label}
              </button>
            `
          )
          .join("")}
      </div>
    </nav>
  `;
}

function homeView() {
  const filters = [
    ["recommend", "推荐"],
    ["latest", "最新"],
    ["following", "关注"],
    ["city", "城市"]
  ];
  return `
    ${hero()}
    ${statCards()}
    <section class="section-heading">
      <div>
        <p class="eyebrow">Feed</p>
        <h2>宠物动态流</h2>
      </div>
      <div class="segmented">
        ${filters
          .map(
            ([id, label]) => `
              <button class="${state.feedFilter === id ? "active" : ""}" data-filter="${id}">
                ${label}
              </button>
            `
          )
          .join("")}
      </div>
    </section>
    <section class="feed">
      ${state.posts.map(postCard).join("")}
    </section>
  `;
}

function postCard(post) {
  return `
    <article class="post-card">
      <img src="${post.image}" alt="${petName(post.petId)} 的动态图片" />
      <div class="post-body">
        <div class="post-meta">
          <span>${petName(post.petId)}</span>
          <small>${post.city} · ${post.topic} · ${post.status}</small>
        </div>
        <p>${post.body}</p>
        <div class="post-actions">
          <button data-like="${post.id}">赞 ${post.likes}</button>
          <button data-collect="${post.id}">${post.collected ? "已收藏" : "收藏"}</button>
          <button data-report="${post.id}">举报</button>
        </div>
      </div>
    </article>
  `;
}

function nearbyView() {
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Nearby</p>
        <h2>${state.user.city} · 片区级附近</h2>
      </div>
      <span class="privacy-pill">默认不展示精确坐标</span>
    </section>
    <section class="two-column">
      <div class="panel">
        <h3>附近宠友</h3>
        ${state.pets
          .map(
            (pet) => `
              <div class="list-row">
                <img src="${pet.avatar}" alt="${pet.name}" />
                <div>
                  <strong>${pet.name}</strong>
                  <span>${pet.species} · ${pet.breed} · ${pet.city}</span>
                </div>
              </div>
            `
          )
          .join("")}
        <div class="list-row">
          <img src="${petPhotos[2]}" alt="附近宠物" />
          <div>
            <strong>糯米</strong>
            <span>狗 · 柯基 · 徐汇区</span>
          </div>
        </div>
      </div>
      <div class="panel">
        <h3>宠物友好地点</h3>
        ${["世纪公园草坪", "徐汇滨江步道", "静安宠物友好咖啡"].map(
          (place) => `
            <div class="place-row">
              <strong>${place}</strong>
              <span>公开到片区 · 适合约玩和活动</span>
            </div>
          `
        ).join("")}
      </div>
    </section>
  `;
}

function composeView() {
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Create</p>
        <h2>发布宠物动态</h2>
      </div>
    </section>
    <section class="two-column">
      <form class="panel form" id="post-form">
        <label>
          关联宠物
          <select name="petId">
            ${state.pets.map((pet) => `<option value="${pet.id}">${pet.name}</option>`).join("")}
          </select>
        </label>
        <label>
          话题
          <select name="topic">
            <option>成长记录</option>
            <option>附近约玩</option>
            <option>新手求助</option>
            <option>宠物友好地点</option>
          </select>
        </label>
        <label>
          内容
          <textarea name="body" rows="6" placeholder="今天发生了什么？"></textarea>
        </label>
        <button class="primary" type="submit">发布并进入审核</button>
      </form>
      <form class="panel form" id="pet-form">
        <h3>快速创建宠物档案</h3>
        <label>名字 <input name="name" placeholder="例如：布丁" /></label>
        <label>
          物种
          <select name="species">
            <option>猫</option>
            <option>狗</option>
          </select>
        </label>
        <label>品种 <input name="breed" placeholder="例如：金渐层" /></label>
        <label>
          性别
          <select name="sex">
            <option>妹妹</option>
            <option>弟弟</option>
            <option>未知</option>
          </select>
        </label>
        <label>生日 <input type="date" name="birthDate" value="2025-01-01" /></label>
        <button class="secondary" type="submit">创建档案</button>
      </form>
    </section>
  `;
}

function healthView() {
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Health</p>
        <h2>健康记录与提醒</h2>
      </div>
      <span class="privacy-pill">健康数据默认不用于广告</span>
    </section>
    <section class="two-column">
      <form class="panel form" id="health-form">
        <label>
          宠物
          <select name="petId">
            ${state.pets.map((pet) => `<option value="${pet.id}">${pet.name}</option>`).join("")}
          </select>
        </label>
        <label>
          类型
          <select name="type">
            <option>体重</option>
            <option>疫苗</option>
            <option>驱虫</option>
            <option>绝育</option>
            <option>喂养</option>
          </select>
        </label>
        <label>记录 <input name="value" placeholder="例如：4.3kg / 已完成" /></label>
        <label>日期 <input type="date" name="date" value="2026-04-24" /></label>
        <button class="primary" type="submit">保存记录</button>
      </form>
      <div class="panel">
        <h3>记录时间线</h3>
        ${state.healthRecords
          .map(
            (record) => `
              <div class="timeline-row">
                <span>${record.date}</span>
                <strong>${petName(record.petId)} · ${record.type}</strong>
                <p>${record.value}</p>
              </div>
            `
          )
          .join("")}
        <h3>提醒</h3>
        ${state.reminders
          .map(
            (reminder) => `
              <div class="place-row">
                <strong>${petName(reminder.petId)} · ${reminder.type}</strong>
                <span>${reminder.due} · ${daysUntil(reminder.due)} 天后提醒</span>
              </div>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function servicesView() {
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Services</p>
        <h2>本地服务目录</h2>
      </div>
      <span class="privacy-pill">首版只做线索，不做交易闭环</span>
    </section>
    <section class="service-grid">
      ${state.services
        .map(
          (service) => `
            <article class="service-card">
              <div>
                <span class="tag">${service.category}</span>
                <h3>${service.name}</h3>
                <p>${service.district} · 评分 ${service.rating}</p>
                <p>${service.response}</p>
              </div>
              <button class="primary" data-lead="${service.id}">提交咨询</button>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function messagesView() {
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Notifications</p>
        <h2>消息中心</h2>
      </div>
    </section>
    <section class="panel">
      <div class="place-row">
        <strong>互动通知</strong>
        <span>你刚刚收到新的点赞或收藏反馈。</span>
      </div>
      <div class="place-row">
        <strong>系统通知</strong>
        <span>下一次疫苗提醒将在 ${daysUntil(state.reminders[0]?.due || "2026-04-24")} 天后触发。</span>
      </div>
      ${state.leads
        .map(
          (lead) => `
            <div class="place-row">
              <strong>服务线索 · ${lead.status}</strong>
              <span>${lead.petName}：${lead.message}</span>
            </div>
          `
        )
        .join("")}
    </section>
  `;
}

function adminView() {
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Ops</p>
        <h2>运营与商家后台</h2>
      </div>
      <button class="secondary" id="reset-demo">重置 Demo</button>
    </section>
    <section class="two-column">
      <div class="panel">
        <h3>审核队列</h3>
        ${state.reports
          .map(
            (report) => `
              <div class="admin-row">
                <div>
                  <strong>${report.reason}</strong>
                  <span>目标：${report.target} · ${report.status}</span>
                </div>
                <button data-approve="${report.id}">处理</button>
              </div>
            `
          )
          .join("")}
      </div>
      <div class="panel">
        <h3>商家线索</h3>
        ${state.leads
          .map(
            (lead) => {
              const service = state.services.find((item) => item.id === lead.serviceId);
              return `
                <div class="admin-row">
                  <div>
                    <strong>${service?.name || "服务商家"}</strong>
                    <span>${lead.petName} · ${lead.message} · ${lead.status}</span>
                  </div>
                  <button data-lead-done="${lead.id}">标记响应</button>
                </div>
              `;
            }
          )
          .join("")}
      </div>
    </section>
  `;
}

function qaStrip() {
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Q&A</p>
        <h2>新手问答</h2>
      </div>
      <span class="privacy-pill">不替代兽医诊断</span>
    </section>
    <section class="qa-strip">
      ${state.questions
        .map(
          (question) => `
            <article>
              <span>${question.tag}</span>
              <h3>${question.title}</h3>
              <p>${question.answers} 个回答 · ${question.saved ? "已收藏" : "可收藏"}</p>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function activeView() {
  const views = {
    home: homeView,
    nearby: nearbyView,
    compose: composeView,
    health: healthView,
    services: servicesView,
    messages: messagesView,
    admin: adminView
  };
  const view = views[state.activeTab] || homeView;
  return view();
}

function render() {
  document.querySelector("#app").innerHTML = `
    ${nav()}
    <main>
      ${activeView()}
      ${state.activeTab === "home" ? qaStrip() : ""}
    </main>
    ${state.toast ? `<div class="toast">${state.toast}</div>` : ""}
  `;
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => setState({ activeTab: button.dataset.tab }));
  });
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => setState({ feedFilter: button.dataset.filter }));
  });
  document.querySelectorAll("[data-like]").forEach((button) => {
    button.addEventListener("click", () => toggleLike(button.dataset.like));
  });
  document.querySelectorAll("[data-collect]").forEach((button) => {
    button.addEventListener("click", () => toggleCollect(button.dataset.collect));
  });
  document.querySelectorAll("[data-report]").forEach((button) => {
    button.addEventListener("click", () => {
      state.reports.unshift({
        id: `m${Date.now()}`,
        target: button.dataset.report,
        reason: "用户举报内容",
        status: "待审核"
      });
      saveState();
      showToast("举报已提交到运营后台");
    });
  });
  document.querySelectorAll("[data-lead]").forEach((button) => {
    button.addEventListener("click", () => addLead(button.dataset.lead));
  });
  document.querySelectorAll("[data-approve]").forEach((button) => {
    button.addEventListener("click", () => approveModeration(button.dataset.approve));
  });
  document.querySelectorAll("[data-lead-done]").forEach((button) => {
    button.addEventListener("click", () => {
      const lead = state.leads.find((item) => item.id === button.dataset.leadDone);
      if (lead) lead.status = "已响应";
      saveState();
      showToast("线索已标记响应");
    });
  });
  document.querySelector("#post-form")?.addEventListener("submit", createPost);
  document.querySelector("#pet-form")?.addEventListener("submit", createPet);
  document.querySelector("#health-form")?.addEventListener("submit", addHealth);
  document.querySelector("#reset-demo")?.addEventListener("click", resetDemo);
}

render();
