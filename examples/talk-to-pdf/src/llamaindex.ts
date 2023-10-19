import {
  VectorStoreIndex,
  SimpleDirectoryReader,
  storageContextFromDefaults,
} from 'llamaindex';
import { baserun } from '../../../src/index.js';

baserun.init();

async function main() {
  const before = performance.now();
  const storageContext = await storageContextFromDefaults({
    persistDir: './storage',
  });

  const documents = await new SimpleDirectoryReader().loadData({
    directoryPath: './texts',
  });
  const after = performance.now();

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents, {
    storageContext,
  });
  console.log(`Loaded ${documents.length} documents in ${after - before}ms`);

  const queryEngine = index.asQueryEngine();

  const response = await queryEngine.query('How old did Alexander get?');
  console.log(response.toString());
}

const tracedMain = baserun.trace(main);

tracedMain();
