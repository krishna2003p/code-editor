import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const execPromise = promisify(exec);

const extensionMap = {
  python: 'py',
  javascript: 'js',
  typescript: 'ts',
  cpp: 'cpp',
  c: 'c',
  java: 'java',
  ruby: 'rb',
  go: 'go',
  php: 'php',
  rust: 'rs',
  csharp: 'cs',
  bash: 'sh'
};

const commands = {
  python: (file) => `python3 "${file}"`,
  javascript: (file) => `node "${file}"`,
  typescript: (file) => `ts-node "${file}"`,
  cpp: (file) => {
    const outFile = file.replace('.cpp', '');
    return `g++ "${file}" -o "${outFile}" && "${outFile}"`;
  },
  c: (file) => {
    const outFile = file.replace('.c', '');
    return `gcc "${file}" -o "${outFile}" && "${outFile}"`;
  },
  java: (file) => {
    const className = path.basename(file, '.java');
    const dir = path.dirname(file);
    return `javac "${file}" && java -cp "${dir}" "${className}"`;
  },
  ruby: (file) => `ruby "${file}"`,
  go: (file) => `go run "${file}"`,
  php: (file) => `php "${file}"`,
  rust: (file) => {
    const outFile = `${file}.out`;
    return `rustc "${file}" -o "${outFile}" && "${outFile}"`;
  },
  csharp: (file) => {
    const outFile = file.replace('.cs', '.exe');
    return `mcs "${file}" && mono "${outFile}"`;
  },
  bash: (file) => `bash "${file}"`
};

export async function POST(request) {
  const startTime = Date.now();

  try {
    const { language, code } = await request.json();

    if (!language || !code) {
      return Response.json({ error: 'Language and code are required' }, { status: 400 });
    }

    const ext = extensionMap[language];
    if (!ext) {
      return Response.json({ error: 'Unsupported language' }, { status: 400 });
    }

    const tempDir = os.tmpdir();
    const fileName = `code-${Date.now()}.${ext}`;
    const filePath = path.join(tempDir, fileName);

    await fs.writeFile(filePath, code);
    const command = commands[language]?.(filePath);

    if (!command) {
      return Response.json({ error: 'No command defined for this language' }, { status: 400 });
    }

    const { stdout, stderr } = await execPromise(command, { timeout: 5000 });

    // Clean up the temp files
    await fs.unlink(filePath).catch(() => {});
    
    // Remove compiled files (e.g., .out, .exe) if any
    const compiledFiles = [filePath + '.out', filePath.replace(/\.(cpp|c|cs)/, ''), filePath.replace('.cs', '.exe')];
    for (const f of compiledFiles) {
      await fs.unlink(f).catch(() => {});
    }

    const endTime = Date.now();

    return Response.json({
      success: true,
      language,
      output: stdout,
      stderr,
      duration: `${endTime - startTime}ms`
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      stderr: error.stderr || null
    }, { status: 500 });
  }
}
