import {buildEsbuildBrowser} from "@angular-devkit/build-angular/src/builders/browser-esbuild";
import {Schema as BrowserBuilderOptions} from "@angular-devkit/build-angular/src/builders/browser-esbuild/schema";
import {BuilderContext, BuilderInfo, BuilderOutput, createBuilder} from "@angular-devkit/architect";


export default createBuilder(copyFileBuilder);

async function copyFileBuilder(
    options: BrowserBuilderOptions,
    context: BuilderContext,
): Promise<BuilderOutput> {
    try {
        await buildEsbuildBrowser(options, context);
    } catch (err) {
        return {
            success: false,
            error: err.message,
        };
    }

    return {success: true};
}



