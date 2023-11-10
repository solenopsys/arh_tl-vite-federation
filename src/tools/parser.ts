import {Declaration, Module, ModuleItem, parseFile} from "@swc/core";
import {dirname, join} from "path";
import {ParseOptions} from "@swc/types";
import * as fs from 'fs';


function checkVariantFilesExist(dir: string, fn: string): string | null {
    const variantFiles = [fn + ".d.ts", fn + "\\index.d.ts"];


    for (let i = 0; i < variantFiles.length; i++) {
        const filePath = join(dir, variantFiles[i]);
        if (fs.existsSync(filePath)) {
            return filePath
        }
    }
    return null;
}

export class DtsScanner {
    mp: { [key: string]: string } = {};


    dec(node: Declaration) {
        if ((node.type === "TsInterfaceDeclaration")) {
            this.mp[node.id?.value] = "interface";
        }

        if ((node.type === "TsTypeAliasDeclaration")) {
            this.mp[node.id?.value] = "type";
        }
    }

    async nodeProcessing(dr: string, node: ModuleItem) {

        if ((node.type === "ExportAllDeclaration")) {
            let value = node.source?.value;
            await this.parse(dr, value);
        }

        if ((node.type === "ExportNamedDeclaration")) {
            let value = node.source?.value;
            if (value == null) {
                return
            }
            await this.parse(dr, value);
        }

        if ((node.type === "ExportDeclaration"))
            this.dec(node.declaration)
        if ((node.type === "TsInterfaceDeclaration"))
            this.dec(node)
        if ((node.type === "TsTypeAliasDeclaration"))
            this.dec(node)
    }

    async parse(dir: string, file: string) {
        const filePath = checkVariantFilesExist(dir, file);
        if (filePath === null) return;

        const options: ParseOptions & { isModule: boolean; } = {syntax: "typescript", isModule: true};
        const res: Module = await parseFile(filePath, options);

        for (const node of res.body) {
            await this.nodeProcessing(dirname(filePath), node);
        }
    }

    public async startParse(dir: string, file: string) {
        await this.parse(dir, file)
        return this.mp;
    }
}


