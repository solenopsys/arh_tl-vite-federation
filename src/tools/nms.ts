import * as fs from "fs";
import {join} from "path";

const NODE_MODULES = "node_modules";
const VITE_METADATA = ".vite/deps/_metadata.json";

type Conf = { optimized: { [key: string]: { file: string, src: string } } };




export function loadViteMetadata(baseDir: string): Conf {
    const filePath = `./${NODE_MODULES}/${VITE_METADATA}`;
    const file = join(baseDir, filePath);
    const fileExists =  fs.existsSync(file);
    if(!fileExists){
        return {optimized: {}};
    }

    const jsonData = fs.readFileSync(file, 'utf8');
    return JSON.parse(jsonData);

}

export function loadPackageJson(baseDir: string, key: string): { typings: string|undefined }|undefined {
    const file = join(baseDir, `./${NODE_MODULES}/`, key, "package.json");
    const fileExists = fs.existsSync(file);
    if (fileExists) {
        const jsonData = fs.readFileSync(file, 'utf8');
        return JSON.parse(jsonData);
    }
}

export function mapping(conf: Conf): { [key: string]: string } {
    const mp: { [key: string]: string } = {};
    for (const key in conf.optimized) {
        const value = conf.optimized[key];
        mp[value.file] = key;
    }
    return mp;

}

