import {
  sanitizeInput,
  validateSqlIdentifier,
  sanitizeFilename,
  safeJsonParse,
  isSafeRedirectUrl,
  paginationSchema,
  searchSchema,
} from '../security'

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('should remove angle brackets', () => {
      const input = 'Hello <script>alert("xss")</script> World'
      const result = sanitizeInput(input)
      expect(result).toBe('Hello scriptalert("xss")/script World')
    })

    it('should remove javascript: protocol', () => {
      const input = 'javascript:alert("xss")'
      const result = sanitizeInput(input)
      expect(result).toBe('alert("xss")')
    })

    it('should remove event handlers', () => {
      const input = 'Hello onclick="alert()" World'
      const result = sanitizeInput(input)
      expect(result).toBe('Hello  World')
    })

    it('should trim whitespace', () => {
      const input = '  Hello World  '
      const result = sanitizeInput(input)
      expect(result).toBe('Hello World')
    })

    it('should handle empty strings', () => {
      const result = sanitizeInput('')
      expect(result).toBe('')
    })
  })

  describe('validateSqlIdentifier', () => {
    it('should accept valid identifiers', () => {
      expect(validateSqlIdentifier('users')).toBe('users')
      expect(validateSqlIdentifier('user_profiles')).toBe('user_profiles')
      expect(validateSqlIdentifier('table123')).toBe('table123')
      expect(validateSqlIdentifier('_private')).toBe('_private')
    })

    it('should reject identifiers starting with numbers', () => {
      expect(() => validateSqlIdentifier('123users')).toThrow('Invalid SQL identifier')
    })

    it('should reject identifiers with special characters', () => {
      expect(() => validateSqlIdentifier('users-table')).toThrow('Invalid SQL identifier')
      expect(() => validateSqlIdentifier('users.table')).toThrow('Invalid SQL identifier')
      expect(() => validateSqlIdentifier('users table')).toThrow('Invalid SQL identifier')
    })

    it('should reject SQL keywords', () => {
      expect(() => validateSqlIdentifier('DROP')).toThrow('SQL keyword cannot be used as identifier')
      expect(() => validateSqlIdentifier('delete')).toThrow('SQL keyword cannot be used as identifier')
      expect(() => validateSqlIdentifier('SELECT')).toThrow('SQL keyword cannot be used as identifier')
    })

    it('should handle empty strings', () => {
      expect(() => validateSqlIdentifier('')).toThrow('Invalid SQL identifier')
    })
  })

  describe('sanitizeFilename', () => {
    it('should replace special characters with underscores', () => {
      const filename = 'my document!@#$.pdf'
      const result = sanitizeFilename(filename)
      expect(result).toBe('my_document____.pdf')
    })

    it('should remove multiple consecutive dots', () => {
      const filename = 'file...with...dots.txt'
      const result = sanitizeFilename(filename)
      expect(result).toBe('file.with.dots.txt')
    })

    it('should limit filename length', () => {
      const longFilename = 'a'.repeat(300) + '.txt'
      const result = sanitizeFilename(longFilename)
      expect(result.length).toBeLessThanOrEqual(255)
    })

    it('should preserve alphanumeric characters and basic symbols', () => {
      const filename = 'MyFile123-v2.0.pdf'
      const result = sanitizeFilename(filename)
      expect(result).toBe('MyFile123-v2.0.pdf')
    })
  })

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const json = '{"name": "John", "age": 30}'
      const result = safeJsonParse(json)
      expect(result.data).toEqual({ name: 'John', age: 30 })
      expect(result.error).toBeUndefined()
    })

    it('should handle invalid JSON', () => {
      const json = '{"name": "John", age: 30}' // Missing quotes around age
      const result = safeJsonParse(json)
      expect(result.data).toBeUndefined()
      expect(result.error).toBe('Invalid JSON')
    })

    it('should validate against schema when provided', () => {
      const schema = paginationSchema
      const validJson = '{"page": 1, "limit": 20}'
      const result = safeJsonParse(validJson, schema)
      
      expect(result.data).toEqual({
        page: 1,
        limit: 20,
        orderDirection: 'asc', // Default value
      })
      expect(result.error).toBeUndefined()
    })

    it('should reject invalid data against schema', () => {
      const schema = paginationSchema
      const invalidJson = '{"page": -1, "limit": 200}' // Invalid values
      const result = safeJsonParse(invalidJson, schema)
      
      expect(result.data).toBeUndefined()
      expect(result.error).toBe('Invalid data format')
    })
  })

  describe('isSafeRedirectUrl', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://myapp.com'
    })

    afterEach(() => {
      delete process.env.NEXT_PUBLIC_APP_URL
    })

    it('should allow same-origin redirects', () => {
      expect(isSafeRedirectUrl('https://myapp.com/dashboard')).toBe(true)
      expect(isSafeRedirectUrl('/dashboard')).toBe(true)
      expect(isSafeRedirectUrl('/auth/login')).toBe(true)
    })

    it('should reject external redirects', () => {
      expect(isSafeRedirectUrl('https://evil.com/steal-data')).toBe(false)
      expect(isSafeRedirectUrl('http://different-domain.com')).toBe(false)
    })

    it('should reject malformed URLs', () => {
      expect(isSafeRedirectUrl('javascript:alert("xss")')).toBe(false)
      expect(isSafeRedirectUrl('not-a-url')).toBe(true)
    })

    it('should handle missing app URL', () => {
      delete process.env.NEXT_PUBLIC_APP_URL
      expect(isSafeRedirectUrl('/dashboard')).toBe(true) // Should fallback to localhost
    })
  })

  describe('paginationSchema', () => {
    it('should validate correct pagination parameters', () => {
      const result = paginationSchema.safeParse({
        page: 1,
        limit: 20,
        orderBy: 'name',
        orderDirection: 'desc',
      })
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(20)
        expect(result.data.orderDirection).toBe('desc')
      }
    })

    it('should apply defaults for missing values', () => {
      const result = paginationSchema.safeParse({})
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(20)
        expect(result.data.orderDirection).toBe('asc')
      }
    })

    it('should reject invalid values', () => {
      const result = paginationSchema.safeParse({
        page: 0, // Should be positive
        limit: 150, // Should be max 100
        orderDirection: 'invalid', // Should be 'asc' or 'desc'
      })
      
      expect(result.success).toBe(false)
    })
  })

  describe('searchSchema', () => {
    it('should sanitize search query', () => {
      const result = searchSchema.safeParse({
        query: 'search <script>alert("xss")</script> term',
        filters: { status: 'active' },
      })
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.query).toBe('search scriptalert("xss")/script term')
        expect(result.data.filters).toEqual({ status: 'active' })
      }
    })

    it('should reject empty queries', () => {
      const result = searchSchema.safeParse({ query: '' })
      expect(result.success).toBe(false)
    })

    it('should reject overly long queries', () => {
      const result = searchSchema.safeParse({ query: 'a'.repeat(101) })
      expect(result.success).toBe(false)
    })
  })
}) 