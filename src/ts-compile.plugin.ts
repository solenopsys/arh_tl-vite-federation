import {Plugin} from 'vite';
import {JsMinifyOptions, minify, Output, plugins, Program, transform} from "@swc/core";
import {AngularComponents, AngularInjector} from "./visitors";
import {TypesCollector} from "./visitors/types-map";
import {injectStubs} from "./tools/stubs-injector";
import {loadPackageJson, loadViteMetadata, mapping} from "./tools/nms";
import {DtsScanner} from "./tools/parser";
import path from "path";


const CACHE: { [key: string]: any } = {};
const MAPPING: { [key: string]: string } = {};


export const TsCompilerPlugin: Plugin = {

    name: 'vite-plugin-ts-compile-plugin',
    enforce: "pre",

    apply(config, env) {
        const isBuild = env.command === 'build';
        const isSsrBuild = env.ssrBuild === true;
        return !isBuild || isSsrBuild;
    },


    async config(_userConfig, env: any) {
        // console.log("CONFIG", _userConfig, env)
        const isBuild = env.command === 'build';

        if (!isBuild) {

            const dir = process.cwd();

          //  const allow = ["@ngxs/store", "moment"] // export

            let conf = loadViteMetadata(dir);

            let map = mapping(conf);

            for (const key in map) {
                const value = map[key];
                const pkg = loadPackageJson(dir, value);

              //  if (allow.includes(value)  ) {
                    MAPPING[key] = value;

                    if (value && pkg?.typings) {
                        let dtsScanner = new DtsScanner();
                        let file = pkg?.typings.replace(".d.ts", "");
                        const fp = path.join("./node_modules/", value, file)

                        const res = await dtsScanner.startParse(dir, fp);
                        CACHE[value] = res;
                    }

               // }

            }
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

            const map = MAPPING;
            for (const key in map) {
                const value = map[key];
                if (id.includes(key)) {
                    let mp = CACHE[value];
                    if (mp) {

                        return injectStubs(mp, code)
                    }
                }
            }

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

                    let code = output?.code;
                    if (output?.code)
                        code = injectStubs(injectMap, output?.code)


                    if (code && id.endsWith('modules-controller.ts'))
                        code = code.replace("import(", "import(/* @vite-ignore */ ")

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
