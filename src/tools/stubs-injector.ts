export function injectStubs(id:string,typesMap: { [packageName: string]: string }, code: string): string {
    let stubs = "\n"




    if (Object.keys(typesMap).length === 0)
        return code;




    let cleanedMap: { [key: string]: string } = {}
    Object.keys(typesMap).forEach(key => {
        if (code.indexOf(key) === -1)
            cleanedMap[key] = typesMap[key]
    })






    if (Object.keys(cleanedMap).length === 0)
        return code;



    if (Object.keys(cleanedMap).length > 0) {
        stubs += Object.keys(cleanedMap).filter(key =>
            cleanedMap[key] === 'type' || cleanedMap[key] === 'interface'
        ).map((key) => {
            return `export var ${key};\n`
        }).join("");
    }




    return code + "\n\n// Stubs for Vite to resolve types and interfaces." + stubs;
}