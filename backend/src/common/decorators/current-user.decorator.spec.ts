import { ROLES_KEY, Roles } from './roles.decorator';

describe('decorators', () => {
  describe('Roles', () => {
    it('creates metadata setter with given roles', () => {
      const target = Roles('admin', 'buyer');
      expect(target).toBeDefined();
      expect(ROLES_KEY).toBe('roles');
    });
  });

  describe('CurrentUser', () => {
    it('exports a param decorator factory', () => {
      // Importing has side effects; this just ensures import works
      const mod = require('./current-user.decorator');
      expect(mod.CurrentUser).toBeDefined();
      expect(typeof mod.CurrentUser).toBe('function');
    });
  });
});
