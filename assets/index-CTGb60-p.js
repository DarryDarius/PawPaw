(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const p of r.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&a(p)}).observe(document,{childList:!0,subtree:!0});function s(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(n){if(n.ep)return;n.ep=!0;const r=s(n);fetch(n.href,r)}})();const u=["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80"],R=["猫","狗","其他"],z=["妹妹","弟弟","未知"],C=["公开","片区可见","仅自己"],H=["上海","杭州","深圳","成都","北京"],O=["成长记录","附近约玩","新手求助","宠物友好地点","健康记录"],d="2026-04-24",f={user:{id:"u1",nickname:"Darius",city:"上海",interests:["新手养宠","附近遛狗","健康提醒"]},pets:[{id:"p1",name:"奶盖",species:"猫",breed:"英短",sex:"妹妹",birthDate:"2023-05-12",city:"上海",visibility:"公开",avatar:u[0],createdAt:"2026-04-24",updatedAt:"2026-04-24"}],ownerPetBindings:[{userId:"u1",petId:"p1",role:"owner",status:"active",isPrimary:!0,createdAt:"2026-04-24",updatedAt:"2026-04-24"}],posts:[{id:"post1",petId:"p1",petIds:["p1"],author:"Darius",body:"第一次给奶盖建立 PawPaw 档案，顺手记录今天体重 4.2kg。",city:"上海",topic:"成长记录",image:u[0],mediaUrls:[u[0]],visibility:"公开",likes:24,likedByMe:!1,comments:["好乖！","这个档案页很适合记录疫苗。"],collected:!1,collectCount:3,status:"已通过",moderationStatus:"已通过",createdAt:"2026-04-24"},{id:"post2",petId:"seed-dog",petIds:["seed-dog"],author:"附近宠友",body:"世纪公园晚上 7 点有小型犬散步局，位置只公开到片区。",city:"上海",topic:"附近约玩",image:u[1],mediaUrls:[u[1]],visibility:"片区可见",likes:41,likedByMe:!1,comments:["报名！","可以带牵引绳和水碗。"],collected:!0,collectCount:8,status:"已通过",moderationStatus:"已通过",createdAt:"2026-04-24"}],questions:[{id:"q1",title:"幼猫第一次驱虫前需要注意什么？",tag:"驱虫",answers:3,saved:!1},{id:"q2",title:"狗狗换粮多久比较合适？",tag:"喂养",answers:5,saved:!0}],healthRecords:[{id:"h1",petId:"p1",type:"体重",value:"4.2kg",date:"2026-04-24"},{id:"h2",petId:"p1",type:"驱虫",value:"外驱已完成",date:"2026-04-20"}],reminders:[{id:"r1",petId:"p1",type:"疫苗",due:"2026-05-12",done:!1}],services:[{id:"s1",name:"毛球星球洗护",category:"洗护",district:"徐汇区",response:"8 分钟内响应",rating:"4.8",verified:!0},{id:"s2",name:"安心寄养小屋",category:"寄养",district:"静安区",response:"15 分钟内响应",rating:"4.7",verified:!0},{id:"s3",name:"城市宠物医院",category:"医院",district:"浦东新区",response:"电话优先",rating:"4.6",verified:!0}],leads:[{id:"l1",serviceId:"s1",petId:"p1",petName:"奶盖",message:"想预约周末洗护，猫咪比较胆小。",status:"待响应",createdAt:"刚刚"}],reports:[{id:"m1",target:"post2",reason:"线下活动需确认安全提示",status:"待审核"}],activeTab:"home",feedFilter:"recommend",selectedPetId:"p1",editingPetId:"",toast:""};let i=_();function _(){const e=window.localStorage.getItem("pawpaw-demo-state");if(!e)return k(structuredClone(f));try{return k({...structuredClone(f),...JSON.parse(e)})}catch{return k(structuredClone(f))}}function k(e){const t={...f.user,...e.user||{},id:e.user?.id||f.user.id},s=(e.pets?.length?e.pets:f.pets).map((c,I)=>({...c,city:c.city||t.city||"上海",visibility:c.visibility||"公开",avatar:c.avatar||u[I%u.length],createdAt:c.createdAt||d,updatedAt:c.updatedAt||d})),n=(e.ownerPetBindings?.length?e.ownerPetBindings:s.map((c,I)=>({userId:t.id,petId:c.id,role:c.ownerRole||"owner",status:"active",isPrimary:!!(c.isPrimary??I===0),createdAt:c.createdAt||d,updatedAt:c.updatedAt||d}))).map(c=>({userId:c.userId||t.id,petId:c.petId,role:c.role||"owner",status:c.status||"active",isPrimary:!!c.isPrimary,invitedByUserId:c.invitedByUserId||"",createdAt:c.createdAt||d,updatedAt:c.updatedAt||d})),r=n.filter(c=>c.userId===t.id&&c.status==="active");r.length&&!r.some(c=>c.isPrimary)&&(r[0].isPrimary=!0);const p=new Set(r.map(c=>c.petId)),w=p.has(e.selectedPetId)?e.selectedPetId:r.find(c=>c.isPrimary)?.petId||r[0]?.petId||s[0]?.id||"";return{...e,user:t,pets:s,ownerPetBindings:n,posts:J(e.posts||f.posts),selectedPetId:w,editingPetId:e.editingPetId||"",leads:(e.leads||[]).map(c=>({...c,petId:p.has(c.petId)?c.petId:s.find(I=>I.name===c.petName)?.id||w}))}}function J(e){return e.map((t,s)=>{const a=t.petIds?.length?t.petIds:[t.petId].filter(Boolean),n=t.mediaUrls?.length?t.mediaUrls:[t.image||u[1]].filter(Boolean);return{...t,id:t.id||`post-seed-${s}`,petId:t.petId||a[0],petIds:a,mediaUrls:n,image:t.image||n[0]||u[1],visibility:t.visibility||"公开",moderationStatus:t.moderationStatus||t.status||"待审核",status:t.status||t.moderationStatus||"待审核",likes:t.likes??0,likedByMe:!!t.likedByMe,comments:Y(t.comments||[]),collected:!!t.collected,collectCount:t.collectCount??(t.collected?1:0),createdAt:t.createdAt||d}})}function Y(e){return e.map((t,s)=>typeof t=="string"?{id:`seed-comment-${s}`,author:"宠友",body:t,createdAt:d}:{id:t.id||`comment-${s}`,author:t.author||"宠友",body:t.body||"",createdAt:t.createdAt||d})}function l(){window.localStorage.setItem("pawpaw-demo-state",JSON.stringify(i))}function j(e){i={...i,...e},l(),v()}function o(e){i.toast=e,v(),window.clearTimeout(o.timer),o.timer=window.setTimeout(()=>{i.toast="",v()},2200)}function P(){return i.ownerPetBindings.filter(e=>e.userId===i.user.id&&e.status==="active"&&m(e.petId))}function g(e){return P().find(t=>t.petId===e)}function h(){return P().map(e=>m(e.petId)).filter(Boolean)}function K(){return P().find(e=>e.isPrimary)||P()[0]}function E(e){return g(e)?.role==="owner"}function y(e){return["owner","family"].includes(g(e)?.role)}function D(){return m(i.selectedPetId)||m(K()?.petId)||h()[0]||i.pets[0]}function m(e){return i.pets.find(t=>t.id===e)}function A(e){return m(e)?.name||"城市宠友"}function q(e){return m(e)?.avatar||u[1]}function Q(e){if(!e?.birthDate)return"年龄待补充";const t=new Date(`${e.birthDate}T00:00:00`),s=new Date(`${d}T00:00:00`);if(Number.isNaN(t.getTime())||t>s)return"年龄待确认";let a=(s.getFullYear()-t.getFullYear())*12+s.getMonth()-t.getMonth();if(s.getDate()<t.getDate()&&(a-=1),a<1)return"未满 1 个月";const n=Math.floor(a/12),r=a%12;return n?r?`${n} 岁 ${r} 个月`:`${n} 岁`:`${r} 个月`}function S(e){return`${e.species} · ${e.breed||"品种待补充"} · ${Q(e)} · ${e.city}`}function T(e){const t=new Date(`${d}T00:00:00`),s=new Date(`${e}T00:00:00`);return Math.max(0,Math.round((s-t)/864e5))}function G(e){e.preventDefault();const t=new FormData(e.currentTarget),s=String(t.get("name")||"").trim(),a=t.get("birthDate");if(!s)return o("请先填写宠物名字");if(s.length>20)return o("宠物名字最多 20 个字符");if(a&&new Date(`${a}T00:00:00`)>new Date(`${d}T00:00:00`))return o("生日不能晚于今天");const n={id:`p${Date.now()}`,name:s,species:t.get("species"),breed:String(t.get("breed")||"").trim(),sex:t.get("sex"),birthDate:a||"",city:t.get("city")||i.user.city,visibility:t.get("visibility")||"公开",avatar:String(t.get("avatar")||"").trim()||u[i.pets.length%u.length],createdAt:d,updatedAt:d},r=P().length===0;i.pets.push(n),i.ownerPetBindings.push({userId:i.user.id,petId:n.id,role:"owner",status:"active",isPrimary:r,invitedByUserId:"",createdAt:d,updatedAt:d}),r&&(i.selectedPetId=n.id),l(),e.currentTarget.reset(),o(`已创建宠物档案：${n.name}`)}function W(e){e.preventDefault();const t=new FormData(e.currentTarget),s=m(t.get("id"));if(!s)return o("没有找到要编辑的宠物档案");if(!E(s.id))return o("只有主人可以编辑宠物档案");const a=String(t.get("name")||"").trim(),n=t.get("birthDate");if(!a)return o("请先填写宠物名字");if(a.length>20)return o("宠物名字最多 20 个字符");if(n&&new Date(`${n}T00:00:00`)>new Date(`${d}T00:00:00`))return o("生日不能晚于今天");s.name=a,s.species=t.get("species"),s.breed=String(t.get("breed")||"").trim(),s.sex=t.get("sex"),s.birthDate=n||"",s.city=t.get("city")||i.user.city,s.visibility=t.get("visibility")||"公开",s.avatar=String(t.get("avatar")||"").trim()||s.avatar,s.updatedAt=d,i.editingPetId="",l(),o(`已更新宠物档案：${s.name}`)}function U(e){if(!g(e))return o("只能切换到已绑定的宠物");i.selectedPetId=e,l(),v()}function X(e){const t=m(e);if(t){if(!E(e))return o("只有主人可以设置默认宠物");i.ownerPetBindings.forEach(s=>{s.userId!==i.user.id||s.status!=="active"||(s.isPrimary=s.petId===e,s.updatedAt=d)}),i.selectedPetId=e,l(),o(`已设为默认宠物：${t.name}`)}}function Z(e){return String(e||"").split(/[\n,]+/).map(t=>t.trim()).filter(Boolean).slice(0,9)}function b(e){return e.petIds?.length?e.petIds:[e.petId].filter(Boolean)}function ee(e){return e.mediaUrls?.[0]||e.image||q(b(e)[0])}function L(e){return e.moderationStatus||e.status||"待审核"}function M(e){return b(e).some(t=>!!g(t))}function x(e){const t=L(e);return!["已通过","待审核"].includes(t)||t==="待审核"&&!M(e)?!1:e.visibility!=="仅自己"?!0:M(e)}function $(e){const t=new Date(`${e.createdAt||d}${String(e.createdAt||"").includes("T")?"":"T00:00:00"}`).getTime();return Number.isNaN(t)?0:t}function F(e){const t=e.city===i.user.city?20:0,s=M(e)?12:0,a=Math.min(e.mediaUrls?.length||0,3)*2,n=L(e)==="已通过"?8:0;return t+s+n+a+e.likes*2+e.comments.length*3+(e.collectCount||0)*2}function te(){const e=i.posts.filter(t=>x(t)?i.feedFilter==="city"?t.visibility!=="仅自己"&&t.city===i.user.city:i.feedFilter==="following"?b(t).some(s=>!!g(s)):!0:!1);return i.feedFilter==="latest"?e.sort((t,s)=>$(s)-$(t)):i.feedFilter==="recommend"?e.sort((t,s)=>F(s)-F(t)||$(s)-$(t)):e.sort((t,s)=>$(s)-$(t))}function se(e){e.preventDefault();const t=new FormData(e.currentTarget),s=t.get("petId"),a=String(t.get("body")||"").trim(),n=t.get("topic"),r=t.get("visibility")||"公开",p=Z(t.get("mediaUrls"));if(!s)return o("请先绑定一只可发布的宠物");if(!y(s))return o("只有已绑定的主人或共养成员可以发布动态");if(!a)return o("先写一点宠物动态吧");if(a.length>1e3)return o("动态正文最多 1000 个字符");if(!O.includes(n))return o("请选择有效的话题");if(!C.includes(r))return o("请选择有效的可见性");const w=m(s),c={id:`post${Date.now()}`,petId:s,petIds:[s],author:i.user.nickname,body:a,city:w?.city||i.user.city,topic:n,image:p[0]||q(s),mediaUrls:p.length?p:[q(s)],visibility:r,likes:0,comments:[],collected:!1,collectCount:0,likedByMe:!1,status:"待审核",moderationStatus:"待审核",createdAt:new Date().toISOString()};i.posts.unshift(c),i.reports.unshift({id:`m${Date.now()}`,target:c.id,postId:c.id,type:"post_moderation",reason:`${w?.name||"宠物"} 的新发布内容待审核`,status:"待审核"}),l(),e.currentTarget.reset(),o("动态已发布，当前状态：待审核")}function ie(e){e.preventDefault();const t=new FormData(e.currentTarget);if(!t.get("petId"))return o("请先绑定一只可记录健康的宠物");if(!y(t.get("petId")))return o("只有已绑定的主人或共养成员可以记录健康事项");const s={id:`h${Date.now()}`,petId:t.get("petId"),type:t.get("type"),value:String(t.get("value")||"").trim()||"已记录",date:t.get("date")||"2026-04-24"};i.healthRecords.unshift(s),l(),e.currentTarget.reset(),o("健康记录已保存")}function ae(e){const t=i.services.find(a=>a.id===e),s=D();if(!y(s.id))return o("只有已绑定的主人或共养成员可以提交服务线索");i.leads.unshift({id:`l${Date.now()}`,serviceId:e,petId:s.id,petName:s.name,message:`咨询 ${t.name} 的${t.category}服务`,status:"待响应",createdAt:"刚刚"}),l(),o("已提交服务线索，商家后台可查看")}function ne(e){const t=i.posts.find(s=>s.id===e);t&&(t.likedByMe=!t.likedByMe,t.likes=Math.max(0,t.likes+(t.likedByMe?1:-1)),l(),o(t.likedByMe?"点赞成功":"已取消点赞"))}function re(e){const t=i.posts.find(s=>s.id===e);t&&(t.collected=!t.collected,t.collectCount=Math.max(0,(t.collectCount||0)+(t.collected?1:-1)),l(),o(t.collected?"已收藏":"已取消收藏"))}function oe(e){e.preventDefault();const t=new FormData(e.currentTarget),s=i.posts.find(n=>n.id===t.get("postId")),a=String(t.get("comment")||"").trim();if(!s)return o("没有找到要评论的动态");if(!x(s))return o("当前动态不可评论");if(!a)return o("先写一点评论内容");if(a.length>200)return o("评论最多 200 个字符");s.comments.push({id:`comment${Date.now()}`,author:i.user.nickname,body:a,createdAt:new Date().toISOString()}),l(),e.currentTarget.reset(),o("评论已发布")}function ce(e){const t=i.posts.find(a=>a.id===e);if(!t)return o("没有找到要举报的动态");if(i.reports.find(a=>a.postId===e&&a.type==="user_report"&&a.status==="待审核"))return o("这条动态已经在举报审核队列中");i.reports.unshift({id:`m${Date.now()}`,target:e,postId:e,type:"user_report",reason:`用户举报内容：${t.topic}`,status:"待审核"}),l(),o("举报已提交到运营后台")}function de(e){const t=i.reports.find(a=>a.id===e);t&&(t.status="已处理");const s=i.posts.find(a=>a.id===t?.postId||a.id===t?.target);s&&(s.status="已通过",s.moderationStatus="已通过"),l(),o("审核任务已处理")}function le(){i=k(structuredClone(f)),l(),v(),o("Demo 数据已重置")}function ue(){const e=h().length,t=i.reports.filter(n=>n.status==="待审核").length,s=i.leads.length,a=T(i.reminders[0]?.due||"2026-04-24");return`
    <section class="stats" aria-label="核心指标">
      <article><span>${e}</span><p>有效宠物档案</p></article>
      <article><span>${i.posts.length}</span><p>宠物动态</p></article>
      <article><span>${s}</span><p>服务线索</p></article>
      <article><span>${t}</span><p>待审核</p></article>
      <article><span>${a}</span><p>天后疫苗提醒</p></article>
    </section>
  `}function pe(){const e=D(),t=g(e.id);return`
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
        <img src="${e.avatar}" alt="${e.name} 的宠物照片" />
        <div>
          <strong>${e.name}${t?.isPrimary?" · 默认宠物":""}</strong>
          <span>${S(e)} · ${e.visibility}</span>
        </div>
      </div>
    </header>
  `}function me(){return`
    <nav class="top-nav" aria-label="主导航">
      <div class="brand">
        <span>PawPaw</span>
        <small>工具型宠物社区</small>
      </div>
      <div class="tabs">
        ${[["home","首页"],["pets","档案"],["nearby","附近"],["compose","发布"],["health","健康"],["services","服务"],["messages","消息"],["admin","后台"]].map(([t,s])=>`
              <button class="${i.activeTab===t?"active":""}" data-tab="${t}">
                ${s}
              </button>
            `).join("")}
      </div>
    </nav>
  `}function N(){const e=[["recommend","推荐"],["latest","最新"],["following","关注"],["city","城市"]],t=te();return`
    ${pe()}
    ${ue()}
    <section class="section-heading">
      <div>
        <p class="eyebrow">Feed</p>
        <h2>宠物动态流</h2>
      </div>
      <div class="segmented">
        ${e.map(([s,a])=>`
              <button class="${i.feedFilter===s?"active":""}" data-filter="${s}">
                ${a}
              </button>
            `).join("")}
      </div>
    </section>
    <section class="feed">
      ${t.map(fe).join("")||'<p class="empty-note">还没有可展示的动态，先给宠物发布一条成长记录。</p>'}
    </section>
  `}function fe(e){const s=b(e).map(A).join("、"),a=e.comments.slice(-2);return`
    <article class="post-card">
      <img src="${ee(e)}" alt="${s} 的动态图片" />
      <div class="post-body">
        <div class="post-meta">
          <span>${s}</span>
          <small>${e.city} · ${e.topic} · ${e.visibility} · ${L(e)}</small>
        </div>
        <p>${e.body}</p>
        <div class="pet-metrics">
          <span>${e.mediaUrls?.length||1} 张图片</span>
          <span>${e.comments.length} 条评论</span>
          <span>${e.collectCount||0} 次收藏</span>
          <span>${e.createdAt||d}</span>
        </div>
        <div class="comment-list">
          ${a.map(n=>`
                <div>
                  <strong>${n.author}</strong>
                  <span>${n.body}</span>
                </div>
              `).join("")}
        </div>
        <form class="comment-form" data-comment-form="${e.id}">
          <input type="hidden" name="postId" value="${e.id}" />
          <input name="comment" maxlength="200" placeholder="写评论" />
          <button type="submit">评论</button>
        </form>
        <div class="post-actions">
          <button class="${e.likedByMe?"active-action":""}" data-like="${e.id}">${e.likedByMe?"已赞":"赞"} ${e.likes}</button>
          <button class="${e.collected?"active-action":""}" data-collect="${e.id}">${e.collected?"已收藏":"收藏"}</button>
          <button data-report="${e.id}">举报</button>
        </div>
      </div>
    </article>
  `}function B(e,t){return e.map(s=>`<option ${s===t?"selected":""}>${s}</option>`).join("")}function ve(e){const t=!!e;return`
    <form class="panel form" id="${t?"pet-edit-form":"pet-form"}">
      <h3>${t?"编辑宠物档案":"创建宠物档案"}</h3>
      ${t?`<input type="hidden" name="id" value="${e.id}" />`:""}
      <label>名字 <input name="name" maxlength="20" placeholder="例如：布丁" value="${e?.name||""}" required /></label>
      <label>
        物种
        <select name="species">
          ${B(R,e?.species||"猫")}
        </select>
      </label>
      <label>品种 <input name="breed" maxlength="30" placeholder="例如：金渐层" value="${e?.breed||""}" /></label>
      <label>
        性别
        <select name="sex">
          ${B(z,e?.sex||"未知")}
        </select>
      </label>
      <label>生日 <input type="date" name="birthDate" max="${d}" value="${e?.birthDate||""}" /></label>
      <label>
        城市
        <select name="city">
          ${B(H,e?.city||i.user.city)}
        </select>
      </label>
      <label>
        可见性
        <select name="visibility">
          ${B(C,e?.visibility||"公开")}
        </select>
      </label>
      <label>头像 URL <input name="avatar" placeholder="可留空使用默认头像" value="${e?.avatar||""}" /></label>
      <div class="form-actions">
        <button class="primary" type="submit">${t?"保存修改":"创建档案"}</button>
        ${t?'<button class="secondary" type="button" id="cancel-edit-pet">取消</button>':""}
      </div>
    </form>
  `}function V(e){const t=g(e.id),s=i.posts.filter(r=>b(r).includes(e.id)).length,a=i.healthRecords.filter(r=>r.petId===e.id).length,n=i.leads.filter(r=>r.petId===e.id).length;return`
    <article class="pet-card ${i.selectedPetId===e.id?"selected":""}">
      <img src="${e.avatar}" alt="${e.name} 的头像" />
      <div class="pet-card-body">
        <div class="pet-card-title">
          <div>
            <strong>${e.name}</strong>
            <span>${S(e)}</span>
          </div>
          <span class="tag">${e.visibility}</span>
        </div>
        <div class="pet-metrics">
          <span>${t?.role==="owner"?"主人":t?.role==="family"?"共养成员":"只读成员"}</span>
          <span>${s} 条动态</span>
          <span>${a} 条健康记录</span>
          <span>${n} 条服务线索</span>
        </div>
        <div class="post-actions">
          <button data-select-pet="${e.id}">${i.selectedPetId===e.id?"当前使用":"切换使用"}</button>
          ${E(e.id)?`<button data-edit-pet="${e.id}">编辑</button>`:""}
          ${E(e.id)?`<button data-primary-pet="${e.id}">${t?.isPrimary?"默认宠物":"设为默认"}</button>`:""}
        </div>
      </div>
    </article>
  `}function ge(){const e=D(),t=g(e.id),s=i.posts.filter(r=>b(r).includes(e.id)),a=i.healthRecords.filter(r=>r.petId===e.id),n=i.reminders.find(r=>r.petId===e.id);return`
    <section class="pet-profile">
      <img src="${e.avatar}" alt="${e.name} 的档案照片" />
      <div>
        <p class="eyebrow">Pet Profile</p>
        <h2>${e.name}</h2>
        <p>${S(e)}</p>
        <div class="pet-metrics">
          <span>${e.visibility}</span>
          <span>${t?.isPrimary?"默认宠物":"非默认宠物"}</span>
          <span>${t?.role==="owner"?"主人":t?.role==="family"?"共养成员":"只读成员"}</span>
          <span>健康数据默认私密</span>
        </div>
        <div class="profile-grid">
          <div><strong>${s.length}</strong><span>关联动态</span></div>
          <div><strong>${a.length}</strong><span>健康记录</span></div>
          <div><strong>${n?`${T(n.due)} 天`:"未设置"}</strong><span>下次提醒</span></div>
        </div>
        <div class="pet-posts">
          <h3>最近动态</h3>
          ${s.slice(0,3).map(he).join("")||'<p class="empty-note">还没有关联动态。</p>'}
        </div>
      </div>
    </section>
  `}function he(e){return`
    <div class="place-row">
      <strong>${e.topic} · ${L(e)}</strong>
      <span>${e.body}</span>
    </div>
  `}function $e(){const e=m(i.editingPetId);return`
    <section class="section-heading">
      <div>
        <p class="eyebrow">Pets</p>
        <h2>宠物档案</h2>
      </div>
      <span class="privacy-pill">城市可见，健康记录默认私密</span>
    </section>
    ${ge()}
    <section class="two-column">
      <div class="panel">
        <h3>我的宠物</h3>
        <div class="pet-list">
          ${h().map(V).join("")||'<p class="empty-note">还没有绑定宠物，先创建第一只宠物档案。</p>'}
        </div>
      </div>
      ${ve(e)}
    </section>
  `}function ye(){return`
    <section class="section-heading">
      <div>
        <p class="eyebrow">Nearby</p>
        <h2>${i.user.city} · 片区级附近</h2>
      </div>
      <span class="privacy-pill">默认不展示精确坐标</span>
    </section>
    <section class="two-column">
      <div class="panel">
        <h3>附近宠友</h3>
        ${h().filter(e=>e.visibility!=="仅自己").map(e=>`
              <div class="list-row">
                <img src="${e.avatar}" alt="${e.name}" />
                <div>
                  <strong>${e.name}</strong>
                  <span>${S(e)} · ${e.visibility}</span>
                </div>
              </div>
            `).join("")}
        <div class="list-row">
          <img src="${u[2]}" alt="附近宠物" />
          <div>
            <strong>糯米</strong>
            <span>狗 · 柯基 · 徐汇区</span>
          </div>
        </div>
      </div>
      <div class="panel">
        <h3>宠物友好地点</h3>
        ${["世纪公园草坪","徐汇滨江步道","静安宠物友好咖啡"].map(e=>`
            <div class="place-row">
              <strong>${e}</strong>
              <span>公开到片区 · 适合约玩和活动</span>
            </div>
          `).join("")}
      </div>
    </section>
  `}function be(){const e=h().filter(t=>y(t.id));return`
    <section class="section-heading">
      <div>
        <p class="eyebrow">Create</p>
        <h2>发布宠物动态</h2>
      </div>
      <span class="privacy-pill">新动态默认进入审核队列</span>
    </section>
    <section class="two-column">
      <form class="panel form" id="post-form">
        ${e.length?"":'<p class="empty-note">你还没有可发布动态的宠物档案，请先创建或绑定宠物。</p>'}
        <label>
          关联宠物
          <select name="petId">
            ${e.map(t=>`<option value="${t.id}" ${t.id===i.selectedPetId?"selected":""}>${t.name}</option>`).join("")}
          </select>
        </label>
        <label>
          话题
          <select name="topic">
            ${O.map(t=>`<option>${t}</option>`).join("")}
          </select>
        </label>
        <label>
          可见性
          <select name="visibility">
            ${C.map(t=>`<option>${t}</option>`).join("")}
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
        <button class="primary" type="submit" ${e.length?"":"disabled"}>发布并进入审核</button>
      </form>
      <div class="panel">
        <h3>当前宠物档案</h3>
        ${V(D())}
        <div class="form-actions">
          <button class="secondary" data-tab="pets">管理宠物档案</button>
        </div>
      </div>
    </section>
  `}function we(){return`
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
            ${h().filter(t=>y(t.id)).map(t=>`<option value="${t.id}" ${t.id===i.selectedPetId?"selected":""}>${t.name}</option>`).join("")}
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
        ${i.healthRecords.map(t=>`
              <div class="timeline-row">
                <span>${t.date}</span>
                <strong>${A(t.petId)} · ${t.type}</strong>
                <p>${t.value}</p>
              </div>
            `).join("")}
        <h3>提醒</h3>
        ${i.reminders.map(t=>`
              <div class="place-row">
                <strong>${A(t.petId)} · ${t.type}</strong>
                <span>${t.due} · ${T(t.due)} 天后提醒</span>
              </div>
            `).join("")}
      </div>
    </section>
  `}function Ie(){const e=D(),t=h().filter(s=>y(s.id));return`
    <section class="section-heading">
      <div>
        <p class="eyebrow">Services</p>
        <h2>本地服务目录</h2>
      </div>
      <span class="privacy-pill">首版只做线索，不做交易闭环</span>
    </section>
    <section class="service-context">
      <div>
        <strong>当前咨询宠物：${e.name}</strong>
        <span>${S(e)} · 线索会带上宠物档案信息</span>
      </div>
      <select id="service-pet">
        ${t.map(s=>`<option value="${s.id}" ${s.id===i.selectedPetId?"selected":""}>${s.name}</option>`).join("")}
      </select>
    </section>
    <section class="service-grid">
      ${i.services.map(s=>`
            <article class="service-card">
              <div>
                <span class="tag">${s.category}</span>
                <h3>${s.name}</h3>
                <p>${s.district} · 评分 ${s.rating}</p>
                <p>${s.response}</p>
              </div>
              <button class="primary" data-lead="${s.id}">提交咨询</button>
            </article>
          `).join("")}
    </section>
  `}function Pe(){return`
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
        <span>下一次疫苗提醒将在 ${T(i.reminders[0]?.due||"2026-04-24")} 天后触发。</span>
      </div>
      ${i.leads.map(e=>`
            <div class="place-row">
              <strong>服务线索 · ${e.status}</strong>
              <span>${A(e.petId)}：${e.message}</span>
            </div>
          `).join("")}
    </section>
  `}function Ae(){return`
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
        ${i.reports.map(e=>`
              <div class="admin-row">
                <div>
                  <strong>${e.reason}</strong>
                  <span>目标：${e.target} · ${e.status}</span>
                </div>
                <button data-approve="${e.id}">处理</button>
              </div>
            `).join("")}
      </div>
      <div class="panel">
        <h3>商家线索</h3>
        ${i.leads.map(e=>`
                <div class="admin-row">
                  <div>
                    <strong>${i.services.find(s=>s.id===e.serviceId)?.name||"服务商家"}</strong>
                    <span>${A(e.petId)} · ${e.message} · ${e.status}</span>
                  </div>
                  <button data-lead-done="${e.id}">标记响应</button>
                </div>
              `).join("")}
      </div>
    </section>
  `}function De(){return`
    <section class="section-heading">
      <div>
        <p class="eyebrow">Q&A</p>
        <h2>新手问答</h2>
      </div>
      <span class="privacy-pill">不替代兽医诊断</span>
    </section>
    <section class="qa-strip">
      ${i.questions.map(e=>`
            <article>
              <span>${e.tag}</span>
              <h3>${e.title}</h3>
              <p>${e.answers} 个回答 · ${e.saved?"已收藏":"可收藏"}</p>
            </article>
          `).join("")}
    </section>
  `}function Se(){return({home:N,pets:$e,nearby:ye,compose:be,health:we,services:Ie,messages:Pe,admin:Ae}[i.activeTab]||N)()}function v(){document.querySelector("#app").innerHTML=`
    ${me()}
    <main>
      ${Se()}
      ${i.activeTab==="home"?De():""}
    </main>
    ${i.toast?`<div class="toast">${i.toast}</div>`:""}
  `,Be()}function Be(){document.querySelectorAll("[data-tab]").forEach(e=>{e.addEventListener("click",()=>j({activeTab:e.dataset.tab}))}),document.querySelectorAll("[data-filter]").forEach(e=>{e.addEventListener("click",()=>j({feedFilter:e.dataset.filter}))}),document.querySelectorAll("[data-like]").forEach(e=>{e.addEventListener("click",()=>ne(e.dataset.like))}),document.querySelectorAll("[data-collect]").forEach(e=>{e.addEventListener("click",()=>re(e.dataset.collect))}),document.querySelectorAll("[data-report]").forEach(e=>{e.addEventListener("click",()=>ce(e.dataset.report))}),document.querySelectorAll("[data-comment-form]").forEach(e=>{e.addEventListener("submit",oe)}),document.querySelectorAll("[data-lead]").forEach(e=>{e.addEventListener("click",()=>ae(e.dataset.lead))}),document.querySelectorAll("[data-select-pet]").forEach(e=>{e.addEventListener("click",()=>U(e.dataset.selectPet))}),document.querySelectorAll("[data-edit-pet]").forEach(e=>{e.addEventListener("click",()=>{i.editingPetId=e.dataset.editPet,i.activeTab="pets",l(),v()})}),document.querySelectorAll("[data-primary-pet]").forEach(e=>{e.addEventListener("click",()=>X(e.dataset.primaryPet))}),document.querySelectorAll("[data-approve]").forEach(e=>{e.addEventListener("click",()=>de(e.dataset.approve))}),document.querySelectorAll("[data-lead-done]").forEach(e=>{e.addEventListener("click",()=>{const t=i.leads.find(s=>s.id===e.dataset.leadDone);t&&(t.status="已响应"),l(),o("线索已标记响应")})}),document.querySelector("#service-pet")?.addEventListener("change",e=>U(e.target.value)),document.querySelector("#post-form")?.addEventListener("submit",se),document.querySelector("#pet-form")?.addEventListener("submit",G),document.querySelector("#pet-edit-form")?.addEventListener("submit",W),document.querySelector("#cancel-edit-pet")?.addEventListener("click",()=>{i.editingPetId="",l(),v()}),document.querySelector("#health-form")?.addEventListener("submit",ie),document.querySelector("#reset-demo")?.addEventListener("click",le)}v();
