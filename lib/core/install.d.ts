import { InstallOptions } from 'esinstall';
/**
 * get root path of an external package
 */
export declare const getPkgRoot: (pkgEntry: string) => string;
export declare const installPackages: (installTargets: string[], installOptions: InstallOptions) => Promise<{
    importMap: import("esinstall").ImportMap;
}>;
