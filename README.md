# AEVANOVO 艾芙诺官网展示版

这个文件夹可直接上传 GitHub Pages。无需安装依赖，无需构建。

## 需要上传的文件

- index.html：官网页面，必须上传到仓库根目录。
- dna-desktop.mp4：桌面版原版 DNA 动效，必须上传到同一个根目录。
- dna-mobile.mp4：手机版原版 DNA 动效，必须上传到同一个根目录。
- .nojekyll：关闭默认的 Jekyll 处理，建议一起上传。文件是空的，正常。
- CNAME：指定自定义域名 aevanovo.eu.cc，请一起上传。
- README.md：这份说明，可选。

## 发布步骤

1. 新建一个 GitHub 公开仓库，例如 aevanovo-website。
2. 在仓库中选择 Add file → Upload files，上传本文件夹里面的文件（不要把整个文件夹嵌套上传）。
3. 提交文件后，打开 Settings → Pages。
4. 在 Build and deployment 下选择 Deploy from a branch，分支选择 main，文件夹选择 / (root)，点击 Save。
5. 等待发布完成，再在 Pages 设置页面点击 Visit site 查看实际网址。

## 版本说明

内容使用整理时的线上已发布版本快照，包括五个产品板块和已发布的联系方式。

这个版本保留 DNA 背景动效、品牌介绍、技术平台、五个产品板块、中英文切换及咨询摘要。2026-10-13 更新了阅读排版、单板块展开、手机菜单、章节导航与公开商务联系方式。咨询摘要可打开邮件草稿，由访客在邮件应用中确认发送；页面不会自动收取或发送咨询。它只展示内容，没有在线管理后台或云端数据库；以后可通过 GitHub 修改 index.html 并重新发布。原有 Sites 管理后台的修改不会自动同步到这个版本。

2026-10-13 动效恢复：使用原版 DNA 视频素材，保留左倾、放大及章节切换效果。视频已压缩，桌面版约 2.1 MB，手机版约 0.9 MB，并随本网站一起托管。网页会先显示内置的原版封面，视频加载不会阻止正文、菜单和咨询入口；外部字体依赖和加载遮罩已移除。线条箭头保留。

页面样式、脚本和封面包含在 index.html 中；两份 MP4 必须与 index.html 一起上传。无需构建。

不要上传旧项目的 node_modules、.git、.dev.vars、.env、.wrangler、.sites-runtime、在线后台或数据库文件。当前展示版本没有密钥、账户凭据或用户咨询数据。

GitHub Pages 文档：https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## 自定义域名 aevanovo.eu.cc

上传包包含 CNAME 文件，内容为 aevanovo.eu.cc。

先在仓库 Settings → Pages 中设置 Custom domain 为 aevanovo.eu.cc 并保存，再通过域名管理平台设置指向 GitHub Pages 的 DNS 记录。目标地址需根据实际 GitHub 用户名或组织名称确定，不包含仓库路径。具体主机记录名称取决于域名管理平台提供的 DNS 区域，不能直接照抄其他域名的设置。

DNS 配置与域名验证完成后，检查 Pages 的 HTTPS 状态并开启 Enforce HTTPS。

自定义域名文档：https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
