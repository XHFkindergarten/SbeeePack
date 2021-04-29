"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.devCommand = void 0;
const http_1 = require("http");
const process_1 = require("process");
const fdir_1 = require("fdir");
const etag_1 = __importDefault(require("etag"));
const logger_1 = __importDefault(require("../logger"));
const core_1 = require("../core");
const utils_1 = require("../core/utils");
const constant_1 = require("../core/constant");
const fs_1 = require("fs");
function devCommand(configOptions) {
    startServer(configOptions);
}
exports.devCommand = devCommand;
const REPO_DIR = process_1.cwd();
/**
 * 对于之前发送过的文件进行 reqUrl -> Etag 的映射
 * 对发送过来的请求做一个协商缓存的判断
 */
const existEtagMap = {};
const startServer = async (configOptions) => {
    const { 
    // 不处理的文件
    excludes } = configOptions;
    // 优化开发体验
    // 所有外部资源理论上都被提前编译放在 内存 中
    const pkgResource = utils_1.getPkgResource(configOptions);
    await pkgResource.prepare();
    // 深度递归扫描工作目录
    // 知道工作目录下到底有哪些文件
    // 快速判断有些 request 是不是 404
    // 根据配置中的 excludes
    // 生成 判断函数 决定是否需要扫描一个文件
    const isExclude = ((excludes) => (path) => excludes.some((exclude) => typeof exclude === 'string'
        ? path.includes(exclude)
        : exclude instanceof RegExp
            ? exclude.test(path)
            : false))(excludes);
    // 当前目录下扫描出合法的能作为 request 请求对象的文件
    // 如果不在以下内容中的请求都将命中 fallback
    const validFiles = (await new fdir_1.fdir()
        .withFullPaths()
        .exclude((_, path) => {
        return isExclude(path);
    })
        .crawl(REPO_DIR)
        .withPromise());
    // 生成 请求路径 -> 文件本地路径 の映射关系
    // 在 snowpack 中还有 类似 workspace 这样の概念
    // 所以 映射的 base 路径 并不是简单的直接の直接获取 cwd
    const path2LocMap = new Map();
    validFiles.forEach((file) => {
        if (file.startsWith(REPO_DIR)) {
            const path = file.substring(REPO_DIR.length);
            path2LocMap.set(path, file);
        }
    });
    /**
     * Common Request Handler
     */
    const RequestHandler = async (req, res) => {
        // 请求处理完成打印一个 log
        res.on('finish', () => {
            console.log('OK 了啊，我只能说 OK 了家人们 😅');
        });
        SbeePackReqHandler(req, res);
    };
    /**
     * 内部的 request 处理逻辑
     */
    const SbeePackReqHandler = async (req, res) => {
        let reqUrl = req.url || '/';
        logger_1.default.info('get req url: ' + reqUrl);
        // @TODO
        // 如果用户在 plugin 中写了一些 resolve redirect 逻辑
        // 那么这里的请求 url path 可以被复写，请求到其他文件
        // Fallback
        reqUrl = reqUrl.replace(/\/$/, '/index.html');
        // 判断是否存在协商缓存命中
        if (Reflect.has(existEtagMap, reqUrl) &&
            req.headers['if-none-match'] === Reflect.get(existEtagMap, reqUrl)) {
            res.writeHead(304, {
                Etag: Reflect.get(existEtagMap, reqUrl)
            });
            res.end();
            return;
        }
        // 是否命中了 npm 的逻辑
        if (reqUrl.startsWith(constant_1.EXT_PKG_PREFIX)) {
            const pkgName = reqUrl.substring(constant_1.EXT_PKG_PREFIX.length + 1);
            const pkgResultPath = pkgResource.pkgMap.get(pkgName);
            const contents = fs_1.readFileSync(pkgResultPath);
            sendResponse(req, res, reqUrl, {
                contents,
                type: 'text/javascript'
            });
        }
        // 一个文件中原本引入的是 xx.tsx
        // 但是这个文件被编译后会变成 xxx.js
        // 所以我们需要对这些明显不是编译产物的后缀进行转换
        // 映射到正确的工作区文件
        // 例如 .js 得到的会是 [.ts, .tsx, .js, .jsx]
        const rawUrls = utils_1.revertReqUrl(reqUrl);
        // 找到在已扫描到的文件中存在的一个 url
        const targetUrl = rawUrls.find((url) => path2LocMap.has(url));
        // 判断在我们的扫描文件中是否有命中的文件
        if (targetUrl) {
            const targetLoc = path2LocMap.get(targetUrl);
            const file = await core_1.fetchFile(targetUrl, targetLoc, configOptions);
            sendResponse(req, res, reqUrl, file);
        }
    };
    // 创建 server
    http_1.createServer(RequestHandler).listen('3838');
};
/**
 * write content into html response
 */
const sendResponse = (req, res, reqUrl, file) => {
    const { contents, type } = file;
    console.log('type', type);
    const bufferContent = Buffer.from(contents);
    // 根据文件内容生成 Etag 标识
    const Etag = etag_1.default(bufferContent, { weak: true });
    if (req.headers['if-none-match'] === Etag) {
        // 如果命中了协商缓存，返回 304
        res.writeHead(304, {
            Etag,
            'Content-Type': type
        });
        // 生成协商缓存
        Reflect.set(existEtagMap, reqUrl, Etag);
        res.end();
        return;
    }
    // 生成协商缓存
    Reflect.set(existEtagMap, reqUrl, Etag);
    res.setHeader('Content-Type', type);
    res.setHeader('Etag', Etag);
    res.write(bufferContent);
    res.end();
};
