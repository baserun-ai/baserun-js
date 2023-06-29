"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseVariablesFromTemplateString = exports.templatizeString = exports.pickKeys = void 0;
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
function templatizeString(template, variables = {}) {
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
function parseVariablesFromTemplateString(template) {
    const segments = [];
    let currentIndex = 0;
    const regex = new RegExp('\\{([^{}]*?)}', 'g');
    let match;
    while ((match = regex.exec(template)) !== null) {
        if (match.index > currentIndex) {
            segments.push({
                type: 'literal',
                text: template.slice(currentIndex, match.index),
            });
        }
        segments.push({
            type: 'variable',
            name: match[1].trim(),
        });
        currentIndex = regex.lastIndex;
    }
    if (currentIndex < template.length) {
        segments.push({
            type: 'literal',
            text: template.slice(currentIndex),
        });
    }
    return segments;
}
exports.parseVariablesFromTemplateString = parseVariablesFromTemplateString;
