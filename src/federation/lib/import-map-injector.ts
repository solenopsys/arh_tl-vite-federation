export type ImportMap = {
    imports: { [name: string]: string }
    scopes: { [path: string]: { [name: string]: string } }
}

export class ImportMapInjector {
    private importMap: ImportMap = {imports: {}, scopes: {}} as ImportMap;

    constructor(private document: any) {
    }

    public findImportMap() {
        return this.document.querySelector('script[type="importmap"]');
    }

    public injectMap() {
        const im = this.findImportMap();
       let beforeMap = JSON.parse(im.textContent);
        if( beforeMap?.imports){
            for (const beforeMapKey in beforeMap.imports) {
                this.importMap.imports[beforeMapKey]=beforeMap.imports[beforeMapKey]
                this.importMap.scopes=beforeMap.scopes;
            }
        }
        im.textContent = JSON.stringify(this.importMap);
    }

    public addModule(name: string, path: string) {
        this.importMap.imports[name] = path;
    }
}