export type ImportMap = {
    import: { [name: string]: string }
    scopes: { [path: string]: { [name: string]: string } }
}

export class ImportMapInjector {
    private importMap: ImportMap = {import: {}, scopes: {}} as ImportMap;

    constructor(private document: any) {
    }

    public findImportMap() {
        return this.document.querySelector('script[type="importmap"]');
    }

    public injectMap() {
        const im = this.findImportMap();
        im.textContent = JSON.stringify(this.importMap);
    }

    public addModule(name: string, path: string) {
        this.importMap.import[name] = path;
    }
}