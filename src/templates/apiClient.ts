// THIS FILE WAS AUTO-GENERATED
// Source: /Users/adit/express-file-routing/src/templates/apiClient.mustache
// Any manual changes will be lost.
import { apply } from "typestache";

export const template = `export function {{functionName:string}}({{{args:string}}}): Promise<Response> {
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
  args: string;
  url: string;
  method: string;
};

const render = (args: TemplateType) => {
  return apply(template, args);
}

export default render;
    