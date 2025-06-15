export declare const template = "export async function {{functionName:string}}({{{args:string}}}): Promise<{{responseType:string}}> {\n    const response = await fetch(`{{url:string}}`, {\n        method: \"{{method:string}}\",\n        headers: {\n          \"Content-Type\": \"application/json\",\n        },\n        ...options,\n    });\n    if (!response.ok) {\n        console.log(`Error calling API {{functionName}}`);\n    }\n    return response.json();\n}\n";
export type TemplateType = {
    functionName: string;
    args: string;
    responseType: string;
    url: string;
    method: string;
};
declare const render: (args: TemplateType) => string;
export default render;
