/* eslint-disable quotes */
/* eslint-disable spaced-comment */
/* eslint-disable node/no-missing-require */
/* eslint-disable no-console */
/* eslint-disable no-throw-literal */
/* eslint-disable lines-between-class-members */
const fastLexer  = require('./lexer')
const parser  = require('./parser')

const FastParser = parser.FastParser
const parserInstance = new FastParser()
const BaseFastVisitor = parserInstance.getBaseCstVisitorConstructor()

class FastToAstVisitor extends BaseFastVisitor {
  entities = [];
  apps = [];
  resources = [];
  components = [];
  variables = [];
  constructor() {
    super()
    this.validateVisitor()
  }
  prog(ctx) {
    //console.log("ctx ===>", ctx)
    try {
      if (Object.keys(ctx).length === 0) {
        throw 'Error: Project is not declared'
      }

      this.entities = this.entityDeclaration(
        ctx.entityDeclaration,
        this.enumDeclaration(ctx.enumDeclaration)
      )
      this.variables = [
        ...this.entities.map(i => {
          return {...i, type: 'entity', variable: i.entity}
        }),
      ]
      const relations = this.relationshipsDeclaration(
        ctx.relationshipsDeclaration
      )
      this.entities = this.entities.map(i => {
        if (Object.keys(relations).length === 0)
          return {...i, relations}

        const newLocal = function (relation) {
          const refLHSEntity = /\\:([a-zA-Z0-9\\_]*)\|/g
          const refRHSEntity = /\\:([a-zA-Z0-9\\_]*)\|/g
          const matchLHSEntity = refLHSEntity.exec(relation.lhs)
          const matchRHSEntity = refRHSEntity.exec(relation.rhs)

          if ((matchLHSEntity !== null && matchLHSEntity[1] === i.entity) || (matchRHSEntity !== null && matchRHSEntity[1] === i.entity))
            return i
        }
        const thisEntityRel = relations.filter(newLocal)
        return {...i, relations: thisEntityRel}
      })
      this.components = this.componentDeclaration(ctx.componentDeclaration)
      this.resources = this.resourceDeclaration(ctx.resourceDeclaration)
      const lookUpTable = {
        enums: this.enumDeclaration(ctx.enumDeclaration),
        components: this.components,
        entities: this.entities,
        relationships: relations,
        resources: this.resources.filter(i => i.taskId),
      }
      this.variables = this.formatVariables(lookUpTable)
      this.apps = this.applicationDeclaration(ctx.applicationDeclaration)
      return {
        ...this.projectDeclaration(ctx.projectDeclaration),
        lookUpTable,
        variables: this.formatVariables(lookUpTable),
      }
    } catch (error) {
      throw 'Language Exception: ' + error
    }
  }
  formatVariables(lookUpTable) {
    return [
      ...lookUpTable.entities.map(i => {
        return {...i, type: 'entity', variable: i.entity}
      }),
      ...lookUpTable.enums.map(i => {
        return {...i, type: 'enum', variable: i.Enum}
      }),
      ...lookUpTable.resources
      .filter(i => i.taskId)
      .map(i => {
        return {...i, type: 'resource', variable: i.appName}
      }),
      ...lookUpTable.components.map(i => {
        return {...i, type: 'component', variable: i.componentName}
      }),
    ]
  }

  metaItem(ctx = []) {
    return ctx.reduce((acc, ele) => {
      const key = ele.children.key[0].image
      const val = this.value(ele.children.value[0])
      acc[key] = val
      return acc
    }, {})
  }
  relationshipsItems(ctx = []) {
    return ctx.map(ele => {
      const lhs = this.reference(ele.children.LHS)
      const rhs = this.reference(ele.children.RHS)
      let relationship
      if (ele.children.OneToOne) {
        relationship = 'OneToOne'
      }
      if (ele.children.ManyToOne) {
        relationship = 'ManyToOne'
      }
      if (ele.children.OneToMany) {
        relationship = 'OneToMany'
      }
      if (ele.children.ManyToMany) {
        relationship = 'ManyToMany'
      }
      let meta = {}
      if (ele.children.meta) {
        meta = this.meta(ele.children.meta)
      }
      return {lhs, rhs, relationship, meta}
    })
  }
  pathDeclaration(ctx = []) {
    return this.value(ctx)
  }
  value(ctx) {
    if (ctx.children.Constant) {
      return ctx.children.Constant[0].image
    }
    if (ctx.children.String) {
      return ctx.children.String[0].image.slice(1, -1)
    }
    if (ctx.children.True) {
      return true
    }
    if (ctx.children.False) {
      return false
    }
    if (ctx.children.map) {
      return this.map(ctx.children.map)
    }
    if (ctx.children.array) {
      return this.array(ctx.children.array)
    }
    if (ctx.children.reference) {
      return this.reference(ctx.children.reference)
    }
    return {
      ctx,
    }
  }
  array(ctx = []) {
    if (ctx.length === 0 || !ctx[0].children.items) return []

    return ctx[0].children.items.map(ele => {
      if (ele.children.String) {
        return ele.children.String[0].image.slice(1, -1)
      }
      if (ele.children.Constant) {
        return ele.children.Constant[0].image
      }
      if (ele.children.True) {
        return true
      }
      if (ele.children.False) {
        return false
      }
      if (ele.children.map) {
        return this.map(ele.children.map)
      }
      if (ele.children.array) {
        return this.array(ele.children.array)
      }
      if (ele.children.reference) {
        return this.reference(ele.children.reference)
      }

      return []
    })
  }
  map(ctx = []) {
    if (ctx.length === 0 || !ctx[0].children.mapItem) return {}
    return this.mapItem(ctx[0].children.mapItem)
  }
  mapItem(ctx = []) {
    return ctx.reduce((acc, cur) => {
      const key = cur.children.key[0].image
      const value = this.value(cur.children.value[0])
      acc[key] = value
      return acc
    }, {})
  }
  module(ctx = []) {
    return ctx.reduce((acc, cur) => {
      const moduleName = cur.children.moduleName[0].image
      const moduleConfig = this.map(cur.children.map)
      let meta = {}
      if (cur.children.meta) {
        meta = this.meta(cur.children.meta)
      }
      acc[moduleName] = {...moduleConfig, meta}
      return acc
    }, {})
  }
  reference(ctx = []) {
    if (ctx.length === 0) return {}
    let referTo = `$ref:${ctx[0].children.Constant[0].image}|`
    // console.log("*********",ctx[0].children);
    if (ctx[0].children.Constant[0].image && ctx[0].children.referenceTo) {
      const data = ctx[0].children.referenceTo[0].image

      referTo += `$attr:${data}`
    }
    return referTo
  }
  meta(ctx = []) {
    return this.metaItem(ctx[0].children.mapItem)
  }
  tuple(ctx = []) {
    return this.tupleItem(ctx[0].children.tupleItem)
  }
  resourceDeclaration(ctx = []) {
    return ctx.reduce((acc, cur) => {
      let path
      if (cur.children.pathDeclaration) {
        path = this.pathDeclaration(cur.children.pathDeclaration[0])
      }
      const appName = cur.children.AppName[0].image
      const config = this.mapItem(cur.children.mapItem)
      let templateId
      if (cur.children.TemplateID) {
        templateId = cur.children.TemplateID[0].image.slice(1)
      }
      let taskId
      if (cur.children.TaskID) {
        taskId = cur.children.TaskID[0].image.slice(2)
      }
      acc = [
        ...acc,
        {
          appName,
          config,
          ...(path && {path}),
          ...(taskId && {taskId}),
          ...(templateId && {templateId}),
        },
      ]
      return acc
    }, [])
  }
  tupleItem(ctx = []) {
    return ctx.reduce((acc, cur) => {
      let val = {}
      if (cur.children.module) {
        val = this.module(cur.children.module)
      }
      if (cur.children.reference) {
        val = this.reference(cur.children.reference)
      }
      if (cur.children.map) {
        val = this.map(cur.children.map)
      }
      if (cur.children.array) {
        val = this.array(cur.children.array)
      }
      if (cur.children.meta) {
        val = this.meta(cur.children.met)
      }

      acc[cur.children.Constant[0].image] = val

      return acc
    }, {})
  }
  projectDeclaration(ctx = []) {
    if (ctx.length === 0) return {}
    const projectName = ctx[0].children.ProjectName[0].image
    const projectConfig = this.tuple(ctx[0].children.tuple)
    if (projectConfig.applications) {
      projectConfig.applications = projectConfig.applications.map(ele => {
        const app = [
          ...this.apps,
          ...this.resources.filter(i => i.templateId),
        ].find(i => i.appName === ele)
        if (app) {
          return app
        }
        throw `Error ${ele} is not defined at projects`
      })
    }
    return {projectName, projectConfig}
  }
  applicationDeclaration(ctx = []) {
    return ctx.map(element => {
      const appName = element.children.AppName[0].image
      const templateId = element.children.TemplateID[0].image.slice(1)
      const config = this.tuple(element.children.tuple)
      return {appName, templateId, config}
    })
  }
  entityDeclaration(ctx = [], enums) {
    return ctx.map(element => {
      let path
      if (element.children.pathDeclaration) {
        path = this.pathDeclaration(element.children.pathDeclaration[0])
      }
      const entity = element.children.entityName[0].image
      let taskId
      if (element.children.TaskID) {
        taskId = element.children.TaskID[0].image.slice(2)
      }
      const schema = this.fieldDeclaration(
        element.children.fieldDeclaration,
        enums
      )
      let meta = {}
      if (element.children.meta) {
        meta = this.meta(element.children.meta)
      }
      return {
        entity,
        schema,
        ...(taskId && {taskId}),
        ...(meta && {meta}),
        ...(path && {path}),
      }
    })
  }
  fieldDeclaration(ctx = [], enums) {
    return ctx.map(element => {
      const attribute = element.children.attribute[0].image
      let dataType = element.children.datatype[0].image
      const isEnum = enums.find(i => i.Enum === dataType)
      let refElement
      if (element.children.dataStructure) {
        dataType = element.children.dataStructure[0].image
        refElement = element.children.datatype[0].image
      }
      let meta = {}
      if (element.children.meta) {
        meta = this.meta(element.children.meta)
      }
      return {
        attribute,
        dataType,
        ...(refElement && {refElement}),
        ...isEnum,
        meta,
      }
    })
  }
  componentSchema(ctx = []) {
    if (ctx.length === 0 || !ctx[0].children.tupleItem) return []
    return ctx[0].children.tupleItem.reduce((acc, cur) => {
      acc.push(this.map(cur.children.map))
      return acc
    }, [])
  }
  componentDeclaration(ctx = []) {
    return ctx.map(element => {
      let path
      if (element.children.pathDeclaration) {
        path = this.pathDeclaration(element.children.pathDeclaration[0])
      }
      const componentName = element.children.componentName[0].image
      const taskId = element.children.TaskID[0].image.slice(2)
      const componentStructure = this.tuple(element.children.tuple)
      return {
        componentName,
        taskId,
        componentStructure,
        path,
      }
    })
  }
  enumDeclaration(ctx = []) {
    return ctx.map(element => {
      const Enum = element.children.enumName[0].image
      const values = element.children.Constant.map(i => i.image)
      return {Enum, values}
    })
  }
  relationshipsDeclaration(ctx = []) {
    if (ctx.length === 0 || !ctx[0].children.relationshipsItems) return {}
    return this.relationshipsItems(ctx[0].children.relationshipsItems)
  }
}

const toAstVisitorInstance = new FastToAstVisitor()

module.exports = {
  toAst: function (inputText) {
    //console.log("inputText ==> :", inputText)//fast file
    const lexResult = fastLexer.lex(inputText)//seperate into each symbol and word of fast file
    //console.log("lexResult ==> :", lexResult)
    parserInstance.input = lexResult.tokens//identify token type of each word or symbol and add token type as a property
    //console.log("parserInstance.input ==> :", parserInstance.input)
    const cst = parserInstance.prog()//set according to FastParser constructor on parser.js
    console.log("cst ==> :", cst)
    //console.log("cst.children.projectDeclaration[0].children ==> :", cst.children.projectDeclaration[0].children)
    //console.log("cst.children.applicationDeclaration[0].children ==> :", cst.children.applicationDeclaration[0].children)
    //console.log("cst.children.entityDeclaration[0].children ==> :", cst.children.entityDeclaration[0].children)
    if (parserInstance.errors.length > 0) {
      console.log(JSON.stringify(parserInstance.errors))

      if (parserInstance.errors[0].name === 'NotAllInputParsedException') {
        throw new Error(
          `Syntax Exception at line ${parserInstance.errors[0].token.startLine} :
          ${parserInstance.errors[0].message}`
        )
      } else if (parserInstance.errors[0].name === 'NoViableAltException') {
        throw new Error(
          `Syntax Exception at line ${parserInstance.errors[0].token.startLine - 1} `
        )
      }  else if (parserInstance.errors[0].name === 'MismatchedTokenException') {
        throw new Error(
          `Syntax Exception at line ${parserInstance.errors[0].token.startLine - 1} `
        )
      } else {
        throw new Error(
          `line ${parserInstance.errors[0].token.startLine} ${parserInstance.errors[0].name} :
      ${parserInstance.errors[0].message}`
        )
      }
    }

    const ast = toAstVisitorInstance.visit(cst)
    //console.log("ast ==> :", ast)

    return ast
  },
}
