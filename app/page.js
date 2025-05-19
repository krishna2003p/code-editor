'use client';
import { useState } from 'react';
import { FaPlay, FaUndo, FaRedo, FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';
import EditorTabs from '../components/EditorTabs';
import OutputConsole from '../components/OutputConsole';
import FileManager from '../components/FileManager';

export default function Home() {
  const [files, setFiles] = useState([
    { name: 'main.py', language: 'python', content: '', type: 'file', path: 'main.py' }
  ]);
  const [selected, setSelected] = useState(0);
  const [output, setOutput] = useState('');
  const [theme, setTheme] = useState('vs-dark');
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);

  const extensionToLanguage = {
    py: 'python',
    js: 'javascript',
    ts: 'typescript',
    cpp: 'cpp',
    c: 'c',
    java: 'java',
    rb: 'ruby',
    go: 'go',
    php: 'php',
    rs: 'rust',
    cs: 'csharp',
    sh: 'bash',
  };

  const handleRun = async () => {
    const file = files[selected];
    const extension = file.name.split('.').pop();
    const language = extensionToLanguage[extension] || 'plaintext';
    const code = file.content;
  
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code }),
      });
    
      const data = await res.json();
    
      if (res.ok) {
        setOutput(data.output || data.stderr || 'No output');
      } else {
        setOutput(data.error || data.stderr || 'An error occurred during execution.');
      }
    } catch (error) {
      setOutput(`Execution failed: ${error.message}`);
    }
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'vs-dark' ? 'light' : 'vs-dark'));
  };

  const clearOutput = () => {
    setOutput('');
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const prev = [...undoStack];
      const lastState = prev.pop();
      setUndoStack(prev);
      setRedoStack([...redoStack, [...files]]);
      setFiles(lastState);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const prev = [...redoStack];
      const nextState = prev.pop();
      setRedoStack(prev);
      setUndoStack([...undoStack, [...files]]);
      setFiles(nextState);
    }
  };

  const updateFile = (index, updatedFile) => {
    const newFiles = [...files];
    setUndoStack([...undoStack, [...files]]);
    newFiles[index] = updatedFile;
    setFiles(newFiles);
  };

  const handleCloseTab = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    if (index === selected) {
      setSelected(Math.max(0, index - 1));
    } else if (index < selected) {
      setSelected(selected - 1);
    }
  };

  return (
    <div
      className={`flex flex-col md:flex-row h-screen overflow-hidden relative ${
        theme === 'vs-dark' ? 'bg-[#1e1e1e] text-white' : 'bg-white text-black'
      }`}
    >
      {/* Sidebar */}
      <div
        className={`
          ${theme === 'vs-dark' ? 'bg-[#1e1e1e]' : 'bg-gray-200'}
          w-64 h-full p-2 border-r border-gray-700 overflow-auto z-30
          fixed md:relative top-0 left-0
          transition-transform duration-300 ease-in-out
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ minWidth: '16rem' }} // ensures width consistency on toggle
      >
        <FileManager
          files={files}
          setFiles={setFiles}
          selected={selected}
          setSelected={setSelected}
          theme={theme}
          onClose={() => setShowSidebar(false)}
        />
      </div>

      {/* Main Content */}
      <div
        className={`
          flex-1 flex flex-col w-full
          transition-all duration-300 ease-in-out
          ${showSidebar ? 'md:ml-0' : 'md:ml-0'}
          // Add min-width 0 to allow flex shrinking properly in some browsers
        `}
        style={{ minWidth: 0 }}
      >
        {/* Header */}
        <div
          className={`${theme === 'vs-dark' ? 'bg-[#2a2d2e]' : 'bg-gray-100'} px-4 py-2 border-b border-gray-700 flex justify-between items-center flex-wrap gap-2`}
        >
          {/* Left: Sidebar Toggle & Title */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-xl"
              onClick={() => setShowSidebar((prev) => !prev)}
              title="Toggle Sidebar"
            >
              {showSidebar ? <FaTimes /> : <FaBars />}
            </button>
            <h1 className="font-semibold text-lg">My Code Editor</h1>
          </div>

          {/* Right: Control Buttons */}
          <div className="flex items-center gap-4">
            <button onClick={handleUndo} title="Undo" className="hover:text-yellow-400">
              <FaUndo />
            </button>
            <button onClick={handleRedo} title="Redo" className="hover:text-yellow-400">
              <FaRedo />
            </button>
            <button onClick={handleRun} title="Run" className="flex items-center gap-1 hover:text-green-400">
              <FaPlay /> Run
            </button>
            <button onClick={handleThemeToggle} title="Toggle Theme" className="hover:text-blue-400">
              {theme === 'vs-dark' ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </div>

        {/* Editor Tabs */}
        <EditorTabs
          files={files}
          setFiles={setFiles}
          selected={selected}
          setSelected={setSelected}
          updateFile={updateFile}
          theme={theme}
          handleCloseTab={handleCloseTab}
        />

        {/* Output */}
        <OutputConsole output={output} resetOutput={clearOutput} />
      </div>
    </div>
  );
}
