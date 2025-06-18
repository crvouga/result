/* eslint-disable no-console */
import {
  Ok,
  Err,
  Loading,
  NotAsked,
  match,
  fold,
  foldRemote,
  RemoteResult,
} from '../src/result.ts';

console.log('=== Pattern Matching Examples ===\n');

// Example 1: Basic pattern matching with match
console.log('1. Basic pattern matching:');
const results = [Ok(42), Err('Something went wrong'), Loading(), NotAsked()];

results.forEach((result) => {
  const message = match(result, {
    ok: (value) => `✅ Success: ${value}`,
    err: (error) => `❌ Error: ${error}`,
    loading: () => '⏳ Loading...',
    notAsked: () => '🔄 Not started',
  });
  console.log(`  ${result.type}: ${message}`);
});

console.log('\n2. React-like component rendering:');
const renderUserCard = (
  userData: RemoteResult<{ name: string; email: string }, unknown>
) => {
  return match(userData, {
    ok: (user) => ({
      type: 'div',
      className: 'user-card success',
      children: `Welcome, ${user.name}! (${user.email})`,
    }),
    err: (error) => ({
      type: 'div',
      className: 'user-card error',
      children: `Failed to load user: ${error}`,
    }),
    loading: () => ({
      type: 'div',
      className: 'user-card loading',
      children: 'Loading user data...',
    }),
    notAsked: () => ({
      type: 'button',
      className: 'user-card not-asked',
      children: 'Click to load user',
      onClick: 'fetchUser()',
    }),
  });
};

const userStates = [
  Ok({ name: 'John Doe', email: 'john@example.com' }),
  Err('User not found'),
  Loading(),
  NotAsked(),
];

userStates.forEach((state, index) => {
  const component = renderUserCard(state);
  console.log(`  State ${index + 1}:`, JSON.stringify(component, null, 2));
});

console.log('\n3. Basic Result folding (Ok/Err only):');
const basicResults = [Ok(42), Err('Network error')];

basicResults.forEach((result) => {
  const status = fold(
    result,
    (value) => `SUCCESS: ${value}`,
    (error) => `FAILURE: ${error}`
  );
  console.log(`  ${result.type}: ${status}`);
});

console.log('\n4. RemoteResult folding with all states:');
const getStatusColor = (result) => {
  return foldRemote(result, {
    success: () => 'green',
    failure: () => 'red',
    loading: () => 'yellow',
    notAsked: () => 'gray',
  });
};

results.forEach((result) => {
  const color = getStatusColor(result);
  console.log(`  ${result.type}: ${color}`);
});

console.log('\n5. Complex business logic with pattern matching:');
const processOrder = (
  orderResult: RemoteResult<
    { id: string; total: number; items: string[] },
    string
  >
) => {
  return match(orderResult, {
    ok: (order) => {
      if (order.total > 100) {
        return `🎉 Order confirmed! Total: $${order.total} (Free shipping!)`;
      }
      return `✅ Order confirmed! Total: $${order.total}`;
    },
    err: (error) => {
      if (error.includes('payment')) {
        return `💳 Payment failed: ${error}. Please try again.`;
      }
      if (error.includes('inventory')) {
        return `📦 Out of stock: ${error}. We'll notify you when available.`;
      }
      return `❌ Order failed: ${error}`;
    },
    loading: () => '⏳ Processing your order...',
    notAsked: () => '🛒 Add items to cart to continue',
  });
};

const orderStates = [
  Ok({ id: '123', total: 150, items: ['laptop', 'mouse'] }),
  Ok({ id: '124', total: 50, items: ['book'] }),
  Err('Payment declined: insufficient funds'),
  Err('Item "gaming chair" is out of stock'),
  Loading(),
  NotAsked(),
];

orderStates.forEach((state, index) => {
  const message = processOrder(state);
  console.log(`  Order ${index + 1}: ${message}`);
});
