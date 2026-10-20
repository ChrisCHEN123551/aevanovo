# AEVANOVO 艾芙诺官网与内容编辑器

这个文件夹可直接上传 GitHub Pages。无需安装依赖，无需构建。

## 需要上传的文件

- index.html：官网页面，必须上传到仓库根目录。
- media/：产品配图与原版 DNA 连续画面目录，需保留目录名称与内部文件一起上传。DNA 使用 dna-motion-000.jpg 至 dna-motion-080.jpg，共 81 张。
- dna-desktop-hd.mp4、dna-mobile-hd.mp4、dna-mobile.mp4、dna-compatible.webm：保留的原版视频素材；当前官网播放不依赖这些文件。
- .nojekyll：关闭默认的 Jekyll 处理，建议一起上传。文件是空的，正常。
- CNAME：指定自定义域名 aevanovo.eu.cc，请一起上传。
- admin.html：中文内容编辑器入口。
- content-admin.css、content-admin.js、content-core.js：编辑器样式与发布功能，必须一起上传。
- 内容编辑使用说明.md：首次授权与日常编辑说明，可选。
- README.md：这份说明，可选。

## 发布步骤

1. 新建一个 GitHub 公开仓库，例如 aevanovo-website。
2. 在仓库中选择 Add file → Upload files，上传本文件夹里面的文件（不要把整个文件夹嵌套上传）。
3. 提交文件后，打开 Settings → Pages。
4. 在 Build and deployment 下选择 Deploy from a branch，分支选择 main，文件夹选择 / (root)，点击 Save。
5. 等待发布完成，再在 Pages 设置页面点击 Visit site 查看实际网址。

## 版本说明

内容使用整理时的线上已发布版本快照，包括五个产品板块和已发布的联系方式。

这个版本保留 DNA 背景动效、品牌介绍、技术平台、五个产品板块、中英文切换及咨询摘要。2026-10-13 更新了阅读排版、单板块展开、手机菜单、章节导航与公开商务联系方式。咨询摘要可打开邮件草稿，由访客在邮件应用中确认发送；页面不会自动收取或发送咨询。2026-10-19 新增静态内容编辑器，入口为 /admin.html。编辑器通过 GitHub 授权直接提交仓库，使用 GitHub 的版本历史与 GitHub Pages 发布；不依赖旧 Sites 后台或单独数据库。原有 Sites 管理后台的修改不会同步到这个版本。

2026-10-13 清晰度优化：沿用原版 DNA 素材、轮廓、比例、左倾、放大及章节镜头。桌面保留 1080 像素的原始画面高度，手机提高至 960 像素，并做轻度锐化。画面仅去除原方形显示窗口以外未展示的左右边缘；屏幕中的形状和取景保持一致。

2026-10-19 连续画面兼容修复：当前官网使用从同一原版高清素材中导出的 81 张 1080 × 1080 JPEG 图片，随滚动与章节切换逐帧显示。DNA 外形、取景与章节镜头参数保持一致；不再请求或解码视频，也不依赖自动播放权限。图片总计约 5.4 MB，按需加载，最多同时加载 4 张，已解码缓存限制为手机 8 张、桌面 12 张；原有内置封面继续保证正文先显示。

右下角常驻“播放 DNA 动效”按钮，点击会演示一次往返旋转。系统开启减少动态效果时显示“启用 DNA 动效”，由访客主动启用。图片请求失败时可点击“重试 DNA 动效”。请同时上传 media/ 内的 81 张 DNA JPEG 图片和产品配图。

页面样式、脚本和封面包含在 index.html 中，无需构建。

不要上传旧项目的 node_modules、.git、.dev.vars、.env、.wrangler、.sites-runtime 或数据库文件。编辑器代码本身不包含密钥、账户凭据或用户咨询数据；请勿把 GitHub 授权码写入任何仓库文件。

GitHub Pages 文档：https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## 自定义域名 aevanovo.eu.cc

上传包包含 CNAME 文件，内容为 aevanovo.eu.cc。

先在仓库 Settings → Pages 中设置 Custom domain 为 aevanovo.eu.cc 并保存，再通过域名管理平台设置指向 GitHub Pages 的 DNS 记录。目标地址需根据实际 GitHub 用户名或组织名称确定，不包含仓库路径。具体主机记录名称取决于域名管理平台提供的 DNS 区域，不能直接照抄其他域名的设置。

DNS 配置与域名验证完成后，检查 Pages 的 HTTPS 状态并开启 Enforce HTTPS。

自定义域名文档：https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site


## 在线内容编辑（2026-10-19）

地址：https://aevanovo.eu.cc/admin.html

支持 27 项中英文内容、商务邮箱/电话/地址、1 张品牌图片与 5 张产品板块图片、实时预览、草稿恢复及 JSON 内容备份。原始品牌内容及 DNA 形状、镜头、比例、倾斜、时间线保持不变。未传图片时，官网保持原有布局。

“草稿”仅保存在当前浏览器 localStorage，不会自动同步到其他设备。“确认发布”使用 GitHub REST API，将 index.html 与新增图片通过一个 Git 提交写入 main，再由 GitHub Pages 更新官网。版本冲突会阻止发布，不会强制覆盖。显示“已提交”只代表 GitHub 保存完成，只有读回官网内容一致后才显示“已上线”。

发布需要细粒度 GitHub Personal Access Token，仅选择 aevanovo 仓库，Contents: Read and write，建议 30 天有效期。授权码只在当前页面内存中使用，不写入 localStorage/sessionStorage、URL、文件或仓库；刷新/退出后需重新输入。浏览器仅将授权码发送至 https://api.github.com。创建授权码需本人在 GitHub 完成。

图片在浏览器中压缩为 WebP，并存放于仓库 media/ 目录；单张原图上限 5 MB，最长边压缩到 1400 像素，压缩后不超过约 310 KB。移除图片不会删除 Git 历史中的旧文件，便于恢复。

本后台管理公开网站内容；访客咨询表单仍使用原有邮件草稿方式，不会收集到后台。

技术依据：
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- https://docs.github.com/en/rest/git/trees
- https://docs.github.com/en/rest/git/commits
- https://docs.github.com/en/rest/git/refs


## 五大产品板块图文展示（2026-10-19）

五大板块已采用编号、缩略图、中英文标题、展开大图和完整介绍的图文布局。手机默认展示五个入口，桌面默认展开重组胶原蛋白。每个板块可直接进入对应咨询方向。直接入口：https://aevanovo.eu.cc/#catalog

原始配图保存在 media/aevanovo-portfolios-20261019.png，保持用户提供的原始像素，通过 CSS 视窗分别展示五幅画面，同一张图片由浏览器缓存复用。请不要遗漏这个目录；替换图片、修改中英文介绍仍可通过后台完成。后台更换为其他图片后会自动使用普通图片布局。


## 四大核心技术平台（2026-10-19）

“走近技术平台”详情采用四个编号图文段落：精准分子设计、高通量筛选验证、重组表达与生物制造、质量分析与结构表征。包含用户提供的中文介绍、宣传语、关键词及对应英文，支持四个平台快速跳转，关闭按钮固定在详情页顶部；手机按图片与文字单列阅读。

配图保持附件原始像素，保存在 media/aevanovo-technology-20261019.png，通过 CSS 分别展示四个画面；不会在首页初始化时解码四份独立大图。后台“技术平台”继续支持四个平台的中英文名称和介绍编辑。原有 DNA 连续画面、其他页面文案、联系方式和内容发布机制保持不变。


## 品牌介绍背景图（2026-10-19）

“了解 AEVANOVO”详情使用用户提供的 DNA 背景图，原图保存在 media/aevanovo-brand-background-20261019.png。桌面与手机使用不同的浅色遮罩和取景，保证正文可读。后台“品牌图片”现作为这一个详情页的背景；更换或移除时均可实时预览。品牌文案、技术平台、产品板块及首页 DNA 动效保持不变。直接入口：/#brand。


## 技术平台全景图文排版（2026-10-19）

已采用 Product Design 第 2 张选定方案：暖白与浅米色分区、横向科学大图、衬线编号与分栏介绍。四幅配图使用用户提供的新版附件，保存在 media/aevanovo-technology-warm-20261019.png；页面按各画面原始比例显示并适配手机。四个平台的全部“技术关键词”区域已移除。原有四个平台的中英文名称、宣传语、完整介绍和后台字段保留；导航与英文副标题会随后台名称同步更新。品牌介绍背景、其他页面和 DNA 动效不变。


## DNA 切换平滑更新（2026-10-20）

已取消“播放 DNA 动效”按钮。保留原版 DNA 外形和章节镜头，81 张原始 1080px JPEG 被封装到 media/dna-motion-stream-20261020.bin，通过一个渐进请求传输；图像在本地提前解码，并在固定 Canvas 上连续绘制相邻画面的插值。页面不再在切换时逐张下载并替换 DOM 图片，前后切换也不会重复请求单张帧图。已解码缓存限制为手机 16 张、桌面 24 张；页面正文不等待动效下载，网络较慢时先显示原版内置封面并保持页面切换。系统“减少动态效果”设置继续生效。请上传新的 .bin 文件及 index.html，原始素材文件可保留。
