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
exports.fetchFile = void 0;
const fileBuilder_1 = __importStar(require("./fileBuilder"));
const utils_1 = require("./utils");
const mime_types_1 = __importDefault(require("mime-types"));
/**
 * 根据【文件地址】获取【文件内容】
 */
const fetchFile = async (reqUrl, path, configOptions) => {
    // 检查这个文件是否存在 FileBuilder 实例
    const existFileBuilder = fileBuilder_1.getFileBuilder(reqUrl);
    // 资源类型
    const resourceType = utils_1.getExt(path);
    let finalizeResult;
    let resolvedImports;
    if (existFileBuilder === null) {
        // 不存在 FileBuilder 实例
        const fb = new fileBuilder_1.default(reqUrl, path, configOptions);
        // 如果文件没有打过包
        if (Object.keys(fb.buildResult).length === 0) {
            await fb.build();
        }
        // 获取内部 import 依赖
        resolvedImports = await fb.resolveImports();
        // 读取最终的编译结果
        finalizeResult = fb.getResult(resourceType);
    }
    else {
        resolvedImports = await existFileBuilder.resolveImports();
        finalizeResult = existFileBuilder.getResult(resourceType);
    }
    return {
        imports: resolvedImports,
        contents: finalizeResult,
        // 使用 ts 后缀识别 http content-type 会被识别为 video ???
        type: ['ts', 'tsx', 'jsx'].includes(reqUrl.split('.')[1])
            ? 'text/javascript'
            : mime_types_1.default.lookup(reqUrl) || 'text/javascript',
        loc: path
    };
};
exports.fetchFile = fetchFile;
