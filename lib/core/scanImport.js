"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanImportsFromFile = void 0;
/**
 * scan imports from file
 */
const es_module_lexer_1 = require("es-module-lexer");
const scanImportsFromFile = async (contents) => {
    // 这里类似是一个约定
    // 如果被 finalize 过的内容是 Buffer，那么代表这个文件被认为是不需要任何处理的 static file
    // 如果是 content 说明仍处于编译过程当中
    if (typeof contents !== 'string') {
        return [];
    }
    // 等待 es-module-lexer 初始化完成（？？？这个 parser 不只是运行时
    await es_module_lexer_1.init;
    const [imports] = es_module_lexer_1.parse(contents);
    const importNames = imports.map((imp) => ({
        name: imp.n,
        start: imp.s,
        end: imp.e
    }));
    return importNames;
};
exports.scanImportsFromFile = scanImportsFromFile;
