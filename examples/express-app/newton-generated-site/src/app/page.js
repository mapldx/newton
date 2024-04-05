"use client";

import { useEffect, useState } from "react";
import Code from "./components/code";
import Endpoint from "./components/endpoint";
import data from "./newton/api-documentation.json";
import parameters from "./newton/meta-parameters.json";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [titles, setTitles] = useState([]);
  const [baseUrl, setBaseUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTitles, setFilteredTitles] = useState([]);
  const [isDark, setIsDark] = useState(parameters.DARK_MODE);

  useEffect(() => {
    let titles = [];
    data.flatMap((endpoint) => {
      titles.push(endpoint[0].endpoint_title);
    });
    let baseUrl = (parameters.BASE_URL).replace(/^https?:\/\//, '');
    setBaseUrl(baseUrl);
    setTitles(titles);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const filtered = titles.filter(title =>
      title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTitles(filtered);
  }, [searchQuery, titles]);

  return (
    <>
      {isLoaded ? (
        <main>
          <header class={`${isDark ? 'bg-[#121212]' : 'bg-slate-500'}`}>
            <div class="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
              <div class="sm:flex sm:items-center sm:justify-between">
                <div class="text-center sm:text-left">
                  <h1 class={`text-2xl font-bold ${isDark ? 'text-white' : 'text-white'} sm:text-3xl`}>{parameters.SITE_TITLE}</h1>
                  <p class={`mt-1.5 text-sm ${isDark ? 'text-white' : 'text-white'}`}>Generated on {parameters.DATE_GENERATED}</p>
                </div>
                <div class="relative mt-4 sm:mt-0 sm:flex-row sm:items-center">
                  <div class="inline-flex items-center overflow-hidden rounded-md border bg-white w-full">
                    <input
                      type="text"
                      class="block w-full rounded-lg text-gray-800 p-3 sm:max-w-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {searchQuery && (
                    <div
                      class="absolute end-0 z-10 mt-2 rounded-md border border-gray-100 bg-white shadow-lg w-full"
                      role="menu"
                    >
                      <div class="p-2">
                        {filteredTitles.map((title, index) => (
                          <a key={index}
                            class="block w-full rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            role="menu"
                            href={`#${title.replace(' ', '-')}`}
                            onClick={() => setSearchQuery('')}
                          >
                            {title}
                          </a>
                        ))}
                        {filteredTitles.length === 0 && (
                          <div class="px-4 py-2 text-sm text-gray-500">
                            No results found.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
          <div class={`${isDark ? 'bg-[#1e1f29]' : 'bg-white'} grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-8 pt-12 px-8 lg:px-24`}>
            <div class="h-full rounded-lg">
              <p class={`font-semibold pb-3 text-sm tracking-wide ${isDark ? 'text-slate-300' : 'text-black'}`}>{baseUrl}</p>
              <ul class="space-y-1">
                {titles.map((title, index) => {
                  return (
                    <li key={index}>
                      <a href={`#${title.replace(' ', '-')}`}
                        class={`block rounded-lg px-4 py-2 text-sm font-medium ${isDark ? 'text-white hover:bg-[#8a929f] hover:text-white' : 'text-black hover:bg-slate-300 hover:text-black'}`}>
                        {title}
                      </a>
                    </li>
                  );
                }
                )}
              </ul>
              <div class="mt-6">
                <p class={`font-mono text-xs font-semibold tracking-wide ${isDark ? 'text-slate-300' : 'text-black'}`}>Generated using&nbsp;
                  <a href="https://github.com/mapldx/newton" target="_blank" class="underline underline-offset-2 hover:opacity-70 bg-slate-300 text-black">
                    🦊 mapldx/newton &rarr;
                  </a>
                </p>
              </div>
            </div>
            <div class="rounded-lg lg:col-span-4 lg:pl-12">
              {/* <div class="grid grid-cols-1 gap-4 mb-12 sm:grid-cols-2 sm:gap-8">
                <div class="rounded-lg">
                  <p class="font-extrabold text-xl mb-4">API Reference</p>
                  <p class="text-sm leading-loose">
                    {parameters.DESCRIPTION}
                  </p>
                </div>
                <div>
                  <div class="mb-6">
                    <p class="font-extrabold text-xl mb-4">API Usage</p>
                    <Code
                      header="Base URL"
                      code={`${parameters.BASE_URL}`}
                      language="bash"
                    />
                  </div>
                  <div>
                    <p class="font-extrabold text-xl mb-4">{parameters.ADDITIONAL_NOTE.TITLE}</p>
                    <p class="text-sm leading-loose">
                      {parameters.ADDITIONAL_NOTE.CONTENT}
                    </p>
                  </div>
                </div>
              </div>
              <hr></hr> */}
              {data.map((endpoint, index) => {
                return (
                  <Endpoint data={endpoint[0]} isDark={isDark} key={index} />
                );
              })}
            </div>
          </div>
        </main>
      ) : (
        <main>
          <p>Loading...</p>
        </main>
      )}
    </>
  );
}
