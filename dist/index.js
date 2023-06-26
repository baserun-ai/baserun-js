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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Baserun = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const provider_1 = require("./provider");
const template_1 = require("./template");
class Baserun {
    constructor(promptsPath) {
        this._prompts = new Map();
        try {
            const files = fs_1.default.readdirSync(promptsPath);
            for (const file of files) {
                if (path_1.default.extname(file) === '.json') {
                    try {
                        const json = fs_1.default.readFileSync(path_1.default.join(promptsPath, file), 'utf-8');
                        const data = JSON.parse(json);
                        const promptName = path_1.default.basename(file, '.json');
                        this._prompts.set(promptName, data);
                    }
                    catch (err) {
                        console.error(`Unable to read prompt '${file}'`);
                    }
                }
            }
        }
        catch (err) {
            throw new Error('Prompt path invalid.');
        }
    }
    buildPrompt(prompt, providedVariables) {
        const input = this._prompts.get(prompt);
        if (!input) {
            throw new Error(`Unable to find prompt '${prompt}'`);
        }
        const { provider } = input;
        switch (provider) {
            case provider_1.Provider.OpenAI: {
                if ('messages' in input) {
                    const { config, messages } = input;
                    return Object.assign(Object.assign({}, config), { messages: messages.map((_a) => {
                            var { content, variables } = _a, rest = __rest(_a, ["content", "variables"]);
                            return Object.assign(Object.assign({}, rest), { content: content
                                    ? (0, template_1.templatizeString)(content, (0, template_1.pickKeys)(variables, providedVariables))
                                    : undefined });
                        }) });
                }
                const { config, prompt: { content, variables }, } = input;
                return Object.assign(Object.assign({}, config), { prompt: (0, template_1.templatizeString)(content, (0, template_1.pickKeys)(variables, providedVariables)) });
            }
        }
    }
}
exports.Baserun = Baserun;
