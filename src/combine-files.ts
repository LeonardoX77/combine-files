#!/usr/bin/env ts-node

// Este script combina archivos en un único archivo de salida, excluyendo ciertos archivos y directorios especificados por argumentos, incluyendo patrones con comodines.

import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import minimatch from 'minimatch'; // Importación por defecto

const program = new Command();

program
  .requiredOption('-p, --path <path>', 'Ruta de los archivos a procesar')
  .option('-o, --output <file>', 'Nombre del archivo de salida', 'output.txt')
  .option('-d, --excludeDirs <dirs>', 'Nombres de directorios a excluir (separados por comas)', (value) => value.split(','), [])
  .option('-f, --skipFiles <files>', 'Archivos a excluir (separados por comas)', (value) => value.split(','), [])
  .option('-e, --skipExtensions <exts>', 'Extensiones de archivo a excluir (separadas por comas)', (value) => value.split(','), [])
  .option('-x, --excludePatterns <patterns>', 'Patrones de archivos a excluir (separados por comas)', (value) => value.split(','), [])
  .parse(process.argv);

const options = program.opts();

const rootDirectory = options.path;
const outputFile = options.output;

// Lista de nombres de directorios a excluir
const excludeDirNames = options.excludeDirs;

// Lista de archivos a excluir
const skipFiles = options.skipFiles.concat([path.basename(__filename), outputFile]);

// Lista de extensiones de archivo a excluir
const skipExtensions = options.skipExtensions;

// Lista de patrones de archivos a excluir
const excludePatterns = options.excludePatterns;

// Lista para almacenar las rutas de los archivos que se van a procesar
const filesToProcess: string[] = [];

// Elimina el archivo de salida si existe
if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
}

// Función para verificar si un archivo debe ser excluido
function shouldSkipFile(fileName: string, relativeFilePath: string): boolean {
    if (skipFiles.includes(fileName)) {
        return true;
    }

    if (skipExtensions.includes(path.extname(fileName))) {
        return true;
    }

    for (const pattern of excludePatterns) {
        if (minimatch(fileName, pattern)) {
            return true;
        }
    }

    return false;
}

// Función para verificar si un directorio debe ser excluido
function shouldSkipDir(dirName: string): boolean {
    if (excludeDirNames.includes(dirName)) {
        return true;
    }
    return false;
}

// Función para recopilar las rutas de los archivos a procesar
function collectFiles(directory: string) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            // Omitir directorios específicos
            if (shouldSkipDir(entry.name) || entry.name.startsWith('.')) {
                continue;
            }
            collectFiles(fullPath);
        } else if (entry.isFile()) {
            // Obtener la ruta relativa del archivo
            const relativePath = path.relative(rootDirectory, fullPath);

            // Omitir archivos según las reglas
            if (shouldSkipFile(entry.name, relativePath)) {
                continue;
            }

            // Añadir a la lista de archivos a procesar
            filesToProcess.push(relativePath);
        }
    }
}

// Función para procesar y combinar los archivos
function processFiles() {
    // Escribir las rutas de los archivos al inicio del archivo de salida
    fs.appendFileSync(outputFile, 'Archivos a procesar:\n');
    for (const filePath of filesToProcess) {
        fs.appendFileSync(outputFile, filePath + '\n');
    }
    fs.appendFileSync(outputFile, '\n\n');

    // Procesar cada archivo
    for (const relativePath of filesToProcess) {
        const fullPath = path.join(rootDirectory, relativePath);

        // Leer el contenido del archivo
        const fileContent = fs.readFileSync(fullPath, 'utf-8');

        // Escribir en el archivo de salida
        fs.appendFileSync(outputFile, `### ${relativePath} ###\n`);
        fs.appendFileSync(outputFile, fileContent + '\n\n');
    }
}

// Iniciar el proceso
collectFiles(rootDirectory);
processFiles();

console.log(`Proceso completado. El contenido se ha guardado en ${outputFile}.`);
