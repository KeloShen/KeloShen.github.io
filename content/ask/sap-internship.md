---
name: sap-internship
description: SAP internship (HANA Cloud, database version delivery team, Xi'an, 04–10/2025) in depth: what the team does, concrete tasks I delivered (Jenkins/Jira automation, post-upgrade reports, version-distribution POC, FVU calendar UI, chaos-testing evaluation, bug hunts), tools used, the Peer-to-Peer award, and how the internship changed my view of AI coding.
---

# SAP internship: HANA Cloud, version delivery

SAP, Xi'an, China · software engineering intern · 04/2025 – 10/2025.
(Internal system names, links, ticket numbers and colleagues' names are left out on purpose.)

## What the team does
SAP HANA Cloud is a managed database service running on many Kubernetes landscapes across hyperscalers, split into canary (SAP-internal customers) and production (external customers). Customers don't always upgrade, so the team runs Forced Version Upgrades (FVU): in weekend maintenance windows, instances on outdated or buggy versions are upgraded to defined target versions, for security, bug fixes and supportability. Every FVU has a "pre" phase (decide the upgrade vector, i.e. which versions go to which target; find affected instances; create service-request and maintenance tickets; create config pull requests) and a "post" phase (collect logs, analyse, report, follow up on failures). Much of this runs through Jenkins pipelines and Python tooling, with Jira for tickets.

My work split into two areas: the team's quality-pipeline web platform (frontend), and, where I spent most of my time, the FVU automation (Jenkins, Python, Jira, GitHub, Kubernetes).

## What I delivered (examples)
### Pipeline and Jira automation
- **Auto-approval logic fix.** The ticket pipeline automatically marked maintenance requests as approved, but that should only happen for recurring canary upgrades, not on-demand ones; Operations start automated jobs on approved tickets, so a wrong approval creates clean-up work. I added an FVU type parameter (recurring / on-demand) to the pipeline, wrote the rule "auto-approve only canary + recurring", prevented duplicate approval comments, set non-approved tickets to an "author action" status, and covered the combinations with unit tests.
- **Affected instances in tickets.** Added the list of affected instance IDs to the ticket field the quality platform reads, so issues show up against the right instances.
- **Know who triggered a pipeline.** Pre-FVU pipelines can be started by a cron job, by the backend through the Jenkins API, or by a person. I made the pipeline detect the trigger cause, print it, add it to the generated PR, assign the author and label PRs (human / cron / api).
- **Unique config branches + weekly clean-up.** Test PRs could overwrite each other because branch names collided. I made branch names unique with a recognisable pattern, added labels (test-mode, config), and built a scheduled Jenkins job that closes test-mode PRs older than a week, with a dry-run mode that only logs what it would delete.
- **Auto-merge of affected-instance logs.** A Friday pipeline only printed a link that someone had to click and merge by hand; I reused the existing PR function to create and auto-merge the PR into the logs repository.
- **Integration test safety.** The daily integration test also triggered ticket creation against a production landscape; I restricted it so production is never touched by the test.
- **New landscape onboarding.** Added new landscapes to the upgrade tooling (pipeline set-up, credentials, verification), following the team checklist.

### Post-upgrade reporting and data quality
- **Warnings file.** After every FVU, all warning lines from the logs are collected into a warnings file linked from the summary email, with a keyword filter for known noise; tested with unit tests instead of full pipeline runs.
- **"Create Jira issue" links that broke.** Pre-filled issue links in the summary email became too long for the Jira server. I added error parsing and compression (extract status codes and messages, drop debug noise, deduplicate per instance), truncate at about 600 characters, and link to the full error file on GitHub, so the links work and no information is lost.
- **Duplicate rows / duplicate emails.** A job-configuration CSV kept getting duplicate entries, which caused duplicate emails. I added duplicate detection and a test suite for the related functions.
- **Wrong counts in the weekly summary.** Instances that succeeded on retry were still counted as failed in new tickets; I found the cause and added a check, with a unit test.

### Visualisation POC
The team decided upgrade vectors from the platform's version data, which can lag behind reality (telemetry delay) or be incomplete. The real source of truth is Kubernetes. I built a proof of concept: a pipeline that reads the actual HANA versions from the clusters for selected regions and visualises the instance count per version (release cycle, track, version), aggregated by region or track, and presented it to the team.

### Frontend: FVU calendar
On the team's quality-pipeline platform (Vue 3, TypeScript, Quasar; code review in Gerrit) I added a calendar of FVU plans: each plan shows its affected landscape set, canary in grey and production in light blue (SAP Fiori palette), and clicking a plan opens its service-request ticket. I also reduced hard-coded styling.

### Chaos engineering evaluation
The team had its own chaos tests for start/stop of databases. I evaluated a central SAP chaos-testing tool (kill or pause pods, restart VMs) against our approach, listed pros and cons and proposed how we could adopt it. The tool's documentation was outdated; by reaching out I found out ownership had moved to another team abroad and that it was still maintained, then demoed it to my team. Related: Chaos Mesh experiments, watching stability in Grafana + Prometheus.

### A bug hunt I like to tell
One Jenkins pipeline failed in a shared "clone repository with branch" function while all the others worked. The difference: that pipeline imported a library that already defined a variable called `name`, which clashed with the `NAME` environment variable the function set. Fix applied to all Jenkinsfiles; lesson: never use generic names like NAME or PATH for variables.

## Tools
Python, Groovy/Jenkinsfile, Jenkins CI/CD (including security checks with secrets from Vault, Docker images), GitHub and Gerrit, Jira, Kubernetes and Helm, HANA DB, Outlook notifications, Vue 3 + TypeScript + Quasar, Chaos Mesh, Grafana, Prometheus, and Cline as an AI coding agent.

## Recognition
SAP Peer-to-Peer Certificate of Appreciation ("we win as ONE"), with a monetary award, 27.10.2025, for collaborating, prioritising what's best for SAP and driving innovation.
I also took part in SAP Student Day 2025 and wrote structured feedback for the organisers (what worked, what to improve).

## What I learned
- Engineering at scale: every change is peer-reviewed, unit-tested, tested in a test mode or dry run first, and has a clear definition of done. My many commits meant a lot of review work from my mentor, and I learned a lot from that review.
- Automation is worth it where humans skip steps (nobody reads console logs; links that need a manual click get forgotten).
- My view of AI coding changed. Before SAP I believed prompts would simply replace programming languages. Using an AI coding agent on a large, rigorous codebase changed that: AI output can look impressive but is often bloated (cleaning and debugging it takes time), pure vibe coding carries real risk, and the model predicts likely text rather than understanding the goal. My conclusions: keep learning, because good engineers who write high-quality code won't be replaced; and keep a reasonable distance from AI by learning to use the tools well (clear requirements, rules, context, saved plans) instead of relying on them blindly.
