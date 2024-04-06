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
  .version('1.0.0');

// program
//   .option('-p, --path <path>', 'Path to your project directory')
//   .option('-b, --base-url <url>', 'Base URL for your API')
//   .option('-t, --target <format>', 'Target format for the documentation');

program.parse(process.argv);
const options = program.opts();
let OPENAI_API_KEY = '';

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
    if (file.isDirectory() && file.name !== 'node_modules') {
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

async function parse_entrypoint(config, package_path, base_url) {
  let spinner = ora();
  spinner.color = 'blue';
  let entrypoint = config.entrypoint, entrypoint_path = '';
  if (config.language === "JavaScript") {
    spinner = ora('Reading package.json for a project entrypoint').start();
    const file = await fs.readFile(package_path, 'utf8');
    entrypoint = JSON.parse(file).main;
    if (!entrypoint) {
      // console.log('No entrypoint found');
      spinner.fail('No entrypoint found in package.json (main field)');
      process.exit(1);
    }
    // console.log('Entrypoint:', entrypoint);
    entrypoint_path = path.join(path.dirname(package_path), entrypoint);
    spinner.succeed('Found a valid entrypoint at ' + entrypoint_path);
  } else if (config.language === "Python") { }
  try {
    if (entrypoint_path === '') {
      entrypoint_path = package_path;
    }
    spinner = ora('Reading entrypoint for API endpoints').start();
    const data = await fs.readFile(entrypoint_path, 'utf8');
    // console.log('Data:', data);
    let is_capturing = false;
    let content = '';
    let responses = [];
    let endpoint = '';
    let has_endpoint = false;
    for (let line of data.split('\n')) {
      if (config.language === "JavaScript") {
        if (is_capturing) {
          content += line + '\n';
          if (line === '});' || line === '})') {
            if (!has_endpoint) {
              spinner.succeed('Found at least one API endpoint');
              has_endpoint = true;
            }
            spinner = ora('Talking to AI for documentation on ' + endpoint).start();
            let message = await craft_prompt(config.framework, base_url, content, OPENAI_API_KEY);
            if (message == null) {
              spinner.info('Received an invalid response from the AI, automatically retrying...');
              spinner = ora('Talking to AI').start();
              message = await craft_prompt(config.framework, base_url, content, OPENAI_API_KEY);
            } else {
              spinner.succeed('AI has responded for ' + endpoint);
              responses.push(message);
            }
            is_capturing = false;
            content = '';
          }
        } else if (line.match(/app\.(get|post|put|delete)\(/)) {
          is_capturing = true;
          endpoint = line;
          content = line + '\n';
        }
      } else if (config.language === "Python") {
        if (line.trim().startsWith('@app.route')) {
          if (is_capturing) {
            if (!has_endpoint) {
              spinner.succeed('Found at least one API endpoint');
              has_endpoint = true;
            }
            spinner = ora('Talking to AI for documentation on ' + endpoint).start();
            let message = await craft_prompt(config.framework, base_url, content, OPENAI_API_KEY);
            // console.log('Message:', message);
            if (message == null) {
              spinner.info('Received an invalid response from the AI, automatically retrying...');
              spinner = ora('Talking to AI').start();
              message = await craft_prompt(config.framework, base_url, content, OPENAI_API_KEY);
            } else {
              spinner.succeed('AI has responded for ' + endpoint);
              responses.push(message);
            }
            content = '';
          }
          is_capturing = true;
          endpoint = line.trim();
        }
        if (is_capturing) {
          content += line + '\n';
        }
      }
    }
    if (config.language === "Python" && is_capturing && content) {
      // endpointContents.push(content);
      let endpoint = content.indexOf('@app.route');
      endpoint = content.substring(endpoint, content.indexOf('\n', endpoint));
      // console.log('Endpoint:', endpoint);
      if (!has_endpoint) {
        spinner.succeed('Found at least one API endpoint');
        has_endpoint = true;
      }
      spinner = ora('Talking to AI for documentation on ' + endpoint).start();
      let message = await craft_prompt(config.framework, base_url, content, OPENAI_API_KEY);
      if (message == null) {
        spinner.info('Received an invalid response from the AI, automatically retrying...');
        spinner = ora('Talking to AI').start();
        message = await craft_prompt(config.framework, base_url, content, OPENAI_API_KEY);
      } else {
        spinner.succeed('AI has responded for ' + endpoint);
        responses.push(message);
      }
    }
    // console.log('Responses:', responses);
    if (spinner.isSpinning) {
      spinner.succeed('AI has responded');
    }
    return responses;
  } catch (error) {
    spinner.fail('An unknown error occurred while reading the entrypoint or talking to AI');
    console.error("Error:", error);
    process.exit(1);
  }
}

async function configure_api() {
  let api_path;
  try {
    api_path = path.join(process.env.HOME, '.newton');
    await fs.access(api_path, fs.constants.F_OK);
    OPENAI_API_KEY = await fs.readFile(api_path, 'utf8');
  } catch (err) {
    // spinner.fail('No OpenAI API key found, enter one to continue');
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
    // console.log('Starting in interactive mode...\n');
    // let spinner = ora('Configuring...').start();
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
              spinner.succeed('Successfully transmogrified API documentation to ' + answers.target);
            } else if (answers.target === "Simple HTML (.html)") {
              await html_handler(output, answers.path);
              spinner.succeed('Successfully transmogrified API documentation to ' + answers.target);
            } else if (answers.target === "JSON (.json)") {
              // console.log('JSON output saved to:', output);
              spinner.succeed('Successfully transmogrified API documentation to ' + answers.target);
            } else if (answers.target === "Next.js Site (.js)") {
              // console.log('Next.js Site output saved to:', output);
              spinner.info('Transmogrifying to a Next.js site needs a little information from you...')
              await next_handler(output, answers.path, answers.baseUrl);
            }
          } else {
            console.log('No target format specified');
            process.exit(1);
          }
        } else {
          console.log('package.json not found');
        }
      });
    }).catch(console.error);
  } else if (process.argv.length > 2) {
    // if (process.argv.length < 6) {
    //   program.help();
    // }
    // const [package_path] = await parse_path(options.path);
    // if (package_path) {
    //   let responses = await parse_entrypoint(package_path, options.baseUrl);
    //   const output = path.join(options.path, 'api-documentation.json');
    //   await fs.writeFile(output, JSON.stringify(responses, null, 2));
    //   console.log('API documentation generated successfully');
    //   if (options.target) {
    //     console.log('Target format:', options.target);
    //     if (options.target === "Markdown (.md)") {
    //       await md_handler(output, options.path);
    //     } else if (options.target === "Simple HTML (.html)") {
    //       await html_handler(output, options.path);
    //     } else if (options.target === "JSON (.json)") {
    //       console.log('JSON output saved to:', output);
    //     }
    //   } else {
    //     console.log('No target format specified');
    //     process.exit(1);
    //   }
    // } else {
    //   console.log('package.json not found');
    // }
  }
})();
