import { InstrumentationBase } from '@opentelemetry/instrumentation';
import { Span } from '@opentelemetry/api';
import { BaserunType } from '../types';

export abstract class BaserunInstrumentor extends InstrumentationBase {
  abstract setRequestAttributes(
    type: BaserunType,
    span: Span,
    args: any[],
  ): void;

  abstract setResponseAttributes(
    type: BaserunType,
    span: Span,
    response: any,
  ): void;
}
