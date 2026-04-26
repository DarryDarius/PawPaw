const petPhotos = [
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80"
];

const speciesOptions = ["猫", "狗", "其他"];
const sexOptions = ["妹妹", "弟弟", "未知"];
const visibilityOptions = ["公开", "片区可见", "仅自己"];
const cityOptions = ["上海", "杭州", "深圳", "成都", "北京"];
const postTopicOptions = ["成长记录", "附近约玩", "新手求助", "宠物友好地点", "健康记录"];
const todayText = "2026-04-24";

const initialState = {
  user: {
    id: "u1",
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
      avatar: petPhotos[0],
      createdAt: "2026-04-24",
      updatedAt: "2026-04-24"
    }
  ],
  ownerPetBindings: [
    {
      userId: "u1",
      petId: "p1",
      role: "owner",
      status: "active",
      isPrimary: true,
      createdAt: "2026-04-24",
      updatedAt: "2026-04-24"
    }
  ],
  posts: [
    {
      id: "post1",
      petId: "p1",
      petIds: ["p1"],
      author: "Darius",
      body: "第一次给奶盖建立 PawPaw 档案，顺手记录今天体重 4.2kg。",
      city: "上海",
      topic: "成长记录",
      image: petPhotos[0],
      mediaUrls: [petPhotos[0]],
      visibility: "公开",
      likes: 24,
      likedByMe: false,
      comments: ["好乖！", "这个档案页很适合记录疫苗。"],
      collected: false,
      collectCount: 3,
      status: "已通过",
      moderationStatus: "已通过",
      createdAt: "2026-04-24"
    },
    {
      id: "post2",
      petId: "seed-dog",
      petIds: ["seed-dog"],
      author: "附近宠友",
      body: "世纪公园晚上 7 点有小型犬散步局，位置只公开到片区。",
      city: "上海",
      topic: "附近约玩",
      image: petPhotos[1],
      mediaUrls: [petPhotos[1]],
      visibility: "片区可见",
      likes: 41,
      likedByMe: false,
      comments: ["报名！", "可以带牵引绳和水碗。"],
      collected: true,
      collectCount: 8,
      status: "已通过",
      moderationStatus: "已通过",
      createdAt: "2026-04-24"
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
      petId: "p1",
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
  selectedPetId: "p1",
  editingPetId: "",
  toast: ""
};

let state = loadState();

function loadState() {
  const saved = window.localStorage.getItem("pawpaw-demo-state");
  if (!saved) return normalizeState(structuredClone(initialState));
  try {
    return normalizeState({ ...structuredClone(initialState), ...JSON.parse(saved) });
  } catch {
    return normalizeState(structuredClone(initialState));
  }
}

function normalizeState(nextState) {
  const user = {
    ...initialState.user,
    ...(nextState.user || {}),
    id: nextState.user?.id || initialState.user.id
  };
  const pets = (nextState.pets?.length ? nextState.pets : initialState.pets).map((pet, index) => ({
    ...pet,
    city: pet.city || user.city || "上海",
    visibility: pet.visibility || "公开",
    avatar: pet.avatar || petPhotos[index % petPhotos.length],
    createdAt: pet.createdAt || todayText,
    updatedAt: pet.updatedAt || todayText
  }));
  const rawBindings = nextState.ownerPetBindings?.length
    ? nextState.ownerPetBindings
    : pets.map((pet, index) => ({
        userId: user.id,
        petId: pet.id,
        role: pet.ownerRole || "owner",
        status: "active",
        isPrimary: Boolean(pet.isPrimary ?? index === 0),
        createdAt: pet.createdAt || todayText,
        updatedAt: pet.updatedAt || todayText
      }));
  const ownerPetBindings = rawBindings.map((binding) => ({
    userId: binding.userId || user.id,
    petId: binding.petId,
    role: binding.role || "owner",
    status: binding.status || "active",
    isPrimary: Boolean(binding.isPrimary),
    invitedByUserId: binding.invitedByUserId || "",
    createdAt: binding.createdAt || todayText,
    updatedAt: binding.updatedAt || todayText
  }));
  const activeBindings = ownerPetBindings.filter((binding) => binding.userId === user.id && binding.status === "active");
  if (activeBindings.length && !activeBindings.some((binding) => binding.isPrimary)) {
    activeBindings[0].isPrimary = true;
  }
  const boundPetIds = new Set(activeBindings.map((binding) => binding.petId));
  const selectedPetId = boundPetIds.has(nextState.selectedPetId)
    ? nextState.selectedPetId
    : activeBindings.find((binding) => binding.isPrimary)?.petId || activeBindings[0]?.petId || pets[0]?.id || "";
  return {
    ...nextState,
    user,
    pets,
    ownerPetBindings,
    posts: normalizePosts(nextState.posts || initialState.posts),
    selectedPetId,
    editingPetId: nextState.editingPetId || "",
    leads: (nextState.leads || []).map((lead) => ({
      ...lead,
      petId: boundPetIds.has(lead.petId)
        ? lead.petId
        : pets.find((pet) => pet.name === lead.petName)?.id || selectedPetId
    }))
  };
}

function normalizePosts(posts) {
  return posts.map((post, index) => {
    const petIds = post.petIds?.length ? post.petIds : [post.petId].filter(Boolean);
    const mediaUrls = post.mediaUrls?.length ? post.mediaUrls : [post.image || petPhotos[1]].filter(Boolean);
    return {
      ...post,
      id: post.id || `post-seed-${index}`,
      petId: post.petId || petIds[0],
      petIds,
      mediaUrls,
      image: post.image || mediaUrls[0] || petPhotos[1],
      visibility: post.visibility || "公开",
      moderationStatus: post.moderationStatus || post.status || "待审核",
      status: post.status || post.moderationStatus || "待审核",
      likes: post.likes ?? 0,
      likedByMe: Boolean(post.likedByMe),
      comments: normalizeComments(post.comments || []),
      collected: Boolean(post.collected),
      collectCount: post.collectCount ?? (post.collected ? 1 : 0),
      createdAt: post.createdAt || todayText
    };
  });
}

function normalizeComments(comments) {
  return comments.map((comment, index) => {
    if (typeof comment === "string") {
      return {
        id: `seed-comment-${index}`,
        author: "宠友",
        body: comment,
        createdAt: todayText
      };
    }
    return {
      id: comment.id || `comment-${index}`,
      author: comment.author || "宠友",
      body: comment.body || "",
      createdAt: comment.createdAt || todayText
    };
  });
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

function activeUserBindings() {
  return state.ownerPetBindings.filter(
    (binding) => binding.userId === state.user.id && binding.status === "active" && petById(binding.petId)
  );
}

function bindingForPet(id) {
  return activeUserBindings().find((binding) => binding.petId === id);
}

function boundPets() {
  return activeUserBindings()
    .map((binding) => petById(binding.petId))
    .filter(Boolean);
}

function primaryBinding() {
  return activeUserBindings().find((binding) => binding.isPrimary) || activeUserBindings()[0];
}

function canEditPet(id) {
  return bindingForPet(id)?.role === "owner";
}

function canUsePet(id) {
  return ["owner", "family"].includes(bindingForPet(id)?.role);
}

function currentPet() {
  return petById(state.selectedPetId) || petById(primaryBinding()?.petId) || boundPets()[0] || state.pets[0];
}

function petById(id) {
  return state.pets.find((pet) => pet.id === id);
}

function petName(id) {
  return petById(id)?.name || "城市宠友";
}

function petAvatar(id) {
  return petById(id)?.avatar || petPhotos[1];
}

function petAgeText(pet) {
  if (!pet?.birthDate) return "年龄待补充";
  const birthDate = new Date(`${pet.birthDate}T00:00:00`);
  const today = new Date(`${todayText}T00:00:00`);
  if (Number.isNaN(birthDate.getTime()) || birthDate > today) return "年龄待确认";
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth();
  if (today.getDate() < birthDate.getDate()) months -= 1;
  if (months < 1) return "未满 1 个月";
  const years = Math.floor(months / 12);
  const restMonths = months % 12;
  if (!years) return `${restMonths} 个月`;
  return restMonths ? `${years} 岁 ${restMonths} 个月` : `${years} 岁`;
}

function petSummary(pet) {
  return `${pet.species} · ${pet.breed || "品种待补充"} · ${petAgeText(pet)} · ${pet.city}`;
}

function daysUntil(dateText) {
  const today = new Date(`${todayText}T00:00:00`);
  const target = new Date(`${dateText}T00:00:00`);
  return Math.max(0, Math.round((target - today) / 86400000));
}

function createPet(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get("name") || "").trim();
  const birthDate = form.get("birthDate");
  if (!name) return showToast("请先填写宠物名字");
  if (name.length > 20) return showToast("宠物名字最多 20 个字符");
  if (birthDate && new Date(`${birthDate}T00:00:00`) > new Date(`${todayText}T00:00:00`)) {
    return showToast("生日不能晚于今天");
  }
  const pet = {
    id: `p${Date.now()}`,
    name,
    species: form.get("species"),
    breed: String(form.get("breed") || "").trim(),
    sex: form.get("sex"),
    birthDate: birthDate || "",
    city: form.get("city") || state.user.city,
    visibility: form.get("visibility") || "公开",
    avatar: String(form.get("avatar") || "").trim() || petPhotos[state.pets.length % petPhotos.length],
    createdAt: todayText,
    updatedAt: todayText
  };
  const isFirstActivePet = activeUserBindings().length === 0;
  state.pets.push(pet);
  state.ownerPetBindings.push({
    userId: state.user.id,
    petId: pet.id,
    role: "owner",
    status: "active",
    isPrimary: isFirstActivePet,
    invitedByUserId: "",
    createdAt: todayText,
    updatedAt: todayText
  });
  if (isFirstActivePet) state.selectedPetId = pet.id;
  saveState();
  event.currentTarget.reset();
  showToast(`已创建宠物档案：${pet.name}`);
}

function updatePet(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const pet = petById(form.get("id"));
  if (!pet) return showToast("没有找到要编辑的宠物档案");
  if (!canEditPet(pet.id)) return showToast("只有主人可以编辑宠物档案");
  const name = String(form.get("name") || "").trim();
  const birthDate = form.get("birthDate");
  if (!name) return showToast("请先填写宠物名字");
  if (name.length > 20) return showToast("宠物名字最多 20 个字符");
  if (birthDate && new Date(`${birthDate}T00:00:00`) > new Date(`${todayText}T00:00:00`)) {
    return showToast("生日不能晚于今天");
  }
  pet.name = name;
  pet.species = form.get("species");
  pet.breed = String(form.get("breed") || "").trim();
  pet.sex = form.get("sex");
  pet.birthDate = birthDate || "";
  pet.city = form.get("city") || state.user.city;
  pet.visibility = form.get("visibility") || "公开";
  pet.avatar = String(form.get("avatar") || "").trim() || pet.avatar;
  pet.updatedAt = todayText;
  state.editingPetId = "";
  saveState();
  showToast(`已更新宠物档案：${pet.name}`);
}

function selectPet(id) {
  if (!bindingForPet(id)) return showToast("只能切换到已绑定的宠物");
  state.selectedPetId = id;
  saveState();
  render();
}

function setPrimaryPet(id) {
  const pet = petById(id);
  if (!pet) return;
  if (!canEditPet(id)) return showToast("只有主人可以设置默认宠物");
  state.ownerPetBindings.forEach((binding) => {
    if (binding.userId !== state.user.id || binding.status !== "active") return;
    binding.isPrimary = binding.petId === id;
    binding.updatedAt = todayText;
  });
  state.selectedPetId = id;
  saveState();
  showToast(`已设为默认宠物：${pet.name}`);
}

function parseMediaUrls(value) {
  return String(value || "")
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean)
    .slice(0, 9);
}

function postPetIds(post) {
  return post.petIds?.length ? post.petIds : [post.petId].filter(Boolean);
}

function postImage(post) {
  return post.mediaUrls?.[0] || post.image || petAvatar(postPetIds(post)[0]);
}

function postStatus(post) {
  return post.moderationStatus || post.status || "待审核";
}

function userOwnsPostPet(post) {
  return postPetIds(post).some((petId) => Boolean(bindingForPet(petId)));
}

function canViewPost(post) {
  const status = postStatus(post);
  if (!["已通过", "待审核"].includes(status)) return false;
  if (status === "待审核" && !userOwnsPostPet(post)) return false;
  if (post.visibility !== "仅自己") return true;
  return userOwnsPostPet(post);
}

function postCreatedTime(post) {
  const value = new Date(`${post.createdAt || todayText}${String(post.createdAt || "").includes("T") ? "" : "T00:00:00"}`).getTime();
  return Number.isNaN(value) ? 0 : value;
}

function recommendScore(post) {
  const sameCityBoost = post.city === state.user.city ? 20 : 0;
  const ownPetBoost = userOwnsPostPet(post) ? 12 : 0;
  const mediaBoost = Math.min(post.mediaUrls?.length || 0, 3) * 2;
  const approvedBoost = postStatus(post) === "已通过" ? 8 : 0;
  return sameCityBoost + ownPetBoost + approvedBoost + mediaBoost + post.likes * 2 + post.comments.length * 3 + (post.collectCount || 0) * 2;
}

function feedPosts() {
  const visible = state.posts.filter((post) => {
    if (!canViewPost(post)) return false;
    if (state.feedFilter === "city") return post.visibility !== "仅自己" && post.city === state.user.city;
    if (state.feedFilter === "following") return postPetIds(post).some((petId) => Boolean(bindingForPet(petId)));
    return true;
  });
  if (state.feedFilter === "latest") {
    return visible.sort((a, b) => postCreatedTime(b) - postCreatedTime(a));
  }
  if (state.feedFilter === "recommend") {
    return visible.sort((a, b) => recommendScore(b) - recommendScore(a) || postCreatedTime(b) - postCreatedTime(a));
  }
  return visible.sort((a, b) => postCreatedTime(b) - postCreatedTime(a));
}

function createPost(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const petId = form.get("petId");
  const body = String(form.get("body") || "").trim();
  const topic = form.get("topic");
  const visibility = form.get("visibility") || "公开";
  const mediaUrls = parseMediaUrls(form.get("mediaUrls"));
  if (!petId) return showToast("请先绑定一只可发布的宠物");
  if (!canUsePet(petId)) return showToast("只有已绑定的主人或共养成员可以发布动态");
  if (!body) return showToast("先写一点宠物动态吧");
  if (body.length > 1000) return showToast("动态正文最多 1000 个字符");
  if (!postTopicOptions.includes(topic)) return showToast("请选择有效的话题");
  if (!visibilityOptions.includes(visibility)) return showToast("请选择有效的可见性");
  const pet = petById(petId);
  const post = {
    id: `post${Date.now()}`,
    petId,
    petIds: [petId],
    author: state.user.nickname,
    body,
    city: pet?.city || state.user.city,
    topic,
    image: mediaUrls[0] || petAvatar(petId),
    mediaUrls: mediaUrls.length ? mediaUrls : [petAvatar(petId)],
    visibility,
    likes: 0,
    comments: [],
    collected: false,
    collectCount: 0,
    likedByMe: false,
    status: "待审核",
    moderationStatus: "待审核",
    createdAt: new Date().toISOString()
  };
  state.posts.unshift(post);
  state.reports.unshift({
    id: `m${Date.now()}`,
    target: post.id,
    postId: post.id,
    type: "post_moderation",
    reason: `${pet?.name || "宠物"} 的新发布内容待审核`,
    status: "待审核"
  });
  saveState();
  event.currentTarget.reset();
  showToast("动态已发布，当前状态：待审核");
}

function addHealth(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  if (!form.get("petId")) return showToast("请先绑定一只可记录健康的宠物");
  if (!canUsePet(form.get("petId"))) return showToast("只有已绑定的主人或共养成员可以记录健康事项");
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
  const pet = currentPet();
  if (!canUsePet(pet.id)) return showToast("只有已绑定的主人或共养成员可以提交服务线索");
  state.leads.unshift({
    id: `l${Date.now()}`,
    serviceId,
    petId: pet.id,
    petName: pet.name,
    message: `咨询 ${service.name} 的${service.category}服务`,
    status: "待响应",
    createdAt: "刚刚"
  });
  saveState();
  showToast("已提交服务线索，商家后台可查看");
}

function toggleLike(postId) {
  const post = state.posts.find((item) => item.id === postId);
  if (!post) return;
  post.likedByMe = !post.likedByMe;
  post.likes = Math.max(0, post.likes + (post.likedByMe ? 1 : -1));
  saveState();
  showToast(post.likedByMe ? "点赞成功" : "已取消点赞");
}

function toggleCollect(postId) {
  const post = state.posts.find((item) => item.id === postId);
  if (!post) return;
  post.collected = !post.collected;
  post.collectCount = Math.max(0, (post.collectCount || 0) + (post.collected ? 1 : -1));
  saveState();
  showToast(post.collected ? "已收藏" : "已取消收藏");
}

function addComment(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const post = state.posts.find((item) => item.id === form.get("postId"));
  const body = String(form.get("comment") || "").trim();
  if (!post) return showToast("没有找到要评论的动态");
  if (!canViewPost(post)) return showToast("当前动态不可评论");
  if (!body) return showToast("先写一点评论内容");
  if (body.length > 200) return showToast("评论最多 200 个字符");
  post.comments.push({
    id: `comment${Date.now()}`,
    author: state.user.nickname,
    body,
    createdAt: new Date().toISOString()
  });
  saveState();
  event.currentTarget.reset();
  showToast("评论已发布");
}

function reportPost(postId) {
  const post = state.posts.find((item) => item.id === postId);
  if (!post) return showToast("没有找到要举报的动态");
  const existing = state.reports.find(
    (report) => report.postId === postId && report.type === "user_report" && report.status === "待审核"
  );
  if (existing) return showToast("这条动态已经在举报审核队列中");
  state.reports.unshift({
    id: `m${Date.now()}`,
    target: postId,
    postId,
    type: "user_report",
    reason: `用户举报内容：${post.topic}`,
    status: "待审核"
  });
  saveState();
  showToast("举报已提交到运营后台");
}

function approveModeration(id) {
  const item = state.reports.find((report) => report.id === id);
  if (item) item.status = "已处理";
  const targetPost = state.posts.find((post) => post.id === item?.postId || post.id === item?.target);
  if (targetPost) {
    targetPost.status = "已通过";
    targetPost.moderationStatus = "已通过";
  }
  saveState();
  showToast("审核任务已处理");
}

function resetDemo() {
  state = normalizeState(structuredClone(initialState));
  saveState();
  render();
  showToast("Demo 数据已重置");
}

function statCards() {
  const activePets = boundPets().length;
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
  const binding = bindingForPet(pet.id);
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
          <button class="secondary" data-tab="pets">管理档案</button>
          <button class="primary" data-tab="compose">发布动态</button>
          <button class="secondary" data-tab="health">记录健康</button>
        </div>
      </div>
      <div class="pet-spotlight">
        <img src="${pet.avatar}" alt="${pet.name} 的宠物照片" />
        <div>
          <strong>${pet.name}${binding?.isPrimary ? " · 默认宠物" : ""}</strong>
          <span>${petSummary(pet)} · ${pet.visibility}</span>
        </div>
      </div>
    </header>
  `;
}

function nav() {
  const tabs = [
    ["home", "首页"],
    ["pets", "档案"],
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
  const posts = feedPosts();
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
      ${posts.map(postCard).join("") || `<p class="empty-note">还没有可展示的动态，先给宠物发布一条成长记录。</p>`}
    </section>
  `;
}

function postCard(post) {
  const petIds = postPetIds(post);
  const petNames = petIds.map(petName).join("、");
  const latestComments = post.comments.slice(-2);
  return `
    <article class="post-card">
      <img src="${postImage(post)}" alt="${petNames} 的动态图片" />
      <div class="post-body">
        <div class="post-meta">
          <span>${petNames}</span>
          <small>${post.city} · ${post.topic} · ${post.visibility} · ${postStatus(post)}</small>
        </div>
        <p>${post.body}</p>
        <div class="pet-metrics">
          <span>${post.mediaUrls?.length || 1} 张图片</span>
          <span>${post.comments.length} 条评论</span>
          <span>${post.collectCount || 0} 次收藏</span>
          <span>${post.createdAt || todayText}</span>
        </div>
        <div class="comment-list">
          ${latestComments
            .map(
              (comment) => `
                <div>
                  <strong>${comment.author}</strong>
                  <span>${comment.body}</span>
                </div>
              `
            )
            .join("")}
        </div>
        <form class="comment-form" data-comment-form="${post.id}">
          <input type="hidden" name="postId" value="${post.id}" />
          <input name="comment" maxlength="200" placeholder="写评论" />
          <button type="submit">评论</button>
        </form>
        <div class="post-actions">
          <button class="${post.likedByMe ? "active-action" : ""}" data-like="${post.id}">${post.likedByMe ? "已赞" : "赞"} ${post.likes}</button>
          <button class="${post.collected ? "active-action" : ""}" data-collect="${post.id}">${post.collected ? "已收藏" : "收藏"}</button>
          <button data-report="${post.id}">举报</button>
        </div>
      </div>
    </article>
  `;
}

function optionList(options, selected) {
  return options.map((item) => `<option ${item === selected ? "selected" : ""}>${item}</option>`).join("");
}

function petForm(pet) {
  const isEditing = Boolean(pet);
  return `
    <form class="panel form" id="${isEditing ? "pet-edit-form" : "pet-form"}">
      <h3>${isEditing ? "编辑宠物档案" : "创建宠物档案"}</h3>
      ${isEditing ? `<input type="hidden" name="id" value="${pet.id}" />` : ""}
      <label>名字 <input name="name" maxlength="20" placeholder="例如：布丁" value="${pet?.name || ""}" required /></label>
      <label>
        物种
        <select name="species">
          ${optionList(speciesOptions, pet?.species || "猫")}
        </select>
      </label>
      <label>品种 <input name="breed" maxlength="30" placeholder="例如：金渐层" value="${pet?.breed || ""}" /></label>
      <label>
        性别
        <select name="sex">
          ${optionList(sexOptions, pet?.sex || "未知")}
        </select>
      </label>
      <label>生日 <input type="date" name="birthDate" max="${todayText}" value="${pet?.birthDate || ""}" /></label>
      <label>
        城市
        <select name="city">
          ${optionList(cityOptions, pet?.city || state.user.city)}
        </select>
      </label>
      <label>
        可见性
        <select name="visibility">
          ${optionList(visibilityOptions, pet?.visibility || "公开")}
        </select>
      </label>
      <label>头像 URL <input name="avatar" placeholder="可留空使用默认头像" value="${pet?.avatar || ""}" /></label>
      <div class="form-actions">
        <button class="primary" type="submit">${isEditing ? "保存修改" : "创建档案"}</button>
        ${isEditing ? `<button class="secondary" type="button" id="cancel-edit-pet">取消</button>` : ""}
      </div>
    </form>
  `;
}

function petCard(pet) {
  const binding = bindingForPet(pet.id);
  const posts = state.posts.filter((post) => postPetIds(post).includes(pet.id)).length;
  const healthRecords = state.healthRecords.filter((record) => record.petId === pet.id).length;
  const leads = state.leads.filter((lead) => lead.petId === pet.id).length;
  return `
    <article class="pet-card ${state.selectedPetId === pet.id ? "selected" : ""}">
      <img src="${pet.avatar}" alt="${pet.name} 的头像" />
      <div class="pet-card-body">
        <div class="pet-card-title">
          <div>
            <strong>${pet.name}</strong>
            <span>${petSummary(pet)}</span>
          </div>
          <span class="tag">${pet.visibility}</span>
        </div>
        <div class="pet-metrics">
          <span>${binding?.role === "owner" ? "主人" : binding?.role === "family" ? "共养成员" : "只读成员"}</span>
          <span>${posts} 条动态</span>
          <span>${healthRecords} 条健康记录</span>
          <span>${leads} 条服务线索</span>
        </div>
        <div class="post-actions">
          <button data-select-pet="${pet.id}">${state.selectedPetId === pet.id ? "当前使用" : "切换使用"}</button>
          ${canEditPet(pet.id) ? `<button data-edit-pet="${pet.id}">编辑</button>` : ""}
          ${canEditPet(pet.id) ? `<button data-primary-pet="${pet.id}">${binding?.isPrimary ? "默认宠物" : "设为默认"}</button>` : ""}
        </div>
      </div>
    </article>
  `;
}

function selectedPetPanel() {
  const pet = currentPet();
  const binding = bindingForPet(pet.id);
  const petPosts = state.posts.filter((post) => postPetIds(post).includes(pet.id));
  const records = state.healthRecords.filter((record) => record.petId === pet.id);
  const reminder = state.reminders.find((item) => item.petId === pet.id);
  return `
    <section class="pet-profile">
      <img src="${pet.avatar}" alt="${pet.name} 的档案照片" />
      <div>
        <p class="eyebrow">Pet Profile</p>
        <h2>${pet.name}</h2>
        <p>${petSummary(pet)}</p>
        <div class="pet-metrics">
          <span>${pet.visibility}</span>
          <span>${binding?.isPrimary ? "默认宠物" : "非默认宠物"}</span>
          <span>${binding?.role === "owner" ? "主人" : binding?.role === "family" ? "共养成员" : "只读成员"}</span>
          <span>健康数据默认私密</span>
        </div>
        <div class="profile-grid">
          <div><strong>${petPosts.length}</strong><span>关联动态</span></div>
          <div><strong>${records.length}</strong><span>健康记录</span></div>
          <div><strong>${reminder ? `${daysUntil(reminder.due)} 天` : "未设置"}</strong><span>下次提醒</span></div>
        </div>
        <div class="pet-posts">
          <h3>最近动态</h3>
          ${petPosts.slice(0, 3).map(compactPostRow).join("") || `<p class="empty-note">还没有关联动态。</p>`}
        </div>
      </div>
    </section>
  `;
}

function compactPostRow(post) {
  return `
    <div class="place-row">
      <strong>${post.topic} · ${postStatus(post)}</strong>
      <span>${post.body}</span>
    </div>
  `;
}

function petsView() {
  const editingPet = petById(state.editingPetId);
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Pets</p>
        <h2>宠物档案</h2>
      </div>
      <span class="privacy-pill">城市可见，健康记录默认私密</span>
    </section>
    ${selectedPetPanel()}
    <section class="two-column">
      <div class="panel">
        <h3>我的宠物</h3>
        <div class="pet-list">
          ${boundPets().map(petCard).join("") || `<p class="empty-note">还没有绑定宠物，先创建第一只宠物档案。</p>`}
        </div>
      </div>
      ${petForm(editingPet)}
    </section>
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
        ${boundPets()
          .filter((pet) => pet.visibility !== "仅自己")
          .map(
            (pet) => `
              <div class="list-row">
                <img src="${pet.avatar}" alt="${pet.name}" />
                <div>
                  <strong>${pet.name}</strong>
                  <span>${petSummary(pet)} · ${pet.visibility}</span>
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
  const usablePets = boundPets().filter((pet) => canUsePet(pet.id));
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Create</p>
        <h2>发布宠物动态</h2>
      </div>
      <span class="privacy-pill">新动态默认进入审核队列</span>
    </section>
    <section class="two-column">
      <form class="panel form" id="post-form">
        ${usablePets.length ? "" : `<p class="empty-note">你还没有可发布动态的宠物档案，请先创建或绑定宠物。</p>`}
        <label>
          关联宠物
          <select name="petId">
            ${usablePets.map((pet) => `<option value="${pet.id}" ${pet.id === state.selectedPetId ? "selected" : ""}>${pet.name}</option>`).join("")}
          </select>
        </label>
        <label>
          话题
          <select name="topic">
            ${postTopicOptions.map((topic) => `<option>${topic}</option>`).join("")}
          </select>
        </label>
        <label>
          可见性
          <select name="visibility">
            ${visibilityOptions.map((visibility) => `<option>${visibility}</option>`).join("")}
          </select>
        </label>
        <label>
          内容
          <textarea name="body" rows="6" maxlength="1000" placeholder="今天发生了什么？"></textarea>
        </label>
        <label>
          图片 URL
          <textarea name="mediaUrls" rows="3" placeholder="可选。多张图片用换行或逗号分隔，最多 9 张。"></textarea>
        </label>
        <button class="primary" type="submit" ${usablePets.length ? "" : "disabled"}>发布并进入审核</button>
      </form>
      <div class="panel">
        <h3>当前宠物档案</h3>
        ${petCard(currentPet())}
        <div class="form-actions">
          <button class="secondary" data-tab="pets">管理宠物档案</button>
        </div>
      </div>
    </section>
  `;
}

function healthView() {
  const usablePets = boundPets().filter((pet) => canUsePet(pet.id));
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
            ${usablePets.map((pet) => `<option value="${pet.id}" ${pet.id === state.selectedPetId ? "selected" : ""}>${pet.name}</option>`).join("")}
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
  const pet = currentPet();
  const usablePets = boundPets().filter((item) => canUsePet(item.id));
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Services</p>
        <h2>本地服务目录</h2>
      </div>
      <span class="privacy-pill">首版只做线索，不做交易闭环</span>
    </section>
    <section class="service-context">
      <div>
        <strong>当前咨询宠物：${pet.name}</strong>
        <span>${petSummary(pet)} · 线索会带上宠物档案信息</span>
      </div>
      <select id="service-pet">
        ${usablePets.map((item) => `<option value="${item.id}" ${item.id === state.selectedPetId ? "selected" : ""}>${item.name}</option>`).join("")}
      </select>
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
              <span>${petName(lead.petId)}：${lead.message}</span>
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
                    <span>${petName(lead.petId)} · ${lead.message} · ${lead.status}</span>
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
    pets: petsView,
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
    button.addEventListener("click", () => reportPost(button.dataset.report));
  });
  document.querySelectorAll("[data-comment-form]").forEach((form) => {
    form.addEventListener("submit", addComment);
  });
  document.querySelectorAll("[data-lead]").forEach((button) => {
    button.addEventListener("click", () => addLead(button.dataset.lead));
  });
  document.querySelectorAll("[data-select-pet]").forEach((button) => {
    button.addEventListener("click", () => selectPet(button.dataset.selectPet));
  });
  document.querySelectorAll("[data-edit-pet]").forEach((button) => {
    button.addEventListener("click", () => {
      state.editingPetId = button.dataset.editPet;
      state.activeTab = "pets";
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-primary-pet]").forEach((button) => {
    button.addEventListener("click", () => setPrimaryPet(button.dataset.primaryPet));
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
  document.querySelector("#service-pet")?.addEventListener("change", (event) => selectPet(event.target.value));
  document.querySelector("#post-form")?.addEventListener("submit", createPost);
  document.querySelector("#pet-form")?.addEventListener("submit", createPet);
  document.querySelector("#pet-edit-form")?.addEventListener("submit", updatePet);
  document.querySelector("#cancel-edit-pet")?.addEventListener("click", () => {
    state.editingPetId = "";
    saveState();
    render();
  });
  document.querySelector("#health-form")?.addEventListener("submit", addHealth);
  document.querySelector("#reset-demo")?.addEventListener("click", resetDemo);
}

render();
