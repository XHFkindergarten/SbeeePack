"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileBuilder = void 0;
const finalize_1 = require("./finalize");
const plugin_1 = require("./plugin");
const import_1 = require("./import");
/**
 * 不同文件的 fileBuild 缓存 Map
 */
const FileBuildMap = {};
const getFileBuilder = (path) => {
    if (!Reflect.has(FileBuildMap, path)) {
        return null;
    }
    else {
        return Reflect.get(FileBuildMap, path);
    }
};
exports.getFileBuilder = getFileBuilder;
class FileBuilder {
    constructor(path, loc, configOptions) {
        /**
         * build result after plugins load
         */
        this.buildResult = {};
        /**
         * build func
         */
        this.build = async () => {
            const loc = this.loc;
            if (!loc)
                return;
            // 生成资源的文件路径
            // const fsUrl = url.pathToFileURL(loc)
            const buildRes = await plugin_1.runPipelineLoaders(loc, this.configOptions);
            // 存储打包结果
            this.buildResult = Object.assign(this.buildResult, buildRes);
        };
        this.resolvedResults = {};
        /**
         * generate final build result
         */
        this.finalizeResult = (type, content) => {
            if (type === '.html') {
                return finalize_1.finalizeHtml(content);
            }
            else if (type === '.js') {
                return finalize_1.finalizeJs(content);
            }
            return content;
        };
        /**
         * resolve imports map
         */
        this.resolveImports = async () => {
            let scanedImports = [];
            for (const [type, result] of Object.entries(this.buildResult)) {
                // 没有编码的情况
                let content = typeof result.code === 'string'
                    ? result.code
                    : result.code.toString('utf-8');
                // 生成对外输出的格式
                let finalContent = this.finalizeResult(type, content);
                // 扫描文件内的引用内容
                scanedImports = await import_1.scanImportsFromFile(finalContent);
                if (typeof finalContent === 'string') {
                    finalContent = import_1.transformImports(finalContent, scanedImports);
                }
                this.resolvedResults[type] = {
                    code: finalContent
                };
            }
            return scanedImports;
        };
        /**
         * output build result
         */
        this.getResult = (resourceType) => {
            if (['ts', 'tsx', 'jsx'].includes(resourceType))
                resourceType = 'js';
            return this.resolvedResults[`.${resourceType}`].code;
        };
        this.path = path;
        this.loc = loc;
        this.configOptions = configOptions;
    }
}
exports.default = FileBuilder;
