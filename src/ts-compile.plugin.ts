import {Plugin} from 'vite';
import {JsMinifyOptions, minify, plugins, Program, transform} from "@swc/core";
import {AngularComponents, AngularInjector} from "./visitors";


export const TsCompilerPlugin: Plugin = {
    name: 'vite-plugin-ts-compile-plugin',
    enforce: "pre",

    config(_userConfig, env) {
        return {
            esbuild: false,
        };
    },

    resolveId(id) {
        console.log('resolve', id)
        if (id === '/@angular/compiler') {
            return this.resolve('@angular/compiler');
        }
    },
    transformIndexHtml(html) {
        const compilerScript = `<script type="module" src="/@angular/compiler"></script>`;
        return html.replace('</head>', `${compilerScript}</head>`);
    },

    transform(code, id: any) {
        if (id.endsWith('.ts')) {
            return swcTransform({
                code,
                id,
                isSsr: false,
                isProduction: false,
            });
        }
    }


}

export const swcTransform = async ({code, id, isSsr, isProduction}) => {
    console.log("PROCESING", id)
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
                const angularComponentPlugin = new AngularComponents({
                    sourceUrl: id,
                });
                return angularComponentPlugin.visitProgram(m);
            },
            (m: Program) => {
                const angularInjectorPlugin = new AngularInjector();
                return angularInjectorPlugin.visitProgram(m);
            },
        ]),
    });
};
