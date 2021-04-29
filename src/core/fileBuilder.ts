/**
 * 文件打包器
 */
import url from 'url'
import { finalizeHtml, finalizeJs } from './finalize'
import { runPipelineLoaders } from './plugin'
import { scanImportsFromFile, transformImports } from './import'
import { ImportType } from '../type'

/**
 * 不同文件的 fileBuild 缓存 Map
 */
const FileBuildMap: Record<string, FileBuilder> = {}

export const getFileBuilder = (path: string): FileBuilder | null => {
  if (!Reflect.has(FileBuildMap, path)) {
    return null
  } else {
    return Reflect.get(FileBuildMap, path)
  }
}

class FileBuilder {
  constructor(path: string, loc: string, configOptions: any) {
    this.path = path
    this.loc = loc
    this.configOptions = configOptions
  }

  /**
   * config info
   */
  configOptions: any

  /**
   * file location
   */
  loc: string

  /**
   * request path
   */
  path: string

  /**
   * build result after plugins load
   */
  buildResult: Record<string, { code: string | Buffer }> = {}

  /**
   * build func
   */
  build = async () => {
    const loc = this.loc
    if (!loc) return
    // 生成资源的文件路径
    // const fsUrl = url.pathToFileURL(loc)
    const buildRes = await runPipelineLoaders(loc, this.configOptions)
    // 存储打包结果
    this.buildResult = Object.assign(this.buildResult, buildRes)
  }

  resolvedResults: {
    [key: string]: { code: Buffer | string }
  } = {}

  /**
   * generate final build result
   */
  finalizeResult = (type: string, content: string): Buffer | string => {
    if (type === '.html') {
      return finalizeHtml(content)
    } else if (type === '.js') {
      return finalizeJs(content)
    }
    return content
  }

  /**
   * resolve imports map
   */
  resolveImports = async (): Promise<ImportType[]> => {
    let scanedImports: ImportType[] = []
    for (const [type, result] of Object.entries(this.buildResult)) {
      // 没有编码的情况
      let content =
        typeof result.code === 'string'
          ? result.code
          : result.code.toString('utf-8')

      // 生成对外输出的格式
      let finalContent: string | Buffer = this.finalizeResult(type, content)

      // 扫描文件内的引用内容
      scanedImports = await scanImportsFromFile(finalContent)
      if (typeof finalContent === 'string') {
        finalContent = transformImports(finalContent, scanedImports)
      }

      this.resolvedResults[type] = {
        code: finalContent
      }
    }
    return scanedImports
  }

  /**
   * output build result
   */
  getResult = (resourceType: string) => {
    if (['ts', 'tsx', 'jsx'].includes(resourceType)) resourceType = 'js'
    return this.resolvedResults[`.${resourceType}`].code
  }
}

export default FileBuilder
