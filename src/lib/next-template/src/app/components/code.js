'use client';

import { CopyBlock, dracula } from 'react-code-blocks';

export default function Code({ header, code, language }) {
    return (
        <div>
            <div class="font-mono bg-gray-400 px-4 py-1 rounded-t-lg text-slate-200 font-semibold text-sm">
                {header}
            </div>
            <div class="bg-gray-500 rounded-b-lg">
                <CopyBlock
                    text={code}
                    language={language}
                    showLineNumbers={true}
                    theme={dracula}
                    customStyle={{
                        padding: '0.5rem',
                        boxShadow: '1px 2px 3px rgba(0,0,0,0.35)',
                        fontSize: '0.8rem',
                        overflowX: 'auto',
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                    }}
                    codeBlock={true}
                />
            </div>
        </div>
    );
}