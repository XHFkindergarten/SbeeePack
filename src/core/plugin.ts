/**
 * Plugins
 */

import { getExt, readFileContent } from './utils'

/**
 * 遍历所有的 plugins
 * 如果有 plugin 的 resolve 函数命中了这个文件的路径
 * 那么将会执行 plugin 的 loader 函数对文件内容进行处理
 * 否则文件原内容继续进入下一个流水线
 * @param loc 文件地址
 */
export const runPipelineLoaders = async (loc: string, config: any) => {
  // 打包结果
  const result = {}

  // 获取目标文件的 extension
  const ext = getExt(loc)

  const { plugins = [] } = config

  for (let plugin of plugins) {
    if (plugin.resolve.input.some((afterfix) => afterfix === ext)) {
      const res = await plugin.load(loc)

      for (let key in res) {
        result[key] = res[key]
      }
    }
  }

  if (Object.keys(result).length === 0) {
    // 没有 plugin 命中，直接读取文件内容返回
    const code = await readFileContent(loc)
    return {
      [`.${ext}`]: {
        code
      }
    }
  }

  return result
}
