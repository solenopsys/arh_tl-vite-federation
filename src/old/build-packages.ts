

import {
    BuildAdapter,
    buildForFederation,
    FederationOptions,
    NormalizedFederationConfig,
    setBuildAdapter
} from "../../../../../../../../../dev/module-federation-plugin/libs/native-federation-core/build";
import {createEsBuildAdapter} from "@softarc/native-federation-esbuild";

export const esBuildAdapter: BuildAdapter = createEsBuildAdapter({
    plugins: [],
});

setBuildAdapter(
    esBuildAdapter
)


const fedConfig:NormalizedFederationConfig = {
    name: 'test',
    exposes: {
    },
    shared: {
        "@angular/router": {
            singleton: true,
            strictVersion: true,
            requiredVersion: '>=12.0.0'
        },
    },
    sharedMappings: [
        ]
}

const fedOptions:FederationOptions = {
    workspaceRoot: "C:/dev/sources/MAIN/temp5/frontends",
    outputPath: "./dist",
    federationConfig: "C:/dev/sources/MAIN/temp5/frontends/federation.config.js",
    tsConfig: "C:/dev/sources/MAIN/temp5/tools/vite-micro-federation/src/lib-compiler/tsconfig.json",
}

buildForFederation(
    fedConfig,
    fedOptions,
    []
);

