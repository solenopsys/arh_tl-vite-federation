

export type Entry = {
    layout: XsModule,
    routes: { [key: string]: XsModule }
}

export type XsModule = {
    data: any,
    module: string,
}

export async function fetchJsonData(url: string): Promise<Entry> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return await response.json();
}




