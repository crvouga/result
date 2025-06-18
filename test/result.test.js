import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  Err,
  Loading,
  NotAsked,
  Ok,
  Result,
  flatMapErr,
  flatMapOk,
  isErr,
  isLoading,
  isNotAsked,
  isOk,
  mapErr,
  mapOk,
  tryCatch,
  tryCatchSync,
  unwrap,
  unwrapOr,
} from '../result.js';

describe('Result Creation', () => {
  test('Ok creates a successful result', () => {
    const result = Ok(42);
    assert.deepStrictEqual(result, { type: 'ok', value: 42 });
  });

  test('Err creates an error result', () => {
    const result = Err('error message');
    assert.deepStrictEqual(result, { type: 'err', error: 'error message' });
  });

  test('Loading creates a loading result', () => {
    const result = Loading();
    assert.deepStrictEqual(result, { type: 'loading' });
  });

  test('NotAsked creates a not-asked result', () => {
    const result = NotAsked();
    assert.deepStrictEqual(result, { type: 'not-asked' });
  });
});

describe('Type Guards', () => {
  test('isOk correctly identifies Ok results', () => {
    assert.strictEqual(isOk(Ok(42)), true);
    assert.strictEqual(isOk(Err('error')), false);
    assert.strictEqual(isOk(Loading()), false);
    assert.strictEqual(isOk(NotAsked()), false);
    assert.strictEqual(isOk(null), false);
    assert.strictEqual(isOk({}), false);
  });

  test('isErr correctly identifies Err results', () => {
    assert.strictEqual(isErr(Err('error')), true);
    assert.strictEqual(isErr(Ok(42)), false);
    assert.strictEqual(isErr(Loading()), false);
    assert.strictEqual(isErr(NotAsked()), false);
    assert.strictEqual(isErr(null), false);
    assert.strictEqual(isErr({}), false);
  });

  test('isLoading correctly identifies Loading results', () => {
    assert.strictEqual(isLoading(Loading()), true);
    assert.strictEqual(isLoading(Ok(42)), false);
    assert.strictEqual(isLoading(Err('error')), false);
    assert.strictEqual(isLoading(NotAsked()), false);
    assert.strictEqual(isLoading(null), false);
    assert.strictEqual(isLoading({}), false);
  });

  test('isNotAsked correctly identifies NotAsked results', () => {
    assert.strictEqual(isNotAsked(NotAsked()), true);
    assert.strictEqual(isNotAsked(Ok(42)), false);
    assert.strictEqual(isNotAsked(Err('error')), false);
    assert.strictEqual(isNotAsked(Loading()), false);
    assert.strictEqual(isNotAsked(null), false);
    assert.strictEqual(isNotAsked({}), false);
  });
});

describe('Transformation Functions', () => {
  test('mapOk transforms Ok values', () => {
    const result = Ok(5);
    const doubled = mapOk(result, (x) => x * 2);
    assert.deepStrictEqual(doubled, { type: 'ok', value: 10 });
  });

  test('mapOk preserves non-Ok results', () => {
    const errorResult = Err('error');
    const mapped = mapOk(errorResult, (x) => x * 2);
    assert.deepStrictEqual(mapped, errorResult);
  });

  test('flatMapOk chains Ok operations', () => {
    const result = Ok(5);
    const validated = flatMapOk(result, (x) =>
      x > 0 ? Ok(x * 2) : Err('Number must be positive')
    );
    assert.deepStrictEqual(validated, { type: 'ok', value: 10 });
  });

  test('flatMapOk preserves non-Ok results', () => {
    const errorResult = Err('error');
    const mapped = flatMapOk(errorResult, (x) => Ok(x * 2));
    assert.deepStrictEqual(mapped, errorResult);
  });

  test('mapErr transforms Err values', () => {
    const result = Err('Network error');
    const mapped = mapErr(result, (error) => `Error: ${error}`);
    assert.deepStrictEqual(mapped, {
      type: 'err',
      error: 'Error: Network error',
    });
  });

  test('mapErr preserves non-Err results', () => {
    const successResult = Ok(42);
    const mapped = mapErr(successResult, (error) => `Error: ${error}`);
    assert.deepStrictEqual(mapped, successResult);
  });

  test('flatMapErr chains error recovery', () => {
    const result = Err('Network error');
    const recovered = flatMapErr(result, (error) =>
      error === 'Network error' ? Ok('Using cached data') : Err(error)
    );
    assert.deepStrictEqual(recovered, {
      type: 'ok',
      value: 'Using cached data',
    });
  });

  test('flatMapErr preserves non-Err results', () => {
    const successResult = Ok(42);
    const mapped = flatMapErr(successResult, () => Ok('recovered'));
    assert.deepStrictEqual(mapped, successResult);
  });
});

describe('Unwrapping', () => {
  test('unwrap extracts Ok values', () => {
    const result = Ok(42);
    const value = unwrap(result);
    assert.strictEqual(value, 42);
  });

  test('unwrap throws for non-Ok results', () => {
    const errorResult = Err('error');
    assert.throws(() => unwrap(errorResult), /Tried to unwrap a non-ok result/);
  });

  test('unwrapOr extracts Ok values', () => {
    const result = Ok(42);
    const value = unwrapOr(result, 0);
    assert.strictEqual(value, 42);
  });

  test('unwrapOr returns default for non-Ok results', () => {
    const errorResult = Err('error');
    const value = unwrapOr(errorResult, 'default');
    assert.strictEqual(value, 'default');
  });
});

describe('Error Handling', () => {
  test('tryCatchSync wraps successful execution', () => {
    const result = tryCatchSync(() => {
      const data = JSON.parse('{"name": "John"}');
      return data.name;
    });
    assert.deepStrictEqual(result, { type: 'ok', value: 'John' });
  });

  test('tryCatchSync wraps thrown errors', () => {
    const result = tryCatchSync(() => {
      const data = JSON.parse('invalid json');
      return data.name;
    });
    assert.strictEqual(result.type, 'err');
    assert(result.error instanceof SyntaxError);
  });

  test('tryCatch wraps successful async execution', async () => {
    const result = await tryCatch(async () => {
      return Promise.resolve('success');
    });
    assert.deepStrictEqual(result, { type: 'ok', value: 'success' });
  });

  test('tryCatch wraps rejected promises', async () => {
    const result = await tryCatch(async () => {
      return Promise.reject(new Error('async error'));
    });
    assert.strictEqual(result.type, 'err');
    assert.strictEqual(result.error.message, 'async error');
  });
});

describe('Result Namespace', () => {
  test('Result namespace contains all functions', () => {
    assert.strictEqual(typeof Result.Ok, 'function');
    assert.strictEqual(typeof Result.Err, 'function');
    assert.strictEqual(typeof Result.Loading, 'function');
    assert.strictEqual(typeof Result.NotAsked, 'function');
    assert.strictEqual(typeof Result.isOk, 'function');
    assert.strictEqual(typeof Result.isErr, 'function');
    assert.strictEqual(typeof Result.isLoading, 'function');
    assert.strictEqual(typeof Result.isNotAsked, 'function');
    assert.strictEqual(typeof Result.unwrap, 'function');
    assert.strictEqual(typeof Result.unwrapOr, 'function');
    assert.strictEqual(typeof Result.mapOk, 'function');
    assert.strictEqual(typeof Result.mapErr, 'function');
    assert.strictEqual(typeof Result.flatMapOk, 'function');
    assert.strictEqual(typeof Result.flatMapErr, 'function');
    assert.strictEqual(typeof Result.tryCatchSync, 'function');
    assert.strictEqual(typeof Result.tryCatch, 'function');
  });

  test('Result namespace functions work correctly', () => {
    const result = Result.Ok(42);
    assert.strictEqual(Result.isOk(result), true);
    assert.strictEqual(Result.unwrap(result), 42);
  });
});
