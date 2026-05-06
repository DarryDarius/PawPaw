# PawPaw iOS MVP 开发方案

## 目标

PawPaw iOS MVP 的目标是做出一个可以通过 TestFlight 给小范围真实用户试用的 iOS Alpha，而不是把网页简单套壳成 App。

第一版聚焦用户端核心闭环：

- 登录
- 创建主人资料
- 创建狗狗资料
- 查看推荐狗狗
- Like / Pass / Block / Report
- 双向 Like 后生成 Match
- Match 后聊天
- 创建 Playdate
- 完成 Playdate 后提交 Feedback
- 基础安全控制

后台 Admin 第一版继续保留在 Web，不放进 iOS App。

## 不做范围

第一版暂不做：

- 复杂地图导航
- 付费会员
- 社区动态流
- 多狗复杂推荐策略
- 视频/语音聊天
- AI 聊天助手
- 高级审核系统
- 完整运营后台 App

## 推荐技术栈

```txt
Expo
React Native
TypeScript
Expo Router
TanStack Query
React Hook Form
Zod
expo-secure-store
expo-image
expo-notifications
react-native-gesture-handler
react-native-reanimated
react-native-safe-area-context
```

UI 建议：

```txt
NativeWind + 自建设计系统
```

原因：

- 当前 Web 已经采用 React + TypeScript + Tailwind 思路。
- NativeWind 的心智模型接近 Tailwind，迁移学习成本较低。
- 移动端不建议直接照搬 Web 的 shadcn/ui，需要做 React Native 原生组件。
- Expo 后续可以同时支持 iOS 和 Android。

## 复用与重写

可复用：

- 现有 Go API
- PostgreSQL 数据模型
- 推荐、Swipe、Match、Chat、Playdate、Safety 的业务流程
- TypeScript 类型定义
- API client 思路
- TanStack Query 数据请求模式

需要重写：

- iOS UI 组件
- 底部 Tab 导航
- Swipe 手势
- 聊天键盘适配
- 图片加载体验
- 表单输入体验
- iOS 安全区适配
- TestFlight 打包和发布流程

迁移成本判断：

```txt
后端复用：85%-95%
业务逻辑复用：60%-70%
Web UI 复用：20%-30%
数据类型/API client 复用：70%-80%
整体迁移成本：中等
```

## App 信息架构

底部 Tab：

```txt
Discover
Matches
Playdates
Profile
Safety
```

独立页面：

```txt
Login
Owner Onboarding
Dog Onboarding
Chat Detail
New Playdate
Feedback
Report
```

## 建议目录结构

```txt
apps/mobile/
  app/
    _layout.tsx
    index.tsx
    login.tsx
    onboarding/
      owner.tsx
      dog.tsx
    (tabs)/
      discover.tsx
      matches.tsx
      playdates.tsx
      profile.tsx
      safety.tsx
    chat/
      [conversationId].tsx
    playdate/
      new.tsx

  src/
    api/
      client.ts
      auth.ts
      profile.ts
      pets.ts
      recommendations.ts
      swipes.ts
      matches.ts
      messages.ts
      playdates.ts
      safety.ts
    components/
      DogCard.tsx
      MatchRow.tsx
      PlaydateCard.tsx
      ScoreBadge.tsx
      SafetyBadge.tsx
      EmptyState.tsx
      Screen.tsx
      FormField.tsx
    design/
      colors.ts
      spacing.ts
      typography.ts
    hooks/
      useSession.ts
      useMe.ts
    types/
      api.ts
```

## Mobile Sprint 0：工程地基

目标：iOS 项目能跑起来，并能访问现有后端。

要做：

- 新建 `apps/mobile`
- 初始化 Expo + TypeScript
- 接入 Expo Router
- 配置 iOS simulator / Expo Go
- 建立 API client
- 建立 session store
- token 使用 `expo-secure-store`
- 配置 local / staging / production API base URL
- 建立基础 Screen、Button、Input、Card、Badge 组件
- 接入 TanStack Query
- 接入统一错误提示

API：

```txt
GET /healthz
GET /api/v1/me
```

验收：

- iPhone 模拟器可启动
- Expo Go 可打开
- 能访问本地 API
- 能保存和读取 token
- 关闭 App 后 session 仍存在
- API 错误能统一展示

## Mobile Sprint 1：Auth + Onboarding

目标：用户能创建自己和狗狗。

要做：

- Login 页面
- Owner profile 表单
- Dog profile 表单
- Profile 页面
- 资料完整度判断
- 未完成资料时禁止进入 Discover
- 支持 logout

API：

```txt
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET /api/v1/me
PATCH /api/v1/me
POST /api/v1/pets
GET /api/v1/me/pets
PATCH /api/v1/pets/:id
PATCH /api/v1/pets/:id/profile
```

验收：

- 新用户可登录
- 可创建主人资料
- 可创建至少一只狗狗
- Profile complete 后进入 Discover
- Profile incomplete 时显示 onboarding
- logout 后回到登录页

## Mobile Sprint 2：Discover + Swipe

目标：推荐流可真实使用。

要做：

- Discover 页面
- 推荐卡片
- 展示狗狗照片、名字、品种、距离、score、reason
- Like / Pass 按钮
- 左右滑手势
- 下拉刷新
- Block 入口
- Report 入口
- 空状态
- loading 状态
- API 错误状态

API：

```txt
GET /api/v1/recommendations/feed
POST /api/v1/swipes
GET /api/v1/swipes/me
POST /api/v1/reports
POST /api/v1/blocks
```

验收：

- 推荐列表按 score 排序
- 推荐卡片展示 score 和 reasons
- Like/Pass 后候选消失
- 重复点击不会重复写 swipe
- Block 后用户不再出现
- Report 进入后台队列
- 没有候选时有清晰空状态

## Mobile Sprint 3：Match + Chat

目标：双向喜欢后能沟通。

要做：

- Matches 列表
- Match 详情
- Chat 页面
- 消息列表
- 发送消息
- 输入框键盘适配
- Unmatch
- 未 match 不允许聊天
- 从 Match 进入创建 Playdate

API：

```txt
GET /api/v1/matches
GET /api/v1/matches/:id
POST /api/v1/matches/:id/unmatch
GET /api/v1/conversations/:id/messages
POST /api/v1/conversations/:id/messages
```

验收：

- 双向 Like 只生成一个 match
- Match 后才能发消息
- 消息发送后列表更新
- 重新进入 Chat 能看到历史消息
- Unmatch 后聊天入口失效

## Mobile Sprint 4：Playdate + Feedback

目标：完成线下见面闭环。

要做：

- Playdates 列表
- 创建 Playdate
- 地点选择
- 时间选择
- 邀请对方
- 确认 / 取消 / check-in
- 完成后提交 Feedback
- 只允许公开地点
- 不展示精确地址

API：

```txt
GET /api/v1/locations
GET /api/v1/playdates
GET /api/v1/playdates/:id
POST /api/v1/playdates
POST /api/v1/playdates/:id/respond
POST /api/v1/playdates/:id/cancel
POST /api/v1/playdates/:id/check-in
POST /api/v1/playdates/:id/feedback
```

验收：

- Match 后可创建 Playdate
- 只能选择公开地点
- 双方状态可追踪
- Confirm / Cancel / Check-in 可用
- Completed 后可提交 Feedback
- Feedback 保存后刷新列表

## Mobile Sprint 5：Safety + TestFlight

目标：可以给真实用户小范围试用。

要做：

- Safety 页面
- Blocked users 列表
- Unblock
- Report 安全入口
- 安全提示文案
- App icon
- Splash screen
- iOS 权限说明
- EAS Build
- TestFlight 发布
- 真机测试

API：

```txt
GET /api/v1/blocks
POST /api/v1/blocks
DELETE /api/v1/blocks/:id
POST /api/v1/reports
```

验收：

- 真机可安装
- TestFlight 可分发
- 用户可完成核心流程
- Block 用户不会重新出现
- Report 可提交
- 基础崩溃和错误能被定位

## 预计时间

可试用 iOS Alpha：

```txt
Sprint 0：2-3 天
Sprint 1：3-5 天
Sprint 2：4-6 天
Sprint 3：4-6 天
Sprint 4：4-6 天
Sprint 5：3-5 天

总计：约 3-5 周
```

快速移动 Demo：

```txt
约 7-10 天
```

## 第一版最小交付范围

建议第一版 iOS MVP 只交付：

```txt
Login
Profile
Dog Profile
Discover
Swipe
Matches
Chat
Playdates
Feedback
Block
Report
TestFlight
```

Admin 继续使用现有 Web 后台。

## 后续增强

MVP 之后再考虑：

- Push notification
- 图片上传
- 地图选点
- Apple 登录
- 更完整的举报审核
- 更精细的推荐解释
- 多狗管理
- Android 版本
- App Store 正式发布
