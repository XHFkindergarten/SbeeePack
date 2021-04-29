"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installPackages = exports.getPkgRoot = void 0;
/**
 * install pkgs
 */
const path_1 = require("path");
const esinstall_1 = require("esinstall");
/**
 * get root path of an external package
 */
const getPkgRoot = (pkgEntry) => {
    const arr = pkgEntry.split('/node_modules/');
    const pkgName = arr[1].split('/')[0];
    return path_1.resolve(arr[0], 'node_modules', pkgName);
};
exports.getPkgRoot = getPkgRoot;
const installPackages = async (installTargets, installOptions) => {
    const finalRes = await esinstall_1.install(installTargets, {
        ...installOptions,
        stats: false
    });
    return {
        importMap: finalRes.importMap
    };
};
exports.installPackages = installPackages;
