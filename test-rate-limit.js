import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Test configuration
const tests = [
  {
    name: 'General Rate Limiting Test',
    endpoint: '/health',
    requests: 10,
    delay: 100, // ms between requests
    expectedLimit: 100 // requests per 15 minutes in development
  },
  {
    name: 'Auth Rate Limiting Test',
    endpoint: '/api/auth/login',
    method: 'POST',
    body: { email: 'test@example.com', password: 'wrongpassword' },
    requests: 6,
    delay: 100,
    expectedLimit: 50 // requests per 15 minutes in development
  },
  {
    name: 'API Rate Limiting Test',
    endpoint: '/api/users',
    requests: 10,
    delay: 100,
    expectedLimit: 2000 // requests per 15 minutes in development
  }
];

// Helper function to make HTTP requests
async function makeRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    return {
      status: response.status,
      headers: {
        'ratelimit-limit': response.headers.get('ratelimit-limit'),
        'ratelimit-remaining': response.headers.get('ratelimit-remaining'),
        'ratelimit-reset': response.headers.get('ratelimit-reset'),
        'retry-after': response.headers.get('retry-after')
      },
      body: await response.text()
    };
  } catch (error) {
    return {
      error: error.message
    };
  }
}

// Helper function to sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run a single test
async function runTest(test) {
  console.log(`\n🧪 Running: ${test.name}`);
  console.log(`📍 Endpoint: ${test.endpoint}`);
  console.log(`🔢 Requests: ${test.requests}`);
  console.log('━'.repeat(50));

  const results = [];
  let rateLimitHit = false;

  for (let i = 1; i <= test.requests; i++) {
    console.log(`Request ${i}/${test.requests}...`);
    
    const result = await makeRequest(
      test.endpoint, 
      test.method || 'GET', 
      test.body
    );

    results.push(result);

    // Log important information
    if (result.status === 429) {
      console.log(`❌ Rate limit exceeded on request ${i}`);
      console.log(`🔄 Retry after: ${result.headers['retry-after']}`);
      rateLimitHit = true;
      break;
    } else if (result.status < 300) {
      console.log(`✅ Request ${i} successful (${result.status})`);
    } else {
      console.log(`⚠️  Request ${i} failed (${result.status})`);
    }

    // Log rate limit headers if available
    if (result.headers['ratelimit-remaining']) {
      console.log(`📊 Remaining: ${result.headers['ratelimit-remaining']}/${result.headers['ratelimit-limit']}`);
    }

    // Wait between requests
    if (i < test.requests) {
      await sleep(test.delay);
    }
  }

  // Summary
  console.log('\n📋 Test Summary:');
  console.log(`Total requests made: ${results.length}`);
  console.log(`Rate limit hit: ${rateLimitHit ? 'Yes' : 'No'}`);
  
  const successfulRequests = results.filter(r => r.status < 300).length;
  const failedRequests = results.filter(r => r.status >= 400 && r.status !== 429).length;
  const rateLimitedRequests = results.filter(r => r.status === 429).length;

  console.log(`✅ Successful: ${successfulRequests}`);
  console.log(`❌ Failed: ${failedRequests}`);
  console.log(`🚫 Rate limited: ${rateLimitedRequests}`);

  return results;
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Rate Limiting Tests');
  console.log('═'.repeat(50));
  
  // Check if server is running
  console.log('🔍 Checking if server is running...');
  try {
    const healthCheck = await makeRequest('/health');
    if (healthCheck.error) {
      console.log('❌ Server is not running. Please start the server first.');
      console.log('Run: npm run dev');
      process.exit(1);
    }
    console.log('✅ Server is running');
  } catch (error) {
    console.log('❌ Cannot connect to server:', error.message);
    process.exit(1);
  }

  // Run each test
  for (const test of tests) {
    try {
      await runTest(test);
      
      // Wait between tests to avoid interference
      console.log('\n⏳ Waiting 2 seconds before next test...');
      await sleep(2000);
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
    }
  }

  console.log('\n🏁 All tests completed!');
  console.log('═'.repeat(50));
}

// Stress test function
async function stressTest(endpoint = '/health', requests = 20, concurrency = 5) {
  console.log(`\n💪 Running Stress Test`);
  console.log(`📍 Endpoint: ${endpoint}`);
  console.log(`🔢 Total Requests: ${requests}`);
  console.log(`⚡ Concurrency: ${concurrency}`);
  console.log('━'.repeat(50));

  const startTime = Date.now();
  const promises = [];

  // Create batches of concurrent requests
  for (let i = 0; i < requests; i += concurrency) {
    const batch = [];
    for (let j = 0; j < concurrency && (i + j) < requests; j++) {
      batch.push(makeRequest(endpoint));
    }
    
    // Wait for this batch to complete
    const batchResults = await Promise.all(batch);
    promises.push(...batchResults);

    // Log progress
    console.log(`Completed ${Math.min(i + concurrency, requests)}/${requests} requests`);
    
    // Small delay between batches
    await sleep(50);
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Analyze results
  const results = promises;
  const successful = results.filter(r => r.status < 300).length;
  const rateLimited = results.filter(r => r.status === 429).length;
  const failed = results.filter(r => r.status >= 400 && r.status !== 429).length;

  console.log('\n📊 Stress Test Results:');
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log(`📈 Requests/second: ${(requests / (duration / 1000)).toFixed(2)}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`🚫 Rate limited: ${rateLimited}`);
  console.log(`❌ Failed: ${failed}`);

  return results;
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'stress':
    const endpoint = args[1] || '/health';
    const requests = parseInt(args[2]) || 20;
    const concurrency = parseInt(args[3]) || 5;
    stressTest(endpoint, requests, concurrency);
    break;
  
  case 'single':
    const testEndpoint = args[1] || '/health';
    const testRequests = parseInt(args[2]) || 10;
    runTest({
      name: 'Single Test',
      endpoint: testEndpoint,
      requests: testRequests,
      delay: 100
    });
    break;
  
  default:
    runAllTests();
    break;
}

// Export for module usage
export {
  makeRequest,
  runTest,
  stressTest,
  runAllTests
};