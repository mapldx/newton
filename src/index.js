#! /usr/bin/env node

import { Command } from 'commander';
import { promises as fs } from 'fs';
import path from 'path';
import OpenAI from 'openai';
import 'dotenv/config';
import { md_handler, html_handler } from './utils/transmogrify.js';

const program = new Command();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

async function parse_entrypoint(package_path, base_url) {
  try {
    const file = await fs.readFile(package_path, 'utf8');
    const entrypoint = JSON.parse(file).main;
    if (!entrypoint) {
      console.log('No entrypoint found');
      process.exit(1);
    }
    // console.log('Entrypoint:', entrypoint);
    const entrypoint_path = path.join(path.dirname(package_path), entrypoint);
    const data = await fs.readFile(entrypoint_path, 'utf8');
    // console.log('Data:', data);
    let fn = false;
    let content = '';
    let responses = [];
    for (let line of data.split('\n')) {
      if (fn) {
        content += line + '\n';
        if (line === '});') {
          responses.push(await talk_to_ai(base_url, content + '});'));
          fn = false;
          content = '';
        }
      } else if (line.match(/app\.(get|post|put|delete)\(/)) {
        fn = true;
        content = line + '\n';
      }
    }
    // console.log('Responses:', responses);
    return responses;
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

async function talk_to_ai(base_url, data) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        "role": "system",
        "content": "You are a helpful world-class CTO with decades of experience. You have the skills and capabilities of a software engineer, devops engineer, QA tester, and product manager combined, all at the senior level. \n\nWith decades of experience, you are able to read, write, and understand any type of code of any language at the highest levels without any mistake, such that you are able to articulate code to human-friendly text accurately for others to easily understand."
      },
      {
        "role": "user",
        "content": `I have parsed index.js for you. index.js is an entrypoint for a JavaScript app. It is a part of an Express.js API with multiple endpoints whose base URL is ${base_url}.\n\nYour task is to create Stripe-like, formal documentation for the app's API. This documentation is to be published to millions of users around the world. From index.js, I will be providing you one endpoint at a time. \n\nEnsure that the documentation is fully complete and comprehensive in covering each and every endpoint, regardless of their purpose. The goal is to allow anyone to understand (a) what each and every endpoint is doing, (b) the purpose of each and every endpoint, and (c) how to interact with and use each and every endpoint. \n\nSimilar to the formatting used in Stripe-like API documentations, ensure that the generated documentation for the endpoint includes the following 9 requirements. You will return these 9 requirements to me, with each requirement as the value of a JSON field. I have indicated the name and type I expect the JSON to contain below:\n\n(1) endpoint_title (field): the endpoint's human-friendly title\n(2) endpoint_url (field): the endpoint's URL\n(3) endpoint_description (field): the endpoint's human friendly description\n(4) endpoint_request (field): the type of HTTP request the endpoint accepts\n(5) request_fields (array): (5a) and (5b) as one array element comprised of two fields\n(5a) field_name (field): each field in the request body\n(5b) field_description (field): a corresponding short description for each field\n(6) response_fields (array): (6a) and (6b) as one array element comprised of two fields\n(6a) field_name (field): a field in the response body\n(6b) field_description (field): a short description of each field\n(7) response_types (array): (7a) and (7b) as one array element comprised of two fields\n(7a) response_type (field): an HTTP status code that is returned by the endpoint\n(7b) response_description (field): a short description specific to this endpoint of when this response or status code is returned\n(8) request_examples (array): an example of a request sent to the endpoint, (8a) is one array element of one field, (8b) is one array element of one field, and (8c) is one array element of one field\n(8a) curl_example (field): an example of the request sent to the endpoint using cURL\n(8b) python_example (field): an example of the same request sent to the endpoint using Python\n(8c) nodejs_example (field): an example of the same request sent to the endpoint using Node.js\n(9) response_example (field): an example of the corresponding response that the request sent in (6) would see\n\nDouble-check once you're done to ensure that the generated documentation is full and not partial, has accurately described and characterized the endpoint using the 9 required points as listed above, and is totally free of any errors.\n\nIt is important that you return only the JSON, as if it is a valid .json file, without any additional or extraneous text or comments. In other words, your response should simply start with an opening bracket and end with a closing bracket.\n\nHere is one endpoint from index.js: ${data}`
      }
    ],
    temperature: 0.5,
    max_tokens: 4096,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  return response.choices.map(choice => JSON.parse(choice.message.content));
}

(async () => {
  const [package_path] = await parse_path(options.path);
  if (package_path) {
    let responses = await parse_entrypoint(package_path, options.baseUrl);
    // console.log('Responses:', responses);
    const output = path.join(options.path, 'api-documentation.json');
    // console.log('Output:', output);
    await fs.writeFile(output, JSON.stringify(responses, null, 2));
    console.log('API documentation generated successfully');
    if (options.target) {
      console.log('Target format:', options.target);
      if (options.target === "md") {
        await md_handler(output, options.path);
      } else if (options.target === "html") {
        await html_handler(output, options.path);
      }
    } else {
      console.log('No target format specified');
      process.exit(1);
    }
  } else {
    console.log('package.json not found');
  }
})();
