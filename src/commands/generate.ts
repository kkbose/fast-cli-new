/* eslint-disable arrow-parens */
/* eslint-disable space-before-function-paren */
/* eslint-disable comma-spacing */
/* eslint-disable quotes */
/* eslint-disable no-console */
import {Command, flags} from '@oclif/command'
import chalk from 'chalk'
import * as cp from 'child_process'
import * as path from 'path'
import * as os from 'os'
import cli from 'cli-ux'
import jetpack = require('fs-jetpack')
import {WritableData} from 'fs-jetpack/types'
import {toAst}  from  '../core/compiler/vistor'
import {generateCodeV2}  from  '../core/util/codeGen'
import LicenseDetail from './license-detail'

export default class Generate extends Command {
  static description = 'Generate code with FAST config file';

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    path: flags.string({char: 'p', description: 'FAST config file'}),
    workspace: flags.string({char: 'w', description: 'Workspace folder to generate code'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  };

  static args = [{name: 'file'}];

  execShell = (cmd: string) => {
    // Using execFile instead of exec to prevent shell injection
    return new Promise<string>((resolve, reject) => {
      cp.execFile('cmd', ['/c', cmd], (err: any, out: string | PromiseLike<string>) => {
        if (err) {
          return reject(err)
        }
        return resolve(out as string)
      })
    })
  };

  async run() {
    const {args, flags} = this.parse(Generate)
    if (!flags.path) {
      this.error('No configfile path provided for generation, please provide --path [PATH] argument.')
    }
    if (!flags.workspace) {
      this.error('No workspace path provided for generation, please provide --workspace [WORKSPACE] argument.')
    }
    if (jetpack.exists(flags.path) === 'file') {
      await LicenseDetail.run(['--check', path.join(os.homedir(), '.fast', 'license', './license.lic')]).then(async(resp) => {
        console.log('before licence ==>')
        if (resp === 'License valid') {
          if (flags.path) {
            try {
              const configFile = jetpack.read(flags.path)
              const parsedJSON = toAst(configFile)
              // this.log(parsedJSON)
              console.log("parsed Json :",parsedJSON);
              const result =  await generateCodeV2(parsedJSON, flags.workspace)
              result.forEach((i: { outputPath: string; outputContent: WritableData }) => {
                jetpack.write(i.outputPath, i.outputContent)
              })
              // console.log("result",result);
            } catch (error) {
              cli.log(`${chalk.red('Error')}, ${error} `)
              cli.log(`${chalk.red('Error')}`)
              return error
            }
            cli.log(`${chalk.green('Done')} `)
          }
        }
      })
    }

    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`)
    }
  }
}
