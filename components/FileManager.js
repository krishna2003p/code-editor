'use client';
import { useState } from 'react';
import { FaFileAlt, FaTrashAlt, FaEdit, FaCheck, FaPlus, FaTimes } from 'react-icons/fa';

export default function FileManager({
  files,
  setFiles,
  selected,
  setSelected,
  theme,
  showSidebar,
  onClose,
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [newName, setNewName] = useState('');

  const isDark = theme === 'vs-dark';

  const handleRename = (index) => {
    const updatedFiles = [...files];
    updatedFiles[index].name = newName || `untitled-${index + 1}.js`;
    setFiles(updatedFiles);
    setEditingIndex(null);
  };

  const handleDelete = (index) => {
    if (confirm('Are you sure you want to delete this file?')) {
      const updatedFiles = files.filter((_, i) => i !== index);
      setFiles(updatedFiles);
      if (selected >= updatedFiles.length) setSelected(updatedFiles.length - 1);
    }
  };

  const addNewFile = () => {
    const newIndex = files.length + 1;
    const defaultName = `untitled-${newIndex}.js`;
    const newFile = { name: defaultName, language: 'javascript', content: '', type: 'file', path: defaultName };
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    setSelected(updatedFiles.length - 1);
    setEditingIndex(updatedFiles.length - 1);
    setNewName(defaultName);
  };

  return (
    <div
      className={`
        fixed top-0 left-0 h-full w-59 z-30
        transform transition-transform duration-300 ease-in-out
        ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'} shadow-lg
        md:relative md:translate-x-0
      `}
    >
      {/* Header */}
      <div
        className={`flex justify-between items-center px-3 py-2 font-semibold text-sm border-b
          ${isDark ? 'border-gray-700 text-white' : 'border-gray-300 text-black'} bg-opacity-90`}
      >
        <span>EXPLORER</span>
        <div className="flex items-center gap-3">
          <button
            onClick={addNewFile}
            className={`text-sm hover:scale-110 transition-transform ${isDark ? 'text-green-400 hover:text-green-300' : 'text-green-700 hover:text-green-600'}`}
            title="Add File"
          >
            <FaPlus />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className={`md:hidden text-sm hover:scale-110 transition-transform ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}
              title="Close Sidebar"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Files */}
      <div className="space-y-1 p-2 overflow-y-auto h-[calc(100%-40px)]">
        {files.map((file, index) => (
          <div
            key={index}
            className={`group flex items-center justify-between px-2 py-1 cursor-pointer text-sm rounded-md transition
              ${selected === index
                ? isDark
                  ? 'bg-[#2b2b2b] text-white'
                  : 'bg-gray-200 text-black'
                : isDark
                ? 'text-gray-300 hover:bg-[#2d2d2d]'
                : 'text-gray-700 hover:bg-gray-100'}
            `}
            onClick={() => setSelected(index)}
          >
            {editingIndex === index ? (
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename(index);
                  if (e.key === 'Escape') setEditingIndex(null);
                }}
                className={`bg-transparent border-b w-full focus:outline-none ${
                  isDark ? 'text-white border-gray-500' : 'text-black border-gray-400'
                }`}
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2 flex-1 overflow-hidden">
                <FaFileAlt className="shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
            )}

            {/* Action Icons */}
            <div className="hidden group-hover:flex gap-2 ml-2 shrink-0">
              {editingIndex === index ? (
                <button
                  onClick={() => handleRename(index)}
                  className={`hover:scale-110 transition-transform ${isDark ? 'text-green-400' : 'text-green-700'}`}
                  title="Save"
                >
                  <FaCheck />
                </button>
              ) : (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingIndex(index);
                      setNewName(file.name);
                    }}
                    className={`hover:scale-110 transition-transform ${isDark ? 'text-yellow-300 hover:text-yellow-200' : 'text-yellow-600 hover:text-yellow-500'}`}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    className={`hover:scale-110 transition-transform ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}
                    title="Delete"
                  >
                    <FaTrashAlt />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
