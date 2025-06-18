// @ts-check

/**
 * @template T
 * @typedef {{ type: "ok", value: T }} Ok
 */
export type Ok<T> = { type: 'ok'; value: T };

/**
 * Creates a successful result with a value.
 *
 * @template T
 * @param {T} value - The value to wrap in a successful result
 * @returns {Ok<T>} A successful result containing the value
 *
 * @example
 * const result = Ok(42);
 * console.log(result); // { type: "ok", value: 42 }
 *
 * @example
 * const userResult = Ok({ id: 1, name: "John" });
 * if (isOk(userResult)) {
 *   console.log(userResult.value.name); // "John"
 * }
 */
export const Ok = <T>(value: T): Ok<T> => ({ type: 'ok', value });

/**
 * @template E
 * @typedef {{ type: "err", error: E }} Err
 */

export type Err<E> = { type: 'err'; error: E };

/**
 * Creates an error result with an error value.
 *
 * @template E
 * @param {E} error - The error to wrap in an error result
 * @returns {Err<E>} An error result containing the error
 *
 * @example
 * const result = Err("Something went wrong");
 * console.log(result); // { type: "err", error: "Something went wrong" }
 *
 * @example
 * const validationError = Err({ field: "email", message: "Invalid email" });
 * if (isErr(validationError)) {
 *   console.log(validationError.error.message); // "Invalid email"
 * }
 */
export const Err = <E>(error: E): Err<E> => ({ type: 'err', error });

/**
 * @typedef {{ type: "loading" }} Loading
 */

export type Loading = { type: 'loading' };

/**
 * Creates a loading state result.
 *
 * @returns {Loading} A loading result indicating an operation is in progress
 *
 * @example
 * const result = Loading();
 * console.log(result); // { type: "loading" }
 *
 * @example
 * // In a React component
 * const [data, setData] = useState(Loading());
 * if (isLoading(data)) {
 *   return <Spinner />;
 * }
 */
export const Loading = (): Loading => ({ type: 'loading' });

/**
 * @typedef {{ type: "not-asked" }} NotAsked
 */

export type NotAsked = { type: 'not-asked' };

/**
 * Creates a not-asked state result.
 *
 * @returns {NotAsked} A not-asked result indicating no operation has been initiated
 *
 * @example
 * const result = NotAsked();
 * console.log(result); // { type: "not-asked" }
 *
 * @example
 * // Initial state before any API call
 * const [userData, setUserData] = useState(NotAsked());
 * if (isNotAsked(userData)) {
 *   return <button onClick={fetchUser}>Load User</button>;
 * }
 */
export const NotAsked = (): NotAsked => ({ type: 'not-asked' });

/**
 * @template T
 * @template E
 * @typedef { Ok<T> | Err<E> } Result
 */

export type Result<T, E> = Ok<T> | Err<E>;

/**
 * @template T
 * @template E
 * @typedef { Result<T, E> | Loading | NotAsked } RemoteResult
 */

export type RemoteResult<T, E> = Result<T, E> | Loading | NotAsked;

/**
 * Maps a function over the value of a successful result.
 * If the result is not successful, returns the result unchanged.
 *
 * @template T
 * @template U
 * @template E
 * @param {RemoteResult<T, E>} result - The result to map over
 * @param {(value: T) => U} mapper - Function to transform the value
 * @returns {RemoteResult<U, E>} A new result with the transformed value, or the original result
 *
 * @example
 * const result = Ok(5);
 * const doubled = mapOk(result, x => x * 2);
 * console.log(doubled); // { type: "ok", value: 10 }
 *
 * @example
 * const errorResult = Err("Network error");
 * const mapped = mapOk(errorResult, x => x * 2);
 * console.log(mapped); // { type: "err", error: "Network error" }
 *
 * @example
 * const userResult = Ok({ name: "John", age: 30 });
 * const nameResult = mapOk(userResult, user => user.name);
 * console.log(nameResult); // { type: "ok", value: "John" }
 */
export const mapOk = <T, E, U>(
  result: Result<T, E>,
  mapper: (value: T) => U
): Result<U, E> => {
  if (isOk(result)) {
    return Ok(mapper(result.value));
  }
  return result;
};

/**
 * Chains operations that return Result types.
 * If the result is successful, applies the mapper function and returns its result.
 * If the result is not successful, returns the result unchanged.
 *
 * @template T
 * @template U
 * @template E
 * @param {RemoteResult<T, E>} result - The result to chain
 * @param {(value: T) => RemoteResult<U, E>} mapper - Function that returns a new result
 * @returns {RemoteResult<U, E>} The result of the mapper function, or the original result
 *
 * @example
 * const result = Ok(5);
 * const validated = flatMapOk(result, x =>
 *   x > 0 ? Ok(x * 2) : Err("Number must be positive")
 * );
 * console.log(validated); // { type: "ok", value: 10 }
 *
 * @example
 * const negativeResult = Ok(-5);
 * const validated = flatMapOk(negativeResult, x =>
 *   x > 0 ? Ok(x * 2) : Err("Number must be positive")
 * );
 * console.log(validated); // { type: "err", error: "Number must be positive" }
 *
 * @example
 * // Chaining multiple operations
 * const processUser = (user) =>
 *   Ok(user)
 *   |> (r) => flatMapOk(r, u => u.age >= 18 ? Ok(u) : Err("Too young"))
 *   |> (r) => flatMapOk(r, u => u.email ? Ok(u) : Err("Email required"));
 */
export const flatMapOk = <T, E, U>(
  result: Result<T, E>,
  mapper: (value: T) => Result<U, E>
): Result<U, E> => {
  if (isOk(result)) {
    return mapper(result.value);
  }
  return result;
};

/**
 * Maps a function over the error of an error result.
 * If the result is not an error, returns the result unchanged.
 *
 * @template T
 * @template U
 * @template E
 * @param {RemoteResult<T, E>} result - The result to map over
 * @param {(error: E) => U} mapper - Function to transform the error
 * @returns {RemoteResult<T, U>} A new result with the transformed error, or the original result
 *
 * @example
 * const result = Err("Network error");
 * const mapped = mapErr(result, error => `Error: ${error}`);
 * console.log(mapped); // { type: "err", error: "Error: Network error" }
 *
 * @example
 * const successResult = Ok(42);
 * const mapped = mapErr(successResult, error => `Error: ${error}`);
 * console.log(mapped); // { type: "ok", value: 42 }
 *
 * @example
 * const validationError = Err({ field: "email", message: "Invalid" });
 * const userFriendly = mapErr(validationError, err =>
 *   `Please fix the ${err.field}: ${err.message}`
 * );
 * console.log(userFriendly); // { type: "err", error: "Please fix the email: Invalid" }
 */
export const mapErr = <T, E, U>(
  result: Result<T, E>,
  mapper: (error: E) => U
): Result<T, U> => {
  if (isErr(result)) {
    return Err(mapper(result.error));
  }
  return result;
};

/**
 * Chains error recovery operations that return Result types.
 * If the result is an error, applies the mapper function and returns its result.
 * If the result is not an error, returns the result unchanged.
 *
 * @template T
 * @template U
 * @template E
 * @param {RemoteResult<T, E>} result - The result to chain
 * @param {(error: E) => RemoteResult<T, U>} mapper - Function that returns a new result
 * @returns {RemoteResult<T, U>} The result of the mapper function, or the original result
 *
 * @example
 * const result = Err("Network error");
 * const recovered = flatMapErr(result, error =>
 *   error === "Network error" ? Ok("Using cached data") : Err(error)
 * );
 * console.log(recovered); // { type: "ok", value: "Using cached data" }
 *
 * @example
 * const result = Err("Database error");
 * const recovered = flatMapErr(result, error =>
 *   error === "Network error" ? Ok("Using cached data") : Err(error)
 * );
 * console.log(recovered); // { type: "err", error: "Database error" }
 *
 * @example
 * // Error recovery chain
 * const handleError = (result) =>
 *   flatMapErr(result, error => {
 *     if (error === "Network error") return Ok("Retry with cache");
 *     if (error === "Auth error") return Ok("Use guest mode");
 *     return Err(error);
 *   });
 */
export const flatMapErr = <T, E, U>(
  result: Result<T, E>,
  mapper: (error: E) => Result<T, U>
): Result<T, U> => {
  if (isErr(result)) {
    return mapper(result.error);
  }
  return result;
};

/**
 * Executes a function that may throw and wraps the result in a Result type.
 * If the function succeeds, returns Ok with the result.
 * If the function throws, returns Err with the error.
 *
 * @template T
 * @param {() => T} fn - The function to execute
 * @returns {Result<T, unknown>} Ok with the function result, or Err with the thrown error
 *
 * @example
 * const result = tryCatchSync(() => {
 *   const data = JSON.parse('{"name": "John"}');
 *   return data.name;
 * });
 * console.log(result); // { type: "ok", value: "John" }
 *
 * @example
 * const result = tryCatchSync(() => {
 *   const data = JSON.parse('invalid json');
 *   return data.name;
 * });
 * console.log(result); // { type: "err", error: SyntaxError: ... }
 *
 * @example
 * // Converting existing functions to return Results
 * const safeParseInt = (str) => tryCatchSync(() => parseInt(str, 10));
 *
 * console.log(safeParseInt("123")); // { type: "ok", value: 123 }
 * console.log(safeParseInt("abc")); // { type: "ok", value: NaN }
 *
 * @example
 * // For async functions, use tryCatch instead
 * const fetchUser = async (id) => {
 *   const response = await fetch(`/api/users/${id}`);
 *   if (!response.ok) throw new Error(`HTTP ${response.status}`);
 *   return response.json();
 * };
 *
 * // For async functions, use tryCatch instead
 *
 * @example
 * // Combining with other Result functions
 * const processData = (input) =>
 *   tryCatchSync(() => JSON.parse(input))
 *   |> (r) => mapOk(r, data => ({ ...data, processed: true }))
 *   |> (r) => flatMapOk(r, data =>
 *     data.id ? Ok(data) : Err("Missing ID")
 *   );
 */
export const tryCatchSync = <T>(fn: () => T): Result<T, unknown> => {
  try {
    const result = fn();
    return Ok(result);
  } catch (error) {
    return Err(error);
  }
};

/**
 * Executes an async function or function returning a promise and wraps the result in a Result type.
 * If the function succeeds, returns a Promise that resolves to Ok with the result.
 * If the function throws or rejects, returns a Promise that resolves to Err with the error.
 *
 * @template T
 * @param {() => Promise<T> | T} fn - The async function or function returning a promise
 * @returns {Promise<Result<T, unknown>>} Promise that resolves to Ok with the function result, or Err with the error
 *
 * @example
 * const result = await tryCatch(async () => {
 *   const response = await fetch('/api/users/1');
 *   if (!response.ok) throw new Error(`HTTP ${response.status}`);
 *   return response.json();
 * });
 * console.log(result); // { type: "ok", value: { id: 1, name: "John" } }
 *
 * @example
 * const result = await tryCatch(async () => {
 *   const response = await fetch('/api/nonexistent');
 *   if (!response.ok) throw new Error(`HTTP ${response.status}`);
 *   return response.json();
 * });
 * console.log(result); // { type: "err", error: Error: HTTP 404 }
 *
 * @example
 * // Converting existing async functions to return Results
 * const safeFetch = (url) => tryCatch(async () => {
 *   const response = await fetch(url);
 *   if (!response.ok) throw new Error(`HTTP ${response.status}`);
 *   return response.json();
 * });
 *
 * const userResult = await safeFetch('/api/users/1');
 * if (isOk(userResult)) {
 *   console.log(userResult.value.name);
 * }
 *
 * @example
 * // With non-async functions that return promises
 * const result = await tryCatch(() => {
 *   return new Promise((resolve, reject) => {
 *     setTimeout(() => {
 *       Math.random() > 0.5 ? resolve("Success!") : reject("Random failure");
 *     }, 1000);
 *   });
 * });
 *
 * @example
 * // Combining with other Result functions in async contexts
 * const processUserData = async (userId) => {
 *   const fetchResult = await tryCatch(async () => {
 *     const response = await fetch(`/api/users/${userId}`);
 *     if (!response.ok) throw new Error(`HTTP ${response.status}`);
 *     return response.json();
 *   });
 *
 *   return fetchResult
 *     |> (r) => mapOk(r, user => ({ ...user, fetchedAt: new Date() }))
 *     |> (r) => flatMapOk(r, user =>
 *       user.email ? Ok(user) : Err("User missing email")
 *     );
 * };
 *
 * @example
 * // Error handling in async workflows
 * const loadUserWithFallback = async (userId) => {
 *   const primaryResult = await tryCatch(async () => {
 *     const response = await fetch(`/api/users/${userId}`);
 *     if (!response.ok) throw new Error(`HTTP ${response.status}`);
 *     return response.json();
 *   });
 *
 *   if (isOk(primaryResult)) {
 *     return primaryResult;
 *   }
 *
 *   // Fallback to cache
 *   return tryCatchSync(() => {
 *     const cached = localStorage.getItem(`user-${userId}`);
 *     if (!cached) throw new Error("Not in cache");
 *     return JSON.parse(cached);
 *   });
 * };
 */
export const tryCatch = async <T>(
  fn: () => Promise<T>
): Promise<Result<T, unknown>> => {
  try {
    const result = await fn();
    return Ok(result);
  } catch (error) {
    return Err(error);
  }
};

/**
 * Extracts the value from a successful result.
 * Throws an error if the result is not successful.
 *
 * @template T
 * @param {RemoteResult<T, unknown>} result - The result to unwrap
 * @returns {T} The value from the successful result
 * @throws {Error} When trying to unwrap a non-successful result
 *
 * @example
 * const result = Ok(42);
 * const value = unwrap(result);
 * console.log(value); // 42
 *
 * @example
 * const errorResult = Err("Something went wrong");
 * try {
 *   const value = unwrap(errorResult);
 * } catch (error) {
 *   console.log(error.message); // "Tried to unwrap a non-ok result"
 * }
 *
 * @example
 * // Safer alternative using unwrapOr
 * const result = Err("Error");
 * const value = unwrapOr(result, "default value");
 * console.log(value); // "default value"
 */
export const unwrap = <T>(result: Result<T, unknown>): T => {
  if (isOk(result)) {
    return result.value;
  }
  throw new Error('Tried to unwrap a non-ok result');
};

/**
 * Extracts the value from a successful result, or returns a default value.
 *
 * @template T
 * @param {RemoteResult<T, unknown>} result - The result to unwrap
 * @param {T} defaultValue - The default value to return if the result is not successful
 * @returns {T} The value from the successful result, or the default value
 *
 * @example
 * const result = Ok(42);
 * const value = unwrapOr(result, 0);
 * console.log(value); // 42
 *
 * @example
 * const errorResult = Err("Something went wrong");
 * const value = unwrapOr(errorResult, "default");
 * console.log(value); // "default"
 *
 * @example
 * const userResult = Err("User not found");
 * const user = unwrapOr(userResult, { id: 0, name: "Guest" });
 * console.log(user.name); // "Guest"
 *
 * @example
 * // With loading and not-asked states
 * const loadingResult = Loading();
 * const value = unwrapOr(loadingResult, "loading...");
 * console.log(value); // "loading..."
 */
export const unwrapOr = <T>(
  result: Result<T, unknown> | RemoteResult<T, unknown>,
  defaultValue: T
): T => {
  if (isOk(result)) {
    return result.value;
  }
  return defaultValue;
};

/**
 * Type guard to check if a value is a successful result.
 *
 * @template T
 * @param {unknown} value - The value to check
 * @param {(value: unknown) => value is T} [validator] - Optional validator for the value
 * @returns {value is Ok<T>} True if the value is a successful result
 *
 * @example
 * const result = Ok(42);
 * if (isOk(result)) {
 *   console.log(result.value); // 42
 * }
 *
 * @example
 * const unknownValue = { type: "ok", value: "hello" };
 * if (isOk(unknownValue)) {
 *   console.log(unknownValue.value); // "hello"
 * }
 *
 * @example
 * const errorResult = Err("error");
 * console.log(isOk(errorResult)); // false
 *
 * @example
 * console.log(isOk(null)); // false
 * console.log(isOk({})); // false
 * console.log(isOk({ type: "loading" })); // false
 */
export const isOk = <T>(
  value: unknown,
  validator?: (value: unknown) => value is T
): value is Ok<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'ok' &&
    'value' in value &&
    (validator ? validator(value.value) : true)
  );
};

/**
 * Type guard to check if a value is an error result.
 *
 * @template E
 * @param {unknown} value - The value to check
 * @param {(error: unknown) => error is E} [validator] - Optional validator for the error
 * @returns {value is Err<E>} True if the value is an error result
 *
 * @example
 * const result = Err("Something went wrong");
 * if (isErr(result)) {
 *   console.log(result.error); // "Something went wrong"
 * }
 *
 * @example
 * const unknownValue = { type: "err", error: "validation failed" };
 * if (isErr(unknownValue)) {
 *   console.log(unknownValue.error); // "validation failed"
 * }
 *
 * @example
 * const successResult = Ok(42);
 * console.log(isErr(successResult)); // false
 *
 * @example
 * console.log(isErr(null)); // false
 * console.log(isErr({})); // false
 * console.log(isErr({ type: "loading" })); // false
 */
export const isErr = <E>(
  value: unknown,
  validator?: (value: unknown) => value is E
): value is Err<E> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'err' &&
    'error' in value &&
    (validator ? validator(value.error) : true)
  );
};

/**
 * Type guard to check if a value is a loading result.
 *
 * @param {unknown} value - The value to check
 * @returns {value is Loading} True if the value is a loading result
 *
 * @example
 * const result = Loading();
 * if (isLoading(result)) {
 *   console.log("Operation in progress...");
 * }
 *
 * @example
 * const unknownValue = { type: "loading" };
 * if (isLoading(unknownValue)) {
 *   console.log("Loading...");
 * }
 *
 * @example
 * const successResult = Ok(42);
 * console.log(isLoading(successResult)); // false
 *
 * @example
 * console.log(isLoading(null)); // false
 * console.log(isLoading({})); // false
 * console.log(isLoading({ type: "ok", value: 42 })); // false
 */
export const isLoading = (value: unknown): value is Loading => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'loading'
  );
};

/**
 * Type guard to check if a value is a not-asked result.
 *
 * @param {unknown} value - The value to check
 * @returns {value is NotAsked} True if the value is a not-asked result
 *
 * @example
 * const result = NotAsked();
 * if (isNotAsked(result)) {
 *   console.log("No operation initiated yet");
 * }
 *
 * @example
 * const unknownValue = { type: "not-asked" };
 * if (isNotAsked(unknownValue)) {
 *   console.log("Not asked yet");
 * }
 *
 * @example
 * const successResult = Ok(42);
 * console.log(isNotAsked(successResult)); // false
 *
 * @example
 * console.log(isNotAsked(null)); // false
 * console.log(isNotAsked({})); // false
 * console.log(isNotAsked({ type: "loading" })); // false
 */
export const isNotAsked = (value: unknown): value is NotAsked => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'not-asked'
  );
};

/**
 * Type guard to check if a value is a valid Result type with optional value and error validators.
 * This is useful for parsing unknown data like HTTP response bodies.
 *
 * @template T
 * @template E
 * @param {unknown} value - The value to check
 * @param {(value: unknown) => value is T} [valueValidator] - Optional validator for the success value
 * @param {(error: unknown) => error is E} [errorValidator] - Optional validator for the error value
 * @returns {value is Result<T, E>} True if the value is a valid Result type
 *
 * @example
 * // Basic Result type checking
 * const unknownData = { type: "ok", value: 42 };
 * if (isResult(unknownData)) {
 *   console.log(unknownData.value); // 42
 * }
 *
 * @example
 * // With value validation
 * const isNumber = (value) => typeof value === 'number';
 * const unknownData = { type: "ok", value: "not a number" };
 *
 * if (isResult(unknownData, isNumber)) {
 *   console.log(unknownData.value); // TypeScript knows this is a number
 * } else {
 *   console.log("Not a valid number result");
 * }
 *
 * @example
 * // With error validation
 * const isString = (value) => typeof value === 'string';
 * const isErrorObject = (error) =>
 *   typeof error === 'object' && error !== null && 'message' in error;
 *
 * const unknownData = { type: "err", error: { message: "Something went wrong" } };
 *
 * if (isResult(unknownData, isString, isErrorObject)) {
 *   console.log(unknownData.error.message); // TypeScript knows this is an error object
 * }
 *
 * @example
 * // Parsing HTTP response
 * const parseUserResponse = (response) => {
 *   const isUser = (data) =>
 *     typeof data === 'object' &&
 *     data !== null &&
 *     'id' in data &&
 *     'name' in data;
 *
 *   if (isResult(response, isUser)) {
 *     return response; // Type-safe Result<User, unknown>
 *   }
 *
 *   return Err("Invalid response format");
 * };
 *
 * @example
 * // Validating API responses
 * const validateApiResponse = (data) => {
 *   const isUser = (value) =>
 *     typeof value === 'object' &&
 *     value !== null &&
 *     typeof value.id === 'number' &&
 *     typeof value.name === 'string';
 *
 *   const isApiError = (error) =>
 *     typeof error === 'object' &&
 *     error !== null &&
 *     typeof error.code === 'string' &&
 *     typeof error.message === 'string';
 *
 *   return isResult(data, isUser, isApiError);
 * };
 *
 * @example
 * // Type-safe parsing with fallback
 * const parseResult = (unknownData) => {
 *   if (isResult(unknownData)) {
 *     if (isOk(unknownData)) {
 *       // Validate the value if needed
 *       if (typeof unknownData.value === 'string') {
 *         return Ok(unknownData.value);
 *       }
 *       return Err("Invalid value type");
 *     }
 *     return unknownData; // Already an error result
 *   }
 *
 *   return Err("Not a result type");
 * };
 */
export const isResult = <T, E>(
  value: unknown,
  valueValidator?: (value: unknown) => value is T,
  errorValidator?: (error: unknown) => error is E
): value is Result<T, E> => {
  if (!isOk(value) && !isErr(value)) {
    return false;
  }

  if (isOk(value) && valueValidator) {
    return valueValidator(value.value);
  }

  if (isErr(value) && errorValidator) {
    return errorValidator(value.error);
  }

  return true;
};

/**
 * Type guard to check if a value is a valid RemoteResult type with optional value and error validators.
 * This includes Loading and NotAsked states in addition to Ok and Err.
 *
 * @template T
 * @template E
 * @param {unknown} value - The value to check
 * @param {(value: unknown) => value is T} [valueValidator] - Optional validator for the success value
 * @param {(error: unknown) => error is E} [errorValidator] - Optional validator for the error value
 * @returns {value is RemoteResult<T, E>} True if the value is a valid RemoteResult type
 *
 * @example
 * // Basic RemoteResult type checking
 * const unknownData = { type: "loading" };
 * if (isRemoteResult(unknownData)) {
 *   console.log("Valid remote result");
 * }
 *
 * @example
 * // With validation for all states
 * const isUser = (value) =>
 *   typeof value === 'object' &&
 *   value !== null &&
 *   'id' in value &&
 *   'name' in value;
 *
 * const isApiError = (error) =>
 *   typeof error === 'object' &&
 *   error !== null &&
 *   'code' in error;
 *
 * const unknownData = { type: "ok", value: { id: 1, name: "John" } };
 * if (isRemoteResult(unknownData, isUser, isApiError)) {
 *   console.log(unknownData.value.name); // TypeScript knows this is a User
 * }
 *
 * @example
 * // Parsing API responses with loading states
 * const parseApiResponse = (response) => {
 *   const isUserData = (data) =>
 *     typeof data === 'object' &&
 *     data !== null &&
 *     typeof data.id === 'number';
 *
 *   if (isRemoteResult(response, isUserData)) {
 *     return response; // Type-safe RemoteResult<User, unknown>
 *   }
 *
 *   return NotAsked();
 * };
 */
export const isRemoteResult = <T, E>(
  value: unknown,
  valueValidator?: (value: unknown) => value is T,
  errorValidator?: (error: unknown) => error is E
): value is RemoteResult<T, E> => {
  if (isLoading(value) || isNotAsked(value)) {
    return true;
  }

  return isResult(value, valueValidator, errorValidator);
};

/**
 * Pattern matching for Result types. Handles all possible states (Ok, Err, Loading, NotAsked).
 *
 * @template T
 * @template E
 * @template R
 * @param {RemoteResult<T, E>} result - The result to match against
 * @param {{
 *   ok: (value: T) => R,
 *   err: (error: E) => R,
 *   loading: () => R,
 *   notAsked: () => R
 * }} matchers - Object with handlers for each state
 * @returns {R} The result of the matching handler
 *
 * @example
 * const result = Ok(42);
 * const message = match(result, {
 *   ok: value => `Success: ${value}`,
 *   err: error => `Error: ${error}`,
 *   loading: () => 'Loading...',
 *   notAsked: () => 'Not started'
 * });
 * console.log(message); // "Success: 42"
 *
 * @example
 * // In a React component
 * const renderState = (data) => match(data, {
 *   ok: user => <UserCard user={user} />,
 *   err: error => <ErrorMessage error={error} />,
 *   loading: () => <Spinner />,
 *   notAsked: () => <button onClick={fetchData}>Load Data</button>
 * });
 *
 * @example
 * // With different return types
 * const getStatus = (result) => match(result, {
 *   ok: () => 'success',
 *   err: () => 'error',
 *   loading: () => 'loading',
 *   notAsked: () => 'idle'
 * });
 */
export const match = <T, E, R>(
  result: RemoteResult<T, E>,
  matchers: {
    ok: (value: T) => R;
    err: (error: E) => R;
    loading: () => R;
    notAsked: () => R;
  }
): R => {
  if (isOk(result)) {
    return matchers.ok(result.value);
  }
  if (isErr(result)) {
    return matchers.err(result.error);
  }
  if (isLoading(result)) {
    return matchers.loading();
  }
  if (isNotAsked(result)) {
    return matchers.notAsked();
  }
  throw new Error('Invalid result type');
};

/**
 * Pattern matching for basic Result types (Ok/Err only).
 *
 * @template T
 * @template E
 * @template R
 * @param {Result<T, E>} result - The result to match against
 * @param {(value: T) => R} onOk - Handler for successful results
 * @param {(error: E) => R} onErr - Handler for error results
 * @returns {R} The result of the matching handler
 *
 * @example
 * const result = Ok(42);
 * const message = fold(result,
 *   value => `Success: ${value}`,
 *   error => `Error: ${error}`
 * );
 * console.log(message); // "Success: 42"
 *
 * @example
 * // Converting to different types
 * const toNumber = (result) => fold(result,
 *   value => value,
 *   error => 0
 * );
 *
 * @example
 * // Error handling with logging
 * const processResult = (result) => fold(result,
 *   value => {
 *     console.log('Processing:', value);
 *     return value * 2;
 *   },
 *   error => {
 *     console.error('Failed:', error);
 *     return null;
 *   }
 * );
 */
export const fold = <T, E, R>(
  result: Result<T, E>,
  onOk: (value: T) => R,
  onErr: (error: E) => R
): R => {
  if (isOk(result)) {
    return onOk(result.value);
  }
  if (isErr(result)) {
    return onErr(result.error);
  }
  throw new Error('Invalid result type');
};

/**
 * Creates a Result from a nullable value. Returns Ok(value) if the value is not null/undefined, otherwise Err(error).
 *
 * @template T
 * @template E
 * @param {T | null | undefined} value - The nullable value
 * @param {E} error - The error to use if the value is null/undefined
 * @returns {Result<T, E>} Ok with the value, or Err with the error
 *
 * @example
 * const user = getUserFromCache();
 * const result = fromNullable(user, 'User not found in cache');
 * if (isOk(result)) {
 *   console.log(result.value.name);
 * }
 *
 * @example
 * // With API responses
 * const response = await fetch('/api/user/1');
 * const data = await response.json();
 * const userResult = fromNullable(data.user, 'User not found');
 *
 * @example
 * // With form validation
 * const email = document.getElementById('email').value;
 * const emailResult = fromNullable(email, 'Email is required');
 */
export const fromNullable = <T, E>(
  value: T | null | undefined,
  error: E
): Result<T, E> => {
  return value != null ? Ok(value) : Err(error);
};

/**
 * Creates a Result from a value that might be undefined.
 *
 * @template T
 * @template E
 * @param {T | undefined} value - The value that might be undefined
 * @param {E} error - The error to use if the value is undefined
 * @returns {Result<T, E>} Ok with the value, or Err with the error
 *
 * @example
 * const config = process.env.API_KEY;
 * const apiKeyResult = fromUndefined(config, 'API key not configured');
 *
 * @example
 * // With object properties
 * const user = { name: 'John' };
 * const emailResult = fromUndefined(user.email, 'Email not provided');
 */
export const fromUndefined = <T, E>(
  value: T | undefined,
  error: E
): Result<T, E> => {
  return value !== undefined ? Ok(value) : Err(error);
};

/**
 * Converts a Result to a Promise. Ok values resolve, Err values reject.
 *
 * @template T
 * @template E
 * @param {Result<T, E>} result - The result to convert
 * @returns {Promise<T>} A promise that resolves with the value or rejects with the error
 *
 * @example
 * const result = Ok(42);
 * const promise = toPromise(result);
 * const value = await promise; // 42
 *
 * @example
 * const errorResult = Err('Something went wrong');
 * const promise = toPromise(errorResult);
 * try {
 *   await promise; // throws 'Something went wrong'
 * } catch (error) {
 *   console.log(error); // 'Something went wrong'
 * }
 *
 * @example
 * // Converting async operations
 * const fetchUser = async (id) => {
 *   const response = await fetch(`/api/users/${id}`);
 *   const result = response.ok ? Ok(await response.json()) : Err('User not found');
 *   return toPromise(result);
 * };
 */
export const toPromise = <T, E>(result: Result<T, E>): Promise<T> => {
  if (isOk(result)) {
    return Promise.resolve(result.value);
  }
  if (isErr(result)) {
    return Promise.reject(result.error);
  }
  throw new Error('Cannot convert Loading or NotAsked to Promise');
};

/**
 * Extracts the value from a successful result, or returns a default value.
 * Alias for unwrapOr for consistency with other functional libraries.
 *
 * @template T
 * @param {RemoteResult<T, unknown>} result - The result to unwrap
 * @param {T} defaultValue - The default value to return if the result is not successful
 * @returns {T} The value from the successful result, or the default value
 *
 * @example
 * const result = Ok(42);
 * const value = getOrElse(result, 0);
 * console.log(value); // 42
 *
 * @example
 * const errorResult = Err('Something went wrong');
 * const value = getOrElse(errorResult, 'default');
 * console.log(value); // 'default'
 *
 * @example
 * // With complex defaults
 * const userResult = Err('User not found');
 * const user = getOrElse(userResult, { id: 0, name: 'Guest', email: 'guest@example.com' });
 */
export const getOrElse = <T>(
  result: RemoteResult<T, unknown>,
  defaultValue: T
): T => {
  return unwrapOr(result, defaultValue);
};

/**
 * Maps both the success and error cases of a Result in one operation.
 *
 * @template T
 * @template E
 * @template U
 * @template F
 * @param {Result<T, E>} result - The result to map
 * @param {(value: T) => U} okMapper - Function to transform successful values
 * @param {(error: E) => F} errMapper - Function to transform errors
 * @returns {Result<U, F>} A new result with transformed value or error
 *
 * @example
 * const result = Ok(42);
 * const transformed = bimap(result,
 *   value => value * 2,
 *   error => `Error: ${error}`
 * );
 * console.log(transformed); // { type: "ok", value: 84 }
 *
 * @example
 * const errorResult = Err('Network error');
 * const transformed = bimap(errorResult,
 *   value => value.toUpperCase(),
 *   error => `Error: ${error}`
 * );
 * console.log(transformed); // { type: "err", error: "Error: Network error" }
 *
 * @example
 * // Converting types
 * const numberResult = Ok('42');
 * const parsed = bimap(numberResult,
 *   value => parseInt(value, 10),
 *   error => new Error(error)
 * );
 */
export const bimap = <T, E, U, F>(
  result: Result<T, E>,
  okMapper: (value: T) => U,
  errMapper: (error: E) => F
): Result<U, F> => {
  if (isOk(result)) {
    return Ok(okMapper(result.value));
  }
  if (isErr(result)) {
    return Err(errMapper(result.error));
  }
  throw new Error('Invalid result type');
};

/**
 * Swaps the Ok and Err values of a Result. Ok becomes Err, Err becomes Ok.
 * Loading and NotAsked remain unchanged.
 *
 * @template T
 * @template E
 * @param {RemoteResult<T, E>} result - The result to swap
 * @returns {RemoteResult<E, T>} A new result with swapped Ok/Err values
 *
 * @example
 * const result = Ok(42);
 * const swapped = swap(result);
 * console.log(swapped); // { type: "err", error: 42 }
 *
 * @example
 * const errorResult = Err('Something went wrong');
 * const swapped = swap(errorResult);
 * console.log(swapped); // { type: "ok", value: "Something went wrong" }
 *
 * @example
 * const loadingResult = Loading();
 * const swapped = swap(loadingResult);
 * console.log(swapped); // { type: "loading" }
 *
 * @example
 * // Useful for error handling patterns
 * const validateUser = (user) => {
 *   if (!user.email) return Err('Email required');
 *   return Ok(user);
 * };
 *
 * const result = validateUser({ name: 'John' });
 * const inverted = swap(result); // Ok('Email required')
 */
export const swap = <T, E>(result: RemoteResult<T, E>): RemoteResult<E, T> => {
  if (isOk(result)) {
    return Err(result.value);
  }
  if (isErr(result)) {
    return Ok(result.error);
  }
  return result; // Loading and NotAsked remain unchanged
};

/**
 * Checks if two Results are equal. For Ok results, compares values. For Err results, compares errors.
 * Loading and NotAsked are equal if they have the same type.
 *
 * @template T
 * @template E
 * @param {unknown} a - First result to compare
 * @param {unknown} b - Second result to compare
 * @param {(a: T, b: T) => boolean} [valueEquals] - Optional function to compare values (defaults to ===)
 * @returns {boolean} True if the results are equal
 *
 * @example
 * const a = Ok(42);
 * const b = Ok(42);
 * console.log(equals(a, b)); // true
 *
 * @example
 * const a = Ok(42);
 * const b = Ok(43);
 * console.log(equals(a, b)); // false
 *
 * @example
 * const a = Err('error');
 * const b = Err('error');
 * console.log(equals(a, b)); // true
 *
 * @example
 * const a = Ok(42);
 * const b = Err('error');
 * console.log(equals(a, b)); // false
 *
 * @example
 * const a = Loading();
 * const b = Loading();
 * console.log(equals(a, b)); // true
 *
 * @example
 * // With custom equality function for objects
 * const a = Ok({ id: 1, name: 'John' });
 * const b = Ok({ id: 1, name: 'John' });
 * console.log(equals(a, b)); // false (reference equality)
 *
 * const deepEquals = (a, b) => JSON.stringify(a) === JSON.stringify(b);
 * console.log(equals(a, b, deepEquals)); // true
 *
 * @example
 * // With custom equality for arrays
 * const a = Ok([1, 2, 3]);
 * const b = Ok([1, 2, 3]);
 * const arrayEquals = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
 * console.log(equals(a, b, arrayEquals)); // true
 *
 * @example
 * // Safe with unknown values
 * console.log(equals(null, Ok(42))); // false
 * console.log(equals({}, Ok(42))); // false
 * console.log(equals(Ok(42), "not a result")); // false
 *
 * @example
 * // With error comparison
 * const a = Err({ code: 404, message: 'Not found' });
 * const b = Err({ code: 404, message: 'Not found' });
 * const errorEquals = (a, b) => a.code === b.code && a.message === b.message;
 * console.log(equals(a, b, errorEquals)); // true
 */
export const equals = <T, E>(
  a: unknown,
  b: unknown,
  valueEquals?: (a: unknown, b: unknown) => boolean
): boolean => {
  // Type guards to ensure both parameters are valid RemoteResult types
  if (!isRemoteResult(a) || !isRemoteResult(b)) {
    return false;
  }

  // Different types are never equal
  if (a.type !== b.type) {
    return false;
  }

  // For Ok results, compare values
  if (isOk(a) && isOk(b)) {
    return valueEquals ? valueEquals(a.value, b.value) : a.value === b.value;
  }

  // For Err results, compare errors
  if (isErr(a) && isErr(b)) {
    return valueEquals ? valueEquals(a.error, b.error) : a.error === b.error;
  }

  // Loading and NotAsked are equal if they have the same type
  return true;
};

/**
 * Type guard to check if a value is a successful RemoteResult (Ok only, not Loading/NotAsked/Err).
 *
 * @template T
 * @param {unknown} value - The value to check
 * @param {(value: unknown) => value is T} [validator] - Optional validator for the value
 * @returns {value is Ok<T>} True if the value is a successful RemoteResult
 *
 * @example
 * const result = Ok(42);
 * console.log(isRemoteSuccess(result)); // true
 *
 * @example
 * const loadingResult = Loading();
 * console.log(isRemoteSuccess(loadingResult)); // false
 *
 * @example
 * const errorResult = Err('error');
 * console.log(isRemoteSuccess(errorResult)); // false
 *
 * @example
 * // With validation
 * if (isRemoteSuccess(result, v => typeof v === 'number')) {
 *   console.log(result.value); // TypeScript knows this is a number
 * }
 */
export const isRemoteSuccess = <T>(
  value: unknown,
  validator?: (value: unknown) => value is T
): value is Ok<T> => {
  return isOk(value, validator);
};

/**
 * Type guard to check if a value is a failed RemoteResult (Err only, not Loading/NotAsked/Ok).
 *
 * @template E
 * @param {unknown} value - The value to check
 * @param {(error: unknown) => error is E} [validator] - Optional validator for the error
 * @returns {value is Err<E>} True if the value is a failed RemoteResult
 *
 * @example
 * const result = Err('error');
 * console.log(isRemoteFailure(result)); // true
 *
 * @example
 * const loadingResult = Loading();
 * console.log(isRemoteFailure(loadingResult)); // false
 *
 * @example
 * const successResult = Ok(42);
 * console.log(isRemoteFailure(successResult)); // false
 *
 * @example
 * // With validation
 * if (isRemoteFailure(result, e => typeof e === 'string')) {
 *   console.log(result.error); // TypeScript knows this is a string
 * }
 */
export const isRemoteFailure = <E>(
  value: unknown,
  validator?: (value: unknown) => value is E
): value is Err<E> => {
  return isErr(value, validator);
};

/**
 * Maps a function over the value of a successful RemoteResult, passing through other states unchanged.
 *
 * @template T
 * @template U
 * @template E
 * @param {RemoteResult<T, E>} result - The result to map over
 * @param {(value: T) => U} mapper - Function to transform the value
 * @returns {RemoteResult<U, E>} A new result with the transformed value, or the original result
 *
 * @example
 * const result = Ok(42);
 * const doubled = mapRemote(result, x => x * 2);
 * console.log(doubled); // { type: "ok", value: 84 }
 *
 * @example
 * const loadingResult = Loading();
 * const mapped = mapRemote(loadingResult, x => x * 2);
 * console.log(mapped); // { type: "loading" }
 *
 * @example
 * const errorResult = Err('error');
 * const mapped = mapRemote(errorResult, x => x * 2);
 * console.log(mapped); // { type: "err", error: "error" }
 *
 * @example
 * // With user objects
 * const userResult = Ok({ id: 1, name: 'John' });
 * const nameResult = mapRemote(userResult, user => user.name);
 * console.log(nameResult); // { type: "ok", value: "John" }
 */
export const mapRemote = <T, E, U>(
  result: RemoteResult<T, E>,
  mapper: (value: T) => U
): RemoteResult<U, E> => {
  if (isOk(result)) {
    return Ok(mapper(result.value));
  }
  return result; // Pass through Loading, NotAsked, and Err unchanged
};

/**
 * Pattern matching for RemoteResult types with all four states.
 *
 * @template T
 * @template E
 * @template R
 * @param {RemoteResult<T, E>} result - The result to match against
 * @param {{
 *   success: (value: T) => R,
 *   failure: (error: E) => R,
 *   loading: () => R,
 *   notAsked: () => R
 * }} matchers - Object with handlers for each state
 * @returns {R} The result of the matching handler
 *
 * @example
 * const result = Ok(42);
 * const message = foldRemote(result, {
 *   success: value => `Success: ${value}`,
 *   failure: error => `Error: ${error}`,
 *   loading: () => 'Loading...',
 *   notAsked: () => 'Not started'
 * });
 * console.log(message); // "Success: 42"
 *
 * @example
 * // In a React component
 * const renderState = (data) => foldRemote(data, {
 *   success: user => <UserCard user={user} />,
 *   failure: error => <ErrorMessage error={error} />,
 *   loading: () => <Spinner />,
 *   notAsked: () => <button onClick={fetchData}>Load Data</button>
 * });
 *
 * @example
 * // With different return types
 * const getStatus = (result) => foldRemote(result, {
 *   success: () => 'success',
 *   failure: () => 'error',
 *   loading: () => 'loading',
 *   notAsked: () => 'idle'
 * });
 */
export const foldRemote = <T, E, R>(
  result: RemoteResult<T, E>,
  matchers: {
    success: (value: T) => R;
    failure: (error: E) => R;
    loading: () => R;
    notAsked: () => R;
  }
): R => {
  if (isOk(result)) {
    return matchers.success(result.value);
  }
  if (isErr(result)) {
    return matchers.failure(result.error);
  }
  if (isLoading(result)) {
    return matchers.loading();
  }
  if (isNotAsked(result)) {
    return matchers.notAsked();
  }
  throw new Error('Invalid result type');
};

/**
 * Creates a Result from a value that might be null or undefined. Returns Ok(value) if the value is not null/undefined, otherwise Err(error).
 *
 * @template T
 * @template E
 * @param {T | null | undefined} value - The value that might be null or undefined
 * @param {E} error - The error to use if the value is null or undefined
 * @returns {Result<T, E>} Ok with the value, or Err with the error
 *
 * @example
 * const result = fromNullish('hello', 'Value is nullish');
 * // { type: 'ok', value: 'hello' }
 *
 * const result2 = fromNullish(null, 'Value is nullish');
 * // { type: 'err', error: 'Value is nullish' }
 *
 * const result3 = fromNullish(undefined, 'Value is nullish');
 * // { type: 'err', error: 'Value is nullish' }
 */
export const fromNullish = <T, E>(
  value: T | null | undefined,
  error: E
): Result<T, E> => {
  return value == null ? Err(error) : Ok(value);
};

/**
 * Creates a Result from a value that might be falsy. Returns Ok(value) if the value is truthy, otherwise Err(error).
 *
 * @template T
 * @template E
 * @param {T} value - The value that might be falsy
 * @param {E} error - The error to use if the value is falsy
 * @returns {Result<T, E>} Ok with the value, or Err with the error
 *
 * @example
 * const result = fromFalsy('hello', 'Value is falsy');
 * // { type: 'ok', value: 'hello' }
 *
 * const result2 = fromFalsy('', 'Value is falsy');
 * // { type: 'err', error: 'Value is falsy' }
 *
 * const result3 = fromFalsy(0, 'Value is falsy');
 * // { type: 'err', error: 'Value is falsy' }
 *
 * const result4 = fromFalsy(false, 'Value is falsy');
 * // { type: 'err', error: 'Value is falsy' }
 *
 * const result5 = fromFalsy(null, 'Value is falsy');
 * // { type: 'err', error: 'Value is falsy' }
 *
 * const result6 = fromFalsy(undefined, 'Value is falsy');
 * // { type: 'err', error: 'Value is falsy' }
 */
export const fromFalsy = <T, E>(value: T, error: E): Result<T, E> => {
  return value ? Ok(value) : Err(error);
};

/**
 * Collection of all Result utilities for convenient importing.
 *
 * @example
 * import { Result } from './result.js';
 *
 * const userResult = Result.Ok({ id: 1, name: "John" });
 * if (Result.isOk(userResult)) {
 *   console.log(userResult.value.name);
 * }
 *
 * @example
 * // Using the namespace for cleaner code
 * const { Ok, Err, isOk, isErr, mapOk, flatMapOk } = Result;
 *
 * const result = Ok(5)
 *   |> (r) => mapOk(r, x => x * 2)
 *   |> (r) => flatMapOk(r, x => x > 10 ? Ok(x) : Err("Too small"));
 */
export const Result = {
  Ok,
  isOk,
  Err,
  isErr,
  Loading,
  isLoading,
  NotAsked,
  isNotAsked,
  unwrap,
  unwrapOr,
  mapOk,
  mapErr,
  flatMapOk,
  flatMapErr,
  tryCatchSync,
  tryCatch,
  isResult,
  isRemoteResult,
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
};
