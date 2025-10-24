const CSVParser = require('../../src/utils/csvParser');

describe('CSVParser', () => {
  describe('parseCSVLine', () => {
    test('should parse simple comma-separated values', () => {
      const result = CSVParser.parseCSVLine('John,Doe,30');
      expect(result).toEqual(['John', 'Doe', '30']);
    });

    test('should handle quoted values with commas', () => {
      const result = CSVParser.parseCSVLine('"123 Main St, Apt 4","New York",30');
      expect(result).toEqual(['123 Main St, Apt 4', 'New York', '30']);
    });

    test('should handle escaped quotes', () => {
      const result = CSVParser.parseCSVLine('"He said ""Hello""",World');
      expect(result).toEqual(['He said "Hello"', 'World']);
    });

    test('should trim whitespace', () => {
      const result = CSVParser.parseCSVLine(' John , Doe , 30 ');
      expect(result).toEqual(['John', 'Doe', '30']);
    });
  });

  describe('parse', () => {
    test('should parse valid CSV with headers', () => {
      const csv = 'name.firstName,name.lastName,age\nJohn,Doe,30';
      const result = CSVParser.parse(csv);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: { firstName: 'John', lastName: 'Doe' },
        age: '30',
      });
    });

    test('should handle nested properties', () => {
      const csv =
        'name.firstName,address.city,address.state\nJohn,Boston,MA';
      const result = CSVParser.parse(csv);
      expect(result[0]).toEqual({
        name: { firstName: 'John' },
        address: { city: 'Boston', state: 'MA' },
      });
    });

    test('should throw error for empty CSV', () => {
      expect(() => CSVParser.parse('')).toThrow();
    });

    test('should throw error for mismatched column count', () => {
      const csv = 'name.firstName,name.lastName,age\nJohn,Doe,30,Extra';
      expect(() => CSVParser.parse(csv)).toThrow();
    });
  });

  describe('validateMandatoryFields', () => {
    test('should pass validation with all mandatory fields', () => {
      const records = [
        {
          name: { firstName: 'John', lastName: 'Doe' },
          age: '30',
        },
      ];
      expect(() => CSVParser.validateMandatoryFields(records)).not.toThrow();
    });

    test('should throw error if firstName is missing', () => {
      const records = [
        {
          name: { lastName: 'Doe' },
          age: '30',
        },
      ];
      expect(() => CSVParser.validateMandatoryFields(records)).toThrow();
    });

    test('should throw error if age is missing', () => {
      const records = [
        {
          name: { firstName: 'John', lastName: 'Doe' },
        },
      ];
      expect(() => CSVParser.validateMandatoryFields(records)).toThrow();
    });

    test('should throw error if age is not numeric', () => {
      const records = [
        {
          name: { firstName: 'John', lastName: 'Doe' },
          age: 'abc',
        },
      ];
      expect(() => CSVParser.validateMandatoryFields(records)).toThrow();
    });
  });
});
