/**
 * utils
 */
import fs from 'fs'
import PkgResource from './pkgResource'

/**
 * get the extension of file from its path
 */
export const getExt = (loc: string): string => {
  const arr = loc.split('.')
  if (arr.length === 1) {
    return ''
  } else {
    return arr[arr.length - 1]
  }
}

/**
 * fs
 * fetch static file content
 */
export const readFileContent = async (path: string): Promise<string> => {
  const content = fs.promises.readFile(path, 'utf-8')
  return content
}

/**
 * reverse built file name to raw file name
 * .js -> .jsx .tsx .ts .js
 */
const jsExtMap = ['js', 'jsx', 'ts', 'tsx']
export const revertReqUrl = (reqUrl: string): string[] => {
  const arr = reqUrl.split('.')
  if (arr.length === 1) {
    // 没有后缀按照 js 处理
    arr.push('js')
  }
  const ext = arr[arr.length - 1]

  if (ext === 'js') {
    return jsExtMap.map((_) => [...arr.slice(0, arr.length - 1), _].join('.'))
  }
  return [reqUrl]
}

/**
 * get package resource from cache
 */
const ResourceMap = new WeakMap<object, any>()
export const getPkgResource = (config) => {
  if (ResourceMap.has(config)) {
    return ResourceMap.get(config)
  }
  const resource = new PkgResource()

  ResourceMap.set(config, resource)
  return resource
}
