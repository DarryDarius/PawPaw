(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const p of i.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&n(p)}).observe(document,{childList:!0,subtree:!0});function s(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(o){if(o.ep)return;o.ep=!0;const i=s(o);fetch(o.href,i)}})();const y=["https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1000&q=80","https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1000&q=80"],H="2026-04-29",U=window.localStorage.getItem("pawpaw-api-base-url")||"http://localhost:8080/api/v1",w={api:{token:window.localStorage.getItem("pawpaw-session-token")||"",me:null,recommendations:[],matches:[],messages:{},locations:[],playdates:[],admin:null,status:"",error:""},user:{id:"u1",nickname:"Darius",neighborhood:"Hyde Park",availableWindows:["weekday_evening","weekend_morning"],meetupPreferences:["public_place_only","small_group_ok"],maxDistanceKm:5,safetyPreferences:["vaccine_preferred","no_home_address"]},pets:[{id:"p1",ownerUserId:"u1",name:"Mochi",breed:"Corgi",birthDate:"2023-05-12",sex:"female",avatar:y[0],size:"small",neutered:!0,vaccineStatus:"verified",energyLevel:"medium",personalityTags:["friendly","gentle","shy_at_first"],activityPreferences:["walk","dog_park","training"],acceptsLargeDogs:!1,neighborhood:"Hyde Park"},{id:"p2",ownerUserId:"u2",name:"Biscuit",breed:"Beagle",birthDate:"2022-10-02",sex:"male",avatar:y[1],size:"medium",neutered:!0,vaccineStatus:"verified",energyLevel:"medium",personalityTags:["friendly","curious","food_motivated"],activityPreferences:["walk","dog_park","short_trip"],acceptsLargeDogs:!0,neighborhood:"Hyde Park",distanceKm:1.4,availableWindows:["weekday_evening","weekend_morning"],likedBack:!0},{id:"p3",ownerUserId:"u3",name:"Luna",breed:"Toy Poodle",birthDate:"2021-07-18",sex:"female",avatar:y[2],size:"small",neutered:!0,vaccineStatus:"verified",energyLevel:"low",personalityTags:["calm","gentle","people_friendly"],activityPreferences:["walk","cafe","small_group"],acceptsLargeDogs:!1,neighborhood:"Kenwood",distanceKm:2.1,availableWindows:["weekend_morning","weekend_afternoon"],likedBack:!1},{id:"p4",ownerUserId:"u4",name:"Otis",breed:"Golden Retriever",birthDate:"2020-03-09",sex:"male",avatar:y[3],size:"large",neutered:!0,vaccineStatus:"self_reported",energyLevel:"high",personalityTags:["playful","high_energy","large_dog_friendly"],activityPreferences:["dog_park","fetch","short_trip"],acceptsLargeDogs:!0,neighborhood:"South Loop",distanceKm:5.8,availableWindows:["weekday_evening"],likedBack:!0},{id:"p5",ownerUserId:"u5",name:"Pepper",breed:"Shiba Inu",birthDate:"2022-01-21",sex:"female",avatar:y[4],size:"medium",neutered:!1,vaccineStatus:"verified",energyLevel:"medium",personalityTags:["independent","selective","calm"],activityPreferences:["walk","training"],acceptsLargeDogs:!1,neighborhood:"Hyde Park",distanceKm:.9,availableWindows:["weekend_afternoon"],likedBack:!1}],locations:[{id:"loc1",name:"Jackson Bark",type:"Dog park",neighborhood:"Hyde Park",distanceKm:1.2,isPublicPlace:!0,safetyNotes:"Fenced dog park, best for daytime meetups."},{id:"loc2",name:"Promontory Point",type:"Lakefront walk",neighborhood:"Hyde Park",distanceKm:1.7,isPublicPlace:!0,safetyNotes:"Open public route, keep dogs leashed."},{id:"loc3",name:"Hyde Park Pet Friendly Cafe",type:"Cafe patio",neighborhood:"Hyde Park",distanceKm:.8,isPublicPlace:!0,safetyNotes:"Good for calm dogs and first meetups."}],swipes:[],matches:[],conversations:[],playdates:[],feedback:[],reports:[{id:"r1",targetType:"location",targetId:"loc1",reason:"Review safety note for evening meetups",status:"open"}],blocks:[],recommendationLogs:[],activeTab:"recommend",selectedCandidateId:"",toast:""};let a=J();function J(){const e=window.localStorage.getItem("pawpaw-playdate-state");if(!e)return structuredClone(w);try{const t=JSON.parse(e);return{...structuredClone(w),...t,api:{...structuredClone(w).api,...t.api||{}}}}catch{return structuredClone(w)}}function m(){a.api?.token&&window.localStorage.setItem("pawpaw-session-token",a.api.token),window.localStorage.setItem("pawpaw-playdate-state",JSON.stringify(a))}function x(e){a={...a,...e},m(),g()}function G(e){return e==="onboarding"?"Setup":e==="recommend"?"Discover":e==="profile"?"Me":e.charAt(0).toUpperCase()+e.slice(1)}function r(e){a.toast=e,g(),window.clearTimeout(r.timer),r.timer=window.setTimeout(()=>{a.toast="",g()},2200)}function c(e){a.api={...a.api,...e},m(),g()}async function d(e,t={}){const s={"Content-Type":"application/json",...t.headers||{}};a.api.token&&(s.Authorization=`Bearer ${a.api.token}`);const n=await fetch(`${U}${e}`,{...t,headers:s}),o=await n.json().catch(()=>({}));if(!n.ok)throw new Error(o?.error?.message||"API request failed");return o}async function Y(e){e.preventDefault();const t=new FormData(e.currentTarget);c({status:"Logging in...",error:""});try{const s=await d("/auth/login",{method:"POST",body:JSON.stringify({email:String(t.get("email")||"").trim(),nickname:String(t.get("nickname")||"").trim(),neighborhood:String(t.get("neighborhood")||"").trim()})});window.localStorage.setItem("pawpaw-session-token",s.session.token),c({token:s.session.token,status:"Logged in",error:""}),await T(),r("Logged in")}catch(s){c({status:"",error:s.message})}}async function T(){if(a.api.token){c({status:"Loading profile...",error:""});try{const e=await d("/me");e.profileComplete&&a.activeTab==="onboarding"&&(a.activeTab="recommend"),c({me:e,status:"Profile loaded",error:""}),e.profileComplete&&(await Q(),await P(),await I(),await $(),await h())}catch(e){c({status:"",error:e.message})}}}async function P(){if(a.api.token){c({status:"Loading recommendations...",error:""});try{const e=await d("/recommendations/feed");c({recommendations:e.recommendations||[],status:"Recommendations loaded",error:""})}catch(e){c({status:"",error:e.message})}}}async function E(e,t){const s=a.api.me?.pets?.[0];if(!s)return r("Create a dog profile first");c({status:`${t==="like"?"Liking":"Skipping"} dog...`,error:""});try{const n=await d("/swipes",{method:"POST",body:JSON.stringify({petId:Number(s.id),targetPetId:Number(e),action:t,idempotencyKey:`${a.api.me.user.id}:${e}:${t}:${Date.now()}`})});await P(),n.matched?(await I(),x({activeTab:"matches"}),r("It's a match")):r(t==="like"?"Liked dog":"Skipped dog")}catch(n){c({status:"",error:n.message})}}async function I(){if(a.api.token)try{const t=(await d("/matches")).matches||[],s={...a.api.messages};for(const n of t){const o=await d(`/conversations/${n.conversationId}/messages`);s[n.conversationId]=o.messages||[]}c({matches:t,messages:s,status:"Matches loaded",error:""})}catch(e){c({status:"",error:e.message})}}async function Q(){if(a.api.token)try{const e=await d("/locations");c({locations:e.locations||[],error:""})}catch(e){c({status:"",error:e.message})}}async function $(){if(a.api.token)try{const e=await d("/playdates");c({playdates:e.playdates||[],status:"Playdates loaded",error:""})}catch(e){c({status:"",error:e.message})}}async function X(e){e.preventDefault();const t=new FormData(e.currentTarget);try{await d("/playdates",{method:"POST",body:JSON.stringify({matchId:Number(t.get("matchId")),locationId:Number(t.get("locationId")),startAt:String(t.get("startAt")||""),note:String(t.get("note")||"").trim(),vaccineRequired:t.get("vaccineRequired")==="on"})}),e.currentTarget.reset(),await $(),await h(),r("Playdate invite created")}catch(s){c({status:"",error:s.message})}}async function L(e,t,s=""){try{const n=t==="respond"?`/playdates/${e}/respond`:`/playdates/${e}/${t}`;await d(n,{method:"POST",body:JSON.stringify(t==="respond"?{status:s}:{})}),await $(),await h(),r(`Playdate ${s||t}`)}catch(n){c({status:"",error:n.message})}}async function Z(e){e.preventDefault();const t=new FormData(e.currentTarget),s=t.get("playdateId");try{await d(`/playdates/${s}/feedback`,{method:"POST",body:JSON.stringify({toUserId:Number(t.get("toUserId")||0),rating:Number(t.get("rating")),repeatIntent:String(t.get("repeatIntent")||"maybe"),safetyFlag:t.get("safetyFlag")==="on",note:String(t.get("note")||"").trim()})}),e.currentTarget.reset(),await $(),await h(),r("Feedback saved")}catch(n){c({status:"",error:n.message})}}async function ee(e,t,s){if(!a.api.token)return z(e,t,s);try{await d("/reports",{method:"POST",body:JSON.stringify({targetType:e,targetId:String(t),reason:s})}),await h(),r("Report sent")}catch(n){c({status:"",error:n.message})}}async function te(e){if(!a.api.token)return K(String(e));try{await d("/blocks",{method:"POST",body:JSON.stringify({blockedUserId:Number(e),reason:"Blocked from recommendation surface"})}),await P(),await h(),r("User blocked")}catch(t){c({status:"",error:t.message})}}async function h(){if(a.api.token)try{const[e,t]=await Promise.all([d("/admin/dashboard"),d("/admin/reports")]);c({admin:{...e.dashboard||{},reports:t.reports||[]},error:""})}catch(e){c({status:"",error:e.message})}}async function ae(e){try{await d(`/admin/reports/${e}/resolve`,{method:"POST",body:JSON.stringify({})}),await h(),r("Report resolved")}catch(t){c({status:"",error:t.message})}}async function se(e){e.preventDefault();const t=new FormData(e.currentTarget),s=t.get("conversationId"),n=String(t.get("body")||"").trim();if(!(!s||!n))try{await d(`/conversations/${s}/messages`,{method:"POST",body:JSON.stringify({body:n})}),e.currentTarget.reset(),await I(),r("Message sent")}catch(o){c({status:"",error:o.message})}}async function ne(e){e.preventDefault();const t=new FormData(e.currentTarget);c({status:"Saving owner profile...",error:""});try{const s=await d("/me",{method:"PATCH",body:JSON.stringify({nickname:String(t.get("nickname")||"").trim(),neighborhood:String(t.get("neighborhood")||"").trim(),maxDistanceKm:Number(t.get("maxDistanceKm")||5),availableWindows:t.getAll("availableWindows"),meetupPreferences:t.getAll("meetupPreferences"),safetyPreferences:t.getAll("safetyPreferences")})});c({me:s,status:"Owner profile saved",error:""}),r("Owner profile saved")}catch(s){c({status:"",error:s.message})}}async function oe(e){e.preventDefault();const t=new FormData(e.currentTarget);c({status:"Creating dog profile...",error:""});try{await d("/pets",{method:"POST",body:JSON.stringify({name:String(t.get("name")||"").trim(),breed:String(t.get("breed")||"").trim(),birthDate:String(t.get("birthDate")||"").trim(),sex:String(t.get("sex")||"unknown"),avatarUrl:String(t.get("avatarUrl")||"").trim(),size:String(t.get("size")||"medium"),neutered:t.get("neutered")==="on",vaccineStatus:String(t.get("vaccineStatus")||"unknown"),personalityTags:R(t.get("personalityTags")),activityPreferences:R(t.get("activityPreferences")),acceptsLargeDogs:t.get("acceptsLargeDogs")==="on",energyLevel:String(t.get("energyLevel")||"medium"),neighborhood:String(t.get("neighborhood")||"").trim()})}),e.currentTarget.reset(),await T(),r("Dog profile created")}catch(s){c({status:"",error:s.message})}}function ie(){a.api={token:"",me:null,status:"",error:""},window.localStorage.removeItem("pawpaw-session-token"),m(),g(),r("Logged out")}function R(e){return String(e||"").split(",").map(t=>t.trim()).filter(Boolean)}function u(){return a.pets.find(e=>e.ownerUserId===a.user.id)||a.pets[0]}function b(e){return a.pets.find(t=>t.id===e)}function re(){const e=new Set(a.blocks.map(s=>s.blockedUserId)),t=new Set(a.swipes.map(s=>s.targetPetId));return a.pets.filter(s=>s.ownerUserId!==a.user.id).filter(s=>!e.has(s.ownerUserId)).filter(s=>!t.has(s.id)).map(s=>({...s,compatibility:C(u(),s)})).sort((s,n)=>n.compatibility.score-s.compatibility.score)}function j(){return a.pets.filter(e=>e.ownerUserId!==a.user.id).map(e=>({...e,compatibility:C(u(),e)})).sort((e,t)=>t.compatibility.score-e.compatibility.score)}function C(e,t){const s=Math.max(0,100-Math.round((t.distanceKm||3)*12)),n=ce(e,t),o=D(e.personalityTags,t.personalityTags,["friendly","gentle","calm"]),i=D(a.user.availableWindows,t.availableWindows||[],[]),p=D(e.activityPreferences,t.activityPreferences,[]),l=t.vaccineStatus==="verified"?100:60,V=t.likedBack?92:78;return{score:Math.round(.25*s+.2*o+.15*n+.15*i+.1*p+.1*l+.05*V),reasons:[`${t.distanceKm||2}km away`,`${k(t.size)} compatibility ${n}%`,`${i}% schedule overlap`,l===100?"Verified vaccine status":"Self-reported vaccine status"]}}function ce(e,t){return e.size===t.size?100:e.size==="small"&&t.size==="large"&&!e.acceptsLargeDogs?35:e.size==="large"&&t.size==="small"&&!t.acceptsLargeDogs?45:76}function D(e=[],t=[],s=[]){if(!e.length||!t.length)return 50;const n=new Set(e),o=t.filter(p=>n.has(p)).length,i=t.filter(p=>s.includes(p)).length;return Math.min(100,Math.round(o/Math.max(e.length,t.length)*100+i*14+36))}function k(e){return{small:"Small dog",medium:"Medium dog",large:"Large dog"}[e]||"Dog"}function F(e){return{low:"Low energy",medium:"Medium energy",high:"High energy"}[e]||"Energy TBD"}function N(e){return{verified:"Vaccine verified",self_reported:"Vaccine self-reported",unknown:"Vaccine unknown"}[e]||e}function q(e={}){return{...e,id:String(e.id||""),ownerUserId:String(e.ownerUserId||""),avatar:e.avatar||e.avatarUrl||y[0],birthDate:e.birthDate||"2023-01-01",distanceKm:e.distanceKm||2}}function B(e){const t=new Date(`${e}T00:00:00`),s=new Date(`${H}T00:00:00`),n=Math.max(1,(s.getFullYear()-t.getFullYear())*12+s.getMonth()-t.getMonth()),o=Math.floor(n/12);return o?`${o} yr ${n%12?`${n%12} mo`:""}`.trim():`${n} mo`}function _(e,t){const s=b(e);if(!s)return r("Candidate not found");if(a.swipes.some(o=>o.targetPetId===e))return r("Already swiped this dog");const n={id:`swipe-${Date.now()}`,userId:a.user.id,petId:u().id,targetUserId:s.ownerUserId,targetPetId:e,action:t,idempotencyKey:`${a.user.id}:${e}:${t}`,createdAt:new Date().toISOString()};if(a.swipes.push(n),a.recommendationLogs.push({id:`log-${Date.now()}`,userId:a.user.id,candidatePetId:e,action:t,matched:!1,playdateCreated:!1,shownAt:new Date().toISOString(),score:C(u(),s).score}),t==="like"&&s.likedBack)return le(s),a.activeTab="matches",m(),r(`It's a match with ${s.name}`);m(),g(),r(t==="like"?`Liked ${s.name}`:`Skipped ${s.name}`)}function le(e){const t=a.matches.find(o=>o.targetPetId===e.id);if(t)return t;const s={id:`match-${Date.now()}`,userLowId:a.user.id<e.ownerUserId?a.user.id:e.ownerUserId,userHighId:a.user.id<e.ownerUserId?e.ownerUserId:a.user.id,petId:u().id,targetPetId:e.id,status:"active",createdAt:new Date().toISOString()},n={id:`conv-${Date.now()}`,matchId:s.id,messages:[{id:`msg-${Date.now()}`,sender:"system",body:`You matched with ${e.name}. Pick a public place to plan the first playdate.`,createdAt:"now"}],unread:1};return a.matches.unshift(s),a.conversations.unshift(n),a.recommendationLogs.forEach(o=>{o.candidatePetId===e.id&&(o.matched=!0)}),s}function de(e){e.preventDefault();const t=new FormData(e.currentTarget),s=String(t.get("body")||"").trim(),n=a.conversations.find(o=>o.id===t.get("conversationId"));!s||!n||(n.messages.push({id:`msg-${Date.now()}`,sender:a.user.nickname,body:s,createdAt:"now"}),n.unread=0,m(),e.currentTarget.reset(),r("Message sent"))}function pe(e){e.preventDefault();const t=new FormData(e.currentTarget),s=a.matches.find(i=>i.id===t.get("matchId")),n=a.locations.find(i=>i.id===t.get("locationId"));if(!s||!n)return r("Choose a match and public place");const o={id:`playdate-${Date.now()}`,matchId:s.id,creatorUserId:a.user.id,petId:s.petId,targetPetId:s.targetPetId,locationId:n.id,startAt:t.get("startAt"),note:String(t.get("note")||"").trim(),vaccineRequired:t.get("vaccineRequired")==="on",status:"pending",createdAt:new Date().toISOString()};a.playdates.unshift(o),a.recommendationLogs.forEach(i=>{i.candidatePetId===s.targetPetId&&(i.playdateCreated=!0)}),m(),e.currentTarget.reset(),r(`Playdate invite created at ${n.name}`)}function me(e,t){const s=a.playdates.find(n=>n.id===e);s&&(s.status=t,m(),r(`Playdate marked ${t}`))}function ue(e){e.preventDefault();const t=new FormData(e.currentTarget),s=a.playdates.find(n=>n.id===t.get("playdateId"));if(!s)return r("Choose a playdate first");a.feedback.unshift({id:`feedback-${Date.now()}`,playdateId:s.id,rating:Number(t.get("rating")),repeatIntent:t.get("repeatIntent"),safetyFlag:t.get("safetyFlag")==="on",note:String(t.get("note")||"").trim(),createdAt:new Date().toISOString()}),s.status="completed",m(),e.currentTarget.reset(),r("Feedback saved")}function z(e,t,s){a.reports.unshift({id:`report-${Date.now()}`,targetType:e,targetId:t,reason:s,status:"open"}),m(),r("Report sent to admin queue")}function K(e){if(a.blocks.some(t=>t.blockedUserId===e))return r("Already blocked");a.blocks.push({blockerUserId:a.user.id,blockedUserId:e,reason:"User blocked from match surface",createdAt:new Date().toISOString()}),m(),r("User blocked and removed from recommendations")}function ge(){a=structuredClone(w),m(),g(),r("Demo reset")}function he(){const e=[["recommend","Recommend"],["matches","Matches"],["playdates","Playdates"],["places","Places"],["profile","Profile"],["admin","Admin"]];return`
    <nav class="top-nav">
      <div class="brand">
        <span>PawPaw</span>
        <small>Dog playdate matching</small>
      </div>
      <div class="tabs">
        <button class="${a.activeTab==="onboarding"?"active":""}" data-tab="onboarding">Setup</button>
        ${e.map(([t])=>`<button class="${a.activeTab===t?"active":""}" data-tab="${t}">${G(t)}</button>`).join("")}
      </div>
    </nav>
  `}function v(){const e=a.api.me,t=!!(a.api.token&&e?.profileComplete),s=fe();return`
    <section class="mode-banner ${t?"ready":""}">
      <div>
        <span class="mode-pill">${t?"Live API mode":"Demo mode"}</span>
        <strong>${t?`Ready to match in ${e.user.neighborhood||"your neighborhood"}`:"Create a profile to unlock live recommendations"}</strong>
        <p>${t?"Your saved dog profile can use live recommendation, match, chat, playdate, safety, and admin APIs.":"The static demo still works, but live data needs login, owner preferences, and one dog profile."}</p>
      </div>
      <div class="progress-rail">
        ${s.map(n=>`<span class="${n.active?"active":""}">${n.label}</span>`).join("")}
      </div>
      <button class="${t?"secondary":"primary"}" data-tab="${t?"recommend":"onboarding"}">${t?"View recommendations":"Complete setup"}</button>
    </section>
  `}function fe(){const e=!!(a.api.token&&a.api.me?.profileComplete),t=e?a.api.matches.length>0:a.matches.length>0,s=e?Object.values(a.api.messages||{}).some(i=>i.length>0):a.conversations.some(i=>i.messages.length>1),n=e?a.api.playdates.length>0:a.playdates.length>0,o=e?(a.api.admin?.feedback||0)>0:a.feedback.length>0;return[{label:"Setup",active:e},{label:"Discover",active:e},{label:"Match",active:t},{label:"Chat",active:s},{label:"Playdate",active:n},{label:"Feedback",active:o}]}function ye(){const e=u();return`
    <header class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Local Dog Playdates</p>
        <h1>Find nearby dogs your dog may actually enjoy meeting.</h1>
        <p>
          PawPaw uses neighborhood, dog size, temperament, vaccine status,
          activity style, and schedule to help owners plan safer first meetups.
        </p>
        <div class="hero-actions">
          <button class="primary" ${!!(a.api.token&&a.api.me?.profileComplete)?'data-scroll-target="recommend-feed"':'data-tab="onboarding"'}>Start swiping</button>
          <button class="secondary" data-tab="playdates">Plan playdate</button>
        </div>
      </div>
      <div class="pet-spotlight">
        <img src="${e.avatar}" alt="${e.name}" />
        <div>
          <strong>${e.name}</strong>
          <span>${e.breed} · ${k(e.size)} · ${e.neighborhood}</span>
        </div>
      </div>
    </header>
  `}function be(){if(a.api.token&&a.api.me?.profileComplete){const s=a.api.admin||{};return`
      <section class="stats">
        <article><span>${a.api.recommendations.length}</span><p>Candidate dogs</p></article>
        <article><span>${s.likes||0}</span><p>Right swipes</p></article>
        <article><span>${a.api.matches.length}</span><p>Matches</p></article>
        <article><span>${a.api.playdates.length}</span><p>Playdates</p></article>
        <article><span>${s.completedPlaydates||0}</span><p>Completed</p></article>
      </section>
    `}const e=a.swipes.filter(s=>s.action==="like").length,t=a.playdates.filter(s=>s.status==="completed").length;return`
    <section class="stats">
      <article><span>${j().length}</span><p>Candidate dogs</p></article>
      <article><span>${e}</span><p>Right swipes</p></article>
      <article><span>${a.matches.length}</span><p>Matches</p></article>
      <article><span>${a.playdates.length}</span><p>Playdates</p></article>
      <article><span>${t}</span><p>Completed</p></article>
    </section>
  `}function O(){const e=!!(a.api.token&&a.api.me?.profileComplete),t=(a.api.recommendations||[]).map(i=>({...q(i.pet),owner:i.owner,compatibility:{score:i.score,reasons:i.reasons||[]}})),s=re(),o=(e?t:s)[0];return`
    ${v()}
    <section class="discover-shell">
      ${ye()}
    </section>
    ${be()}
    <section class="section-heading" id="recommend-feed">
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
            ${M(o,!0,e?"api":"local")}
            <div class="panel">
              <h3>Why PawPaw thinks this is a good first meetup</h3>
              ${o.compatibility.reasons.map(i=>`<div class="place-row"><strong>${i}</strong><span>Recommendation signal</span></div>`).join("")}
              <div class="score-box">
                <span>${o.compatibility.score}</span>
                <p>Compatibility score</p>
              </div>
            </div>
          </section>`:`<section class="panel empty-state"><h3>No more candidates</h3><p>${e?"Refresh the live feed, widen distance, or add more seed profiles.":"Reset the demo or widen the area to get more nearby dogs."}</p><button class="primary" ${e?'id="load-recommendations"':'id="reset-demo"'}>${e?"Refresh feed":"Reset demo"}</button></section>`}
    <section class="section-heading">
      <div>
        <p class="eyebrow">Candidate Pool</p>
        <h2>All nearby dogs</h2>
      </div>
    </section>
    <section class="card-grid">
      ${(e?t:j()).map(i=>M(i,!1,e?"api":"local")).join("")}
    </section>
  `}function M(e,t,s="local"){const n=s==="api"?`data-api-swipe-like="${e.id}"`:`data-swipe-like="${e.id}"`,o=s==="api"?`data-api-swipe-pass="${e.id}"`:`data-swipe-pass="${e.id}"`,i=s==="api"?`data-api-report-pet="${e.id}"`:`data-report-pet="${e.id}"`,p=s==="api"?`data-api-block-user="${e.ownerUserId}"`:`data-block-user="${e.ownerUserId}"`;return`
    <article class="dog-card ${t?"primary-card":""}">
      <img src="${e.avatar}" alt="${e.name}" />
      <div class="dog-card-body">
        <div class="post-meta">
          <span>${e.name}</span>
          <small>${e.distanceKm||2}km · ${e.neighborhood}</small>
        </div>
        <h3>${e.breed} · ${B(e.birthDate)}</h3>
        <div class="chips">
          <span>${k(e.size)}</span>
          <span>${F(e.energyLevel)}</span>
          <span>${N(e.vaccineStatus)}</span>
        </div>
        <p>${e.personalityTags.join(" · ")}</p>
        <div class="score-line"><strong>${e.compatibility.score}</strong><div class="compatibility-bar"><span style="width:${e.compatibility.score}%"></span></div></div>
        <div class="post-actions primary-actions">
          <button ${o}>Pass</button>
          <button class="primary" ${n}>Like</button>
        </div>
        <div class="post-actions safety-actions">
          <button ${i}>Report</button>
          <button ${p}>Block</button>
        </div>
      </div>
    </article>
  `}function ve(){return a.api.token&&a.api.me?.profileComplete?we():`
    <section class="section-heading">
      <div>
        <p class="eyebrow">Matches</p>
        <h2>Mutual likes unlock chat and playdates</h2>
      </div>
    </section>
    <section class="two-column">
      <div class="panel">
        <h3>Active matches</h3>
        ${a.matches.map(Se).join("")||'<p class="empty-note">No matches yet. Like Biscuit to trigger a match.</p>'}
      </div>
      <div class="panel">
        <h3>Chat</h3>
        ${a.conversations.map(Pe).join("")||'<p class="empty-note">Match first to open a conversation.</p>'}
      </div>
    </section>
  `}function we(){return`
    ${v()}
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
        ${a.api.matches.map($e).join("")||'<div class="empty-state compact"><h3>No matches yet</h3><p>Like compatible dogs in Discover to unlock chat.</p><button class="primary" data-tab="recommend">Go discover</button></div>'}
      </div>
      <div class="panel">
        <h3>Chat</h3>
        ${a.api.matches.map(ke).join("")||'<p class="empty-note">A live match will open a conversation here.</p>'}
      </div>
    </section>
  `}function $e(e){const t=q(e.targetPet);return`
    <div class="list-row">
      <img src="${t.avatar}" alt="${t.name}" />
      <div>
        <strong>${t.name}</strong>
        <span>${t.breed} · conversation ${e.conversationId}</span>
      </div>
    </div>
  `}function ke(e){const t=q(e.targetPet),s=a.api.messages[e.conversationId]||[];return`
    <div class="chat-box">
      <div class="chat-head">
        <strong>${t.name}</strong>
        <button class="secondary" data-tab="playdates">Plan playdate</button>
      </div>
      <div class="messages">
        ${s.map(n=>`<p><b>${n.senderUserId===a.api.me?.user?.id?"You":t.name}:</b> ${n.body}</p>`).join("")||"<p>No messages yet.</p>"}
      </div>
      <form class="inline-form" data-api-message-form>
        <input type="hidden" name="conversationId" value="${e.conversationId}" />
        <input name="body" placeholder="Suggest a public place..." />
        <button class="primary" type="submit">Send</button>
      </form>
    </div>
  `}function Se(e){const t=b(e.targetPetId);return`
    <div class="list-row">
      <img src="${t.avatar}" alt="${t.name}" />
      <div>
        <strong>${t.name}</strong>
        <span>${t.breed} · match created ${new Date(e.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  `}function Pe(e){const t=a.matches.find(n=>n.id===e.matchId);return`
    <div class="chat-box">
      <strong>${b(t?.targetPetId)?.name||"Matched dog"}</strong>
      <div class="messages">
        ${e.messages.map(n=>`<p><b>${n.sender}:</b> ${n.body}</p>`).join("")}
      </div>
      <form class="inline-form" data-message-form>
        <input type="hidden" name="conversationId" value="${e.id}" />
        <input name="body" placeholder="Suggest a public place..." />
        <button class="primary" type="submit">Send</button>
      </form>
    </div>
  `}function Ie(){return a.api.token&&a.api.me?.profileComplete?Le():`
    ${v()}
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
            ${a.matches.map(e=>`<option value="${e.id}">${u().name} + ${b(e.targetPetId)?.name}</option>`).join("")}
          </select>
        </label>
        <label>
          Public place
          <select name="locationId">
            ${a.locations.map(e=>`<option value="${e.id}">${e.name}</option>`).join("")}
          </select>
        </label>
        <label>Time <input type="datetime-local" name="startAt" value="2026-05-03T10:00" /></label>
        <label>Note <textarea name="note" rows="4" placeholder="First meetup, keep leashes on."></textarea></label>
        <label class="check-row"><input type="checkbox" name="vaccineRequired" checked /> Require vaccine status</label>
        <button class="primary" type="submit" ${a.matches.length?"":"disabled"}>Send invite</button>
      </form>
      <div class="panel">
        <h3>Playdate list</h3>
        ${a.playdates.map(Ae).join("")||'<p class="empty-note">No playdates yet.</p>'}
      </div>
    </section>
    <section class="panel feedback-panel">
      <h3>Submit feedback</h3>
      <form class="inline-form feedback-form" id="feedback-form">
        <select name="playdateId">
          ${a.playdates.map(e=>`<option value="${e.id}">${b(e.targetPetId)?.name} at ${W(e.locationId)?.name}</option>`).join("")}
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
        <button class="primary" type="submit" ${a.playdates.length?"":"disabled"}>Save feedback</button>
      </form>
    </section>
  `}function Le(){const e=a.api.matches||[],t=a.api.locations||[],s=a.api.playdates||[],n=s.filter(l=>l.status==="pending"),o=s.filter(l=>l.status==="confirmed"),i=s.filter(l=>["completed","cancelled"].includes(l.status)),p=s.filter(l=>l.status==="completed");return`
    ${v()}
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
            ${e.map(l=>`<option value="${l.id}">${l.pet.name} + ${l.targetPet.name}</option>`).join("")}
          </select>
        </label>
        <label>
          Public place
          <select name="locationId">
            ${t.map(l=>`<option value="${l.id}">${l.name} · ${l.neighborhood||"Chicago"}</option>`).join("")}
          </select>
        </label>
        <label>Time <input type="datetime-local" name="startAt" value="2026-05-03T10:00" /></label>
        <label>Note <textarea name="note" rows="4" placeholder="First meetup, keep leashes on."></textarea></label>
        <label class="check-row"><input type="checkbox" name="vaccineRequired" checked /> Require vaccine status</label>
        <button class="primary" type="submit" ${e.length&&t.length?"":"disabled"}>Send invite</button>
      </form>
      <div class="panel">
        <h3>Pending</h3>
        ${n.map(A).join("")||'<p class="empty-note">No pending invites.</p>'}
        <h3>Confirmed</h3>
        ${o.map(A).join("")||'<p class="empty-note">No confirmed playdates.</p>'}
        <h3>History</h3>
        ${i.map(A).join("")||'<p class="empty-note">No completed or cancelled playdates.</p>'}
      </div>
    </section>
    <section class="panel feedback-panel ${p.length?"":"hidden"}">
      <h3>Submit feedback</h3>
      <form class="inline-form feedback-form" id="api-feedback-form">
        <select name="playdateId">
          ${p.map(l=>`<option value="${l.id}">${l.location.name} · ${l.status}</option>`).join("")}
        </select>
        <select name="toUserId">
          ${De(p).map(l=>`<option value="${l.id}">${l.label}</option>`).join("")}
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
        <button class="primary" type="submit" ${p.length?"":"disabled"}>Save feedback</button>
      </form>
    </section>
    ${p.length?"":'<section class="panel empty-state compact"><h3>No completed playdates yet</h3><p>Feedback appears after both owners check in.</p></section>'}
  `}function A(e){return`
    <div class="playdate-row">
      <div>
        <strong>${(e.participants||[]).find(s=>s.userId!==a.api.me?.user?.id)?.pet?.name||"Matched dog"} at ${e.location.name}</strong>
        <span>${e.startAt} · <b class="status-badge ${e.status}">${e.status}</b> · ${e.vaccineRequired?"vaccine required":"vaccine optional"}</span>
      </div>
      <div class="post-actions">
        <button data-api-playdate-respond="${e.id}:confirmed">Confirm</button>
        <button data-api-playdate-cancel="${e.id}">Cancel</button>
        <button data-api-playdate-checkin="${e.id}">Check in</button>
      </div>
    </div>
  `}function De(e){const t=[];for(const s of e)for(const n of s.participants||[])n.userId!==a.api.me?.user?.id&&t.push({id:n.userId,label:n.pet?.name||`User ${n.userId}`});return t}function W(e){return a.locations.find(t=>t.id===e)}function Ae(e){const t=b(e.targetPetId),s=W(e.locationId);return`
    <div class="playdate-row">
      <div>
        <strong>${t?.name||"Matched dog"} at ${s?.name||"Public place"}</strong>
        <span>${e.startAt} · ${e.status} · ${e.vaccineRequired?"vaccine required":"vaccine optional"}</span>
      </div>
      <div class="post-actions">
        <button data-playdate-status="${e.id}:confirmed">Confirm</button>
        <button data-playdate-status="${e.id}:cancelled">Cancel</button>
        <button data-playdate-status="${e.id}:completed">Complete</button>
      </div>
    </div>
  `}function Te(){return a.api.token&&a.api.locations?.length?`
      <section class="section-heading">
        <div>
          <p class="eyebrow">Places</p>
          <h2>Live public meetup locations</h2>
        </div>
      </section>
      <section class="card-grid">
        ${a.api.locations.map(e=>`
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
      ${a.locations.map(e=>`
            <article class="service-card">
              <span class="tag">${e.type}</span>
              <h3>${e.name}</h3>
              <p>${e.neighborhood} · ${e.distanceKm}km away</p>
              <p>${e.safetyNotes}</p>
            </article>
          `).join("")}
    </section>
  `}function Ce(){const e=a.api.me,t=e?.ownerProfile||{},s=e?.pets||[];return`
    ${v()}
    <section class="section-heading">
      <div>
        <p class="eyebrow">Setup</p>
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
          <button class="secondary" type="button" id="load-account" ${a.api.token?"":"disabled"}>Refresh</button>
          <button type="button" id="logout-api" ${a.api.token?"":"disabled"}>Logout</button>
        </div>
        ${a.api.status?`<p class="empty-note">${a.api.status}</p>`:""}
        ${a.api.error?`<p class="error-note">${a.api.error}</p>`:""}
        <p class="empty-note">API: ${U}</p>
      </form>
      <div class="panel">
        <h3>Account status</h3>
        ${e?`
              <div class="place-row"><strong>User</strong><span>${e.user.nickname} · ${e.user.neighborhood||"Neighborhood TBD"}</span></div>
              <div class="place-row"><strong>Availability</strong><span>${t.availableWindows?.join(" · ")||"Not set"}</span></div>
              <div class="place-row"><strong>Distance</strong><span>${t.maxDistanceKm||5}km max</span></div>
              <div class="place-row"><strong>Dogs</strong><span>${s.length}</span></div>
            `:'<p class="empty-note">Login to load your persisted PawPaw profile.</p>'}
      </div>
    </section>
    <section class="two-column">
      <form class="panel form" id="owner-form">
        <h3>Owner profile</h3>
        <label>Nickname <input name="nickname" value="${e?.user?.nickname||"Darius"}" /></label>
        <label>Neighborhood <input name="neighborhood" value="${e?.user?.neighborhood||"Hyde Park"}" /></label>
        <label>Max distance <input name="maxDistanceKm" type="number" min="1" max="25" step="1" value="${t.maxDistanceKm||5}" /></label>
        <label class="check-row"><input type="checkbox" name="availableWindows" value="weekday_evening" ${f(t.availableWindows,"weekday_evening")} /> Weekday evening</label>
        <label class="check-row"><input type="checkbox" name="availableWindows" value="weekend_morning" ${f(t.availableWindows,"weekend_morning")} /> Weekend morning</label>
        <label class="check-row"><input type="checkbox" name="availableWindows" value="weekend_afternoon" ${f(t.availableWindows,"weekend_afternoon")} /> Weekend afternoon</label>
        <label class="check-row"><input type="checkbox" name="meetupPreferences" value="public_place_only" ${f(t.meetupPreferences,"public_place_only",!0)} /> Public places only</label>
        <label class="check-row"><input type="checkbox" name="meetupPreferences" value="small_group_ok" ${f(t.meetupPreferences,"small_group_ok",!0)} /> Small groups ok</label>
        <label class="check-row"><input type="checkbox" name="safetyPreferences" value="vaccine_preferred" ${f(t.safetyPreferences,"vaccine_preferred",!0)} /> Vaccine preferred</label>
        <label class="check-row"><input type="checkbox" name="safetyPreferences" value="no_home_address" ${f(t.safetyPreferences,"no_home_address",!0)} /> No home address sharing</label>
        <button class="primary" type="submit" ${a.api.token?"":"disabled"}>Save owner profile</button>
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
        <label>Avatar URL <input name="avatarUrl" value="${y[0]}" /></label>
        <label class="check-row"><input type="checkbox" name="neutered" checked /> Neutered</label>
        <label class="check-row"><input type="checkbox" name="acceptsLargeDogs" /> Accepts large dogs</label>
        <button class="primary" type="submit" ${a.api.token?"":"disabled"}>Create dog profile</button>
      </form>
    </section>
    <section class="panel">
      <h3>Saved dogs</h3>
      ${s.length?s.map(n=>`<div class="place-row"><strong>${n.name}</strong><span>${n.breed||"Breed TBD"} · ${k(n.size)} · ${N(n.vaccineStatus)}</span></div>`).join(""):'<p class="empty-note">No persisted dog profile yet.</p>'}
    </section>
  `}function f(e=[],t,s=!1){return(e.length?e.includes(t):s)?"checked":""}function Ne(){const e=u();return`
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
        <p>${e.breed} · ${B(e.birthDate)} · ${e.neighborhood}</p>
        <div class="chips">
          <span>${k(e.size)}</span>
          <span>${F(e.energyLevel)}</span>
          <span>${N(e.vaccineStatus)}</span>
          ${e.personalityTags.map(t=>`<span>${t}</span>`).join("")}
        </div>
      </div>
      <div class="panel">
        <h3>Owner preferences</h3>
        <div class="place-row"><strong>Neighborhood</strong><span>${a.user.neighborhood}</span></div>
        <div class="place-row"><strong>Distance</strong><span>${a.user.maxDistanceKm}km max</span></div>
        <div class="place-row"><strong>Availability</strong><span>${a.user.availableWindows.join(" · ")}</span></div>
        <div class="place-row"><strong>Safety</strong><span>${a.user.safetyPreferences.join(" · ")}</span></div>
      </div>
    </section>
  `}function qe(){if(a.api.token&&a.api.admin){const t=a.api.admin,s=t.reports||[];return`
      ${v()}
      <section class="section-heading">
        <div>
          <p class="eyebrow">Admin</p>
          <h2>Live MVP funnel and safety queue</h2>
        </div>
        <button class="secondary" id="load-admin-dashboard">Refresh admin</button>
      </section>
      <section class="admin-grid">
        ${S("Recommendation funnel",[["Impressions",t.recommendationLogs],["Likes",t.likes],["Passes",t.passes],["Matches",t.matches]])}
        ${S("Playdate funnel",[["Created",t.playdates],["Completed",t.completedPlaydates],["Feedback",t.feedback]])}
        ${S("Safety",[["Open reports",t.reports],["Blocks",t.blocks]])}
        ${S("Inventory",[["Users",t.users],["Pets",t.pets],["Messages",t.messages]])}
      </section>
      <section class="panel">
        <h3>Reports</h3>
        ${s.length?s.map(n=>`<div class="admin-row"><div><strong>${n.reason}</strong><span>${n.targetType}:${n.targetId} · ${n.status}</span></div><button data-api-resolve-report="${n.id}">Resolve</button></div>`).join(""):'<p class="empty-note">No reports in the queue.</p>'}
      </section>
    `}const e={impressions:a.recommendationLogs.length,likes:a.swipes.filter(t=>t.action==="like").length,matches:a.matches.length,chats:a.conversations.filter(t=>t.messages.length>1).length,playdates:a.playdates.length,feedback:a.feedback.length,reports:a.reports.filter(t=>t.status==="open").length};return`
    ${v()}
    <section class="section-heading">
      <div>
        <p class="eyebrow">Admin</p>
        <h2>Recommendation and playdate funnel</h2>
      </div>
      <button class="secondary" id="reset-demo">Reset demo</button>
    </section>
    <section class="stats">
      ${Object.entries(e).map(([t,s])=>`<article><span>${s}</span><p>${t}</p></article>`).join("")}
    </section>
    <section class="two-column">
      <div class="panel">
        <h3>Reports</h3>
        ${a.reports.map(t=>`<div class="admin-row"><div><strong>${t.reason}</strong><span>${t.targetType}:${t.targetId} · ${t.status}</span></div><button data-resolve-report="${t.id}">Resolve</button></div>`).join("")}
      </div>
      <div class="panel">
        <h3>Recommendation logs</h3>
        ${a.recommendationLogs.map(t=>`<div class="place-row"><strong>${b(t.candidatePetId)?.name||t.candidatePetId}</strong><span>${t.action} · score ${t.score} · matched ${t.matched}</span></div>`).join("")||'<p class="empty-note">No recommendation events yet.</p>'}
      </div>
    </section>
  `}function S(e,t){return`
    <article class="panel metric-group">
      <h3>${e}</h3>
      ${t.map(([s,n])=>`<div class="metric-row"><span>${s}</span><strong>${n||0}</strong></div>`).join("")}
    </article>
  `}function Ee(){return({onboarding:Ce,recommend:O,matches:ve,playdates:Ie,places:Te,profile:Ne,admin:qe}[a.activeTab]||O)()}function g(){!a.api.token&&a.activeTab!=="onboarding"&&!window.localStorage.getItem("pawpaw-ui-seen-demo")&&(a.activeTab="onboarding",window.localStorage.setItem("pawpaw-ui-seen-demo","1")),document.querySelector("#app").innerHTML=`
    ${he()}
    <main>${Ee()}</main>
    ${a.toast?`<div class="toast">${a.toast}</div>`:""}
  `,Re()}function Re(){document.querySelectorAll("[data-tab]").forEach(e=>{e.addEventListener("click",()=>x({activeTab:e.dataset.tab}))}),document.querySelectorAll("[data-scroll-target]").forEach(e=>{e.addEventListener("click",()=>{document.querySelector(`#${e.dataset.scrollTarget}`)?.scrollIntoView({behavior:"smooth",block:"start"})})}),document.querySelector("#login-form")?.addEventListener("submit",Y),document.querySelector("#load-account")?.addEventListener("click",T),document.querySelector("#logout-api")?.addEventListener("click",ie),document.querySelector("#owner-form")?.addEventListener("submit",ne),document.querySelector("#api-pet-form")?.addEventListener("submit",oe),document.querySelector("#load-recommendations")?.addEventListener("click",P),document.querySelector("#load-api-matches")?.addEventListener("click",I),document.querySelector("#load-api-playdates")?.addEventListener("click",$),document.querySelector("#load-admin-dashboard")?.addEventListener("click",h),document.querySelector("#api-playdate-form")?.addEventListener("submit",X),document.querySelector("#api-feedback-form")?.addEventListener("submit",Z),document.querySelectorAll("[data-api-message-form]").forEach(e=>e.addEventListener("submit",se)),document.querySelectorAll("[data-api-swipe-like]").forEach(e=>{e.addEventListener("click",()=>E(e.dataset.apiSwipeLike,"like"))}),document.querySelectorAll("[data-api-swipe-pass]").forEach(e=>{e.addEventListener("click",()=>E(e.dataset.apiSwipePass,"pass"))}),document.querySelectorAll("[data-api-report-pet]").forEach(e=>{e.addEventListener("click",()=>ee("pet",e.dataset.apiReportPet,"User reported dog profile"))}),document.querySelectorAll("[data-api-block-user]").forEach(e=>{e.addEventListener("click",()=>te(e.dataset.apiBlockUser))}),document.querySelectorAll("[data-api-playdate-respond]").forEach(e=>{e.addEventListener("click",()=>{const[t,s]=e.dataset.apiPlaydateRespond.split(":");L(t,"respond",s)})}),document.querySelectorAll("[data-api-playdate-cancel]").forEach(e=>{e.addEventListener("click",()=>L(e.dataset.apiPlaydateCancel,"cancel"))}),document.querySelectorAll("[data-api-playdate-checkin]").forEach(e=>{e.addEventListener("click",()=>L(e.dataset.apiPlaydateCheckin,"check-in"))}),document.querySelectorAll("[data-api-resolve-report]").forEach(e=>{e.addEventListener("click",()=>ae(e.dataset.apiResolveReport))}),document.querySelectorAll("[data-swipe-like]").forEach(e=>{e.addEventListener("click",()=>_(e.dataset.swipeLike,"like"))}),document.querySelectorAll("[data-swipe-pass]").forEach(e=>{e.addEventListener("click",()=>_(e.dataset.swipePass,"pass"))}),document.querySelectorAll("[data-report-pet]").forEach(e=>{e.addEventListener("click",()=>z("pet",e.dataset.reportPet,"User reported dog profile"))}),document.querySelectorAll("[data-block-user]").forEach(e=>{e.addEventListener("click",()=>K(e.dataset.blockUser))}),document.querySelectorAll("[data-message-form]").forEach(e=>e.addEventListener("submit",de)),document.querySelector("#playdate-form")?.addEventListener("submit",pe),document.querySelector("#feedback-form")?.addEventListener("submit",ue),document.querySelectorAll("[data-playdate-status]").forEach(e=>{e.addEventListener("click",()=>{const[t,s]=e.dataset.playdateStatus.split(":");me(t,s)})}),document.querySelectorAll("[data-resolve-report]").forEach(e=>{e.addEventListener("click",()=>{const t=a.reports.find(s=>s.id===e.dataset.resolveReport);t&&(t.status="resolved"),m(),r("Report resolved")})}),document.querySelector("#reset-demo")?.addEventListener("click",ge)}g();
