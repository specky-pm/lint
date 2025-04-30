import {FileSystemHandler} from '../../src/core/fileSystemHandler';
import fs from 'fs-extra';
import {glob} from 'glob';

// Mock fs-extra and glob
jest.mock('fs-extra');
jest.mock('glob');

describe('FileSystemHandler', () => {
  let fileSystemHandler: FileSystemHandler;

  beforeEach(() => {
    fileSystemHandler = new FileSystemHandler();
    jest.clearAllMocks();
  });

  describe('discoverSpecFiles', () => {
    it('should discover all spec files when they exist', async () => {
      // Mock fs.pathExists to return true for all files
      (fs.pathExists as jest.Mock).mockImplementation(async (path: string) => {
        return true;
      });

      const result = await fileSystemHandler.discoverSpecFiles('rootDir');

      expect(result).toEqual({
        specJson: 'rootDir/spec.json',
        datamodelJson: 'rootDir/datamodel.json'
      });
    });

    it('should return undefined for files that do not exist', async () => {
      // Mock fs.pathExists to return false for datamodel.json
      (fs.pathExists as jest.Mock).mockImplementation(async (path: string) => {
        return !path.includes('datamodel.json');
      });
      const result = await fileSystemHandler.discoverSpecFiles('rootDir');

      expect(result).toEqual({
        specJson: 'rootDir/spec.json',
        datamodelJson: undefined
      });
    });

    it('should throw an error if the directory does not exist', async () => {
      // Mock fs.pathExists to return false for the directory
      (fs.pathExists as jest.Mock).mockImplementation(async (path: string) => {
        return false;
      });

      await expect(fileSystemHandler.discoverSpecFiles('nonExistentDir'))
        .rejects.toThrow('Directory does not exist: nonExistentDir');
    });
  });

  describe('readFile', () => {
    it('should read file content', async () => {
      // Mock fs.readFile to return file content
      (fs.readFile as unknown as jest.Mock).mockResolvedValue('file content');

      const content = await fileSystemHandler.readFile('file.txt');

      expect(content).toBe('file content');
      expect(fs.readFile).toHaveBeenCalledWith('file.txt', 'utf8');
    });

    it('should throw an error if reading fails', async () => {
      // Mock fs.readFile to throw an error
      (fs.readFile as unknown as jest.Mock).mockRejectedValue(new Error('Read error'));

      await expect(fileSystemHandler.readFile('file.txt'))
        .rejects.toThrow('Failed to read file file.txt: Error: Read error');
    });
  });

  describe('checkRequiredFiles', () => {
    it('should return empty array if all required files exist', async () => {
      // Mock fs.pathExists to return true for all files
      (fs.pathExists as jest.Mock).mockResolvedValue(true);

      const missingFiles = await fileSystemHandler.checkRequiredFiles('rootDir');

      expect(missingFiles).toEqual([]);
    });

    it('should return array of missing required files', async () => {
      // Mock fs.pathExists to return false for component.md
      (fs.pathExists as jest.Mock).mockImplementation(async (path: string) => {
        return !path.includes('component.md');
      });

      const missingFiles = await fileSystemHandler.checkRequiredFiles('rootDir');

      expect(missingFiles).toEqual([]);
    });
  });

  describe('findFiles', () => {
    it('should find files matching a pattern', async () => {
      // Mock glob to return matching files
      (glob as unknown as jest.Mock).mockResolvedValue(['file1.txt', 'file2.txt']);

      // Use private method through any type
      const result = await (fileSystemHandler as any).findFiles('*.txt');

      expect(result).toEqual(['file1.txt', 'file2.txt']);
    });

    it('should throw an error if glob fails', async () => {
      // Mock glob to throw an error
      (glob as unknown as jest.Mock).mockRejectedValue(new Error('Glob error'));

      // Use private method through any type
      await expect((fileSystemHandler as any).findFiles('*.txt'))
        .rejects.toThrow('Failed to find files matching pattern *.txt: Error: Glob error');
    });
  });
});