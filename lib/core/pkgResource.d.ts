/**
 * @class
 * PkgResource
 */
declare class PkgResource {
    constructor();
    root: string;
    cachePath: string;
    /**
     * known exist pkgs
     */
    existPkgs: Set<string>;
    /**
     * map
     */
    pkgMap: Map<string, string>;
    prepare: () => Promise<void>;
    /**
     * build import pkg contents
     * @param spec package name
     * @param source those who import this package
     */
    buildImportPkg: (spec: string, source?: string) => Promise<any>;
}
export default PkgResource;
