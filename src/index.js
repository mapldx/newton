#! /usr/bin/env node

import { Command } from 'commander';
import { promises as fs } from 'fs';
import path from 'path';
import { md_handler, html_handler, next_handler } from './utils/transmogrify.js';
import { craft_prompt } from './utils/ai.js';
import inquirer from 'inquirer';
import ora from 'ora';
import { PathPrompt } from 'inquirer-path';

const program = new Command();
process.removeAllListeners('warning');
inquirer.registerPrompt('path', PathPrompt);

program
  .name('newton')
  .description('A CLI that creates your API documentation for you with AI')
  .version('1.0.5');

program
  .option('-t, --transmogrify-only', 'transmogrify existing API documentation')

program.parse(process.argv);
const options = program.opts();
let OPENAI_API_KEY = '';

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

async function locate_file(config, package_path) {
  let spinner = ora('Determining project entrypoint...').start();
  let entrypoint_path = '';

  if (config.language === "JavaScript") {
    spinner.text = 'Reading package.json for a project entrypoint';
    const file = await fs.readFile(package_path, 'utf8');
    const entrypoint = JSON.parse(file).main;

    if (!entrypoint) {
      spinner.fail('No entrypoint found in package.json (main field)');
      process.exit(1);
    }

    entrypoint_path = path.join(path.dirname(package_path), entrypoint);
    spinner.succeed('Found a valid entrypoint at ' + entrypoint_path);
  } else if (config.language === "Python") {
    entrypoint_path = package_path;
    spinner.succeed('Found a valid entrypoint at ' + entrypoint_path);
  }

  return entrypoint_path;
}

async function read_endpoints(config, entrypoint_path) {
  let spinner = ora('Reading entrypoint for API endpoints').start();
  const data = await fs.readFile(entrypoint_path, 'utf8');
  let endpoints_set = [];
  let is_capturing = false;
  let content = '';
  let endpoint = '';

  for (let line of data.split('\n')) {
    if (config.language === "JavaScript" && (is_capturing || line.match(/app\.(get|post|put|delete)\(/))) {
      ({ is_capturing, content, endpoint } = js_handler(line, is_capturing, content, endpoint, endpoints_set));
    } else if (config.language === "Python") {
      ({ is_capturing, content, endpoint } = python_handler(line, is_capturing, content, endpoint, endpoints_set));
    }
  }

  if (is_capturing && content) {
    endpoints_set.push({ endpoint, content });
  }

  spinner.succeed('Finished extracting API endpoints');
  return endpoints_set;
}

async function generate_doc(endpoints_set, config, base_url) {
  let responses = [];

  for (let { endpoint, content } of endpoints_set) {
    let spinner = ora(`Talking to AI for documentation on ${endpoint}`).start();
    let message = await craft_prompt(config.framework, base_url, content, OPENAI_API_KEY);

    if (message == null) {
      spinner.info('Received an invalid response from the AI, automatically retrying...');
      message = await craft_prompt(config.framework, base_url, content, OPENAI_API_KEY);
    }

    if (message != null) {
      spinner.succeed(`AI has responded for ${endpoint}`);
      responses.push(message);
    } else {
      spinner.fail(`Failed to get a response for ${endpoint}`);
    }
  }

  return responses;
}

function js_handler(line, capturing, content, endpoint, endpoints_set) {
  if (capturing) {
    content += line + '\n';
    if (line === '});' || line === '})') {
      endpoints_set.push({ endpoint, content });
      return { is_capturing: false, content: '', endpoint: '' };
    }
  } else if (line.match(/app\.(get|post|put|delete)\(/)) {
    endpoint = line;
    content = line + '\n';
    return { is_capturing: true, content, endpoint };
  }
  return { is_capturing: capturing, content, endpoint };
}

function python_handler(line, capturing, content, endpoint, endpoints_set) {
  if (line.trim().startsWith('@app.route') || line.trim().startsWith('@router.route')) {
    if (capturing) {
      endpoints_set.push({ endpoint, content });
      content = '';
    }
    endpoint = line.trim();
    content += line + '\n';
    return { is_capturing: true, content, endpoint };
  } else if (capturing) {
    content += line + '\n';
  }
  return { is_capturing: capturing, content, endpoint };
}

async function parse_entrypoint(config, package_path, base_url) {
  try {
    const entrypoint_path = await locate_file(config, package_path);
    const endpoints_set = await read_endpoints(config, entrypoint_path);
    const responses = await generate_doc(endpoints_set, config, base_url);

    return responses;
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

async function set_format(answers, json_path, spinner) {
  if (answers.target === "Markdown (.md)") {
    await md_handler(json_path, answers.path);
    spinner.succeed('Successfully transmogrified API documentation to ' + answers.target);
  } else if (answers.target === "Simple HTML (.html)") {
    await html_handler(json_path, answers.path);
    spinner.succeed('Successfully transmogrified API documentation to ' + answers.target);
  } else if (answers.target === "JSON (.json)") {
    spinner.succeed('Successfully transmogrified API documentation to ' + answers.target);
  } else if (answers.target === "Next.js Site (.js)") {
    spinner.info('Transmogrifying to a Next.js site needs a little information from you...');
    await next_handler(json_path, answers);
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
            return 'An OpenAI API key is required for Newton to work properly';
          }
        }
      }
    ]);
    await fs.writeFile(api_path, answers.api_key);
    console.log('\nOpenAI API key saved successfully to ' + api_path + '. This key:\n');
    console.log('(0) needs to be funded or have credits for Newton to work properly');
    console.log('(1) only needs to be entered once (which means you won\'t need to do this set up again)');
    console.log('(2) is strictly stored locally on your machine and is not shared with anyone');
    console.log('(3) will be used for all future Newton requests');
    console.log('(4) can be changed or removed by modifying the file at ' + api_path);
    console.log('\nLet\'s get started!\n');
  }
}

(async () => {
  if (process.argv.length == 2) {
    console.log('🦊 newton – a CLI that creates your API documentation for you with AI');
    console.log('\n');
    configure_api().then(() => {
      inquirer.prompt([
        {
          type: 'path',
          name: 'path',
          message: 'Enter the path to your project directory (tab to complete):',
          directoryOnly: true,
          default: '.',
        },
        {
          type: 'list',
          name: 'framework',
          message: 'Select the framework your project uses:',
          default: 'Express.js (JavaScript)',
          choices: ['Express.js (JavaScript)', 'Flask (Python)']
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
        const config = input[answers.framework];

        console.log("\n");
        let spinner = ora(`Looking for a valid ${config.indicator}`).start();
        spinner.color = 'blue';
        const [package_path] = await parse_path(answers.path, config.indicator);
        if (package_path === undefined) {
          spinner.fail(`No ${config.indicator} found`);
          process.exit(1);
        }
        if (package_path) {
          spinner.succeed(`Found a valid ${config.indicator}`);
          let responses = await parse_entrypoint(config, package_path, answers.baseUrl);
          spinner = ora('Writing API documentation').start();
          spinner.color = 'blue';
          const json_path = path.join(answers.path, 'api-documentation.json');
          await fs.writeFile(json_path, JSON.stringify(responses, null, 2));
          await set_format(answers, json_path, spinner);
        } else {
          console.log('package.json not found');
        }
      });
    }).catch(console.error);
  } else if (process.argv.length > 2) {
    if (options.transmogrifyOnly) {
      inquirer.prompt([
        {
          type: 'path',
          name: 'path',
          message: 'Enter the path to your project directory (tab to complete):',
          directoryOnly: true,
          default: '.',
        },
      ]).then(async answers => {
        try {
          await fs.access(path.join(answers.path, 'api-documentation.json'), fs.constants.F_OK);
          await inquirer.prompt([
            {
              type: 'list',
              name: 'target',
              message: 'Select the target format for the documentation:',
              default: 'JSON (.json)',
              choices: ['JSON (.json)', 'Markdown (.md)', 'Simple HTML (.html)', 'Next.js Site (.js)']
            }
          ]).then(async response => {
            answers.target = response.target;
            let spinner = ora('Transmogrifying API documentation to ' + answers.target).start();
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
