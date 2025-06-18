# Result.js

A comprehensive Result type library for JavaScript with Ok, Err, Loading, and NotAsked states. Inspired by Rust's Result type and functional programming patterns.

## Features

- **Result Types**: `Ok<T>`, `Err<E>` for success/error handling
- **Remote Data States**: `Loading` and `NotAsked` for async operations
- **Functional Utilities**: `mapOk`, `flatMapOk`, `mapErr`, `flatMapErr`
- **Error Handling**: `tryCatch` and `tryCatchSync` for safe execution
- **TypeScript Support**: Full JSDoc type annotations
- **Zero Dependencies**: Lightweight and tree-shakeable
- **Modern JavaScript**: ES modules with Node.js 16+ support

## Installation

```bash
npm install @crvouga/result
```

## Quick Start

```javascript
import { Ok, Err, isOk, isErr, mapOk, flatMapOk } from '@crvouga/result';

// Create results
const success = Ok(42);
const error = Err("Something went wrong");

// Check results
if (isOk(success)) {
  console.log(success.value); // 42
}

if (isErr(error)) {
  console.log(error.error); // "Something went wrong"
}

// Transform results
const doubled = mapOk(success, x => x * 2);
console.log(doubled); // { type: "ok", value: 84 }

// Chain operations
const validated = flatMapOk(success, x =>
  x > 0 ? Ok(x * 2) : Err("Number must be positive")
);
```

## API Reference

### Creating Results

#### `Ok(value)`
Creates a successful result with a value.

```javascript
const result = Ok(42);
console.log(result); // { type: "ok", value: 42 }
```

#### `Err(error)`
Creates an error result with an error value.

```javascript
const result = Err("Network error");
console.log(result); // { type: "err", error: "Network error" }
```

#### `Loading()`
Creates a loading state result.

```javascript
const result = Loading();
console.log(result); // { type: "loading" }
```

#### `NotAsked()`
Creates a not-asked state result.

```javascript
const result = NotAsked();
console.log(result); // { type: "not-asked" }
```

### Type Guards

#### `isOk(value, validator?)`
Checks if a value is a successful result. Optionally, you can pass a validator function to check the type or shape of the wrapped value.

```javascript
const result = Ok(42);
if (isOk(result)) {
  console.log(result.value); // 42
}

// With value validation
if (isOk(result, v => typeof v === 'number')) {
  // result.value is a number
}
```

#### `isErr(value, validator?)`
Checks if a value is an error result. Optionally, you can pass a validator function to check the type or shape of the wrapped error.

```javascript
const result = Err("error");
if (isErr(result)) {
  console.log(result.error); // "error"
}

// With error validation
if (isErr(result, e => typeof e === 'string')) {
  // result.error is a string
}
```

#### `isLoading(value)`
Checks if a value is a loading result.

```javascript
const result = Loading();
if (isLoading(result)) {
  console.log("Loading...");
}
```

#### `isNotAsked(value)`
Checks if a value is a not-asked result.

```javascript
const result = NotAsked();
if (isNotAsked(result)) {
  console.log("Not initiated yet");
}
```

### Transformation Functions

#### `mapOk(result, mapper)`
Maps a function over the value of a successful result.

```javascript
const result = Ok(5);
const doubled = mapOk(result, x => x * 2);
console.log(doubled); // { type: "ok", value: 10 }
```

#### `flatMapOk(result, mapper)`
Chains operations that return Result types.

```javascript
const result = Ok(5);
const validated = flatMapOk(result, x =>
  x > 0 ? Ok(x * 2) : Err("Number must be positive")
);
console.log(validated); // { type: "ok", value: 10 }
```

#### `mapErr(result, mapper)`
Maps a function over the error of an error result.

```javascript
const result = Err("Network error");
const mapped = mapErr(result, error => `Error: ${error}`);
console.log(mapped); // { type: "err", error: "Error: Network error" }
```

#### `flatMapErr(result, mapper)`
Chains error recovery operations.

```javascript
const result = Err("Network error");
const recovered = flatMapErr(result, error =>
  error === "Network error" ? Ok("Using cached data") : Err(error)
);
console.log(recovered); // { type: "ok", value: "Using cached data" }
```

### Error Handling

#### `tryCatchSync(fn)`
Executes a function and wraps the result in a Result type.

```javascript
const result = tryCatchSync(() => {
  const data = JSON.parse('{"name": "John"}');
  return data.name;
});
console.log(result); // { type: "ok", value: "John" }
```

#### `tryCatch(fn)`
Executes an async function and wraps the result in a Result type.

```javascript
const result = await tryCatch(async () => {
  const response = await fetch('/api/users/1');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
});
```

### Unwrapping

#### `unwrap(result)`
Extracts the value from a successful result (throws if not successful).

```javascript
const result = Ok(42);
const value = unwrap(result);
console.log(value); // 42
```

#### `unwrapOr(result, defaultValue)`
Extracts the value or returns a default.

```javascript
const result = Err("error");
const value = unwrapOr(result, "default");
console.log(value); // "default"
```

## Usage Examples

### API Calls with Loading States

```javascript
import { Loading, NotAsked, Ok, Err, isOk, isErr, isLoading } from '@crvouga/result';

function UserProfile({ userId }) {
  const [userData, setUserData] = useState(NotAsked());

  useEffect(() => {
    setUserData(Loading());
    
    fetchUser(userId)
      .then(user => setUserData(Ok(user)))
      .catch(error => setUserData(Err(error)));
  }, [userId]);

  if (isNotAsked(userData)) {
    return <button onClick={() => setUserData(Loading())}>Load User</button>;
  }

  if (isLoading(userData)) {
    return <Spinner />;
  }

  if (isErr(userData)) {
    return <ErrorMessage error={userData.error} />;
  }

  return <UserCard user={userData.value} />;
}
```

### Form Validation

```javascript
import { Ok, Err, flatMapOk, mapErr } from '@crvouga/result';

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? Ok(email) : Err("Invalid email format");
};

const validatePassword = (password) => {
  if (password.length < 8) {
    return Err("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    return Err("Password must contain at least one uppercase letter");
  }
  return Ok(password);
};

const validateForm = (email, password) => {
  return Ok({ email, password })
    |> (r) => flatMapOk(r, data => 
      validateEmail(data.email).map(email => ({ ...data, email }))
    )
    |> (r) => flatMapOk(r, data => 
      validatePassword(data.password).map(password => ({ ...data, password }))
    );
};
```

### Railway-Oriented Programming

```javascript
import { Ok, Err, flatMapOk, mapErr } from '@crvouga/result';

const processUser = (userInput) => {
  return Ok(userInput)
    |> (r) => flatMapOk(r, input => 
      input.age >= 18 ? Ok(input) : Err("User must be 18 or older")
    )
    |> (r) => flatMapOk(r, user => 
      user.email ? Ok(user) : Err("Email is required")
    )
    |> (r) => mapOk(r, user => ({
      ...user,
      id: generateId(),
      createdAt: new Date()
    }));
};
```

## TypeScript Support

The library includes comprehensive JSDoc type annotations for TypeScript support:

```typescript
import { Ok, Err, Result } from '@crvouga/result';

// TypeScript will infer the correct types
const userResult: Result<User, string> = Ok({ id: 1, name: "John" });
const errorResult: Result<User, string> = Err("User not found");
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Related Projects

- [fp-ts](https://github.com/gcanti/fp-ts) - Functional programming in TypeScript
- [neverthrow](https://github.com/supermacro/neverthrow) - Type-safe error handling
- [Result](https://github.com/badrap/result) - Rust-like Result type for TypeScript

