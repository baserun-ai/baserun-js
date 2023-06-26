"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Baserun = exports.BaserunType = exports.BaserunProvider = void 0;
const types_1 = require("./types");
Object.defineProperty(exports, "BaserunProvider", { enumerable: true, get: function () { return types_1.BaserunProvider; } });
Object.defineProperty(exports, "BaserunType", { enumerable: true, get: function () { return types_1.BaserunType; } });
const template_1 = require("./template");
class Baserun {
    buildChatPrompt(input, providedVariables) {
        const { config, messages } = input;
        return Object.assign(Object.assign({}, config), { messages: messages.map((_a) => {
                var { content, variables } = _a, rest = __rest(_a, ["content", "variables"]);
                return Object.assign(Object.assign({}, rest), { content: content
                        ? (0, template_1.templatizeString)(content, (0, template_1.pickKeys)(variables, providedVariables))
                        : undefined });
            }) });
    }
    buildCompletionPrompt(input, providedVariables) {
        const { config, prompt: { content, variables }, } = input;
        return Object.assign(Object.assign({}, config), { prompt: (0, template_1.templatizeString)(content, (0, template_1.pickKeys)(variables, providedVariables)) });
    }
}
exports.Baserun = Baserun;
