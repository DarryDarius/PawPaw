(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const p of i.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&n(p)}).observe(document,{childList:!0,subtree:!0});function a(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(o){if(o.ep)return;o.ep=!0;const i=a(o);fetch(o.href,i)}})();const f=["https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1000&q=80"],z="2026-04-29",R=window.localStorage.getItem("pawpaw-api-base-url")||"http://localhost:8080/api/v1",b={api:{token:window.localStorage.getItem("pawpaw-session-token")||"",me:null,recommendations:[],matches:[],messages:{},locations:[],playdates:[],admin:null,status:"",error:""},user:{id:"u1",nickname:"Darius",neighborhood:"Hyde Park",availableWindows:["weekday_evening","weekend_morning"],meetupPreferences:["public_place_only","small_group_ok"],maxDistanceKm:5,safetyPreferences:["vaccine_preferred","no_home_address"]},pets:[{id:"p1",ownerUserId:"u1",name:"Mochi",breed:"Corgi",birthDate:"2023-05-12",sex:"female",avatar:f[0],size:"small",neutered:!0,vaccineStatus:"verified",energyLevel:"medium",personalityTags:["friendly","gentle","shy_at_first"],activityPreferences:["walk","dog_park","training"],acceptsLargeDogs:!1,neighborhood:"Hyde Park"},{id:"p2",ownerUserId:"u2",name:"Biscuit",breed:"Beagle",birthDate:"2022-10-02",sex:"male",avatar:f[1],size:"medium",neutered:!0,vaccineStatus:"verified",energyLevel:"medium",personalityTags:["friendly","curious","food_motivated"],activityPreferences:["walk","dog_park","short_trip"],acceptsLargeDogs:!0,neighborhood:"Hyde Park",distanceKm:1.4,availableWindows:["weekday_evening","weekend_morning"],likedBack:!0},{id:"p3",ownerUserId:"u3",name:"Luna",breed:"Toy Poodle",birthDate:"2021-07-18",sex:"female",avatar:f[2],size:"small",neutered:!0,vaccineStatus:"verified",energyLevel:"low",personalityTags:["calm","gentle","people_friendly"],activityPreferences:["walk","cafe","small_group"],acceptsLargeDogs:!1,neighborhood:"Kenwood",distanceKm:2.1,availableWindows:["weekend_morning","weekend_afternoon"],likedBack:!1},{id:"p4",ownerUserId:"u4",name:"Otis",breed:"Golden Retriever",birthDate:"2020-03-09",sex:"male",avatar:f[3],size:"large",neutered:!0,vaccineStatus:"self_reported",energyLevel:"high",personalityTags:["playful","high_energy","large_dog_friendly"],activityPreferences:["dog_park","fetch","short_trip"],acceptsLargeDogs:!0,neighborhood:"South Loop",distanceKm:5.8,availableWindows:["weekday_evening"],likedBack:!0},{id:"p5",ownerUserId:"u5",name:"Pepper",breed:"Shiba Inu",birthDate:"2022-01-21",sex:"female",avatar:f[4],size:"medium",neutered:!1,vaccineStatus:"verified",energyLevel:"medium",personalityTags:["independent","selective","calm"],activityPreferences:["walk","training"],acceptsLargeDogs:!1,neighborhood:"Hyde Park",distanceKm:.9,availableWindows:["weekend_afternoon"],likedBack:!1}],locations:[{id:"loc1",name:"Jackson Bark",type:"Dog park",neighborhood:"Hyde Park",distanceKm:1.2,isPublicPlace:!0,safetyNotes:"Fenced dog park, best for daytime meetups."},{id:"loc2",name:"Promontory Point",type:"Lakefront walk",neighborhood:"Hyde Park",distanceKm:1.7,isPublicPlace:!0,safetyNotes:"Open public route, keep dogs leashed."},{id:"loc3",name:"Hyde Park Pet Friendly Cafe",type:"Cafe patio",neighborhood:"Hyde Park",distanceKm:.8,isPublicPlace:!0,safetyNotes:"Good for calm dogs and first meetups."}],swipes:[],matches:[],conversations:[],playdates:[],feedback:[],reports:[{id:"r1",targetType:"location",targetId:"loc1",reason:"Review safety note for evening meetups",status:"open"}],blocks:[],recommendationLogs:[],activeTab:"recommend",selectedCandidateId:"",toast:""};let s=W();function W(){const e=window.localStorage.getItem("pawpaw-playdate-state");if(!e)return structuredClone(b);try{const t=JSON.parse(e);return{...structuredClone(b),...t,api:{...structuredClone(b).api,...t.api||{}}}}catch{return structuredClone(b)}}function d(){s.api?.token&&window.localStorage.setItem("pawpaw-session-token",s.api.token),window.localStorage.setItem("pawpaw-playdate-state",JSON.stringify(s))}function C(e){s={...s,...e},d(),u()}function r(e){s.toast=e,u(),window.clearTimeout(r.timer),r.timer=window.setTimeout(()=>{s.toast="",u()},2200)}function c(e){s.api={...s.api,...e},d(),u()}async function l(e,t={}){const a={"Content-Type":"application/json",...t.headers||{}};s.api.token&&(a.Authorization=`Bearer ${s.api.token}`);const n=await fetch(`${R}${e}`,{...t,headers:a}),o=await n.json().catch(()=>({}));if(!n.ok)throw new Error(o?.error?.message||"API request failed");return o}async function V(e){e.preventDefault();const t=new FormData(e.currentTarget);c({status:"Logging in...",error:""});try{const a=await l("/auth/login",{method:"POST",body:JSON.stringify({email:String(t.get("email")||"").trim(),nickname:String(t.get("nickname")||"").trim(),neighborhood:String(t.get("neighborhood")||"").trim()})});window.localStorage.setItem("pawpaw-session-token",a.session.token),c({token:a.session.token,status:"Logged in",error:""}),await I(),r("Logged in")}catch(a){c({status:"",error:a.message})}}async function I(){if(s.api.token){c({status:"Loading profile...",error:""});try{const e=await l("/me");c({me:e,status:"Profile loaded",error:""}),e.profileComplete&&(await H(),await k(),await $(),await v(),await g())}catch(e){c({status:"",error:e.message})}}}async function k(){if(s.api.token){c({status:"Loading recommendations...",error:""});try{const e=await l("/recommendations/feed");c({recommendations:e.recommendations||[],status:"Recommendations loaded",error:""})}catch(e){c({status:"",error:e.message})}}}async function q(e,t){const a=s.api.me?.pets?.[0];if(!a)return r("Create a dog profile first");c({status:`${t==="like"?"Liking":"Skipping"} dog...`,error:""});try{const n=await l("/swipes",{method:"POST",body:JSON.stringify({petId:Number(a.id),targetPetId:Number(e),action:t,idempotencyKey:`${s.api.me.user.id}:${e}:${t}:${Date.now()}`})});await k(),n.matched?(await $(),C({activeTab:"matches"}),r("It's a match")):r(t==="like"?"Liked dog":"Skipped dog")}catch(n){c({status:"",error:n.message})}}async function $(){if(s.api.token)try{const t=(await l("/matches")).matches||[],a={...s.api.messages};for(const n of t){const o=await l(`/conversations/${n.conversationId}/messages`);a[n.conversationId]=o.messages||[]}c({matches:t,messages:a,status:"Matches loaded",error:""})}catch(e){c({status:"",error:e.message})}}async function H(){if(s.api.token)try{const e=await l("/locations");c({locations:e.locations||[],error:""})}catch(e){c({status:"",error:e.message})}}async function v(){if(s.api.token)try{const e=await l("/playdates");c({playdates:e.playdates||[],status:"Playdates loaded",error:""})}catch(e){c({status:"",error:e.message})}}async function J(e){e.preventDefault();const t=new FormData(e.currentTarget);try{await l("/playdates",{method:"POST",body:JSON.stringify({matchId:Number(t.get("matchId")),locationId:Number(t.get("locationId")),startAt:String(t.get("startAt")||""),note:String(t.get("note")||"").trim(),vaccineRequired:t.get("vaccineRequired")==="on"})}),e.currentTarget.reset(),await v(),await g(),r("Playdate invite created")}catch(a){c({status:"",error:a.message})}}async function S(e,t,a=""){try{const n=t==="respond"?`/playdates/${e}/respond`:`/playdates/${e}/${t}`;await l(n,{method:"POST",body:JSON.stringify(t==="respond"?{status:a}:{})}),await v(),await g(),r(`Playdate ${a||t}`)}catch(n){c({status:"",error:n.message})}}async function G(e){e.preventDefault();const t=new FormData(e.currentTarget),a=t.get("playdateId");try{await l(`/playdates/${a}/feedback`,{method:"POST",body:JSON.stringify({toUserId:Number(t.get("toUserId")||0),rating:Number(t.get("rating")),repeatIntent:String(t.get("repeatIntent")||"maybe"),safetyFlag:t.get("safetyFlag")==="on",note:String(t.get("note")||"").trim()})}),e.currentTarget.reset(),await v(),await g(),r("Feedback saved")}catch(n){c({status:"",error:n.message})}}async function Y(e,t,a){if(!s.api.token)return j(e,t,a);try{await l("/reports",{method:"POST",body:JSON.stringify({targetType:e,targetId:String(t),reason:a})}),await g(),r("Report sent")}catch(n){c({status:"",error:n.message})}}async function Q(e){if(!s.api.token)return F(String(e));try{await l("/blocks",{method:"POST",body:JSON.stringify({blockedUserId:Number(e),reason:"Blocked from recommendation surface"})}),await k(),await g(),r("User blocked")}catch(t){c({status:"",error:t.message})}}async function g(){if(s.api.token)try{const[e,t]=await Promise.all([l("/admin/dashboard"),l("/admin/reports")]);c({admin:{...e.dashboard||{},reports:t.reports||[]},error:""})}catch(e){c({status:"",error:e.message})}}async function X(e){try{await l(`/admin/reports/${e}/resolve`,{method:"POST",body:JSON.stringify({})}),await g(),r("Report resolved")}catch(t){c({status:"",error:t.message})}}async function Z(e){e.preventDefault();const t=new FormData(e.currentTarget),a=t.get("conversationId"),n=String(t.get("body")||"").trim();if(!(!a||!n))try{await l(`/conversations/${a}/messages`,{method:"POST",body:JSON.stringify({body:n})}),e.currentTarget.reset(),await $(),r("Message sent")}catch(o){c({status:"",error:o.message})}}async function ee(e){e.preventDefault();const t=new FormData(e.currentTarget);c({status:"Saving owner profile...",error:""});try{const a=await l("/me",{method:"PATCH",body:JSON.stringify({nickname:String(t.get("nickname")||"").trim(),neighborhood:String(t.get("neighborhood")||"").trim(),maxDistanceKm:Number(t.get("maxDistanceKm")||5),availableWindows:t.getAll("availableWindows"),meetupPreferences:t.getAll("meetupPreferences"),safetyPreferences:t.getAll("safetyPreferences")})});c({me:a,status:"Owner profile saved",error:""}),r("Owner profile saved")}catch(a){c({status:"",error:a.message})}}async function te(e){e.preventDefault();const t=new FormData(e.currentTarget);c({status:"Creating dog profile...",error:""});try{await l("/pets",{method:"POST",body:JSON.stringify({name:String(t.get("name")||"").trim(),breed:String(t.get("breed")||"").trim(),birthDate:String(t.get("birthDate")||"").trim(),sex:String(t.get("sex")||"unknown"),avatarUrl:String(t.get("avatarUrl")||"").trim(),size:String(t.get("size")||"medium"),neutered:t.get("neutered")==="on",vaccineStatus:String(t.get("vaccineStatus")||"unknown"),personalityTags:E(t.get("personalityTags")),activityPreferences:E(t.get("activityPreferences")),acceptsLargeDogs:t.get("acceptsLargeDogs")==="on",energyLevel:String(t.get("energyLevel")||"medium"),neighborhood:String(t.get("neighborhood")||"").trim()})}),e.currentTarget.reset(),await I(),r("Dog profile created")}catch(a){c({status:"",error:a.message})}}function ae(){s.api={token:"",me:null,status:"",error:""},window.localStorage.removeItem("pawpaw-session-token"),d(),u(),r("Logged out")}function E(e){return String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function m(){return s.pets.find(e=>e.ownerUserId===s.user.id)||s.pets[0]}function y(e){return s.pets.find(t=>t.id===e)}function se(){const e=new Set(s.blocks.map(a=>a.blockedUserId)),t=new Set(s.swipes.map(a=>a.targetPetId));return s.pets.filter(a=>a.ownerUserId!==s.user.id).filter(a=>!e.has(a.ownerUserId)).filter(a=>!t.has(a.id)).map(a=>({...a,compatibility:L(m(),a)})).sort((a,n)=>n.compatibility.score-a.compatibility.score)}function U(){return s.pets.filter(e=>e.ownerUserId!==s.user.id).map(e=>({...e,compatibility:L(m(),e)})).sort((e,t)=>t.compatibility.score-e.compatibility.score)}function L(e,t){const a=Math.max(0,100-Math.round((t.distanceKm||3)*12)),n=ne(e,t),o=P(e.personalityTags,t.personalityTags,["friendly","gentle","calm"]),i=P(s.user.availableWindows,t.availableWindows||[],[]),p=P(e.activityPreferences,t.activityPreferences,[]),T=t.vaccineStatus==="verified"?100:60,K=t.likedBack?92:78;return{score:Math.round(.25*a+.2*o+.15*n+.15*i+.1*p+.1*T+.05*K),reasons:[`${t.distanceKm||2}km away`,`${w(t.size)} compatibility ${n}%`,`${i}% schedule overlap`,T===100?"Verified vaccine status":"Self-reported vaccine status"]}}function ne(e,t){return e.size===t.size?100:e.size==="small"&&t.size==="large"&&!e.acceptsLargeDogs?35:e.size==="large"&&t.size==="small"&&!t.acceptsLargeDogs?45:76}function P(e=[],t=[],a=[]){if(!e.length||!t.length)return 50;const n=new Set(e),o=t.filter(p=>n.has(p)).length,i=t.filter(p=>a.includes(p)).length;return Math.min(100,Math.round(o/Math.max(e.length,t.length)*100+i*14+36))}function w(e){return{small:"Small dog",medium:"Medium dog",large:"Large dog"}[e]||"Dog"}function x(e){return{low:"Low energy",medium:"Medium energy",high:"High energy"}[e]||"Energy TBD"}function D(e){return{verified:"Vaccine verified",self_reported:"Vaccine self-reported",unknown:"Vaccine unknown"}[e]||e}function A(e={}){return{...e,id:String(e.id||""),ownerUserId:String(e.ownerUserId||""),avatar:e.avatar||e.avatarUrl||f[0],birthDate:e.birthDate||"2023-01-01",distanceKm:e.distanceKm||2}}function M(e){const t=new Date(`${e}T00:00:00`),a=new Date(`${z}T00:00:00`),n=Math.max(1,(a.getFullYear()-t.getFullYear())*12+a.getMonth()-t.getMonth()),o=Math.floor(n/12);return o?`${o} yr ${n%12?`${n%12} mo`:""}`.trim():`${n} mo`}function N(e,t){const a=y(e);if(!a)return r("Candidate not found");if(s.swipes.some(o=>o.targetPetId===e))return r("Already swiped this dog");const n={id:`swipe-${Date.now()}`,userId:s.user.id,petId:m().id,targetUserId:a.ownerUserId,targetPetId:e,action:t,idempotencyKey:`${s.user.id}:${e}:${t}`,createdAt:new Date().toISOString()};if(s.swipes.push(n),s.recommendationLogs.push({id:`log-${Date.now()}`,userId:s.user.id,candidatePetId:e,action:t,matched:!1,playdateCreated:!1,shownAt:new Date().toISOString(),score:L(m(),a).score}),t==="like"&&a.likedBack)return oe(a),s.activeTab="matches",d(),r(`It's a match with ${a.name}`);d(),u(),r(t==="like"?`Liked ${a.name}`:`Skipped ${a.name}`)}function oe(e){const t=s.matches.find(o=>o.targetPetId===e.id);if(t)return t;const a={id:`match-${Date.now()}`,userLowId:s.user.id<e.ownerUserId?s.user.id:e.ownerUserId,userHighId:s.user.id<e.ownerUserId?e.ownerUserId:s.user.id,petId:m().id,targetPetId:e.id,status:"active",createdAt:new Date().toISOString()},n={id:`conv-${Date.now()}`,matchId:a.id,messages:[{id:`msg-${Date.now()}`,sender:"system",body:`You matched with ${e.name}. Pick a public place to plan the first playdate.`,createdAt:"now"}],unread:1};return s.matches.unshift(a),s.conversations.unshift(n),s.recommendationLogs.forEach(o=>{o.candidatePetId===e.id&&(o.matched=!0)}),a}function ie(e){e.preventDefault();const t=new FormData(e.currentTarget),a=String(t.get("body")||"").trim(),n=s.conversations.find(o=>o.id===t.get("conversationId"));!a||!n||(n.messages.push({id:`msg-${Date.now()}`,sender:s.user.nickname,body:a,createdAt:"now"}),n.unread=0,d(),e.currentTarget.reset(),r("Message sent"))}function re(e){e.preventDefault();const t=new FormData(e.currentTarget),a=s.matches.find(i=>i.id===t.get("matchId")),n=s.locations.find(i=>i.id===t.get("locationId"));if(!a||!n)return r("Choose a match and public place");const o={id:`playdate-${Date.now()}`,matchId:a.id,creatorUserId:s.user.id,petId:a.petId,targetPetId:a.targetPetId,locationId:n.id,startAt:t.get("startAt"),note:String(t.get("note")||"").trim(),vaccineRequired:t.get("vaccineRequired")==="on",status:"pending",createdAt:new Date().toISOString()};s.playdates.unshift(o),s.recommendationLogs.forEach(i=>{i.candidatePetId===a.targetPetId&&(i.playdateCreated=!0)}),d(),e.currentTarget.reset(),r(`Playdate invite created at ${n.name}`)}function ce(e,t){const a=s.playdates.find(n=>n.id===e);a&&(a.status=t,d(),r(`Playdate marked ${t}`))}function le(e){e.preventDefault();const t=new FormData(e.currentTarget),a=s.playdates.find(n=>n.id===t.get("playdateId"));if(!a)return r("Choose a playdate first");s.feedback.unshift({id:`feedback-${Date.now()}`,playdateId:a.id,rating:Number(t.get("rating")),repeatIntent:t.get("repeatIntent"),safetyFlag:t.get("safetyFlag")==="on",note:String(t.get("note")||"").trim(),createdAt:new Date().toISOString()}),a.status="completed",d(),e.currentTarget.reset(),r("Feedback saved")}function j(e,t,a){s.reports.unshift({id:`report-${Date.now()}`,targetType:e,targetId:t,reason:a,status:"open"}),d(),r("Report sent to admin queue")}function F(e){if(s.blocks.some(t=>t.blockedUserId===e))return r("Already blocked");s.blocks.push({blockerUserId:s.user.id,blockedUserId:e,reason:"User blocked from match surface",createdAt:new Date().toISOString()}),d(),r("User blocked and removed from recommendations")}function de(){s=structuredClone(b),d(),u(),r("Demo reset")}function pe(){return`
    <nav class="top-nav">
      <div class="brand">
        <span>PawPaw</span>
        <small>Dog playdate matching</small>
      </div>
      <div class="tabs">
        ${[["onboarding","Onboarding"],["recommend","Recommend"],["matches","Matches"],["playdates","Playdates"],["places","Places"],["profile","Profile"],["admin","Admin"]].map(([t,a])=>`<button class="${s.activeTab===t?"active":""}" data-tab="${t}">${a}</button>`).join("")}
      </div>
    </nav>
  `}function me(){const e=m();return`
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
        <img src="${e.avatar}" alt="${e.name}" />
        <div>
          <strong>${e.name}</strong>
          <span>${e.breed} · ${w(e.size)} · ${e.neighborhood}</span>
        </div>
      </div>
    </header>
  `}function ue(){const e=s.swipes.filter(a=>a.action==="like").length,t=s.playdates.filter(a=>a.status==="completed").length;return`
    <section class="stats">
      <article><span>${U().length}</span><p>Candidate dogs</p></article>
      <article><span>${e}</span><p>Right swipes</p></article>
      <article><span>${s.matches.length}</span><p>Matches</p></article>
      <article><span>${s.playdates.length}</span><p>Playdates</p></article>
      <article><span>${t}</span><p>Completed</p></article>
    </section>
  `}function _(){const e=!!(s.api.token&&s.api.me?.profileComplete),t=(s.api.recommendations||[]).map(i=>({...A(i.pet),owner:i.owner,compatibility:{score:i.score,reasons:i.reasons||[]}})),a=se(),o=(e?t:a)[0];return`
    ${me()}
    ${ue()}
    <section class="section-heading">
      <div>
        <p class="eyebrow">Recommendation Feed</p>
        <h2>Swipe compatible nearby dogs</h2>
      </div>
      <div class="post-actions">
        ${e?'<button class="secondary" id="load-recommendations">Refresh API feed</button>':""}
        <span class="privacy-pill">${e?"Live API feed":"Demo local feed"}</span>
      </div>
    </section>
    ${o?`<section class="swipe-layout">
            ${O(o,!0,e?"api":"local")}
            <div class="panel">
              <h3>Why this recommendation works</h3>
              ${o.compatibility.reasons.map(i=>`<div class="place-row"><strong>${i}</strong><span>Used in weighted scoring</span></div>`).join("")}
              <div class="score-box">
                <span>${o.compatibility.score}</span>
                <p>Compatibility score</p>
              </div>
            </div>
          </section>`:'<section class="panel empty-state"><h3>No more candidates</h3><p>Reset the demo or widen the area to get more nearby dogs.</p><button class="primary" id="reset-demo">Reset demo</button></section>'}
    <section class="section-heading">
      <div>
        <p class="eyebrow">Candidate Pool</p>
        <h2>All nearby dogs</h2>
      </div>
    </section>
    <section class="card-grid">
      ${(e?t:U()).map(i=>O(i,!1,e?"api":"local")).join("")}
    </section>
  `}function O(e,t,a="local"){const n=a==="api"?`data-api-swipe-like="${e.id}"`:`data-swipe-like="${e.id}"`,o=a==="api"?`data-api-swipe-pass="${e.id}"`:`data-swipe-pass="${e.id}"`;return`
    <article class="dog-card ${t?"primary-card":""}">
      <img src="${e.avatar}" alt="${e.name}" />
      <div class="dog-card-body">
        <div class="post-meta">
          <span>${e.name}</span>
          <small>${e.distanceKm||2}km · ${e.neighborhood}</small>
        </div>
        <h3>${e.breed} · ${M(e.birthDate)}</h3>
        <div class="chips">
          <span>${w(e.size)}</span>
          <span>${x(e.energyLevel)}</span>
          <span>${D(e.vaccineStatus)}</span>
        </div>
        <p>${e.personalityTags.join(" · ")}</p>
        <div class="compatibility-bar"><span style="width:${e.compatibility.score}%"></span></div>
        <div class="post-actions">
          <button ${o}>Pass</button>
          <button class="primary" ${n}>Like</button>
          <button data-api-report-pet="${e.id}">Report</button>
          <button data-api-block-user="${e.ownerUserId}">Block</button>
        </div>
      </div>
    </article>
  `}function ge(){return s.api.token&&s.api.me?.profileComplete?he():`
    <section class="section-heading">
      <div>
        <p class="eyebrow">Matches</p>
        <h2>Mutual likes unlock chat and playdates</h2>
      </div>
    </section>
    <section class="two-column">
      <div class="panel">
        <h3>Active matches</h3>
        ${s.matches.map(be).join("")||'<p class="empty-note">No matches yet. Like Biscuit to trigger a match.</p>'}
      </div>
      <div class="panel">
        <h3>Chat</h3>
        ${s.conversations.map(ve).join("")||'<p class="empty-note">Match first to open a conversation.</p>'}
      </div>
    </section>
  `}function he(){return`
    <section class="section-heading">
      <div>
        <p class="eyebrow">Matches</p>
        <h2>Live matches and chat</h2>
      </div>
      <button class="secondary" id="load-api-matches">Refresh matches</button>
    </section>
    <section class="two-column">
      <div class="panel">
        <h3>Active matches</h3>
        ${s.api.matches.map(fe).join("")||'<p class="empty-note">No live matches yet. Like a dog who has liked you back.</p>'}
      </div>
      <div class="panel">
        <h3>Chat</h3>
        ${s.api.matches.map(ye).join("")||'<p class="empty-note">A live match will open a conversation here.</p>'}
      </div>
    </section>
  `}function fe(e){const t=A(e.targetPet);return`
    <div class="list-row">
      <img src="${t.avatar}" alt="${t.name}" />
      <div>
        <strong>${t.name}</strong>
        <span>${t.breed} · conversation ${e.conversationId}</span>
      </div>
    </div>
  `}function ye(e){const t=A(e.targetPet),a=s.api.messages[e.conversationId]||[];return`
    <div class="chat-box">
      <strong>${t.name}</strong>
      <div class="messages">
        ${a.map(n=>`<p><b>${n.senderUserId===s.api.me?.user?.id?"You":t.name}:</b> ${n.body}</p>`).join("")||"<p>No messages yet.</p>"}
      </div>
      <form class="inline-form" data-api-message-form>
        <input type="hidden" name="conversationId" value="${e.conversationId}" />
        <input name="body" placeholder="Suggest a public place..." />
        <button class="primary" type="submit">Send</button>
      </form>
    </div>
  `}function be(e){const t=y(e.targetPetId);return`
    <div class="list-row">
      <img src="${t.avatar}" alt="${t.name}" />
      <div>
        <strong>${t.name}</strong>
        <span>${t.breed} · match created ${new Date(e.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  `}function ve(e){const t=s.matches.find(n=>n.id===e.matchId);return`
    <div class="chat-box">
      <strong>${y(t?.targetPetId)?.name||"Matched dog"}</strong>
      <div class="messages">
        ${e.messages.map(n=>`<p><b>${n.sender}:</b> ${n.body}</p>`).join("")}
      </div>
      <form class="inline-form" data-message-form>
        <input type="hidden" name="conversationId" value="${e.id}" />
        <input name="body" placeholder="Suggest a public place..." />
        <button class="primary" type="submit">Send</button>
      </form>
    </div>
  `}function we(){return s.api.token&&s.api.me?.profileComplete?ke():`
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
            ${s.matches.map(e=>`<option value="${e.id}">${m().name} + ${y(e.targetPetId)?.name}</option>`).join("")}
          </select>
        </label>
        <label>
          Public place
          <select name="locationId">
            ${s.locations.map(e=>`<option value="${e.id}">${e.name}</option>`).join("")}
          </select>
        </label>
        <label>Time <input type="datetime-local" name="startAt" value="2026-05-03T10:00" /></label>
        <label>Note <textarea name="note" rows="4" placeholder="First meetup, keep leashes on."></textarea></label>
        <label class="check-row"><input type="checkbox" name="vaccineRequired" checked /> Require vaccine status</label>
        <button class="primary" type="submit" ${s.matches.length?"":"disabled"}>Send invite</button>
      </form>
      <div class="panel">
        <h3>Playdate list</h3>
        ${s.playdates.map(Pe).join("")||'<p class="empty-note">No playdates yet.</p>'}
      </div>
    </section>
    <section class="panel feedback-panel">
      <h3>Submit feedback</h3>
      <form class="inline-form feedback-form" id="feedback-form">
        <select name="playdateId">
          ${s.playdates.map(e=>`<option value="${e.id}">${y(e.targetPetId)?.name} at ${B(e.locationId)?.name}</option>`).join("")}
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
        <button class="primary" type="submit" ${s.playdates.length?"":"disabled"}>Save feedback</button>
      </form>
    </section>
  `}function ke(){const e=s.api.matches||[],t=s.api.locations||[],a=s.api.playdates||[];return`
    <section class="section-heading">
      <div>
        <p class="eyebrow">Playdates</p>
        <h2>Live playdate invites and feedback</h2>
      </div>
      <div class="post-actions">
        <button class="secondary" id="load-api-playdates">Refresh playdates</button>
        <span class="privacy-pill">Public places only</span>
      </div>
    </section>
    <section class="two-column">
      <form class="panel form" id="api-playdate-form">
        <h3>New playdate</h3>
        <label>
          Match
          <select name="matchId">
            ${e.map(n=>`<option value="${n.id}">${n.pet.name} + ${n.targetPet.name}</option>`).join("")}
          </select>
        </label>
        <label>
          Public place
          <select name="locationId">
            ${t.map(n=>`<option value="${n.id}">${n.name} · ${n.neighborhood||"Chicago"}</option>`).join("")}
          </select>
        </label>
        <label>Time <input type="datetime-local" name="startAt" value="2026-05-03T10:00" /></label>
        <label>Note <textarea name="note" rows="4" placeholder="First meetup, keep leashes on."></textarea></label>
        <label class="check-row"><input type="checkbox" name="vaccineRequired" checked /> Require vaccine status</label>
        <button class="primary" type="submit" ${e.length&&t.length?"":"disabled"}>Send invite</button>
      </form>
      <div class="panel">
        <h3>Playdate list</h3>
        ${a.map($e).join("")||'<p class="empty-note">No live playdates yet.</p>'}
      </div>
    </section>
    <section class="panel feedback-panel">
      <h3>Submit feedback</h3>
      <form class="inline-form feedback-form" id="api-feedback-form">
        <select name="playdateId">
          ${a.map(n=>`<option value="${n.id}">${n.location.name} · ${n.status}</option>`).join("")}
        </select>
        <select name="toUserId">
          ${Se(a).map(n=>`<option value="${n.id}">${n.label}</option>`).join("")}
        </select>
        <select name="rating">
          <option value="5">5 - Great</option>
          <option value="4">4 - Good</option>
          <option value="3">3 - Okay</option>
          <option value="2">2 - Poor</option>
          <option value="1">1 - Bad</option>
        </select>
        <select name="repeatIntent">
          <option value="yes">Would meet again</option>
          <option value="maybe">Maybe</option>
          <option value="no">No</option>
        </select>
        <label class="check-row"><input type="checkbox" name="safetyFlag" /> Safety concern</label>
        <input name="note" placeholder="Optional note" />
        <button class="primary" type="submit" ${a.length?"":"disabled"}>Save feedback</button>
      </form>
    </section>
  `}function $e(e){return`
    <div class="playdate-row">
      <div>
        <strong>${(e.participants||[]).find(a=>a.userId!==s.api.me?.user?.id)?.pet?.name||"Matched dog"} at ${e.location.name}</strong>
        <span>${e.startAt} · ${e.status} · ${e.vaccineRequired?"vaccine required":"vaccine optional"}</span>
      </div>
      <div class="post-actions">
        <button data-api-playdate-respond="${e.id}:confirmed">Confirm</button>
        <button data-api-playdate-cancel="${e.id}">Cancel</button>
        <button data-api-playdate-checkin="${e.id}">Check in</button>
      </div>
    </div>
  `}function Se(e){const t=[];for(const a of e)for(const n of a.participants||[])n.userId!==s.api.me?.user?.id&&t.push({id:n.userId,label:n.pet?.name||`User ${n.userId}`});return t}function B(e){return s.locations.find(t=>t.id===e)}function Pe(e){const t=y(e.targetPetId),a=B(e.locationId);return`
    <div class="playdate-row">
      <div>
        <strong>${t?.name||"Matched dog"} at ${a?.name||"Public place"}</strong>
        <span>${e.startAt} · ${e.status} · ${e.vaccineRequired?"vaccine required":"vaccine optional"}</span>
      </div>
      <div class="post-actions">
        <button data-playdate-status="${e.id}:confirmed">Confirm</button>
        <button data-playdate-status="${e.id}:cancelled">Cancel</button>
        <button data-playdate-status="${e.id}:completed">Complete</button>
      </div>
    </div>
  `}function Ie(){return s.api.token&&s.api.locations?.length?`
      <section class="section-heading">
        <div>
          <p class="eyebrow">Places</p>
          <h2>Live public meetup locations</h2>
        </div>
      </section>
      <section class="card-grid">
        ${s.api.locations.map(e=>`
              <article class="service-card">
                <span class="tag">${e.type}</span>
                <h3>${e.name}</h3>
                <p>${e.neighborhood||e.city||"Chicago"}</p>
                <p>${e.safetyNotes||"Public place for first meetups."}</p>
              </article>
            `).join("")}
      </section>
    `:`
    <section class="section-heading">
      <div>
        <p class="eyebrow">Places</p>
        <h2>Public meetup locations</h2>
      </div>
    </section>
    <section class="card-grid">
      ${s.locations.map(e=>`
            <article class="service-card">
              <span class="tag">${e.type}</span>
              <h3>${e.name}</h3>
              <p>${e.neighborhood} · ${e.distanceKm}km away</p>
              <p>${e.safetyNotes}</p>
            </article>
          `).join("")}
    </section>
  `}function Le(){const e=s.api.me,t=e?.ownerProfile||{},a=e?.pets||[];return`
    <section class="section-heading">
      <div>
        <p class="eyebrow">Onboarding</p>
        <h2>Create the real matchable profile</h2>
      </div>
      <span class="privacy-pill">${e?.profileComplete?"Ready for recommendations":"Profile needs setup"}</span>
    </section>
    <section class="two-column">
      <form class="panel form" id="login-form">
        <h3>Email login</h3>
        <label>Email <input name="email" type="email" value="darius@example.com" required /></label>
        <label>Nickname <input name="nickname" value="${e?.user?.nickname||"Darius"}" /></label>
        <label>Neighborhood <input name="neighborhood" value="${e?.user?.neighborhood||"Hyde Park"}" /></label>
        <div class="post-actions">
          <button class="primary" type="submit">Login</button>
          <button class="secondary" type="button" id="load-account" ${s.api.token?"":"disabled"}>Refresh</button>
          <button type="button" id="logout-api" ${s.api.token?"":"disabled"}>Logout</button>
        </div>
        ${s.api.status?`<p class="empty-note">${s.api.status}</p>`:""}
        ${s.api.error?`<p class="error-note">${s.api.error}</p>`:""}
        <p class="empty-note">API: ${R}</p>
      </form>
      <div class="panel">
        <h3>Account status</h3>
        ${e?`
              <div class="place-row"><strong>User</strong><span>${e.user.nickname} · ${e.user.neighborhood||"Neighborhood TBD"}</span></div>
              <div class="place-row"><strong>Availability</strong><span>${t.availableWindows?.join(" · ")||"Not set"}</span></div>
              <div class="place-row"><strong>Distance</strong><span>${t.maxDistanceKm||5}km max</span></div>
              <div class="place-row"><strong>Dogs</strong><span>${a.length}</span></div>
            `:'<p class="empty-note">Login to load your persisted PawPaw profile.</p>'}
      </div>
    </section>
    <section class="two-column">
      <form class="panel form" id="owner-form">
        <h3>Owner profile</h3>
        <label>Nickname <input name="nickname" value="${e?.user?.nickname||"Darius"}" /></label>
        <label>Neighborhood <input name="neighborhood" value="${e?.user?.neighborhood||"Hyde Park"}" /></label>
        <label>Max distance <input name="maxDistanceKm" type="number" min="1" max="25" step="1" value="${t.maxDistanceKm||5}" /></label>
        <label class="check-row"><input type="checkbox" name="availableWindows" value="weekday_evening" ${h(t.availableWindows,"weekday_evening")} /> Weekday evening</label>
        <label class="check-row"><input type="checkbox" name="availableWindows" value="weekend_morning" ${h(t.availableWindows,"weekend_morning")} /> Weekend morning</label>
        <label class="check-row"><input type="checkbox" name="availableWindows" value="weekend_afternoon" ${h(t.availableWindows,"weekend_afternoon")} /> Weekend afternoon</label>
        <label class="check-row"><input type="checkbox" name="meetupPreferences" value="public_place_only" ${h(t.meetupPreferences,"public_place_only",!0)} /> Public places only</label>
        <label class="check-row"><input type="checkbox" name="meetupPreferences" value="small_group_ok" ${h(t.meetupPreferences,"small_group_ok",!0)} /> Small groups ok</label>
        <label class="check-row"><input type="checkbox" name="safetyPreferences" value="vaccine_preferred" ${h(t.safetyPreferences,"vaccine_preferred",!0)} /> Vaccine preferred</label>
        <label class="check-row"><input type="checkbox" name="safetyPreferences" value="no_home_address" ${h(t.safetyPreferences,"no_home_address",!0)} /> No home address sharing</label>
        <button class="primary" type="submit" ${s.api.token?"":"disabled"}>Save owner profile</button>
      </form>
      <form class="panel form" id="api-pet-form">
        <h3>Dog profile</h3>
        <label>Name <input name="name" value="Mochi" required /></label>
        <label>Breed <input name="breed" value="Corgi" /></label>
        <label>Birth date <input name="birthDate" type="date" value="2023-05-12" /></label>
        <label>Sex
          <select name="sex">
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
        <label>Size
          <select name="size">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
        <label>Energy
          <select name="energyLevel">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label>Vaccine status
          <select name="vaccineStatus">
            <option value="verified">Verified</option>
            <option value="self_reported">Self reported</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
        <label>Personality tags <input name="personalityTags" value="friendly,gentle,shy_at_first" /></label>
        <label>Activity preferences <input name="activityPreferences" value="walk,dog_park,training" /></label>
        <label>Neighborhood <input name="neighborhood" value="${e?.user?.neighborhood||"Hyde Park"}" /></label>
        <label>Avatar URL <input name="avatarUrl" value="${f[0]}" /></label>
        <label class="check-row"><input type="checkbox" name="neutered" checked /> Neutered</label>
        <label class="check-row"><input type="checkbox" name="acceptsLargeDogs" /> Accepts large dogs</label>
        <button class="primary" type="submit" ${s.api.token?"":"disabled"}>Create dog profile</button>
      </form>
    </section>
    <section class="panel">
      <h3>Saved dogs</h3>
      ${a.length?a.map(n=>`<div class="place-row"><strong>${n.name}</strong><span>${n.breed||"Breed TBD"} · ${w(n.size)} · ${D(n.vaccineStatus)}</span></div>`).join(""):'<p class="empty-note">No persisted dog profile yet.</p>'}
    </section>
  `}function h(e=[],t,a=!1){return(e.length?e.includes(t):a)?"checked":""}function De(){const e=m();return`
    <section class="section-heading">
      <div>
        <p class="eyebrow">Profile</p>
        <h2>Your matchable dog profile</h2>
      </div>
    </section>
    <section class="two-column">
      <div class="panel profile-card">
        <img src="${e.avatar}" alt="${e.name}" />
        <h3>${e.name}</h3>
        <p>${e.breed} · ${M(e.birthDate)} · ${e.neighborhood}</p>
        <div class="chips">
          <span>${w(e.size)}</span>
          <span>${x(e.energyLevel)}</span>
          <span>${D(e.vaccineStatus)}</span>
          ${e.personalityTags.map(t=>`<span>${t}</span>`).join("")}
        </div>
      </div>
      <div class="panel">
        <h3>Owner preferences</h3>
        <div class="place-row"><strong>Neighborhood</strong><span>${s.user.neighborhood}</span></div>
        <div class="place-row"><strong>Distance</strong><span>${s.user.maxDistanceKm}km max</span></div>
        <div class="place-row"><strong>Availability</strong><span>${s.user.availableWindows.join(" · ")}</span></div>
        <div class="place-row"><strong>Safety</strong><span>${s.user.safetyPreferences.join(" · ")}</span></div>
      </div>
    </section>
  `}function Ae(){if(s.api.token&&s.api.admin){const t=s.api.admin,a=t.reports||[];return`
      <section class="section-heading">
        <div>
          <p class="eyebrow">Admin</p>
          <h2>Live MVP funnel and safety queue</h2>
        </div>
        <button class="secondary" id="load-admin-dashboard">Refresh admin</button>
      </section>
      <section class="stats">
        ${["users","pets","recommendationLogs","likes","matches","messages","playdates","completedPlaydates","feedback","reports","blocks"].map(o=>`<article><span>${t[o]||0}</span><p>${o}</p></article>`).join("")}
      </section>
      <section class="panel">
        <h3>Reports</h3>
        ${a.length?a.map(o=>`<div class="admin-row"><div><strong>${o.reason}</strong><span>${o.targetType}:${o.targetId} · ${o.status}</span></div><button data-api-resolve-report="${o.id}">Resolve</button></div>`).join(""):'<p class="empty-note">No reports in the queue.</p>'}
      </section>
    `}const e={impressions:s.recommendationLogs.length,likes:s.swipes.filter(t=>t.action==="like").length,matches:s.matches.length,chats:s.conversations.filter(t=>t.messages.length>1).length,playdates:s.playdates.length,feedback:s.feedback.length,reports:s.reports.filter(t=>t.status==="open").length};return`
    <section class="section-heading">
      <div>
        <p class="eyebrow">Admin</p>
        <h2>Recommendation and playdate funnel</h2>
      </div>
      <button class="secondary" id="reset-demo">Reset demo</button>
    </section>
    <section class="stats">
      ${Object.entries(e).map(([t,a])=>`<article><span>${a}</span><p>${t}</p></article>`).join("")}
    </section>
    <section class="two-column">
      <div class="panel">
        <h3>Reports</h3>
        ${s.reports.map(t=>`<div class="admin-row"><div><strong>${t.reason}</strong><span>${t.targetType}:${t.targetId} · ${t.status}</span></div><button data-resolve-report="${t.id}">Resolve</button></div>`).join("")}
      </div>
      <div class="panel">
        <h3>Recommendation logs</h3>
        ${s.recommendationLogs.map(t=>`<div class="place-row"><strong>${y(t.candidatePetId)?.name||t.candidatePetId}</strong><span>${t.action} · score ${t.score} · matched ${t.matched}</span></div>`).join("")||'<p class="empty-note">No recommendation events yet.</p>'}
      </div>
    </section>
  `}function Te(){return({onboarding:Le,recommend:_,matches:ge,playdates:we,places:Ie,profile:De,admin:Ae}[s.activeTab]||_)()}function u(){document.querySelector("#app").innerHTML=`
    ${pe()}
    <main>${Te()}</main>
    ${s.toast?`<div class="toast">${s.toast}</div>`:""}
  `,qe()}function qe(){document.querySelectorAll("[data-tab]").forEach(e=>{e.addEventListener("click",()=>C({activeTab:e.dataset.tab}))}),document.querySelector("#login-form")?.addEventListener("submit",V),document.querySelector("#load-account")?.addEventListener("click",I),document.querySelector("#logout-api")?.addEventListener("click",ae),document.querySelector("#owner-form")?.addEventListener("submit",ee),document.querySelector("#api-pet-form")?.addEventListener("submit",te),document.querySelector("#load-recommendations")?.addEventListener("click",k),document.querySelector("#load-api-matches")?.addEventListener("click",$),document.querySelector("#load-api-playdates")?.addEventListener("click",v),document.querySelector("#load-admin-dashboard")?.addEventListener("click",g),document.querySelector("#api-playdate-form")?.addEventListener("submit",J),document.querySelector("#api-feedback-form")?.addEventListener("submit",G),document.querySelectorAll("[data-api-message-form]").forEach(e=>e.addEventListener("submit",Z)),document.querySelectorAll("[data-api-swipe-like]").forEach(e=>{e.addEventListener("click",()=>q(e.dataset.apiSwipeLike,"like"))}),document.querySelectorAll("[data-api-swipe-pass]").forEach(e=>{e.addEventListener("click",()=>q(e.dataset.apiSwipePass,"pass"))}),document.querySelectorAll("[data-api-report-pet]").forEach(e=>{e.addEventListener("click",()=>Y("pet",e.dataset.apiReportPet,"User reported dog profile"))}),document.querySelectorAll("[data-api-block-user]").forEach(e=>{e.addEventListener("click",()=>Q(e.dataset.apiBlockUser))}),document.querySelectorAll("[data-api-playdate-respond]").forEach(e=>{e.addEventListener("click",()=>{const[t,a]=e.dataset.apiPlaydateRespond.split(":");S(t,"respond",a)})}),document.querySelectorAll("[data-api-playdate-cancel]").forEach(e=>{e.addEventListener("click",()=>S(e.dataset.apiPlaydateCancel,"cancel"))}),document.querySelectorAll("[data-api-playdate-checkin]").forEach(e=>{e.addEventListener("click",()=>S(e.dataset.apiPlaydateCheckin,"check-in"))}),document.querySelectorAll("[data-api-resolve-report]").forEach(e=>{e.addEventListener("click",()=>X(e.dataset.apiResolveReport))}),document.querySelectorAll("[data-swipe-like]").forEach(e=>{e.addEventListener("click",()=>N(e.dataset.swipeLike,"like"))}),document.querySelectorAll("[data-swipe-pass]").forEach(e=>{e.addEventListener("click",()=>N(e.dataset.swipePass,"pass"))}),document.querySelectorAll("[data-report-pet]").forEach(e=>{e.addEventListener("click",()=>j("pet",e.dataset.reportPet,"User reported dog profile"))}),document.querySelectorAll("[data-block-user]").forEach(e=>{e.addEventListener("click",()=>F(e.dataset.blockUser))}),document.querySelectorAll("[data-message-form]").forEach(e=>e.addEventListener("submit",ie)),document.querySelector("#playdate-form")?.addEventListener("submit",re),document.querySelector("#feedback-form")?.addEventListener("submit",le),document.querySelectorAll("[data-playdate-status]").forEach(e=>{e.addEventListener("click",()=>{const[t,a]=e.dataset.playdateStatus.split(":");ce(t,a)})}),document.querySelectorAll("[data-resolve-report]").forEach(e=>{e.addEventListener("click",()=>{const t=s.reports.find(a=>a.id===e.dataset.resolveReport);t&&(t.status="resolved"),d(),r("Report resolved")})}),document.querySelector("#reset-demo")?.addEventListener("click",de)}u();
