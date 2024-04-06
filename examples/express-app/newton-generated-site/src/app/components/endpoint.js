import Code from './code';

export default function Endpoint({ data }) {
    if (!data || !data.endpoint_title) return (<div></div>);

    const req_color = {
        GET: "bg-green-300",
        POST: "bg-blue-300",
        PUT: "bg-yellow-300",
        DELETE: "bg-red-300",
    };
    const endpoint_request_bg = req_color[data.endpoint_request] || "bg-gray-300";
    function response_type_color(type) {
        var typeString = String(type);

        if (typeString.startsWith("2")) return "bg-green-300";
        if (typeString.startsWith("3")) return "bg-blue-300";
        if (typeString.startsWith("4")) return "bg-yellow-300";
        if (typeString.startsWith("5")) return "bg-red-300";
        return "bg-gray-300";
    }
    function determine_example_request_path(request_examples, type = "curl") {
        console.log(data.endpoint_title, request_examples.length);
        if (request_examples.length === 1) {
            if (type === "curl") {
                return request_examples[0].curl_example;
            } else if (type === "python") {
                return request_examples[0].python_example;
            } else if (type === "nodejs") {
                return request_examples[0].nodejs_example;
            }
        } else {
            if (type === "curl") {
                return request_examples[0].curl_example;
            } else if (type === "python") {
                console.log(data.endpoint_title, request_examples);
                return request_examples[1].python_example;
            } else if (type === "nodejs") {
                console.log(request_examples);
                return request_examples[2].nodejs_example;
            }
        }
    }

    return (
        <div class="" id={`${data.endpoint_title.replace(' ', '-')}`}>
            <div class="grid grid-cols-1 gap-4 mb-12 sm:grid-cols-2 sm:gap-8">
                <div class="rounded-lg">
                    <p class="font-extrabold text-xl mb-4">{data.endpoint_title}</p>
                    <p class={`font-mono mb-3 text-sm`}>
                        <span class={`${endpoint_request_bg} max-w-fit p-1 px-2 rounded-md mr-2`}>
                            {data.endpoint_request}
                        </span>
                        <span>
                            {data.endpoint_url}
                        </span>
                    </p>
                    <p class="text-sm leading-loose mb-6">
                        {data.endpoint_description}
                    </p>
                    <div class="mb-6">
                        <p class="font-extrabold text-md mb-4">Request Fields</p>
                        <ul class="space-y-1">
                            <li>
                                {data.request_fields.map((field, index) => {
                                    return (
                                        <p key={index} class="font-medium text-sm pb-3">
                                            <span class={`bg-gray-300 max-w-fit p-1 px-2 rounded-md mr-2`}>
                                                {field.field_name}
                                            </span>
                                            <span>
                                                {field.field_description}
                                            </span>
                                        </p>
                                    );
                                })}
                            </li>
                        </ul>
                    </div>
                    <div class="mb-6">
                        <p class="font-extrabold text-md mb-4">Response Fields</p>
                        <ul class="space-y-1">
                            <li>
                                {data.response_fields.map((field, index) => {
                                    return (
                                        <p key={index} class="font-medium text-sm pb-3">
                                            <span class={`bg-gray-300 max-w-fit p-1 px-2 rounded-md mr-2`}>
                                                {field.field_name}
                                            </span>
                                            <span>
                                                {field.field_description}
                                            </span>
                                        </p>
                                    );
                                })}
                            </li>
                        </ul>
                    </div>
                    <div class="mb-6">
                        <p class="font-extrabold text-md mb-4">Response Types</p>
                        <ul class="space-y-1">
                            <li>
                                {data.response_types.map((type, index) => {
                                    return (
                                        <p key={index} class="font-medium text-sm pb-3">
                                            <span class={`${response_type_color(type.response_type)} max-w-fit p-1 px-2 rounded-md mr-2`}>
                                                {type.response_type}
                                            </span>
                                            <span>
                                                {type.response_description}
                                            </span>
                                        </p>
                                    );
                                })}
                            </li>
                        </ul>
                    </div>
                </div>
                <div>
                    <div class="mb-6">
                        <p class="font-extrabold text-xl mb-4">Sample Requests</p>
                        <ul class="space-y-6">
                            <li>
                                <Code
                                    header="cURL"
                                    code={`${determine_example_request_path(data.request_examples, "curl")}`}
                                    language="bash"
                                />
                            </li>
                            <li>
                                <Code
                                    header="Python"
                                    code={`${determine_example_request_path(data.request_examples, "python")}`}
                                    language="python"
                                />
                            </li>
                            <li>
                                <Code
                                    header="Node.js"
                                    code={`${determine_example_request_path(data.request_examples, "nodejs")}`}
                                    language="javascript"
                                />
                            </li>
                        </ul>
                    </div>
                    <div class="mb-6">
                        <p class="font-extrabold text-xl mb-4">Sample Response</p>
                        <Code
                            header="JSON"
                            code={`${JSON.stringify(data.response_example, null, 2)}`}
                            language="json"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}