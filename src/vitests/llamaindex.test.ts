import { beforeEach, describe, expect, test, vi } from 'vitest';
import { baserun } from '../index.js';
import { Baserun } from '../baserun.js';
import fs from 'node:fs/promises';
/* eslint-disable-next-line  @typescript-eslint/ban-ts-comment */
// @ts-ignore: it produces error we
import { VectorStoreIndex, Document } from 'llamaindex';

describe('llamaindex', () => {
  baserun.init();
  const submitLogSpy = vi.spyOn(Baserun.submissionService, 'submitLog');
  const submitSpanSpy = vi.spyOn(Baserun.submissionService, 'submitSpan');

  beforeEach(() => {
    submitLogSpy.mockClear();
    submitSpanSpy.mockClear();
  });

  test('simple query', async () => {
    const query =
      'I have flour, sugar and butter. What am I missing if I want to bake oatmeal cookies from my recipe?';
    const res = await baserun.trace(async () => {
      const dir = 'src/vitests/test_data';
      const documents: Document[] = [];
      for (const path of await fs.readdir(dir)) {
        const recipe = await fs.readFile(dir + '/' + path, 'utf-8');
        const document = new Document({ text: recipe, id_: path });
        documents.push(document);
      }
      const index = await VectorStoreIndex.fromDocuments(documents);
      const queryEngine = index.asQueryEngine();
      return await queryEngine.query({ query });
    })();

    expect(submitSpanSpy.mock.calls.length).toEqual(3);
    expect(submitSpanSpy.mock.calls[0][0].span!.requestType).toEqual(
      'embeddings',
    );
    expect(submitSpanSpy.mock.calls[1][0].span!.requestType).toEqual(
      'embeddings',
    );
    expect(submitSpanSpy.mock.calls[2][0].span!.requestType).toEqual('chat');
    expect(submitSpanSpy.mock.calls[2][0].span!.completions[0].content).toEqual(
      res.response,
    );

    expect(submitLogSpy.mock.calls.length).toEqual(2);
    expect(submitLogSpy.mock.calls[0][0].log!.name).toEqual(
      'Query for nodes retrieval',
    );
    expect(submitLogSpy.mock.calls[0][0].log!.payload).toEqual(query);
    expect(submitLogSpy.mock.calls[1][0].log!.name).toEqual('Selected nodes');
  });
});
