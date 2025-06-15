export declare const template = "export function {{functionName:string}}({{{args:string}}}): Promise<Response> {\n    return fetch(`{{url:string}}`, {\n        method: \"{{method:string}}\",\n        headers: {\n          \"Content-Type\": \"application/json\",\n        },\n        ...options,\n    });\n}\n";
export type TemplateType = {
    functionName: string;
    args: string;
    url: string;
    method: string;
};
declare const render: (args: TemplateType) => string;
export default render;
