/**
 * get the extension of file from its path
 */
export declare const getExt: (loc: string) => string;
/**
 * fs
 * fetch static file content
 */
export declare const readFileContent: (path: string) => Promise<string>;
export declare const revertReqUrl: (reqUrl: string) => string[];
export declare const getPkgResource: (config: any) => any;
