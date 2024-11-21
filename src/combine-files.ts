#!/usr/bin/env ts-node

// This script combines files into a single output file, excluding certain files and directories specified by arguments, including patterns with wildcards. It also supports splitting the output file if it exceeds a maximum number of lines.

import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import minimatch from 'minimatch'; // Import minimatch for pattern matching

const program = new Command();

program
  .requiredOption('-p, --path <path>', 'Path of the files to process')
  .option('-o, --output <file>', 'Output file name', 'output.txt')
  .option('-d, --excludeDirs <dirs>', 'Directory names to exclude (comma-separated)', (value) => value.split(','), [])
  .option('-f, --skipFiles <files>', 'Files to exclude (comma-separated)', (value) => value.split(','), [])
  .option('-e, --skipExtensions <exts>', 'File extensions to exclude (comma-separated)', (value) => value.split(','), [])
  .option('-x, --excludePatterns <patterns>', 'File patterns to exclude (comma-separated)', (value) => value.split(','), [])
  .option('-m, --maxLines <lines>', 'Maximum number of lines per output file', parseInt, 0)
  .parse(process.argv);

const options = program.opts();

// Root directory to start processing files
const rootDirectory = options.path;

// Output file name
const outputFile = options.output;

// Maximum number of lines per output file; 0 means no splitting
const maxLines = options.maxLines;

// List of directory names to exclude
const excludeDirNames = options.excludeDirs;

// List of files to exclude
const skipFiles = options.skipFiles.concat([path.basename(__filename), outputFile]);

// List of file extensions to exclude
const skipExtensions = options.skipExtensions;

// List of file patterns to exclude
const excludePatterns = options.excludePatterns;

// List to store the paths of files to process
const filesToProcess: string[] = [];

// Delete the output file if it exists
if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
}

// Function to check if a file should be skipped
function shouldSkipFile(fileName: string, relativeFilePath: string): boolean {
    // Exclude specific file names
    if (skipFiles.includes(fileName) || skipFiles.some((skipFile: string) => relativeFilePath.includes(skipFile))) {
        return true;
    }

    // Exclude files based on extensions
    if (skipExtensions.includes(path.extname(fileName))) {
        return true;
    }

    // Exclude files matching patterns
    for (const pattern of excludePatterns) {
        if (minimatch(relativeFilePath, pattern)) {
            return true;
        }
    }

    return false;
}

// Function to check if a directory should be skipped
function shouldSkipDir(dirName: string): boolean {
    return excludeDirNames.includes(dirName);
}

// Function to collect the paths of files to process
function collectFiles(directory: string) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            // Skip specific directories or hidden directories
            if (shouldSkipDir(entry.name) || entry.name.startsWith('.')) {
                continue;
            }
            collectFiles(fullPath);
        } else if (entry.isFile()) {
            // Get the relative path of the file
            const relativePath = path.relative(rootDirectory, fullPath);

            // Skip files based on rules
            if (shouldSkipFile(entry.name, relativePath)) {
                continue;
            }

            // Add the file to the list for processing
            filesToProcess.push(relativePath);
        }
    }
}

// Function to write output to files with optional splitting
function writeWithPartition(lines: string[]) {
    let currentFileIndex = 0;
    let currentLineCount = 0;
    let currentFileName = outputFile;

    // Delete existing output file if it exists
    if (fs.existsSync(currentFileName)) {
        fs.unlinkSync(currentFileName);
    }

    for (const line of lines) {
        // Create a new file if the line count exceeds the maximum
        if (maxLines > 0 && currentLineCount >= maxLines) {
            currentFileIndex++;
            currentLineCount = 0;
            currentFileName = outputFile.replace(/(\.\w+)?$/, `${currentFileIndex}$1`);
        }

        // Write the line to the current file
        fs.appendFileSync(currentFileName, line + '\n');
        currentLineCount++;
    }
}

// Function to process and combine files
function processFiles() {
    const outputLines: string[] = [];

    // Add file paths to the beginning of the output
    outputLines.push('Files to process:');
    outputLines.push(...filesToProcess.map(filePath => filePath));
    outputLines.push('\n');

    // Process each file
    for (const relativePath of filesToProcess) {
        const fullPath = path.join(rootDirectory, relativePath);
        const fileContent = fs.readFileSync(fullPath, 'utf-8');

        // Add file content to the output
        outputLines.push(`### ${relativePath} ###`);
        outputLines.push(fileContent);
        outputLines.push('\n');
    }

    // Write the output lines to files
    writeWithPartition(outputLines);
}

// Start the process
collectFiles(rootDirectory);
processFiles();

console.log(`Process completed. Output files have been saved starting with ${outputFile}.`);
