# PawPaw MVP 代码开发清单

本文基于 `mvp.md`，把产品范围拆成需要实际编写的代码、模块、接口、页面和任务顺序。

## 1. 推荐代码仓库结构

MVP 建议使用一个 monorepo，方便接口类型、文档、部署脚本和多端代码同步演进。

```text
PawPaw/
  apps/
    api/                    # Go 模块化单体服务
    mobile/                 # Flutter iOS/Android App
    web/                    # Next.js 公开页 + 商家后台 + 运营后台
  packages/
    api-contracts/          # OpenAPI、接口类型、错误码、枚举
    design-tokens/          # 颜色、字号、间距、图标命名
  infra/
    docker/                 # 本地开发 Docker Compose
    migrations/             # 数据库迁移
    scripts/                # 初始化、种子数据、部署脚本
  docs/
    mvp.md
    code.md
    api.md
    schema.md
```

如果前期人少，可以先不拆 `packages/`，但至少要保留 `apps/api`、`apps/mobile`、`apps/web` 三块。

## 2. 后端需要写的代码

### 2.1 后端基础工程

| 模块 | 需要写的代码 | 说明 |
| --- | --- | --- |
| 启动入口 | `cmd/api/main.go` | 读取配置、连接数据库、注册路由、启动 HTTP 服务 |
| 配置 | `internal/config` | 环境变量、短信、对象存储、Redis、审核服务配置 |
| 数据库 | `internal/db` | PostgreSQL 连接、事务封装、分页工具 |
| Redis | `internal/cache` | 验证码、计数器、限流、热点缓存 |
| 路由 | `internal/http` | 中间件、错误处理、鉴权、请求日志 |
| 鉴权 | `internal/auth` | 手机号验证码登录、JWT/session、游客态 |
| 权限 | `internal/permission` | 用户、商家、运营后台角色权限 |
| 文件存储 | `internal/storage` | 图片上传签名、对象存储回调、公开 URL |
| 异步事件 | `internal/event` | 发布内容、审核、通知、埋点等事件 |
| 定时任务 | `internal/job` | 提醒触达、线索超时、数据统计 |
| 观测 | `internal/observability` | 日志、metrics、trace、错误上报 |

### 2.2 业务模块

| 模块 | 目录建议 | 主要职责 |
| --- | --- | --- |
| 用户 | `internal/user` | 用户资料、城市、兴趣、注销、账号状态 |
| 宠物 | `internal/pet` | 宠物档案、主人关系、宠物主页、可见性 |
| 内容 | `internal/content` | 帖子、媒体、话题、帖子详情、删除 |
| Feed | `internal/feed` | 推荐流、最新流、关注流、城市流 |
| 社交互动 | `internal/social` | 点赞、收藏、评论、关注 |
| 消息通知 | `internal/notification` | 站内通知、Push 任务、通知已读 |
| 附近 | `internal/nearby` | 城市/行政区内容、附近宠物、地点 |
| 问答 | `internal/qa` | 提问、回答、收藏、风险提示 |
| 健康 | `internal/health` | 体重、疫苗、驱虫、绝育、喂养提醒 |
| 服务 | `internal/service` | 商家、服务项目、筛选、线索 |
| 审核 | `internal/moderation` | 内容审核、举报、封禁、申诉 |
| 运营后台 | `internal/admin` | 审核队列、用户管理、商家管理、数据看板 |
| 商家后台 | `internal/merchant` | 商家资料、服务管理、线索处理 |
| 埋点 | `internal/analytics` | 行为事件接收、漏斗统计基础表 |

### 2.3 数据库迁移

首批迁移建议按依赖顺序写：

```text
001_create_users.sql
002_create_pets.sql
003_create_posts.sql
004_create_social_tables.sql
005_create_notifications.sql
006_create_health_records.sql
007_create_nearby_places.sql
008_create_qa.sql
009_create_service_providers.sql
010_create_reports_and_moderation.sql
011_create_analytics_events.sql
012_create_admin_roles.sql
```

### 2.4 核心数据表

必须先写：

| 表 | 用途 |
| --- | --- |
| `users` | 用户账号和基础资料 |
| `user_sessions` | 登录态和刷新令牌 |
| `pets` | 宠物一级实体 |
| `owner_pets` | 用户和宠物的拥有/共养关系 |
| `posts` | 图文、问题等内容主体 |
| `post_pets` | 内容关联宠物 |
| `media_assets` | 图片/视频文件 |
| `comments` | 评论 |
| `reactions` | 点赞等反应 |
| `collections` | 收藏 |
| `follow_edges` | 关注用户/宠物 |
| `notifications` | 站内通知 |
| `health_records` | 体重、疫苗、驱虫、绝育等记录 |
| `reminders` | 喂养、疫苗、驱虫等提醒 |
| `qa_questions` | 问答问题 |
| `qa_answers` | 问答回答 |
| `nearby_places` | 宠物友好地点 |
| `service_providers` | 商家主体 |
| `service_listings` | 服务项目 |
| `leads` | 用户提交的咨询/预约意向 |
| `reports` | 举报 |
| `moderation_tasks` | 审核任务 |
| `audit_logs` | 运营、商家、用户关键操作审计 |
| `analytics_events` | 埋点事件 |

## 3. REST API 需要写的接口

### 3.1 认证与用户

```text
POST   /api/v1/auth/sms/send
POST   /api/v1/auth/sms/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh

GET    /api/v1/me
PATCH  /api/v1/me
DELETE /api/v1/me
POST   /api/v1/me/interests
```

### 3.2 宠物档案

```text
POST   /api/v1/pets
GET    /api/v1/pets/:pet_id
PATCH  /api/v1/pets/:pet_id
DELETE /api/v1/pets/:pet_id
GET    /api/v1/me/pets
POST   /api/v1/pets/:pet_id/avatar/upload-token
GET    /api/v1/pets/:pet_id/timeline
```

### 3.3 内容与 Feed

```text
GET    /api/v1/feed/recommend
GET    /api/v1/feed/latest
GET    /api/v1/feed/following
GET    /api/v1/feed/city

POST   /api/v1/posts
GET    /api/v1/posts/:post_id
PATCH  /api/v1/posts/:post_id
DELETE /api/v1/posts/:post_id
POST   /api/v1/media/upload-token
GET    /api/v1/topics
```

### 3.4 互动

```text
POST   /api/v1/posts/:post_id/reactions
DELETE /api/v1/posts/:post_id/reactions
POST   /api/v1/posts/:post_id/collections
DELETE /api/v1/posts/:post_id/collections

GET    /api/v1/posts/:post_id/comments
POST   /api/v1/posts/:post_id/comments
DELETE /api/v1/comments/:comment_id

POST   /api/v1/follows
DELETE /api/v1/follows
GET    /api/v1/me/following
GET    /api/v1/me/followers
```

### 3.5 通知

```text
GET    /api/v1/notifications
POST   /api/v1/notifications/:notification_id/read
POST   /api/v1/notifications/read-all
POST   /api/v1/device-tokens
DELETE /api/v1/device-tokens/:token_id
```

### 3.6 附近

```text
GET    /api/v1/nearby/cities/:city_code/feed
GET    /api/v1/nearby/cities/:city_code/pets
GET    /api/v1/nearby/cities/:city_code/places
GET    /api/v1/nearby/places/:place_id
```

首版接口只接受城市和行政区参数，不返回精确坐标。

### 3.7 问答

```text
POST   /api/v1/questions
GET    /api/v1/questions
GET    /api/v1/questions/:question_id
POST   /api/v1/questions/:question_id/answers
PATCH  /api/v1/answers/:answer_id
DELETE /api/v1/answers/:answer_id
POST   /api/v1/questions/:question_id/collections
```

### 3.8 健康记录与提醒

```text
POST   /api/v1/pets/:pet_id/health-records
GET    /api/v1/pets/:pet_id/health-records
PATCH  /api/v1/health-records/:record_id
DELETE /api/v1/health-records/:record_id

POST   /api/v1/pets/:pet_id/reminders
GET    /api/v1/pets/:pet_id/reminders
PATCH  /api/v1/reminders/:reminder_id
DELETE /api/v1/reminders/:reminder_id
POST   /api/v1/reminders/:reminder_id/complete
```

### 3.9 服务目录与线索

```text
GET    /api/v1/service-categories
GET    /api/v1/service-listings
GET    /api/v1/service-listings/:listing_id
POST   /api/v1/service-listings/:listing_id/leads
GET    /api/v1/me/leads
```

### 3.10 举报与审核

```text
POST   /api/v1/reports
GET    /api/v1/reports/reasons
```

运营后台接口：

```text
GET    /api/v1/admin/moderation/tasks
POST   /api/v1/admin/moderation/tasks/:task_id/approve
POST   /api/v1/admin/moderation/tasks/:task_id/reject
POST   /api/v1/admin/users/:user_id/ban
POST   /api/v1/admin/users/:user_id/unban
GET    /api/v1/admin/service-providers
PATCH  /api/v1/admin/service-providers/:provider_id/verify
GET    /api/v1/admin/dashboard
```

商家后台接口：

```text
GET    /api/v1/merchant/profile
PATCH  /api/v1/merchant/profile
POST   /api/v1/merchant/listings
PATCH  /api/v1/merchant/listings/:listing_id
GET    /api/v1/merchant/leads
PATCH  /api/v1/merchant/leads/:lead_id
```

### 3.11 埋点

```text
POST   /api/v1/events
GET    /api/v1/admin/analytics/funnels
GET    /api/v1/admin/analytics/retention
```

## 4. Flutter App 需要写的代码

### 4.1 App 基础

| 模块 | 需要写的代码 |
| --- | --- |
| 启动 | splash、环境配置、版本检测 |
| 路由 | 底部 Tab、登录拦截、深链 |
| 网络 | API client、token 刷新、错误处理、重试 |
| 状态管理 | 用户态、城市、宠物档案、通知红点 |
| 本地存储 | token、草稿、用户偏好 |
| 上传 | 图片选择、压缩、上传进度、失败重试 |
| 权限 | 相册、相机、通知、位置权限按场景申请 |
| 埋点 | 页面曝光、点击、提交、留存事件 |

### 4.2 App 页面

| 页面 | 路由建议 | 说明 |
| --- | --- | --- |
| 游客首页 | `/home` | 可浏览内容，关键行为触发登录 |
| 登录 | `/auth/login` | 手机验证码登录 |
| 新手引导 | `/onboarding` | 主人档案、宠物档案、城市、兴趣 |
| 首页 | `/tabs/home` | 推荐、关注、最新、城市 |
| 附近 | `/tabs/nearby` | 城市宠友、地点、服务入口 |
| 发布选择 | `/compose` | 发图文、提问、记一笔 |
| 图文发布 | `/compose/post` | 文本、图片、宠物、话题 |
| 提问 | `/compose/question` | 问题、分类、风险提示 |
| 健康记录 | `/compose/health-record` | 体重、疫苗、驱虫、绝育 |
| 消息 | `/tabs/notifications` | 评论、点赞、关注、系统通知 |
| 我的 | `/tabs/me` | 主人资料、宠物、收藏、设置 |
| 宠物主页 | `/pets/:id` | 档案、动态、健康入口 |
| 帖子详情 | `/posts/:id` | 评论、互动、举报 |
| 问答详情 | `/questions/:id` | 回答、收藏、提示 |
| 健康中心 | `/pets/:id/health` | 记录列表、提醒列表 |
| 服务列表 | `/services` | 分类、城市、筛选 |
| 服务详情 | `/services/:id` | 商家资料、提交线索 |
| 设置 | `/settings` | 隐私、通知、注销、协议 |

### 4.3 App 组件

| 组件 | 用途 |
| --- | --- |
| `PostCard` | 内容流卡片 |
| `PetAvatar` | 宠物头像和基础信息 |
| `PetProfileHeader` | 宠物主页头部 |
| `MediaGrid` | 九宫格图片 |
| `ComposeToolbar` | 发布器工具栏 |
| `CommentList` | 评论列表 |
| `HealthRecordItem` | 健康记录项 |
| `ReminderItem` | 提醒项 |
| `ServiceListingCard` | 服务商家卡片 |
| `ReportSheet` | 举报弹窗 |
| `LoginRequiredSheet` | 游客行为登录引导 |
| `PermissionPrompt` | 权限解释弹窗 |

## 5. Next.js Web 需要写的代码

### 5.1 公开页

| 页面 | 路由建议 | 说明 |
| --- | --- | --- |
| 帖子详情 | `/p/[postId]` | SEO、分享、打开 App |
| 宠物分享卡 | `/pet/[petId]` | 宠物资料、精选动态 |
| 问答详情 | `/q/[questionId]` | 长尾搜索、风险提示 |
| 走失卡占位 | `/lost/[lostId]` | MVP 可先做占位和分享结构 |
| 城市页 | `/city/[cityCode]` | 城市内容、地点、服务 |

### 5.2 商家后台

| 页面 | 路由建议 |
| --- | --- |
| 商家登录 | `/merchant/login` |
| 商家资料 | `/merchant/profile` |
| 服务管理 | `/merchant/listings` |
| 线索列表 | `/merchant/leads` |
| 线索详情 | `/merchant/leads/[leadId]` |

### 5.3 运营后台

| 页面 | 路由建议 |
| --- | --- |
| 运营登录 | `/admin/login` |
| 数据看板 | `/admin/dashboard` |
| 审核队列 | `/admin/moderation` |
| 举报处理 | `/admin/reports` |
| 用户管理 | `/admin/users` |
| 商家审核 | `/admin/service-providers` |
| 地点管理 | `/admin/places` |
| 线索查看 | `/admin/leads` |

### 5.4 Web 共享代码

| 模块 | 说明 |
| --- | --- |
| `lib/api-client` | 调后端接口 |
| `lib/auth` | 后台登录态 |
| `components/admin-table` | 后台列表、筛选、分页 |
| `components/moderation-card` | 审核卡片 |
| `components/public-post` | 公开帖子展示 |
| `components/open-app-banner` | 打开 App 引导 |

## 6. 异步任务和后台 Job

| Job | 触发 | 要写的代码 |
| --- | --- | --- |
| 内容审核任务 | 用户发布内容后 | 创建审核任务、调用云审核、更新状态 |
| 媒体处理 | 图片上传完成后 | 去 EXIF、生成缩略图、记录宽高 |
| 通知分发 | 评论、点赞、关注、提醒 | 写站内信、发送 Push |
| 提醒扫描 | 定时任务 | 找到到期提醒，生成通知 |
| Feed 计数更新 | 互动事件 | 更新点赞数、评论数、收藏数 |
| 搜索索引 | 内容审核通过后 | 写入 PostgreSQL FTS 字段 |
| 线索超时 | 商家未响应 | 标记超时、通知运营 |
| 数据看板聚合 | 每小时/每天 | 汇总注册、建档、发布、线索、留存 |

## 7. 第三方能力接入

| 能力 | MVP 接入点 |
| --- | --- |
| 短信 | 验证码登录 |
| 对象存储 | 图片上传、头像上传 |
| CDN | 公开图片访问 |
| 内容审核 | 图片、文本、评论、问答 |
| Push | 评论、点赞、关注、提醒 |
| 地图/行政区 | 城市和行政区选择，首版不做精确地图社交 |
| 错误监控 | App、Web、API 异常 |
| 数据分析 | 埋点和漏斗 |

## 8. 测试需要写的代码

### 后端测试

| 测试 | 范围 |
| --- | --- |
| 单元测试 | 手机号登录、权限判断、宠物归属、内容状态流转 |
| 接口测试 | 注册、建档、发布、互动、提醒、线索、举报 |
| 数据库测试 | 迁移、索引、唯一约束、软删除 |
| 审核测试 | 发布后待审、通过可见、拒绝不可见 |
| 权限测试 | 用户只能改自己的宠物，商家只能看自己的线索 |

### App 测试

| 测试 | 范围 |
| --- | --- |
| Widget 测试 | 主要卡片、表单、空状态、错误状态 |
| 集成测试 | 登录建档、发帖、评论、创建提醒、提交线索 |
| 权限测试 | 相册、相机、通知、位置拒绝后的体验 |

### Web 测试

| 测试 | 范围 |
| --- | --- |
| 公开页渲染 | 帖子、宠物、问答、城市页 SSR |
| 后台权限 | 未登录跳转、商家和运营权限隔离 |
| 审核流程 | 审核通过/拒绝/封禁 |

## 9. 开发顺序

### Sprint 0：工程地基

1. 建 monorepo。
2. 建 Go API、Flutter、Next.js 三个项目。
3. 写 Docker Compose：PostgreSQL、Redis、对象存储模拟服务。
4. 写用户、宠物、内容核心表迁移。
5. 写 OpenAPI 初稿。
6. 打通登录、鉴权、上传签名、健康检查。

### Sprint 1：双档案和首页骨架

1. 手机号验证码登录。
2. 主人档案 CRUD。
3. 宠物档案 CRUD。
4. App 新手引导。
5. App 首页 Tab 和我的页。
6. Web 公开页基础布局。

### Sprint 2：内容发布和互动

1. 图片上传和媒体表。
2. 图文发布、关联宠物、话题。
3. 最新流、城市流、关注流。
4. 帖子详情。
5. 点赞、收藏、评论、关注。
6. 互动通知。
7. 基础审核状态。

### Sprint 3：附近、问答、健康

1. 附近城市页、附近宠物、地点列表。
2. 问答发布、回答、收藏。
3. 健康记录。
4. 提醒创建、提醒扫描、Push/站内通知。
5. 医疗风险提示和举报入口。

### Sprint 4：服务线索和后台

1. 商家、服务项目、服务列表。
2. 用户提交线索。
3. 商家后台查看和处理线索。
4. 运营后台审核内容、处理举报、管理商家。
5. 数据看板基础指标。

### Sprint 5：灰度上线

1. 核心埋点。
2. 错误监控。
3. 隐私、协议、注销、删除。
4. App 打包和测试分发。
5. 种子数据导入。
6. 性能、权限、安全回归。

## 10. P0 代码验收标准

| 验收项 | 对应代码 |
| --- | --- |
| 用户能登录和注销 | Auth API、App 登录页、设置页 |
| 用户能创建主人和宠物档案 | User/Pet API、App 引导、我的页 |
| 用户能发布图文并关联宠物 | Content API、上传、发布页 |
| 用户能浏览首页、城市流和附近页 | Feed API、Nearby API、App Tab |
| 用户能互动并收到通知 | Social API、Notification API、App 消息页 |
| 用户能记录健康和设置提醒 | Health API、Reminder Job、App 健康中心 |
| 用户能提问和回答 | QA API、App 问答页 |
| 用户能浏览服务并提交线索 | Service API、Lead API、App 服务页 |
| 运营能审核和处理举报 | Admin API、Web 运营后台 |
| 商家能处理线索 | Merchant API、Web 商家后台 |
| Web 公开页可分享 | Next.js 公开路由 |
| 关键行为可统计 | Analytics API、事件埋点 |

## 11. 暂时不要写的代码

为了控制 MVP 范围，以下代码先不要写：

1. 自营商城、购物车、订单、库存、退款。
2. 担保支付、平台赔付、交易仲裁。
3. 复杂 IM、群聊、语音、视频通话。
4. 直播、长视频、复杂创作者后台。
5. 精确地图社交、实时定位共享。
6. AI 诊疗建议、处方、医疗判断。
7. 多城市复杂运营系统。
8. 微服务拆分、服务网格、复杂推荐模型。
9. 商家 SaaS 收费、发票、复杂套餐。
10. 海外合规和多语言版本。

## 12. 最小可运行版本切法

如果要最快看到一个能演示的版本，可以先切一个 Demo 版：

1. 后端只写用户、宠物、帖子、评论、点赞、健康记录、服务线索。
2. App 只写登录、建档、首页、发布、宠物主页、健康记录、服务列表。
3. Web 只写运营后台审核列表和帖子公开页。
4. 附近页先用城市字段和种子数据，不接真实地图。
5. 审核先人工后台流转，云审核接口用适配器预留。

Demo 版能证明主链路：登录 -> 建宠物 -> 发宠物动态 -> 互动 -> 记录健康 -> 找服务 -> 后台审核/查看线索。

