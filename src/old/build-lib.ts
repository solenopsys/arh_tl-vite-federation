import { PluginItem, transformAsync } from '@babel/core';
import * as fs from "fs";
import {loadEsmModule} from "@angular-devkit/build-angular/src/utils/load-esm";


export async function linkLibrary(code:string, outfile:string  ) {
    const linkerEsm = await loadEsmModule<{ default: PluginItem }>(
        '@angular/compiler-cli/linker/babel'
    );

    const linker = linkerEsm.default;

    const result = await transformAsync(code, {
        filename: outfile,
        // inputSourceMap: (useInputSourcemap ? undefined : false) as undefined,
        // sourceMaps: pluginOptions.sourcemap ? 'inline' : false,
        compact: true,
        configFile: false,
        babelrc: false,
        minified: true,
        browserslistConfigFile: false,
        plugins: [linker],
    });
   return result
}



const fileContent= fs.readFileSync("C:\\dev\\sources\\MAIN\\temp5\\frontends\\dist\\libs\\router_v16.1.5.mjs", "utf-8")

  linkLibrary(fileContent, "test-lib-link.js").then(r=>{
      const code=r.code
      fs.writeSync(fs.openSync("test-lib-link.js", "w"), code   );

});
