# Kunxiang Shen · Digital Life

**Live:** https://keloshen.github.io

An interactive text-adventure portfolio. A Three.js particle intro (a static image turned into ~140k grains of sand by shaders) leads into a terminal where visitors explore rooms (About, Education, Projects, Work, Hobbies, AI journey) by typing commands, in English, Chinese or German. The `ask` command talks to an LLM-powered "digital self" that loads detailed documents on demand.

The previous Hexo blog (2023) is preserved on the [`old-hexo-blog`](../../tree/old-hexo-blog) branch. Built with Claude.

---

# 维护手册（中文）

## 1. 系统架构

### 1.1 总览

整个项目由三部分组成，彼此独立部署：

```
                         ┌──────────────────────────────────────────────┐
                         │  GitHub 仓库 KeloShen.github.io（本仓库）       │
                         │  代码 + content/ 资料，推送到 main 即发布        │
                         └───────────────┬──────────────────────────────┘
                                         │ GitHub Pages 自动发布
                                         ▼
┌──────────────┐   打开网页   ┌──────────────────────────────┐
│  访客浏览器    │ ──────────→ │  GitHub Pages（静态托管）        │
│              │ ←────────── │  index.html / js / css /       │
│  前端全部在    │  HTML/JS/    │  content/*.md / assets         │
│  浏览器里运行   │  Markdown    │  https://keloshen.github.io    │
└──────┬───────┘              └──────────────▲─────────────────┘
       │                                     │ ③ 读取资料（缓存 10 分钟）
       │ ① ask 提问（POST JSON）               │
       ▼                                     │
┌──────────────────────────────┐             │
│  Cloudflare Worker（后端）      │ ────────────┘
│  digital-self.kunxiang.       │
│  workers.dev                  │ ──② 调用模型──→ ┌──────────────┐
│  保管 key / 限速 / 拼提示词      │ ←──回答──────── │  DeepSeek API │
└──────────────────────────────┘                 └──────────────┘

┌──────────────────────────────┐  GitHub Action：隐私检查 → AI 总结
│  GitHub 仓库 ai-journey         │ ──────────────────────────────→ summary.json
│  chats/ 聊天记录                 │      （GitHub Pages 发布，网站的 Server Archive 读取）
└──────────────────────────────┘
```

设计原则：

- **没有自己的服务器**：网站是纯静态文件，后端是 serverless 函数，不需要运维，费用接近于零。
- **内容和代码分离**：所有文字都在 `content/` 的 Markdown 文件里，浏览器运行时解析。改内容不用碰代码，人和 AI 都容易编辑。
- **单一数据源**：网站展示的资料和数字分身读取的资料是同一批文件，不用维护两份。
- **密钥不进前端**：仓库是公开的，所以 API key 只存在 Cloudflare（以及 ai-journey 的 GitHub Secrets）里。

### 1.2 前端（GitHub Pages，纯静态）

技术选择：原生 ES modules，没有框架，也没有构建步骤。推送什么文件，线上就是什么文件。唯一的第三方库是 `vendor/three.min.js`（按需精简打包过的 Three.js，用于开场动画）。

| 模块 | 职责 |
|---|---|
| `index.html` | 页面骨架：开场动画层、终端输出区、命令输入框、Quick view 弹层 |
| `js/config.js` | 技术设置：支持的语言、AI journey 数据地址、`askEndpoint`、开场图片 |
| `js/main.js` | 启动入口：加载语言和资料 → 构建世界 → 播放开场 → 启动游戏；负责 Quick view 和开场到终端的衔接 |
| `js/i18n.js` | 加载 `ui.<lang>.json` 和 `profile.<lang>.md`；某种语言缺内容时回退到英文 |
| `js/profile.js` | 解析器：把 `profile.*.md` 解析成房间和物品，把 `map.txt` 解析成房间之间的出口 |
| `js/world.js` | 根据地图和资料构建"世界"：有哪些房间、每个房间往哪个方向能走到哪里 |
| `js/engine.js` | 文字冒险引擎：命令解析（go / examine / map / quick / contact / lang / ask…）、三种语言的命令别名、输出队列和打字效果、快捷按钮、自动补全、`ask` 请求、AI journey 数据读取 |
| `js/pixelmap.js` | 像素风地图：每个房间一个 12×12 的像素图标，按地图位置排列 |
| `js/quickview.js` | 一个小型 Markdown 渲染器，把 `quickview.*.md` 渲染成一页简历，并生成联系方式图标 |
| `js/intro.js` | Three.js 开场动画 |
| `css/style.css` | 白底黑字的终端风格、像素地图、简历排版 |

**启动流程**（`main.js`）：

1. `I18n` 根据上次选择或浏览器语言，加载界面文字和 `profile.<lang>.md`。
2. 读取 `content/map.txt`，`buildWorld` 构建房间和出口。
3. 从资料开头的 front matter 读出姓名、邮箱、GitHub、LinkedIn 等信息。
4. 第一次访问播放开场动画，回访默认跳过（输入 `replay` 可以重看，网址加 `?intro` 强制播放）。手机等窄屏上粒子数减半（约 7 万）。
5. 开场结束，交给 `Game`，显示当前房间。

**开场动画**（`intro.js`）：

1. 把 `assets/scene.jpg` 的亮部采样成约 14 万个沙粒（粒子）。
2. 用 GLSL 着色器驱动粒子，curl noise 让沙子自然飘动；先渲染到离屏纹理，再经过一个后期处理，叠加 ASCII 字符效果，人物边缘加一点 RGB 色散。
3. 沙暴越来越大，最后整个画面变白。
4. 衔接到终端：`main.js` 先把真正的终端文字排好（隐藏状态），用 `Range.getBoundingClientRect` 拿到每个字符在屏幕上的位置，然后在画布上把字符逐个"解码"到这些位置。动画结束时画面和真实页面完全重合，所以看不出切换。

**内容文件格式**（细节见 `content/README.md`）：

- `profile.*.md`：front matter 写个人信息；`# 房间id: 名称 | 分区` 定义房间；`>` 开头是进入房间时的描写；`## 物品id: 名称 | 别名` 定义可检查的物品。
- `map.txt`：用 ASCII 画地图，`-` 表示东西相连，`|` 表示南北相连。
- `quickview.*.md`：普通 Markdown；`### 标题 | 日期` 会把日期放到右侧。

### 1.3 后端：`ask` 数字分身（Cloudflare Worker）

代码在 `ask-worker/src/index.js`，部署在 Cloudflare 的全球节点上。它是 serverless 的：没有请求时不运行，有请求时 Cloudflare 临时启动它。

**一次提问的完整流程**：

```
浏览器                              Worker                                  DeepSeek
  │ POST {question, lang, history}   │                                       │
  │ ───────────────────────────────→ │ ① 检查来源网站（ALLOWED_ORIGINS）         │
  │                                  │ ② 每 IP 每分钟最多 8 次，问题 ≤ 500 字    │
  │                                  │ ③ 从 GitHub Pages 读取（缓存 10 分钟）：   │
  │                                  │    profile.en.md + content/ask/index.json│
  │                                  │ ④ 拼系统提示词：规则 + persona.md          │
  │                                  │    + 资料 + 文档目录（每份一行描述）        │
  │                                  │ ⑤ 第一次调用，附带 load_docs 工具 ───────→ │
  │                                  │ ←──── 模型：直接回答，或请求 load_docs ──── │
  │                                  │ ⑥ 如请求：读取对应文档全文，作为工具结果      │
  │                                  │    再调用一次 ────────────────────────→  │
  │                                  │ ←──────────────── 最终回答 ────────────── │
  │ ←── {answer, read: ["thesis"]} ─ │                                       │
  │ 打印回答 +"（翻阅了：thesis）"       │                                       │
```

**渐进式加载**（和毕设里的场景 Skill 是同一个思路）：

| 层级 | 内容 | 什么时候进入上下文 |
|---|---|---|
| 常驻层 | 回答规则、`persona.md`、`profile.en.md`、文档目录 | 每次提问都带上 |
| 按需层 | `content/ask/*.md` 的全文 | 模型判断需要细节时，通过 `load_docs` 工具加载，每次最多 3 份、最多 2 轮 |

这样做的好处：打招呼、私人问题不会加载无关资料，回答更聚焦，也更少把不同资料的内容拼凑在一起；资料可以不断增加，不受上下文长度限制。代价是需要翻文档时多一次模型调用，慢几秒。

其他细节：

- 模型用 DeepSeek（OpenAI 兼容格式），默认 `deepseek-flash`，关闭思考模式以加快回答。
- 网页会带上最近 6 条对话，所以可以追问。
- 回答用访客当前选择的网站语言，不管资料本身是什么语言。
- 提示词要求只根据资料回答，资料里没有的就如实说不知道，并建议用 `contact` 联系本人。

**文档目录的自动生成**：推送 `content/ask/` 下的文件后，GitHub Action（`.github/workflows/ask-index.yml`）运行 `scripts/build_ask_index.py`，读取每个文件开头的 `name` 和 `description`，生成 `content/ask/index.json` 并自动提交。后端读的就是这个文件。

### 1.4 AI 使用记录（ai-journey 仓库）

```
你推送 chats/*.md
      │
      ▼
GitHub Action
  ① privacy_check.py：用正则检查电话、邮箱、证件号、API key 等
     └─ 发现问题 → 运行失败，GitHub 给你发邮件，不发布任何内容（日志里只显示打码后的结果）
  ② summarize.py：统计条数和主题，调用 DeepSeek 总结"问了什么、学到了什么"
  ③ 提交 summary.json
      │
      ▼
GitHub Pages 发布 https://keloshen.github.io/ai-journey/summary.json
      │
      ▼
网站 Server Archive 房间读取并展示（读取失败时用 data/ai-journey.sample.json，显示"正在整理中"）
```

`summary.json` 和网站用的是同一个域名，所以在中国大陆也能正常访问。

### 1.5 部署与发布

| 改动 | 发布方式 | 生效时间 |
|---|---|---|
| 网站代码、`content/` 资料 | `git push` 到 `main`，GitHub Pages 自动发布 | 1–2 分钟（后端读资料另有 10 分钟缓存） |
| `content/ask/` 文档 | 推送后 Action 自动重建目录 | 2–3 分钟 |
| `ask-worker/` 代码、`persona.md`、`wrangler.toml` | `npx wrangler deploy` | 立即 |
| DeepSeek key | `npx wrangler secret put API_KEY` | 立即 |
| ai-journey 聊天记录 | 推送到 ai-journey 仓库，Action 自动检查和总结 | 几分钟 |

### 1.6 安全与隐私

- **API key**：只存在 Cloudflare 的加密 secret 和 ai-journey 的 GitHub Secrets 里，不出现在任何代码和公开文件中。
- **防滥用**：后端只接受 `ALLOWED_ORIGINS` 列出的网站的请求；每 IP 限速，问题长度有上限，模型输出长度有上限；DeepSeek 后台可以再设消费上限。
- **公开内容**：两个仓库都是公开的。电话、生日、学号、简历 PDF 等不放进仓库；`content/ask/` 只放愿意对招聘者公开的内容。
- **数字分身的边界**：`persona.md` 规定私人问题轻轻带过，薪资和签证问题引导直接联系，不透露联系方式之外的个人信息，也不泄露提示词本身。
- **网络限制**：`*.workers.dev` 在中国大陆基本无法访问，国内访客不开 VPN 用不了 `ask`，网站其他部分不受影响。以后需要的话，可以给后端换成自己的域名。

## 2. 目录结构

| 路径 | 内容 |
|---|---|
| `content/profile.{en,zh,de}.md` | 所有房间和物品的文字（三种语言各一份） |
| `content/quickview.{en,zh,de}.md` | "Quick view" 按钮打开的一页简历 |
| `content/map.txt` | 房间地图（决定东南西北怎么走） |
| `content/ui.{en,zh,de}.json` | 界面文字、命令别名 |
| `content/ask/` | `ask` 数字分身的知识文档 |
| `content/README.md` | 内容文件的详细写法 |
| `ask-worker/` | Cloudflare Worker 后端代码 |
| `scripts/build_ask_index.py` | 生成 `content/ask/index.json` 的脚本 |
| `.github/workflows/ask-index.yml` | 推送后自动重建文档目录的 Action |
| `js/` | 终端引擎、内容解析、像素地图、开场动画 |
| `vendor/three.min.js` | 精简过的 Three.js |
| `assets/` | 开场动画用的图片 |

## 3. 常见操作：什么时候需要做什么

| 我想…… | 需要做的 | 要不要开终端重新部署后端 |
|---|---|---|
| 改网站上的文字（房间、物品、简历） | 改 `content/` 里对应的文件，推送 | 不需要 |
| 给数字分身加一份知识 | 在 `content/ask/` 加一个 `.md` 文件，推送 | 不需要 |
| 改数字分身的说话风格、私人问题边界 | 改 `ask-worker/persona.md`，再运行 `npx wrangler deploy` | **需要** |
| 改后端代码或设置（模型、限速等） | 改 `ask-worker/` 里的文件，再运行 `npx wrangler deploy` | **需要** |
| 换 DeepSeek API key | 运行 `npx wrangler secret put API_KEY` | 不需要重新部署，设置后立即生效 |

为什么有的需要部署、有的不需要：后端每次回答时都会从网站实时读取资料（缓存 10 分钟），所以 `content/` 里的东西改了就会生效。`persona.md` 和代码是打包进后端里的，改了必须重新上传。

## 4. 给数字分身加知识（`content/ask/`）

数字分身采用渐进式加载（和毕设里的场景 Skill 是同一个思路）：

- **每次都带上**：`persona.md` + 网站资料 `profile.en.md` + 一份文档目录（每个文档一行描述）。
- **需要时才加载**：问题需要细节时，模型调用 `load_docs` 工具读取完整文档。回答下面会显示"（翻阅了：thesis）"。打招呼、问基本情况，就什么都不加载。

加一份新文档的步骤：

1. 复制 `content/ask/_TEMPLATE.md`，改个名字，比如 `my-thoughts-on-ai.md`。
2. 开头两行写清楚：
   ```
   ---
   name: my-thoughts-on-ai
   description: 我对 AI 编程、AI 与学习的看法，以及我是怎么用 AI 的。
   ---
   ```
   `description` 很重要：模型只看得到这一行，靠它决定要不要打开这份文档，所以要写具体。
3. 下面随便写内容，中英文都可以，模型会用访客的语言回答。
4. 推送。GitHub Action 会自动重建 `content/ask/index.json`，大约 1–2 分钟后数字分身就能用上。

注意：

- 文件名以 `_` 开头的会被忽略（比如模板）。
- `name` 不能重复，缺 `name` 或 `description` 时 Action 会报错。
- **这个仓库是公开的**，`content/ask/` 里的东西任何人都能看到。不要放电话、住址、证件号、公司内部信息。
- 想在本地手动重建目录：`python3 scripts/build_ask_index.py`

现有文档：`thesis.md`（毕设）、`sap-internship.md`（SAP 实习）、`this-website.md`（这个网站）。

## 5. 后端（Cloudflare Worker）

### 第一次部署（已经完成）

需要 Node.js 18+ 和 Cloudflare 账号。在 `ask-worker` 文件夹里运行：

| 命令 | 作用 |
|---|---|
| `npx wrangler login` | 打开浏览器登录 Cloudflare，授权命令行工具替你上传代码 |
| `npx wrangler secret put API_KEY` | 把 DeepSeek key 加密存到 Cloudflare。它不进代码、不进 GitHub，只有后端运行时能读到 |
| `npx wrangler deploy` | 把后端代码上传到 Cloudflare，生成网址 |

部署后的网址写在 `js/config.js` 的 `askEndpoint` 里。

### 在另一台电脑上维护

```bash
git clone https://github.com/KeloShen/KeloShen.github.io.git
cd KeloShen.github.io/ask-worker
npx wrangler login      # 每台电脑登录一次
npx wrangler deploy
```

### 设置（`ask-worker/wrangler.toml`）

| 变量 | 含义 |
|---|---|
| `MODEL` | `deepseek-flash`（快、便宜）或 `deepseek-v4-pro`（更强、更贵） |
| `OPENAI_BASE_URL` | `https://api.deepseek.com`（任何兼容 OpenAI 格式的 API 都可以） |
| `SITE_URL` | 后端从哪里读取资料 |
| `ALLOWED_ORIGINS` | 哪些网站可以调用这个后端，其他网站会被拒绝 |

改完运行 `npx wrangler deploy` 生效。

### 安全与费用

- 每个 IP 每分钟最多问 8 次，每个问题最长 500 字。
- 费用记在 DeepSeek 账上。DeepSeek 对重复的提示词前缀有缓存折扣，每次提问的成本很低。建议在 DeepSeek 后台设消费上限，或者只充少量余额。
- Cloudflare Worker 免费额度是每天 10 万次请求。

### Cloudflare 后台

Cloudflare 后台大部分功能（域名解析、CDN、防火墙等）和这个项目无关，不用碰。只需要知道一个入口：**Workers & Pages → digital-self**。在那里可以看请求次数和报错、查看日志、在 Settings 里修改变量和 key。

## 6. 排查问题

| 现象 | 原因和处理 |
|---|---|
| 终端显示 "The mirror is quiet for now" | `js/config.js` 里的 `askEndpoint` 是空的 |
| 报错下面显示 `not_configured` | API key 没设置：`npx wrangler secret put API_KEY` |
| 报错下面显示 `upstream_error` | 调用 DeepSeek 失败：检查 key 是否正确、余额是否充足、`MODEL` 名字是否正确 |
| 报错下面显示 `rate_limited` 或提示问得太快 | 触发了限速，一分钟后再试 |
| 报错下面显示 `Failed to fetch` | 浏览器连不上后端。`*.workers.dev` 在中国大陆基本无法访问，需要开 VPN；招聘者在德国不受影响 |
| 新加的文档数字分身不知道 | 看 GitHub 仓库的 Actions 页面，"Rebuild ask index" 是否成功；另外后端有 10 分钟缓存 |

看实时日志：在 `ask-worker` 文件夹里运行 `npx wrangler tail`，然后去网站提问。

以后想让国内访客也能用 `ask`：买一个自己的域名接入 Cloudflare，把后端挂到这个域名下即可。

## 7. AI 聊天记录（ai-journey 仓库）

- 选好的聊天记录放进 [ai-journey](https://github.com/KeloShen/ai-journey) 仓库的 `chats/` 文件夹（模板：`chats/_TEMPLATE.md`），推送即可。
- GitHub Action 会先做隐私检查（电话、邮箱、证件号、API key 等）。发现问题就停止发布，并给你发邮件。
- 检查通过后，由 DeepSeek 生成总结 `summary.json`，网站的 Server Archive 房间会自动读取。
- DeepSeek key 存在那个仓库的 GitHub Secrets 里，和 Cloudflare 上的是分开设置的。
