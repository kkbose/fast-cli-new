import {Command, flags} from '@oclif/command'
import * as jetpack from 'fs-jetpack'
// import * as os from 'os'
// import * as path from 'path'
import * as crypto from 'crypto'
const SECRET = process.env.KEY || 'b2df428b9929d3ace7c598bbf4e496b2'

// Ensure 32-byte key for AES-256
const getKey = () => crypto.createHash('sha256').update(SECRET).digest()

export default class LicenseDetail extends Command {
  static description = 'License Details';

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    path: flags.string({char: 'p', description: 'License Path'}),
    check: flags.string({char: 'c', description: 'Check Validity'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  };

  static args = [{name: 'file'}];

  encrypt(text: any) {
  const iv = crypto.randomBytes(12) // GCM standard IV size
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv)

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ])

  const authTag = cipher.getAuthTag()

  // store iv + tag + data
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

decrypt(encryptCode: any) {
  if (!encryptCode || typeof encryptCode !== 'string') {
    throw new Error('Invalid Key format')
  }

  const parts = encryptCode.split(':')

  if (parts.length !== 3) {
    throw new Error('Invalid Key format')
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

  setDate(date: Date) {
    const d = new Date(date)
    let month = String(d.getMonth() + 1)
    let day = String(d.getDate() - 1)
    const year = d.getFullYear()

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    return [year, month, day].join('-')
  }

  formatDate(date: Date) {
    const d = new Date(date)
    let month = String(d.getMonth() + 1)
    let day = String(d.getDate())
    const year = d.getFullYear()

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    return [year, month, day].join('-')
  }

  async run() {
    const {args, flags} = this.parse(LicenseDetail)
    const file = flags.path
    const check = flags.check
    let x
    if (file) {
      x = jetpack.read(file)
      const keyOpen = this.getLicenceDetails(x)
      const detail = this.checkValidity(keyOpen)
      this.log(detail, ' End Date: ', keyOpen.validity)
    }
    if (check) {
      x = jetpack.read(check)
      const keyOpen = this.getLicenceDetails(x)
      const detail = this.checkValidity(keyOpen)
      return detail
    }

    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`)
    }
  }
}
