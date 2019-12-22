import kdbxweb from 'kdbxweb'
import argon2 from 'argon2-browser'
import Utils from '@pegasus/utils/utils'
import * as FileSaver from 'file-saver'

class SeedVaultController {

  constructor (configs) {
    
    const {
      walletController
    } = configs

    this.walletController = walletController
  }

  async createSeedVault (password) {

    const key = this.walletController.getKey()
    const account = this.walletController.getCurrentAccount()
    const seed = Utils.aes256decrypt(account.seed, key)

    kdbxweb.CryptoEngine.argon2 = async (
      password,
      salt, 
      memory,
      iterations,
      length,
      parallelism,
      type,
      version
    ) => {
        const hash = await argon2.hash({
            pass: new Uint8Array(password),
            salt: new Uint8Array(salt),
            mem: memory,
            time: iterations,
            hashLen: length,
            parallelism
        })

        return hash.hash
    }

    const credentials = new kdbxweb.Credentials(
      kdbxweb.ProtectedValue.fromString(password),
      null
    )
    const db = kdbxweb.Kdbx.create(credentials, 'Trinity')

    db.upgrade()
    const entry = db.createEntry(db.getDefaultGroup())
    entry.fields.Title = 'Pegasus Wallet Seed'
    entry.fields.Seed = kdbxweb.ProtectedValue.fromString(seed)

    const vault = await db.save()

    const blob = new Blob([vault])
    FileSaver.saveAs(blob, `pegasus-vault-${account.name}.kdbx`)

    return true
  }
}

export default SeedVaultController