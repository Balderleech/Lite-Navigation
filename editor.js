/* 纯静态编辑器：当前浏览器保存 + JSON 备份 + links.js 复制与导出。 */
window.NavigationEditor = (() => {
  "use strict";

  // 同一域名下不同 GitHub Pages 项目分别保存；/ 与 /index.html 共用数据。
  const directory = location.pathname.replace(/[^/]*$/, "");
  const storageKey = `personal-navigation-data:v1:${directory}`;
  const clone = value => JSON.parse(JSON.stringify(value));
  const text = value => typeof value === "string" ? value.trim() : "";
  const $ = id => document.getElementById(id);
  let data = [];
  let source = [];
  let base = "";
  let storedRaw = null;
  let previous = null;
  let onChange, validUrl, createIcon;
  let editing = null;
  let confirmation = null;
  let unsaved = false;
  let conflict = false;
  let categoryFilter = "all";

  function normalizeData(value, strict = false) {
    if (!Array.isArray(value)) throw new Error("备份中缺少分类数组。");
    return value.flatMap(category => {
      if (!category || !Array.isArray(category.links)) {
        if (strict) throw new Error("每个分类都需要名称和网站列表。");
        return [];
      }
      if (strict && !text(category.name)) throw new Error("分类名称不能为空。");
      const links = category.links.flatMap(link => {
        if (!link || !text(link.name) || !validUrl(link.url)) {
          if (strict) throw new Error("有网站缺少名称，或网址不是有效的 HTTP(S) 地址。");
          console.warn("Skipped a website: provide a name and a valid http(s) URL.", text(link?.name));
          return [];
        }
        if (strict && ((link.description != null && typeof link.description !== "string")
          || (link.keywords != null && (!Array.isArray(link.keywords) || link.keywords.some(word => typeof word !== "string"))))) {
          throw new Error("简介需要是文字，关键词需要是文字数组。");
        }
        const result = { name: text(link.name), url: validUrl(link.url).href };
        if (text(link.description)) result.description = text(link.description);
        if (Array.isArray(link.keywords)) result.keywords = link.keywords.map(text).filter(Boolean);
        return [result];
      });
      return [{ name: text(category.name) || "Uncategorized", icon: text(category.icon) || "globe", links }];
    });
  }

  function notice(message, warning = false) {
    const node = $(warning ? "editor-warning" : "editor-status");
    node.textContent = message;
    if (warning) node.hidden = !message;
  }

  function readLocal() {
    data = clone(source);
    base = JSON.stringify(source);
    conflict = false;
    unsaved = false;
    $("reload-local").hidden = true;
    notice("", true);
    try {
      storedRaw = localStorage.getItem(storageKey);
      if (!storedRaw) { notice("当前使用站点配置。修改后会自动保存在此浏览器。"); return; }
      const record = JSON.parse(storedRaw);
      if (record.version !== 1 || typeof record.base !== "string") throw new Error("不支持的本地数据格式。");
      data = normalizeData(record.categories, true);
      base = record.base;
      notice("已载入当前浏览器保存的导航。");
      if (base !== JSON.stringify(source) && JSON.stringify(data) !== JSON.stringify(source)) {
        notice("站点版本已有更新。当前显示你的本地修改；可先导出备份，再用「恢复站点版本」查看新版。", true);
      }
    } catch {
      notice("无法读取浏览器保存的数据，当前显示站点配置。你仍可编辑并导出备份。", true);
    }
  }

  function checkConflict() {
    try { conflict = localStorage.getItem(storageKey) !== storedRaw; } catch { /* 无存储权限时允许会话内编辑。 */ }
    if (conflict) {
      notice("另一标签页已修改导航。请先载入最新修改，再继续编辑；也可以先导出当前备份。", true);
      $("reload-local").hidden = false;
    }
    return conflict;
  }

  function persist(message) {
    try {
      if (JSON.stringify(data) === JSON.stringify(source)) {
        localStorage.removeItem(storageKey);
        storedRaw = null;
        base = JSON.stringify(source);
      } else {
        const record = JSON.stringify({ version: 1, base, categories: data });
        localStorage.setItem(storageKey, record);
        storedRaw = record;
      }
      unsaved = false;
      notice(`${message} · 已保存到此浏览器`);
      if (base === JSON.stringify(source)) notice("", true);
    } catch {
      unsaved = true;
      notice(`${message} · 已在当前页面生效`);
      notice("浏览器未能保存修改（存储可能被禁用或已满）。刷新会丢失本次修改，请先导出备份。", true);
    }
  }

  function commit(next, message, focusKey) {
    if (checkConflict()) return false;
    previous = clone(data);
    data = next;
    persist(message);
    onChange(data);
    renderList(focusKey);
    return true;
  }

  function node(tag, className, value) {
    const result = document.createElement(tag);
    result.className = className;
    if (value !== undefined) result.textContent = value;
    return result;
  }

  function control(label, icon, handler, key, disabled = false) {
    const button = node("button", "icon-button");
    button.type = "button";
    button.title = label;
    button.setAttribute("aria-label", label);
    button.dataset.focus = key;
    button.disabled = disabled;
    if (icon === "up" || icon === "down" || icon === "delete") {
      button.textContent = { up: "↑", down: "↓", delete: "×" }[icon];
    } else button.append(createIcon(icon));
    button.addEventListener("click", handler);
    return button;
  }

  function move(categoryIndex, linkIndex, direction) {
    const next = clone(data);
    const list = linkIndex === null ? next : next[categoryIndex].links;
    const index = linkIndex === null ? categoryIndex : linkIndex;
    const destination = index + direction;
    if (destination < 0 || destination >= list.length) return;
    [list[index], list[destination]] = [list[destination], list[index]];
    if (linkIndex === null) categoryFilter = "all";
    const key = linkIndex === null ? `category-${destination}-edit` : `link-${categoryIndex}-${destination}-edit`;
    commit(next, "顺序已更新", key);
  }

  function ask(title, message, action) {
    $("confirm-title").textContent = title;
    $("confirm-message").textContent = message;
    confirmation = action;
    $("confirm-dialog").showModal();
  }

  function remove(categoryIndex, linkIndex) {
    const next = clone(data);
    if (linkIndex === null) {
      const category = data[categoryIndex];
      ask("删除分类", `删除「${category.name}」及其中的 ${category.links.length} 个网站？操作后可以撤销。`, () => {
        next.splice(categoryIndex, 1);
        categoryFilter = "all";
        commit(next, "分类已删除");
      });
    } else {
      next[categoryIndex].links.splice(linkIndex, 1);
      commit(next, "网站已删除，可撤销上一步", `category-${categoryIndex}-edit`);
    }
  }

  function appendControls(container, categoryIndex, linkIndex) {
    const isCategory = linkIndex === null;
    const index = isCategory ? categoryIndex : linkIndex;
    const item = isCategory ? data[index] : data[categoryIndex].links[index];
    const length = isCategory ? data.length : data[categoryIndex].links.length;
    const key = isCategory ? `category-${index}` : `link-${categoryIndex}-${index}`;
    const actions = node("div", "row-actions");
    actions.append(
      control(`编辑${isCategory ? "分类" : "网站"}：${item.name}`, "edit", () => openEntry(isCategory ? "category" : "website", categoryIndex, linkIndex), `${key}-edit`),
      control(`上移：${item.name}`, "up", () => move(categoryIndex, linkIndex, -1), `${key}-up`, index === 0),
      control(`下移：${item.name}`, "down", () => move(categoryIndex, linkIndex, 1), `${key}-down`, index === length - 1),
      control(`删除${isCategory ? "分类" : "网站"}：${item.name}`, "delete", () => remove(categoryIndex, linkIndex), `${key}-delete`),
    );
    container.append(actions);
  }

  function renderList(focusKey) {
    const filter = $("editor-category-filter");
    const selected = categoryFilter;
    filter.replaceChildren(new Option("全部分类", "all"));
    data.forEach((category, index) => filter.add(new Option(category.name, String(index))));
    filter.value = selected === "all" || data[Number(selected)] ? selected : "all";
    categoryFilter = filter.value;
    const fragment = document.createDocumentFragment();
    data.forEach((category, categoryIndex) => {
      if (filter.value !== "all" && filter.value !== String(categoryIndex)) return;
      const section = node("section", "editor-category");
      const heading = node("div", "editor-category-heading");
      const title = node("h3", "editor-category-title");
      const name = node("span", "", category.name);
      name.title = category.name;
      title.append(createIcon(category.icon), name, node("small", "", category.links.length));
      heading.append(title);
      appendControls(heading, categoryIndex, null);
      section.append(heading);
      category.links.forEach((link, linkIndex) => {
        const row = node("div", "editor-website");
        const copy = node("div", "editor-website-copy");
        const name = node("strong", "", link.name);
        const url = node("span", "", link.url);
        name.title = link.name;
        url.title = link.url;
        copy.append(name, url);
        row.append(copy);
        appendControls(row, categoryIndex, linkIndex);
        section.append(row);
      });
      const add = node("button", "add-to-category", "＋ 添加网站到此分类");
      add.type = "button";
      add.addEventListener("click", () => openEntry("website", categoryIndex));
      section.append(add);
      fragment.append(section);
    });
    if (!data.length) fragment.append(node("p", "editor-no-data", "还没有分类。先添加一个分类，开始整理你的导航。"));
    $("editor-list").replaceChildren(fragment);
    $("undo-edit").disabled = !previous;
    if (focusKey) $("editor-list").querySelector(`[data-focus="${focusKey}"]`)?.focus({ preventScroll: true });
  }

  function openEntry(kind, categoryIndex = null, linkIndex = null) {
    if (kind === "website" && !data.length) {
      notice("先添加一个分类，再把网站放进去。");
      openEntry("category");
      return;
    }
    const isWebsite = kind === "website";
    const existing = isWebsite ? (linkIndex === null ? null : data[categoryIndex].links[linkIndex]) : data[categoryIndex];
    editing = { kind, categoryIndex, linkIndex };
    $("entry-form").reset();
    $("entry-error").hidden = true;
    $("entry-name").setCustomValidity("");
    $("entry-url").setCustomValidity("");
    $("entry-title").textContent = `${existing ? "编辑" : "添加"}${isWebsite ? "网站" : "分类"}`;
    $("entry-name-label").textContent = isWebsite ? "网站名称" : "分类名称";
    $("entry-name").value = existing?.name || "";
    $("website-fields").hidden = !isWebsite;
    $("website-fields").disabled = !isWebsite;
    $("category-fields").hidden = isWebsite;
    $("category-fields").disabled = isWebsite;
    if (isWebsite) {
      const select = $("entry-category");
      select.replaceChildren();
      data.forEach((category, index) => select.add(new Option(category.name, String(index))));
      const filter = categoryFilter;
      select.value = String(categoryIndex ?? (filter === "all" ? 0 : Number(filter)));
      $("entry-url").value = existing?.url || "";
      $("entry-description").value = existing?.description || "";
      $("entry-keywords").value = existing?.keywords?.join(", ") || "";
    } else {
      const select = $("entry-icon");
      // 保留手工配置的未知图标，界面仍使用通用图标回退。
      select.querySelector('[data-custom]')?.remove();
      if (existing?.icon && ![...select.options].some(option => option.value === existing.icon)) {
        const option = new Option(existing.icon, existing.icon);
        option.dataset.custom = "true";
        select.add(option);
      }
      select.value = existing?.icon || "globe";
    }
    $("entry-dialog").showModal();
    $("entry-name").focus();
  }

  function saveEntry(event) {
    event.preventDefault();
    const name = text($("entry-name").value);
    if (!name) {
      $("entry-name").setCustomValidity("请输入名称，不能只包含空格。");
      $("entry-name").reportValidity();
      return;
    }
    const next = clone(data);
    const { kind, categoryIndex, linkIndex } = editing;
    let focusKey;
    if (kind === "website") {
      const url = validUrl($("entry-url").value);
      if (!url) {
        $("entry-url").setCustomValidity("请填写有效的 HTTP(S) 网址，且不能包含用户名或密码。");
        $("entry-url").reportValidity();
        return;
      }
      const destination = Number($("entry-category").value);
      const link = { name, url: url.href };
      const description = text($("entry-description").value);
      const keywords = $("entry-keywords").value.split(/[,，\n]/).map(text).filter(Boolean);
      if (description) link.description = description;
      if (keywords.length) link.keywords = keywords;
      let index;
      if (linkIndex !== null && categoryIndex === destination) {
        index = linkIndex;
        next[destination].links[index] = link;
      } else {
        if (linkIndex !== null) next[categoryIndex].links.splice(linkIndex, 1);
        index = next[destination].links.push(link) - 1;
      }
      categoryFilter = String(destination);
      focusKey = `link-${destination}-${index}-edit`;
    } else {
      const category = { name, icon: $("entry-icon").value, links: categoryIndex === null ? [] : next[categoryIndex].links };
      const index = categoryIndex === null ? next.push(category) - 1 : categoryIndex;
      next[index] = category;
      categoryFilter = String(index);
      focusKey = `category-${index}-edit`;
    }
    if (checkConflict()) {
      $("entry-error").textContent = "另一标签页已更新数据。本次表单尚未保存，请取消后载入最新修改，再重新编辑。";
      $("entry-error").hidden = false;
      return;
    }
    $("entry-dialog").close();
    commit(next, "修改已保存", focusKey);
  }

  function download(filename, contents, type) {
    const url = URL.createObjectURL(new Blob([contents], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notice(`已生成 ${filename}，请保存下载文件。`);
  }

  function buildLinksContent() {
    const site = typeof siteConfig === "object" && siteConfig ? siteConfig : {};
    const github = typeof githubConfig === "object" && githubConfig ? githubConfig : {};
    return "// 从站内编辑器导出。替换仓库中的 links.js 并提交即可发布。\n"
      + `const siteConfig = ${JSON.stringify(site, null, 2)};\n\n`
      + `const githubConfig = ${JSON.stringify(github, null, 2)};\n\n`
      + `const navigationData = ${JSON.stringify(data, null, 2)};\n`;
  }

  function exportLinks() {
    download("links.js", buildLinksContent(), "text/javascript;charset=utf-8");
  }

  function selectCopyContent() {
    const field = $("copy-content");
    field.focus();
    field.select();
    field.setSelectionRange(0, field.value.length);
  }

  async function copyLinks() {
    const button = $("copy-links");
    const contents = buildLinksContent();
    button.disabled = true;
    button.textContent = "正在复制…";
    try {
      // 仅在用户点击后写入剪贴板，不读取剪贴板内容。
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(contents);
      notice("已复制完整的 links.js。请在 GitHub 编辑页替换全部内容并提交。");
    } catch {
      // file://、非安全来源或权限被拒绝时，保留可手动复制的完整文本。
      notice("自动复制未完成，可在文本窗口中手动复制，或导出 links.js 文件。");
      $("copy-content").value = contents;
      if ($("editor-dialog").open) {
        $("copy-dialog").showModal();
        selectCopyContent();
      }
    } finally {
      button.disabled = false;
      button.textContent = "复制 links.js";
    }
  }

  async function importBackup(event) {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error("备份文件请小于 2 MB。");
      const record = JSON.parse(await file.text());
      if (record.version !== 1) throw new Error("请选择编辑器导出的 JSON 备份（版本 1）。");
      const next = normalizeData(record.categories, true);
      const count = next.reduce((total, category) => total + category.links.length, 0);
      ask("导入备份", `用备份中的 ${next.length} 个分类、${count} 个网站替换当前导航？操作后可以撤销。`, () => {
        categoryFilter = "all";
        commit(next, "备份已导入");
      });
    } catch (error) {
      notice(`没有导入：${error instanceof SyntaxError ? "文件不是有效的 JSON 备份。" : error.message}`, true);
    }
  }

  function init(options) {
    ({ onChange, validUrl, createIcon } = options);
    source = normalizeData(Array.isArray(options.source) ? options.source : []);
    readLocal();
    renderList();
    $("edit-link").addEventListener("click", () => { checkConflict(); $("editor-dialog").showModal(); });
    document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => $(button.dataset.close).close()));
    $("add-website").addEventListener("click", () => openEntry("website"));
    $("add-category").addEventListener("click", () => openEntry("category"));
    $("editor-category-filter").addEventListener("change", event => {
      categoryFilter = event.target.value;
      renderList();
    });
    $("entry-form").addEventListener("submit", saveEntry);
    ["entry-name", "entry-url"].forEach(id => $(id).addEventListener("input", () => $(id).setCustomValidity("")));
    $("undo-edit").addEventListener("click", () => {
      if (!previous || checkConflict()) return;
      const restored = previous;
      previous = null;
      data = restored;
      categoryFilter = "all";
      persist("已撤销上一步");
      onChange(data);
      renderList();
    });
    $("confirm-action").addEventListener("click", () => {
      const action = confirmation;
      confirmation = null;
      $("confirm-dialog").close();
      action?.();
    });
    $("confirm-dialog").addEventListener("close", () => { confirmation = null; });
    $("export-links").addEventListener("click", exportLinks);
    $("copy-links").addEventListener("click", copyLinks);
    $("select-copy-content").addEventListener("click", selectCopyContent);
    $("copy-dialog").addEventListener("close", () => {
      if ($("editor-dialog").open) $("copy-links").focus();
    });
    $("export-backup").addEventListener("click", () => download("navigation-backup.json", JSON.stringify({ version: 1, categories: data }, null, 2), "application/json;charset=utf-8"));
    $("import-backup").addEventListener("click", () => $("import-file").click());
    $("import-file").addEventListener("change", importBackup);
    $("restore-source").addEventListener("click", () => ask("恢复站点版本", "将以网站发布的配置替换当前浏览器中的导航。建议先导出备份；恢复后也可以撤销。", () => {
      categoryFilter = "all";
      commit(clone(source), "已恢复站点版本");
    }));
    $("reload-local").addEventListener("click", () => ask("载入最新修改", "以另一标签页保存的数据替换当前显示。若要保留当前内容，请先取消并导出备份。", () => {
      readLocal();
      previous = null;
      categoryFilter = "all";
      onChange(data);
      renderList();
    }));
    window.addEventListener("storage", event => {
      if (event.key === storageKey || event.key === null) checkConflict();
    });
    window.addEventListener("beforeunload", event => {
      if (unsaved) { event.preventDefault(); event.returnValue = ""; }
    });
    return data;
  }

  return { init };
})();
