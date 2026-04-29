const dogPhotos = [
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1000&q=80"
];

const todayText = "2026-04-29";

const initialState = {
  user: {
    id: "u1",
    nickname: "Darius",
    neighborhood: "Hyde Park",
    availableWindows: ["weekday_evening", "weekend_morning"],
    meetupPreferences: ["public_place_only", "small_group_ok"],
    maxDistanceKm: 5,
    safetyPreferences: ["vaccine_preferred", "no_home_address"]
  },
  pets: [
    {
      id: "p1",
      ownerUserId: "u1",
      name: "Mochi",
      breed: "Corgi",
      birthDate: "2023-05-12",
      sex: "female",
      avatar: dogPhotos[0],
      size: "small",
      neutered: true,
      vaccineStatus: "verified",
      energyLevel: "medium",
      personalityTags: ["friendly", "gentle", "shy_at_first"],
      activityPreferences: ["walk", "dog_park", "training"],
      acceptsLargeDogs: false,
      neighborhood: "Hyde Park"
    },
    {
      id: "p2",
      ownerUserId: "u2",
      name: "Biscuit",
      breed: "Beagle",
      birthDate: "2022-10-02",
      sex: "male",
      avatar: dogPhotos[1],
      size: "medium",
      neutered: true,
      vaccineStatus: "verified",
      energyLevel: "medium",
      personalityTags: ["friendly", "curious", "food_motivated"],
      activityPreferences: ["walk", "dog_park", "short_trip"],
      acceptsLargeDogs: true,
      neighborhood: "Hyde Park",
      distanceKm: 1.4,
      availableWindows: ["weekday_evening", "weekend_morning"],
      likedBack: true
    },
    {
      id: "p3",
      ownerUserId: "u3",
      name: "Luna",
      breed: "Toy Poodle",
      birthDate: "2021-07-18",
      sex: "female",
      avatar: dogPhotos[2],
      size: "small",
      neutered: true,
      vaccineStatus: "verified",
      energyLevel: "low",
      personalityTags: ["calm", "gentle", "people_friendly"],
      activityPreferences: ["walk", "cafe", "small_group"],
      acceptsLargeDogs: false,
      neighborhood: "Kenwood",
      distanceKm: 2.1,
      availableWindows: ["weekend_morning", "weekend_afternoon"],
      likedBack: false
    },
    {
      id: "p4",
      ownerUserId: "u4",
      name: "Otis",
      breed: "Golden Retriever",
      birthDate: "2020-03-09",
      sex: "male",
      avatar: dogPhotos[3],
      size: "large",
      neutered: true,
      vaccineStatus: "self_reported",
      energyLevel: "high",
      personalityTags: ["playful", "high_energy", "large_dog_friendly"],
      activityPreferences: ["dog_park", "fetch", "short_trip"],
      acceptsLargeDogs: true,
      neighborhood: "South Loop",
      distanceKm: 5.8,
      availableWindows: ["weekday_evening"],
      likedBack: true
    },
    {
      id: "p5",
      ownerUserId: "u5",
      name: "Pepper",
      breed: "Shiba Inu",
      birthDate: "2022-01-21",
      sex: "female",
      avatar: dogPhotos[4],
      size: "medium",
      neutered: false,
      vaccineStatus: "verified",
      energyLevel: "medium",
      personalityTags: ["independent", "selective", "calm"],
      activityPreferences: ["walk", "training"],
      acceptsLargeDogs: false,
      neighborhood: "Hyde Park",
      distanceKm: 0.9,
      availableWindows: ["weekend_afternoon"],
      likedBack: false
    }
  ],
  locations: [
    {
      id: "loc1",
      name: "Jackson Bark",
      type: "Dog park",
      neighborhood: "Hyde Park",
      distanceKm: 1.2,
      isPublicPlace: true,
      safetyNotes: "Fenced dog park, best for daytime meetups."
    },
    {
      id: "loc2",
      name: "Promontory Point",
      type: "Lakefront walk",
      neighborhood: "Hyde Park",
      distanceKm: 1.7,
      isPublicPlace: true,
      safetyNotes: "Open public route, keep dogs leashed."
    },
    {
      id: "loc3",
      name: "Hyde Park Pet Friendly Cafe",
      type: "Cafe patio",
      neighborhood: "Hyde Park",
      distanceKm: 0.8,
      isPublicPlace: true,
      safetyNotes: "Good for calm dogs and first meetups."
    }
  ],
  swipes: [],
  matches: [],
  conversations: [],
  playdates: [],
  feedback: [],
  reports: [
    {
      id: "r1",
      targetType: "location",
      targetId: "loc1",
      reason: "Review safety note for evening meetups",
      status: "open"
    }
  ],
  blocks: [],
  recommendationLogs: [],
  activeTab: "recommend",
  selectedCandidateId: "",
  toast: ""
};

let state = loadState();

function loadState() {
  const saved = window.localStorage.getItem("pawpaw-playdate-state");
  if (!saved) return structuredClone(initialState);
  try {
    return { ...structuredClone(initialState), ...JSON.parse(saved) };
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  window.localStorage.setItem("pawpaw-playdate-state", JSON.stringify(state));
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

function myPet() {
  return state.pets.find((pet) => pet.ownerUserId === state.user.id) || state.pets[0];
}

function petById(id) {
  return state.pets.find((pet) => pet.id === id);
}

function candidatePets() {
  const blockedUsers = new Set(state.blocks.map((block) => block.blockedUserId));
  const swipedPetIds = new Set(state.swipes.map((swipe) => swipe.targetPetId));
  return state.pets
    .filter((pet) => pet.ownerUserId !== state.user.id)
    .filter((pet) => !blockedUsers.has(pet.ownerUserId))
    .filter((pet) => !swipedPetIds.has(pet.id))
    .map((pet) => ({ ...pet, compatibility: compatibility(myPet(), pet) }))
    .sort((a, b) => b.compatibility.score - a.compatibility.score);
}

function allCandidateCards() {
  return state.pets
    .filter((pet) => pet.ownerUserId !== state.user.id)
    .map((pet) => ({ ...pet, compatibility: compatibility(myPet(), pet) }))
    .sort((a, b) => b.compatibility.score - a.compatibility.score);
}

function compatibility(source, target) {
  const locationScore = Math.max(0, 100 - Math.round((target.distanceKm || 3) * 12));
  const sizeScore = sizeCompatibility(source, target);
  const personalityScore = tagOverlap(source.personalityTags, target.personalityTags, ["friendly", "gentle", "calm"]);
  const scheduleScore = tagOverlap(state.user.availableWindows, target.availableWindows || [], []);
  const activityScore = tagOverlap(source.activityPreferences, target.activityPreferences, []);
  const vaccineScore = target.vaccineStatus === "verified" ? 100 : 60;
  const freshnessScore = target.likedBack ? 92 : 78;
  const score = Math.round(
    0.25 * locationScore +
      0.2 * personalityScore +
      0.15 * sizeScore +
      0.15 * scheduleScore +
      0.1 * activityScore +
      0.1 * vaccineScore +
      0.05 * freshnessScore
  );
  return {
    score,
    reasons: [
      `${target.distanceKm || 2}km away`,
      `${sizeLabel(target.size)} compatibility ${sizeScore}%`,
      `${scheduleScore}% schedule overlap`,
      vaccineScore === 100 ? "Verified vaccine status" : "Self-reported vaccine status"
    ]
  };
}

function sizeCompatibility(source, target) {
  if (source.size === target.size) return 100;
  if (source.size === "small" && target.size === "large" && !source.acceptsLargeDogs) return 35;
  if (source.size === "large" && target.size === "small" && !target.acceptsLargeDogs) return 45;
  return 76;
}

function tagOverlap(a = [], b = [], positiveBoost = []) {
  if (!a.length || !b.length) return 50;
  const left = new Set(a);
  const matches = b.filter((tag) => left.has(tag)).length;
  const boosted = b.filter((tag) => positiveBoost.includes(tag)).length;
  return Math.min(100, Math.round((matches / Math.max(a.length, b.length)) * 100 + boosted * 14 + 36));
}

function sizeLabel(size) {
  return { small: "Small dog", medium: "Medium dog", large: "Large dog" }[size] || "Dog";
}

function energyLabel(energy) {
  return { low: "Low energy", medium: "Medium energy", high: "High energy" }[energy] || "Energy TBD";
}

function vaccineLabel(status) {
  return { verified: "Vaccine verified", self_reported: "Vaccine self-reported", unknown: "Vaccine unknown" }[status] || status;
}

function ageText(birthDate) {
  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date(`${todayText}T00:00:00`);
  const months = Math.max(1, (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth());
  const years = Math.floor(months / 12);
  return years ? `${years} yr ${months % 12 ? `${months % 12} mo` : ""}`.trim() : `${months} mo`;
}

function swipe(targetPetId, action) {
  const target = petById(targetPetId);
  if (!target) return showToast("Candidate not found");
  if (state.swipes.some((item) => item.targetPetId === targetPetId)) {
    return showToast("Already swiped this dog");
  }
  const item = {
    id: `swipe-${Date.now()}`,
    userId: state.user.id,
    petId: myPet().id,
    targetUserId: target.ownerUserId,
    targetPetId,
    action,
    idempotencyKey: `${state.user.id}:${targetPetId}:${action}`,
    createdAt: new Date().toISOString()
  };
  state.swipes.push(item);
  state.recommendationLogs.push({
    id: `log-${Date.now()}`,
    userId: state.user.id,
    candidatePetId: targetPetId,
    action,
    matched: false,
    playdateCreated: false,
    shownAt: new Date().toISOString(),
    score: compatibility(myPet(), target).score
  });
  if (action === "like" && target.likedBack) {
    createMatch(target);
    state.activeTab = "matches";
    saveState();
    return showToast(`It's a match with ${target.name}`);
  }
  saveState();
  render();
  showToast(action === "like" ? `Liked ${target.name}` : `Skipped ${target.name}`);
}

function createMatch(target) {
  const existing = state.matches.find((match) => match.targetPetId === target.id);
  if (existing) return existing;
  const match = {
    id: `match-${Date.now()}`,
    userLowId: state.user.id < target.ownerUserId ? state.user.id : target.ownerUserId,
    userHighId: state.user.id < target.ownerUserId ? target.ownerUserId : state.user.id,
    petId: myPet().id,
    targetPetId: target.id,
    status: "active",
    createdAt: new Date().toISOString()
  };
  const conversation = {
    id: `conv-${Date.now()}`,
    matchId: match.id,
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: "system",
        body: `You matched with ${target.name}. Pick a public place to plan the first playdate.`,
        createdAt: "now"
      }
    ],
    unread: 1
  };
  state.matches.unshift(match);
  state.conversations.unshift(conversation);
  state.recommendationLogs.forEach((log) => {
    if (log.candidatePetId === target.id) log.matched = true;
  });
  return match;
}

function sendMessage(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const body = String(form.get("body") || "").trim();
  const conversation = state.conversations.find((item) => item.id === form.get("conversationId"));
  if (!body || !conversation) return;
  conversation.messages.push({
    id: `msg-${Date.now()}`,
    sender: state.user.nickname,
    body,
    createdAt: "now"
  });
  conversation.unread = 0;
  saveState();
  event.currentTarget.reset();
  showToast("Message sent");
}

function createPlaydate(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const match = state.matches.find((item) => item.id === form.get("matchId"));
  const location = state.locations.find((item) => item.id === form.get("locationId"));
  if (!match || !location) return showToast("Choose a match and public place");
  const playdate = {
    id: `playdate-${Date.now()}`,
    matchId: match.id,
    creatorUserId: state.user.id,
    petId: match.petId,
    targetPetId: match.targetPetId,
    locationId: location.id,
    startAt: form.get("startAt"),
    note: String(form.get("note") || "").trim(),
    vaccineRequired: form.get("vaccineRequired") === "on",
    status: "pending",
    createdAt: new Date().toISOString()
  };
  state.playdates.unshift(playdate);
  state.recommendationLogs.forEach((log) => {
    if (log.candidatePetId === match.targetPetId) log.playdateCreated = true;
  });
  saveState();
  event.currentTarget.reset();
  showToast(`Playdate invite created at ${location.name}`);
}

function updatePlaydate(id, status) {
  const playdate = state.playdates.find((item) => item.id === id);
  if (!playdate) return;
  playdate.status = status;
  saveState();
  showToast(`Playdate marked ${status}`);
}

function submitFeedback(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const playdate = state.playdates.find((item) => item.id === form.get("playdateId"));
  if (!playdate) return showToast("Choose a playdate first");
  state.feedback.unshift({
    id: `feedback-${Date.now()}`,
    playdateId: playdate.id,
    rating: Number(form.get("rating")),
    repeatIntent: form.get("repeatIntent"),
    safetyFlag: form.get("safetyFlag") === "on",
    note: String(form.get("note") || "").trim(),
    createdAt: new Date().toISOString()
  });
  playdate.status = "completed";
  saveState();
  event.currentTarget.reset();
  showToast("Feedback saved");
}

function reportTarget(targetType, targetId, reason) {
  state.reports.unshift({
    id: `report-${Date.now()}`,
    targetType,
    targetId,
    reason,
    status: "open"
  });
  saveState();
  showToast("Report sent to admin queue");
}

function blockUser(userId) {
  if (state.blocks.some((block) => block.blockedUserId === userId)) return showToast("Already blocked");
  state.blocks.push({
    blockerUserId: state.user.id,
    blockedUserId: userId,
    reason: "User blocked from match surface",
    createdAt: new Date().toISOString()
  });
  saveState();
  showToast("User blocked and removed from recommendations");
}

function resetDemo() {
  state = structuredClone(initialState);
  saveState();
  render();
  showToast("Demo reset");
}

function nav() {
  const tabs = [
    ["recommend", "Recommend"],
    ["matches", "Matches"],
    ["playdates", "Playdates"],
    ["places", "Places"],
    ["profile", "Profile"],
    ["admin", "Admin"]
  ];
  return `
    <nav class="top-nav">
      <div class="brand">
        <span>PawPaw</span>
        <small>Dog playdate matching</small>
      </div>
      <div class="tabs">
        ${tabs.map(([id, label]) => `<button class="${state.activeTab === id ? "active" : ""}" data-tab="${id}">${label}</button>`).join("")}
      </div>
    </nav>
  `;
}

function hero() {
  const pet = myPet();
  return `
    <header class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Local Dog Playdates</p>
        <h1>Find compatible nearby dogs and plan safer meetups.</h1>
        <p>
          PawPaw matches owners by neighborhood, dog size, temperament, vaccine status,
          activity style, and schedule. The MVP focuses on swipe matching, public-place
          playdates, feedback, and safety controls.
        </p>
        <div class="hero-actions">
          <button class="primary" data-tab="recommend">Start swiping</button>
          <button class="secondary" data-tab="playdates">Plan playdate</button>
        </div>
      </div>
      <div class="pet-spotlight">
        <img src="${pet.avatar}" alt="${pet.name}" />
        <div>
          <strong>${pet.name}</strong>
          <span>${pet.breed} · ${sizeLabel(pet.size)} · ${pet.neighborhood}</span>
        </div>
      </div>
    </header>
  `;
}

function stats() {
  const rightSwipes = state.swipes.filter((item) => item.action === "like").length;
  const completed = state.playdates.filter((item) => item.status === "completed").length;
  return `
    <section class="stats">
      <article><span>${allCandidateCards().length}</span><p>Candidate dogs</p></article>
      <article><span>${rightSwipes}</span><p>Right swipes</p></article>
      <article><span>${state.matches.length}</span><p>Matches</p></article>
      <article><span>${state.playdates.length}</span><p>Playdates</p></article>
      <article><span>${completed}</span><p>Completed</p></article>
    </section>
  `;
}

function recommendView() {
  const candidates = candidatePets();
  const first = candidates[0];
  return `
    ${hero()}
    ${stats()}
    <section class="section-heading">
      <div>
        <p class="eyebrow">Recommendation Feed</p>
        <h2>Swipe compatible nearby dogs</h2>
      </div>
      <span class="privacy-pill">Neighborhood-level location only</span>
    </section>
    ${
      first
        ? `<section class="swipe-layout">
            ${swipeCard(first, true)}
            <div class="panel">
              <h3>Why this recommendation works</h3>
              ${first.compatibility.reasons.map((reason) => `<div class="place-row"><strong>${reason}</strong><span>Used in weighted scoring</span></div>`).join("")}
              <div class="score-box">
                <span>${first.compatibility.score}</span>
                <p>Compatibility score</p>
              </div>
            </div>
          </section>`
        : `<section class="panel empty-state"><h3>No more candidates</h3><p>Reset the demo or widen the area to get more nearby dogs.</p><button class="primary" id="reset-demo">Reset demo</button></section>`
    }
    <section class="section-heading">
      <div>
        <p class="eyebrow">Candidate Pool</p>
        <h2>All nearby dogs</h2>
      </div>
    </section>
    <section class="card-grid">
      ${allCandidateCards().map((pet) => swipeCard(pet, false)).join("")}
    </section>
  `;
}

function swipeCard(pet, primary) {
  return `
    <article class="dog-card ${primary ? "primary-card" : ""}">
      <img src="${pet.avatar}" alt="${pet.name}" />
      <div class="dog-card-body">
        <div class="post-meta">
          <span>${pet.name}</span>
          <small>${pet.distanceKm || 2}km · ${pet.neighborhood}</small>
        </div>
        <h3>${pet.breed} · ${ageText(pet.birthDate)}</h3>
        <div class="chips">
          <span>${sizeLabel(pet.size)}</span>
          <span>${energyLabel(pet.energyLevel)}</span>
          <span>${vaccineLabel(pet.vaccineStatus)}</span>
        </div>
        <p>${pet.personalityTags.join(" · ")}</p>
        <div class="compatibility-bar"><span style="width:${pet.compatibility.score}%"></span></div>
        <div class="post-actions">
          <button data-swipe-pass="${pet.id}">Pass</button>
          <button class="primary" data-swipe-like="${pet.id}">Like</button>
          <button data-report-pet="${pet.id}">Report</button>
          <button data-block-user="${pet.ownerUserId}">Block</button>
        </div>
      </div>
    </article>
  `;
}

function matchesView() {
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Matches</p>
        <h2>Mutual likes unlock chat and playdates</h2>
      </div>
    </section>
    <section class="two-column">
      <div class="panel">
        <h3>Active matches</h3>
        ${state.matches.map(matchRow).join("") || `<p class="empty-note">No matches yet. Like Biscuit to trigger a match.</p>`}
      </div>
      <div class="panel">
        <h3>Chat</h3>
        ${state.conversations.map(conversationView).join("") || `<p class="empty-note">Match first to open a conversation.</p>`}
      </div>
    </section>
  `;
}

function matchRow(match) {
  const target = petById(match.targetPetId);
  return `
    <div class="list-row">
      <img src="${target.avatar}" alt="${target.name}" />
      <div>
        <strong>${target.name}</strong>
        <span>${target.breed} · match created ${new Date(match.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  `;
}

function conversationView(conversation) {
  const match = state.matches.find((item) => item.id === conversation.matchId);
  const target = petById(match?.targetPetId);
  return `
    <div class="chat-box">
      <strong>${target?.name || "Matched dog"}</strong>
      <div class="messages">
        ${conversation.messages.map((message) => `<p><b>${message.sender}:</b> ${message.body}</p>`).join("")}
      </div>
      <form class="inline-form" data-message-form>
        <input type="hidden" name="conversationId" value="${conversation.id}" />
        <input name="body" placeholder="Suggest a public place..." />
        <button class="primary" type="submit">Send</button>
      </form>
    </div>
  `;
}

function playdatesView() {
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Playdates</p>
        <h2>Create, confirm, and review meetups</h2>
      </div>
      <span class="privacy-pill">Public places only</span>
    </section>
    <section class="two-column">
      <form class="panel form" id="playdate-form">
        <h3>New playdate</h3>
        <label>
          Match
          <select name="matchId">
            ${state.matches.map((match) => `<option value="${match.id}">${myPet().name} + ${petById(match.targetPetId)?.name}</option>`).join("")}
          </select>
        </label>
        <label>
          Public place
          <select name="locationId">
            ${state.locations.map((location) => `<option value="${location.id}">${location.name}</option>`).join("")}
          </select>
        </label>
        <label>Time <input type="datetime-local" name="startAt" value="2026-05-03T10:00" /></label>
        <label>Note <textarea name="note" rows="4" placeholder="First meetup, keep leashes on."></textarea></label>
        <label class="check-row"><input type="checkbox" name="vaccineRequired" checked /> Require vaccine status</label>
        <button class="primary" type="submit" ${state.matches.length ? "" : "disabled"}>Send invite</button>
      </form>
      <div class="panel">
        <h3>Playdate list</h3>
        ${state.playdates.map(playdateRow).join("") || `<p class="empty-note">No playdates yet.</p>`}
      </div>
    </section>
    <section class="panel feedback-panel">
      <h3>Submit feedback</h3>
      <form class="inline-form feedback-form" id="feedback-form">
        <select name="playdateId">
          ${state.playdates.map((item) => `<option value="${item.id}">${petById(item.targetPetId)?.name} at ${locationById(item.locationId)?.name}</option>`).join("")}
        </select>
        <select name="rating">
          <option value="5">5 - Great</option>
          <option value="4">4 - Good</option>
          <option value="3">3 - Okay</option>
          <option value="2">2 - Poor</option>
        </select>
        <select name="repeatIntent">
          <option value="yes">Would meet again</option>
          <option value="maybe">Maybe</option>
          <option value="no">No</option>
        </select>
        <label class="check-row"><input type="checkbox" name="safetyFlag" /> Safety concern</label>
        <input name="note" placeholder="Optional note" />
        <button class="primary" type="submit" ${state.playdates.length ? "" : "disabled"}>Save feedback</button>
      </form>
    </section>
  `;
}

function locationById(id) {
  return state.locations.find((location) => location.id === id);
}

function playdateRow(playdate) {
  const target = petById(playdate.targetPetId);
  const location = locationById(playdate.locationId);
  return `
    <div class="playdate-row">
      <div>
        <strong>${target?.name || "Matched dog"} at ${location?.name || "Public place"}</strong>
        <span>${playdate.startAt} · ${playdate.status} · ${playdate.vaccineRequired ? "vaccine required" : "vaccine optional"}</span>
      </div>
      <div class="post-actions">
        <button data-playdate-status="${playdate.id}:confirmed">Confirm</button>
        <button data-playdate-status="${playdate.id}:cancelled">Cancel</button>
        <button data-playdate-status="${playdate.id}:completed">Complete</button>
      </div>
    </div>
  `;
}

function placesView() {
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Places</p>
        <h2>Public meetup locations</h2>
      </div>
    </section>
    <section class="card-grid">
      ${state.locations
        .map(
          (location) => `
            <article class="service-card">
              <span class="tag">${location.type}</span>
              <h3>${location.name}</h3>
              <p>${location.neighborhood} · ${location.distanceKm}km away</p>
              <p>${location.safetyNotes}</p>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function profileView() {
  const pet = myPet();
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Profile</p>
        <h2>Your matchable dog profile</h2>
      </div>
    </section>
    <section class="two-column">
      <div class="panel profile-card">
        <img src="${pet.avatar}" alt="${pet.name}" />
        <h3>${pet.name}</h3>
        <p>${pet.breed} · ${ageText(pet.birthDate)} · ${pet.neighborhood}</p>
        <div class="chips">
          <span>${sizeLabel(pet.size)}</span>
          <span>${energyLabel(pet.energyLevel)}</span>
          <span>${vaccineLabel(pet.vaccineStatus)}</span>
          ${pet.personalityTags.map((tag) => `<span>${tag}</span>`).join("")}
        </div>
      </div>
      <div class="panel">
        <h3>Owner preferences</h3>
        <div class="place-row"><strong>Neighborhood</strong><span>${state.user.neighborhood}</span></div>
        <div class="place-row"><strong>Distance</strong><span>${state.user.maxDistanceKm}km max</span></div>
        <div class="place-row"><strong>Availability</strong><span>${state.user.availableWindows.join(" · ")}</span></div>
        <div class="place-row"><strong>Safety</strong><span>${state.user.safetyPreferences.join(" · ")}</span></div>
      </div>
    </section>
  `;
}

function adminView() {
  const funnel = {
    impressions: state.recommendationLogs.length,
    likes: state.swipes.filter((item) => item.action === "like").length,
    matches: state.matches.length,
    chats: state.conversations.filter((item) => item.messages.length > 1).length,
    playdates: state.playdates.length,
    feedback: state.feedback.length,
    reports: state.reports.filter((item) => item.status === "open").length
  };
  return `
    <section class="section-heading">
      <div>
        <p class="eyebrow">Admin</p>
        <h2>Recommendation and playdate funnel</h2>
      </div>
      <button class="secondary" id="reset-demo">Reset demo</button>
    </section>
    <section class="stats">
      ${Object.entries(funnel).map(([key, value]) => `<article><span>${value}</span><p>${key}</p></article>`).join("")}
    </section>
    <section class="two-column">
      <div class="panel">
        <h3>Reports</h3>
        ${state.reports.map((report) => `<div class="admin-row"><div><strong>${report.reason}</strong><span>${report.targetType}:${report.targetId} · ${report.status}</span></div><button data-resolve-report="${report.id}">Resolve</button></div>`).join("")}
      </div>
      <div class="panel">
        <h3>Recommendation logs</h3>
        ${state.recommendationLogs.map((log) => `<div class="place-row"><strong>${petById(log.candidatePetId)?.name || log.candidatePetId}</strong><span>${log.action} · score ${log.score} · matched ${log.matched}</span></div>`).join("") || `<p class="empty-note">No recommendation events yet.</p>`}
      </div>
    </section>
  `;
}

function activeView() {
  const views = {
    recommend: recommendView,
    matches: matchesView,
    playdates: playdatesView,
    places: placesView,
    profile: profileView,
    admin: adminView
  };
  return (views[state.activeTab] || recommendView)();
}

function render() {
  document.querySelector("#app").innerHTML = `
    ${nav()}
    <main>${activeView()}</main>
    ${state.toast ? `<div class="toast">${state.toast}</div>` : ""}
  `;
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => setState({ activeTab: button.dataset.tab }));
  });
  document.querySelectorAll("[data-swipe-like]").forEach((button) => {
    button.addEventListener("click", () => swipe(button.dataset.swipeLike, "like"));
  });
  document.querySelectorAll("[data-swipe-pass]").forEach((button) => {
    button.addEventListener("click", () => swipe(button.dataset.swipePass, "pass"));
  });
  document.querySelectorAll("[data-report-pet]").forEach((button) => {
    button.addEventListener("click", () => reportTarget("pet", button.dataset.reportPet, "User reported dog profile"));
  });
  document.querySelectorAll("[data-block-user]").forEach((button) => {
    button.addEventListener("click", () => blockUser(button.dataset.blockUser));
  });
  document.querySelectorAll("[data-message-form]").forEach((form) => form.addEventListener("submit", sendMessage));
  document.querySelector("#playdate-form")?.addEventListener("submit", createPlaydate);
  document.querySelector("#feedback-form")?.addEventListener("submit", submitFeedback);
  document.querySelectorAll("[data-playdate-status]").forEach((button) => {
    button.addEventListener("click", () => {
      const [id, status] = button.dataset.playdateStatus.split(":");
      updatePlaydate(id, status);
    });
  });
  document.querySelectorAll("[data-resolve-report]").forEach((button) => {
    button.addEventListener("click", () => {
      const report = state.reports.find((item) => item.id === button.dataset.resolveReport);
      if (report) report.status = "resolved";
      saveState();
      showToast("Report resolved");
    });
  });
  document.querySelector("#reset-demo")?.addEventListener("click", resetDemo);
}

render();
