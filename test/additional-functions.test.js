import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  Ok,
  Err,
  Loading,
  NotAsked,
  match,
  fold,
  fromNullable,
  fromUndefined,
  toPromise,
  getOrElse,
  bimap,
  swap,
  equals,
  isRemoteSuccess,
  isRemoteFailure,
  mapRemote,
  foldRemote,
  fromNullish,
  fromFalsy,
} from '../result.js';

describe('Pattern Matching', () => {
  describe('match', () => {
    test('handles Ok results', () => {
      const result = Ok(42);
      const message = match(result, {
        ok: (value) => `Success: ${value}`,
        err: (error) => `Error: ${error}`,
        loading: () => 'Loading...',
        notAsked: () => 'Not started',
      });
      assert.strictEqual(message, 'Success: 42');
    });

    test('handles Err results', () => {
      const result = Err('Something went wrong');
      const message = match(result, {
        ok: (value) => `Success: ${value}`,
        err: (error) => `Error: ${error}`,
        loading: () => 'Loading...',
        notAsked: () => 'Not started',
      });
      assert.strictEqual(message, 'Error: Something went wrong');
    });

    test('handles Loading results', () => {
      const result = Loading();
      const message = match(result, {
        ok: (value) => `Success: ${value}`,
        err: (error) => `Error: ${error}`,
        loading: () => 'Loading...',
        notAsked: () => 'Not started',
      });
      assert.strictEqual(message, 'Loading...');
    });

    test('handles NotAsked results', () => {
      const result = NotAsked();
      const message = match(result, {
        ok: (value) => `Success: ${value}`,
        err: (error) => `Error: ${error}`,
        loading: () => 'Loading...',
        notAsked: () => 'Not started',
      });
      assert.strictEqual(message, 'Not started');
    });

    test('throws on invalid result type', () => {
      const invalidResult = { type: 'invalid' };
      assert.throws(() => {
        match(invalidResult, {
          ok: () => 'ok',
          err: () => 'err',
          loading: () => 'loading',
          notAsked: () => 'notAsked',
        });
      }, /Invalid result type/);
    });
  });

  describe('fold', () => {
    test('handles Ok results', () => {
      const result = Ok(42);
      const message = fold(
        result,
        (value) => `Success: ${value}`,
        (error) => `Error: ${error}`
      );
      assert.strictEqual(message, 'Success: 42');
    });

    test('handles Err results', () => {
      const result = Err('Something went wrong');
      const message = fold(
        result,
        (value) => `Success: ${value}`,
        (error) => `Error: ${error}`
      );
      assert.strictEqual(message, 'Error: Something went wrong');
    });

    test('throws on invalid result type', () => {
      const invalidResult = { type: 'invalid' };
      assert.throws(() => {
        fold(
          invalidResult,
          (value) => `Success: ${value}`,
          (error) => `Error: ${error}`
        );
      }, /Invalid result type/);
    });
  });

  describe('foldRemote', () => {
    test('handles all RemoteResult states', () => {
      const getStatus = (result) =>
        foldRemote(result, {
          success: () => 'success',
          failure: () => 'error',
          loading: () => 'loading',
          notAsked: () => 'idle',
        });

      assert.strictEqual(getStatus(Ok(42)), 'success');
      assert.strictEqual(getStatus(Err('error')), 'error');
      assert.strictEqual(getStatus(Loading()), 'loading');
      assert.strictEqual(getStatus(NotAsked()), 'idle');
    });

    test('throws on invalid result type', () => {
      const invalidResult = { type: 'invalid' };
      assert.throws(() => {
        foldRemote(invalidResult, {
          success: () => 'success',
          failure: () => 'error',
          loading: () => 'loading',
          notAsked: () => 'idle',
        });
      }, /Invalid result type/);
    });
  });
});

describe('Utility Functions', () => {
  describe('fromNullable', () => {
    test('creates Ok from non-null value', () => {
      const result = fromNullable(42, 'Value is null');
      assert.deepStrictEqual(result, { type: 'ok', value: 42 });
    });

    test('creates Ok from non-undefined value', () => {
      const result = fromNullable('hello', 'Value is undefined');
      assert.deepStrictEqual(result, { type: 'ok', value: 'hello' });
    });

    test('creates Err from null', () => {
      const result = fromNullable(null, 'Value is null');
      assert.deepStrictEqual(result, { type: 'err', error: 'Value is null' });
    });

    test('creates Err from undefined', () => {
      const result = fromNullable(undefined, 'Value is undefined');
      assert.deepStrictEqual(result, {
        type: 'err',
        error: 'Value is undefined',
      });
    });

    test('creates Ok from zero', () => {
      const result = fromNullable(0, 'Value is null');
      assert.deepStrictEqual(result, { type: 'ok', value: 0 });
    });

    test('creates Ok from empty string', () => {
      const result = fromNullable('', 'Value is null');
      assert.deepStrictEqual(result, { type: 'ok', value: '' });
    });

    test('creates Ok from false', () => {
      const result = fromNullable(false, 'Value is null');
      assert.deepStrictEqual(result, { type: 'ok', value: false });
    });
  });

  describe('fromUndefined', () => {
    test('creates Ok from defined value', () => {
      const result = fromUndefined(42, 'Value is undefined');
      assert.deepStrictEqual(result, { type: 'ok', value: 42 });
    });

    test('creates Ok from null', () => {
      const result = fromUndefined(null, 'Value is undefined');
      assert.deepStrictEqual(result, { type: 'ok', value: null });
    });

    test('creates Err from undefined', () => {
      const result = fromUndefined(undefined, 'Value is undefined');
      assert.deepStrictEqual(result, {
        type: 'err',
        error: 'Value is undefined',
      });
    });
  });

  describe('toPromise', () => {
    test('resolves Ok to Promise', async () => {
      const result = Ok(42);
      const promise = toPromise(result);
      const value = await promise;
      assert.strictEqual(value, 42);
    });

    test('rejects Err to Promise', async () => {
      const result = Err('Something went wrong');
      const promise = toPromise(result);

      try {
        await promise;
        assert.fail('Should have thrown');
      } catch (error) {
        assert.strictEqual(error, 'Something went wrong');
      }
    });

    test('throws on Loading', () => {
      const result = Loading();
      assert.throws(
        () => toPromise(result),
        /Cannot convert Loading or NotAsked to Promise/
      );
    });

    test('throws on NotAsked', () => {
      const result = NotAsked();
      assert.throws(
        () => toPromise(result),
        /Cannot convert Loading or NotAsked to Promise/
      );
    });
  });

  describe('getOrElse', () => {
    test('returns value for Ok', () => {
      const result = Ok(42);
      const value = getOrElse(result, 0);
      assert.strictEqual(value, 42);
    });

    test('returns default for Err', () => {
      const result = Err('error');
      const value = getOrElse(result, 'default');
      assert.strictEqual(value, 'default');
    });

    test('returns default for Loading', () => {
      const result = Loading();
      const value = getOrElse(result, 'default');
      assert.strictEqual(value, 'default');
    });

    test('returns default for NotAsked', () => {
      const result = NotAsked();
      const value = getOrElse(result, 'default');
      assert.strictEqual(value, 'default');
    });
  });

  describe('fromNullish', () => {
    test('returns Ok for non-nullish values', () => {
      assert.deepStrictEqual(fromNullish('hello', 'err'), {
        type: 'ok',
        value: 'hello',
      });
      assert.deepStrictEqual(fromNullish(0, 'err'), { type: 'ok', value: 0 });
      assert.deepStrictEqual(fromNullish('', 'err'), { type: 'ok', value: '' });
      assert.deepStrictEqual(fromNullish(false, 'err'), {
        type: 'ok',
        value: false,
      });
      assert.deepStrictEqual(fromNullish([], 'err'), { type: 'ok', value: [] });
      assert.deepStrictEqual(fromNullish({}, 'err'), { type: 'ok', value: {} });
    });
    test('returns Err for null or undefined', () => {
      assert.deepStrictEqual(fromNullish(null, 'err'), {
        type: 'err',
        error: 'err',
      });
      assert.deepStrictEqual(fromNullish(undefined, 'err'), {
        type: 'err',
        error: 'err',
      });
    });
  });

  describe('fromFalsy', () => {
    test('returns Ok for truthy values', () => {
      assert.deepStrictEqual(fromFalsy('hello', 'err'), {
        type: 'ok',
        value: 'hello',
      });
      assert.deepStrictEqual(fromFalsy(1, 'err'), { type: 'ok', value: 1 });
      assert.deepStrictEqual(fromFalsy([], 'err'), { type: 'ok', value: [] });
      assert.deepStrictEqual(fromFalsy({}, 'err'), { type: 'ok', value: {} });
      assert.deepStrictEqual(fromFalsy([0], 'err'), { type: 'ok', value: [0] });
    });
    test('returns Err for falsy values', () => {
      assert.deepStrictEqual(fromFalsy('', 'err'), {
        type: 'err',
        error: 'err',
      });
      assert.deepStrictEqual(fromFalsy(0, 'err'), {
        type: 'err',
        error: 'err',
      });
      assert.deepStrictEqual(fromFalsy(false, 'err'), {
        type: 'err',
        error: 'err',
      });
      assert.deepStrictEqual(fromFalsy(null, 'err'), {
        type: 'err',
        error: 'err',
      });
      assert.deepStrictEqual(fromFalsy(undefined, 'err'), {
        type: 'err',
        error: 'err',
      });
      assert.deepStrictEqual(fromFalsy(NaN, 'err'), {
        type: 'err',
        error: 'err',
      });
    });
  });
});

describe('Transformation Functions', () => {
  describe('bimap', () => {
    test('maps Ok value', () => {
      const result = Ok(42);
      const transformed = bimap(
        result,
        (value) => value * 2,
        (error) => `Error: ${error}`
      );
      assert.deepStrictEqual(transformed, { type: 'ok', value: 84 });
    });

    test('maps Err error', () => {
      const result = Err('Network error');
      const transformed = bimap(
        result,
        (value) => value.toUpperCase(),
        (error) => `Error: ${error}`
      );
      assert.deepStrictEqual(transformed, {
        type: 'err',
        error: 'Error: Network error',
      });
    });

    test('throws on invalid result type', () => {
      const invalidResult = { type: 'invalid' };
      assert.throws(() => {
        bimap(
          invalidResult,
          (value) => value * 2,
          (error) => `Error: ${error}`
        );
      }, /Invalid result type/);
    });
  });

  describe('swap', () => {
    test('swaps Ok to Err', () => {
      const result = Ok(42);
      const swapped = swap(result);
      assert.deepStrictEqual(swapped, { type: 'err', error: 42 });
    });

    test('swaps Err to Ok', () => {
      const result = Err('Something went wrong');
      const swapped = swap(result);
      assert.deepStrictEqual(swapped, {
        type: 'ok',
        value: 'Something went wrong',
      });
    });

    test('leaves Loading unchanged', () => {
      const result = Loading();
      const swapped = swap(result);
      assert.deepStrictEqual(swapped, { type: 'loading' });
    });

    test('leaves NotAsked unchanged', () => {
      const result = NotAsked();
      const swapped = swap(result);
      assert.deepStrictEqual(swapped, { type: 'not-asked' });
    });
  });

  describe('mapRemote', () => {
    test('maps Ok value', () => {
      const result = Ok(42);
      const doubled = mapRemote(result, (x) => x * 2);
      assert.deepStrictEqual(doubled, { type: 'ok', value: 84 });
    });

    test('passes through Loading', () => {
      const result = Loading();
      const mapped = mapRemote(result, (x) => x * 2);
      assert.deepStrictEqual(mapped, { type: 'loading' });
    });

    test('passes through NotAsked', () => {
      const result = NotAsked();
      const mapped = mapRemote(result, (x) => x * 2);
      assert.deepStrictEqual(mapped, { type: 'not-asked' });
    });

    test('passes through Err', () => {
      const result = Err('error');
      const mapped = mapRemote(result, (x) => x * 2);
      assert.deepStrictEqual(mapped, { type: 'err', error: 'error' });
    });
  });
});

describe('Comparison Functions', () => {
  describe('equals', () => {
    test('compares equal Ok results', () => {
      const a = Ok(42);
      const b = Ok(42);
      assert.strictEqual(equals(a, b), true);
    });

    test('compares unequal Ok results', () => {
      const a = Ok(42);
      const b = Ok(43);
      assert.strictEqual(equals(a, b), false);
    });

    test('compares equal Err results', () => {
      const a = Err('error');
      const b = Err('error');
      assert.strictEqual(equals(a, b), true);
    });

    test('compares unequal Err results', () => {
      const a = Err('error1');
      const b = Err('error2');
      assert.strictEqual(equals(a, b), false);
    });

    test('compares Loading results', () => {
      const a = Loading();
      const b = Loading();
      assert.strictEqual(equals(a, b), true);
    });

    test('compares NotAsked results', () => {
      const a = NotAsked();
      const b = NotAsked();
      assert.strictEqual(equals(a, b), true);
    });

    test('compares different types', () => {
      const a = Ok(42);
      const b = Err('error');
      assert.strictEqual(equals(a, b), false);
    });

    test('compares Ok with Loading', () => {
      const a = Ok(42);
      const b = Loading();
      assert.strictEqual(equals(a, b), false);
    });

    test('compares objects by reference', () => {
      const obj = { id: 1, name: 'John' };
      const a = Ok(obj);
      const b = Ok(obj);
      assert.strictEqual(equals(a, b), true);
    });

    test('compares different object instances', () => {
      const a = Ok({ id: 1, name: 'John' });
      const b = Ok({ id: 1, name: 'John' });
      assert.strictEqual(equals(a, b), false); // Different references
    });

    test('handles unknown parameters safely', () => {
      assert.strictEqual(equals(null, Ok(42)), false);
      assert.strictEqual(equals({}, Ok(42)), false);
      assert.strictEqual(equals(Ok(42), 'not a result'), false);
      assert.strictEqual(equals(undefined, Loading()), false);
      assert.strictEqual(equals(42, NotAsked()), false);
    });

    test('uses custom equality function for Ok values', () => {
      const a = Ok({ id: 1, name: 'John' });
      const b = Ok({ id: 1, name: 'John' });

      // Without custom function - should be false (reference equality)
      assert.strictEqual(equals(a, b), false);

      // With custom deep equality function
      const deepEquals = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      assert.strictEqual(equals(a, b, deepEquals), true);
    });

    test('uses custom equality function for Err values', () => {
      const a = Err({ code: 404, message: 'Not found' });
      const b = Err({ code: 404, message: 'Not found' });

      // Without custom function - should be false (reference equality)
      assert.strictEqual(equals(a, b), false);

      // With custom equality function
      const errorEquals = (a, b) =>
        a.code === b.code && a.message === b.message;
      assert.strictEqual(equals(a, b, errorEquals), true);
    });

    test('uses custom equality function for arrays', () => {
      const a = Ok([1, 2, 3]);
      const b = Ok([1, 2, 3]);

      // Without custom function - should be false (reference equality)
      assert.strictEqual(equals(a, b), false);

      // With custom array equality function
      const arrayEquals = (a, b) =>
        a.length === b.length && a.every((x, i) => x === b[i]);
      assert.strictEqual(equals(a, b, arrayEquals), true);
    });

    test('custom equality function works with primitive values', () => {
      const a = Ok(42);
      const b = Ok(42);

      // Should work the same as default behavior
      const customEquals = (a, b) => a === b;
      assert.strictEqual(equals(a, b, customEquals), true);

      const c = Ok(43);
      assert.strictEqual(equals(a, c, customEquals), false);
    });

    test('custom equality function can implement complex logic', () => {
      const a = Ok({ id: 1, name: 'John', age: 30 });
      const b = Ok({ id: 1, name: 'John', age: 31 });

      // Custom function that only compares id and name, ignores age
      const partialEquals = (a, b) => a.id === b.id && a.name === b.name;
      assert.strictEqual(equals(a, b, partialEquals), true);

      // Different id should make them unequal
      const c = Ok({ id: 2, name: 'John', age: 30 });
      assert.strictEqual(equals(a, c, partialEquals), false);
    });
  });
});

describe('RemoteResult Type Guards', () => {
  describe('isRemoteSuccess', () => {
    test('identifies Ok results', () => {
      assert.strictEqual(isRemoteSuccess(Ok(42)), true);
      assert.strictEqual(isRemoteSuccess(Err('error')), false);
      assert.strictEqual(isRemoteSuccess(Loading()), false);
      assert.strictEqual(isRemoteSuccess(NotAsked()), false);
    });

    test('works with validators', () => {
      const isNumber = (value) => typeof value === 'number';
      assert.strictEqual(isRemoteSuccess(Ok(42), isNumber), true);
      assert.strictEqual(isRemoteSuccess(Ok('hello'), isNumber), false);
    });
  });

  describe('isRemoteFailure', () => {
    test('identifies Err results', () => {
      assert.strictEqual(isRemoteFailure(Err('error')), true);
      assert.strictEqual(isRemoteFailure(Ok(42)), false);
      assert.strictEqual(isRemoteFailure(Loading()), false);
      assert.strictEqual(isRemoteFailure(NotAsked()), false);
    });

    test('works with validators', () => {
      const isString = (error) => typeof error === 'string';
      assert.strictEqual(isRemoteFailure(Err('error'), isString), true);
      assert.strictEqual(isRemoteFailure(Err(42), isString), false);
    });
  });
});

describe('Real-world Usage Examples', () => {
  test('API response handling with pattern matching', () => {
    const handleApiResponse = (response) => {
      return match(response, {
        ok: (user) => `Welcome, ${user.name}!`,
        err: (error) => `Error: ${error}`,
        loading: () => 'Loading user data...',
        notAsked: () => 'Click to load user',
      });
    };

    assert.strictEqual(
      handleApiResponse(Ok({ name: 'John' })),
      'Welcome, John!'
    );
    assert.strictEqual(
      handleApiResponse(Err('User not found')),
      'Error: User not found'
    );
    assert.strictEqual(handleApiResponse(Loading()), 'Loading user data...');
    assert.strictEqual(handleApiResponse(NotAsked()), 'Click to load user');
  });

  test('Form validation with fromNullable', () => {
    const validateEmail = (email) => {
      // Check for empty string first
      if (email === '') {
        return Err('Email is required');
      }

      const result = fromNullable(email, 'Email is required');
      if (result.type === 'ok' && email.includes('@')) {
        return result;
      }
      if (result.type === 'ok') {
        return Err('Invalid email format');
      }
      return result; // Return the original error from fromNullable
    };

    assert.deepStrictEqual(validateEmail('john@example.com'), {
      type: 'ok',
      value: 'john@example.com',
    });
    assert.deepStrictEqual(validateEmail(''), {
      type: 'err',
      error: 'Email is required',
    });
    assert.deepStrictEqual(validateEmail('invalid-email'), {
      type: 'err',
      error: 'Invalid email format',
    });
  });

  test('Error recovery with swap', () => {
    const validateUser = (user) => {
      if (!user.email) return Err('Email required');
      if (!user.name) return Err('Name required');
      return Ok(user);
    };

    const user = { name: 'John' }; // missing email
    const validationResult = validateUser(user);
    const errorMessage = swap(validationResult); // Convert Err to Ok

    assert.deepStrictEqual(errorMessage, {
      type: 'ok',
      value: 'Email required',
    });
  });

  test('Promise integration with toPromise', async () => {
    const fetchUser = async (id) => {
      // Simulate API call
      if (id === 1) {
        return toPromise(Ok({ id: 1, name: 'John' }));
      } else {
        return toPromise(Err('User not found'));
      }
    };

    const user = await fetchUser(1);
    assert.deepStrictEqual(user, { id: 1, name: 'John' });

    try {
      await fetchUser(999);
      assert.fail('Should have thrown');
    } catch (error) {
      assert.strictEqual(error, 'User not found');
    }
  });
});
