'use client';
import { useRef } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import { v4 as uuidv4 } from 'uuid';

/* ───────────────────────── helpers ────────────────────────── */
const getLanguageFromExtension = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    cpp: 'cpp',
    c: 'c',
    java: 'java',
    go: 'go',
    rb: 'ruby',
    php: 'php',
    rs: 'rust',
    cs: 'csharp',
    sh: 'bash',
  };
  return map[ext] || 'plaintext';
};

/* ───────────────────────── component ───────────────────────── */
export default function EditorTabs({
  files,
  setFiles,
  selected,
  setSelected,
  theme,
}) {
  const editorRef = useRef(null);
  const activeFile = files[selected];

  /* ---------- file ops ---------- */
  const handleAddFile = () => {
    const newFile = {
      id: uuidv4(),
      name: `file-${files.length + 1}.py`,
      content: '',
    };
    setFiles([...files, newFile]);
    setSelected(files.length);
  };

  const handleDeleteFile = (index) => {
    if (confirm('Delete this file?')) {
      const next = files.filter((_, i) => i !== index);
      setFiles(next);
      setSelected(Math.max(0, index - 1));
    }
  };

  /* ---------- editor change ---------- */
  const handleEditorChange = (value) => {
    const next = [...files];
    next[selected].content = value;
    setFiles(next);
  };

  /* ---------- Monaco mount ---------- */
  const handleMount = (editor, monaco) => {
    editorRef.current = editor;

    /* base snippets per language */
    const snippetMap = {
      javascript: [
        {
          label: 'console.log',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'console.log($1);',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Log output to console',
        },
        {
          label: 'function',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'function ${1:name}() {\n\t$0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Function declaration',
        },
      ],
      python: [
        {
          label: 'print',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'print($1)',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Print to console',
        },
        {
          label: 'def',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'def ${1:func_name}():\n\t$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Define a function',
        },
      ],
      cpp: [
        {
          label: 'cout',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'std::cout << $1 << std::endl;',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Print to console (C++)',
        },
      ],
      java: [
        {
          label: 'main',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            'public static void main(String[] args) {\n\t$0\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Main method (Java)',
        },
      ],
      go: [
        {
          label: 'fmt.Println',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'fmt.Println($1)',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Print to console (Go)',
        },
      ],
      ruby: [
        {
          label: 'puts',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'puts $1',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Print to console (Ruby)',
        },
      ],
      c: [
        {
          label: 'printf',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'printf("$1");',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Print to console (C)',
        },
      ],
    };

    /* register each language once */
    Object.entries(snippetMap).forEach(([lang, suggestions]) => {
      monaco.languages.registerCompletionItemProvider(lang, {
        provideCompletionItems: () => ({ suggestions }),
      });
    });

    /* keep JS/TS model sync fast */
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  };

  /* ─────────────────────── render ─────────────────────── */
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* ── Tabs bar ── */}
      <div
        className={`flex items-center px-2 py-1 space-x-2 overflow-x-auto border-b ${
          theme === 'vs-dark'
            ? 'bg-[#1e1e1e] border-gray-700'
            : 'bg-gray-100 border-gray-300'
        }`}
      >
        {files.map((f, idx) => (
          <div
            key={f?.id|| uuidv4()} /* stable key! */
            onClick={() => setSelected(idx)}
            className={`group relative flex items-center px-3 py-1 rounded-t-md cursor-pointer select-none transition-colors ${
              selected === idx
                ? theme === 'vs-dark'
                  ? 'bg-[#2d2d2d] text-white'
                  : 'bg-white text-black border border-b-0'
                : theme === 'vs-dark'
                ? 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className="truncate max-w-[140px] pr-5">{f.name}</span>

            {/* close icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFile(idx);
              }}
              title="Close"
              className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition"
            >
              <FaTimes />
            </button>
          </div>
        ))}

        {/* add file */}
        <button
          title="Add File"
          onClick={handleAddFile}
          className="flex items-center justify-center w-8 h-8 rounded bg-green-600 text-white hover:bg-green-700 shrink-0"
        >
          <FaPlus />
        </button>
      </div>

      {/* ── Monaco editor ── */}
      <div className="flex-1 overflow-hidden">
        {activeFile && (
          <Editor
            height="100%"
            language={getLanguageFromExtension(activeFile.name)}
            value={activeFile.content}
            onChange={handleEditorChange}
            onMount={handleMount}
            theme={theme}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              tabSize: 2,
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              snippetSuggestions: 'inline',
            }}
          />
        )}
      </div>
    </div>
  );
}
