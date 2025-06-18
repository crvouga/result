/* eslint-disable no-console */
import {
  Ok,
  Err,
  Loading,
  NotAsked,
  fromNullable,
  fromUndefined,
  toPromise,
  getOrElse,
  bimap,
  swap,
  equals,
  mapRemote,
  isRemoteSuccess,
  isRemoteFailure,
} from '../src/result.ts';

console.log('=== Utility Functions Examples ===\n');

// Example 1: Working with nullable values
console.log('1. Handling nullable values:');
const userFromCache = null;
const userFromApi = { id: 1, name: 'John' };
const configValue = undefined;

const cachedUser = fromNullable(userFromCache, 'User not found in cache');
const apiUser = fromNullable(userFromApi, 'User not found in API');
const config = fromUndefined(configValue, 'API key not configured');

console.log('  Cached user:', cachedUser);
console.log('  API user:', apiUser);
console.log('  Config:', config);

// Example 2: Promise integration
console.log('\n2. Promise integration:');
const fetchUserData = async (userId) => {
  // Simulate API call
  if (userId === 1) {
    return toPromise(Ok({ id: 1, name: 'John', email: 'john@example.com' }));
  } else {
    return toPromise(Err('User not found'));
  }
};

(async () => {
  try {
    const user = await fetchUserData(1);
    console.log('  Success:', user);
  } catch (error) {
    console.log('  Error:', error);
  }

  try {
    await fetchUserData(999);
  } catch (error) {
    console.log('  Expected error:', error);
  }
})();

// Example 3: Default values with getOrElse
console.log('\n3. Default values:');
const results = [Ok(42), Err('Something went wrong'), Loading(), NotAsked()];

results.forEach((result, index) => {
  const value = getOrElse(result, 42);
  console.log(`  Result ${index + 1}: ${value}`);
});

// Example 4: Bidirectional mapping with bimap
console.log('\n4. Bidirectional mapping:');
const numberResult = Ok('42');
const errorResult = Err('network error');

const parsedNumber = bimap(
  numberResult,
  (value) => parseInt(value, 10),
  (error) => new Error(error as string)
);

const formattedError = bimap(
  errorResult,
  (value) => (value as string).toUpperCase(),
  (error) => `Error: ${error as string}`
);

console.log('  Parsed number:', parsedNumber);
console.log('  Formatted error:', formattedError);

// Example 5: Swapping Ok/Err values
console.log('\n5. Swapping values:');
const successResult = Ok('Success message');
const failureResult = Err('Error message');

const swappedSuccess = swap(successResult);
const swappedFailure = swap(failureResult);

console.log('  Original success:', successResult);
console.log('  Swapped success:', swappedSuccess);
console.log('  Original failure:', failureResult);
console.log('  Swapped failure:', swappedFailure);

// Example 6: Equality comparison
console.log('\n6. Equality comparison:');
const a = Ok(42);
const b = Ok(42);
const c = Ok(43);
const d = Err('error');
const e = Err('error');
const f = Loading();
const g = Loading();

console.log('  Ok(42) === Ok(42):', equals(a, b));
console.log('  Ok(42) === Ok(43):', equals(a, c));
console.log('  Err("error") === Err("error"):', equals(d, e));
console.log('  Loading() === Loading():', equals(f, g));
console.log('  Ok(42) === Err("error"):', equals(a, d));

// Example 7: RemoteResult mapping
console.log('\n7. RemoteResult mapping:');
const remoteResults = [
  Ok({ id: 1, name: 'John', age: 30 }),
  Loading(),
  NotAsked(),
  Err('Failed to fetch user'),
];

remoteResults.forEach((result, index) => {
  const mapped = mapRemote(result, (user) => ({
    ...user,
    displayName: `${user.name} (${user.age})`,
  }));
  console.log(`  Result ${index + 1}:`, mapped);
});

// Example 8: Type guards with validation
console.log('\n8. Type guards with validation:');
const mixedResults = [
  Ok(42),
  Ok('hello'),
  Err('error message'),
  Err(404),
  Loading(),
  NotAsked(),
];

const isNumber = (value) => typeof value === 'number';
const isString = (error) => typeof error === 'string';

mixedResults.forEach((result, index) => {
  const isSuccess = isRemoteSuccess(result, isNumber);
  const isFailure = isRemoteFailure(result, isString);

  console.log(`  Result ${index + 1}:`);
  console.log(`    Is success with number: ${isSuccess}`);
  console.log(`    Is failure with string: ${isFailure}`);
});

// Example 9: Real-world form validation
console.log('\n9. Form validation example:');
const validateForm = (formData) => {
  const email = fromNullable(formData.email, 'Email is required');
  const name = fromNullable(formData.name, 'Name is required');
  const age = fromUndefined(formData.age, 'Age is required');

  // Chain validations
  const validatedEmail =
    email.type === 'ok' && email.value.includes('@')
      ? email
      : Err('Invalid email format');

  const validatedAge =
    age.type === 'ok' && age.value >= 18 ? age : Err('Must be 18 or older');

  return {
    email: validatedEmail,
    name,
    age: validatedAge,
  };
};

const formSubmissions = [
  { email: 'john@example.com', name: 'John', age: 25 },
  { email: 'invalid-email', name: 'Jane', age: 16 },
  { email: 'bob@example.com', name: null, age: 30 },
  { email: undefined, name: 'Alice', age: 22 },
];

formSubmissions.forEach((data, index) => {
  console.log(`  Form ${index + 1}:`);
  const validation = validateForm(data);
  Object.entries(validation).forEach(([field, result]) => {
    console.log(
      `    ${field}: ${result.type === 'ok' ? '✅' : '❌'} ${result.type === 'ok' ? result.value : result.error}`
    );
  });
});

// Example 10: Error recovery patterns
console.log('\n10. Error recovery patterns:');
const processUserData = (userData) => {
  // Try to get user from cache first
  const cachedUser = fromNullable(userData.cached, 'Not in cache');

  if (cachedUser.type === 'ok') {
    return Ok({ source: 'cache', user: cachedUser.value });
  }

  // Try to get from API
  const apiUser = fromNullable(userData.api, 'API call failed');

  if (apiUser.type === 'ok') {
    return Ok({ source: 'api', user: apiUser.value });
  }

  // Return the error from the last attempt
  return apiUser;
};

const userDataScenarios = [
  { cached: { id: 1, name: 'John' }, api: null },
  { cached: null, api: { id: 2, name: 'Jane' } },
  { cached: null, api: null },
];

userDataScenarios.forEach((scenario, index) => {
  const result = processUserData(scenario);
  console.log(`  Scenario ${index + 1}:`, result);
});
