// THIS FILE WAS AUTO-GENERATED
// Source: src/templates/apiClient.mustache
// Any manual changes will be lost.
import { apply } from "typestache";
export const template = `export async function {{{functionName:string}}}({{{args:string}}}): Promise<{{{responseType:string}}}> {
    try {
        const response = await fetch(\`{{{url:string}}}\`, {
            method: "{{{method:string}}}",
            headers: {
              "Content-Type": "application/json",
            },
            ...options,
        });
        if (!response.ok) {
            console.log(\`Error calling API {{{functionName}}}\`);
        }
        return await response.json();
    } catch (error) {
        console.error(\`Error in {{{functionName}}}:\`, error);
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: message } as {{{responseType:string}}};
    }
}
`;
const render = (args) => {
    return apply(template, args);
};
export default render;
//# sourceMappingURL=apiClient.js.map