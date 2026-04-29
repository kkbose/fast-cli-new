import {Command, flags} from '@oclif/command'
import * as jetpack from 'fs-jetpack'
import * as path from 'path'
import cli from 'cli-ux'
import * as os from 'os'
import * as fs from 'fs'
import LicenseDetail from './license-detail'

interface Template {
  templateId: string;
  name: string;
  version: string;
  description: string;
  tag: string;
}
export default class TemplateRemove extends Command {
  static description = 'Remove plugin'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    templateId: flags.string({char: 't', description: 'TemplateId to be removed'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  async remove(id: string) {
    try {
      // Validate ID to prevent path traversal
      if (!id || id.includes('..') || id.includes('/') || id.includes('\\')) {
        throw new Error('Invalid template ID')
      }

      const dbPath = path.join(os.homedir(), '.fast', 'db', 'templates.json')
      
      if (!fs.existsSync(dbPath)) {
        cli.error('No templates found in database')
        return
      }

      let templates: Template[] = []
      try {
        const content = fs.readFileSync(dbPath, 'utf-8')
        templates = JSON.parse(content)
      } catch (error) {
        cli.error('Unable to read templates database')
        return
      }

      const index = templates.findIndex(t => t.templateId === id)
      
      if (index === -1) {
        cli.error('No corresponding template found')
        return
      }

      // Remove template from list
      templates.splice(index, 1)
      
      // Save updated list
      fs.writeFileSync(dbPath, JSON.stringify(templates, null, 2), 'utf-8')
      
      // Remove template directory
      const templateDir = path.join(os.homedir(), '.fast', 'templates', id)
      if (fs.existsSync(templateDir)) {
        jetpack.remove(templateDir)
      }
      
      cli.log(`Template ${id} removed successfully`)
    } catch (error) {
      cli.error(`Failed to remove template: ${error}`)
    }
  }

  async run() {
    const {args, flags} = this.parse(TemplateRemove)
    if (flags.templateId) {
      const templateId = flags.templateId
      if (templateId !== undefined) {
        await LicenseDetail.run(['--check', path.join(os.homedir(), '.fast', 'license', './license.lic')]).then(async resp => {
          if (resp === 'License valid') {
            await this.remove(templateId)
          }
        })
      }
    } else {
      this.error('No template id provided for uninstallation, please provide --templateId [ID] argument.')
    }
    const name = flags.templateId
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file} ${name}`)
    }
  }
}
