import fs from 'fs';
import path from 'path';

export function getPythonExecutable(): string {
  if (process.env.PYTHON_PATH && fs.existsSync(process.env.PYTHON_PATH)) {
    return process.env.PYTHON_PATH;
  }
  const venvPython = path.resolve(process.cwd(), '.venv/bin/python');
  if (fs.existsSync(venvPython)) {
    return venvPython;
  }
  const venvPythonWin = path.resolve(process.cwd(), '.venv/Scripts/python.exe');
  if (fs.existsSync(venvPythonWin)) {
    return venvPythonWin;
  }
  return 'python3';
}
