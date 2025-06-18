// @ts-check

/**
 * @template T
 * @typedef {{ type: "ok", value: T }} Ok
 */

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
export const Ok = (value) => ({ type: "ok", value });

/**
 * @template E
 * @typedef {{ type: "err", error: E }} Err
 */

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
export const Err = (error) => ({ type: "err", error });

/**
 * @typedef {{ type: "loading" }} Loading
 */

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
export const Loading = () => ({ type: "loading" });

/**
 * @typedef {{ type: "not-asked" }} NotAsked
 */

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
export const NotAsked = () => ({ type: "not-asked" });

/**
 * @template T
 * @template E
 * @typedef { Ok<T> | Err<E> } Result
 */

/**
 * @template T
 * @template E
 * @typedef { Result<T, E> | Loading | NotAsked } RemoteResult
 */

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
export const mapOk = (result, mapper) => {
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
export const flatMapOk = (result, mapper) => {
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
export const mapErr = (result, mapper) => {
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
export const flatMapErr = (result, mapper) => {
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
export const tryCatchSync = (fn) => {
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
export const tryCatch = async (fn) => {
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
export const unwrap = (result) => {
  if (isOk(result)) {
    return result.value;
  }
  throw new Error("Tried to unwrap a non-ok result");
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
export const unwrapOr = (result, defaultValue) => {
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
export const isOk = (value) => {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "ok"
  );
};

/**
 * Type guard to check if a value is an error result.
 *
 * @template E
 * @param {unknown} value - The value to check
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
export const isErr = (value) => {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "err"
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
export const isLoading = (value) => {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "loading"
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
export const isNotAsked = (value) => {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "not-asked"
  );
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
};
