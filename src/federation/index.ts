
import {fetchJsonData} from "./lib/config-loader";
import {ImportMapInjector} from "./lib/import-map-injector";
import {ModulesController} from "./lib/modules-controller";

const importInjector = new ImportMapInjector(document);

let devLoader = (pt:string)=>{
    return  "/modules" + pt + "/src/index.ts"
};

let staticLoader = (pt:string)=>{
    return  "/dist" + pt + "/index.js"
};


const moduleLoader = new ModulesController(importInjector,devLoader);

// @ts-ignore
const projectName= import.meta.env.MODE;
console.log("ENTRY",projectName);
const path = `/endpoints/solenopsys/${projectName}`;
const entryPath=`${path}/entry.json`;




const addModule= (name: string) => {
    return moduleLoader.addModule(name);
}

function injectFavicon(url: string) {
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = url;
    document.head.appendChild(favicon);

}
fetchJsonData(entryPath).then((entry) => {
    const modName = entry.layout.module;
    moduleLoader.addModule(modName).then((module) => {
        let layoutConf:{ title: string,logo:string,favicon:string } = entry.layout.data;
        const  mapping: { [name: string]: {module:string,data:any} } = {};
        let keys = Object.keys(entry.routes);
        for (const key of keys) {
            mapping[key.substring(1)] = entry.routes[key];
        }

        document.title = layoutConf.title;
        injectFavicon(layoutConf.favicon);

        module.ENTRY.bootstrap().then((mod) => {
            mod.setConfigSource(layoutConf, addModule,mapping);
        });
    });
});


