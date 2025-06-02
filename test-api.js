import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'http://localhost:3001';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  cyan: '\x1b[36m'
};

class APITester {
  constructor() {
    this.token = null;
    this.refreshToken = null;
    this.userId = null;
    this.testResults = [];
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  async request(method, endpoint, data = null, headers = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const responseData = await response.json();
      
      return {
        status: response.status,
        data: responseData,
        ok: response.ok
      };
    } catch (error) {
      return {
        status: 500,
        data: { error: error.message },
        ok: false
      };
    }
  }

  async test(name, testFunction) {
    this.log(`\n📋 Testing: ${name}`, colors.cyan);
    try {
      const result = await testFunction();
      if (result.success) {
        this.log(`✅ PASS: ${name}`, colors.green);
        this.testResults.push({ name, status: 'PASS', result });
      } else {
        this.log(`❌ FAIL: ${name} - ${result.message}`, colors.red);
        this.testResults.push({ name, status: 'FAIL', result });
      }
    } catch (error) {
      this.log(`💥 ERROR: ${name} - ${error.message}`, colors.red);
      this.testResults.push({ name, status: 'ERROR', error: error.message });
    }
  }

  async testHealthCheck() {
    return this.test('Health Check', async () => {
      const response = await this.request('GET', '/health');
      
      if (response.ok && response.data.status === 'OK') {
        return { 
          success: true, 
          message: `Health check passed - ${response.data.status}`,
          data: response.data 
        };
      }
      
      return { 
        success: false, 
        message: `Health check failed - Status: ${response.status}`,
        data: response.data 
      };
    });
  }

  async testRootEndpoint() {
    return this.test('Root Endpoint', async () => {
      const response = await this.request('GET', '/');
      
      if (response.ok && response.data.message) {
        return { 
          success: true, 
          message: `Root endpoint works - ${response.data.message}`,
          data: response.data 
        };
      }
      
      return { 
        success: false, 
        message: `Root endpoint failed - Status: ${response.status}`,
        data: response.data 
      };
    });
  }

  async testUserRegistration() {
    return this.test('User Registration', async () => {
      const userData = {
        email: `test${Date.now()}@example.com`,
        name: 'Test User',
        password: 'Password123'
      };

      const response = await this.request('POST', '/api/auth/register', userData);
      
      if (response.ok && response.data.success) {
        this.token = response.data.data.accessToken;
        this.refreshToken = response.data.data.refreshToken;
        this.userId = response.data.data.user.id;
        
        return { 
          success: true, 
          message: `User registered successfully - ID: ${this.userId}`,
          data: response.data 
        };
      }
      
      return { 
        success: false, 
        message: `Registration failed - ${response.data.message || 'Unknown error'}`,
        data: response.data 
      };
    });
  }

  async testUserLogin() {
    return this.test('User Login', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await this.request('POST', '/api/auth/login', loginData);
      
      if (response.ok && response.data.success) {
        this.token = response.data.data.accessToken;
        this.refreshToken = response.data.data.refreshToken;
        
        return { 
          success: true, 
          message: 'Login successful',
          data: response.data 
        };
      }
      
      return { 
        success: false, 
        message: `Login failed - ${response.data.message || 'Unknown error'}`,
        data: response.data 
      };
    });
  }

  async testGetProfile() {
    return this.test('Get User Profile', async () => {
      if (!this.token) {
        return { 
          success: false, 
          message: 'No token available - run login test first' 
        };
      }

      const response = await this.request('GET', '/api/auth/profile', null, {
        'Authorization': `Bearer ${this.token}`
      });
      
      if (response.ok && response.data.success) {
        return { 
          success: true, 
          message: 'Profile retrieved successfully',
          data: response.data 
        };
      }
      
      return { 
        success: false, 
        message: `Get profile failed - ${response.data.message || 'Unknown error'}`,
        data: response.data 
      };
    });
  }

  async testGetAllUsers() {
    return this.test('Get All Users', async () => {
      const response = await this.request('GET', '/api/users');
      
      if (response.ok && response.data.success && Array.isArray(response.data.data)) {
        return { 
          success: true, 
          message: `Retrieved ${response.data.data.length} users`,
          data: response.data 
        };
      }
      
      return { 
        success: false, 
        message: `Get users failed - Status: ${response.status}`,
        data: response.data 
      };
    });
  }

  async testGetUserById() {
    return this.test('Get User By ID', async () => {
      const response = await this.request('GET', '/api/users/1');
      
      if (response.ok && response.data.success) {
        return { 
          success: true, 
          message: 'User retrieved successfully',
          data: response.data 
        };
      }
      
      return { 
        success: false, 
        message: `Get user by ID failed - ${response.data.message || 'Unknown error'}`,
        data: response.data 
      };
    });
  }

  async testTokenRefresh() {
    return this.test('Token Refresh', async () => {
      if (!this.refreshToken) {
        return { 
          success: false, 
          message: 'No refresh token available - run login test first' 
        };
      }

      const response = await this.request('POST', '/api/auth/refresh-token', {
        refreshToken: this.refreshToken
      });
      
      if (response.ok && response.data.success) {
        this.token = response.data.data.accessToken;
        this.refreshToken = response.data.data.refreshToken;
        
        return { 
          success: true, 
          message: 'Token refreshed successfully',
          data: response.data 
        };
      }
      
      return { 
        success: false, 
        message: `Token refresh failed - ${response.data.message || 'Unknown error'}`,
        data: response.data 
      };
    });
  }

  async testInvalidEndpoint() {
    return this.test('Invalid Endpoint (404)', async () => {
      const response = await this.request('GET', '/api/invalid-endpoint');
      
      if (response.status === 404) {
        return { 
          success: true, 
          message: '404 error handled correctly',
          data: response.data 
        };
      }
      
      return { 
        success: false, 
        message: `Expected 404 but got ${response.status}`,
        data: response.data 
      };
    });
  }

  async testUnauthorizedAccess() {
    return this.test('Unauthorized Access', async () => {
      const response = await this.request('PUT', '/api/auth/profile', {
        name: 'Updated Name'
      });
      
      if (response.status === 401) {
        return { 
          success: true, 
          message: 'Unauthorized access blocked correctly',
          data: response.data 
        };
      }
      
      return { 
        success: false, 
        message: `Expected 401 but got ${response.status}`,
        data: response.data 
      };
    });
  }

  async testInvalidData() {
    return this.test('Invalid Registration Data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123' // Too short
      };

      const response = await this.request('POST', '/api/auth/register', invalidData);
      
      if (response.status === 422 || response.status === 400) {
        return { 
          success: true, 
          message: 'Invalid data validation works correctly',
          data: response.data 
        };
      }
      
      return { 
        success: false, 
        message: `Expected validation error but got ${response.status}`,
        data: response.data 
      };
    });
  }

  printSummary() {
    this.log('\n' + '='.repeat(50), colors.blue);
    this.log('📊 TEST SUMMARY', colors.blue);
    this.log('='.repeat(50), colors.blue);
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const errors = this.testResults.filter(r => r.status === 'ERROR').length;
    const total = this.testResults.length;
    
    this.log(`Total Tests: ${total}`, colors.cyan);
    this.log(`Passed: ${passed}`, colors.green);
    this.log(`Failed: ${failed}`, colors.red);
    this.log(`Errors: ${errors}`, colors.red);
    this.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`, colors.cyan);
    
    if (failed > 0 || errors > 0) {
      this.log('\n❌ FAILED/ERROR TESTS:', colors.red);
      this.testResults
        .filter(r => r.status !== 'PASS')
        .forEach(result => {
          this.log(`  • ${result.name}: ${result.status}`, colors.red);
          if (result.error) {
            this.log(`    Error: ${result.error}`, colors.red);
          }
        });
    }
    
    this.log('\n' + '='.repeat(50), colors.blue);
  }

  async runAllTests() {
    this.log('🚀 Starting API Tests...', colors.blue);
    this.log(`🎯 Target: ${BASE_URL}`, colors.blue);
    
    // Basic endpoint tests
    await this.testHealthCheck();
    await this.testRootEndpoint();
    
    // Public API tests
    await this.testGetAllUsers();
    await this.testGetUserById();
    
    // Authentication tests
    await this.testUserRegistration();
    await this.testUserLogin();
    
    // Protected endpoint tests
    await this.testGetProfile();
    await this.testTokenRefresh();
    
    // Error handling tests
    await this.testInvalidEndpoint();
    await this.testUnauthorizedAccess();
    await this.testInvalidData();
    
    this.printSummary();
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new APITester();
  
  // Check if server is running
  try {
    const healthCheck = await fetch(`${BASE_URL}/health`);
    if (healthCheck.ok) {
      console.log(`${colors.green}✅ Server is running at ${BASE_URL}${colors.reset}`);
      await tester.runAllTests();
    } else {
      console.log(`${colors.red}❌ Server is not responding at ${BASE_URL}${colors.reset}`);
      console.log(`${colors.yellow}💡 Make sure to run 'npm start' or 'npm run dev' first${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Cannot connect to server at ${BASE_URL}${colors.reset}`);
    console.log(`${colors.yellow}💡 Make sure to run 'npm start' or 'npm run dev' first${colors.reset}`);
    console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

export default APITester;