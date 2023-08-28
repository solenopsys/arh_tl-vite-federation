import {Plugin} from 'vite';
import {TsCompilerPlugin} from "./ts-compile.plugin";
import {ProductionPlugin} from "./prod.plugin";
import {OptimizerPlugin} from "./optimizer.plugin";

const currentDir = process.cwd();


export function angular(injectStubs:string[] ): Plugin[] {

    console.info("Inject stubs", injectStubs)

    return [TsCompilerPlugin, ProductionPlugin(),OptimizerPlugin]
}