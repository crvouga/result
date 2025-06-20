# result

A comprehensive JavaScript library for handling success and error states with support for remote data patterns. Provides type-safe error handling, pattern matching, and functional programming utilities.

## Features

- **Type-safe error handling** with `Ok` and `Err` types
- **Remote data patterns** with `Loading` and `NotAsked` states
- **Pattern matching** for all result types
- **Functional utilities** like `map`, `flatMap`, `bimap`, `swap`
- **Promise integration** with `toPromise`
- **Nullable value handling** with `fromNullable` and `fromUndefined`
- **Comprehensive type guards** with optional validation
- **Equality comparison** and utility functions

## Installation

```bash
npm install @crvouga/result
```

## Quick Start

```typescript
import { Ok, Err, Loading, NotAsked, match, mapOk, flatMapOk } from '@crvouga/result';

// Basic usage
const result = Ok(42);
const doubled = mapOk(result, x => x * 2); // Ok(84)

// Error handling
const errorResult = Err('Something went wrong');
const message = match(errorResult, {
  ok: value => `Success: ${value}`,
  err: error => `Error: ${error}`,
  loading: () => 'Loading...',
  notAsked: () => 'Not started'
});

// Remote data patterns
const userData = Loading();
if (isLoading(userData)) {
  console.log('Loading user data...');
}
```

## Core Types

### Result Types

- `Ok<T>` - Represents a successful result with a value of type `T`
- `Err<E>` - Represents an error result with an error of type `E`
- `Loading` - Represents a loading state (for remote data)
- `NotAsked` - Represents an initial state (for remote data)

### Type Aliases

```typescript
type Result<T, E> = Ok<T> | Err<E>;
type RemoteResult<T, E> = Ok<T> | Err<E> | Loading | NotAsked;
```

## API Reference

### Constructors

#### `Ok(value)`
Creates a successful result.

```typescript
const result = Ok(42);
console.log(result); // { type: "ok", value: 42 }
```

#### `Err(error)`
Creates an error result.

```typescript
const result = Err('Something went wrong');
console.log(result); // { type: "err", error: "Something went wrong" }
```

#### `Loading()`
Creates a loading state.

```typescript
const result = Loading();
console.log(result); // { type: "loading" }
```

#### `NotAsked()`
Creates a not-asked state.

```typescript
const result = NotAsked();
console.log(result); // { type: "not-asked" }
```

### Type Guards

#### `isOk(result, validator?)`
Checks if a result is successful, with optional value validation.

```typescript
const result = Ok(42);
console.log(isOk(result)); // true

// With validation
const isNumber = (value) => typeof value === 'number';
console.log(isOk(result, isNumber)); // true
console.log(isOk(Ok('hello'), isNumber)); // false
```

#### `isErr(result, validator?)`
Checks if a result is an error, with optional error validation.

```typescript
const result = Err('Network error');
console.log(isErr(result)); // true

// With validation
const isString = (error) => typeof error === 'string';
console.log(isErr(result, isString)); // true
console.log(isErr(Err(404), isString)); // false
```

#### `isLoading(result)`
Checks if a result is in loading state.

```typescript
const result = Loading();
console.log(isLoading(result)); // true
```

#### `isNotAsked(result)`
Checks if a result is in not-asked state.

```typescript
const result = NotAsked();
console.log(isNotAsked(result)); // true
```

#### `isResult(value, valueValidator?, errorValidator?)`
Comprehensive type guard for Result types with optional validation.

```typescript
const result = Ok(42);
console.log(isResult(result)); // true

// With validation
const isNumber = (value) => typeof value === 'number';
const isString = (error) => typeof error === 'string';
console.log(isResult(result, isNumber, isString)); // true
```

#### `isRemoteResult(value, valueValidator?, errorValidator?)`
Type guard for RemoteResult types with optional validation.

```typescript
const result = Loading();
console.log(isRemoteResult(result)); // true
```

### Pattern Matching

#### `match(result, matchers)`
Pattern matching for all RemoteResult states.

```typescript
const result = Ok(42);
const message = match(result, {
  ok: value => `Success: ${value}`,
  err: error => `Error: ${error}`,
  loading: () => 'Loading...',
  notAsked: () => 'Not started'
});
console.log(message); // "Success: 42"
```

#### `fold(result, onOk, onErr)`
Pattern matching for basic Result types (Ok/Err only).

```typescript
const result = Ok(42);
const message = fold(result, 
  value => `Success: ${value}`,
  error => `Error: ${error}`
);
console.log(message); // "Success: 42"
```

#### `foldRemote(result, matchers)`
Pattern matching for RemoteResult types with semantic naming.

```typescript
const result = Ok(42);
const message = foldRemote(result, {
  success: value => `Success: ${value}`,
  failure: error => `Error: ${error}`,
  loading: () => 'Loading...',
  notAsked: () => 'Not started'
});
console.log(message); // "Success: 42"
```

### Transformation Functions

#### `mapOk(result, mapper)`
Maps a function over the value of a successful result.

```typescript
const result = Ok(42);
const doubled = mapOk(result, x => x * 2);
console.log(doubled); // { type: "ok", value: 84 }
```

#### `mapErr(result, mapper)`
Maps a function over the error of an error result.

```typescript
const result = Err('network error');
const formatted = mapErr(result, error => `Error: ${error.toUpperCase()}`);
console.log(formatted); // { type: "err", error: "Error: NETWORK ERROR" }
```

#### `flatMapOk(result, mapper)`
Maps a function that returns a result over a successful result.

```typescript
const result = Ok(5);
const processed = flatMapOk(result, x => x > 10 ? Ok(x) : Err('Too small'));
console.log(processed); // { type: "err", error: "Too small" }
```

#### `flatMapErr(result, mapper)`
Maps a function that returns a result over an error result.

```typescript
const result = Err('network error');
const recovered = flatMapErr(result, error => 
  error.includes('network') ? Ok('Using cached data') : Err(error)
);
console.log(recovered); // { type: "ok", value: "Using cached data" }
```

#### `bimap(result, okMapper, errMapper)`
Maps both success and error cases in one operation.

```typescript
const result = Ok(42);
const transformed = bimap(result,
  value => value * 2,
  error => `Error: ${error}`
);
console.log(transformed); // { type: "ok", value: 84 }
```

#### `mapRemote(result, mapper)`
Maps over successful RemoteResults, passing through other states unchanged.

```typescript
const result = Ok({ id: 1, name: 'John' });
const mapped = mapRemote(result, user => user.name);
console.log(mapped); // { type: "ok", value: "John" }
```

### Utility Functions

#### `unwrap(result)`
Extracts the value from a successful result, throws on error.

```typescript
const result = Ok(42);
const value = unwrap(result); // 42

const errorResult = Err('error');
unwrap(errorResult); // throws "error"
```

#### `unwrapOr(result, defaultValue)`
Extracts the value from a successful result, or returns a default.

```typescript
const result = Ok(42);
const value = unwrapOr(result, 0); // 42

const errorResult = Err('error');
const value = unwrapOr(errorResult, 0); // 0
```

#### `getOrElse(result, defaultValue)`
Alias for `unwrapOr` for consistency with functional libraries.

```typescript
const result = Ok(42);
const value = getOrElse(result, 0); // 42
```

#### `fromNullable(value, error)`
Creates a Result from a nullable value.

```typescript
const user = getUserFromCache();
const result = fromNullable(user, 'User not found in cache');
// Returns Ok(user) if user is not null/undefined, otherwise Err('User not found in cache')
```

#### `fromUndefined(value, error)`
Creates a Result from a value that might be undefined.

```typescript
const config = process.env.API_KEY;
const result = fromUndefined(config, 'API key not configured');
// Returns Ok(config) if config is not undefined, otherwise Err('API key not configured')
```

#### `toPromise(result)`
Converts a Result to a Promise.

```typescript
const result = Ok(42);
const promise = toPromise(result);
const value = await promise; // 42

const errorResult = Err('Something went wrong');
const promise = toPromise(errorResult);
try {
  await promise; // throws 'Something went wrong'
} catch (error) {
  console.log(error); // 'Something went wrong'
}
```

#### `swap(result)`
Swaps Ok and Err values of a Result.

```typescript
const result = Ok(42);
const swapped = swap(result);
console.log(swapped); // { type: "err", error: 42 }

const errorResult = Err('Something went wrong');
const swapped = swap(errorResult);
console.log(swapped); // { type: "ok", value: "Something went wrong" }
```

#### `equals(a, b, valueEquals?)`
Checks if two Results are equal. Safely handles unknown parameters and supports custom equality functions.

```typescript
const a = Ok(42);
const b = Ok(42);
console.log(equals(a, b)); // true

const c = Err('error');
const d = Err('error');
console.log(equals(c, d)); // true

// Safe with unknown values
console.log(equals(null, Ok(42))); // false
console.log(equals({}, Ok(42))); // false

// With custom equality function for objects
const objA = Ok({ id: 1, name: 'John' });
const objB = Ok({ id: 1, name: 'John' });
console.log(equals(objA, objB)); // false (reference equality)

const deepEquals = (a, b) => JSON.stringify(a) === JSON.stringify(b);
console.log(equals(objA, objB, deepEquals)); // true

// With custom equality for arrays
const arrA = Ok([1, 2, 3]);
const arrB = Ok([1, 2, 3]);
const arrayEquals = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
console.log(equals(arrA, arrB, arrayEquals)); // true
```

#### `fromNullish(value, error)`
Creates a Result from a value that might be null or undefined. Returns Ok(value) if the value is not null/undefined, otherwise Err(error).

```typescript
const result = fromNullish('hello', 'Value is nullish');
// { type: 'ok', value: 'hello' }

const result2 = fromNullish(null, 'Value is nullish');
// { type: 'err', error: 'Value is nullish' }

const result3 = fromNullish(undefined, 'Value is nullish');
// { type: 'err', error: 'Value is nullish' }
```

#### `fromFalsy(value, error)`
Creates a Result from a value that might be falsy. Returns Ok(value) if the value is truthy, otherwise Err(error).

```typescript
const result = fromFalsy('hello', 'Value is falsy');
// { type: 'ok', value: 'hello' }

const result2 = fromFalsy('', 'Value is falsy');
// { type: 'err', error: 'Value is falsy' }

const result3 = fromFalsy(0, 'Value is falsy');
// { type: 'err', error: 'Value is falsy' }

const result4 = fromFalsy(false, 'Value is falsy');
// { type: 'err', error: 'Value is falsy' }

const result5 = fromFalsy(null, 'Value is falsy');
// { type: 'err', error: 'Value is falsy' }

const result6 = fromFalsy(undefined, 'Value is falsy');
// { type: 'err', error: 'Value is falsy' }
```

### Error Handling

#### `tryCatchSync(fn)`
Wraps a synchronous function that might throw.

```typescript
const result = tryCatchSync(() => {
  const value = JSON.parse('invalid json');
  return value;
});
console.log(result); // { type: "err", error: SyntaxError }
```

#### `tryCatch(fn)`
Wraps an asynchronous function that might throw.

```typescript
const result = await tryCatch(async () => {
  const response = await fetch('/api/data');
  return response.json();
});
```

### RemoteResult Type Guards

#### `isRemoteSuccess(result, validator?)`
Checks if a value is a successful RemoteResult (Ok only).

```typescript
const result = Ok(42);
console.log(isRemoteSuccess(result)); // true

const loadingResult = Loading();
console.log(isRemoteSuccess(loadingResult)); // false
```

#### `isRemoteFailure(result, validator?)`
Checks if a value is a failed RemoteResult (Err only).

```typescript
const result = Err('error');
console.log(isRemoteFailure(result)); // true

const successResult = Ok(42);
console.log(isRemoteFailure(successResult)); // false
```

## Examples

### Basic Error Handling

```typescript
import { Ok, Err, isOk, isErr, unwrapOr } from '@crvouga/result';

function divide(a, b) {
  if (b === 0) {
    return Err('Division by zero');
  }
  return Ok(a / b);
}

const result = divide(10, 2);
if (isOk(result)) {
  console.log(`Result: ${result.value}`); // Result: 5
} else {
  console.log(`Error: ${result.error}`);
}

// Or use unwrapOr for default values
const value = unwrapOr(result, 0);
```

### API Response Handling

```typescript
import { Ok, Err, Loading, match, fromNullable } from '@crvouga/result';

async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      return Err(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return fromNullable(data.user, 'User not found');
  } catch (error) {
    return Err(`Network error: ${error.message}`);
  }
}

// In your component
const userData = Loading(); // Initial state

const renderUser = (data) => {
  return match(data, {
    ok: user => <UserCard user={user} />,
    err: error => <ErrorMessage error={error} />,
    loading: () => <Spinner />,
    notAsked: () => <button onClick={fetchUser}>Load User</button>
  });
};
```

### Form Validation

```typescript
import { Ok, Err, fromNullable, flatMapOk } from '@crvouga/result';

function validateEmail(email) {
  return fromNullable(email, 'Email is required')
    |> (r) => flatMapOk(r, email => 
      email.includes('@') ? Ok(email) : Err('Invalid email format')
    );
}

function validateAge(age) {
  return fromNullable(age, 'Age is required')
    |> (r) => flatMapOk(r, age => 
      age >= 18 ? Ok(age) : Err('Must be 18 or older')
    );
}

const emailResult = validateEmail('john@example.com');
const ageResult = validateAge(25);

if (isOk(emailResult) && isOk(ageResult)) {
  console.log('Form is valid');
} else {
  console.log('Validation errors:', {
    email: emailResult.type === 'err' ? emailResult.error : null,
    age: ageResult.type === 'err' ? ageResult.error : null
  });
}
```

### Promise Integration

```typescript
import { Ok, Err, toPromise, tryCatch } from '@crvouga/result';

// Convert Results to Promises
const result = Ok(42);
const promise = toPromise(result);
const value = await promise; // 42

// Wrap async operations
const fetchData = async () => {
  const result = await tryCatch(async () => {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  });
  
  return result;
};

const data = await fetchData();
if (isOk(data)) {
  console.log('Data:', data.value);
} else {
  console.error('Error:', data.error);
}
```

### Complex Business Logic

```typescript
import { Ok, Err, match, bimap, swap } from '@crvouga/result';

function processOrder(order) {
  // Validate order
  if (!order.items || order.items.length === 0) {
    return Err('Order must contain at least one item');
  }
  
  if (order.total <= 0) {
    return Err('Order total must be positive');
  }
  
  // Apply business rules
  const processedOrder = {
    ...order,
    status: order.total > 100 ? 'premium' : 'standard',
    discount: order.total > 200 ? 0.1 : 0
  };
  
  return Ok(processedOrder);
}

const order = { items: ['laptop'], total: 150 };
const result = processOrder(order);

// Transform the result for display
const displayResult = bimap(result,
  order => `Order processed: ${order.status} (${order.discount * 100}% discount)`,
  error => `Order failed: ${error}`
);

// Or use pattern matching for complex logic
const message = match(result, {
  ok: order => {
    if (order.status === 'premium') {
      return `🎉 Premium order confirmed! Total: $${order.total}`;
    }
    return `✅ Order confirmed! Total: $${order.total}`;
  },
  err: error => {
    if (error.includes('items')) {
      return `🛒 ${error}. Please add items to your cart.`;
    }
    return `❌ ${error}`;
  },
  loading: () => '⏳ Processing your order...',
  notAsked: () => '🛒 Add items to cart to continue'
});
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

