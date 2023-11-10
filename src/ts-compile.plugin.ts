import {Plugin} from 'vite';
import {JsMinifyOptions, minify, Output, plugins, Program, transform} from "@swc/core";
import {AngularComponents, AngularInjector} from "./visitors";
import {TypesCollector} from "./visitors/types-map";
import {injectStubs} from "./tools/stubs-injector";
import {CacheCoordinator} from "./cache_coord";
import {libNameToPackageName} from "./tools/helpers";

const NODE_MODULES = "node_modules";

const typesCache = new CacheCoordinator(process.cwd())

export const TsCompilerPlugin: Plugin = {

    name: 'vite-plugin-ts-compile-plugin',
    enforce: "pre",


    apply(config, env) {
        const isBuild = env.command === 'build';
        const isSsrBuild = env.ssrBuild === true;
        return !isBuild || isSsrBuild;
    },


    async config(_userConfig, env: any) {


        return {
            esbuild: false,
        };
    },

    resolveId(id) {
        if (id === '/@angular/compiler') {
            return this.resolve('@angular/compiler');
        }
    },
    transformIndexHtml(html) {
        const compilerScript = `<script type="module" src="/@angular/compiler"></script>`;
        return html.replace('</head>', `${compilerScript}</head>`);
    },

    async transform(code, id: any) {
        if (id.includes(NODE_MODULES) && id.includes("vite/deps") && !id.includes('chunk')) {
            const {packageName} = libNameToPackageName(id);
            let libCacheExists = typesCache.isExists(packageName);
            if (!libCacheExists) {
                libCacheExists = await typesCache.loadPackage(id);
            }
            if (libCacheExists) {
                const mp = typesCache.getTypes(packageName);
                return injectStubs(id, mp, code)
            }
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
                    if (output?.code) {
                        code = injectStubs(id, injectMap, output?.code)

                    }


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
    const minifyOptions: JsMinifyOptions = {
        compress: isProduction,
        mangle: isProduction,
        ecma: '2020',
        module: true,
        format: {
            comments: false,
        },
    };

    if (id.includes(NODE_MODULES)) {

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
