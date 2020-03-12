import { backgroundMessanger } from '@pegasus/utils/messangers'
import { APP_STATE } from '@pegasus/utils/states'
import logger from '@pegasus/utils/logger'

class ConnectorController {
  constructor(configs) {
    const { popupController } = configs

    this.popupController = popupController
    this.connections = {}
  }

  setWalletController(_walletController) {
    this.walletController = _walletController
  }

  setNetworkController(_networkController) {
    this.networkController = _networkController
  }

  getConnection(_origin) {
    return this.connections[_origin]
  }

  async pushConnection(_connection) {
    this.connections[_connection.website.origin] = _connection
  }

  setConnectionRequest(_connection) {
    this.connectionRequest = _connection
    this.walletController.setState(
      APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
    )
  }

  getConnectionRequest(_connection) {
    return this.connectionRequest
  }

  updateConnection(_connection) {
    this.connections[_connection.website.origin] = _connection
  }

  connect(_uuid, _resolve, _website) {
    this.connectionRequest = {
      website: _website,
      requestToConnect: true,
      enabled: false,
      resolve: _resolve,
      uuid: _uuid
    }

    logger.log(
      `(ConnectorController) New _connect request with ${this.connectionRequest.website.origin}`
    )

    this.walletController.setState(
      APP_STATE.WALLET_REQUEST_PERMISSION_OF_CONNECTION
    )
  }

  completeConnection(_requests) {
    logger.log(
      `(ConnectorController) Completing connection with ${this.connectionRequest.website.origin}`
    )

    const account = this.walletController.getCurrentAccount()
    if (this.connectionRequest.resolve) {
      this.connectionRequest.resolve({
        data: true,
        success: true,
        uuid: this.connectionRequest.uuid
      })
    }

    this.connections[this.connectionRequest.website.origin] = Object.assign(
      {},
      this.connectionRequest,
      {
        enabled: true
      }
    )

    _requests.forEach(request => {
      if (
        request.connection.website.origin ===
        this.connectionRequest.website.origin
      ) {
        request.connection.requestToConnect = false
        request.connection.enabled = true
      }
    })

    if (_requests.length === 0) {
      this.popupController.closePopup()
    }

    this.walletController.setState(APP_STATE.WALLET_UNLOCKED)

    this.connectionRequest = null

    backgroundMessanger.setSelectedAccount(account.data.latestAddress)
    return _requests
  }

  rejectConnection(_requests) {
    logger.log(
      `(ConnectorController) Rejecting connection with ${this.connectionRequest.website.origin}`
    )

    if (this.connectionRequest.resolve) {
      this.connectionRequest.resolve({
        data: false,
        success: true,
        uuid: this.connectionRequest.uuid
      })
    }

    this.removeConnection({
      website: this.connectionRequest.website,
      requestToConnect: false,
      enabled: false
    })

    this.popupController.closePopup()

    _requests.forEach(request => {
      if (
        request.connection.website.origin ===
        this.connectionRequest.website.origin
      ) {
        request.connection.requestToConnect = false
        request.connection.enabled = false
      }
    })

    this.walletController.setState(APP_STATE.WALLET_UNLOCKED)

    this.connectionRequest = null

    return _requests
  }

  estabilishConnection(website) {
    const state = this.walletController.getState()
    if (state <= APP_STATE.WALLET_LOCKED)
      return

    logger.log(
      `(ConnectorController) Estabilishing connection with ${website.origin}`
    )

    const account = this.walletController.getCurrentAccount()

    if (this.connections[website.origin]) {
      if (
        this.connections[website.origin].enabled &&
        state >= APP_STATE.WALLET_UNLOCKED
      ) {
        logger.log(
          `(ConnectorController) Connection with ${website.origin} already enabled`
        )
        return account.data.latestAddress
      }
    }

    this.connections[website.origin] = {
      website,
      requestToConnect: false,
      enabled: false
    }

    return null
  }

  setConnectionRequest(_connection) {
    this.connectionRequest = _connection
  }

  getConnections() {
    return this.connections
  }

  removeConnection(_connectionToRemove) {
    logger.log(
      `(ConnectorController) Remove connection with ${_connectionToRemove.website.origin}`
    )
    delete this.connections[_connectionToRemove.website.origin]
    return true
  }

  addConnection(_connection) {
    logger.log(
      `(ConnectorController) Add connection with ${_connection.website.origin}`
    )
    if (this.connections[_connection.website.origin]) return false

    this.connections[_connection.website.origin] = _connection
    return true
  }
}

export default ConnectorController
