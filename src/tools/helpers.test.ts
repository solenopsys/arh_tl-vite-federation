import {libNameToPackageName} from "./helpers";


test('libToPackage', () => {
    const sourceName="C:/dev/sources/SOLENOPSYS/frontends/node_modules/.vite/deps/@angular_core.js?v=5ed1531f"
    let {libName,packageName} = libNameToPackageName(sourceName);
    expect(libName).toBe("@angular_core.js");
    expect(packageName).toBe("@angular/core");
});