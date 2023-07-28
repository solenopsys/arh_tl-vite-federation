import {Plugin} from 'vite';
import {TsCompilerPlugin} from "./ts-compile.plugin";
import {ProductionPlugin} from "./prod.plugin";
import {OptimizerPlugin} from "./optimizer.plugin";

const currentDir = process.cwd();
console.log("Current dir", currentDir)

export function angular(injectStubs:string[] ): Plugin[] {

    console.log("Inject stubs", injectStubs)

    return [TsCompilerPlugin, ProductionPlugin(),OptimizerPlugin]
}