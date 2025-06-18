import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  Ok,
  Err,
  Loading,
  NotAsked,
  isOk,
  isResult,
  isRemoteResult,
} from '../result.js';

describe('Type Guards', () => {
  describe('isResult', () => {
    test('validates basic Result types', () => {
      assert.strictEqual(isResult(Ok(42)), true);
      assert.strictEqual(isResult(Err('error')), true);
      assert.strictEqual(isResult(Loading()), false);
      assert.strictEqual(isResult(NotAsked()), false);
      assert.strictEqual(isResult(null), false);
      assert.strictEqual(isResult({}), false);
      assert.strictEqual(isResult({ type: 'unknown' }), false);
    });

    test('validates with value validator', () => {
      const isNumber = (value) => typeof value === 'number';
      const isString = (value) => typeof value === 'string';

      assert.strictEqual(isResult(Ok(42), isNumber), true);
      assert.strictEqual(isResult(Ok('hello'), isString), true);
      assert.strictEqual(isResult(Ok('hello'), isNumber), false);
      assert.strictEqual(isResult(Err('error'), isNumber), true); // Error results pass regardless
    });

    test('validates with error validator', () => {
      const isStringError = (error) => typeof error === 'string';
      const isObjectError = (error) =>
        typeof error === 'object' && error !== null && 'message' in error;

      assert.strictEqual(
        isResult(Err('error'), undefined, isStringError),
        true
      );
      assert.strictEqual(
        isResult(Err({ message: 'error' }), undefined, isObjectError),
        true
      );
      assert.strictEqual(
        isResult(Err({ message: 'error' }), undefined, isStringError),
        false
      );
      assert.strictEqual(isResult(Ok(42), undefined, isStringError), true); // Ok results pass regardless
    });

    test('validates with both value and error validators', () => {
      const isNumber = (value) => typeof value === 'number';
      const isStringError = (error) => typeof error === 'string';

      assert.strictEqual(isResult(Ok(42), isNumber, isStringError), true);
      assert.strictEqual(isResult(Err('error'), isNumber, isStringError), true);
      assert.strictEqual(
        isResult(Ok('not a number'), isNumber, isStringError),
        false
      );
      assert.strictEqual(
        isResult(Err({ message: 'error' }), isNumber, isStringError),
        false
      );
    });

    test('handles complex object validation', () => {
      const isUser = (value) =>
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'name' in value &&
        typeof value.id === 'number' &&
        typeof value.name === 'string';

      const validUser = { id: 1, name: 'John' };
      const invalidUser = { id: 'not a number', name: 'John' };

      assert.strictEqual(isResult(Ok(validUser), isUser), true);
      assert.strictEqual(isResult(Ok(invalidUser), isUser), false);
    });
  });

  describe('isRemoteResult', () => {
    test('validates all RemoteResult types', () => {
      assert.strictEqual(isRemoteResult(Ok(42)), true);
      assert.strictEqual(isRemoteResult(Err('error')), true);
      assert.strictEqual(isRemoteResult(Loading()), true);
      assert.strictEqual(isRemoteResult(NotAsked()), true);
      assert.strictEqual(isRemoteResult(null), false);
      assert.strictEqual(isRemoteResult({}), false);
    });

    test('validates with value validator', () => {
      const isNumber = (value) => typeof value === 'number';

      assert.strictEqual(isRemoteResult(Ok(42), isNumber), true);
      assert.strictEqual(isRemoteResult(Ok('hello'), isNumber), false);
      assert.strictEqual(isRemoteResult(Loading(), isNumber), true); // Loading passes
      assert.strictEqual(isRemoteResult(NotAsked(), isNumber), true); // NotAsked passes
      assert.strictEqual(isRemoteResult(Err('error'), isNumber), true); // Error passes
    });

    test('validates with error validator', () => {
      const isStringError = (error) => typeof error === 'string';

      assert.strictEqual(
        isRemoteResult(Err('error'), undefined, isStringError),
        true
      );
      assert.strictEqual(
        isRemoteResult(Err({ message: 'error' }), undefined, isStringError),
        false
      );
      assert.strictEqual(
        isRemoteResult(Loading(), undefined, isStringError),
        true
      ); // Loading passes
      assert.strictEqual(
        isRemoteResult(NotAsked(), undefined, isStringError),
        true
      ); // NotAsked passes
      assert.strictEqual(
        isRemoteResult(Ok(42), undefined, isStringError),
        true
      ); // Ok passes
    });

    test('validates with both validators', () => {
      const isNumber = (value) => typeof value === 'number';
      const isStringError = (error) => typeof error === 'string';

      assert.strictEqual(isRemoteResult(Ok(42), isNumber, isStringError), true);
      assert.strictEqual(
        isRemoteResult(Err('error'), isNumber, isStringError),
        true
      );
      assert.strictEqual(
        isRemoteResult(Loading(), isNumber, isStringError),
        true
      );
      assert.strictEqual(
        isRemoteResult(NotAsked(), isNumber, isStringError),
        true
      );
      assert.strictEqual(
        isRemoteResult(Ok('not a number'), isNumber, isStringError),
        false
      );
      assert.strictEqual(
        isRemoteResult(Err({ message: 'error' }), isNumber, isStringError),
        false
      );
    });
  });

  describe('Real-world usage examples', () => {
    test('parsing HTTP response', () => {
      const isUser = (data) =>
        typeof data === 'object' &&
        data !== null &&
        'id' in data &&
        'name' in data;

      const validResponse = { type: 'ok', value: { id: 1, name: 'John' } };
      const invalidResponse = { type: 'ok', value: { name: 'John' } }; // missing id
      const errorResponse = { type: 'err', error: 'User not found' };

      assert.strictEqual(isResult(validResponse, isUser), true);
      assert.strictEqual(isResult(invalidResponse, isUser), false);
      assert.strictEqual(isResult(errorResponse, isUser), true);
    });

    test('validating API error responses', () => {
      const isApiError = (error) =>
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'message' in error;

      const validError = {
        type: 'err',
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      };
      const invalidError = { type: 'err', error: 'Simple string error' };

      assert.strictEqual(isResult(validError, undefined, isApiError), true);
      assert.strictEqual(isResult(invalidError, undefined, isApiError), false);
    });

    test('parsing unknown data with fallback', () => {
      const parseUserResult = (unknownData) => {
        const isUser = (value) =>
          typeof value === 'object' &&
          value !== null &&
          'id' in value &&
          'name' in value;

        if (isResult(unknownData, isUser)) {
          return unknownData; // Type-safe Result<User, unknown>
        }

        return Err('Invalid response format');
      };

      const validData = { type: 'ok', value: { id: 1, name: 'John' } };
      const invalidData = { type: 'ok', value: { name: 'John' } };
      const notResultData = { some: 'other data' };

      const validResult = parseUserResult(validData);
      const invalidResult = parseUserResult(invalidData);
      const fallbackResult = parseUserResult(notResultData);

      assert.strictEqual(isOk(validResult), true);
      assert.strictEqual(isOk(invalidResult), false);
      assert.strictEqual(isOk(fallbackResult), false);
    });
  });
});
