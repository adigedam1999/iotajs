import connector from './connector'
import EventChannel from '@pegasus/utils/event-channel'
import customizator from './customizator'

const hook = {
  init() {
    this._bindEventChannel()
    this._bindEvents()

    this.connection('init')
      .then(({ selectedProvider }) => {
        customizator.init(this.connection, this.eventChannel)
        this.injectIotaJs(selectedProvider)

        console.log('Pegasus injected iotajs succesfully')
      })
      .catch(err => {
        console.log('Failed to initialise Pegasus', err)
      })
  },

  _bindEventChannel() {
    this.eventChannel = new EventChannel('pageHook')
    this.connection = connector.init(this.eventChannel)
  },

  _bindEvents() {
    this.eventChannel.on('setProvider', provider => this.injectIotaJs(provider))
  },

  injectIotaJs(provider) {
    window.iota = customizator.getCustomIota(provider)
  }
}

hook.init()
