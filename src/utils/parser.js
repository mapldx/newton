import { promises as fs } from 'fs';
import path from 'path';
import { craft_prompt } from './ai.js';
import ora from 'ora';
import { OPENAI_API_KEY } from '../index.js';

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

export async function parse_entrypoint(config, package_path, base_url) {
  try {
    // const entrypoint_path = await locate_file(config, package_path);
    const endpoints_set = await read_endpoints(config, package_path);
    const responses = await generate_doc(endpoints_set, config, base_url);

    return responses;
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}
