"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const process_1 = require("process");
const logger_1 = __importDefault(require("./logger"));
const fs_1 = require("fs");
const dev_1 = require("./commands/dev");
const plugins_1 = require("./plugins");
const CONFIG_FILE_NAME = 'sbeepack.config.js';
async function default_1(args) {
    const cmd = args[2];
    if (cmd === 'dev') {
        // 设置一下环境变量
        process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    }
    else if (cmd === 'build') {
        process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    }
    // console.log("logger", logger);
    logger_1.default.info(`run command: ${cmd}`);
    // 读取配置
    // 命令行路径
    const cwdPath = process_1.cwd();
    const configPath = path_1.default.resolve(cwdPath, CONFIG_FILE_NAME);
    // 默认配置
    const defaultConfig = {
        name: 'SbeePackDemo',
        excludes: ['node_modules', 'yarn', 'package', 'README', /\/\./, 'build'],
        plugins: [
            plugins_1.esbuildPlugin({}, 
            // 处理的文件类型
            {
                input: ['js', 'ts', 'jsx', 'tsx']
            })
        ]
    };
    let configOptions = Object.assign({}, defaultConfig);
    // 合并用户配置
    if (fs_1.existsSync(configPath)) {
        const userConfig = await Promise.resolve().then(() => __importStar(require(configPath)));
        Object.assign(configOptions, userConfig);
    }
    if (cmd === 'dev') {
        // 执行 dev 逻辑
        dev_1.devCommand(configOptions);
    }
}
exports.default = default_1;
