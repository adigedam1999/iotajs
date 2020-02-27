import React, { Component } from 'react'
import { popupMessanger } from '@pegasus/utils/messangers'
import ConfirmTransfers from './confirmTransfers/ConfirmTransfers'
import ConfirmCreateMamChannel from './confirmCreateMamChannel/ConfirmCreateMamChannel'
import ConfirmChangeModeMamChannel from './confirmChangeModeMamChannel/ConfirmChangeModeMamChannel'
import Loader from '../../components/loader/Loader'

class ConfirmRequest extends Component {
  constructor(props, context) {
    super(props, context)

    this.bindDuplexRequests = this.bindDuplexRequests.bind(this)
    this.reject = this.reject.bind(this)
    this.rejectAll = this.rejectAll.bind(this)
    this.confirm = this.confirm.bind(this)

    this.state = {
      requests: []
    }
  }

  async componentWillMount() {
    const requests = await popupMessanger.getRequestsWithUserInteraction()
    this.setState({ requests })

    this.props.duplex.on('setRequests', requests => {
      this.setState({ requests })
    })
  }

  async confirm(request) {
    await popupMessanger.confirmRequest(request)
  }

  async reject(request) {
    await popupMessanger.rejectRequest(request)
  }

  rejectAll() {
    popupMessanger.rejectRequests()
  }

  bindDuplexRequests() {
    this.props.duplex.on('setRequests', requests => {
      this.setState({ requests })
    })
  }

  render() {
    const request = this.state.requests[0]

    if (request) {
      switch (request.method) {
        case 'prepareTransfers':
          return (
            <ConfirmTransfers
              transfer={request}
              duplex={this.props.duplex}
              onConfirm={this.confirm}
              onReject={this.reject}
            />
          )

        case 'mam_init':
          return (
            <ConfirmCreateMamChannel
              request={request}
              onConfirm={this.confirm}
              onReject={this.reject}
            />
          )
        case 'mam_changeMode':
          return (
            <ConfirmChangeModeMamChannel
              from={request.data.args[0].channel.mode}
              to={request.data.args[1]}
              sidekey={request.data.args[2] ? request.data.args[2] : null}
              request={request}
              onConfirm={this.confirm}
              onReject={this.reject}
            />
          )
        default:
          return null
      }
    } else return <Loader />
  }
}

export default ConfirmRequest
