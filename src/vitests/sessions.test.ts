import {
  SpyInstance,
  expect,
  vi,
  describe,
  beforeAll,
  beforeEach,
  afterEach,
  test,
} from 'vitest';
import { baserun } from '../index.js';
import { Baserun } from '../baserun.js';
import { Log, Run, Span } from '../v1/gen/baserun.js';
baserun.init();

import OpenAI from 'openai';
import groupBy from 'lodash.groupby';

const openai = new OpenAI();

describe('sessions', () => {
  let submitLogSpy: SpyInstance<
    [logOrSpan: Log | Span, run: Run, submitRun?: boolean],
    Promise<void>
  >;

  beforeAll(() => {
    baserun.init();
  });

  beforeEach(() => {
    submitLogSpy = vi.spyOn(Baserun, 'submitLogOrSpan');
  });

  afterEach(() => {
    submitLogSpy.mockRestore();
  });

  test('session', async () => {
    const { sessionId, data } = await baserun.session({
      async session() {
        await baserun.trace(async () => {
          baserun.log('lets go', 'omg');
          await openai.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: '1+1=',
            temperature: 0,
          });

          expect(Baserun.sessionQueue.length).toBe(1);

          const res = await openai.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: '2+2=',
            temperature: 0,
          });

          baserun.log('TestEvent', 'whatever');

          baserun.evals.includes(
            'model name',
            res.model,
            'gpt-3.5-turbo-instruct',
          );
        })();
      },
      user: 'bob@rob.com',
    });

    const storedData = submitLogSpy.mock.calls as any;

    const [span1] = storedData[0];
    expect(span1.name).toBe('lets go');

    const [span2] = storedData[1];
    expect(span2.model).toBe('gpt-3.5-turbo-instruct');

    const [span3] = storedData[2];
    expect(span3.model).toBe('gpt-3.5-turbo-instruct');

    const [span4] = storedData[3];
    expect(span4.name).toBe('TestEvent');
  });

  test('session with predefined sessionId', async () => {
    const predefinedSessionId = '15f75d3a-8007-4ff2-bada-0a27518ee668';
    const { sessionId } = await baserun.session({
      async session() {
        await baserun.trace(async () => {
          baserun.log('lets go', 'omg');
          await openai.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: '1+1=',
            temperature: 0,
          });

          expect(Baserun.sessionQueue.length).toBe(1);

          const res = await openai.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: '2+2=',
            temperature: 0,
          });

          baserun.log('TestEvent', 'whatever');

          baserun.evals.includes(
            'model name',
            res.model,
            'gpt-3.5-turbo-instruct',
          );
        })();
      },
      user: 'bob@rob.com',
      sessionId: predefinedSessionId,
    });

    expect(sessionId).toBe(predefinedSessionId);

    const storedData = submitLogSpy.mock.calls as any;

    const [span1] = storedData[0];
    expect(span1.name).toBe('lets go');

    const [span2] = storedData[1];
    expect(span2.model).toBe('gpt-3.5-turbo-instruct');

    const [span3] = storedData[2];
    expect(span3.model).toBe('gpt-3.5-turbo-instruct');

    const [span4] = storedData[3];
    expect(span4.name).toBe('TestEvent');
  });

  test('session with parallel traces', async () => {
    const trace = await baserun.trace(async () => {
      baserun.log('lets go', 'omg');
      await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: '1+1=',
        temperature: 0,
      });

      const res = await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: '2+2=',
        temperature: 0,
      });

      baserun.log('TestEvent', 'whatever');

      baserun.evals.includes('model name', res.model, 'gpt-3.5-turbo-instruct');
    });

    const session = async () => {
      expect(Baserun.sessionQueue.length).toBe(1);

      await Promise.all([trace(), trace()]);
    };

    await baserun.session({
      session,
      user: 'bobby-brown@bobob.bob',
    });

    const storedData = submitLogSpy.mock.calls as any;

    // we want to make sure that the traces are separate
    expect(storedData.length).toBe(8);

    const grouped = groupBy(storedData, (x: any) => x[1].runId);
    // group by runId

    const [trace1, trace2] = Object.values(grouped);

    expect(trace1.length).toBe(4);
    expect(trace2.length).toBe(4);
  });

  // parallel sessions with parallel traces
  test('parallel sessions with parallel traces and predefined session ids', async () => {
    const sessionId1 = '439d6b6e-0f6c-486f-a476-2e146335f3c6';
    const sessionId2 = 'e2792182-c0cc-4a7b-86cb-93d990a74dbe';

    const trace = await baserun.trace(async () => {
      baserun.log('lets go', 'omg');
      await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: '1+1=',
        temperature: 0,
      });

      const res = await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: '2+2=',
        temperature: 0,
      });

      baserun.log('TestEvent', 'whatever');

      baserun.evals.includes('model name', res.model, 'gpt-3.5-turbo-instruct');
    });

    const session = async () => {
      await Promise.all([trace(), trace()]);
    };

    const [data1, data2] = await Promise.all([
      baserun.session({
        session,
        user: 'bobby-brown@bobob.bob',
        sessionId: sessionId1,
      }),
      baserun.session({
        session,
        user: 'bobby-brown@bobob.bob',
        sessionId: sessionId2,
      }),
    ]);

    expect(data1.sessionId).toBe(sessionId1);
    expect(data2.sessionId).toBe(sessionId2);
  });

  test('session with top level log', async () => {
    await baserun.session({
      async session() {
        baserun.log('TestEvent', 'whatever');
      },
      user: 'bobob',
    });
  });
});
