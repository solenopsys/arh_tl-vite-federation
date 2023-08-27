import * as path from 'path';
import {esBuildAdapter} from '@softarc/native-federation-esbuild';
import {federationBuilder} from '@softarc/native-federation/build';


async function main() {

    const projectName = 'shell';
    const tsConfig = 'tsconfig.json';
    const outputPath = `dist/${projectName}`;

    /*
      *  Step 1: Initialize Native Federation
    */
    await federationBuilder.init({
        options: {
            workspaceRoot: "C:\\dev\\sources\\MAIN\\temp5\\frontends",
            outputPath,
            tsConfig,
            federationConfig: `./federation.config.js`,
            verbose: false,
        },

        /*
            * As this core lib is tooling-agnostic, you
            * need a simple adapter for your bundler.
            * It's just a matter of one function.
        */
        adapter: esBuildAdapter
    });

    /*
      * Step 2: Trigger your build process
      *
      * You can use any tool for this. Here, we go
      * with a very simple esbuild-based build.
      *
      * Just respect the externals in
      * `federationBuilder.externals`.
    */


// await esbuild.build({
//
// external: federationBuilder.externals,
//
// });

};

main()