"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPkgResource = exports.revertReqUrl = exports.readFileContent = exports.getExt = void 0;
/**
 * utils
 */
const fs_1 = __importDefault(require("fs"));
const pkgResource_1 = __importDefault(require("./pkgResource"));
/**
 * get the extension of file from its path
 */
const getExt = (loc) => {
    const arr = loc.split('.');
    if (arr.length === 1) {
        return '';
    }
    else {
        return arr[arr.length - 1];
    }
};
exports.getExt = getExt;
/**
 * fs
 * fetch static file content
 */
const readFileContent = async (path) => {
    const content = fs_1.default.promises.readFile(path, 'utf-8');
    return content;
};
exports.readFileContent = readFileContent;
/**
 * reverse built file name to raw file name
 * .js -> .jsx .tsx .ts .js
 */
const jsExtMap = ['js', 'jsx', 'ts', 'tsx'];
const revertReqUrl = (reqUrl) => {
    const arr = reqUrl.split('.');
    if (arr.length === 1) {
        // 没有后缀按照 js 处理
        arr.push('js');
    }
    const ext = arr[arr.length - 1];
    if (ext === 'js') {
        return jsExtMap.map((_) => [...arr.slice(0, arr.length - 1), _].join('.'));
    }
    return [reqUrl];
};
exports.revertReqUrl = revertReqUrl;
/**
 * get package resource from cache
 */
const ResourceMap = new WeakMap();
const getPkgResource = (config) => {
    if (ResourceMap.has(config)) {
        return ResourceMap.get(config);
    }
    const resource = new pkgResource_1.default();
    ResourceMap.set(config, resource);
    return resource;
};
exports.getPkgResource = getPkgResource;
