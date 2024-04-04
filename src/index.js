#! /usr/bin/env node

import { Command } from 'commander';
import { promises as fs } from 'fs';
import path from 'path';
import { md_handler, html_handler } from './utils/transmogrify.js';
import { talk_to_ai } from './utils/ai.js';
import inquirer from 'inquirer';
import ora, { spinners } from 'ora';

const program = new Command();
process.removeAllListeners('warning');

program
  .name('newton')
  .description('A CLI that creates your API documentation for you with AI')
  .version('0.0.1');

program
  .option('-p, --path <path>', 'Path to your project directory')
  .option('-b, --base-url <url>', 'Base URL for your API')
  .option('-t, --target <format>', 'Target format for the documentation');

program.parse(process.argv);
const options = program.opts();

async function parse_path(directory, target = 'package.json') {
  // let spinner = ora('Looking for a valid package.json').start();
  // spinner.color = 'blue';
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
      // spinner.succeed('Found a valid package.json');
      return [path.join(directory, file.name)];
    }
  }
  // spinner.fail('No package.json found');
  return undefined;
}

async function parse_entrypoint(package_path, base_url) {
  let spinner = ora('Reading package.json for a project entrypoint').start();
  spinner.color = 'blue';
  try {
    const file = await fs.readFile(package_path, 'utf8');
    const entrypoint = JSON.parse(file).main;
    if (!entrypoint) {
      // console.log('No entrypoint found');
      spinner.fail('No entrypoint found in package.json (main field)');
      process.exit(1);
    }
    // console.log('Entrypoint:', entrypoint);
    const entrypoint_path = path.join(path.dirname(package_path), entrypoint);
    spinner.succeed('Found a valid entrypoint at ' + entrypoint_path);
    spinner = ora('Reading entrypoint for API endpoints').start();
    const data = await fs.readFile(entrypoint_path, 'utf8');
    // console.log('Data:', data);
    let fn = false;
    let content = '';
    let responses = [];
    let endpoint = '';
    let has_endpoint = false;
    for (let line of data.split('\n')) {
      if (fn) {
        content += line + '\n';
        if (line === '});' || line === '})') {
          if (!has_endpoint) {
            spinner.succeed('Found at least one API endpoint');
            has_endpoint = true;
          }
          // handle multiple return values from talk_to_ai namely message and spinner
          spinner = ora('Talking to AI for documentation on ' + endpoint).start();
          let message = await talk_to_ai(base_url, content);
          if (message == null) {
            spinner.info('Received an invalid response from the AI, automatically retrying...');
            spinner = ora('Talking to AI').start();
            message = await talk_to_ai(base_url, content);
          } else {
            spinner.succeed('AI has responded for ' + endpoint);
            responses.push(message);
          }
          fn = false;
          content = '';
        }
      } else if (line.match(/app\.(get|post|put|delete)\(/)) {
        fn = true;
        endpoint = line;
        content = line + '\n';
      }
    }
    // console.log('Responses:', responses);
    if (spinner.isSpinning) {
      spinner.succeed('AI has responded');
    }
    return responses;
  } catch (error) {
    spinner.fail('An unknown error occurred while reading the entrypoint or talking to AI');
    // console.error("Error:", error);
    process.exit(1);
  }
}

(async () => {
  if (process.argv.length == 2) {
    console.log('Starting in interactive mode...\n');
    inquirer.prompt([
      {
        type: 'input',
        name: 'path',
        message: 'Enter the path to your project directory:',
        default: '.'
      },
      {
        type: 'input',
        name: 'baseUrl',
        message: 'Enter the base URL for your API:',
        default: 'http://localhost:3000'
      },
      {
        type: 'list',
        name: 'target',
        message: 'Select the target format for the documentation:',
        default: 'JSON (.json)',
        choices: ['JSON (.json)', 'Markdown (.md)', 'Simple HTML (.html)']
      }
    ]).then(async answers => {
      console.log("\n");
      let spinner = ora('Looking for a valid package.json').start();
      spinner.color = 'blue';
      const [package_path] = await parse_path(answers.path);
      if (package_path === undefined) {
        spinner.fail('No package.json found');
        process.exit(1);
      }
      if (package_path) {
        spinner.succeed('Found a valid package.json');
        let responses = await parse_entrypoint(package_path, answers.baseUrl);
        spinner = ora('Writing API documentation').start();
        spinner.color = 'blue';
        const output = path.join(answers.path, 'api-documentation.json');
        await fs.writeFile(output, JSON.stringify(responses, null, 2));
        // spinner.succeed('Successfully written default JSON output to + ' + output);
        // console.log('API documentation generated successfully');
        if (answers.target) {
          // console.log('Target format:', answers.target);
          // if (answers.target !== "JSON (.json)") {
          //   spinner = ora('Transmogrifying API documentation to ' + answers.target).start();
          // }
          if (answers.target === "Markdown (.md)") {
            await md_handler(output, answers.path);
          } else if (answers.target === "Simple HTML (.html)") {
            await html_handler(output, answers.path);
          } else if (answers.target === "JSON (.json)") {
            // console.log('JSON output saved to:', output);
          }
          spinner.succeed('Successfully transmogrified API documentation to ' + answers.target);
        } else {
          console.log('No target format specified');
          process.exit(1);
        }
      } else {
        console.log('package.json not found');
      }
    });
  } else if (process.argv.length > 2) {
    if (process.argv.length < 6) {
      program.help();
    }
    const [package_path] = await parse_path(options.path);
    if (package_path) {
      let responses = await parse_entrypoint(package_path, options.baseUrl);
      const output = path.join(options.path, 'api-documentation.json');
      await fs.writeFile(output, JSON.stringify(responses, null, 2));
      console.log('API documentation generated successfully');
      if (options.target) {
        console.log('Target format:', options.target);
        if (options.target === "Markdown (.md)") {
          await md_handler(output, options.path);
        } else if (options.target === "Simple HTML (.html)") {
          await html_handler(output, options.path);
        } else if (options.target === "JSON (.json)") {
          console.log('JSON output saved to:', output);
        }
      } else {
        console.log('No target format specified');
        process.exit(1);
      }
    } else {
      console.log('package.json not found');
    }
  }
})();
