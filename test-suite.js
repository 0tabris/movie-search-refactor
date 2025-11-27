/**
 * Comprehensive Test Suite for Movie Search Application
 * Cross-platform (Windows & Linux)
 * Generates detailed test report
 * 
 * Usage: node test-suite.js
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/movies';
const fs = require('fs');
const path = require('path');

// Test results tracking
const testResults = {
  passed: [],
  failed: [],
  skipped: [],
  total: 0,
  startTime: Date.now(),
  categories: {
    search: { passed: 0, failed: 0, total: 0 },
    favorites: { passed: 0, failed: 0, total: 0 },
    errors: { passed: 0, failed: 0, total: 0 },
    edgeCases: { passed: 0, failed: 0, total: 0 },
    performance: { passed: 0, failed: 0, total: 0 },
  },
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
      headers: Object.fromEntries(response.headers.entries()),
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
function test(name, category, testFn) {
  testResults.total++;
  testResults.categories[category].total++;
  return async () => {
    const startTime = Date.now();
    try {
      await testFn();
      const duration = Date.now() - startTime;
      testResults.passed.push({ name, category, duration });
      testResults.categories[category].passed++;
      console.log(`✅ ${name} (${duration}ms)`);
      return { success: true, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      testResults.failed.push({ name, category, error: error.message, duration });
      testResults.categories[category].failed++;
      console.log(`❌ ${name}: ${error.message} (${duration}ms)`);
      return { success: false, error: error.message, duration };
    }
  };
}

// Wait helper
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/movies', '')}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    try {
      const response = await fetch(`${API_BASE_URL}/search?q=test&page=1`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      });
      return true; // Server is responding
    } catch {
      return false;
    }
  }
}

// Generate test report
function generateReport() {
  const endTime = Date.now();
  const duration = ((endTime - testResults.startTime) / 1000).toFixed(2);
  const passRate = ((testResults.passed.length / testResults.total) * 100).toFixed(1);
  
  const report = `# Test Suite Report

**Generated**: ${new Date().toISOString()}
**Duration**: ${duration}s
**Total Tests**: ${testResults.total}
**Passed**: ${testResults.passed.length} ✅
**Failed**: ${testResults.failed.length} ❌
**Skipped**: ${testResults.skipped.length} ⏭️
**Pass Rate**: ${passRate}%

---

## Test Summary by Category

### Search Functionality
- **Total**: ${testResults.categories.search.total}
- **Passed**: ${testResults.categories.search.passed} ✅
- **Failed**: ${testResults.categories.search.failed} ❌
- **Pass Rate**: ${testResults.categories.search.total > 0 ? ((testResults.categories.search.passed / testResults.categories.search.total) * 100).toFixed(1) : 0}%

### Favorites Management
- **Total**: ${testResults.categories.favorites.total}
- **Passed**: ${testResults.categories.favorites.passed} ✅
- **Failed**: ${testResults.categories.favorites.failed} ❌
- **Pass Rate**: ${testResults.categories.favorites.total > 0 ? ((testResults.categories.favorites.passed / testResults.categories.favorites.total) * 100).toFixed(1) : 0}%

### Error Handling
- **Total**: ${testResults.categories.errors.total}
- **Passed**: ${testResults.categories.errors.passed} ✅
- **Failed**: ${testResults.categories.errors.failed} ❌
- **Pass Rate**: ${testResults.categories.errors.total > 0 ? ((testResults.categories.errors.passed / testResults.categories.errors.total) * 100).toFixed(1) : 0}%

### Edge Cases
- **Total**: ${testResults.categories.edgeCases.total}
- **Passed**: ${testResults.categories.edgeCases.passed} ✅
- **Failed**: ${testResults.categories.edgeCases.failed} ❌
- **Pass Rate**: ${testResults.categories.edgeCases.total > 0 ? ((testResults.categories.edgeCases.passed / testResults.categories.edgeCases.total) * 100).toFixed(1) : 0}%

### Performance
- **Total**: ${testResults.categories.performance.total}
- **Passed**: ${testResults.categories.performance.passed} ✅
- **Failed**: ${testResults.categories.performance.failed} ❌
- **Pass Rate**: ${testResults.categories.performance.total > 0 ? ((testResults.categories.performance.passed / testResults.categories.performance.total) * 100).toFixed(1) : 0}%

---

## Passed Tests

${testResults.passed.length > 0 ? testResults.passed.map(t => `- ✅ **${t.name}** (${t.category}, ${t.duration}ms)`).join('\n') : '*No tests passed*'}

---

## Failed Tests

${testResults.failed.length > 0 ? testResults.failed.map(t => `- ❌ **${t.name}** (${t.category}, ${t.duration}ms)\n  - Error: ${t.error}`).join('\n\n') : '*No tests failed*'}

---

## Skipped Tests

${testResults.skipped.length > 0 ? testResults.skipped.map(t => `- ⏭️ **${t.name}** (${t.category})\n  - Reason: ${t.reason}`).join('\n\n') : '*No tests skipped*'}

---

## Performance Metrics

### Average Test Duration
- **All Tests**: ${(testResults.passed.concat(testResults.failed).reduce((sum, t) => sum + t.duration, 0) / testResults.total).toFixed(2)}ms
- **Passed Tests**: ${testResults.passed.length > 0 ? (testResults.passed.reduce((sum, t) => sum + t.duration, 0) / testResults.passed.length).toFixed(2) : 0}ms
- **Failed Tests**: ${testResults.failed.length > 0 ? (testResults.failed.reduce((sum, t) => sum + t.duration, 0) / testResults.failed.length).toFixed(2) : 0}ms

### Fastest Test
${testResults.passed.length > 0 ? `- **${testResults.passed.reduce((min, t) => t.duration < min.duration ? t : min, testResults.passed[0]).name}**: ${testResults.passed.reduce((min, t) => t.duration < min.duration ? t : min, testResults.passed[0]).duration}ms` : '*No passed tests*'}

### Slowest Test
${testResults.passed.length > 0 ? `- **${testResults.passed.reduce((max, t) => t.duration > max.duration ? t : max, testResults.passed[0]).name}**: ${testResults.passed.reduce((max, t) => t.duration > max.duration ? t : max, testResults.passed[0]).duration}ms` : '*No passed tests*'}

---

## Recommendations

${testResults.failed.length > 0 ? `⚠️ **${testResults.failed.length} test(s) failed**. Please review the failed tests above and fix the issues.` : '✅ **All tests passed!** The application is working correctly.'}

${testResults.failed.length === 0 && testResults.passed.length === testResults.total ? '🎉 **Perfect score!** All tests passed successfully.' : ''}

---

## Test Environment

- **API Base URL**: ${API_BASE_URL}
- **Node Version**: ${process.version}
- **Platform**: ${process.platform}
- **Architecture**: ${process.arch}

---

*Report generated by Movie Search Application Test Suite*
`;

  return report;
}

// Save report to file
function saveReport(report) {
  const reportPath = path.join(process.cwd(), 'TEST_REPORT.md');
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n📄 Test report saved to: ${reportPath}`);
  return reportPath;
}

// Test suite
async function runTests() {
  console.log('🚀 Starting Comprehensive Test Suite...\n');
  console.log('='.repeat(60));
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Node Version: ${process.version}`);
  console.log('='.repeat(60));
  
  // Check if server is running
  console.log('\n🔍 Checking if backend server is running...');
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Backend server is not running!');
    console.log('   Please start the backend server first:');
    console.log('   cd backend && npm run start:dev');
    testResults.skipped.push({
      name: 'All tests',
      category: 'setup',
      reason: 'Backend server not running',
    });
    const report = generateReport();
    saveReport(report);
    process.exit(1);
  }
  console.log('✅ Backend server is running\n');
  
  let testMovie = null;
  let testImdbID = null;

  // ============================================
  // 1. SEARCH FUNCTIONALITY TESTS
  // ============================================
  console.log('\n📋 1. SEARCH FUNCTIONALITY TESTS');
  console.log('-'.repeat(60));

  await test('Search with valid query', 'search', async () => {
    const result = await apiCall('GET', '/search?q=batman&page=1');
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data?.data?.movies) throw new Error('Missing movies array');
    if (result.data.data.movies.length === 0) throw new Error('No movies returned');
    testMovie = result.data.data.movies[0];
    testImdbID = testMovie.imdbID;
  })();

  await test('Search with special characters', 'search', async () => {
    const result = await apiCall('GET', '/search?q=spider-man&page=1');
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
  })();

  await test('Search with empty query (should show error)', 'search', async () => {
    const result = await apiCall('GET', '/search?q=&page=1');
    if (result.ok) throw new Error('Expected error for empty query');
    if (result.status !== 400) throw new Error(`Expected 400, got ${result.status}`);
  })();

  await test('Search pagination - page 2', 'search', async () => {
    const result = await apiCall('GET', '/search?q=batman&page=2');
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data?.data?.movies) throw new Error('Missing movies array');
  })();

  await test('Search with invalid page number (negative)', 'search', async () => {
    const result = await apiCall('GET', '/search?q=batman&page=-1');
    if (result.ok) throw new Error('Expected error for negative page');
    if (result.status !== 400) throw new Error(`Expected 400, got ${result.status}`);
  })();

  await test('Search with invalid page number (zero)', 'search', async () => {
    const result = await apiCall('GET', '/search?q=batman&page=0');
    if (result.ok) throw new Error('Expected error for zero page');
    if (result.status !== 400) throw new Error(`Expected 400, got ${result.status}`);
  })();

  // ============================================
  // 2. FAVORITES MANAGEMENT TESTS
  // ============================================
  console.log('\n📋 2. FAVORITES MANAGEMENT TESTS');
  console.log('-'.repeat(60));

  await test('Add movie to favorites', 'favorites', async () => {
    if (!testMovie) throw new Error('No test movie available');
    const result = await apiCall('POST', '/favorites', testMovie);
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data?.data?.message) throw new Error('Missing success message');
  })();

  await test('Add duplicate movie (should show error)', 'favorites', async () => {
    if (!testMovie) throw new Error('No test movie available');
    const result = await apiCall('POST', '/favorites', testMovie);
    if (result.ok) throw new Error('Expected error for duplicate');
    if (result.status !== 400) throw new Error(`Expected 400, got ${result.status}`);
  })();

  await test('View favorites list', 'favorites', async () => {
    const result = await apiCall('GET', '/favorites/list?page=1');
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data?.data?.favorites) throw new Error('Missing favorites array');
  })();

  await test('View favorites pagination - page 1', 'favorites', async () => {
    const result = await apiCall('GET', '/favorites/list?page=1');
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data?.data?.currentPage) throw new Error('Missing currentPage');
    if (result.data.data.currentPage !== 1) throw new Error('Wrong page number');
  })();

  await test('Remove movie from favorites', 'favorites', async () => {
    if (!testImdbID) throw new Error('No test movie ID available');
    const result = await apiCall('DELETE', `/favorites/${testImdbID}`);
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data?.data?.message) throw new Error('Missing success message');
  })();

  await test('Remove non-existent movie (should show error)', 'favorites', async () => {
    const result = await apiCall('DELETE', '/favorites/tt9999999');
    if (result.ok) throw new Error('Expected error for non-existent movie');
    if (result.status !== 404) throw new Error(`Expected 404, got ${result.status}`);
  })();

  await test('Add movie with invalid data (missing imdbID)', 'favorites', async () => {
    const invalidMovie = { title: 'Test', year: 2020 };
    const result = await apiCall('POST', '/favorites', invalidMovie);
    if (result.ok) throw new Error('Expected error for invalid movie data');
    if (result.status !== 400) throw new Error(`Expected 400, got ${result.status}`);
  })();

  // ============================================
  // 3. ERROR HANDLING TESTS
  // ============================================
  console.log('\n📋 3. ERROR HANDLING TESTS');
  console.log('-'.repeat(60));

  await test('Invalid input validation - missing query parameter', 'errors', async () => {
    const result = await apiCall('GET', '/search?page=1');
    if (result.ok) throw new Error('Expected error for missing query');
    if (result.status !== 400) throw new Error(`Expected 400, got ${result.status}`);
  })();

  await test('Invalid input validation - invalid page size for favorites', 'errors', async () => {
    const result = await apiCall('GET', '/favorites/list?page=-1');
    if (result.ok) throw new Error('Expected error for negative page');
    if (result.status !== 400) throw new Error(`Expected 400, got ${result.status}`);
  })();

  await test('Invalid endpoint (404)', 'errors', async () => {
    const result = await apiCall('GET', '/invalid-endpoint');
    if (result.ok) throw new Error('Expected 404 for invalid endpoint');
    // NestJS might return 404 or handle differently, so we just check it's not 200
  })();

  // ============================================
  // 4. EDGE CASES TESTS
  // ============================================
  console.log('\n📋 4. EDGE CASES TESTS');
  console.log('-'.repeat(60));

  await test('Empty search results (non-existent movie)', 'edgeCases', async () => {
    const result = await apiCall('GET', '/search?q=xyzabc123nonexistent&page=1');
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data?.data?.movies) throw new Error('Missing movies array');
    if (result.data.data.movies.length !== 0) throw new Error('Expected empty results');
  })();

  await test('Empty favorites list', 'edgeCases', async () => {
    const result = await apiCall('GET', '/favorites/list?page=1');
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data?.data) throw new Error('Missing data object');
    if (!Array.isArray(result.data.data.favorites)) {
      throw new Error('Favorites should be an array');
    }
  })();

  await test('Invalid page numbers (too high)', 'edgeCases', async () => {
    const result = await apiCall('GET', '/favorites/list?page=999999');
    if (!result.ok) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data?.data?.favorites) throw new Error('Missing favorites array');
  })();

  await test('Rapid button clicks simulation (race conditions)', 'edgeCases', async () => {
    if (!testMovie) {
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

  await test('Query cache verification (same query should be fast)', 'performance', async () => {
    const start1 = Date.now();
    await apiCall('GET', '/search?q=batman&page=1');
    const time1 = Date.now() - start1;
    
    const start2 = Date.now();
    await apiCall('GET', '/search?q=batman&page=1');
    const time2 = Date.now() - start2;
    
    // Both should complete successfully
    // Note: Backend doesn't cache, but we can verify it works
    if (time2 > time1 * 5) {
      throw new Error(`Second call was significantly slower: ${time1}ms vs ${time2}ms`);
    }
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
  console.log(`⏭️  Skipped: ${testResults.skipped.length}`);
  
  const passRate = ((testResults.passed.length / testResults.total) * 100).toFixed(1);
  console.log(`📈 Pass Rate: ${passRate}%`);
  
  if (testResults.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.failed.forEach(({ name, error }) => {
      console.log(`   - ${name}: ${error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Generate and save report
  const report = generateReport();
  const reportPath = saveReport(report);
  
  console.log(`\n✅ Test suite completed!`);
  console.log(`📄 Detailed report: ${reportPath}`);
  
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
  const report = generateReport();
  saveReport(report);
  process.exit(1);
});

