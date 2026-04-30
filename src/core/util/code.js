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

const EJS_FILENAME_EXPR_PATTERN = /\{_%=\s*([A-Za-z0-9_$.[\]]+)\s*%_\}/g
const TEMPLATE_BASE_DIR = path.resolve(__dirname, 'templates')

/** Own-enumerable locals only, so prototype pollution cannot add EJS-sensitive keys from tainted objects. */
const ejsLocals = input => {
  const data = Object.create(null)
  if (input == null || typeof input !== 'object') {
    data.utils = Object.create(null)
    return data
  }
  for (const key of Object.keys(input)) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      data[key] = input[key]
    }
  }
  if (data.utils == null || typeof data.utils !== 'object') {
    data.utils = Object.create(null)
  }
  return data
}
/** Resolve template path inside trusted base and block traversal. */
const getTrustedTemplateContent = (templateSourcePath, templateBaseDir = TEMPLATE_BASE_DIR) => {
  if (typeof templateSourcePath !== 'string' || templateSourcePath.trim() === '') {
    throw new Error('Invalid template source path')
  }
  if (typeof templateBaseDir !== 'string' || templateBaseDir.trim() === '') {
    throw new Error('Invalid template base path')
  }
  const resolvedBaseDir = path.resolve(templateBaseDir)
  const resolvedPath = path.resolve(resolvedBaseDir, templateSourcePath)
  if (!resolvedPath.startsWith(resolvedBaseDir + path.sep)) {
    throw new Error('Access denied: outside trusted template directory')
  }
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Template not found: ${templateSourcePath}`)
  }
  return fs.readFileSync(resolvedPath, 'utf8')
}
const renderOutputPathTemplate = (rawPath, input) =>
  rawPath.replace(EJS_FILENAME_EXPR_PATTERN, (_, expression) => {
    const value = _.get(input, expression)
    if (value == null) {
      return ''
    }
    return String(value)
  })
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
        for (const t of Object.keys(tasks)) {
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
            for (const i of taskInput) {
              const taskTemplatePath = path.join(templatePath, 'tasks', t)
              if (!fs.existsSync(taskTemplatePath)) {
                throw `${taskTemplatePath} does not exits`
              }
              let taskPath = workspace
              if (i.path !== undefined) {
                taskPath = i.path
              }
              // eslint-disable-next-line @typescript-eslint/no-use-before-define
              const taskQueue = await createDirectoryContents(taskTemplatePath, taskPath, workspace, Object.assign(Object.assign({lookup,
                data, appInput: Object.assign({}, templateInput)}, i), {utils: Object.assign(Object.assign(Object.assign({}, utilsImport), _), {getRef})}), [])
              taskOutputQueue.push(...taskQueue)
            }
          }
        }
      }
      // code generation
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const queue = await createDirectoryContents(path.join(templatePath, 'template'), workspace, workspace, Object.assign(Object.assign({}, templateInput), {utils: Object.assign(Object.assign(Object.assign({}, utilsImport), _), {getRef}), data, lookup}), [], templatePath)
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
const createDirectoryContents = async (templatePath, basePath, workspace, templateInput, queue, templateRootPath = templatePath) => {
  const filesToCreate = fs.readdirSync(templatePath)
  for (const file of filesToCreate) {
    const origFilePath = path.join(templatePath, file)
    const stats = fs.statSync(origFilePath)
    if (stats.isFile()) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const outputPath = await getOutputPath(path.join(basePath, file), Object.assign({}, templateInput))
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const outputContent = await getContent(templateInput, outputPath, origFilePath, templateRootPath)
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
      await createDirectoryContents(origFilePath, path.join(basePath, file), workspace, templateInput, queue, templateRootPath)
    }
  }
  return queue
}
const getContent = async (input, outputPath, templateSourcePath, templateRootPath) => {
  try {
    const relativeTemplatePath = path.relative(path.resolve(templateRootPath), path.resolve(templateSourcePath))
    const trustedTemplateContent = getTrustedTemplateContent(relativeTemplatePath, templateRootPath)
    const opts = Object.assign({filename: templateSourcePath}, EJS_SAFE_RENDER_OPTS)
    // Safe: template loaded from trusted directory via getTrustedTemplateContent
    return ejs.render(trustedTemplateContent, ejsLocals(input), opts)
  } catch (error) {
    throw `${error} at ${outputPath}`
  }
}
const getOutputPath = async (rawPath, input) => {
  try {
    const p = renderOutputPathTemplate(rawPath, ejsLocals(input))
    // p = p.trim();
    // console.log(p.includes("undefined"));
    return path.normalize(p.trim())
  } catch (error) {
    throw error
  }
}
module.exports = {generateFiles}
