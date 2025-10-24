const AgeDistribution = require('../../src/utils/ageDistribution');

describe('AgeDistribution', () => {
  describe('calculate', () => {
    test('should calculate age distribution correctly', () => {
      const records = [
        { age: 15 },
        { age: 25 },
        { age: 35 },
        { age: 45 },
        { age: 55 },
        { age: 65 },
      ];
      const result = AgeDistribution.calculate(records);

      expect(result.totalRecords).toBe(6);
      expect(result.distributions.lessThan20.count).toBe(1);
      expect(result.distributions.from20to40.count).toBe(2);
      expect(result.distributions.from40to60.count).toBe(2);
      expect(result.distributions.greaterThan60.count).toBe(1);
    });

    test('should calculate percentages correctly', () => {
      const records = [
        { age: 15 },
        { age: 25 },
        { age: 35 },
        { age: 45 },
      ];
      const result = AgeDistribution.calculate(records);

      expect(parseFloat(result.distributions.lessThan20.percentage)).toBe(25);
      expect(parseFloat(result.distributions.from20to40.percentage)).toBe(50);
      expect(parseFloat(result.distributions.from40to60.percentage)).toBe(25);
    });

    test('should handle empty records array', () => {
      const result = AgeDistribution.calculate([]);

      expect(result.totalRecords).toBe(0);
      expect(result.distributions.lessThan20.count).toBe(0);
      expect(result.distributions.from20to40.count).toBe(0);
    });

    test('should handle boundary ages', () => {
      const records = [
        { age: 19 }, // < 20
        { age: 20 }, // >= 20
        { age: 39 }, // < 40
        { age: 40 }, // >= 40
        { age: 59 }, // < 60
        { age: 60 }, // >= 60
      ];
      const result = AgeDistribution.calculate(records);

      expect(result.distributions.lessThan20.count).toBe(1); // 19
      expect(result.distributions.from20to40.count).toBe(2); // 20, 39
      expect(result.distributions.from40to60.count).toBe(2); // 40, 59
      expect(result.distributions.greaterThan60.count).toBe(1); // 60
    });
  });
});
