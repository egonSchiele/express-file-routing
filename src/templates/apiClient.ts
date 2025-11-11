// THIS FILE WAS AUTO-GENERATED
// Source: /Users/adit/express-file-routing/src/templates/apiClient.mustache
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
        return response.json();
    } catch (error) {
        console.error(\`Error in {{{functionName}}}:\`, error);
        return { success: false, error } as {{{responseType:string}}};
    }
}
`;

export type TemplateType = {
  functionName: string;
  args: string;
  responseType: string;
  url: string;
  method: string;
};

const render = (args: TemplateType) => {
  return apply(template, args);
}

export default render;
    