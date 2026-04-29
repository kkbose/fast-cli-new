import {Command, flags} from '@oclif/command'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import cli from 'cli-ux'
import chalk from 'chalk'
import LicenseDetail from './license-detail'

interface Template {
  templateId: string;
  name: string;
  version: string;
  description: string;
  tag: string;
}
export default class TemplateList extends Command {
  static description = 'List all available templates'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  readdb() {
    return new Promise((resolve, reject) => {
      try {
        const dbPath = path.join(os.homedir(), '.fast', 'db', './templates.json')
        if (!fs.existsSync(dbPath)) {
          resolve([])
          return
        }
        const content = fs.readFileSync(dbPath, 'utf-8')
        const docs = JSON.parse(content)
        resolve(Array.isArray(docs) ? docs : [])
      } catch (error) {
        reject(error)
      }
    })
  }

  async run() {
    const {args, flags} = this.parse(TemplateList)
    await LicenseDetail.run(['--check', path.join(os.homedir(), '.fast', 'license', './license.lic')]).then(resp => {
      if (resp === 'License valid') {
        cli.action.start('Process')
        this.readdb().then((docs: any) => {
          if (docs.length > 0) {
            if (flags.force) {
              for (const k in docs) {
                if (k) {
                  cli.log(docs[k].templateId, '&', docs[k].name, '&', docs[k].version, '&', docs[k].description, '&', docs[k].tag)
                }
              }
            } else {
              this.log('Available templates:', `${chalk.green(docs.length)}`)
              cli.table(docs, {
                TID: {
                  minWidth: 7,
                  get: (row: any) => row.templateId,
                },
                Name: {
                  minWidth: 7,
                  get: (row: any) => row.name,
                },
                Version: {
                  minWidth: 7,
                  get: (row: any) => row.version,
                },
                Description: {
                  minWidth: 7,
                  get: (row: any) => row.description,
                },
              },
              {
                printLine: this.log,
              })
            }
          } else {
            this.log(chalk.red('No template found!'))
          }
          cli.action.stop(chalk.green('Completed'))
        }
        )
        if (args.file && flags.force) {
          this.log(`you input --force and --file: ${args.file}`)
        }
      } else {
        this.log('Please Add licence key in settings')
      }
    })
  }
}
