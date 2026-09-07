// 网站与分类可以在页面右上角「编辑导航」中修改，再导出此文件用于发布。
const siteConfig = {
  title: "Lite Navigation",
  eyebrow: "A PERSONAL COLLECTION",
  heading: "Where do you want to go?",
  description: "A quiet home for your everyday internet.",
};

// 填写仓库信息后，编辑器中会显示 GitHub 编辑页入口。
const githubConfig = {
  username: "Balderleech",
  repository: "Lite Navigation",
  branch: "main",
};

// 分类 icon 可选：star / microscope / sparkles / code / cloud / globe。
// 网站 name、url 必填；description、keywords 可选。不需要填写图标地址。
const navigationData = [
  {
    name: "常用",
    icon: "star",
    links: [
      { name: "ChatGPT", url: "https://chatgpt.com", description: "Your everyday AI assistant", keywords: ["AI", "GPT", "聊天", "助手"] },
      { name: "GitHub", url: "https://github.com", description: "A home for your code", keywords: ["git", "code", "代码"] },
      { name: "Gmail", url: "https://mail.google.com", description: "Keep in touch", keywords: ["email", "mail", "邮件"] },
      { name: "Google Calendar", url: "https://calendar.google.com", description: "Make room for what matters", keywords: ["calendar", "schedule", "日历", "日程"] },
    ],
  },
  {
    name: "科研",
    icon: "microscope",
    links: [
      { name: "Google Scholar", url: "https://scholar.google.com", description: "Discover academic literature", keywords: ["paper", "literature", "论文", "学术"] },
      { name: "Web of Science", url: "https://www.webofscience.com", description: "Explore research & citations", keywords: ["paper", "research", "citation", "论文", "引用"] },
      { name: "NCBI", url: "https://www.ncbi.nlm.nih.gov", description: "A world of biomedical knowledge", keywords: ["pubmed", "biology", "生物", "医学"] },
      { name: "ORCID", url: "https://orcid.org", description: "Your research, connected", keywords: ["researcher", "identity", "学者"] },
      { name: "Zotero", url: "https://www.zotero.org", description: "Collect. Organize. Cite.", keywords: ["reference", "citation", "文献", "引用"] },
    ],
  },
  {
    name: "AI",
    icon: "sparkles",
    links: [
      { name: "ChatGPT", url: "https://chatgpt.com", description: "Think, write, and create", keywords: ["GPT", "OpenAI", "人工智能"] },
      { name: "Claude", url: "https://claude.ai", description: "A thoughtful collaborator", keywords: ["Anthropic", "writing", "写作"] },
      { name: "Gemini", url: "https://gemini.google.com", description: "Bring your ideas to life", keywords: ["Google", "multimodal", "多模态"] },
      { name: "Perplexity", url: "https://www.perplexity.ai", description: "Follow your curiosity", keywords: ["search", "answer", "搜索"] },
    ],
  },
  {
    name: "Development",
    icon: "code",
    links: [
      { name: "GitHub", url: "https://github.com", description: "Build something together", keywords: ["git", "code", "开发"] },
      { name: "Docker Hub", url: "https://hub.docker.com", description: "Find your next container image", keywords: ["docker", "container", "容器"] },
      { name: "Stack Overflow", url: "https://stackoverflow.com", description: "Answers for your next build", keywords: ["question", "programming", "编程"] },
      { name: "MDN", url: "https://developer.mozilla.org", description: "Your guide to the open web", keywords: ["HTML", "CSS", "JavaScript", "docs", "文档"] },
    ],
  },
  {
    name: "Cloud",
    icon: "cloud",
    links: [
      { name: "Cloudflare", url: "https://www.cloudflare.com", description: "Connect, protect, and deliver", keywords: ["DNS", "CDN", "network", "网络"] },
      { name: "Vercel", url: "https://vercel.com", description: "From idea to deployment", keywords: ["hosting", "deploy", "部署"] },
      { name: "GitHub Pages", url: "https://pages.github.com", description: "A simple home for your website", keywords: ["git", "hosting", "static", "静态", "托管"] },
    ],
  },
];
