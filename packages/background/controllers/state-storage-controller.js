// class used to encrypt the content of wallet data in order to make more difficult the decryption of the seed since is encrypted togheter with other data (ex name, address ecc)
// options, state, password hash and session(timestamp for checking the last login) are not encrypted
import Utils from '@pegasus/utils/utils'
import configs from '@pegasus/utils/options'
import { Store } from 'rxjs-observable-store'
import logger from '@pegasus/utils/logger'
import { encrypt, decrypt } from '@pegasus/utils/storage-encryption'

//NOTE: init state
class PegasusGlobalState {
  constructor() {
    this.hpsw = null
    this.configs = configs
    this.popupSettings = {
      autoPromotion: {
        emabled: false,
        time: 0
      },
      filters: {
        hide0Txs: false,
        hidePendingTxs: false,
        hideReattachedTxs: false
      }
    }
    this.state = 0
    this.accounts = []
    this.mamChannels = {}
    this.data = null
  }
}

class StateStorageController extends Store {
  constructor() {
    super(new PegasusGlobalState())

    const data = this.loadFromStorage()
    if (data) {
      this.setState(data)
    }

    //NOTE: in order to keep a global state for the popup (for the future)
    this.state$.subscribe(_state => {
      //backgroundMessanger.changeGlobalState(_state)
      //console.log(_state)
    })

    this.unlocked = false
  }

  isReady() {
    return this.encryptionkey && this.unlocked ? true : false
  }

  isInitialized() {
    return this.state.accounts.length > 0 // no account = no usage
  }

  async lock() {
    if (!this.unlocked) {
      logger.log('(StateStorageController) Protected data already locked')
      return
    }

    const encryptedData = await encrypt(this.encryptionkey, {
      accounts: this.state.accounts,
      mamChannels: this.state.mamChannels
    })

    this.setState({
      ...this.state,
      accounts: [],
      mamChannels: {},
      data: encryptedData
    })

    this.writeToStorage()

    this.unlocked = false
    this.encryptionkey = null
    this._toLoadFromStorage = true

    logger.log('(StateStorageController) Protected data succesfully locked')
  }

  init(_encryptionKey) {
    this.encryptionkey = _encryptionKey
    this.unlocked = true
    logger.log('(StateStorageController) Initialized succesfully')
  }

  async unlock(_encryptionKey) {
    if (this.unlocked) {
      logger.log('(StateStorageController) Protected data already unlocked')
      return
    }

    this.encryptionkey = _encryptionKey
    this.unlocked = true

    const decryptedData = await decrypt(this.encryptionkey, this.state.data)

    const { accounts, mamChannels } = decryptedData

    this.setState({
      ...this.state,
      accounts,
      mamChannels,
      data: null
    })
  }

  get(_key) {
    return this.state[_key]
  }

  set(_key, _data) {
    const state = this.state

    state[_key] = _data

    this.setState(state)
  }

  reset() {
    //keep the psw
    this.setState({
      ...this.state,
      popupSettings: {
        autoPromotion: {
          emabled: false,
          time: 0
        },
        filters: {
          hide0Txs: false,
          hidePendingTxs: false,
          hideReattachedTxs: false
        }
      },
      accounts: [],
      mamChannels: {},
      data: {
        accounts: [],
        mamChannels: {}
      }
    })

    this.writeToStorage()
  }

  loadFromStorage() {
    const data = localStorage.getItem('PEGASUS_DATA')
    const hpsw = localStorage.getItem('PEGASUS_HPSW')
    const configs = localStorage.getItem('PEGASUS_CONFIGS')
    const popupSettings = localStorage.getItem('PEGASUS_POPUP_SETTINGS')
    const state = localStorage.getItem('PEGASUS_STATE')

    const savedState = {
      data, //still encrypted
      hpsw: JSON.parse(hpsw),
      configs: JSON.parse(configs),
      popupSettings: JSON.parse(popupSettings),
      state: parseInt(JSON.parse(state))
    }

    logger.log(`(StateStorageController) Loaded from storage`)

    return data && hpsw && configs && popupSettings && state ? savedState : null
  }

  writeToStorage() {
    localStorage.setItem('PEGASUS_DATA', this.state.data)
    localStorage.setItem('PEGASUS_HPSW', JSON.stringify(this.state.hpsw))
    localStorage.setItem('PEGASUS_CONFIGS', JSON.stringify(this.state.configs))
    localStorage.setItem(
      'PEGASUS_POPUP_SETTINGS',
      JSON.stringify(this.state.popupSettings)
    )
    localStorage.setItem('PEGASUS_STATE', JSON.stringify(this.state.state))

    logger.log(`(StateStorageController) Written to storage`)
  }
}

export default StateStorageController
