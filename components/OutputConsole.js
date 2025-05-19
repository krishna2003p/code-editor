'use client';
import { FaDownload, FaRegTrashAlt } from 'react-icons/fa';

export default function OutputConsole({ output, resetOutput }) {
  const isError = output.toLowerCase().includes('error') || output.toLowerCase().includes('traceback');

  return (
    <div className="rounded-md overflow-hidden border border-gray-700 shadow-lg mt-4">
      {/* Terminal Header */}
      <div className="bg-[#1f1f1f] text-white px-3 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Terminal control dots */}
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>

          <span className="ml-4 font-semibold text-sm">Terminal Output</span>
        </div>

        {/* Right-side actions */}
        <div className="space-x-3 text-base">
          <button
            onClick={resetOutput}
            className="hover:text-red-400 transition-colors"
            title="Clear Output"
          >
            <FaRegTrashAlt />
          </button>
          <button
            onClick={() => {
              const blob = new Blob([output], { type: 'text/plain' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'output.txt';
              a.click();
            }}
            className="hover:text-blue-400 transition-colors"
            title="Download Output"
          >
            <FaDownload />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div
        className={`bg-black ${
          isError ? 'text-red-400' : 'text-green-400'
        } font-mono text-sm px-4 py-3 h-48 overflow-auto whitespace-pre-wrap`}
      >
        {output || <span className="text-gray-500">No output yet...</span>}
      </div>
    </div>
  );
}
