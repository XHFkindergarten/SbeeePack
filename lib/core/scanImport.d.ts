/// <reference types="node" />
export declare const scanImportsFromFile: (contents: string | Buffer) => Promise<{
    name: string | undefined;
    start: number;
    end: number;
}[]>;
