"use strict";
/**
 * File
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFileContent = void 0;
const fs_1 = __importDefault(require("fs"));
const readFileContent = async (path) => {
    const content = fs_1.default.promises.readFile(path, 'utf-8');
    return content;
};
exports.readFileContent = readFileContent;
