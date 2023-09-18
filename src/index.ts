import {Plugin} from 'vite';
import {TsCompilerPlugin} from "./ts-compile.plugin";


export function angular(injectStubs: string[]): Plugin[] {
    console.info("Inject stubs", injectStubs);
    return [TsCompilerPlugin];
}

export { angular as default };