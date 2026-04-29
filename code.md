# PawPaw Playdate MVP 开发计划

本文是新的工程开发计划。当前方向从“宠物社交 + 内容流”调整为：

> 本地狗狗 playdate 匹配平台：宠物 profile、附近推荐、swipe match、简单聊天、playdate 发起、反馈闭环和安全风控。

## 1. 代码仓库结构

继续使用 monorepo，但开发重心调整：

```text
PawPaw/
  apps/
    api/                    # Go 模块化单体服务
    mobile/                 # Flutter App，后续完整移动端
    web/                    # Web Demo / Next.js 公开页和后台
  packages/
    api-contracts/          # OpenAPI、枚举、错误码
    matching-core/          # 推荐打分、兼容度规则，可被 API 和测试复用
  infra/
    migrations/             # PostgreSQL 迁移
    docker/                 # 本地 PostgreSQL / Redis
    scripts/                # 种子数据、部署脚本
  docs/
    mvp.md
    code.md
```

当前静态 Demo 可以继续保留在 `apps/web`，后续逐步接真实 API。

## 2. 后端模块

### 2.1 基础模块

| 模块 | 目录建议 | 说明 |
| --- | --- | --- |
| 启动入口 | `cmd/api/main.go` | HTTP 服务、配置、依赖注入 |
| 配置 | `internal/config` | 数据库、Redis、对象存储、Push、风控配置 |
| 数据库 | `internal/db` | PostgreSQL、事务、分页、迁移 |
| 缓存 | `internal/cache` | Redis、profile 缓存、推荐缓存、swipe 状态 |
| 鉴权 | `internal/auth` | 邮箱/手机号登录、session/JWT |
| 权限 | `internal/permission` | 用户、运营、后台角色 |
| 事件 | `internal/event` | SwipeCreated、MatchCreated、PlaydateCreated |
| Job | `internal/job` | 推荐预计算、通知、playdate 提醒、数据聚合 |
| 观测 | `internal/observability` | 日志、指标、错误上报 |

### 2.2 业务模块

| 模块 | 目录建议 | 主要职责 |
| --- | --- | --- |
| 用户 | `internal/user` | 主人档案、隐私、安全偏好 |
| 宠物 | `internal/pet` | 狗狗档案、体型、性格、疫苗、活动偏好 |
| 地点 | `internal/location` | dog park、公开地点、neighborhood/geohash |
| 推荐 | `internal/recommendation` | 候选召回、加权排序、曝光日志 |
| Swipe | `internal/swipe` | 左滑/右滑、幂等、已滑过滤 |
| Match | `internal/match` | 双向喜欢、match 唯一约束、match 列表 |
| 聊天 | `internal/chat` | conversation、message、未读数 |
| Playdate | `internal/playdate` | 创建、邀请、确认、取消、到场、完成 |
| 反馈 | `internal/feedback` | 评分、repeat intent、安全反馈 |
| 安全 | `internal/safety` | 举报、拉黑、取消 match、封禁 |
| 通知 | `internal/notification` | match、聊天、playdate 提醒 |
| 后台 | `internal/admin` | 用户、宠物、举报、playdate、地点管理 |
| 埋点 | `internal/analytics` | impression、swipe、match、chat、playdate、feedback |
| 服务目录 | `internal/service` | P1：grooming、vet、training 线索 |

## 3. 数据库迁移计划

首批迁移顺序：

```text
001_create_users.sql
002_create_pets_and_profiles.sql
003_create_locations.sql
004_create_swipes.sql
005_create_matches.sql
006_create_conversations.sql
007_create_playdates.sql
008_create_feedback.sql
009_create_safety.sql
010_create_recommendation_logs.sql
011_create_notifications.sql
012_create_admin_audit_logs.sql
```

## 4. 核心数据表

### 4.1 用户与宠物

| 表 | 关键字段 |
| --- | --- |
| `users` | id、email_hash、phone_hash、nickname、avatar_url、neighborhood、privacy_level、risk_state |
| `owner_profiles` | user_id、available_windows、meetup_preferences、max_distance_km、safety_preferences |
| `pets` | id、owner_user_id、name、species、breed、birth_date、sex、avatar_url |
| `pet_profiles` | pet_id、size、neutered、vaccine_status、personality_tags、activity_preferences、energy_level |
| `locations` | id、name、type、city、neighborhood、geohash、is_public_place、safety_notes |

### 4.2 匹配闭环

| 表 | 关键字段 |
| --- | --- |
| `swipes` | id、user_id、pet_id、target_user_id、target_pet_id、action、idempotency_key、created_at |
| `matches` | id、user_low_id、user_high_id、pet_low_id、pet_high_id、status、created_at |
| `conversations` | id、match_id、status、last_message_at |
| `messages` | id、conversation_id、sender_user_id、body、seq、created_at |
| `playdates` | id、creator_user_id、location_id、start_at、visibility、vaccine_required、status |
| `playdate_participants` | playdate_id、user_id、pet_id、status、checked_in_at |
| `feedback` | id、playdate_id、from_user_id、to_user_id、rating、repeat_intent、safety_flag |

### 4.3 安全与推荐

| 表 | 关键字段 |
| --- | --- |
| `reports` | id、reporter_user_id、target_type、target_id、reason、status |
| `blocks` | blocker_user_id、blocked_user_id、reason、created_at |
| `recommendation_logs` | user_id、candidate_pet_id、rank_position、features_snapshot、shown_at、action、matched、chat_started、playdate_created、feedback_score |
| `notifications` | id、user_id、type、payload_json、read_at、created_at |
| `audit_logs` | actor_id、action、target_type、target_id、metadata_json、created_at |

关键约束：

```sql
unique (user_id, target_pet_id) on swipes;
unique (idempotency_key) on swipes;
unique (user_low_id, user_high_id, pet_low_id, pet_high_id) on matches;
unique (blocker_user_id, blocked_user_id) on blocks;
```

## 5. REST API 计划

### 5.1 Auth / Me

```text
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/me
PATCH  /api/v1/me
PATCH  /api/v1/me/privacy
PATCH  /api/v1/me/availability
```

### 5.2 宠物 Profile

```text
POST   /api/v1/pets
GET    /api/v1/me/pets
GET    /api/v1/pets/:pet_id
PATCH  /api/v1/pets/:pet_id
PATCH  /api/v1/pets/:pet_id/profile
POST   /api/v1/pets/:pet_id/avatar/upload-token
```

### 5.3 地点

```text
GET    /api/v1/locations
GET    /api/v1/locations/:location_id
POST   /api/v1/admin/locations
PATCH  /api/v1/admin/locations/:location_id
```

### 5.4 推荐与 Swipe

```text
GET    /api/v1/recommendations/feed
POST   /api/v1/recommendations/:candidate_pet_id/impression
POST   /api/v1/swipes
GET    /api/v1/swipes/me
```

`POST /api/v1/swipes` 请求体：

```json
{
  "pet_id": "my_pet_id",
  "target_pet_id": "candidate_pet_id",
  "action": "like",
  "idempotency_key": "user-target-action-clientNonce"
}
```

响应：

```json
{
  "matched": true,
  "match_id": "match_id",
  "conversation_id": "conversation_id"
}
```

### 5.5 Match / Chat

```text
GET    /api/v1/matches
GET    /api/v1/matches/:match_id
POST   /api/v1/matches/:match_id/unmatch

GET    /api/v1/conversations/:conversation_id/messages
POST   /api/v1/conversations/:conversation_id/messages
POST   /api/v1/conversations/:conversation_id/read
```

MVP 先用 REST 轮询；后续再加 WebSocket。

### 5.6 Playdate

```text
POST   /api/v1/playdates
GET    /api/v1/playdates
GET    /api/v1/playdates/:playdate_id
POST   /api/v1/playdates/:playdate_id/invite
POST   /api/v1/playdates/:playdate_id/respond
POST   /api/v1/playdates/:playdate_id/cancel
POST   /api/v1/playdates/:playdate_id/check-in
POST   /api/v1/playdates/:playdate_id/feedback
```

### 5.7 安全

```text
POST   /api/v1/reports
POST   /api/v1/blocks
DELETE /api/v1/blocks/:blocked_user_id
GET    /api/v1/blocks
```

### 5.8 后台与数据

```text
GET    /api/v1/admin/dashboard
GET    /api/v1/admin/users
GET    /api/v1/admin/pets
GET    /api/v1/admin/matches
GET    /api/v1/admin/playdates
GET    /api/v1/admin/reports
POST   /api/v1/admin/reports/:report_id/resolve
POST   /api/v1/admin/users/:user_id/ban

POST   /api/v1/events
GET    /api/v1/admin/analytics/recommendation-funnel
GET    /api/v1/admin/analytics/playdate-funnel
```

## 6. 推荐系统实现计划

### 6.1 MVP 推荐流程

```text
用户请求推荐 feed
  -> 读取当前用户和狗狗 profile
  -> geohash/neighborhood 召回候选
  -> 过滤已滑、拉黑、举报风险、不可见档案
  -> 计算兼容度特征
  -> 加权排序
  -> 写 recommendation_logs impression
  -> 返回卡片和 reason_codes
```

### 6.2 加权排序

```text
score = 0.25 * location_score
      + 0.20 * personality_score
      + 0.15 * size_compatibility
      + 0.15 * schedule_overlap
      + 0.10 * activity_preference
      + 0.10 * historical_match_rate
      + 0.05 * freshness
```

### 6.3 推荐代码拆分

| 文件/包 | 责任 |
| --- | --- |
| `internal/recommendation/retriever.go` | 地理和基础规则召回 |
| `internal/recommendation/filter.go` | 已滑、拉黑、风险、隐私过滤 |
| `internal/recommendation/features.go` | 距离、体型、性格、时间重合特征 |
| `internal/recommendation/scorer.go` | 加权排序 |
| `internal/recommendation/exploration.go` | 新用户、新宠物、多样性曝光 |
| `internal/recommendation/logger.go` | 曝光和行为日志 |

## 7. 缓存设计

| 缓存 | Key | 用途 |
| --- | --- | --- |
| 用户 profile | `user_profile:{userId}` | 推荐、隐私、安全设置 |
| 宠物 profile | `pet_profile:{petId}` | 卡片展示和打分 |
| 推荐候选 | `recommend_candidates:{userId}:{geoHash}:{version}` | 降低召回成本 |
| 推荐结果 | `recommend_feed:{userId}:{date}:{modelVersion}` | 短时间稳定 feed |
| 已滑集合 | `swiped:{userId}` | 快速过滤 |
| 喜欢集合 | `liked_by:{targetPetId}` | 快速判断 mutual like |
| 未读数 | `unread:{userId}` | 消息红点 |

所有核心状态必须落 PostgreSQL，Redis 只做加速。

## 8. 最终一致性与事件

### 8.1 Swipe 到 Match

同步：

1. 校验用户、宠物、target 是否可见。
2. 用 `idempotency_key` 写 `swipes`。
3. 返回 swipe 接收成功。

异步：

1. 发布 `SwipeCreatedEvent`。
2. Worker 查询对方是否已 like。
3. 归一化 user/pet id。
4. 插入 `matches`，依赖唯一约束防重复。
5. 发布 `MatchCreatedEvent`。
6. 创建 conversation。
7. 写通知。

### 8.2 事件列表

| 事件 | 消费者 |
| --- | --- |
| `SwipeCreatedEvent` | match worker、analytics |
| `MatchCreatedEvent` | chat worker、notification、analytics |
| `MessageCreatedEvent` | unread counter、notification、moderation |
| `PlaydateCreatedEvent` | notification、reminder job、analytics |
| `PlaydateFeedbackSubmittedEvent` | recommendation log updater、safety |
| `ReportCreatedEvent` | admin queue、risk scorer |

## 9. App 页面计划

### 9.1 移动端页面

| 页面 | 路由建议 | 说明 |
| --- | --- | --- |
| 登录 | `/auth/login` | 邮箱/手机号登录 |
| Onboarding | `/onboarding` | 主人 + 狗狗 profile |
| 推荐卡片 | `/tabs/recommend` | swipe 主界面 |
| 推荐筛选 | `/recommend/filters` | 距离、体型、时间、疫苗 |
| Match 列表 | `/tabs/matches` | 双向匹配 |
| 聊天 | `/conversations/:id` | match 后聊天 |
| 创建 Playdate | `/playdates/new` | 时间、地点、宠物、备注 |
| Playdate 列表 | `/tabs/playdates` | 待确认、已确认、历史 |
| Playdate 反馈 | `/playdates/:id/feedback` | 评分和安全反馈 |
| 地点 | `/tabs/places` | dog park / pet-friendly place |
| 我的 | `/tabs/me` | 主人、宠物、安全、黑名单 |

### 9.2 Web 页面

| 页面 | 路由建议 | 说明 |
| --- | --- | --- |
| Demo 首页 | `/` | 展示主链路 |
| 宠物卡 | `/pet/[petId]` | 公开分享 |
| 地点页 | `/places/[placeId]` | dog park SEO |
| 后台 Dashboard | `/admin/dashboard` | 漏斗和风险概览 |
| 用户管理 | `/admin/users` | 风控和封禁 |
| 宠物管理 | `/admin/pets` | profile 审核 |
| Playdate 管理 | `/admin/playdates` | 活动状态 |
| 举报处理 | `/admin/reports` | 举报和拉黑 |

## 10. Web Demo 迭代计划

当前 `apps/web` 是静态 Demo。下一版 Demo 需要从“宠物社区展示”调整成“playdate 匹配展示”：

1. 首页 hero 改成 playdate matching 定位。
2. 增加 swipe 卡片区：左滑/右滑按钮、兼容度分数、推荐理由。
3. 增加 match 列表和简单聊天模拟。
4. 增加创建 playdate 表单。
5. 增加活动反馈和安全举报。
6. 后台统计改成 recommendation funnel 和 playdate funnel。

## 11. 测试计划

### 后端测试

| 测试 | 范围 |
| --- | --- |
| 推荐单元测试 | 体型兼容、性格兼容、时间重合、score 排序 |
| Swipe 幂等 | 重复请求不会重复写入 |
| Match 唯一性 | A/B 同时右滑只生成一个 match |
| 权限测试 | 未 match 不能聊天，不能操作别人的 playdate |
| 安全测试 | block 后互相不可见，report 进入后台 |
| Playdate 状态机 | pending、confirmed、cancelled、completed |

### App / Web 测试

| 测试 | 范围 |
| --- | --- |
| Onboarding | 必填字段、空状态、隐私提示 |
| Swipe | 左滑、右滑、match 弹窗、无候选状态 |
| Chat | 发送消息、未读、举报入口 |
| Playdate | 创建、确认、取消、反馈 |
| 后台 | 举报处理、用户封禁、数据看板 |

## 12. 开发顺序

### Sprint 0：工程地基

1. 保留现有 monorepo。
2. 补 Docker Compose：PostgreSQL、Redis。
3. 建数据库迁移框架。
4. 定义 OpenAPI 和错误码。
5. 打通登录、鉴权、健康检查。
6. 准备 50-100 条狗狗 profile 种子数据。

### Sprint 1：Profile 和地点

1. 主人档案 CRUD。
2. 狗狗档案 CRUD。
3. dog personality / size / vaccine / schedule 字段。
4. 地点表和公开地点管理。
5. Onboarding 页面。
6. Web Demo 更新为 playdate 定位。

### Sprint 2：推荐和 Swipe

1. 推荐候选召回。
2. 兼容度特征和加权排序。
3. 推荐卡片 API。
4. Swipe API 和幂等。
5. 已滑过滤。
6. recommendation_logs 曝光和行为记录。

### Sprint 3：Match 和 Chat

1. 双向喜欢生成 match。
2. 唯一约束防重复。
3. Match 列表。
4. Conversation 和 Message。
5. 未读数和通知。
6. 取消 match。

### Sprint 4：Playdate 和反馈

1. 创建 playdate。
2. 邀请、确认、取消。
3. 公开地点选择。
4. 到场确认。
5. 活动后反馈。
6. playdate funnel 数据。

### Sprint 5：安全和灰度

1. 举报、拉黑、封禁。
2. 后台处理队列。
3. 风险用户标记。
4. 隐私和位置模糊化检查。
5. 小区域灰度。
6. 性能和缓存回归。

## 13. P0 验收标准

| 验收项 | 对应代码 |
| --- | --- |
| 用户能创建主人和狗狗 profile | User/Pet API、Onboarding |
| 推荐 feed 能返回候选狗狗 | Recommendation API、scorer |
| 推荐卡片展示兼容度和理由 | App/Web card component |
| 用户能左滑/右滑 | Swipe API、client state |
| 重复滑动被去重 | swipes unique + idempotency |
| 双向喜欢生成 match | Match worker + unique constraint |
| Match 后能聊天 | Conversation / Message API |
| 用户能创建 playdate | Playdate API、location selector |
| 用户能确认/取消 playdate | Playdate state machine |
| 用户能提交反馈 | Feedback API |
| 用户能举报/拉黑 | Safety API |
| 后台能处理举报 | Admin reports |
| 埋点能覆盖完整漏斗 | Analytics events |

## 14. 暂时不要写

1. 大型内容 Feed。
2. 短视频和直播。
3. 自营商城、订单、支付、退款。
4. 复杂群聊、语音、视频通话。
5. 精确实时定位共享。
6. AI 诊疗。
7. 多城市运营系统。
8. 深度学习推荐模型。
9. 商家 SaaS 收费。
10. 全国扩城。

## 15. 最小可运行 Demo 切法

最快 Demo 不需要真实后端，可以先在 Web 里模拟：

1. 5-10 张狗狗 profile 卡片。
2. 右滑触发 match。
3. Match 后显示聊天窗口。
4. 选择公开地点和时间创建 playdate。
5. 完成活动后提交反馈。
6. 后台展示推荐漏斗、match 数、playdate 数、举报数。

Demo 主链路：

```text
创建狗狗档案 -> 查看附近推荐 -> 右滑 -> Match -> 聊天 -> 发起 Playdate -> 反馈 -> 后台查看数据
```

这条链路比原来的“发动态 -> 点赞 -> 找服务”更符合新的产品定位，也更能体现推荐、缓存、低延迟和最终一致性的工程价值。
