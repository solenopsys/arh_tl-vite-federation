import {ImportMapInjector} from "./import-map-injector";

export class ModulesController {
    private modules: { [name: string]: any } = {};
    constructor(private importInjector: ImportMapInjector) {
    }

    public addModule(name: string) {
        const pt = name.replace("@", "/");
        let modName = "/modules" + pt + "/src/index.ts";

        this.importInjector.addModule(name, modName);
        this.importInjector.injectMap()

        return import(  modName ) /* @vite-ignore */
    }

    public registerModule(name: string, module: any) {
        this.modules[name] = module;
    }
}




