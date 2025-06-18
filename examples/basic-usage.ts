/* eslint-disable no-console */
import {
  Err,
  Loading,
  NotAsked,
  Ok,
  flatMapOk,
  isErr,
  isLoading,
  isNotAsked,
  isOk,
  mapOk,
  tryCatch,
  tryCatchSync,
  unwrapOr,
} from '../src/result.ts';

// Basic Result creation and checking
console.log('=== Basic Usage ===');
const success = Ok(42);
const error = Err('Something went wrong');

if (isOk(success)) {
  console.log('Success:', success.value);
}

if (isErr(error)) {
  console.log('Error:', error.error);
}

// Transformation examples
console.log('\n=== Transformations ===');
const doubled = mapOk(success, (x) => x * 2);
console.log('Doubled:', doubled);

const validated = flatMapOk(success, (x) =>
  x > 0 ? Ok(x * 2) : Err('Number must be positive')
);
console.log('Validated:', validated);

// Error handling
console.log('\n=== Error Handling ===');
const jsonResult = tryCatchSync(() => {
  const data = JSON.parse('{"name": "John", "age": 30}');
  return data.name;
});

if (isOk(jsonResult)) {
  console.log('Parsed name:', jsonResult.value);
}

const invalidJsonResult = tryCatchSync(() => {
  const data = JSON.parse('invalid json');
  return data.name;
});

if (isErr(invalidJsonResult)) {
  // @ts-expect-error
  console.log('JSON parse error:', invalidJsonResult.error.message);
}

// Unwrapping with defaults
console.log('\n=== Unwrapping ===');
const defaultValue = unwrapOr(error, 'default value');
console.log('Default value:', defaultValue);

// Loading states
console.log('\n=== Loading States ===');
const loadingState = Loading();
const notAskedState = NotAsked();

console.log('Is loading:', isLoading(loadingState));
console.log('Is not asked:', isNotAsked(notAskedState));

// Async example
console.log('\n=== Async Example ===');
async function fetchUserData() {
  const result = await tryCatch(async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Simulate random success/failure
    if (Math.random() > 0.5) {
      return { id: 1, name: 'John Doe', email: 'john@example.com' };
    } else {
      throw new Error('User not found');
    }
  });

  if (isOk(result)) {
    console.log('User data:', result.value);
  } else {
    // @ts-expect-error
    console.log('Error fetching user:', result.error.message);
  }
}

fetchUserData();
