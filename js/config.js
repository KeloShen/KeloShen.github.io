// ============================================================
//  SITE CONFIG — technical settings only.
//  Everything about YOU (texts, rooms, contact) lives in content/ — see content/README.md.
// ============================================================
export const CONFIG = {
  // Your name, tagline, contact details and résumé link live in content/profile.en.md (front matter).

  // Languages: code -> label on the switcher. Each needs content/ui.<code>.json and content/profile.<code>.md
  languages: { en: "EN", zh: "中文", de: "DE" },
  defaultLang: "en",

  // AI journey data. The site first tries the live repo, then the local sample.
  aiJourney: {
    repo: "ai-journey",
    branch: "main",
    file: "summary.json",
    // Optional: a full URL that overrides repo/branch/file
    url: "",
    fallback: "data/ai-journey.sample.json",
  },

  // The `ask` command. Leave empty until the Cloudflare Worker is deployed.
  // Example: "https://digital-self.your-name.workers.dev"
  askEndpoint: "",

  intro: {
    skipOnRepeat: true,  // returning visitors skip the intro (type `replay` to watch again)
    // The scene image that gets turned into particles (any dark image with bright subjects works)
    image: "assets/scene.jpg",
  },
};
