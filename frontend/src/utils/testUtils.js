import { Alert } from 'react-native';

export const TestResults = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  WARNING: 'WARNING'
};

export class EyeTrackingTester {
  constructor() {
    this.results = [];
    this.currentScenario = null;
  }

  startTest(scenario) {
    this.currentScenario = scenario;
    this.results = [];
    console.log(`Starting test scenario: ${scenario.name}`);
  }

  recordResult(metric, value, expected) {
    const result = {
      metric,
      value,
      expected,
      timestamp: new Date().toISOString(),
      status: this.evaluateResult(value, expected)
    };
    
    this.results.push(result);
    return result;
  }

  evaluateResult(value, expected) {
    const threshold = 0.1; // 10% margin of error
    const difference = Math.abs(value - expected) / expected;
    
    if (difference <= threshold) {
      return TestResults.PASS;
    } else if (difference <= threshold * 2) {
      return TestResults.WARNING;
    } else {
      return TestResults.FAIL;
    }
  }

  getTestSummary() {
    const summary = {
      scenario: this.currentScenario.name,
      totalTests: this.results.length,
      passed: this.results.filter(r => r.status === TestResults.PASS).length,
      warnings: this.results.filter(r => r.status === TestResults.WARNING).length,
      failed: this.results.filter(r => r.status === TestResults.FAIL).length,
      details: this.results
    };

    return summary;
  }

  showTestResults() {
    const summary = this.getTestSummary();
    Alert.alert(
      'Test Results',
      `Scenario: ${summary.scenario}\n` +
      `Total Tests: ${summary.totalTests}\n` +
      `Passed: ${summary.passed}\n` +
      `Warnings: ${summary.warnings}\n` +
      `Failed: ${summary.failed}`
    );
  }
} 