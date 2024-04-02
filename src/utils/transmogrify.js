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

async function generate_html(endpoints) {
  let html = "";
  
  await endpoints.forEach(endpoint => {
    html += `<h2>${endpoint.endpoint_title}</h2>\n\n`;
    html += `<p><strong>Description:</strong> ${endpoint.endpoint_description}</p>\n`;
    html += `<p><strong>URL:</strong> <code>${endpoint.endpoint_url}</code></p>\n`;
    html += `<p><strong>Method:</strong> <code>${endpoint.endpoint_request}</code></p>\n\n`;

    if (endpoint.request_fields.length > 0) {
      html += "<h3>Request</h3>\n\n";
      endpoint.request_fields.forEach(field => {
        html += `<p><code>${field.field_name}</code>: ${field.field_description}</p>\n`;
      });
      html += "\n";
    }

    if (endpoint.response_fields.length > 0) {
      html += "<h3>Response</h3>\n\n";
      endpoint.response_fields.forEach(field => {
        html += `<p><code>${field.field_name}</code>: ${field.field_description}</p>\n`;
      });
      html += "\n";
    }

    if (endpoint.response_types.length > 0) {
      html += "<h3>Response Types</h3>\n\n";
      endpoint.response_types.forEach(response => {
        html += `<p><strong>${response.response_type}</strong>: ${response.response_description}</p>\n`;
      });
      html += "\n";
    }

    if (endpoint.request_examples.length > 0) {
      html += "<h3>Request Examples</h3>\n\n";
      endpoint.request_examples.forEach(example => {
        if (example.curl_example) {
          html += "<h4>cURL Example</h4>\n\n";
          html += "<pre><code class=\"bash\">\n";
          html += `${example.curl_example}\n`;
          html += "</code></pre>\n\n";
        }
        if (example.python_example) {
          html += "<h4>Python Example</h4>\n\n";
          html += "<pre><code class=\"python\">\n";
          html += `${example.python_example}\n`;
          html += "</code></pre>\n\n";
        }
        if (example.nodejs_example) {
          html += "<h4>Node.js Example</h4>\n\n";
          html += "<pre><code class=\"javascript\">\n";
          html += `${example.nodejs_example}\n`;
          html += "</code></pre>\n\n";
        }
      });
      html += "\n";
    }    

    if (endpoint.response_example) {
      html += "<h3>Response Example</h3>\n\n";
      html += "<pre><code class=\"json\">\n";
      html += JSON.stringify(endpoint.response_example, null, 2);
      html += "\n</code></pre>\n";
    }

    html += "---\n\n";
  });

  return html;
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

async function html_handler(json_file, save_path) {
  let data = JSON.parse(await fs.readFile(json_file, 'utf8'));
  let html = "";
  for (const endpoint of data) {
    html += await generate_html(endpoint);
  }
  let output = path.join(save_path, 'api-documentation.html');
  await fs.writeFile(output, html);
  console.log('Documentation generated successfully!');
}

// export the md and html handlers
export { md_handler, html_handler };