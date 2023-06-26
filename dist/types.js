"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaserunType = exports.BaserunProvider = void 0;
var BaserunProvider;
(function (BaserunProvider) {
    BaserunProvider["OpenAI"] = "openai";
})(BaserunProvider || (exports.BaserunProvider = BaserunProvider = {}));
var BaserunType;
(function (BaserunType) {
    BaserunType["Chat"] = "chat";
    BaserunType["Completion"] = "completion";
})(BaserunType || (exports.BaserunType = BaserunType = {}));
