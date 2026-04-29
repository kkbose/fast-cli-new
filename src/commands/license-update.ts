import {Command, flags} from '@oclif/command'
import * as jetpack from 'fs-jetpack'
import * as os from 'os'
import * as path from 'path'
import * as crypto from 'crypto'
const SECRET = process.env.KEY || 'b2df428b9929d3ace7c598bbf4e496b2'

// Ensure 32-byte key
const getKey = () => crypto.createHash('sha256').update(SECRET).digest()
export default class LicenseUpdate extends Command {
  static description = 'Update License'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    path: flags.string({char: 'p', description: 'New License Path'}),
    // flag with no value (-f, --force)
    key: flags.string({char: 'k', description: 'New License Key'}),
  }

  static args = [{name: 'file'}]

  setDate(date: Date) {
    const d = new Date(date)
    let month = String(d.getMonth() + 1)
    let day = String(d.getDate() + 1)
    const year = d.getFullYear()

    if (month.length < 2)
      month = '0' + month
    if (day.length < 2)
      day = '0' + day

    return [year, month, day].join('-')
  }

  formatDate(date: Date) {
    const d = new Date(date)
    let month = String(d.getMonth() + 1)
    let day = String(d.getDate())
    const year = d.getFullYear()

    if (month.length < 2)
      month = '0' + month
    if (day.length < 2)
      day = '0' + day

    return [day, month, year].join('-')
  }

  encrypt(text: any) {
  const iv = crypto.randomBytes(12) // recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv)

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ])

  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

decrypt(encryptCode: any) {
  if (!encryptCode || typeof encryptCode !== 'string') {
    throw new Error('Invalid encrypted format')
  }

  const parts = encryptCode.split(':')

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format')
  }

  try {
    const [ivHex, tagHex, dataHex] = parts

    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(tagHex, 'hex')
    const encryptedText = Buffer.from(dataHex, 'hex')

    const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ])

    return decrypted.toString('utf8')
  } catch {
    throw new Error('Invalid Key (GCM decryption failed)')
  }
}

  getLicenceDetails(key: any) {
    let text
    if (!key) {
      throw new Error('Please Add licence key in settings')
    }
    try {
      text = JSON.parse(this.decrypt(key))
    } catch (error) {
      throw new Error('Invalid Key')
    }
    return text
  }

  checkValidity(key: any) {
    const date = this.formatDate(new Date())
    if (key.validity >= this.formatDate(new Date())) {
      return 'License valid'
    }
    if (key.validity < date) {
      return 'Invalid License'
    }
  }

  async run() {
    const {flags} = this.parse(LicenseUpdate)
    if (flags.path) {
      this.log('Checking file')
      const updatefile = jetpack.read(flags.path, 'utf8')
      const decypher = JSON.parse(this.decrypt(updatefile))
      this.log(`Update: Valid key till date ${decypher.validity}`)
      jetpack.write(path.join(os.homedir(), '.fast', 'license', 'license.lic'), `${updatefile}`)
    }
    if (flags.key) {
      this.log('Checking key..')
      const decypher = JSON.parse(this.decrypt(flags.key))
      if (decypher.user === os.userInfo().username) {
        this.log(`Update: Valid key till date ${decypher.validity}`)
        jetpack.write(path.join(os.homedir(), '.fast', 'license', 'license.lic'), flags.key)
      } else {
        this.log('Invalid Key')
      }
    }
    if (!flags.path && !flags.key && flags.help) {
      this.log('Please provide --key or --path argument to update key. You can use --help or -h to view help.')
    }
  }
}
