import { SpanAttributeName } from './span_attributes';
import { BaserunInstrumentor } from './base_instrumentor';
import {
  context,
  Span,
  SpanKind,
  trace,
  SpanStatusCode,
} from '@opentelemetry/api';
import { isTracingSuppressed } from '@opentelemetry/core';
import { BaserunType } from '../types';

async function* wrapStream(
  stream: AsyncIterable<any>,
  span: Span,
  processStreamChunk: (chunk: any, span: Span) => boolean,
): AsyncIterable<any> {
  for await (const chunk of stream) {
    const end = processStreamChunk(span, chunk);
    if (end) {
      span.end();
    }
    yield chunk;
  }
}

interface MethodDefinition {
  name: string;
  original: (...args: any[]) => any;
  originalThis: any;
  originalArgs: any[];
  /* Return true if we should end the span */
  processStreamChunk: (span: Span, chunk: any) => boolean;
}

export async function wrapMethod(
  instrumentor: BaserunInstrumentor,
  {
    name,
    original,
    originalThis,
    originalArgs,
    processStreamChunk,
  }: MethodDefinition,
) {
  const tracerProvider = trace.getTracerProvider();
  const tracer = tracerProvider.getTracer('baserun');
  if (isTracingSuppressed(context.active())) {
    return original.apply(originalThis, [...originalArgs]);
  }

  const requestType = name.split('.').slice(-1)[0] as unknown as BaserunType;
  const span = tracer.startSpan(`baserun.${name}`, {
    kind: SpanKind.CLIENT,
    attributes: { [SpanAttributeName.LLM_REQUEST_TYPE]: requestType },
  });

  let shouldEndSpan = true;
  const response = await context.with(
    trace.setSpan(context.active(), span),
    async () => {
      instrumentor.setRequestAttributes(requestType, span, originalArgs);
      const response = await original.apply(originalThis, [...originalArgs]);
      if (
        Symbol.asyncIterator in response &&
        typeof response[Symbol.asyncIterator] === 'function'
      ) {
        // The span will be ended inside the stream wrapper once it's finished
        shouldEndSpan = false;
        return wrapStream(response, span, processStreamChunk);
      }

      span.setStatus({ code: SpanStatusCode.OK });
      instrumentor.setResponseAttributes(requestType, span, response);

      return response;
    },
  );

  if (shouldEndSpan) {
    span.end();
  }

  return response;
}
