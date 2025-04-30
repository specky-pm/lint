import fs from 'fs-extra';
import path from 'path';
import {glob} from 'glob';
import {LinterConfig} from '../types';

/**
 * Handles file system operations for the linter
 */
export class FileSystemHandler {
  /**
   * Discovers Specky specification files in a directory
   * @param rootDir The root directory to search in
   * @returns An object containing paths to the discovered files
   */
  async discoverSpecFiles(rootDir: string): Promise<{
    specJson?: string;
    datamodelJson?: string;
  }> {
    const result = {
      specJson: undefined as string | undefined,
      datamodelJson: undefined as string | undefined
    };

    // Check if the directory exists
    if (!await fs.pathExists(rootDir)) {
      throw new Error(`Directory does not exist: ${rootDir}`);
    }

    // Find spec.json
    const specJsonPath = path.join(rootDir, 'spec.json');
    if (await fs.pathExists(specJsonPath)) {
      result.specJson = specJsonPath;
    }


    // Find datamodel.json
    const datamodelJsonPath = path.join(rootDir, 'datamodel.json');
    if (await fs.pathExists(datamodelJsonPath)) {
      result.datamodelJson = datamodelJsonPath;
    }

    return result;
  }

  /**
   * Reads the content of a file
   * @param filePath The path to the file
   * @returns The content of the file as a string
   */
  async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
  }

  /**
   * Checks if required files exist in the directory
   * @param rootDir The root directory to check
   * @param config Linter configuration (optional)
   * @returns An array of missing required files
   */
  async checkRequiredFiles(rootDir: string, config?: LinterConfig): Promise<string[]> {
    // Default required files
    let requiredFiles = ['spec.json'];

    // Filter required files based on configuration
    if (config?.fileValidation) {
      requiredFiles = requiredFiles.filter(file => {
        const key = file as keyof typeof config.fileValidation;
        return config.fileValidation?.[key] !== false;
      });
    }

    const missingFiles: string[] = [];

    for (const file of requiredFiles) {
      const filePath = path.join(rootDir, file);
      if (!await fs.pathExists(filePath)) {
        missingFiles.push(file);
      }
    }

    return missingFiles;
  }

  /**
   * Finds files matching a glob pattern
   * @param pattern The glob pattern to match
   * @returns An array of file paths
   */
  private async findFiles(pattern: string): Promise<string[]> {
    try {
      // Use the new Promise-based API for glob v11+
      const matches = await glob(pattern);
      return matches;
    } catch (err) {
      throw new Error(`Failed to find files matching pattern ${pattern}: ${err}`);
    }
  }
}