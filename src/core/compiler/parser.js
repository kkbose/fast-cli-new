/* eslint-disable node/no-missing-require */
/* eslint-disable new-cap */
/* eslint-disable no-redeclare */
/* eslint-disable no-console */
/* eslint-disable no-throw-literal */
/* eslint-disable lines-between-class-members */
const fastLexer = require('./lexer')
const CstParser = require('chevrotain').CstParser
const {
  At,
  Ref,
  tilde,
  LCURLY,
  RCURLY,
  LSquare,
  RSquare,
  LBRACKETS,
  RBRACKETS,
  Resource,
  Comma,
  Colon,
  True,
  False,
  Dot,
  Entity,
  Constant,
  Project,
  Application,
  Enum,
  Component,
  String,
  Path,
  TemplateID,
  Relationships,
  OneToOne,
  OneToMany,
  ManyToOne,
  ManyToMany,
  TaskID,
  // FeatureID,
  DataType,
  ComplexDataType,
} = require('./lexer').tokenVocabulary
const allTokens = require('./lexer')
class FastParser extends CstParser {
  constructor() {
    super(allTokens, {maxLookahead: 10})
    this.RULE('prog', () => {
      this.MANY(() => {
        this.OR([
          {
            ALT: () => {
              this.SUBRULE1(this.entityDeclaration)
            },
          },
          {ALT: () => this.SUBRULE(this.enumDeclaration)},
          {ALT: () => this.SUBRULE(this.applicationDeclaration)},
          {ALT: () => this.SUBRULE(this.projectDeclaration)},
          {
            ALT: () => {
              this.SUBRULE2(this.componentDeclaration)
            },
          },
          {ALT: () => this.SUBRULE(this.resourceDeclaration)},
          {
            ALT: () => {
              this.SUBRULE(this.relationshipsDeclaration)
            },
          },
        ])
      })
    })
    this.RULE('value', () => {
      this.OR([
        {
          ALT: () => {
            this.CONSUME(Constant)
          },
        },
        {
          ALT: () => {
            this.CONSUME(String)
          },
        },
        {
          ALT: () => {
            this.CONSUME(True)
          },
        },
        {
          ALT: () => {
            this.CONSUME(False)
          },
        },
        {
          ALT: () => {
            this.SUBRULE(this.map)
          },
        },
        {
          ALT: () => {
            this.SUBRULE(this.array)
          },
        },
        {
          ALT: () => {
            this.SUBRULE(this.reference)
          },
        },
      ])
    })
    this.RULE('array', () => {
      this.CONSUME(LSquare)
      this.MANY_SEP({
        SEP: Comma,
        DEF: () => {
          this.SUBRULE(this.value, {LABEL: 'items'})
        },
      })
      this.CONSUME(RSquare)
    })
    this.RULE('map', () => {
      this.CONSUME(LBRACKETS)
      this.MANY_SEP({
        SEP: Comma,
        DEF: () => {
          this.SUBRULE(this.mapItem)
        },
      })
      this.CONSUME(RBRACKETS)
    })
    this.RULE('mapItem', () => {
      this.OR([
        {
          ALT: () => {
            this.CONSUME(Constant, {LABEL: 'key'})
          },
        },
        {
          ALT: () => {
            this.SUBRULE(this.reference)
          },
        },
      ])

      this.SUBRULE(this.value, {LABEL: 'value'})
    })
    this.RULE('module', () => {
      this.CONSUME(At)
      this.CONSUME(Constant, {LABEL: 'moduleName'})
      this.OPTION(() => {
        this.SUBRULE(this.map)
      })
      this.OPTION1(() => {
        this.SUBRULE(this.meta)
      })
    })
    this.RULE('reference', () => {
      this.CONSUME(Ref)
      this.CONSUME(Constant)
      this.OPTION(() => {
        this.CONSUME(Dot)
        this.CONSUME1(Constant, {LABEL: 'referenceTo'})
      })
    })
    this.RULE('meta', () => {
      this.CONSUME(tilde)
      this.CONSUME(LBRACKETS)
      this.MANY_SEP({
        SEP: Comma,
        DEF: () => {
          this.SUBRULE(this.mapItem)
        },
      })
      this.CONSUME(RBRACKETS)
    })
    this.RULE('metaItem', () => {
      this.CONSUME(Constant)
      this.OR([
        {
          ALT: () => {
            this.CONSUME1(Constant, {LABEL: 'value'})
          },
        },
        {
          ALT: () => {
            this.CONSUME(String)
          },
        },
      ])
    })
    this.RULE('tuple', () => {
      this.CONSUME(LCURLY)
      this.MANY_SEP({
        SEP: Comma,
        DEF: () => {
          this.SUBRULE(this.tupleItem)
        },
      })
      this.CONSUME(RCURLY)
    })
    this.RULE('tupleItem', () => {
      this.OR([
        {
          ALT: () => {
            this.CONSUME(Constant)
          },
        },
        {
          ALT: () => {
            this.SUBRULE(this.reference)
          },
        },
      ])
      this.OR1([
        {
          ALT: () => {
            this.SUBRULE(this.module)
          },
        },
        {
          ALT: () => {
            this.SUBRULE1(this.reference)
          },
        },
        {
          ALT: () => {
            this.SUBRULE(this.map)
          },
        },
        {
          ALT: () => {
            this.SUBRULE(this.array)
          },
        },
      ])
    })
    this.RULE('projectDeclaration', () => {
      this.CONSUME(Project)
      this.CONSUME(Constant, {LABEL: 'ProjectName'})
      this.SUBRULE(this.tuple)
    })
    this.RULE('applicationDeclaration', () => {
      this.CONSUME(Application)
      this.CONSUME(TemplateID)
      this.CONSUME(Constant, {LABEL: 'AppName'})
      this.SUBRULE(this.tuple)
    })
    this.RULE('entityDeclaration', () => {
      this.OPTION(() => {
        this.SUBRULE3(this.pathDeclaration)
      })
      this.CONSUME(Entity)
      this.CONSUME(TaskID)
      this.CONSUME(Constant, {LABEL: 'entityName'})
      this.CONSUME(LCURLY)
      this.MANY_SEP({
        SEP: Comma,
        DEF: () => {
          this.SUBRULE(this.fieldDeclaration)
        },
      })
      this.CONSUME(RCURLY)
      this.OPTION1(() => {
        this.SUBRULE(this.meta)
      })
    })
    this.RULE('fieldDeclaration', () => {
      this.CONSUME(Constant, {LABEL: 'attribute'})
      this.OR([
        {
          ALT: () => {
            this.CONSUME(DataType, {LABEL: 'datatype'})
          },
        },
        {
          ALT: () => {
            this.CONSUME(ComplexDataType, {LABEL: 'dataStructure'})
            this.CONSUME(LBRACKETS)
            this.CONSUME(Colon)
            this.OR1([
              {
                ALT: () => {
                  this.CONSUME1(DataType, {LABEL: 'datatype'})
                },
              },
              {
                ALT: () => {
                  this.CONSUME2(Constant, {LABEL: 'datatype'})
                },
              },
            ])
            this.CONSUME(RBRACKETS)
          },
        },
      ])
      this.OPTION(() => {
        this.SUBRULE(this.meta)
      })
    })
    this.RULE('componentDeclaration', () => {
      this.OPTION(() => {
        this.SUBRULE3(this.pathDeclaration)
      })
      this.CONSUME(Component)
      this.CONSUME(TaskID)
      this.CONSUME(Constant, {LABEL: 'componentName'})
      this.SUBRULE(this.tuple)
      this.OPTION1(() => {
        this.SUBRULE(this.meta)
      })
    })
    this.RULE('enumDeclaration', () => {
      this.CONSUME(Enum)
      this.CONSUME(Constant, {LABEL: 'enumName'})
      this.CONSUME(LCURLY)
      this.MANY_SEP({
        SEP: Comma,
        DEF: () => {
          this.CONSUME1(Constant)
        },
      })
      this.CONSUME(RCURLY)
    })
    this.RULE('relationshipsDeclaration', () => {
      this.CONSUME(Relationships)
      this.CONSUME(LCURLY)
      this.MANY_SEP({
        SEP: Comma,
        DEF: () => {
          this.SUBRULE(this.relationshipsItems)
        },
      })

      this.CONSUME(RCURLY)
    })
    this.RULE('relationshipsItems', () => {
      this.SUBRULE(this.reference, {LABEL: 'LHS'})
      this.OR([
        {
          ALT: () => {
            this.CONSUME(OneToOne)
          },
        },
        {
          ALT: () => {
            this.CONSUME(OneToMany)
          },
        },
        {
          ALT: () => {
            this.CONSUME(ManyToOne)
          },
        },
        {
          ALT: () => {
            this.CONSUME(ManyToMany)
          },
        },
      ])
      this.SUBRULE1(this.reference, {LABEL: 'RHS'})
      this.OPTION(() => {
        this.SUBRULE(this.meta)
      })
    })
    this.RULE('pathDeclaration', () => {
      this.CONSUME(At)
      this.CONSUME(Path)
      this.CONSUME(LBRACKETS)
      this.CONSUME(String)
      this.CONSUME(RBRACKETS)
    })
    this.RULE('resourceDeclaration', () => {
      this.OPTION(() => {
        this.SUBRULE3(this.pathDeclaration)
      })
      this.CONSUME(Resource)
      this.OR([
        {
          ALT: () => {
            this.CONSUME(TemplateID)
          },
        },
        {
          ALT: () => {
            this.CONSUME(TaskID)
          },
        },
      ])
      this.CONSUME(Constant, {LABEL: 'AppName'})
      this.CONSUME(LCURLY)
      this.MANY_SEP({
        SEP: Comma,
        DEF: () => {
          this.SUBRULE(this.mapItem)
        },
      })
      this.CONSUME(RCURLY)
      this.OPTION2(() => {
        this.SUBRULE(this.meta)
      })
    })
    this.performSelfAnalysis()
  }
}
const parserInstance = new FastParser()

module.exports = {
  parserInstance: parserInstance,
  FastParser: FastParser,
  parse: function (inputText) {
    const lexResult = fastLexer.lex(inputText)
    parserInstance.input = lexResult.tokens
    parserInstance.prog()
    if (parserInstance.errors.length > 0) {
      parserInstance.errors.forEach(error => {
        console.error(error)
      })
      throw new Error('Parsing errors:\n' + parserInstance.errors[0].message)
    }
  },
}
