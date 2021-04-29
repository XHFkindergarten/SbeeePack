import * as esbuild from 'esbuild'
import * as colors from 'kleur/colors'
import path from 'path'
import { promises as fs, readFileSync } from 'fs'
// import {SnowpackPlugin, SnowpackConfig} from '../types';
import logger from '../logger'

const IS_PREACT = /from\s+['"]preact['"]/
function checkIsPreact(contents: string) {
  return IS_PREACT.test(contents)
}

type Loader = 'js' | 'jsx' | 'ts' | 'tsx'

function getLoader(filePath: string): { loader: Loader; isJSX: boolean } {
  const ext = path.extname(filePath)
  const loader: Loader = ext === '.mjs' ? 'js' : (ext.substr(1) as Loader)
  const isJSX = loader.endsWith('x')
  return { loader, isJSX }
}

export function esbuildPlugin(
  config: any,
  { input }: { input: string[] }
): any {
  return {
    name: '@snowpack/plugin-esbuild',
    resolve: {
      input,
      output: ['.js']
    },
    async load(filePath) {
      const { buildOptions = {} } = config

      let contents = readFileSync(filePath, 'utf8')
      const { loader, isJSX } = getLoader(filePath)
      // 是否对 JSX 文件头部进行代码注入
      if (isJSX) {
        const jsxInject = buildOptions.jsxInject
          ? `${buildOptions.jsxInject}\n`
          : ''
        contents = jsxInject + contents
      }
      // 是否是 Preact
      const isPreact = isJSX && checkIsPreact(contents)

      // let jsxFactory = buildOptions.jsxFactory ?? (isPreact ? 'h' : undefined)
      // let jsxFragment =
      //   buildOptions.jsxFragment ?? (isPreact ? 'Fragment' : undefined)

      const { code, map, warnings } = await esbuild.transform(contents, {
        loader: loader,
        jsxFactory: 'Nerv.createElement',
        jsxFragment: 'Nerv.Fragment',
        sourcefile: filePath,
        sourcemap: buildOptions.sourcemap,
        charset: 'utf8'
      })
      for (const warning of warnings) {
        logger.error(`${colors.bold('!')} ${filePath}
  ${warning.text}`)
      }
      return {
        '.js': {
          code: code || '',
          map
        }
      }
    },
    cleanup() {}
  }
}
