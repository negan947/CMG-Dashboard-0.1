import { 
  camelToSnake, 
  snakeToCamel, 
  snakeToCamelObject, 
  camelToSnakeObject,
  mapDbRow
} from '../data-mapper';

describe('Data Mapper Utility', () => {
  describe('camelToSnake', () => {
    it('should convert camelCase to snake_case', () => {
      expect(camelToSnake('helloWorld')).toBe('hello_world');
      expect(camelToSnake('firstName')).toBe('first_name');
      expect(camelToSnake('personID')).toBe('person_id');
    });

    it('should handle single word', () => {
      expect(camelToSnake('hello')).toBe('hello');
      expect(camelToSnake('test')).toBe('test');
    });

    it('should handle already snake_case strings', () => {
      expect(camelToSnake('hello_world')).toBe('hello_world');
    });
  });

  describe('snakeToCamel', () => {
    it('should convert snake_case to camelCase', () => {
      expect(snakeToCamel('hello_world')).toBe('helloWorld');
      expect(snakeToCamel('first_name')).toBe('firstName');
      expect(snakeToCamel('person_id')).toBe('personId');
    });

    it('should handle single word', () => {
      expect(snakeToCamel('hello')).toBe('hello');
      expect(snakeToCamel('test')).toBe('test');
    });

    it('should handle already camelCase strings', () => {
      expect(snakeToCamel('helloWorld')).toBe('helloWorld');
    });
  });

  describe('snakeToCamelObject', () => {
    it('should convert all object keys from snake_case to camelCase', () => {
      const snakeCaseObj = {
        first_name: 'John',
        last_name: 'Doe',
        contact_info: {
          email_address: 'john@example.com',
          phone_number: '123456789'
        },
        addresses: [
          { street_name: 'Main St', house_number: 123 },
          { street_name: 'Side St', house_number: 456 }
        ]
      };

      const expected = {
        firstName: 'John',
        lastName: 'Doe',
        contactInfo: {
          emailAddress: 'john@example.com',
          phoneNumber: '123456789'
        },
        addresses: [
          { streetName: 'Main St', houseNumber: 123 },
          { streetName: 'Side St', houseNumber: 456 }
        ]
      };

      expect(snakeToCamelObject(snakeCaseObj)).toEqual(expected);
    });

    it('should handle empty objects and arrays', () => {
      expect(snakeToCamelObject({})).toEqual({});
      expect(snakeToCamelObject([])).toEqual([]);
      expect(snakeToCamelObject({ empty_array: [] })).toEqual({ emptyArray: [] });
    });

    it('should handle null and undefined values', () => {
      expect(snakeToCamelObject({ null_value: null })).toEqual({ nullValue: null });
      expect(snakeToCamelObject({ undefined_value: undefined })).toEqual({ undefinedValue: undefined });
    });
  });

  describe('camelToSnakeObject', () => {
    it('should convert all object keys from camelCase to snake_case', () => {
      const camelCaseObj = {
        firstName: 'John',
        lastName: 'Doe',
        contactInfo: {
          emailAddress: 'john@example.com',
          phoneNumber: '123456789'
        },
        addresses: [
          { streetName: 'Main St', houseNumber: 123 },
          { streetName: 'Side St', houseNumber: 456 }
        ]
      };

      const expected = {
        first_name: 'John',
        last_name: 'Doe',
        contact_info: {
          email_address: 'john@example.com',
          phone_number: '123456789'
        },
        addresses: [
          { street_name: 'Main St', house_number: 123 },
          { street_name: 'Side St', house_number: 456 }
        ]
      };

      expect(camelToSnakeObject(camelCaseObj)).toEqual(expected);
    });

    it('should handle empty objects and arrays', () => {
      expect(camelToSnakeObject({})).toEqual({});
      expect(camelToSnakeObject([])).toEqual([]);
      expect(camelToSnakeObject({ emptyArray: [] })).toEqual({ empty_array: [] });
    });

    it('should handle null and undefined values', () => {
      expect(camelToSnakeObject({ nullValue: null })).toEqual({ null_value: null });
      expect(camelToSnakeObject({ undefinedValue: undefined })).toEqual({ undefined_value: undefined });
    });
  });

  describe('mapDbRow', () => {
    it('should map a database row to a model with camelCase keys', () => {
      const dbRow = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john@example.com',
        created_at: new Date('2023-01-01')
      };

      const result = mapDbRow(dbRow);
      
      expect(result).toEqual({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.com',
        createdAt: dbRow.created_at
      });
    });

    it('should handle nested objects', () => {
      const dbRow = {
        id: 1,
        user_data: {
          full_name: 'John Doe',
          address_info: {
            street_name: 'Main St'
          }
        }
      };

      const result = mapDbRow(dbRow);
      
      expect(result).toEqual({
        id: 1,
        userData: {
          fullName: 'John Doe',
          addressInfo: {
            streetName: 'Main St'
          }
        }
      });
    });

    it('should handle arrays', () => {
      const dbRow = {
        id: 1,
        contact_methods: [
          { contact_type: 'email', contact_value: 'john@example.com' },
          { contact_type: 'phone', contact_value: '123456789' }
        ]
      };

      const result = mapDbRow(dbRow);
      
      expect(result).toEqual({
        id: 1,
        contactMethods: [
          { contactType: 'email', contactValue: 'john@example.com' },
          { contactType: 'phone', contactValue: '123456789' }
        ]
      });
    });
  });
}); 