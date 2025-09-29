/**
 * Service Testing Script
 * Run this to test all services independently
 */

// Test Feature Flag Service
async function testFeatureFlagService() {
  console.log('🧪 Testing FeatureFlagService...');
  
  const FeatureFlagService = require('./src/services/FeatureFlagService').default;
  const service = new FeatureFlagService();
  
  try {
    await service.initialize();
    console.log('✅ FeatureFlagService initialized');
    
    // Test feature flag checks
    const leaderboardsEnabled = service.isFeatureEnabled('leaderboards');
    const socialFeaturesEnabled = service.isFeatureEnabled('social_features');
    
    console.log(`📊 Leaderboards enabled: ${leaderboardsEnabled}`);
    console.log(`📊 Social features enabled: ${socialFeaturesEnabled}`);
    
    // Get analytics
    const analytics = service.getFeatureFlagAnalytics();
    console.log('📈 Feature flag analytics:', analytics);
    
  } catch (error) {
    console.error('❌ FeatureFlagService test failed:', error);
  }
}

// Test Achievement Service
async function testAchievementService() {
  console.log('🧪 Testing AchievementService...');
  
  const AchievementService = require('./src/services/AchievementService').default;
  const service = new AchievementService();
  
  try {
    await service.initialize();
    console.log('✅ AchievementService initialized');
    
    // Get all achievements
    const achievements = service.getAllAchievements();
    console.log(`🏆 Total achievements: ${achievements.length}`);
    
    // Test achievement progress update
    const result = await service.updateAchievementProgress('FIRST_WORD', 1);
    if (result) {
      console.log('🎉 Achievement unlocked:', result.name);
    }
    
  } catch (error) {
    console.error('❌ AchievementService test failed:', error);
  }
}

// Test Reward Service
async function testRewardService() {
  console.log('🧪 Testing RewardService...');
  
  const RewardService = require('./src/services/RewardService').default;
  const service = new RewardService();
  
  try {
    await service.initialize();
    console.log('✅ RewardService initialized');
    
    // Check daily reward status
    const dailyRewardStatus = await service.getDailyRewardStatus();
    console.log('🎁 Daily reward status:', dailyRewardStatus);
    
    // Check milestone rewards
    const milestoneRewards = await service.getClaimableMilestoneRewards(5);
    console.log(`🎯 Claimable milestone rewards for level 5: ${milestoneRewards.length}`);
    
  } catch (error) {
    console.error('❌ RewardService test failed:', error);
  }
}

// Test Analytics Service
async function testAnalyticsService() {
  console.log('🧪 Testing AnalyticsService...');
  
  const AnalyticsService = require('./src/services/AnalyticsService').default;
  const service = new AnalyticsService();
  
  try {
    await service.initialize();
    console.log('✅ AnalyticsService initialized');
    
    // Set user properties
    service.setUserProperties({
      platform: 'test',
      appVersion: '1.0.0'
    });
    
    // Track some events
    service.trackGameStart('SINGLE', 'normal');
    service.trackPuzzleComplete({
      id: 'test-puzzle-1',
      word: 'TEST',
      timeToComplete: 15000,
      hintsUsed: 0,
      difficulty: 'normal',
      score: 100
    });
    service.trackGameEnd('SINGLE', 500, 60000, 5);
    
    // Get statistics
    const stats = service.getEventStatistics();
    console.log('📊 Analytics statistics:', stats);
    
  } catch (error) {
    console.error('❌ AnalyticsService test failed:', error);
  }
}

// Test Performance Service
async function testPerformanceService() {
  console.log('🧪 Testing PerformanceService...');
  
  const PerformanceService = require('./src/services/PerformanceService').default;
  const service = new PerformanceService();
  
  try {
    await service.initialize();
    console.log('✅ PerformanceService initialized');
    
    // Record some metrics
    service.recordMetric('renderTime', 16);
    service.recordMetric('memoryUsage', 50 * 1024 * 1024);
    service.recordMetric('networkLatency', 200);
    
    // Get performance report
    const report = service.getPerformanceReport();
    console.log('⚡ Performance report:', {
      recommendations: report.recommendations.length,
      averageRenderTime: service.getAverageMetric('renderTime'),
      averageMemoryUsage: Math.round(service.getAverageMetric('memoryUsage') / 1024 / 1024) + 'MB'
    });
    
  } catch (error) {
    console.error('❌ PerformanceService test failed:', error);
  }
}

// Test Integration Service
async function testIntegrationService() {
  console.log('🧪 Testing IntegrationService...');
  
  const IntegrationService = require('./src/services/IntegrationService').default;
  const service = new IntegrationService();
  
  try {
    const success = await service.initialize();
    console.log(`✅ IntegrationService initialization: ${success ? 'SUCCESS' : 'FAILED'}`);
    
    if (success) {
      // Get service statuses
      const statuses = service.getAllServiceStatuses();
      console.log('🔧 Service statuses:', statuses);
      
      // Get health report
      const healthReport = service.getIntegrationHealthReport();
      console.log('🏥 Health report:', {
        overallHealth: healthReport.overallHealth,
        healthyServices: Object.values(statuses).filter(s => s === 'initialized').length,
        totalServices: Object.keys(statuses).length
      });
    }
    
  } catch (error) {
    console.error('❌ IntegrationService test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting ChainLink Service Tests...\n');
  
  await testFeatureFlagService();
  console.log('');
  
  await testAchievementService();
  console.log('');
  
  await testRewardService();
  console.log('');
  
  await testAnalyticsService();
  console.log('');
  
  await testPerformanceService();
  console.log('');
  
  await testIntegrationService();
  console.log('');
  
  console.log('🎉 All tests completed!');
}

// Export for use in other files
module.exports = {
  testFeatureFlagService,
  testAchievementService,
  testRewardService,
  testAnalyticsService,
  testPerformanceService,
  testIntegrationService,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
