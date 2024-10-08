import { useEffect } from "react";
import Prism from "prismjs";

import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "../../../styles/prism-local.css";

export default function NextJsContent() {
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <>
      <h3 className='text-lg font-semibold mb-4'>Next.js Configuration</h3>
      <ol className='list-decimal pl-5 space-y-3'>
        <li className='text-sm'>Open nextjs.config.js</li>
        <li className='text-sm'>Add rewrite rules</li>
      </ol>
      <div className='mt-6'>
        <h4 className='text-md font-semibold mb-2'>next.config.js Example:</h4>
        <div className='w-full overflow-x-auto'>
          <pre className='rounded-md w-full'>
            <code className='language-javascript !text-xs'>
              {`// next.config.js
module.exports = {
  async rewrite() {
    return [
      {
        source: '/.well-known/:path*',
        destination: 'https://lightningdomain.io/rewrite/:path*',
      },
    ]
  },
}`}
            </code>
          </pre>
        </div>
      </div>
    </>
  );
}
