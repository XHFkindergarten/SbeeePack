import path from 'path'
import { cwd } from 'process'
import logger from './logger'
import { existsSync } from 'fs'
import { devCommand } from './commands/dev'
import { esbuildPlugin } from './plugins'

const CONFIG_FILE_NAME = 'sbeepack.config.js'

export default async function (args) {
  const cmd = args[2]

  if (cmd === 'dev') {
    // 设置一下环境变量
    process.env.NODE_ENV = process.env.NODE_ENV || 'development'
  } else if (cmd === 'build') {
    process.env.NODE_ENV = process.env.NODE_ENV || 'production'
  }
  // console.log("logger", logger);
  logger.info(`run command: ${cmd}`)

  // 读取配置
  // 命令行路径
  const cwdPath = cwd()

  const configPath = path.resolve(cwdPath, CONFIG_FILE_NAME)

  // 默认配置
  const defaultConfig = {
    name: 'SbeePackDemo',
    excludes: ['node_modules', 'yarn', 'package', 'README', /\/\./, 'build'],
    plugins: [
      esbuildPlugin(
        {},
        // 处理的文件类型
        {
          input: ['js', 'ts', 'jsx', 'tsx']
        }
      )
    ]
  }

  let configOptions = Object.assign({}, defaultConfig)

  // 合并用户配置
  if (existsSync(configPath)) {
    const userConfig = await import(configPath)
    Object.assign(configOptions, userConfig)
  }

  if (cmd === 'dev') {
    // 执行 dev 逻辑
    devCommand(configOptions)
  }
}
