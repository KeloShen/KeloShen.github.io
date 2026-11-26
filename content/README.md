# 内容编辑指南 / Content guide

网站上所有关于你的文字都在这个文件夹里。改内容不需要碰任何代码，人可以直接改，AI 也可以照着这份说明改。

| 文件 | 内容 | 多久改一次 |
|---|---|---|
| `profile.en.md` | **你的全部个人内容**（英文，主版本） | 经常 |
| `profile.zh.md` / `profile.de.md` | 同样的内容，中文 / 德语版 | 跟着英文版改 |
| `quickview.*.md` | **速览页面**：一页式简历（教育、经历、项目、技能、奖项），加上主页探索说明 | 简历更新时 |
| `map.txt` | 房间布局和连接方式 | 加房间时 |
| `ui.*.json` | 界面固定文字（按钮、提示语、帮助） | 很少 |

数字分身（`ask` 命令）也直接读取 `profile.en.md`，所以只要改一处，网站和数字分身就会一起更新。

---

## profile.md 的写法

```markdown
---
name: 张三                      ← 开头的基本信息（中德文件里留空 = 沿用英文）
tagline: Digital Life v1.0
email: you@example.com
github: your-github-username
linkedin: https://linkedin.com/in/...
website:
resume: assets/resume.pdf
start: foyer                    ← 可选：访客从哪个房间开始
---

# workshop: The Workshop | Projects & skills
> Sparks and soldering smoke. Two prototypes rest on the workbench.

I build small tools that make research faster.

## drone: an autonomous drone | drone, uav, quadcopter
PROJECT · Autonomous Drone
What: ...
Stack: Python, ROS
Link: https://github.com/...
```

| 写法 | 含义 |
|---|---|
| `# 房间id: 房间名 \| 栏目名` | 一个房间。房间 id 用英文小写，三种语言里要一致，并且要出现在 `map.txt` 里 |
| `>` 开头的行 | 访客走进房间时读到的描述（游戏旁白） |
| 房间下面的普通段落 | 你自己的简介：显示在"速览"页面，也是数字分身的资料 |
| `## 物品id: 名称 \| 别名, 别名` | 一件可以 `examine` 的物品，下面的文字就是检查时显示的内容。id 和别名都可以省略 |
| `<!-- game-only -->` | 写在物品下面：只在游戏里出现，不进速览页面 |
| `<!-- ai: stats -->` / `learned` / `recent` | 这件物品的内容自动来自 AI 使用记录数据 |
| `{name}` | 自动替换成你的名字 |

别名就是访客可以输入的其他叫法，比如 `examine uav` 也能找到 drone。

### 常见修改

- **加一个项目**：在 `# workshop` 下面复制一段 `## ...`，改标题和内容。
- **加一个爱好**：在 `# playroom` 下面加一段 `## ...`。
- **改简介**：改 `# foyer` 下面的普通段落和 `## portrait`。
- **删除某项**：把整段 `## ...` 删掉。
- **只改了英文**：中德文件里没写的物品或房间会自动显示英文内容，可以之后再翻译（或者让 AI 翻译）。

---

## quickview.md 的写法（速览页面）

普通 Markdown，写成简历的样子即可：

```markdown
# 名字
一句话介绍

## 工作经历
### SAP · 软件工程实习生 | 04/2025 – 10/2025     ← "|" 右边的日期会右对齐
- 要点一
- 要点二
```

支持 `**粗体**`、`` `代码` ``、`[链接文字](https://...)`。联系方式不用写，会根据 `profile.en.md` 开头的信息自动生成（带图标、自动对齐）。

---

## map.txt 的写法

用字符画出房间之间的关系，地图和出口方向都根据这张图自动生成：

```
          library
             |
playroom - foyer - workshop
             :
          archive
```

- `-` 左右相连（东 / 西）
- `|` 上下相连（北 / 南）
- `:` 像楼梯一样相连（上 / 下）

**加一个新房间**（比如 "experience"）：
1. 在 `map.txt` 里写上 `experience`，用 `-` `|` `:` 连到某个已有房间；
2. 在每个 `profile.*.md` 里加一个 `# experience: The Office | Work experience` 段落。

新房间的像素图标会用一个默认图案。想要专属图标的话，在 `js/pixelmap.js` 的 `SPRITES` 里加一个同名的 12×12 图案即可。

---

## 给 AI 的提示

修改内容时只需要编辑这个文件夹里的文件。请保持标题格式 `# id: 名称 | 栏目` 和 `## id: 名称 | 别名`，三种语言的房间 id 和物品 id 保持一致。改完英文版后，请同步更新 `profile.zh.md` 和 `profile.de.md` 里对应的段落。

## ask/ (knowledge for the `ask` digital self)
One Markdown file per topic, each starting with `name:` and `description:` front matter (copy `ask/_TEMPLATE.md`).
The digital self always sees the one-line descriptions and opens a file only when a question needs it.
`ask/index.json` is rebuilt automatically by a GitHub Action after you push. Everything here is public.
