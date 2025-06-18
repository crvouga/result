/* eslint-disable no-console */
import {
  Ok,
  Err,
  isOk,
  isErr,
  isResult,
  isRemoteResult,
  tryCatch,
} from '../result.js';

console.log('=== Type Guards Example ===\n');

// Example 1: Basic Result type validation
console.log('1. Basic Result Type Validation:');
const unknownData1 = { type: 'ok', value: 42 };
const unknownData2 = { type: 'err', error: 'Something went wrong' };
const unknownData3 = { type: 'loading' };
const unknownData4 = { some: 'other data' };

console.log('isResult(unknownData1):', isResult(unknownData1)); // true
console.log('isResult(unknownData2):', isResult(unknownData2)); // true
console.log('isResult(unknownData3):', isResult(unknownData3)); // false
console.log('isResult(unknownData4):', isResult(unknownData4)); // false

console.log('isRemoteResult(unknownData3):', isRemoteResult(unknownData3)); // true
console.log('isRemoteResult(unknownData4):', isRemoteResult(unknownData4)); // false

// Example 2: Value validation
console.log('\n2. Value Validation:');
const isNumber = (value) => typeof value === 'number';
const isString = (value) => typeof value === 'string';

const numberResult = { type: 'ok', value: 42 };
const stringResult = { type: 'ok', value: 'hello' };
const mixedResult = { type: 'ok', value: 'not a number' };

console.log(
  'isResult(numberResult, isNumber):',
  isResult(numberResult, isNumber)
); // true
console.log(
  'isResult(stringResult, isString):',
  isResult(stringResult, isString)
); // true
console.log(
  'isResult(mixedResult, isNumber):',
  isResult(mixedResult, isNumber)
); // false

// Example 3: Error validation
console.log('\n3. Error Validation:');
const isStringError = (error) => typeof error === 'string';
const isObjectError = (error) =>
  typeof error === 'object' && error !== null && 'message' in error;

const stringError = { type: 'err', error: 'Simple error' };
const objectError = {
  type: 'err',
  error: { message: 'Complex error', code: 500 },
};

console.log(
  'isResult(stringError, undefined, isStringError):',
  isResult(stringError, undefined, isStringError)
); // true
console.log(
  'isResult(objectError, undefined, isObjectError):',
  isResult(objectError, undefined, isObjectError)
); // true
console.log(
  'isResult(objectError, undefined, isStringError):',
  isResult(objectError, undefined, isStringError)
); // false

// Example 4: Complex object validation
console.log('\n4. Complex Object Validation:');
const isUser = (value) =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  'name' in value &&
  typeof value.id === 'number' &&
  typeof value.name === 'string';

const validUser = { type: 'ok', value: { id: 1, name: 'John Doe' } };
const invalidUser = { type: 'ok', value: { name: 'John Doe' } }; // missing id
const malformedUser = {
  type: 'ok',
  value: { id: 'not a number', name: 'John' },
};

console.log('isResult(validUser, isUser):', isResult(validUser, isUser)); // true
console.log('isResult(invalidUser, isUser):', isResult(invalidUser, isUser)); // false
console.log(
  'isResult(malformedUser, isUser):',
  isResult(malformedUser, isUser)
); // false

// Example 5: API Response Parsing
console.log('\n5. API Response Parsing:');
const parseUserResponse = (response) => {
  const isUser = (data) =>
    typeof data === 'object' && data !== null && 'id' in data && 'name' in data;

  if (isResult(response, isUser)) {
    return response; // Type-safe Result<User, unknown>
  }

  return Err('Invalid response format');
};

const apiResponse1 = { type: 'ok', value: { id: 1, name: 'John' } };
const apiResponse2 = { type: 'err', error: 'User not found' };
const apiResponse3 = { type: 'ok', value: { name: 'John' } }; // missing id
const apiResponse4 = { some: 'other data' };

const parsed1 = parseUserResponse(apiResponse1);
const parsed2 = parseUserResponse(apiResponse2);
const parsed3 = parseUserResponse(apiResponse3);
const parsed4 = parseUserResponse(apiResponse4);

console.log('Parsed valid response:', isOk(parsed1) ? 'Valid' : 'Invalid');
console.log('Parsed error response:', isOk(parsed2) ? 'Valid' : 'Invalid');
console.log('Parsed invalid response:', isOk(parsed3) ? 'Valid' : 'Invalid');
console.log('Parsed non-result data:', isOk(parsed4) ? 'Valid' : 'Invalid');

// Example 6: Simulated HTTP Response Handling
console.log('\n6. HTTP Response Handling:');
const handleHttpResponse = async () => {
  // Simulate HTTP response
  const mockResponse = await tryCatch(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Simulate different response scenarios
    const scenarios = [
      {
        type: 'ok',
        value: { id: 1, name: 'John Doe', email: 'john@example.com' },
      },
      {
        type: 'err',
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      },
      { type: 'ok', value: { name: 'Invalid User' } }, // missing id
      { some: 'malformed data' },
    ];

    return scenarios[Math.floor(Math.random() * scenarios.length)];
  });

  if (isOk(mockResponse)) {
    const response = mockResponse.value;

    // Validate the response structure
    const isUser = (data) =>
      typeof data === 'object' &&
      data !== null &&
      'id' in data &&
      'name' in data;

    const isApiError = (error) =>
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error;

    if (isResult(response, isUser, isApiError)) {
      return response; // Type-safe Result<User, ApiError>
    }

    return Err('Invalid response format');
  }

  return mockResponse; // Return the original error
};

// Test the HTTP response handler
(async () => {
  console.log('Processing HTTP response...');
  const result = await handleHttpResponse();

  if (isOk(result)) {
    if (isOk(result.value)) {
      console.log('✅ Valid user data:', result.value.value);
    } else {
      console.log('❌ API error:', result.value.error);
    }
  } else {
    console.log('❌ Network error:', result.error);
  }
})();

// Example 7: Type-safe parsing with fallback
console.log('\n7. Type-safe Parsing with Fallback:');
const safeParseResult = (unknownData) => {
  // First, check if it's a basic Result type
  if (!isResult(unknownData)) {
    return Err('Not a result type');
  }

  // If it's an error result, return it as-is
  if (isErr(unknownData)) {
    return unknownData;
  }

  // If it's an ok result, validate the value
  if (isOk(unknownData)) {
    // Validate the value if needed
    if (typeof unknownData.value === 'string') {
      return Ok(unknownData.value);
    }
    if (typeof unknownData.value === 'number') {
      return Ok(unknownData.value);
    }
    if (typeof unknownData.value === 'object' && unknownData.value !== null) {
      return Ok(unknownData.value);
    }

    return Err('Invalid value type');
  }

  return Err('Unknown result state');
};

const testData1 = { type: 'ok', value: 'hello' };
const testData2 = { type: 'ok', value: 42 };
const testData3 = { type: 'ok', value: { id: 1 } };
const testData4 = { type: 'err', error: 'Something went wrong' };
const testData5 = { some: 'other data' };

console.log('Safe parse string:', safeParseResult(testData1));
console.log('Safe parse number:', safeParseResult(testData2));
console.log('Safe parse object:', safeParseResult(testData3));
console.log('Safe parse error:', safeParseResult(testData4));
console.log('Safe parse invalid:', safeParseResult(testData5));
