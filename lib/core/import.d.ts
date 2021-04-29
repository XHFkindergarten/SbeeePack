/// <reference types="node" />
import { ImportType } from '../type';
/**
 * get the imports statement in code
 */
export declare const scanImportsFromFile: (contents: string | Buffer) => Promise<ImportType[]>;
/**
 * change the imports of a file so that we can recognize it correctly
 */
export declare const transformImports: (contents: string, imports: ImportType[]) => string;
