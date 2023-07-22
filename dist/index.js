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
exports.Baserun = exports.parseVariablesFromTemplateString = exports.BaserunType = exports.BaserunProvider = exports.OpenAIChatRole = void 0;
const openai_1 = require("./openai");
Object.defineProperty(exports, "OpenAIChatRole", { enumerable: true, get: function () { return openai_1.OpenAIChatRole; } });
const types_1 = require("./types");
Object.defineProperty(exports, "BaserunProvider", { enumerable: true, get: function () { return types_1.BaserunProvider; } });
Object.defineProperty(exports, "BaserunType", { enumerable: true, get: function () { return types_1.BaserunType; } });
const template_1 = require("./template");
Object.defineProperty(exports, "parseVariablesFromTemplateString", { enumerable: true, get: function () { return template_1.parseVariablesFromTemplateString; } });
class Baserun {
    buildOpenAIChatPrompt(input, providedVariables) {
        const { config, messages } = input;
        return Object.assign(Object.assign({}, config), { messages: messages.map((_a) => {
                var { content, variables } = _a, rest = __rest(_a, ["content", "variables"]);
                return Object.assign(Object.assign({}, rest), { content: content
                        ? (0, template_1.templatizeString)(content, (0, template_1.pickKeys)(variables, providedVariables))
                        : '' });
            }) });
    }
    buildOpenAICompletionPrompt(input, providedVariables) {
        const { config, prompt: { content, variables }, } = input;
        return Object.assign(Object.assign({}, config), { prompt: (0, template_1.templatizeString)(content, (0, template_1.pickKeys)(variables, providedVariables)) });
    }
    buildGoogleCompletionPrompt(input, providedVariables) {
        const _a = input.config, { model } = _a, config = __rest(_a, ["model"]), { prompt: { content, variables } } = input;
        return {
            model,
            parameters: config,
            instances: [
                {
                    prompt: (0, template_1.templatizeString)(content, (0, template_1.pickKeys)(variables, providedVariables)),
                },
            ],
        };
    }
    buildGoogleChatPrompt(input, providedVariables) {
        const _a = input.config, { model } = _a, config = __rest(_a, ["model"]), { messages } = input;
        return {
            model,
            parameters: config,
            instances: [
                {
                    messages: messages.map(({ content, variables, role }) => {
                        return {
                            author: role,
                            content: content
                                ? (0, template_1.templatizeString)(content, (0, template_1.pickKeys)(variables, providedVariables))
                                : '',
                        };
                    }),
                },
            ],
        };
    }
    buildLlamaChatPrompt(input, providedVariables) {
        const _a = input.config, { model } = _a, config = __rest(_a, ["model"]), { messages } = input;
        const systemPrompt = messages
            .filter((message) => message.role === openai_1.OpenAIChatRole.System)
            .map((message) => {
            return message.content
                ? (0, template_1.templatizeString)(message.content, (0, template_1.pickKeys)(message.variables, providedVariables))
                : undefined;
        })
            .join('\n');
        const userAndAssistantMessages = messages
            .filter((message) => message.role === openai_1.OpenAIChatRole.User ||
            message.role === openai_1.OpenAIChatRole.Assistant);
        const prompt = userAndAssistantMessages
            .map((message) => {
            var _a;
            const templatedMessage = (0, template_1.templatizeString)((_a = message.content) !== null && _a !== void 0 ? _a : '', (0, template_1.pickKeys)(message.variables, providedVariables));
            if (userAndAssistantMessages.length === 1 ||
                userAndAssistantMessages.every(message => message.role === openai_1.OpenAIChatRole.User)) {
                return templatedMessage;
            }
            const prefix = message.role === openai_1.OpenAIChatRole.User ? 'User' : 'Assistant';
            return `${prefix}: ${templatedMessage}`;
        })
            .join('\n');
        return {
            model,
            input: Object.assign(Object.assign({}, config), { prompt, system_prompt: systemPrompt }),
        };
    }
}
exports.Baserun = Baserun;
