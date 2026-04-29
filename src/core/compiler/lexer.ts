/* eslint-disable arrow-parens */
/* eslint-disable no-console */
/* eslint-disable no-useless-escape */
/* eslint-disable quotes */
/* eslint-disable spaced-comment */
/* eslint-disable object-curly-spacing */
/* eslint-disable semi */
// eslint-disable-next-line quotes
import { createToken, Lexer } from "chevrotain";
import { TokenType } from 'chevrotain';

interface Dictionary {
  [index: string]: TokenType;
}
const tokenVocabulary = {} as Dictionary;
//const tokenVocabulary = [{}];

//Whitespace
const Whitespace = createToken({
  name: "Whitespace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});
// Comments
const BLOCK_COMMENT = createToken({
  name: "BLOCK_COMMENT",
  pattern: /\/\*([\s\S]*?)\*\//,
  group: Lexer.SKIPPED,
});
// annotations
const At = createToken({ name: "At", pattern: "@" });
const And = createToken({ name: "And", pattern: "&" });
//reference
const Ref = createToken({ name: "Ref", pattern: "$" });
//tilde
const tilde = createToken({ name: "tilde", pattern: "~" });
//block
const LCURLY = createToken({ name: "LCURLY", pattern: "{" });
const RCURLY = createToken({ name: "RCURLY", pattern: "}" });
//array
const LSquare = createToken({ name: "LSquare", pattern: "[" });
const RSquare = createToken({ name: "RSquare", pattern: "]" });
//map
const LBRACKETS = createToken({ name: "LBRACKETS", pattern: "(" });
const RBRACKETS = createToken({ name: "RBRACKETS", pattern: ")" });

const LRef = createToken({ name: "LRef", pattern: "<" });
const RRef = createToken({ name: "RRef", pattern: ">" });
//comma
const Comma = createToken({ name: "Comma", pattern: "," });
//dot
const Dot = createToken({ name: "Dot", pattern: "." });
//Colon
const Colon = createToken({ name: "Colon", pattern: ":" });
//relations
const OneToOne = createToken({ name: "OneToOne", pattern: "1-1" });
const OneToMany = createToken({ name: "OneToMany", pattern: "1-*" });
const ManyToOne = createToken({ name: "ManyToOne", pattern: "*-1" });
const ManyToMany = createToken({ name: "ManyToMany", pattern: "*-*" });
//boolean
const BOOLEAN = createToken({
  name: "BOOLEAN",
  pattern: Lexer.NA,
});
const True = createToken({
  name: "True",
  pattern: /\btrue\b/,
  categories: [BOOLEAN],
});
const False = createToken({
  name: "False",
  pattern: /\bfalse\b/,
  categories: [BOOLEAN],
});

//keywords
const Entity = createToken({
  name: "Entity",
  pattern: /\bentity\b/,
});
// const Feature = createToken({
//   name: "Feature",
//   pattern: /\feature\b/,
// });
const Path = createToken({
  name: "Path",
  pattern: /\bpath\b/,
});
const Project = createToken({
  name: "Project",
  pattern: /\bproject\b/,
});
const Application = createToken({
  name: "Application",
  pattern: /\bapplication\b/,
});
const Enum = createToken({
  name: "Enum",
  pattern: /\benum\b/,
});
const Component = createToken({
  name: "Component",
  pattern: /\bcomponent\b/,
});
const playout = createToken({
  name: "playout",
  pattern: /\playout\b/,
});

const Relationships = createToken({
  name: "Relationships",
  pattern: /\brelationships\b/,
});
const Resource = createToken({
  name: "Resource",
  pattern: /\bresource\b/,
});

const String = createToken({
  name: "String",
  pattern: /".*?"/,
});
const Kafka = createToken({
  name: "Kafka",
  pattern: /\bkafka\b/,
});

const Controller = createToken({
  name: "Controller",
  pattern: /\bcontroller\b/,
});

const GoogleCloudFunction = createToken({
  name: "GoogleCloudFunction",
  pattern: /\googleCloudFunction\b/,
});

const Helmchart = createToken({
  name: "Helmchart",
  pattern: /\helmchart\b/,
});

const FeatureEdit = createToken({
  name: "FeatureEdit",
  pattern: /\featureEdit\b/,
});

const AdditionalFiles = createToken({
  name: "additionalFiles",
  pattern: /\additionalFiles\b/,
});

const Jenkinsdetails = createToken({
  name: "Jenkinsdetails",
  pattern: /\jenkinsdetails\b/,
});

const LambdaFunction = createToken({
  name: "LambdaFunction",
  pattern: /\lambdaFunction\b/,
});
//dataType
const DataType = createToken({
  name: "DataType",
  pattern: /\buuid\b|\bint\b|\bstring\b|\bclob\b|\bblob\b|\bdecimal\b|\bboolean\b|\btime\b|\bdate\b|\bfunctionType\b|\bclient\b/,
});

const ComplexDataType = createToken({
  name: "ComplexDataType",
  pattern: /\barray\b|\bobj\b/,
});

//TaskID
const TaskID = createToken({
  name: "TaskID",
  pattern: /##[a-zA-Z0-9\-]+/,
});

//templateID
const TemplateID = createToken({
  name: "TemplateID",
  pattern: /#[a-zA-Z0-9\-]+/,
});

//string with no double quotes
const Constant = createToken({
  name: "Constant",
  pattern: /[a-zA-Z0-9\_]+/,
});
const allTokens = [
  Whitespace,
  BLOCK_COMMENT,
  At,
  And,
  Ref,
  tilde,
  LCURLY,
  RCURLY,
  LSquare,
  RSquare,
  LBRACKETS,
  RBRACKETS,
  Colon,
  Comma,
  BOOLEAN,
  True,
  False,
  Entity,
  Project,
  Application,
  Enum,
  Path,
  Component,
  Resource,
  String,
  TemplateID,
  Dot,
  LRef,
  RRef,
  Relationships,
  OneToOne,
  OneToMany,
  ManyToOne,
  ManyToMany,
  TaskID,
  DataType,
  ComplexDataType,
  Constant,
  Kafka,
  GoogleCloudFunction,
  LambdaFunction,
  Helmchart,
  FeatureEdit,
  AdditionalFiles,
  Jenkinsdetails,
  playout,
  Controller,

];

const fastLexer = new Lexer(allTokens);

allTokens.forEach((tokenType) => {
  tokenVocabulary[tokenType.name] = tokenType;
});

export = {
  tokenVocabulary: tokenVocabulary,
  lex: (inputText: any) => {
    const lexingResult = fastLexer.tokenize(inputText);
    if (lexingResult.errors.length > 0) {
      console.log(lexingResult.errors);
      throw new Error(
        `Lexing errors: line ${lexingResult.errors[0].line} \n ${lexingResult.errors[0].message}`
      );
    }

    return lexingResult;
  },
};
