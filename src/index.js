#! /usr/bin/env node

import { Command } from 'commander';
import { promises as fs } from 'fs';
import path from 'path';

const program = new Command();

program
  .name('newton')
  .description('A CLI that creates your API documentation for you with AI')
  .version('0.0.1');

program
  .option('-p, --path <path>', 'Path to your project directory')

program.parse(process.argv);
const options = program.opts();

async function parse_path(directory, target = 'package.json') {
  if (directory === undefined) {
    console.log('Please provide a path to your project directory');
    process.exit(1);
  }
  // console.log('Checking path', directory);
  const files = await fs.readdir(directory, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      const result = await parse_path(path.join(directory, file.name), target);
      if (result) {
        return result;
      }
    }
    if (target === file.name) {
      return [path.join(directory, file.name)];
    }
  }
  return undefined;
}

async function parse_entrypoint(package_path) {
  // console.log('Parsing package.json', package_path);
  const entrypoint = await fs.readFile(package_path, 'utf8')
    .then(async (data) => {
      let package_json = JSON.parse(data);
      let entrypoint = package_json.main;
      // console.log('Entrypoint:', entrypoint);
      if (!entrypoint) {
        console.log('No entrypoint found');
        process.exit(1);
      }
      return [path.join(path.dirname(package_path), entrypoint)];
    }
  );
  return entrypoint;
}

(async () => {
  const [package_path] = await parse_path(options.path);
  if (package_path) {
    let entrypoint = await parse_entrypoint(package_path);
    console.log('Entrypoint:', entrypoint);
  } else {
    console.log('package.json not found');
  }
})();
