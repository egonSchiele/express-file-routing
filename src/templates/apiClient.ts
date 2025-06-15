// THIS FILE WAS AUTO-GENERATED
// Source: /Users/adit/express-file-routing/src/templates/apiClient.mustache
// Any manual changes will be lost.
import { apply } from "typestache";

export const template = `export function {{functionName:string}}(options:Record<string, any> = {}): Promise<Response> {
    return fetch(\`{{url:string}}\`, {
        method: "{{method:string}}",
        headers: {
          "Content-Type": "application/json",
        },
        ...options,
    });
}
`;

export type TemplateType = {
  functionName: string;
  url: string;
  method: string;
};

const render = (args: TemplateType) => {
  return apply(template, args);
}

export default render;
    