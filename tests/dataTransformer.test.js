const DataTransformer = require('../../src/utils/dataTransformer');

describe('DataTransformer', () => {
  describe('transformRecord', () => {
    test('should transform record with mandatory fields only', () => {
      const record = {
        name: { firstName: 'John', lastName: 'Doe' },
        age: '30',
      };
      const result = DataTransformer.transformRecord(record);

      expect(result).toEqual({
        name: 'John Doe',
        age: 30,
        address: null,
        additional_info: null,
      });
    });

    test('should separate address fields', () => {
      const record = {
        name: { firstName: 'John', lastName: 'Doe' },
        age: '30',
        address: {
          line1: '123 Main St',
          city: 'Boston',
          state: 'MA',
        },
      };
      const result = DataTransformer.transformRecord(record);

      expect(result.address).toEqual({
        line1: '123 Main St',
        city: 'Boston',
        state: 'MA',
      });
    });

    test('should collect additional fields', () => {
      const record = {
        name: { firstName: 'John', lastName: 'Doe' },
        age: '30',
        gender: 'male',
        department: 'Engineering',
      };
      const result = DataTransformer.transformRecord(record);

      expect(result.additional_info).toEqual({
        gender: 'male',
        department: 'Engineering',
      });
    });

    test('should handle complex nested additional fields', () => {
      const record = {
        name: { firstName: 'John', lastName: 'Doe' },
        age: '30',
        contact: {
          email: 'john@example.com',
          phone: '555-1234',
        },
      };
      const result = DataTransformer.transformRecord(record);

      expect(result.additional_info).toEqual({
        contact: {
          email: 'john@example.com',
          phone: '555-1234',
        },
      });
    });
  });

  describe('transformRecords', () => {
    test('should transform array of records', () => {
      const records = [
        {
          name: { firstName: 'John', lastName: 'Doe' },
          age: '30',
        },
        {
          name: { firstName: 'Jane', lastName: 'Smith' },
          age: '25',
        },
      ];
      const result = DataTransformer.transformRecords(records);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('John Doe');
      expect(result[1].name).toBe('Jane Smith');
    });
  });
});
