#! /usr/bin/env node

import { Command } from 'commander';
import { promises as fs } from 'fs';
import path from 'path';
import { md_handler, html_handler, next_handler } from './utils/transmogrify.js';
import inquirer from 'inquirer';
import ora from 'ora';
import { PathPrompt } from 'inquirer-path';
import { parse_entrypoint } from './utils/parser.js';

const program = new Command();
process.removeAllListeners('warning');
inquirer.registerPrompt('path', PathPrompt);

program
  .name('newton')
  .description('A CLI that creates your API documentation for you with AI')
  .version('1.0.8');

program
  .option('-t, --transmogrify-only', 'transmogrify existing API documentation')

program.parse(process.argv);
const options = program.opts();
export let OPENAI_API_KEY = '';

async function parse_path(directory, target = 'package.json') {
  const files = await fs.readdir(directory, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory() && file.name !== 'node_modules' && (file.name).startsWith('.') === false && (file.name).startsWith('newton') === false) {
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

async function set_format(answers, json_path, spinner) {
  answers.path = path.dirname(json_path);
  if (answers.target === "Markdown (.md)") {
    await md_handler(json_path, answers.path);
  } else if (answers.target === "Simple HTML (.html)") {
    await html_handler(json_path, answers.path);
  } else if (answers.target === "Next.js Site (.js)") {
    spinner.info('Transmogrifying to a Next.js site needs a little information from you...');
    await next_handler(json_path, answers);
  }
  if (answers.target !== "JSON (.json)" || answers.target !== "Next.js Site (.js)") {
    spinner.succeed(`Successfully transmogrified API documentation to ${answers.target}`);
  }
}

async function configure_api() {
  let api_path;
  try {
    api_path = path.join(process.env.HOME, '.newton');
    await fs.access(api_path, fs.constants.F_OK);
    OPENAI_API_KEY = await fs.readFile(api_path, 'utf8');
  } catch (err) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'api_key',
        message: 'No OpenAI API key found, enter one to continue:',
        validate: function (value) {
          if (value.length) {
            value = value.trim();
            OPENAI_API_KEY = value;
            return true;
          } else {
            return 'An OpenAI API key is required for newton to work properly';
          }
        }
      }
    ]);
    await fs.writeFile(api_path, answers.api_key);
    console.log('\nOpenAI API key saved successfully to ' + api_path + '. This key:\n');
    console.log('(0) needs to be funded or have credits for newton to work properly');
    console.log('(1) only needs to be entered once (which means you won\'t need to do this set up again)');
    console.log('(2) is strictly stored locally on your machine and is not shared with anyone');
    console.log('(3) will be used for all future newton requests');
    console.log('(4) can be changed or removed by modifying the file at ' + api_path);
    console.log('\nLet\'s get started!\n');
  }
}

(async () => {
  console.log('🦊 newton – a CLI that creates your API documentation for you with AI');
  console.log('\n');
  if (process.argv.length == 2) {
    configure_api().then(() => {
      inquirer.prompt([
        {
          type: 'path',
          name: 'filepath',
          message: 'Enter the path to your project\'s entrypoint, e.g. index.js or main.py (tab to complete):',
          default: '.',
          validate: async function (value) {
            try {
              if (value.endsWith('.js') || value.endsWith('.py')) {
                await fs.access(value, fs.constants.F_OK);
                return true;
              } else {
                return 'Please enter a path to a JavaScript or Python file';
              }
            } catch (err) {
              return 'File not found';
            }
          }
        },
        // {
        //   type: 'list',
        //   name: 'framework',
        //   message: 'Select the framework your project uses:',
        //   default: 'Express.js (JavaScript)',
        //   choices: ['Express.js (JavaScript)', 'Flask (Python)']
        // },
        {
          type: 'input',
          name: 'baseUrl',
          message: 'Enter the base URL for your API, e.g. http://api.example.com:',
          default: 'http://localhost:3000'
        },
        {
          type: 'list',
          name: 'target',
          message: 'Select the target format for the documentation:',
          default: 'JSON (.json)',
          choices: ['JSON (.json)', 'Markdown (.md)', 'Simple HTML (.html)', 'Next.js Site (.js)']
        }
      ]).then(async answers => {
        const input = {
          "Express.js (JavaScript)": {
            indicator: "package.json",
            entrypoint: "index.js",
            language: "JavaScript",
            framework: "Express.js (JavaScript)"
          },
          "Flask (Python)": {
            indicator: "app.py",
            entrypoint: "app.py",
            language: "Python",
            framework: "Flask (Python)"
          }
        };
        if (answers.filepath.endsWith('.js')) {
          answers.framework = 'Express.js (JavaScript)';
        } else if (answers.filepath.endsWith('.py')) {
          answers.framework = 'Flask (Python)';
        }
        const config = input[answers.framework];

        console.log("\n");
        let responses = await parse_entrypoint(config, answers.filepath, answers.baseUrl);
        let spinner = ora('Writing API documentation').start();
        spinner.color = 'blue';
        const json_path = path.join(path.dirname(answers.filepath), 'api-documentation.json');
        await fs.writeFile(json_path, JSON.stringify(responses, null, 2));
        await set_format(answers, json_path, spinner);
      });
    }).catch(console.error);
  } else if (process.argv.length > 2) {
    if (options.transmogrifyOnly) {
      inquirer.prompt([
        {
          type: 'path',
          name: 'path',
          message: 'Enter the path to a newton-generated JSON (tab to complete):',
          directoryOnly: false,
          default: '.',
          validate: async function (value) {
            try {
              if (value.endsWith('.json')) {
                await fs.access(value, fs.constants.F_OK);
                return true;
              } else {
                return 'Please enter a path to a JSON file';
              }
            } catch (err) {
              return 'File not found';
            }
          }
        },
      ]).then(async answers => {
        try {
          await fs.access(answers.path, fs.constants.F_OK);
          // await fs.access(path.join(answers.path, 'api-documentation.json'), fs.constants.F_OK);
          await inquirer.prompt([
            {
              type: 'input',
              name: 'baseUrl',
              message: 'Enter the base URL for your API, e.g. http://api.example.com:',
              default: 'http://localhost:3000'
            },
            {
              type: 'list',
              name: 'target',
              message: 'Select the target format for the documentation:',
              default: 'JSON (.json)',
              choices: ['JSON (.json)', 'Markdown (.md)', 'Simple HTML (.html)', 'Next.js Site (.js)']
            }
          ]).then(async response => {
            answers.target = response.target;
            answers.baseUrl = response.baseUrl;
            let spinner = ora('Transmogrifying API documentation to ' + answers.target).start();
            answers.path = path.dirname(answers.path);
            const json_path = path.join(answers.path, 'api-documentation.json');
            await set_format(answers, json_path, spinner);
          });
        } catch (error) {
          console.log('No API documentation found in the specified directory');
          process.exit(1);
        }
      });
    }
  }
})();
