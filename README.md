# PawPaw Playdate MVP Demo

PawPaw 当前方向是：

> 本地狗狗 playdate 匹配平台：通过狗狗 profile、附近推荐、swipe match、简单聊天、公开地点 playdate、活动反馈和安全风控，验证本地宠物主人是否愿意持续组织线下约玩。

## 当前主链路

这个 Demo 优先验证：

1. 创建狗狗 profile。
2. 浏览附近推荐卡片。
3. 左滑跳过 / 右滑感兴趣。
4. 双向喜欢生成 match。
5. Match 后开启简单聊天。
6. 选择公开地点和时间发起 playdate。
7. 活动后提交反馈。
8. 后台查看推荐漏斗、match、playdate、反馈和举报。

## 当前已实现范围

### Web Demo

`apps/web` 已实现静态交互 Demo：

1. 推荐页：展示附近狗狗、兼容度分数、推荐理由。
2. Swipe：支持 like / pass，重复滑动会从推荐队列移除。
3. Match：右滑已预设 liked-back 的狗狗会生成 match。
4. Chat：match 后可以发送简单文本消息。
5. Playdate：可以选择公开地点、时间、备注和疫苗要求。
6. Feedback：可以给 playdate 提交评分、repeat intent 和安全反馈。
7. Safety：支持举报和拉黑。
8. Admin：展示 impressions、likes、matches、chats、playdates、feedback、reports。

### API 骨架

`apps/api` 是 Go 模块化单体的最小骨架，目前提供：

```text
GET  /healthz
GET  /api/recommendations/feed
POST /api/swipes
GET  /api/matches
GET  /api/playdates
POST /api/playdates
GET  /api/locations
```

这些接口现在使用内存数据，后续按 `code.md` 接 PostgreSQL、Redis、异步事件和真实鉴权。

### 数据库 Schema

`infra/migrations/001_create_demo_schema.sql` 已切到 playdate 数据模型，包括：

```text
users
owner_profiles
pets
pet_profiles
locations
swipes
matches
conversations
messages
playdates
playdate_participants
feedback
reports
blocks
recommendation_logs
```

## 本地运行

安装依赖：

```bash
npm install
```

运行 Web Demo：

```bash
npm run dev
```

构建静态站点：

```bash
npm run build
```

运行 API：

```bash
go run ./apps/api/cmd/api
```

检查 API：

```bash
curl http://localhost:8080/healthz
curl http://localhost:8080/api/recommendations/feed
```

## 当前开发依据

优先看：

1. `mvp.md`：产品定位、MVP 范围、指标、用户流程。
2. `code.md`：工程模块、数据表、API、Sprint、验收标准。

`宠物社交软件详细设计研究报告.docx` 是早期研究材料，只作为背景参考；当前开发不再按“泛宠物社交/内容流”推进。

## 暂不优先

当前 P0 不做：

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
