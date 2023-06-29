export declare function pickKeys(keys?: string[], variables?: Record<string, string>): Record<string, string>;
export declare function templatizeString(template: string, variables?: Record<string, string>): string;
interface LiteralSegment {
    type: 'literal';
    text: string;
}
interface VariableSegment {
    type: 'variable';
    name: string;
}
type Segment = LiteralSegment | VariableSegment;
export declare function parseVariablesFromTemplateString(template: string): Segment[];
export {};
