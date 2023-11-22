// Manually “tree shaken” from:
// <https://github.com/nodejs/node/blob/45f5c9b/lib/internal/modules/esm/get_format.js>
// Last checked on: Nov 2, 2023.

import { fileURLToPath } from 'node:url';
import { getPackageType } from './resolve-get-package-type.js';
import { codes } from './errors.js';

const { ERR_UNKNOWN_FILE_EXTENSION } = codes;

const hasOwnProperty = {}.hasOwnProperty;

/** @type {Record<string, string>} */
const extensionFormatMap = {
  __proto__: null,
  '.cjs': 'commonjs',
  '.js': 'module',
  '.json': 'json',
  '.mjs': 'module',
} as any;

/**
 * @param {string | null} mime
 * @returns {string | null}
 */
function mimeToFormat(mime: string | null) {
  if (
    mime &&
    /\s*(text|application)\/javascript\s*(;\s*charset=utf-?8\s*)?/i.test(mime)
  )
    return 'module';
  if (mime === 'application/json') return 'json';
  return null;
}

/**
 * @callback ProtocolHandler
 * @param {URL} parsed
 * @param {{parentURL: string, source?: Buffer}} context
 * @param {boolean} ignoreErrors
 * @returns {string | null | void}
 */

/**
 * @type {Record<string, ProtocolHandler>}
 */
const protocolHandlers = {
  __proto__: null,
  'data:': getDataProtocolModuleFormat,
  'file:': getFileProtocolModuleFormat,
  'http:': getHttpProtocolModuleFormat,
  'https:': getHttpProtocolModuleFormat,
  'node:'() {
    return 'builtin';
  },
};

/**
 * @param {URL} parsed
 */
function getDataProtocolModuleFormat(parsed: URL) {
  const { 1: mime } = /^([^/]+\/[^;,]+)[^,]*?(;base64)?,/.exec(
    parsed.pathname,
  ) || [null, null, null];
  return mimeToFormat(mime);
}

/**
 * Returns the file extension from a URL.
 *
 * Should give similar result to
 * `require('node:path').extname(require('node:url').fileURLToPath(url))`
 * when used with a `file:` URL.
 *
 * @param {URL} url
 * @returns {string}
 */
function extname(url: URL) {
  const pathname = url.pathname;
  let index = pathname.length;

  while (index--) {
    const code = pathname.codePointAt(index);

    if (code === 47 /* `/` */) {
      return '';
    }

    if (code === 46 /* `.` */) {
      return pathname.codePointAt(index - 1) === 47 /* `/` */
        ? ''
        : pathname.slice(index);
    }
  }

  return '';
}

/**
 * @type {ProtocolHandler}
 */
function getFileProtocolModuleFormat(
  url: URL,
  _context: any,
  ignoreErrors: any,
) {
  const ext = extname(url);

  if (ext === '.js') {
    const packageType = getPackageType(url);

    if (packageType !== 'none') {
      return packageType;
    }

    return 'commonjs';
  }

  if (ext === '') {
    const packageType = getPackageType(url);

    // Legacy behavior
    if (packageType === 'none' || packageType === 'commonjs') {
      return 'commonjs';
    }

    // Note: we don’t implement WASM, so we don’t need
    // `getFormatOfExtensionlessFile` from `formats`.
    return 'module';
  }

  const format = extensionFormatMap[ext];
  if (format) return format;

  // Explicit undefined return indicates load hook should rerun format check
  if (ignoreErrors) {
    return undefined;
  }

  const filepath = fileURLToPath(url);
  throw new ERR_UNKNOWN_FILE_EXTENSION(ext, filepath);
}

function getHttpProtocolModuleFormat() {
  // To do: HTTPS imports.
}

/**
 * @param {URL} url
 * @param {{parentURL: string}} context
 * @returns {string | null}
 */
export function defaultGetFormatWithoutErrors(
  url: URL,
  context: { parentURL: string },
) {
  const protocol = url.protocol as keyof typeof protocolHandlers;

  if (!hasOwnProperty.call(protocolHandlers, protocol)) {
    return null;
  }

  if (protocol === '__proto__') {
    return null;
  }

  return protocolHandlers[protocol](url, context, true) || null;
}