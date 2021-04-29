/**
 * @class
 * PkgResource
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { cwd } from 'process'
import { install, resolveEntrypoint } from 'esinstall'
import { getPkgRoot, installPackages } from './install'
import findUp from 'find-up'
import { scanImportsFromFile } from './import'

// 永远不需要打进包里的包包们
const NEVER_PEER_PACKAGES: string[] = [
  '@babel/runtime',
  '@babel/runtime-corejs3',
  'babel-runtime',
  'dom-helpers',
  'es-abstract',
  'node-fetch',
  'whatwg-fetch',
  'tslib',
  '@ant-design/icons-svg'
]

class PkgResource {
  constructor() {
    const REPO_DIR = cwd()

    this.root = REPO_DIR

    const NODE_MODULE_PATH = resolve(REPO_DIR, 'node_modules')

    // 缓存位置
    this.cachePath = resolve(NODE_MODULE_PATH, '.cache', 'sbeepack')
  }

  root: string

  cachePath: string

  /**
   * known exist pkgs
   */
  existPkgs = new Set<string>()

  /**
   * map
   */
  pkgMap = new Map<string, string>()

  prepare = async () => {
    // 不管了，吃柠檬，我就写死了
    const installTargets = new Set<string>(['nervjs'])

    for (const target of installTargets) {
      this.buildImportPkg(target, this.root)
    }
  }

  /**
   * build import pkg contents
   * @param spec package name
   * @param source those who import this package
   */
  buildImportPkg = async (
    spec: string,
    source: string = cwd()
  ): Promise<any> => {
    // 获取包的入口文件地址
    const pkgEntry = resolveEntrypoint(spec, {
      cwd: source,
      packageLookupFields: []
    })

    // 获取包的根目录
    const pkgRoot = getPkgRoot(pkgEntry)

    // package.json 位置
    const manifestPath = resolve(pkgRoot, 'package.json')

    const manifestStr = readFileSync(manifestPath, 'utf-8')

    // package.json 内容
    const manifest = JSON.parse(manifestStr)

    // 包名
    const pkgName = manifest.name

    // 缓存位置
    const installDest = resolve(this.cachePath, 'build', pkgName)

    this.existPkgs.add(pkgName)

    // 这次要打包的对象
    const installTargets = [...this.existPkgs].filter((_) =>
      _.startsWith(pkgName)
    )

    // 使用到的依赖
    const externalPkgs = [
      ...Object.keys(manifest.dependencies || {}),
      ...Object.keys(manifest.peerDependencies || {})
    ].filter((_) => _ !== pkgName && NEVER_PEER_PACKAGES.includes(_))

    // 全部依赖
    const fullExternalPkgs = [
      ...externalPkgs,
      ...Object.keys(manifest.devDependencies || {}).filter(
        (_) => _ !== pkgName && NEVER_PEER_PACKAGES.includes(_)
      )
    ]

    // esinstall installOptions
    const installOptions = {
      dest: installDest,
      cwd: manifestPath,
      env: { NODE_ENV: process.env.NODE_ENV as string },
      treeshake: false,
      alias: {},
      external: fullExternalPkgs
    }

    const installRes = await installPackages(installTargets, installOptions)

    // 这时已经下载打包到 cache 中的文件的 path
    const destFilePath = resolve(
      installDest,
      installRes.importMap.imports[pkgName]
    )

    this.pkgMap.set(pkgName, destFilePath)
    console.log(this.pkgMap)

    // 读取这个文件的内容
    const loadedFile = readFileSync(destFilePath, 'utf-8')

    // 对于 js 文件，继续递归寻找它的依赖
    if (destFilePath.endsWith('.js')) {
      const pkgImports = new Set<string>()
      // @TODO 寻找依赖
      // await scanImportsFromFile(loadedFile)
    }
  }
}

export default PkgResource
