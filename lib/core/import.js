"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformImports = exports.scanImportsFromFile = void 0;
/**
 * handle imports in file
 */
const es_module_lexer_1 = require("es-module-lexer");
const constant_1 = require("./constant");
/**
 * get the imports statement in code
 */
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
const REPLACE_STR = '全体目光向我看齐我宣布个事儿我是个伞兵没毛病嗷(抱拳)全体目光向我看齐我宣布个事儿我是个伞兵没毛病嗷(抱拳)全体目光向我看齐我宣布个事儿我是个伞兵没毛病嗷(抱拳)全体目光向我看齐我宣布个事儿我是个伞兵没毛病嗷(抱拳)';
/**
 * change the imports of a file so that we can recognize it correctly
 */
const transformImports = (contents, imports) => {
    for (let i = 0; i < imports.length; i++) {
        const imp = imports[i];
        const { name, start, end } = imp;
        // 相对路径引用不做处理
        if (name.includes('.')) {
            continue;
        }
        const precontent = contents.substring(0, start);
        const aftercontent = contents.substring(end, contents.length);
        contents =
            precontent +
                new Array(end - start).fill(REPLACE_STR[i]).join('') +
                aftercontent;
    }
    for (let i = 0; i < imports.length; i++) {
        const imp = imports[i];
        const { name, start, end } = imp;
        // 相对路径引用不做处理
        if (name.includes('.')) {
            continue;
        }
        contents = contents.replace(new Array(end - start).fill(REPLACE_STR[i]).join(''), `${constant_1.EXT_PKG_PREFIX}/${name}`);
    }
    return contents;
};
exports.transformImports = transformImports;
