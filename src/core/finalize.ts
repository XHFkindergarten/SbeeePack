/**
 * sbeepack 内部处理打包产物
 */

/**
 * HTML
 */
export const finalizeHtml = (html: string): Buffer => {
  /**
   * 将一些 env 中定义的变量，例如 pageTitle 等
   * 插入到 html 文件中去
   */

  /**
   * 向 html 中插入一些自定义的 scripts
   */
  const customScript =
    '<script type="text/javascript">document.title = "Sbeepack Page"</script>'

  /**
   * 将这些标签插入到 html 的 Header 中去
   */
  html = injectScript2Html(customScript, html)
  return Buffer.from(html)
}

const injectScript2Html = (scripts: string, html: string): string => {
  // 只需要找到 head 的闭合标签 replace 一下就好惹
  return html.replace(/<\/head>/i, (endHead) => `${scripts}\n${endHead}`)
}

/**
 * JS
 */
export const finalizeJs = (js: string): string => {
  // 当 JS 中使用了一些全局 env 变量，或是框架自己定义的语法时
  // 需要在此处进行注入

  // 就整个正则什么的替换一下就好了
  // 反正只要不用 babel，怎么都可以

  return js
  // return Buffer.from(js)
}
