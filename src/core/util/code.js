/* eslint-disable no-eq-null */
/* eslint-disable eqeqeq */
/* eslint-disable no-console */
'use strict'
/* eslint-disable max-params */
/* eslint-disable no-undef */
/* eslint-disable no-throw-literal */
/* eslint-disable no-negated-condition */
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')
const _ = require('lodash')
const shortid = require('shortid')
const {ref} = require('./look-up')

/** Fixed EJS options only — never merge user input here (mitigates RCE via options; satisfies static analysis). */
const EJS_SAFE_RENDER_OPTS = Object.freeze({
  compileDebug: false,
  client: false,
  async: false,
})

const SAFE_PATH_EXPR = /^[A-Za-z_$][\w$]*(\.[\w$]+)*$/

/** Own-enumerable locals only, so prototype pollution cannot add EJS-sensitive keys from tainted objects. */
const ejsLocals = input => {
  const data = Object.create(null)
  if (input == null || typeof input !== 'object') {
    return data
  }
  for (const key of Object.keys(input)) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      data[key] = input[key]
    }
  }
  return data
}
const generateFiles = async (workspace, templatePath, templateInput, lookup, varLookup) => {
  const getRef = ref(varLookup)
  const manifestPath = path.join(templatePath, 'manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, {encoding: 'utf8'}))
  const utilsPath = path.join(templatePath, manifest.main || 'index.js')
  const tasksPath = path.join(templatePath, manifest.tasksConfig || 'tasks.json')
  const preProcessPath = path.join(templatePath, manifest.pre || 'pre.js')
  const postProcessPath = path.join(templatePath, manifest.post || 'post.js')
  // const selectTemplatePath = path.join(templatePath, 'template')
  // import all utils
  let utilsImport = {}
  if (fs.existsSync(utilsPath)) {
    utilsImport = require(utilsPath)
  }
  // get all tasks
  let tasks = {}
  if (fs.existsSync(tasksPath)) {
    tasks = JSON.parse(fs.readFileSync(tasksPath, {encoding: 'utf8'}))
  }
  // start pre processing
  let preProcessExports = {}
  let data = {}
  if (fs.existsSync(preProcessPath)) {
    try {
      preProcessExports = await require(preProcessPath).run(templateInput, lookup, tasks, {utils: {getRef}}) // .then((preProcessExport)=>{
      tasks = preProcessExports.tasks
      data = preProcessExports.data
      console.log('tasks==>', tasks)
      console.log('data==>', data)
      // task Generation
      const taskOutputQueue = []
      if (Object.keys(tasks).length > 0) {
        Object.keys(tasks).forEach(t => {
          let taskInput
          if (typeof tasks[t] === 'string') {
            taskInput = _.get(templateInput, tasks[t])
          } else if (Array.isArray(tasks[t])) {
            taskInput = tasks[t]
          } else {
            throw `error:${t} task input should be type of array or string`
          }
          // console.log("task input is",taskInput);
          if (taskInput.length > 0) {
            taskInput.forEach(i => {
              const taskTemplatePath = path.join(templatePath, 'tasks', t)
              if (!fs.existsSync(taskTemplatePath)) {
                throw `${taskTemplatePath} does not exits`
              }
              let taskPath = workspace
              if (i.path !== undefined) {
                taskPath = i.path
              }
              taskOutputQueue.push(
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                ...createDirectoryContents(taskTemplatePath, taskPath, workspace, Object.assign(Object.assign({lookup,
                  data, appInput: Object.assign({}, templateInput)}, i), {utils: Object.assign(Object.assign(Object.assign({}, utilsImport), _), {getRef})}), []))
            })
          }
        })
      }
      // code generation
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const queue = createDirectoryContents(path.join(templatePath, 'template'), workspace, workspace, Object.assign(Object.assign({}, templateInput), {utils: Object.assign(Object.assign(Object.assign({}, utilsImport), _), {getRef}), data, lookup}), [])
      let outputGen = [...queue, ...taskOutputQueue]
      if (fs.existsSync(postProcessPath)) {
        try {
          outputGen = require(postProcessPath).run(outputGen)
        } catch (error) {
          throw `post generation error:${error}`
        }
      }
      return outputGen
    } catch (error) {
      throw `pre generation error:${error}`
    }
  }
}
const createDirectoryContents = (templatePath, basePath, workspace, templateInput, queue) => {
  const filesToCreate = fs.readdirSync(templatePath)
  filesToCreate.forEach(file => {
    const origFilePath = path.join(templatePath, file)
    const stats = fs.statSync(origFilePath)
    if (stats.isFile()) {
      const templateContent = fs.readFileSync(origFilePath, 'utf8')
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const outputPath = getOutputPath(path.join(basePath, file), Object.assign({}, templateInput))
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const outputContent = getContent(templateContent, templateInput, outputPath, origFilePath)
      if (fs.existsSync(outputPath)) {
        const originalContent = fs.readFileSync(outputPath, 'utf8')
        queue.push({
          id: shortid.generate(),
          status: outputContent !== originalContent ? 'UPDATED' : 'UNCHANGED',
          isUpdate: outputContent !== originalContent,
          outputPath,
          outputContent,
          originalContent,
        })
      } else {
        queue.push({
          id: shortid.generate(),
          status: 'CREATED',
          isUpdate: false,
          outputPath,
          outputContent,
        })
      }
    } else {
      createDirectoryContents(origFilePath, path.join(basePath, file), workspace, templateInput, queue)
    }
  })
  return queue
}
const getContent = (originalContent, input, outputPath, templateSourcePath) => {
  try {
    const opts = Object.assign({filename: templateSourcePath}, EJS_SAFE_RENDER_OPTS)
    const content = ejs.render(originalContent, ejsLocals(input), opts)
    return content
  } catch (error) {
    throw `${error} at ${outputPath}`
  }
}
const getOutputPath = (rawPath, input) => {
  try {
    const p = String(rawPath).replace(/\{_([\s\S]+?)_\}/g, (match, exprRaw) => {
      const expr = String(exprRaw).trim().replace(/^=\s*/, '')
      if (!SAFE_PATH_EXPR.test(expr)) {
        throw new Error(`Unsafe path template expression: "${expr}"`)
      }
      const value = _.get(input, expr)
      return value == null ? '' : String(value)
    })
    // p = p.trim();
    // console.log(p.includes("undefined"));
    return path.normalize(p.trim())
  } catch (error) {
    throw error
  }
}
module.exports = {generateFiles}
