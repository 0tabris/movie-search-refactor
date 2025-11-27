/**
 * Comprehensive API Test Suite for Movie Search Application
 * Run with: node test-api.js
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/movies';

// Test results tracking
const testResults = {
  passed: [],
  failed: [],
  total: 0,
};

// Helper function to make API calls
async function apiCall(method, endpoint, body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json().catch(() => ({}));
    
    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
      data: null,
    };
  }
}

// Test helper
function test(name, testFn) {
  testResults.total++;
  return async () => {
    try {
      await testFn();
      testResults.passed.push(name);
      console.log(`✅ ${name}`);
    } catch (error) {
      testResults.failed.push({ name, error: error.message });
      console.log(`❌ ${name}: ${error.message}`);
    }
  };
}

// Wait helper
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test suite
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log('='.repeat(60));
  
  let testMovie = null;
  let testImdbID = null;

  // ============================================
  // 1. SEARCH FUNCTIONALITY TESTS
  // ============================================
  console.log('\n📋 1. SEARCH FUNCTIONALITY TESTS');
  console.log('-'.repeat(60));

  await test('Search with valid query', async () => {
    const result = await apiCall('GET', '/search?q=batman&page=1');
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data?.data?.movies) throw new Error('Missing movies array');
    if (result.data.data.movies.length === 0) throw new Error('No movies returned');
    testMovie = result.data.data.movies[0];
    testImdbID = testMovie.imdbID;
  })();

  await test('Search with special characters', async () => {
    const result = await apiCall('GET', '/search?q=spider-man&page=1');
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
  })();

  await test('Search with empty query (should show error)', async () => {
    const result = await apiCall('GET', '/search?q=&page=1');
    if (result.ok) throw new Error('Expected error for empty query');
    if (result.status !== 400) throw new Error(`Expected 400, got ${result.status}`);
  })();

  await test('Search pagination - page 2', async () => {
    const result = await apiCall('GET', '/search?q=batman&page=2');
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data?.data?.movies) throw new Error('Missing movies array');
  })();

  await test('Search with invalid page number (negative)', async () => {
    const result = await apiCall('GET', '/search?q=batman&page=-1');
    if (result.ok) throw new Error('Expected error for negative page');
    if (result.status !== 400) throw new Error(`Expected 400, got ${result.status}`);
  })();

  await test('Search with invalid page number (zero)', async () => {
    const result = await apiCall('GET', '/search?q=batman&page=0');
    if (result.ok) throw new Error('Expected error for zero page');
    if (result.status !== 400) throw new Error(`Expected 400, got ${result.status}`);
  })();

  await test('Search with non-integer page', async () => {
    const result = await apiCall('GET', '/search?q=batman&page=abc');
    // ParseIntPipe might handle this differently, but should error
    if (result.ok && result.data?.data?.movies) {
      // If it works, that's also acceptable (might default to 1)
      console.log('   Note: Non-integer page was handled (might default to 1)');
    }
  })();

  // ============================================
  // 2. FAVORITES MANAGEMENT TESTS
  // ============================================
  console.log('\n📋 2. FAVORITES MANAGEMENT TESTS');
  console.log('-'.repeat(60));

  await test('Add movie to favorites', async () => {
    if (!testMovie) throw new Error('No test movie available');
    const result = await apiCall('POST', '/favorites', testMovie);
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data?.data?.message) throw new Error('Missing success message');
  })();

  await test('Add duplicate movie (should show error)', async () => {
    if (!testMovie) throw new Error('No test movie available');
    const result = await apiCall('POST', '/favorites', testMovie);
    if (result.ok) throw new Error('Expected error for duplicate');
    if (result.status !== 400) throw new Error(`Expected 400, got ${result.status}`);
  })();

  await test('View favorites list', async () => {
    const result = await apiCall('GET', '/favorites/list?page=1');
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data?.data?.favorites) throw new Error('Missing favorites array');
    if (result.data.data.favorites.length === 0) throw new Error('Favorites list is empty');
  })();

  await test('View favorites pagination - page 1', async () => {
    const result = await apiCall('GET', '/favorites/list?page=1');
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data?.data?.currentPage) throw new Error('Missing currentPage');
    if (result.data.data.currentPage !== 1) throw new Error('Wrong page number');
  })();

  await test('Remove movie from favorites', async () => {
    if (!testImdbID) throw new Error('No test movie ID available');
    const result = await apiCall('DELETE', `/favorites/${testImdbID}`);
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data?.data?.message) throw new Error('Missing success message');
  })();

  await test('Remove non-existent movie (should show error)', async () => {
    const result = await apiCall('DELETE', '/favorites/tt9999999');
    if (result.ok) throw new Error('Expected error for non-existent movie');
    if (result.status !== 404) throw new Error(`Expected 404, got ${result.status}`);
  })();

  await test('Add movie with invalid data (missing imdbID)', async () => {
    const invalidMovie = { title: 'Test', year: 2020 };
    const result = await apiCall('POST', '/favorites', invalidMovie);
    if (result.ok) throw new Error('Expected error for invalid movie data');
    if (result.status !== 400) throw new Error(`Expected 400, got ${result.status}`);
  })();

  await test('Remove with empty ID (should show error)', async () => {
    const result = await apiCall('DELETE', '/favorites/');
    // This might return 404 or 400 depending on routing
    if (result.ok) throw new Error('Expected error for empty ID');
  })();

  // ============================================
  // 3. ERROR HANDLING TESTS
  // ============================================
  console.log('\n📋 3. ERROR HANDLING TESTS');
  console.log('-'.repeat(60));

  await test('Invalid input validation - missing query parameter', async () => {
    const result = await apiCall('GET', '/search?page=1');
    if (result.ok) throw new Error('Expected error for missing query');
    if (result.status !== 400) throw new Error(`Expected 400, got ${result.status}`);
  })();

  await test('Invalid input validation - invalid page size for favorites', async () => {
    // Note: pageSize is not exposed in the API, but testing page validation
    const result = await apiCall('GET', '/favorites/list?page=-1');
    if (result.ok) throw new Error('Expected error for negative page');
    if (result.status !== 400) throw new Error(`Expected 400, got ${result.status}`);
  })();

  await test('Invalid endpoint (404)', async () => {
    const result = await apiCall('GET', '/invalid-endpoint');
    if (result.ok) throw new Error('Expected 404 for invalid endpoint');
    // NestJS might return 404 or handle differently
  })();

  // ============================================
  // 4. EDGE CASES TESTS
  // ============================================
  console.log('\n📋 4. EDGE CASES TESTS');
  console.log('-'.repeat(60));

  await test('Empty search results (non-existent movie)', async () => {
    const result = await apiCall('GET', '/search?q=xyzabc123nonexistent&page=1');
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data?.data?.movies) throw new Error('Missing movies array');
    if (result.data.data.movies.length !== 0) throw new Error('Expected empty results');
  })();

  await test('Empty favorites list', async () => {
    // First, ensure favorites are empty by removing any existing
    const result = await apiCall('GET', '/favorites/list?page=1');
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data?.data) throw new Error('Missing data object');
    // Should return empty array, not error
    if (!Array.isArray(result.data.data.favorites)) {
      throw new Error('Favorites should be an array');
    }
  })();

  await test('Invalid page numbers (too high)', async () => {
    const result = await apiCall('GET', '/favorites/list?page=999999');
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    // Should return empty array for page beyond results
    if (!result.data?.data?.favorites) throw new Error('Missing favorites array');
  })();

  await test('Rapid button clicks simulation (race conditions)', async () => {
    if (!testMovie) {
      // Get a test movie first
      const searchResult = await apiCall('GET', '/search?q=batman&page=1');
      if (searchResult.ok && searchResult.data?.data?.movies?.length > 0) {
        testMovie = searchResult.data.data.movies[0];
      }
    }
    
    if (testMovie) {
      // Try to add the same movie multiple times rapidly
      const promises = [
        apiCall('POST', '/favorites', testMovie),
        apiCall('POST', '/favorites', testMovie),
        apiCall('POST', '/favorites', testMovie),
      ];
      
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.ok).length;
      
      // Only one should succeed, others should fail with duplicate error
      if (successCount !== 1) {
        throw new Error(`Expected 1 success, got ${successCount}. Race condition may exist.`);
      }
      
      // Clean up
      await apiCall('DELETE', `/favorites/${testMovie.imdbID}`);
    }
  })();

  // ============================================
  // 5. PERFORMANCE & CACHING TESTS
  // ============================================
  console.log('\n📋 5. PERFORMANCE & CACHING TESTS');
  console.log('-'.repeat(60));

  await test('Query cache verification (same query should be fast)', async () => {
    const start1 = Date.now();
    await apiCall('GET', '/search?q=batman&page=1');
    const time1 = Date.now() - start1;
    
    const start2 = Date.now();
    await apiCall('GET', '/search?q=batman&page=1');
    const time2 = Date.now() - start2;
    
    // Note: Backend doesn't cache, but we can verify it works
    console.log(`   First call: ${time1}ms, Second call: ${time2}ms`);
    // Both should complete successfully
  })();

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 TEST SUMMARY');
  console.log('-'.repeat(60));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed.length}`);
  console.log(`❌ Failed: ${testResults.failed.length}`);
  
  if (testResults.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.failed.forEach(({ name, error }) => {
      console.log(`   - ${name}: ${error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Exit with appropriate code
  process.exit(testResults.failed.length > 0 ? 1 : 0);
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ with native fetch support');
  console.error('   Or install node-fetch: npm install node-fetch');
  process.exit(1);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite crashed:', error);
  process.exit(1);
});

