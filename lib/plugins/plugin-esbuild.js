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
exports.esbuildPlugin = void 0;
const esbuild = __importStar(require("esbuild"));
const colors = __importStar(require("kleur/colors"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
// import {SnowpackPlugin, SnowpackConfig} from '../types';
const logger_1 = __importDefault(require("../logger"));
const IS_PREACT = /from\s+['"]preact['"]/;
function checkIsPreact(contents) {
    return IS_PREACT.test(contents);
}
function getLoader(filePath) {
    const ext = path_1.default.extname(filePath);
    const loader = ext === '.mjs' ? 'js' : ext.substr(1);
    const isJSX = loader.endsWith('x');
    return { loader, isJSX };
}
function esbuildPlugin(config, { input }) {
    return {
        name: '@snowpack/plugin-esbuild',
        resolve: {
            input,
            output: ['.js']
        },
        async load(filePath) {
            const { buildOptions = {} } = config;
            let contents = fs_1.readFileSync(filePath, 'utf8');
            const { loader, isJSX } = getLoader(filePath);
            // 是否对 JSX 文件头部进行代码注入
            if (isJSX) {
                const jsxInject = buildOptions.jsxInject
                    ? `${buildOptions.jsxInject}\n`
                    : '';
                contents = jsxInject + contents;
            }
            // 是否是 Preact
            const isPreact = isJSX && checkIsPreact(contents);
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
            });
            for (const warning of warnings) {
                logger_1.default.error(`${colors.bold('!')} ${filePath}
  ${warning.text}`);
            }
            return {
                '.js': {
                    code: code || '',
                    map
                }
            };
        },
        cleanup() { }
    };
}
exports.esbuildPlugin = esbuildPlugin;
