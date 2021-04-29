import FileBuilder, { getFileBuilder } from './fileBuilder'
import { getExt } from './utils'
import mime from 'mime-types'

/**
 * 根据【文件地址】获取【文件内容】
 */
export const fetchFile = async (
  reqUrl: string,
  path: string,
  configOptions: any
): Promise<any> => {
  // 检查这个文件是否存在 FileBuilder 实例
  const existFileBuilder = getFileBuilder(reqUrl)

  // 资源类型
  const resourceType = getExt(path)

  let finalizeResult

  let resolvedImports

  if (existFileBuilder === null) {
    // 不存在 FileBuilder 实例
    const fb = new FileBuilder(reqUrl, path, configOptions)

    // 如果文件没有打过包
    if (Object.keys(fb.buildResult).length === 0) {
      await fb.build()
    }

    // 获取内部 import 依赖
    resolvedImports = await fb.resolveImports()

    // 读取最终的编译结果
    finalizeResult = fb.getResult(resourceType)
  } else {
    resolvedImports = await existFileBuilder.resolveImports()
    finalizeResult = existFileBuilder.getResult(resourceType)
  }

  return {
    imports: resolvedImports,
    contents: finalizeResult,
    // 使用 ts 后缀识别 http content-type 会被识别为 video ???
    type: ['ts', 'tsx', 'jsx'].includes(reqUrl.split('.')[1])
      ? 'text/javascript'
      : mime.lookup(reqUrl) || 'text/javascript',
    loc: path
  }
}
