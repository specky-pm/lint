import fs from 'fs-extra';
import path from 'path';
import {ConfigManager, defaultConfig} from '../../src/core/config';
import {LinterConfig} from '../../src/types';

// Mock fs-extra
jest.mock('fs-extra');

describe('ConfigManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadConfig', () => {
    it('should return default config when no config path is provided', async () => {
      const config = await ConfigManager.loadConfig();

      expect(config).toEqual({
        ...defaultConfig,
        rootDir: process.cwd() // Default is current working directory
      });
    });

    it('should override rootDir when provided', async () => {
      const rootDir = '/custom/root/dir';
      const config = await ConfigManager.loadConfig(undefined, rootDir);

      expect(config.rootDir).toBe(rootDir);
    });

    it('should load config from file when path is provided', async () => {
      const configPath = 'specky-lint.config.json';
      const fileConfig = {
        ignorePatterns: ['custom-ignore/**'],
        rules: {
          'base/missing-required-field': 'warning'
        }
      };

      // Mock fs.readFile to return our test config
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(fileConfig));

      const config = await ConfigManager.loadConfig(configPath);

      expect(fs.readFile).toHaveBeenCalledWith(configPath, 'utf8');
      expect(config).toEqual({
        ...defaultConfig,
        ...fileConfig,
        ignorePatterns: [...defaultConfig.ignorePatterns!, ...fileConfig.ignorePatterns],
        rules: {
          ...defaultConfig.rules,
          ...fileConfig.rules
        }
      });
    });

    it('should handle file read errors and use default config', async () => {
      const configPath = 'non-existent-config.json';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock fs.readFile to throw an error
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));

      const config = await ConfigManager.loadConfig(configPath);

      expect(consoleSpy).toHaveBeenCalled();
      expect(config).toEqual(defaultConfig);

      consoleSpy.mockRestore();
    });

    it('should override config with CLI options', async () => {
      const cliOptions: Partial<LinterConfig> = {
        rules: {
          'spec-json/invalid-json-syntax': 'warning'
        }
      };

      const config = await ConfigManager.loadConfig(undefined, undefined, cliOptions);

      expect(config).toEqual({
        ...defaultConfig,
        ...cliOptions,
        rules: {
          ...defaultConfig.rules,
          ...cliOptions.rules
        }
      });
    });

    it('should apply config file then CLI options in correct order', async () => {
      const configPath = 'specky-lint.config.json';
      const fileConfig = {
        rules: {
          'base/missing-required-field': 'warning',
          'spec-json/invalid-json-syntax': 'off'
        }
      };
      const cliOptions: Partial<LinterConfig> = {
        rules: {
          'spec-json/invalid-json-syntax': 'error' // This should override the file config
        }
      };

      // Mock fs.readFile to return our test config
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(fileConfig));

      const config = await ConfigManager.loadConfig(configPath, undefined, cliOptions);

      expect(config.rules!['base/missing-required-field']).toBe('warning'); // From file config
      expect(config.rules!['spec-json/invalid-json-syntax']).toBe('error'); // From CLI options (overrides file config)
    });
  });

  describe('resolvePath', () => {
    it('should return absolute path unchanged', () => {
      const config: LinterConfig = {
        rootDir: '/root/dir'
      };
      const absolutePath = '/absolute/path/to/file.json';

      expect(ConfigManager.resolvePath(config, absolutePath)).toBe(absolutePath);
    });

    it('should resolve relative path against rootDir', () => {
      const config: LinterConfig = {
        rootDir: '/root/dir'
      };
      const relativePath = 'relative/path/to/file.json';

      expect(ConfigManager.resolvePath(config, relativePath)).toBe(
        path.resolve('/root/dir', relativePath)
      );
    });
  });

  describe('shouldIgnoreFile', () => {
    it('should return false when no ignore patterns are configured', () => {
      const config: LinterConfig = {
        rootDir: '/root/dir'
      };

      expect(ConfigManager.shouldIgnoreFile(config, '/root/dir/file.json')).toBe(false);
    });

    it('should return false when file does not match any ignore pattern', () => {
      const config: LinterConfig = {
        rootDir: '/root/dir',
        ignorePatterns: ['node_modules/**', 'dist/**']
      };

      expect(ConfigManager.shouldIgnoreFile(config, '/root/dir/src/file.json')).toBe(false);
    });

    it('should return true when file matches an ignore pattern', () => {
      const config: LinterConfig = {
        rootDir: '/root/dir',
        ignorePatterns: ['node_modules/**', 'dist/**']
      };

      // Mock path.relative to return a predictable value
      jest.spyOn(path, 'relative').mockImplementation(() => 'node_modules/package/file.json');

      expect(ConfigManager.shouldIgnoreFile(config, '/root/dir/node_modules/package/file.json')).toBe(true);
    });
  });

  describe('getRuleSeverity', () => {
    it('should return configured severity for a rule', () => {
      const config: LinterConfig = {
        rootDir: '/root/dir',
        rules: {
          'base/missing-required-field': 'warning'
        }
      };

      expect(ConfigManager.getRuleSeverity(config, 'base/missing-required-field')).toBe('warning');
    });

    it('should return default severity when rule is not configured', () => {
      const config: LinterConfig = {
        rootDir: '/root/dir',
        rules: {}
      };

      // Assuming 'missing-required-field' has a default severity of 'error'
      expect(ConfigManager.getRuleSeverity(config, 'base/missing-required-field')).toBe('error');
    });

    it('should return error as fallback when rule has no default', () => {
      const config: LinterConfig = {
        rootDir: '/root/dir',
        rules: {}
      };

      // For a rule that doesn't exist in default config
      expect(ConfigManager.getRuleSeverity(config, 'non-existent-rule')).toBe('error');
    });
  });
});