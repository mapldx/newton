import Code from './code';

export default function Endpoint({ data }) {
    const req_color = {
        GET: "bg-green-300",
        POST: "bg-blue-300",
        PUT: "bg-yellow-300",
        DELETE: "bg-red-300",
    };
    const res_color = {
        200: "bg-green-300",
        400: "bg-red-300",
        401: "bg-red-300",
        403: "bg-red-300",
        404: "bg-red-300",
        500: "bg-red-300",
    }
    const endpoint_request_bg = req_color[data.endpoint_request] || "bg-gray-300";
    const endpoint_response_bg = res_color[data.endpoint_response] || "bg-gray-300";

    return (
        <div class="mt-12">
            <div class="grid grid-cols-1 gap-4 mb-12 sm:grid-cols-2 sm:gap-8">
                <div class="rounded-lg">
                    <p class="font-extrabold text-xl mb-4">[data.endpoint_title]</p>
                    <p class={`font-mono mb-3 text-sm`}>
                        <span class={`${endpoint_request_bg} max-w-fit p-1 px-2 rounded-md mr-2`}>
                            GET
                        </span>
                        <span>
                            [data.endpoint_url]
                        </span>
                    </p>
                    <p class="text-sm leading-loose mb-6">
                        [data.endpoint_description]
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit arcu quis augue venenatis, quis finibus dolor varius.
                        Aliquam eget convallis nulla, in luctus leo.
                    </p>
                    <div class="mb-6">
                        <p class="font-extrabold text-md mb-4">Request Fields</p>
                        <ul class="space-y-1">
                            <li>
                                <p class="font-medium text-sm pb-3">
                                    <span class={`bg-gray-300 max-w-fit p-1 px-2 rounded-md mr-2`}>
                                        user_id
                                    </span>
                                    <span>
                                        Email of the user to be created
                                    </span>
                                </p>
                            </li>
                        </ul>
                    </div>
                    <div class="mb-6">
                        <p class="font-extrabold text-md mb-4">Response Fields</p>
                        <ul class="space-y-1">
                            <li>
                                <p class="font-medium text-sm pb-3">
                                    <span class={`bg-gray-300 max-w-fit p-1 px-2 rounded-md mr-2`}>
                                        user_id
                                    </span>
                                    <span>
                                        Email of the user to be created
                                    </span>
                                </p>
                            </li>
                        </ul>
                    </div>
                    <div class="mb-6">
                        <p class="font-extrabold text-md mb-4">Response Types</p>
                        <ul class="space-y-1">
                            <li>
                                <p class="font-medium text-sm pb-3">
                                    <span class={`${endpoint_response_bg} max-w-fit p-1 px-2 rounded-md mr-2`}>
                                        user_id
                                    </span>
                                    <span>
                                        Email of the user to be created
                                    </span>
                                </p>
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
                                    code={`curl -X GET https://api.example.com/teams -H "Authorization: B`}
                                    language="bash"
                                />
                            </li>
                            <li>
                                <Code
                                    header="Python"
                                    code={`curl -X GET https://api.example.com/teams -H "Authorization: B`}
                                    language="bash"
                                />
                            </li>
                            <li>
                                <Code
                                    header="Node.js"
                                    code={`curl -X GET https://api.example.com/teams -H "Authorization: B`}
                                    language="bash"
                                />
                            </li>
                        </ul>
                    </div>
                    <div class="mb-6">
                        <p class="font-extrabold text-xl mb-4">Sample Response</p>
                        <Code
                            header="JSON"
                            code={`{}`}
                            language="json"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}