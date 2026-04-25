# PawPaw MVP Demo

这是根据 `mvp.md` 和 `code.md` 实现的第一版可运行 Demo。

当前版本优先验证主链路：

1. 创建宠物档案
2. 发布宠物动态
3. 点赞、收藏、举报
4. 记录健康事项
5. 浏览附近和本地服务
6. 提交服务线索
7. 在运营后台处理审核和线索

## 本地运行

```bash
npm install
npm run dev
```

打开终端输出的本地地址即可访问 Web Demo。

## 构建

```bash
npm run build
```

构建产物会输出到 `dist/`，可部署到 GitHub Pages、Vercel、Netlify 或任意静态托管服务。

## 后端骨架

`apps/api/cmd/api/main.go` 目前提供最小健康检查：

```bash
go run ./apps/api/cmd/api
curl http://localhost:8080/healthz
```

后续可以按 `code.md` 中的模块逐步替换 Web Demo 的本地状态。
