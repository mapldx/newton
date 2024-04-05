import { OpenAI } from 'openai';

async function talk_to_ai(payload, OPENAI_API_KEY) {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "system",
                "content": "You are a helpful world-class CTO with decades of experience. You have the skills and capabilities of a software engineer, devops engineer, QA tester, and product manager combined, all at the senior level. \n\nWith decades of experience, you are able to read, write, and understand any type of code of any language at the highest levels without any mistake, such that you are able to articulate code to human-friendly text accurately for others to easily understand."
            },
            {
                "role": "user",
                "content": `I have parsed ${payload.entrypoint} for you. ${payload.entrypoint} is an entrypoint for a ${payload.entrypoint} app. It is a part of an ${payload.framework} API with multiple endpoints whose base URL is ${payload.base_url}.\n\nYour task is to create Stripe-like, formal documentation for the app's API. This documentation is to be published to millions of users around the world. From ${payload.entrypoint}, I will be providing you one endpoint at a time. \n\nEnsure that the documentation is fully complete and comprehensive in covering each and every endpoint, regardless of their purpose. The goal is to allow anyone to understand (a) what each and every endpoint is doing, (b) the purpose of each and every endpoint, and (c) how to interact with and use each and every endpoint. \n\nSimilar to the formatting used in Stripe-like API documentations, ensure that the generated documentation for the endpoint includes the following 9 requirements. You will return these 9 requirements to me, with each requirement as the value of a JSON field. I have indicated the name and type I expect the JSON to contain below:\n\n(1) endpoint_title (field): the endpoint's human-friendly title\n(2) endpoint_url (field): the endpoint's URL\n(3) endpoint_description (field): the endpoint's human friendly description\n(4) endpoint_request (field): the type of HTTP request the endpoint accepts\n(5) request_fields (array): (5a) and (5b) as one array element comprised of two fields\n(5a) field_name (field): each field in the request body\n(5b) field_description (field): a corresponding short description for each field\n(6) response_fields (array): (6a) and (6b) as one array element comprised of two fields\n(6a) field_name (field): a field in the response body\n(6b) field_description (field): a short description of each field\n(7) response_types (array): (7a) and (7b) as one array element comprised of two fields\n(7a) response_type (field): an HTTP status code that is returned by the endpoint\n(7b) response_description (field): a short description specific to this endpoint of when this response or status code is returned\n(8) request_examples (array): an example of a request sent to the endpoint, (8a) is one array element of one field, (8b) is one array element of one field, and (8c) is one array element of one field\n(8a) curl_example (field): an example of the request sent to the endpoint using cURL\n(8b) python_example (field): an example of the same request sent to the endpoint using Python\n(8c) nodejs_example (field): an example of the same request sent to the endpoint using Node.js\n(9) response_example (field): an example of the corresponding response that the request sent in (6) would see\n\nDouble-check once you're done to ensure that the generated documentation is full and not partial, has accurately described and characterized the endpoint using the 9 required points as listed above, and is totally free of any errors.\n\nIt is important that you return only the JSON, as if it is a valid .json file, without any additional or extraneous text or comments. In other words, your response should simply start with an opening bracket and end with a closing bracket.\n\nHere is one endpoint from index.js: ${payload.data}`
            }
        ],
        temperature: 0.5,
        max_tokens: 4096,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    let message;
    try {
        message = response.choices.map(choice => JSON.parse(choice.message.content));
    } catch (error) {
        // console.log("Error: ", error);
        // console.log("\n");
        return null;
    }
    return message;
}

async function craft_prompt(framework, base_url, data, OPENAI_API_KEY) {
    const input = {
        "Express.js (JavaScript)": {
            entrypoint: "index.js",
            language: "JavaScript",
            framework: "Express.js"
        },
        "Flask (Python)": {
            entrypoint: "app.py",
            language: "Python",
            framework: "Flask"
        }
    };

    const config = input[framework];
    if (config) {
        const payload = {
            ...config,
            base_url,
            data
        };
        // console.log("Payload: ", payload);
        let response = await talk_to_ai(payload, OPENAI_API_KEY);
        return response;
    } else {
        return null;
    }
}

export { craft_prompt };