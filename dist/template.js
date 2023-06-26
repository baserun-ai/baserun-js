"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templatizeString = exports.pickKeys = void 0;
function pickKeys(keys = [], variables = {}) {
    return keys.reduce((acc, key) => {
        if (!(key in variables)) {
            throw new Error(`Variable '${key}' was not provided`);
        }
        acc[key] = variables[key];
        return acc;
    }, {});
}
exports.pickKeys = pickKeys;
function templatizeString(template, 
/* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
variables = {}) {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp('\\{\\s*' + key + '\\s*}', 'g');
        if (!regex.test(result)) {
            throw new Error(`Variable '${key}' not found`);
        }
        result = result.replace(regex, value);
    }
    return result;
}
exports.templatizeString = templatizeString;
