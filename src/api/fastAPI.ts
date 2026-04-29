/* eslint-disable no-new */
/* eslint-disable unicorn/filename-case */
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import * as cp from 'child_process'
import {promisify} from 'util'

const execFile = promisify(cp.execFile)

const todoFile = path.join(
  os.homedir(),
  'Documents',
  'VS',
  'fast',
  'src',
  'api',
  'todos.json'
)

interface Fast {
  done: boolean;
  todo: string;
}

class FastAPI {
  private obj: Fast[] = [];

  constructor() {
    try {
      this.obj = JSON.parse(fs.readFileSync(todoFile, {encoding: 'utf-8'}))
    } catch (error) {
      // File doesn't exist yet, initialize empty
      this.obj = []
    }
  }

  private saveTodos() {
    // make folder for the first run
    if (!fs.existsSync(path.dirname(todoFile))) {
      fs.mkdirSync(path.dirname(todoFile), {recursive: true})
    }
    const data = JSON.stringify(this.obj)
    fs.writeFileSync(todoFile, data, {encoding: 'utf-8'})
  }

  // Using execFile instead of exec to prevent shell injection
  // Parameters are passed as separate arguments instead of a command string
  execShell = async (cmd: string, args: string[] = []) => {
    try {
      const {stdout} = await execFile(cmd, args)
      return stdout
    } catch (error) {
      throw new Error(`Command execution failed: ${error}`)
    }
  }

  async runFile(fileName: string) {
    // Validate fileName to prevent path traversal attacks
    if (!fileName || fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      throw new Error('Invalid file name')
    }

    const targetDir = path.join(os.homedir(), '.fast', 'templates')
    
    // Ensure target directory exists safely
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, {recursive: true})
    }

    const newDir = path.join(targetDir, fileName)
    
    // Verify the resolved path is within targetDir to prevent path traversal
    if (!newDir.startsWith(targetDir)) {
      throw new Error('Invalid directory')
    }

    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir, {recursive: true})
    }

    try {
      const {stdout} = await execFile('cmd', ['/c', 'cd'])
      return stdout
    } catch (error) {
      throw new Error(`Failed to run file: ${error}`)
    }
  }
}

const fastApi = new FastAPI()
export default fastApi
