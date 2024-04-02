import { promises as fs } from 'fs';
import path from 'path';

async function generate_md(endpoints) {
  let markdown = "";
  
  await endpoints.forEach(endpoint => {
    markdown += `## ${endpoint.endpoint_title}\n\n`;
    markdown += `- **Description:** ${endpoint.endpoint_description}\n`;
    markdown += `- **URL:** \`${endpoint.endpoint_url}\`\n`;
    markdown += `- **Method:** \`${endpoint.endpoint_request}\`\n\n`;

    if (endpoint.request_fields.length > 0) {
      markdown += "### Request\n\n";
      endpoint.request_fields.forEach(field => {
        markdown += `- \`${field.field_name}\`: ${field.field_description}\n`;
      });
      markdown += "\n";
    }

    if (endpoint.response_fields.length > 0) {
      markdown += "### Response\n\n";
      endpoint.response_fields.forEach(field => {
        markdown += `- \`${field.field_name}\`: ${field.field_description}\n`;
      });
      markdown += "\n";
    }

    if (endpoint.response_types.length > 0) {
      markdown += "### Response Types\n\n";
      endpoint.response_types.forEach(response => {
        markdown += `- **${response.response_type}**: ${response.response_description}\n`;
      });
      markdown += "\n";
    }

    if (endpoint.request_examples.length > 0) {
      markdown += "### Request Examples\n\n";
      endpoint.request_examples.forEach(example => {
        if (example.curl_example) {
          markdown += "#### cURL Example\n\n";
          markdown += "```bash\n";
          markdown += `${example.curl_example}\n`;
          markdown += "```\n\n";
        }
        if (example.python_example) {
          markdown += "#### Python Example\n\n";
          markdown += "```python\n";
          markdown += `${example.python_example}\n`;
          markdown += "```\n\n";
        }
        if (example.nodejs_example) {
          markdown += "#### Node.js Example\n\n";
          markdown += "```javascript\n";
          markdown += `${example.nodejs_example}\n`;
          markdown += "```\n\n";
        }
      });
      markdown += "\n";
    }    

    if (endpoint.response_example) {
      markdown += "### Response Example\n\n";
      markdown += "```json\n";
      markdown += JSON.stringify(endpoint.response_example, null, 2);
      markdown += "\n```\n";
    }

    markdown += "---\n\n";
  });

  return markdown;
}

async function md_handler(json_file, save_path) {
  let data = JSON.parse(await fs.readFile(json_file, 'utf8'));
  let markdown = "";
  for (const endpoint of data) {
    markdown += await generate_md(endpoint);
  }
  let output = path.join(save_path, 'api-documentation.md');
  await fs.writeFile(output, markdown);
  console.log('Documentation generated successfully!');
}

export default md_handler;