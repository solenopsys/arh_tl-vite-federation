import {DtsScanner} from "./tools/parser";
import path, {join} from "path";
import fs from "fs";
import {libNameToPackageName} from "./tools/helpers";

const NODE_MODULES = "node_modules";


export class CacheCoordinator {
    private cacheTypes: { [packageName: string]: any } = {};
    private mappingLibraries: { [packageName: string]: string } = {};

    constructor(private baseDir: string) {

    }


    async loadPackage(fileId: string):Promise<boolean> {
        const {libName,packageName} = libNameToPackageName(fileId);

        const pkg = this.loadPackageJson( packageName);
        this.mappingLibraries[libName] = packageName;


        if (packageName && pkg?.typings) {
            let dtsScanner = new DtsScanner();
            let file = pkg?.typings.replace(".d.ts", "");
            const fp = path.join(`./${NODE_MODULES}/`, packageName, file)

            this.cacheTypes[packageName] = await dtsScanner.startParse(this.baseDir, fp);
            return true;
        }
        return false;
    }

    loadPackageJson( key: string): { typings: string | undefined } | undefined {
        const file = join(this.baseDir, `./${NODE_MODULES}/`, key, "package.json");
        const fileExists = fs.existsSync(file);
        if (fileExists) {
            const jsonData = fs.readFileSync(file, 'utf8');
            return JSON.parse(jsonData);
        }
    }

    isExists(packageName: any) {
        return this.cacheTypes[packageName] != undefined;
    }

    getTypes(packageName: string) {
       return  this.cacheTypes[packageName]
    }
}







