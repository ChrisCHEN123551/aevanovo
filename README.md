# AEVANOVO 艾芙诺官网展示版

这个文件夹可直接上传 GitHub Pages。无需安装依赖，无需构建。

## 需要上传的文件

- index.html：完整官网，必须上传到仓库根目录。
- .nojekyll：关闭默认的 Jekyll 处理，建议一起上传。文件是空的，正常。
- README.md：这份说明，可选。

## 发布步骤

1. 新建一个 GitHub 公开仓库，例如 aevanovo-website。
2. 在仓库中选择 Add file → Upload files，上传本文件夹里面的文件（不要把整个文件夹嵌套上传）。
3. 提交文件后，打开 Settings → Pages。
4. 在 Build and deployment 下选择 Deploy from a branch，分支选择 main，文件夹选择 / (root)，点击 Save。
5. 等待发布完成，再在 Pages 设置页面点击 Visit site 查看实际网址。

## 版本说明

内容使用整理时的线上已发布版本快照，包括五个产品板块和已发布的联系方式。

这个版本保留滚动视频、品牌介绍、技术平台、五个产品板块、中英文切换及咨询摘要。它只展示内容，没有在线管理后台或云端数据库；以后可通过 GitHub 修改 index.html 并重新发布。原有 Sites 管理后台的修改不会自动同步到这个版本。

页面样式与脚本已包含在 index.html 中；字体和背景视频仍从原参考设计提供的外部地址加载。视频加载失败时会显示备用视觉，也可点击“跳过加载”进入页面。

不要上传旧项目的 node_modules、.git、.dev.vars、.env、.wrangler、.sites-runtime、在线后台或数据库文件。当前展示版本没有密钥、账户凭据或用户咨询数据。

GitHub Pages 文档：https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
