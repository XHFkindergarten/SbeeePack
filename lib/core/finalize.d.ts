/**
 * sbeepack 内部处理打包产物
 */
/// <reference types="node" />
/**
 * HTML
 */
export declare const finalizeHtml: (html: string) => Buffer;
/**
 * JS
 */
export declare const finalizeJs: (js: string) => string;
