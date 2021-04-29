/// <reference types="node" />
import { ImportType } from '../type';
export declare const getFileBuilder: (path: string) => FileBuilder | null;
declare class FileBuilder {
    constructor(path: string, loc: string, configOptions: any);
    /**
     * config info
     */
    configOptions: any;
    /**
     * file location
     */
    loc: string;
    /**
     * request path
     */
    path: string;
    /**
     * build result after plugins load
     */
    buildResult: Record<string, {
        code: string | Buffer;
    }>;
    /**
     * build func
     */
    build: () => Promise<void>;
    resolvedResults: {
        [key: string]: {
            code: Buffer | string;
        };
    };
    /**
     * generate final build result
     */
    finalizeResult: (type: string, content: string) => Buffer | string;
    /**
     * resolve imports map
     */
    resolveImports: () => Promise<ImportType[]>;
    /**
     * output build result
     */
    getResult: (resourceType: string) => string | Buffer;
}
export default FileBuilder;
