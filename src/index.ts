import {Plugin} from 'vite';
import {TsCompilerPlugin} from "./ts-compile-plugin";
import {ProductionPlugin} from "./prod.plugin";
import {OptimizerPlugin} from "./optimizer.plugin";


export function solemon(): Plugin[] {
    return [TsCompilerPlugin, ProductionPlugin(),OptimizerPlugin]
}