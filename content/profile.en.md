---
name: Kunxiang Shen
tagline: Digital Life v1.0
email: KunxiangShen@outlook.com
github: KeloShen
linkedin: https://www.linkedin.com/in/kunxiangshen
website:
resume:
start: foyer
---

<!--
  YOUR PROFILE (English). This one file feeds the whole site and the "ask" digital self.
  Rooms are "# roomId: Room name | Section", things to examine are "## itemId: label | aliases".
  Lines starting with ">" are the narration visitors read when entering a room.
  Full guide: content/README.md. To add a project, copy a "## ..." block in the Workshop.
-->

# foyer: The Foyer | About me
> You step into a softly glowing foyer. The walls flicker with fragments of code, a Berlin U-Bahn map and an old photo of Xi'an's city wall. A portrait hangs opposite the entrance, and beside it stands a tall mirror that seems to be watching you.

Hi, I'm Kunxiang Shen (沈琨翔), an MSc Data Science student at Freie Universität Berlin with a BEng in Software Engineering from Xidian University (GPA 3.8/4.0, top 15%). I've shipped cloud tooling and CI/CD pipelines as an intern at SAP, and built an LLM multi-agent system for bank compliance review together with HSBC Technology. I like turning messy, real-world problems into reliable software, and I'm open to internships and working-student roles in AI engineering, data and full-stack development.

## portrait: a portrait | portrait, painting, picture
The portrait shows Kunxiang Shen. A brass plate reads:

  Kunxiang Shen · 沈琨翔
  MSc Data Science @ Freie Universität Berlin
  BEng Software Engineering @ Xidian University
  Mandarin (native) · English C1, IELTS 7.0 · German A1

In one sentence: a software engineer who builds LLM-powered systems end to end, from the agent pipeline to the CI/CD that ships it.

## mirror: a mirror | mirror, reflection
Your reflection ripples and becomes someone else: my digital self. It speaks:

"Ask me anything. My studies, my projects, how I work."

Try:  ask what did you build at SAP?
<!-- game-only -->

# library: The Library | Education
> Shelves rise into darkness, lined with books that hum faintly. A framed diploma hangs above a reading desk, where a thick bound thesis lies open. Beside it: a Cambridge certificate, a train ticket to Paderborn and a brand-new notebook with a Berlin bear on the cover. The tall bookshelf has three shelves: software, systems, and data & math.

Currently an MSc Data Science student at Freie Universität Berlin (since 09/2026). Before that: BEng in Software Engineering at Xidian University (2022–2026, GPA 3.8/4.0, top 15%; qualified for recommended postgraduate admission and voluntarily declined it), an exchange semester at Universität Paderborn funded by Xidian's Office of International Cooperation and Exchange, and the University of Cambridge winter programme "Artificial Intelligence and Deep Learning" (final grade A).

## berlin: a Berlin notebook | berlin, notebook, fu, master, msc
FREIE UNIVERSITÄT BERLIN · MSc Data Science
09/2026 – present
The first pages are still filling up.

## diploma: a diploma | diploma, degree, xidian, bachelor
XIDIAN UNIVERSITY · BEng Software Engineering
08/2022 – 06/2026 · Xi'an, China
Track: Cloud Computing & Big Data
GPA 3.8 / 4.0 (top 15% of the major) · weighted average 86.7
Qualified for recommended admission to a master's programme without the national entrance exam (保研), and voluntarily declined it.
Scholarships: University Second Class Scholarship (2023–2024), Third Class Scholarship (2022–2023)

The courses are on the shelves (examine bookshelf); the thesis lies open on the desk (examine thesis).

## thesis: a bound thesis | thesis, dissertation, bachelor thesis, llm-txinsight
BACHELOR THESIS · "Design and Implementation of a Customized LLM-based Bank Customer Transaction Rationality Analysis System"
System name: LLM-TxInsight · in collaboration with HSBC Technology · 12/2025 – 04/2026

THE PROBLEM
Compliance analysts check customer profiles and transaction histories by hand. The process is slow, judgement standards differ between reviewers, and ambiguous transactions rarely end in a clear, explainable conclusion.

WHAT I BUILT
A browser-based system (Spring Boot 3 + LangChain4j, Vue 3, PostgreSQL). Upload a customer profile and a transaction file (Excel/CSV); it returns a three-part report (customer overview, transaction summary, rationality statement) that can be exported to Word.
  · Staged analysis instead of one big prompt. Stage 1 screens for clearly unreasonable patterns (large anomalies, money in and straight out, funds pooled from many people). Stage 2 judges reasonableness against the customer's job and income. Stage 3 asks the analyst targeted follow-up questions (up to 3 rounds) when the evidence isn't enough.
  · Scenario skills: rules for cases such as transfers between relatives, structured deposits and high-risk countries are loaded only when a case needs them; the high-risk country list comes from the database, not from the prompt.
  · A review agent double-checks each conclusion; if it disagrees with the analysis agent, the case goes to human arbitration and the ruling is recorded.
  · Analyst feedback is distilled into reusable lessons that later analyses draw on.
  · 171 backend test methods (JUnit 5, Mockito, unit and integration) plus frontend component tests (Vitest).

EVALUATION · 500 labelled cases (about 200 reasonable, 200 unreasonable, 100 needing a human)
  · Qwen-plus: plain prompt 50.0% → few-shot + chain-of-thought 60.4% → staged orchestration 68.0%
  · Best result: Qwen3.6-max-preview with skills, 86.7%. Qwen3-max with skills reached 83.1%, above the project's 80% target.
  · Loading skills on demand cut token usage by about 20–30% across models.
  · The cheapest model (DeepSeek V4 Flash, about ¥0.03 per case) reached only 57.6%: model choice is a real accuracy-versus-cost trade-off.

MAIN FINDINGS
Splitting the task into focused stages helped accuracy more than prompt tricks did; context size is a cost lever you can engineer; and a system that knows when to ask a human is easier to trust than one that always answers.

## cambridge: a Cambridge certificate | cambridge, certificate, deep learning, winter programme
UNIVERSITY OF CAMBRIDGE · Department of Computer Science and Technology
Winter programme "Artificial Intelligence and Deep Learning", 12–24 February 2024
Taught by Prof. Nicholas D. Lane (Professor of Machine Learning Systems, co-founder of Flower Labs). Lectures, discussions and a group presentation:
  1. Why deep learning became so dominant, and the forces that will shape where it goes next
  2. Core building blocks: convolutional and recurrent networks, with vision and language examples in code
  3. Modern building blocks: residual connections, depthwise-separable convolutions, channel shuffle and attention
  4. The craft of training: deriving how parameters are learned from statistics, then a step-by-step recipe for training a deep model
  5. Compute: why deep learning is so expensive, and how both systems and algorithms reduce that cost
  6. The research frontier: taking apart the most influential recent papers and learning to judge them critically
  7. A student-led reading group, where we summarised and critiqued landmark papers ourselves
Final grade: A.

## ticket: a train ticket to Paderborn | ticket, paderborn, exchange
UNIVERSITÄT PADERBORN · Exchange student, 09/2024 – 03/2025
Funded by Xidian University's Office of International Cooperation and Exchange (国合部).
Courses: Computer Networks, Fundamental Algorithms, and German (A1).
My first semester in Germany.

## bookshelf: a bookshelf | bookshelf, books, courses, shelf
A tall bookshelf with three shelves of the major courses that shaped me:
  · the software shelf ··········· programming, data structures, algorithms, architecture
  · the systems shelf ············ circuits, computer architecture, operating systems, cloud, security
  · the data & math shelf ········ statistics, numerical methods, machine learning, retrieval
Try:  examine software shelf

## shelf-software: the software shelf | software shelf, software, programming shelf
  · Introduction to Computing & Programming: my first real programming: control flow, functions, arrays, pointers and memory
  · Python Programming: writing idiomatic Python and using its standard library
  · Object-Oriented Programming: classes, inheritance and polymorphism; organising code around objects
  · Data Structures: lists, stacks, queues, trees, graphs and hash tables, plus sorting and searching
  · Algorithm Design & Analysis: divide and conquer, dynamic programming, greedy algorithms, backtracking, complexity analysis
  · Software Architecture: architectural styles, quality attributes and design patterns, and how to choose between them
  · Software Process & Project Management: from waterfall to agile, estimating, planning, managing risk and versions
  · Intellectual Property & Software Protection: copyright, patents and open-source licences for software

## shelf-systems: the systems shelf | systems shelf, systems, hardware
  · Circuits & Electronics, Digital Circuit & System Design: from logic gates to combinational and sequential circuits
  · Computer Organization & Architecture: instruction sets, the datapath, memory hierarchy and caches, with a course project
  · Operating Systems: processes and threads, scheduling, synchronisation, memory management and file systems, with a course project
  · Cloud Computing: virtualisation, containers and distributed storage and computing
  · Cloud & Big Data Engineering Practicum: a hands-on team engineering project in my specialisation track
  · Introduction to Information Security: cryptography basics, authentication, access control, common attacks and defences

## shelf-data: the data & math shelf | data shelf, math shelf, data, math, ai
  · Discrete Mathematics: logic, sets, relations, graphs and combinatorics
  · Probability & Statistics: distributions, estimation and hypothesis testing
  · Numerical Analysis: floating-point error, interpolation, numerical integration and iterative methods for solving equations
  · Machine Learning & Data Mining: regression, classification, clustering, model evaluation and association rules
  · Information Retrieval: inverted indexes, TF-IDF and vector-space ranking, precision and recall; the ideas behind today's RAG
  · Algorithms for Bioinformatics: sequence alignment with dynamic programming

# workshop: The Workshop | Projects & skills
> Sparks and soldering smoke. On the workbench, a screen streams an AI agent's reasoning about a bank transaction; next to it, a terminal that looks suspiciously like this one. A well-worn toolbox sits open on the floor.

I build LLM applications end to end: agent orchestration with LangChain4j and Spring Boot, Vue 3 + TypeScript frontends, and the Docker/Kubernetes/Jenkins plumbing that keeps them running.

## agent: the compliance agent | agent, bank, hsbc, aml, thesis project, prototype a, a
PROJECT · Bank Customer Transaction Rationality Analysis System
With HSBC Technology · 12/2025 – 04/2026 · my bachelor thesis
What: an intelligent assistant for anti-money-laundering and compliance review. Feed it a customer profile and transaction history; LLM agents judge whether each transaction is plausible and return a verdict, the reasoning and the evidence. Uncertain high-risk cases go to a human.
How I built it:
  · Designed the whole backend on LangChain4j + Spring Boot 3, with persistent chat memory for multi-turn follow-up questions
  · Multi-agent pipeline: detect → review → ask a human to clarify → final ruling; low confidence escalates automatically (human-in-the-loop)
  · Pluggable "skill" library: each detection rule is a skill (rule + parameters + reference knowledge), loaded on demand via rule pre-selection + semantic matching, a RAG-style progressive disclosure
  · Function calling, so the model decides which skills to activate instead of receiving everything at once
  · A feedback loop: user corrections are distilled into reusable lessons that later analyses cite, so the agent learns over time
  · Layered chain-of-thought prompts with anti-hallucination constraints, versioned and iterated for accuracy
  · Frontend in Vue 3 + TypeScript + Tailwind CSS 4

## terminal-site: a suspiciously familiar terminal | terminal, website, this site, digital life, prototype b, b
PROJECT · This website
A text-adventure portfolio you are standing in right now: a Three.js particle intro (about 140k grains of sand rendered by shaders), a parser for commands in three languages, a pixel-art map, and an "ask" command backed by an LLM that answers from this very profile.
Built together with Claude, which fits the theme: see the Server Archive for how I use AI.
Code: https://github.com/KeloShen/keloshen.github.io

## toolbox: a toolbox | toolbox, tools, skills, stack
Neatly sorted compartments:
  Backend    · Java 21 + Spring Boot 3, Python, C++, PostgreSQL
  Frontend   · Vue 3 + TypeScript, Quasar, Tailwind CSS
  AI         · LangChain4j, LLM agents, function calling, RAG, prompt engineering
  DevOps     · Jenkins CI/CD, Docker, Kubernetes, Helm, Linux, Shell
  Reliability· Chaos engineering (Chaos Mesh), Prometheus + Grafana
  Workflow   · Git (Gerrit, GitHub), Jira, n8n
  Languages  · Mandarin (native), English C1 (IELTS 7.0), German A1

# office: The Office | Work experience
> A tidy desk under the glow of two monitors. A Jenkins pipeline runs green on one of them; on the other, a Grafana dashboard twitches as someone injects chaos into a cluster. A lanyard with an SAP badge hangs from the lamp.

Software engineering intern at SAP (HANA Cloud Delivery, Xi'an, 04–10/2025): cloud-management frontend tooling, Jenkins CI/CD, Kubernetes/Helm deployments and chaos engineering. Received the SAP Peer-to-Peer Award.

## badge: an SAP badge | badge, sap, lanyard, internship
SAP · HANA Cloud Delivery · Intern · Xi'an, 04/2025 – 10/2025
  · Helped build a frontend tool (Vue 3, TypeScript, Quasar) for cloud service management
  · Maintained and optimised a Jenkins CI/CD pipeline: security checks, Docker image management, deployment stages
  · Automated interactions with HANA databases in Python; deployed services with Kubernetes and Helm
  · Ran chaos engineering experiments with Chaos Mesh and watched stability and performance in Grafana + Prometheus
  · Worked in an agile team with Jira and automated the team's notification workflows

## award: a small glass trophy | trophy, award, prize, awards
Engraved, in order:
  · SAP Peer-to-Peer Award, for collaboration and innovation (10/2025)
  · National Third Prize, National College English Competition (05/2024)
  · Xidian University Second Class Scholarship (2023–2024)
  · Xidian University Third Class Scholarship (2022–2023)

# playroom: The Playroom | Hobbies
> A cozy, cluttered room. An old microcontroller board with jumper wires sticks out of a drawer, and a dusty laptop on the windowsill still has a blog open from 2023.

## mcu: an old microcontroller board | board, microcontroller, 51, mcu, hobby1
An 8051 ("51") development board, the kind every Chinese engineering student meets sooner or later. I wrote about learning it on my old blog in 2023.

## blog: a dusty blog | blog, laptop, hexo, hobby2
My first blog, built with Hexo in January 2023. Posts about setting it up, search-engine tricks, and the 51 microcontroller. It used to live at this very address; this digital life replaced it in 2026.

# archive: The Server Archive | AI journey
> Cold air and blinking lights. Racks of servers store every conversation I've had with AI that was worth keeping. A terminal glows in the middle of the room; a printed summary and a stack of log files sit beside it.

I use AI tools every day for coding, debugging and learning: Claude Code, Codex, Cursor, Cline and OpenClaw, plus n8n for automation. I try to use them like a sparring partner: break problems down, ask follow-ups, and verify what they say.

## terminal: a terminal | terminal, screen, stats
<!-- ai: stats -->

## summary: a printed summary | summary, printout, learned
<!-- ai: learned -->

## logs: log files | logs, log, files, records
<!-- ai: recent -->
