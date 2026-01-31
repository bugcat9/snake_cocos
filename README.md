# 贪吃蛇背单词 (Snake Vocabulary)

基于 Cocos Creator 3.8 开发的贪吃蛇游戏，结合英语词汇学习——需按正确顺序吃掉字母才能过关。

## 运行方式

1. 使用 [Cocos Creator 3.8+](https://www.cocos.com/creator) 打开项目
2. 在编辑器中点击 **预览** 或 **运行** 按钮
3. 或通过 **项目** → **构建发布** 打包到各平台

## 操作说明

- **方向键**：控制蛇的移动方向（上 / 下 / 左 / 右）

## 游戏规则

- 屏幕上会显示一个单词及其释义
- 需要按单词的字母顺序依次吃掉对应字母的食物
- 吃错字母或撞墙则游戏结束
- 正确吃完一个单词的所有字母后可获得分数，并进入下一个单词

## 项目结构

```
assets/
├── script/          # 游戏逻辑脚本
│   ├── GameControl.ts    # 游戏主控、食物生成
│   ├── HeadControl.ts    # 蛇头控制与移动
│   ├── FoodControl.ts    # 食物表现
│   ├── MazeControl.ts    # 迷宫/墙壁
│   ├── AudioMgr.ts       # 音频管理
│   └── ...
├── scence/          # 场景
│   ├── Start.scene       # 开始界面
│   ├── Main.scene        # 游戏主场景
│   └── GameOver.scene    # 结束界面
├── prefab/          # 预制体（蛇身、食物、迷宫）
├── resources/       # 资源（图片、音效、词库 word.json）
└── animation/       # 蛇头方向动画
```

## 技术栈

- Cocos Creator 3.8.3
- TypeScript
- 2D 物理引擎（碰撞检测）

## GitHub Pages 部署

项目已配置 GitHub Actions：推送到 `main` 分支后，会自动将 Web 端构建产物部署到 GitHub Pages。

### 使用步骤

1. **在本地构建 Web 端**
   - 用 Cocos Creator 打开项目 → **项目** → **构建发布**
   - 选择 **Web 桌面** 或 **Web 手机**，点击构建
   - 构建产物在 `build/web-desktop` 或 `build/web-mobile`

2. **让仓库包含构建产物（二选一）**
   - **方式 A**：在 `.gitignore` 中取消忽略 `build/`（或只保留 `build/web-desktop` 不被忽略），然后提交并推送 `build` 目录
   - **方式 B**：使用带 Cocos Creator 的自托管 Runner，在 workflow 中增加「命令行构建」步骤，则无需提交 build 目录

3. **开启 GitHub Pages**
   - 仓库 **Settings** → **Pages** → **Build and deployment**
   - **Source** 选择 **Deploy from a branch**
   - **Branch** 选择 **gh-pages**，目录选 **/ (root)**，保存

推送代码后，Actions 会运行并把 `build/web-desktop`（或 `build/web-mobile`）部署到 Pages。若默认分支是 `master`，请把 `.github/workflows/deploy-web-to-pages.yml` 里的 `branches` 改为 `master`。

## 词库

单词数据存放在 `assets/resources/word.json`，可自行编辑以添加或修改词汇。
