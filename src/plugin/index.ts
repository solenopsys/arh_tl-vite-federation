import { Plugin } from 'vite';
import { DirImporterPlugin } from './node/dir-importer';
import { AngularVitePluginOptions as VitePluginAngularOptions } from './plugin-options';
import { CommonPlugin } from './plugins/config';
import { DevelopmentPlugin } from './plugins/dev.plugin';
import { ProductionPlugin } from './plugins/prod.plugin';
import { checker } from 'vite-plugin-checker';
import defu from 'defu';

export function angular(options?: VitePluginAngularOptions): Plugin[] {
  const { typecheck } = defu(options, {
    typecheck: true,
  });
  const plugins = [
    CommonPlugin,
    DirImporterPlugin,
    DevelopmentPlugin,
    ...ProductionPlugin(),
  ];
  if (typecheck) {
    plugins.push(checker({ typescript: true }));
  }
  return plugins;
}
