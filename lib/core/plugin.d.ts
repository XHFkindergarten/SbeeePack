/**
 * Plugins
 */
/**
 * 遍历所有的 plugins
 * 如果有 plugin 的 resolve 函数命中了这个文件的路径
 * 那么将会执行 plugin 的 loader 函数对文件内容进行处理
 * 否则文件原内容继续进入下一个流水线
 * @param loc 文件地址
 */
export declare const runPipelineLoaders: (loc: string, config: any) => Promise<{
    [x: string]: {
        code: string;
    };
}>;
