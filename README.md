# Lite Navigation

一个简洁、轻量、可以长期自己维护的个人网址导航站。原生 HTML + CSS + JavaScript，直接部署到 GitHub Pages。点击右上角 **编辑导航**，即可在网站内管理链接，无需手写配置。

没有框架、构建步骤、npm、数据库、登录系统或后端服务。页面字体和分类图标均来自本地或系统，只有网站 favicon 会请求外部资源。

## Features

- **可视化编辑**：表单新增、修改网站与分类；修改所属分类、调整顺序、删除和撤销上一步。
- **浏览器保存**：保存后页面即时更新，刷新后保留；提供 JSON 备份导入、导出和恢复站点版本。
- **一键复制发布**：点击「复制 links.js」即可复制完整配置，粘贴到 GitHub 编辑页并提交；也支持导出文件和手工维护。
- **即时搜索**：匹配网站名称、描述、关键词和分类；支持中英文、不区分大小写、多个关键词共同匹配。
- **分类筛选**：点击分类只看这一组；可以与搜索同时使用。空分类自动隐藏。
- **自动 favicon**：目标站图标 → Google favicon 服务 → 网站名称首字符；请求失败或超时均不影响使用。
- **三种主题**：System（默认）→ Light → Dark，点击右上角按钮循环切换；保存选择并跟随系统主题变化。
- **响应式卡片**：大屏 5 列、普通桌面 4 列、平板 2–3 列、手机 2 列、340px 及以下 1 列。
- **键盘与可访问性**：`/` 聚焦搜索；`Esc` 清空搜索、恢复全部分类并退出输入框；支持键盘焦点和减少动态效果设置。
- **开箱即用**：20 张示例卡片，覆盖常用、科研、AI、Development 和 Cloud；重复出现在不同分类的网站会分别计数。
- **外链新标签打开**：统一使用 `target="_blank"` 和 `rel="noopener noreferrer"`。

## Project structure

```text
personal-navigation/
├── index.html     # 语义化页面结构
├── style.css      # 布局、响应式、配色和细微动效
├── app.js         # 渲染、搜索、主题、URL 校验、图标回退
├── editor.js      # 可视化编辑、浏览器保存、备份、发布配置复制与导出
├── links.js       # 已发布的网站数据、页面信息和 GitHub 配置
├── favicon.svg    # 本站浏览器标签图标，不是各网站的图标
├── .nojekyll      # 跳过 Jekyll，按静态文件发布
└── README.md      # 使用与部署说明
```

不需要 `.github/workflows/deploy.yml`、`package.json` 或 `node_modules`。

## Quick Start

1. 下载项目，或在创建自己的 GitHub 仓库后将其克隆到本地。
2. **直接用浏览器打开 `index.html`**，无需安装任何工具。
3. 点击右上角 **编辑导航**，添加分类和网站，填写表单后点击 **保存**。
4. 按下方步骤启用 Pages；需要把可视化修改发布到所有设备时，点击 **复制 links.js**，在 GitHub 编辑页替换全部内容并提交；也可以导出文件后上传替换。
5. 页面标题和 GitHub 仓库信息仍在 `links.js` 的 `siteConfig`、`githubConfig` 中设置，复制和导出都会保留这些配置。

如果习惯在本地 HTTP 环境预览，也可以使用编辑器的静态预览扩展；或者在已安装 Python 时运行：

```sh
python -m http.server 8000
```

随后打开 `http://localhost:8000`。这只是可选的本地预览方式，线上不需要服务器。

## Visual editor

点击右上角 **编辑导航**：

| 操作 | 使用方法 |
| --- | --- |
| 添加网站 | 点击「添加网站」或某个分类底部的添加按钮，填写名称、网址、分类，简介和关键词可选 |
| 编辑网站 | 点击网站行右侧的铅笔按钮，可修改内容或移动到其他分类 |
| 添加 / 编辑分类 | 点击「添加分类」或分类标题右侧的铅笔按钮，填写名称并选择内置图标 |
| 调整顺序 | 使用 ↑ / ↓；网站在所属分类内排序，分类在整个导航中排序 |
| 删除 | 点击 ×；删除分类时会提示包含的网站数量并要求确认 |
| 撤销 | 「撤销上一步」可还原最近一次修改、排序、删除、导入或恢复操作；关闭编辑器后仍可撤销，刷新后不保留撤销记录 |
| 备份 / 迁移 | 「导出备份」保存 JSON 文件；在其他浏览器或设备上「导入备份」，预览数量并确认替换 |
| 直接复制 | 「复制 links.js」将完整发布配置复制到剪贴板，粘贴到 GitHub 的同名文件编辑页并提交 |
| 文件发布 | 「导出 links.js」，用下载文件替换 GitHub 仓库中的同名文件并提交；内容与直接复制一致 |
| 恢复 | 「恢复站点版本」恢复当前部署的 `links.js` 内容，同时清除此浏览器的覆盖配置 |

**保存范围：**可视化编辑保存在当前浏览器的 `localStorage`。它不会自动写入本地磁盘上的 `links.js` 或 GitHub 仓库，不会自动同步到其他设备，也不会修改其他访客看到的内容。导航站依然没有登录、后台或访问令牌。

**直接复制发布：**编辑导航 → 复制 links.js → 打开 GitHub 编辑页 → 全选原文件内容并粘贴替换 → Commit changes → Pages 更新。详细步骤见下方的「Copy and publish」。

**数据优先级：**当前浏览器保存的版本优先于已发布的 `links.js`。若发布配置发生变化，编辑器会提醒；先导出备份，再点击「恢复站点版本」即可使用新版。不同项目路径的本地数据彼此隔离，`/repository/` 与 `/repository/index.html` 共用同一份；本地文件、HTTP 预览、GitHub Pages 和自定义域名之间的浏览器数据不会自动迁移。

**存储异常：**存储禁用或已满时，编辑仍可在当前页面使用，但会明确提示刷新会丢失修改，应先导出备份。其他标签页修改了同一份数据时，编辑器会提示载入最新版本，避免旧页面覆盖新修改。

导入只接受编辑器导出的版本 1 JSON 备份（最多 2 MB），会校验全部网站后再让你确认替换，不执行导入文件中的 JavaScript。备份包含分类和网站；站点标题与 GitHub 配置保留各设备当前加载的设置。要分享完整发布配置，请使用「复制 links.js」或「导出 links.js」。

## Copy and publish

日常编辑后，可以直接复制配置，不必先下载文件：

1. 点击右上角 **编辑导航**，完成网站或分类修改，并在表单中点击 **保存**。
2. 点击编辑器底部的 **复制 links.js**。
3. 看到「已复制完整的 links.js」提示后，点击 **打开 GitHub 编辑页**。该入口需要先填写 `githubConfig`；也可以手动在自己的仓库中打开 `links.js` 并点击编辑。
4. 在 GitHub 文件编辑区**全选原有内容并粘贴替换**。不要把新配置追加到原文件后面，也不要添加 Markdown 代码块标记。
5. 点击 **Commit changes**，将修改提交到 Pages 使用的分支（通常是 `main`），等待 Pages 发布完成。

复制内容包含当前加载的 **`siteConfig`、`githubConfig` 和编辑后完整的 `navigationData`**，包括所有分类、网站、描述、关键词及顺序。复制范围不受当前搜索或分类筛选影响，内容与「导出 links.js」下载的文件完全一致。只复制已点击保存的修改。

如果浏览器不支持自动复制或拒绝剪贴板权限，会打开 **复制发布配置** 窗口，完整文本会自动选中。按 **Ctrl+C**（Mac 使用 **⌘C**），或在手机上长按复制；也可以点击 **全选内容** 后再复制。仍不方便时，可使用原来的「导出 links.js」下载方式。自动复制通常需要 HTTPS 或 localhost，实际支持情况由浏览器决定。

复制成功仅表示配置进入了剪贴板，**并不表示已经提交到 GitHub 或完成发布**。本站只在你点击复制按钮后写入剪贴板，不读取剪贴板内容。

## Add a website

推荐使用 **编辑导航 → 添加网站 → 保存**；名称和网址必填，关键词使用英文或中文逗号分隔。没有分类时会先引导添加分类。

也可以手工编辑 `links.js`：找到目标分类的 `links` 数组，复制一条对象并修改：

```javascript
{
  name: "New Website",
  url: "https://example.com",
  description: "Example",
  keywords: ["example", "示例"]
},
```

只需要 `name` 和 `url`：

```javascript
{ name: "Example", url: "https://example.com" },
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 网站名称；超长时截断，悬停查看完整信息 |
| `url` | 是 | 以 `https://` 或 `http://` 开头的完整地址 |
| `description` | 否 | 卡片上的次级文字，也参与搜索 |
| `keywords` | 否 | 字符串数组，可以同时填写中英文 |

删除网站：删除对应对象。调整顺序：移动对象的位置。**这些操作都不需要改 HTML 或应用逻辑。**

缺少名称、URL 无效、非 HTTP(S) 协议或包含用户名密码的 URL 会被跳过，并在浏览器控制台提示。URL 校验只检查基本格式，不检测目标网站是否可访问。可选字段缺失或类型不正确会被忽略。

这是 JavaScript 配置文件：每条对象之间保留逗号，配对书写引号和括号。如果引号、逗号或括号写错，浏览器将无法读取整个配置；修正后刷新即可。

## Add a category

推荐使用 **编辑导航 → 添加分类**，填写名称并选择图标。空分类在编辑器中可见，首页在添加网站后才会显示。

手工配置时，在 `navigationData` 数组中增加：

```javascript
{
  name: "Reading",
  icon: "globe",
  links: [
    {
      name: "Wikipedia",
      url: "https://www.wikipedia.org",
      description: "The free encyclopedia",
      keywords: ["reading", "百科"]
    }
  ]
},
```

分类顺序就是数组顺序。`icon` 可选，内置 `star`、`microscope`、`sparkles`、`code`、`cloud`、`globe`；未知或缺失时使用 globe。不需要下载图片。缺失分类名称时显示 `Uncategorized`，空分类不显示。

## Change site title

同样在 `links.js` 修改：

```javascript
const siteConfig = {
  title: "Rein’s Navigation", // 页眉和浏览器标签标题
  eyebrow: "A PERSONAL COLLECTION",
  heading: "Where do you want to go?",
  description: "A quiet home for your everyday internet.",
};
```

配色只需调整 `style.css` 顶部的 CSS Variables。本站标签图标可以替换 `favicon.svg`；网站卡片的图标仍然自动获取。

## Change GitHub configuration

修改 `links.js` 中的三个字段，不要把完整 URL 填进用户名或仓库名：

```javascript
const githubConfig = {
  username: "YOUR_USERNAME",       // 例如 octocat
  repository: "YOUR_REPOSITORY",  // 例如 personal-navigation
  branch: "main",
};
```

设置后：

- **GitHub** 打开你的仓库首页。
- **编辑导航** 始终打开站内编辑器，不需要配置 GitHub 即可使用。
- 编辑器底部的 **打开 GitHub 编辑页** 打开 `https://github.com/USERNAME/REPOSITORY/edit/main/links.js`。
- 没有填写真实仓库信息时，仅隐藏 GitHub 编辑页入口。
- 非 `main` 分支请同步修改 `branch` 和 Pages 发布来源。

之后可以直接：**导航站 → 编辑导航 → 复制 links.js → GitHub 编辑页粘贴替换 → Commit changes → 等待 Pages 更新**。提交操作使用 GitHub 自身的登录和仓库权限，导航站不包含登录系统。

## Deploy to GitHub Pages

1. 在 GitHub 新建一个公开仓库，例如 `personal-navigation`。
2. 将上面八个文件放在仓库的 **根目录** 并提交到 `main`；请一并提交隐藏文件 `.nojekyll`。
3. 进入仓库 **Settings → Pages**。
4. 在 **Build and deployment → Source** 选择 **Deploy from a branch**。
5. Branch 选择 **main**，文件夹选择 **/ (root)**，点击 **Save**。
6. 等待 Pages 发布完成，然后访问：

   ```text
   https://USERNAME.github.io/REPOSITORY/
   ```

7. 以后修改 `links.js` 并提交到同一分支，Pages 会自动更新。

所有本地资源均使用 `./` 相对路径，普通仓库子路径、`USERNAME.github.io` 根站点和自定义域名均可使用。不设置 base URL，也不需要构建。

项目不提供自定义 Actions 工作流；GitHub 自己仍会产生 Pages 部署任务，可在仓库的 **Actions** 页查看发布进度。分支发布方式和设置说明见 [GitHub 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## Custom domain

以 `nav.example.com` 为例：

1. 先在仓库 **Settings → Pages → Custom domain** 输入 `nav.example.com` 并保存。
2. GitHub 的分支发布会自动在仓库根目录创建 `CNAME` 文件，其内容仅一行：

   ```text
   nav.example.com
   ```

3. 在域名的 DNS 管理页面添加：

   | 类型 | 名称 / 主机记录 | 目标 / 值 |
   | --- | --- | --- |
   | CNAME | `nav` | `USERNAME.github.io` |

   DNS 目标不包含 `https://`，也不包含 `/REPOSITORY/`。

4. 等待 DNS 验证和 HTTPS 证书就绪，在 Pages 中启用 **Enforce HTTPS**。
5. 后续提交时保留仓库的 `CNAME`；在本地继续工作前先拉取 GitHub 自动创建的提交。

只有确定绑定域名时才添加 `CNAME`。单独提交这个文件不能代替 Pages 中的 Custom domain 设置。DNS 生效可能需要最多 24 小时，详见 [GitHub 官方自定义域名说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)。

## Favicon behavior

每个网站首先尝试其 HTTPS 根路径下的 `/favicon.ico`；失败或 3.5 秒内未完成，再请求 Google favicon 服务；再次失败或超时则保留网站名称首字符。HTTP 网站链接本身不变，图标使用 HTTPS 避免混合内容。无需在 `links.js` 中维护图片地址。

首字符从首次渲染就占据固定尺寸，图标到达后替换，因此没有图片引起的卡片跳动。多个分类中的相同 origin 共享一次图标探测。少数网站不提供标准路径图标，或第三方服务只能返回通用图标，都不会影响链接打开。

自动图标请求会访问目标网站，回退请求还会把目标域名提供给 Google；这些请求使用 `no-referrer`。页面没有分析统计、Cookie 或后台 API，`localStorage` 保存主题偏好和你在编辑器中保存的导航数据。断网时直接打开本地 `index.html` 仍可显示卡片、搜索和编辑，图标显示首字符；没有加入 Service Worker 或离线缓存机制。

## Troubleshooting

- **没有卡片**：检查 `links.js` 的逗号、引号、括号和字段；清空搜索，并选择 All websites。
- **图标缺失**：通常是网站不提供 favicon 或网络阻止了请求；自动回退，不需要手动处理。
- **主题未保存**：浏览器可能限制了本地存储；本次切换仍可使用。`file://` 下的存储策略因浏览器而异，可在 HTTP 预览或 Pages 上确认。
- **页面没有更新**：查看 Actions 中 Pages 部署是否完成，再刷新缓存；确认修改提交到了 Pages 选定的分支。
- **发布后仍显示旧链接**：如果本浏览器保存过可视化修改，先导出备份，再在编辑器中「恢复站点版本」。
- **换设备后没有修改**：本地保存不跨设备同步。导入 JSON 备份，或将导出的 `links.js` 发布到仓库。
- **编辑器打不开**：确认 `editor.js` 和更新后的 `index.html`、`app.js`、`style.css` 一并上传，文件名大小写一致。
- **自动复制失败**：在弹出的文本窗口手动复制全部内容，或使用「导出 links.js」。剪贴板被浏览器限制不影响编辑和保存。
- **404 或样式缺失**：确认 `index.html` 在发布目录根部、全部文件已提交、文件名大小写一致；不要给资源路径添加开头的 `/`。
- **搜索范围**：搜索在当前分类内执行；All websites 恢复全局范围。`Esc` 一次清空搜索和分类筛选。清除框内的 × 只清空文字，保留当前分类。
