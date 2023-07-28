import {Plugin} from 'vite';
import {JsMinifyOptions, minify, Output, plugins, Program, transform} from "@swc/core";
import {AngularComponents, AngularInjector} from "./visitors";
import {TypesCollector} from "./visitors/types-map";
import {injectStubs} from "./stubs-injector";
import {loadPackageJson, loadViteMetadata, mapping} from "./nms";


export const TsCompilerPlugin: Plugin = {

    name: 'vite-plugin-ts-compile-plugin',
    enforce: "pre",

    config(_userConfig, env) {
        console.log("CONFIG", _userConfig, env)



        const dir = "C:\\dev\\sources\\MAIN\\temp5\\frontends"

        let conf = loadViteMetadata(dir);
        let map = mapping(conf);
        console.log(map)
        for (const key in map) {
            const value = map[key];
            const pkg = loadPackageJson(dir, value);
            console.log("PKG",value, pkg?.typings)
        }
        return {
            esbuild: false,
        };
    },

    resolveId(id) {
        //console.log('resolve', id)
        if (id === '/@angular/compiler') {
            return this.resolve('@angular/compiler');
        }
    },
    transformIndexHtml(html) {
        const compilerScript = `<script type="module" src="/@angular/compiler"></script>`;
        return html.replace('</head>', `${compilerScript}</head>`);
    },

    transform(code, id: any) {


        if (id.includes('node_modules')) {
          //  console.log("MODULE", id)
        }
        if (id.endsWith('.ts')) {


            return new Promise((resolve) => {
                let typesCollector = new TypesCollector();
                let promise: Promise<Output | undefined> = swcTransform({
                    code,
                    id,
                    isSsr: false,
                    isProduction: false,
                    typesCollector: typesCollector
                });


                promise.then((output) => {
                    let injectMap = typesCollector.getTypesMap();

                    let code= output?.code;
                    if(output?.code)
                        code=injectStubs(injectMap,output?.code)
                    resolve({
                        code: code,
                        map: output?.map,
                    })
                })

            });

        }
    }


}

export const swcTransform = async ({code, id, isSsr, isProduction, typesCollector}): Promise<Output | undefined> => {
    //  console.log("PROCESING", id)
    const minifyOptions: JsMinifyOptions = {
        compress: isProduction,
        mangle: isProduction,
        ecma: '2020',
        module: true,
        format: {
            comments: false,
        },
    };

    if (id.includes('node_modules')) {

        if (isProduction) {
            return minify(code, minifyOptions);
        }
        return;
    }

    const fileExtensionRE = /\.[^/\s?]+$/;

    const [filepath, querystring = ''] = id.split('?');
    const [extension = ''] =
    querystring.match(fileExtensionRE) || filepath.match(fileExtensionRE) || [];

    if (!/\.(js|ts|tsx|jsx?)$/.test(extension)) {
        return;
    }

    return transform(code, {
        sourceMaps: !isProduction,
        jsc: {
            baseUrl: './',
            target: 'es2020',
            parser: {
                syntax: 'typescript',
                tsx: false,
                decorators: true,
                dynamicImport: true,
            },
            transform: {
                decoratorMetadata: true,
                legacyDecorator: true,
            },
            minify: minifyOptions,
        },
        minify: isProduction,
        plugin: plugins([
            (m: Program) => {
                return new AngularComponents({sourceUrl: id,}).visitProgram(m)
            },
            (m: Program) => {
                return new AngularInjector().visitProgram(m);
            }, (m: Program) => {
                return typesCollector.visitProgram(m);
            },
        ]),
    });
};
