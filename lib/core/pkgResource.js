"use strict";
/**
 * @class
 * PkgResource
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const process_1 = require("process");
const esinstall_1 = require("esinstall");
const install_1 = require("./install");
// 永远不需要打进包里的包包们
const NEVER_PEER_PACKAGES = [
    '@babel/runtime',
    '@babel/runtime-corejs3',
    'babel-runtime',
    'dom-helpers',
    'es-abstract',
    'node-fetch',
    'whatwg-fetch',
    'tslib',
    '@ant-design/icons-svg'
];
class PkgResource {
    constructor() {
        /**
         * known exist pkgs
         */
        this.existPkgs = new Set();
        /**
         * map
         */
        this.pkgMap = new Map();
        this.prepare = async () => {
            // 不管了，吃柠檬，我就写死了
            const installTargets = new Set(['nervjs']);
            for (const target of installTargets) {
                this.buildImportPkg(target, this.root);
            }
        };
        /**
         * build import pkg contents
         * @param spec package name
         * @param source those who import this package
         */
        this.buildImportPkg = async (spec, source = process_1.cwd()) => {
            // 获取包的入口文件地址
            const pkgEntry = esinstall_1.resolveEntrypoint(spec, {
                cwd: source,
                packageLookupFields: []
            });
            // 获取包的根目录
            const pkgRoot = install_1.getPkgRoot(pkgEntry);
            // package.json 位置
            const manifestPath = path_1.resolve(pkgRoot, 'package.json');
            const manifestStr = fs_1.readFileSync(manifestPath, 'utf-8');
            // package.json 内容
            const manifest = JSON.parse(manifestStr);
            // 包名
            const pkgName = manifest.name;
            // 缓存位置
            const installDest = path_1.resolve(this.cachePath, 'build', pkgName);
            this.existPkgs.add(pkgName);
            // 这次要打包的对象
            const installTargets = [...this.existPkgs].filter((_) => _.startsWith(pkgName));
            // 使用到的依赖
            const externalPkgs = [
                ...Object.keys(manifest.dependencies || {}),
                ...Object.keys(manifest.peerDependencies || {})
            ].filter((_) => _ !== pkgName && NEVER_PEER_PACKAGES.includes(_));
            // 全部依赖
            const fullExternalPkgs = [
                ...externalPkgs,
                ...Object.keys(manifest.devDependencies || {}).filter((_) => _ !== pkgName && NEVER_PEER_PACKAGES.includes(_))
            ];
            // esinstall installOptions
            const installOptions = {
                dest: installDest,
                cwd: manifestPath,
                env: { NODE_ENV: process.env.NODE_ENV },
                treeshake: false,
                alias: {},
                external: fullExternalPkgs
            };
            const installRes = await install_1.installPackages(installTargets, installOptions);
            // 这时已经下载打包到 cache 中的文件的 path
            const destFilePath = path_1.resolve(installDest, installRes.importMap.imports[pkgName]);
            this.pkgMap.set(pkgName, destFilePath);
            console.log(this.pkgMap);
            // 读取这个文件的内容
            const loadedFile = fs_1.readFileSync(destFilePath, 'utf-8');
            // 对于 js 文件，继续递归寻找它的依赖
            if (destFilePath.endsWith('.js')) {
                const pkgImports = new Set();
                // @TODO 寻找依赖
                // await scanImportsFromFile(loadedFile)
            }
        };
        const REPO_DIR = process_1.cwd();
        this.root = REPO_DIR;
        const NODE_MODULE_PATH = path_1.resolve(REPO_DIR, 'node_modules');
        // 缓存位置
        this.cachePath = path_1.resolve(NODE_MODULE_PATH, '.cache', 'sbeepack');
    }
}
exports.default = PkgResource;
