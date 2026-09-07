(() => {
  "use strict";

  const THEME_KEY = "personal-navigation-theme";
  const THEMES = ["system", "light", "dark"];
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const faviconCache = new Map();
  let theme = readTheme();
  let selectedCategory = "all";
  let collectionViews = [];

  // 在解析正文前恢复主题，避免深色模式刷新时闪白。存储被禁用也能使用。
  function readTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return THEMES.includes(saved) ? saved : "system";
    } catch {
      return "system";
    }
  }

  function applyTheme() {
    document.documentElement.dataset.theme = theme === "system"
      ? (systemTheme.matches ? "dark" : "light")
      : theme;
  }

  applyTheme();
  systemTheme.addEventListener("change", applyTheme);

  // 内置线条图标只用于界面和分类，不依赖图标库或远程资源。
  const iconPaths = {
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
    microscope: '<path d="m8 3 5 2-3 8-5-2 3-8Z"/><path d="m7 13-1 3m6-7a6 6 0 0 1 0 12M4 21h16M3 17h8"/>',
    sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4m-2-2h4"/>',
    code: '<path d="m7 7-5 5 5 5m10-10 5 5-5 5M14 4l-4 16"/>',
    cloud: '<path d="M6 18a4 4 0 0 1-.6-8A6.5 6.5 0 0 1 18 8a5 5 0 0 1 0 10H6Z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    external: '<path d="M7 17 17 7M7 7h10v10"/>',
    edit: '<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 15v5Z"/>',
    system: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M12 17v4m-4 0h8"/>',
    light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    dark: '<path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z"/>',
  };

  function createIcon(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    // 仅插入上面固定的 SVG；配置中的名称和描述始终使用 textContent。
    svg.innerHTML = Object.hasOwn(iconPaths, name) ? iconPaths[name] : iconPaths.globe;
    return svg;
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function textValue(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function normalize(value) {
    return value.normalize("NFKC").toLowerCase();
  }

  function validUrl(value) {
    if (typeof value !== "string" || !/^https?:\/\/\S+$/i.test(value.trim())) return null;
    try {
      const url = new URL(value.trim());
      return url.hostname && !url.username && !url.password ? url : null;
    } catch {
      return null;
    }
  }

  function prepareCollections(data) {
    if (!Array.isArray(data)) return [];
    return data.flatMap((category, index) => {
      if (!category || !Array.isArray(category.links)) return [];
      const name = textValue(category.name) || "Uncategorized";
      const links = category.links.flatMap(link => {
        if (!link) return [];
        const linkName = textValue(link.name);
        const url = validUrl(link.url);
        if (!linkName || !url) {
          console.warn("Skipped a website: provide a name and a valid http(s) URL.", linkName);
          return [];
        }
        const description = textValue(link.description);
        const keywords = Array.isArray(link.keywords) ? link.keywords.map(textValue).join(" ") : "";
        return [{ name: linkName, url, description, searchText: normalize([linkName, description, keywords, name].join(" ")) }];
      });
      return links.length ? [{ id: String(index), name, icon: textValue(category.icon), links }] : [];
    });
  }

  function loadImage(source) {
    return new Promise(resolve => {
      const image = new Image();
      let settled = false;
      const finish = success => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        image.onload = null;
        image.onerror = null;
        if (!success) image.removeAttribute("src");
        resolve(success ? source : null);
      };
      const timer = setTimeout(() => finish(false), 3500);
      image.onload = () => finish(image.naturalWidth > 0);
      image.onerror = () => finish(false);
      image.referrerPolicy = "no-referrer";
      image.src = source;
    });
  }

  function getFavicon(url) {
    // 同一网站在多个分类出现时，共享探测结果。无需 CORS 或 fetch。
    const origin = url.origin;
    if (!faviconCache.has(origin)) {
      const direct = new URL("/favicon.ico", origin);
      direct.protocol = "https:";
      const fallback = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url.hostname)}&sz=64`;
      faviconCache.set(origin, loadImage(direct.href).then(result => result || loadImage(fallback)));
    }
    return faviconCache.get(origin);
  }

  function createFavicon(link) {
    const wrapper = element("span", "favicon");
    wrapper.setAttribute("aria-hidden", "true");
    wrapper.append(element("span", "favicon-letter", Array.from(link.name)[0].toUpperCase()));
    getFavicon(link.url).then(source => {
      if (!source) return; // 首字母始终占位，两级失败也不改变卡片尺寸。
      const image = new Image(23, 23);
      image.alt = "";
      image.referrerPolicy = "no-referrer";
      image.onload = () => wrapper.classList.add("has-image");
      image.onerror = () => {
        wrapper.classList.remove("has-image");
        image.remove();
      };
      image.src = source;
      wrapper.append(image);
    });
    return wrapper;
  }

  function createCard(link) {
    const item = element("li");
    const card = element("a", "website-card");
    card.href = link.url.href;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.title = [link.name, link.description, link.url.href].filter(Boolean).join(" — ");
    const copy = element("span", "card-copy");
    copy.append(element("span", "card-name", link.name));
    if (link.description) copy.append(element("span", "card-description", link.description));
    const arrow = element("span", "card-arrow");
    arrow.append(createIcon("external"));
    card.append(createFavicon(link), copy, arrow);
    item.append(card);
    return { item, searchText: link.searchText };
  }

  function renderCollections(collections) {
    const container = document.getElementById("collections");
    const fragment = document.createDocumentFragment();
    collectionViews = collections.map(category => {
      const section = element("section", "collection");
      const headingId = `category-${category.id}`;
      section.setAttribute("aria-labelledby", headingId);
      const heading = element("div", "collection-heading");
      const icon = element("span", "collection-icon");
      icon.append(createIcon(category.icon));
      const title = element("h2", "", category.name);
      title.id = headingId;
      const count = element("span", "collection-count", category.links.length);
      count.setAttribute("aria-hidden", "true");
      heading.append(icon, title, count);
      const grid = element("ul", "card-grid");
      const cards = category.links.map(createCard);
      cards.forEach(card => grid.append(card.item));
      section.append(heading, grid);
      fragment.append(section);
      return { id: category.id, section, count, cards };
    });
    container.replaceChildren(fragment);
  }

  function renderCategoryFilters(collections) {
    const container = document.getElementById("category-filters");
    container.replaceChildren();
    [{ id: "all", name: "All websites" }, ...collections].forEach(category => {
      const button = element("button", "filter-button", category.name);
      button.type = "button";
      button.dataset.category = category.id;
      button.setAttribute("aria-pressed", String(category.id === selectedCategory));
      button.addEventListener("click", () => {
        selectedCategory = category.id;
        updateSearch();
      });
      container.append(button);
    });
  }

  function updateSearch() {
    const input = document.getElementById("search-input");
    const query = normalize(input.value.trim());
    const terms = query.split(/\s+/).filter(Boolean);
    let total = 0;
    collectionViews.forEach(category => {
      let visible = 0;
      category.cards.forEach(card => {
        const match = (selectedCategory === "all" || selectedCategory === category.id)
          && terms.every(term => card.searchText.includes(term));
        card.item.hidden = !match;
        if (match) visible++;
      });
      category.section.hidden = visible === 0;
      category.count.textContent = visible;
      total += visible;
    });
    document.querySelectorAll(".filter-button").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.category === selectedCategory));
    });
    const filtered = terms.length > 0 || selectedCategory !== "all";
    document.getElementById("result-count").textContent = `${total} ${filtered ? (total === 1 ? "result" : "results") : (total === 1 ? "link" : "links")}`;
    document.getElementById("empty-state").hidden = total !== 0;
    document.getElementById("collections").hidden = total === 0;
    document.getElementById("clear-search").hidden = input.value.length === 0;
    document.getElementById("search-shortcut").hidden = input.value.length > 0;
  }

  function resetSearch() {
    document.getElementById("search-input").value = "";
    selectedCategory = "all";
    updateSearch();
  }

  function setupSearch() {
    const input = document.getElementById("search-input");
    input.addEventListener("input", updateSearch);
    input.form.addEventListener("submit", event => event.preventDefault());
    document.getElementById("clear-search").addEventListener("click", () => {
      input.value = "";
      updateSearch();
      input.focus();
    });
    document.getElementById("reset-filters").addEventListener("click", () => {
      resetSearch();
      input.focus();
    });
    document.addEventListener("keydown", event => {
      if (document.querySelector("dialog[open]")) return;
      if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
      const editing = event.target instanceof Element
        && event.target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])");
      if (event.key === "/" && !editing) {
        event.preventDefault();
        input.focus();
      }
      if (event.key === "Escape" && (!editing || event.target === input)) {
        event.preventDefault();
        resetSearch();
        if (document.activeElement === input) input.blur();
      }
    });
    updateSearch();
  }

  function updateThemeButton() {
    const current = theme[0].toUpperCase() + theme.slice(1);
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    const label = `Theme: ${current}. Switch to ${next[0].toUpperCase() + next.slice(1)}.`;
    const button = document.getElementById("theme-toggle");
    button.title = label;
    button.setAttribute("aria-label", label);
    document.getElementById("theme-label").textContent = current;
    document.getElementById("theme-icon").replaceChildren(createIcon(theme));
  }

  function setupTheme() {
    updateThemeButton();
    document.getElementById("theme-toggle").addEventListener("click", () => {
      theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
      applyTheme();
      updateThemeButton();
      try { localStorage.setItem(THEME_KEY, theme); } catch { /* 隐私模式下仍保留本次选择。 */ }
    });
    window.addEventListener("storage", event => {
      if (event.key === THEME_KEY || event.key === null) {
        theme = readTheme();
        applyTheme();
        updateThemeButton();
      }
    });
  }

  function setupSite() {
    const config = typeof siteConfig === "object" && siteConfig ? siteConfig : {};
    const fields = { title: "site-title", eyebrow: "site-eyebrow", heading: "welcome-heading", description: "site-description" };
    Object.entries(fields).forEach(([key, id]) => {
      if (textValue(config[key])) document.getElementById(id).textContent = config[key];
    });
    if (textValue(config.title)) document.title = config.title;
    if (textValue(config.description)) document.querySelector('meta[name="description"]').content = config.description;

    const github = typeof githubConfig === "object" && githubConfig ? githubConfig : {};
    const username = textValue(github.username);
    const repository = textValue(github.repository);
    if (!username || !repository || username === "YOUR_USERNAME" || repository === "YOUR_REPOSITORY") return;
    const repoUrl = `https://github.com/${encodeURIComponent(username)}/${encodeURIComponent(repository)}`;
    document.getElementById("github-link").href = repoUrl;
    const edit = document.getElementById("repository-edit");
    edit.href = `${repoUrl}/edit/${encodeURIComponent(textValue(github.branch) || "main")}/links.js`;
    edit.hidden = false;
    edit.title = "Edit your links on GitHub (opens in a new tab)";
  }

  function init() {
    document.querySelectorAll("[data-icon]").forEach(node => node.replaceChildren(createIcon(node.dataset.icon)));
    setupSite();
    setupTheme();
    const data = NavigationEditor.init({
      source: typeof navigationData === "undefined" ? [] : navigationData,
      validUrl,
      createIcon,
      onChange: renderNavigation,
    });
    const collections = prepareCollections(data);
    renderCollections(collections);
    renderCategoryFilters(collections);
    setupSearch();
  }

  function renderNavigation(data) {
    const collections = prepareCollections(data);
    // 分类索引可能随排序、删除而改变，编辑后回到全部分类。
    selectedCategory = "all";
    renderCollections(collections);
    renderCategoryFilters(collections);
    updateSearch();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
