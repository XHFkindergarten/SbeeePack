/**
 * handle imports in file
 */
import { init, parse } from 'es-module-lexer'
import { ImportType } from '../type'
import { EXT_PKG_PREFIX } from './constant'

/**
 * get the imports statement in code
 */
export const scanImportsFromFile = async (
  contents: string | Buffer
): Promise<ImportType[]> => {
  // 这里类似是一个约定
  // 如果被 finalize 过的内容是 Buffer，那么代表这个文件被认为是不需要任何处理的 static file
  // 如果是 content 说明仍处于编译过程当中
  if (typeof contents !== 'string') {
    return []
  }

  // 等待 es-module-lexer 初始化完成（？？？这个 parser 不只是运行时
  await init

  const [imports] = parse(contents)

  const importNames = imports.map((imp) => ({
    name: imp.n as string,
    start: imp.s,
    end: imp.e
  }))

  return importNames
}

const REPLACE_STR =
  '全体目光向我看齐我宣布个事儿我是个伞兵没毛病嗷(抱拳)全体目光向我看齐我宣布个事儿我是个伞兵没毛病嗷(抱拳)全体目光向我看齐我宣布个事儿我是个伞兵没毛病嗷(抱拳)全体目光向我看齐我宣布个事儿我是个伞兵没毛病嗷(抱拳)'

/**
 * change the imports of a file so that we can recognize it correctly
 */
export const transformImports = (
  contents: string,
  imports: ImportType[]
): string => {
  for (let i = 0; i < imports.length; i++) {
    const imp = imports[i]
    const { name, start, end } = imp
    // 相对路径引用不做处理
    if (name.includes('.')) {
      continue
    }
    const precontent = contents.substring(0, start)
    const aftercontent = contents.substring(end, contents.length)
    contents =
      precontent +
      new Array(end - start).fill(REPLACE_STR[i]).join('') +
      aftercontent
  }
  for (let i = 0; i < imports.length; i++) {
    const imp = imports[i]
    const { name, start, end } = imp
    // 相对路径引用不做处理
    if (name.includes('.')) {
      continue
    }
    contents = contents.replace(
      new Array(end - start).fill(REPLACE_STR[i]).join(''),
      `${EXT_PKG_PREFIX}/${name}`
    )
  }
  return contents
}
