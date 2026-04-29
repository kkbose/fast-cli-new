/* eslint-disable unicorn/filename-case */
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
// import {join, dirname} from 'path'
// import * as lowdb from 'lowdb'
// import * as low from 'lowdb'
// import * as FileSync from 'lowdb/adapters/FileSync'
// import {fileURLToPath} from 'url'
const todoFile = path.join(
  os.homedir(),
  'Documents',
  'VS',
  'fast',
  'src',
  'api',
  'todos.json'
)

interface Todo {
  done: boolean;
  todo: string;
}
type Data = {
  posts: string[]; // Expect posts to be an array of strings
}
// const __dirname = dirname(fileURLToPath(''));
// const file = join(__dirname, 'db.json')
// const adapter = new FileSync('db.json')
// const db = low(adapter)
// const write: Data = db.defaults({posts: []}).write()
class TodoAPI {
  private todos: Todo[] = [];

  constructor() {
    this.todos = JSON.parse(fs.readFileSync(todoFile, {encoding: 'utf-8'}))
  }

  private saveTodos() {
    // make folder for the first run
    if (!fs.existsSync(path.dirname(todoFile))) {
      fs.mkdirSync(path.dirname(todoFile))
    }
    const data = JSON.stringify(this.todos)
    fs.writeFileSync(todoFile, data, {encoding: 'utf-8'})
  }

  initDb() {
    // db.write()
  }

  add(todo: string, done?: boolean) {
    done = done || false
    const newTodo: Todo = {done, todo}
    this.todos.push(newTodo)
    this.saveTodos()
  }

  remove(index: number) {
    this.todos.splice(index, 1)
    this.saveTodos()
  }

  list() {
    return this.todos
  }

  get(index: number): Todo {
    return this.todos[index]
  }

  done(index: number) {
    this.todos[index].done = true
    this.saveTodos()
  }

  undone(index: number) {
    this.todos[index].done = false
    this.saveTodos()
  }
}

const api = new TodoAPI()
export default api
// const __dirname = dirname(fileURLToPath(import.meta.url));
// file = join(__dirname, 'db.json')
// const adapter = new JSONFile(file)
// const db = new Low(adapter)// Read data from JSON file, this will set db.data contentawait
// db.read()// If file.json doesn't exist, db.data will be null// Set default data//
// db.data = db.data || { posts: [] } // Node < v15.x
// db.data ||= { posts: [] }             // Node >= 15.x// Create and query items using plain JS
// db.data.posts.push('hello world')
// db.data.posts[0]// You can also use this syntax if you preferconst { posts } =
// db.dataposts.push('hello world')// Write db.data content to
// db.jsonawait db.write()
