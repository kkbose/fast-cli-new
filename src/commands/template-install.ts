import {Command, flags} from '@oclif/command'
import * as jetpack from 'fs-jetpack'
import * as unzipper from 'unzipper'
import * as path from 'path'
import cli from 'cli-ux'
import * as os from 'os'
import chalk from 'chalk'
import * as fs from 'fs'
import LicenseDetail from './license-detail'

interface Manifest {
  templateId: string;
  name: string;
  version: string;
  description: string;
  tag: string;
}

export default class TemplateInstall extends Command {
  static description = 'Install Template'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    path: flags.string({char: 'p', description: 'Template path'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'file'}]

  private getTemplateDbPath(): string {
    const dbPath = path.join(os.homedir(), '.fast', 'db', 'templates.json')
    return dbPath
  }

  private getTemplates(): Manifest[] {
    try {
      const dbPath = this.getTemplateDbPath()
      if (fs.existsSync(dbPath)) {
        const content = fs.readFileSync(dbPath, 'utf-8')
        return JSON.parse(content)
      }
    } catch (error) {
      cli.log(chalk.yellow('Unable to read templates database'))
    }
    return []
  }

  private saveTemplates(templates: Manifest[]): void {
    try {
      const dbDir = path.dirname(this.getTemplateDbPath())
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, {recursive: true})
      }
      const dbPath = this.getTemplateDbPath()
      fs.writeFileSync(dbPath, JSON.stringify(templates, null, 2), 'utf-8')
    } catch (error) {
      cli.log(chalk.red('Failed to save template database'))
    }
  }

  async getManifest(filePath: string) {
    try {
      // Validate file path to prevent path traversal
      const normalizedPath = path.normalize(filePath)
      if (!normalizedPath.includes('.zip')) {
        throw new Error('Invalid file path')
      }

      const x = jetpack.read(path.join(os.homedir(), '.fast', 'templates',
        filePath.slice(filePath.lastIndexOf('\\') + 1, filePath.lastIndexOf('.')),
        'manifest.json'), 'json') as Manifest

      if (!x || !x.templateId) {
        throw new Error('Invalid manifest file')
      }

      const templates = this.getTemplates()
      
      // Check if template already exists
      const exists = templates.some(t => t.templateId === x.templateId)
      
      if (!exists) {
        templates.push(x)
        this.saveTemplates(templates)
        cli.log(chalk.green('Added to database'))
      } else {
        cli.log(chalk.yellow('Template already exists in database'))
      }
    } catch (error) {
      cli.log(chalk.red(`Error processing manifest: ${error}`))
    }
  }

  async extract(filePath: string) {
    cli.action.start('Extraction...')
    try {
      // Validate file path
      const normalizedPath = path.normalize(filePath)
      if (normalizedPath.includes('..')) {
        throw new Error('Invalid file path')
      }

      if (jetpack.exists(filePath) === 'file') {
        const targetPath = path.join(os.homedir(), '.fast', 'templates')
        
        // Ensure target directory exists
        if (!fs.existsSync(targetPath)) {
          fs.mkdirSync(targetPath, {recursive: true})
        }

        jetpack.createReadStream(filePath).pipe(
          // eslint-disable-next-line new-cap
          unzipper.Extract({path: targetPath})
        ).on('close', () => {
          cli.action.stop()
          this.getManifest(filePath)
        }).on('error', (err) => {
          cli.action.stop()
          this.error(chalk.red(`Extraction error: ${err}`))
        })
      } else {
        this.error(chalk.red(`ENOENT: no such file, ${filePath}`))
      }
    } catch (error) {
      cli.action.stop()
      this.error(chalk.red(`Extract failed: ${error}`))
    }
  }

  async run() {
    const {args, flags} = this.parse(TemplateInstall)
    try {
      await LicenseDetail.run(['--check', path.join(os.homedir(), '.fast', 'license', './license.lic')]).then(async resp => {
        if (resp === 'License valid') {
          if (flags.path) {
            const filePath = path.normalize(flags.path)
            // Validate file path
            if (!filePath.includes('.zip') && !filePath.includes('.tar')) {
              this.error('Invalid file format. Please provide a .zip or .tar file.')
              return
            }
            await this.extract(filePath)
          } else {
            this.error('No template path provided for installation, please provide --path [PATH] argument.')
          }
        }
      })
    } catch (error) {
      this.error(chalk.red(`Installation failed: ${error}`))
    }

    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${flags.path}`)
    }
  }
}

