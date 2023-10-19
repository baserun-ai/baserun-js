"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const llamaindex_1 = require("llamaindex");
const index_js_1 = require("../../../src/index.js");
index_js_1.baserun.init();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const before = performance.now();
        const storageContext = yield (0, llamaindex_1.storageContextFromDefaults)({
            persistDir: './storage',
        });
        const documents = yield new llamaindex_1.SimpleDirectoryReader().loadData({
            directoryPath: './texts',
        });
        const after = performance.now();
        // Split text and create embeddings. Store them in a VectorStoreIndex
        const index = yield llamaindex_1.VectorStoreIndex.fromDocuments(documents, {
            storageContext,
        });
        console.log(`Loaded ${documents.length} documents in ${after - before}ms`);
        const queryEngine = index.asQueryEngine();
        const response = yield queryEngine.query('How old did Alexander get?');
        console.log(response.toString());
    });
}
const tracedMain = index_js_1.baserun.trace(main);
tracedMain();
