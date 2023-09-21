import { SpanAttributeName } from './span_attributes';
import { isDefined } from '../helpers';
import { Span } from '@opentelemetry/api';

export function setAttributeIfExists(
  span: Span,
  attribute: SpanAttributeName,
  value?: any,
) {
  if (!isDefined(value)) {
    return;
  }

  span.setAttribute(attribute, value);
}
