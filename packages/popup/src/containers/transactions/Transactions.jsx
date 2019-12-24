import React, { Component } from 'react'
import Utils from '@pegasus/utils/utils'
import IOTA from '@pegasus/utils/iota'
import Details from '../details/Details'
import Spinner from '../../components/spinner/Spinner'

class Transactions extends Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      opened: {}
    }

    this.promoteTransaction = this.promoteTransaction.bind(this)
    this.replayBundle = this.replayBundle.bind(this)
    this.handleShowDetails = this.handleShowDetails.bind(this)
    this.clickShowDetails = this.clickShowDetails.bind(this)
  }

  async promoteTransaction(hash) {
    try {
      await IOTA.promoteTransaction(hash)
    } catch (err) {
      console.log(err)
    }
  }

  async replayBundle(hash) {
    try {
      await IOTA.replayBundle(hash)
    } catch (err) {
      console.log(err)
    }
  }

  componentWillMount() {
    this.handleShowDetails()
  }

  componentWillReceiveProps(prevProps) {
    this.handleShowDetails()
  }

  //keep open the opened cards
  handleShowDetails() {
    const opened = this.state.opened
    this.props.account.transactions.map(transaction => {
      if (!opened[transaction.bundle]) {
        opened[transaction.bundle] = false
      } else opened[transaction.bundle] = true
    })
    this.setState({ opened })
  }

  clickShowDetails(transaction) {
    this.setState(prevState => {
      const opened = prevState.opened
      opened[transaction.bundle] = !opened[transaction.bundle]
      return {
        opened
      }
    })
  }

  render() {
    return (
      <React.Fragment>
        <div className="container">
          <div className="row">
            <div className="col-6 text-left text-black text-gray text-xs pl-0">History</div>
            <div className="col-6 text-right pr-0">
            {
              this.props.isLoading
                ? <Spinner/>
                : <button onClick={() => this.props.onReload()} className="btn btn-icon-inverted mb-05">
                    <i className="fa fa-refresh"></i>
                  </button>
            }
            </div>
          </div>
        </div>
        <hr />
        <div className="transaction-list">
        {
          this.props.account.transactions.length > 0 
            ? this.props.account.transactions
                .filter(transaction=> transaction.network.type === this.props.network.type)
                .sort((t1, t2) => t1.timestamp < t2.timestamp ? 1 : -1)
                .map((transaction, index) => {
                  return (
                    <div key={index} className="transaction-list-item mt-1">
                      <div className="row">
                        <div className="col-4 text-left text-xxs text-blue my-auto">
                          {Utils.timestampToDate(transaction.timestamp)}
                        </div>
                        <div className="col-4 text-center my-auto">
                          <div className={transaction.status ? 'text-xxs text-bold text-blue' : 'text-xxs text-bold text-gray'} >
                            {
                              transaction.status 
                                ? 'confirmed ' 
                                : 'pending'
                            }
                          </div>
                        </div>
                        <div className="col-4 text-right">
                          <div className="text-sm text-bold">
                            {
                              transaction.value > 0 
                                ? '+' + Utils.iotaReducer(transaction.value)
                                : Utils.iotaReducer(transaction.value)
                            }
                          </div>
                        </div>
                      </div>
                      <div className="row mt-1">
                        <div className="col-6 text-left text-xxs text-blue">
                          <a href={this.props.network.link + 'bundle/' + transaction.bundle} 
                            target="_blank">
                              View on the explorer
                          </a>
                        </div>
                        <div className="col-6 text-right text-xxs text-underline">
                          <a className="cursor-pointer"
                            onClick={() => this.clickShowDetails(transaction)}>
                              View details <i className={this.state.opened[transaction.bundle] ? 'fa fa-eye' : 'fa fa-eye-slash'}></i>
                          </a>
                        </div>
                      </div>
                      {
                        this.state.opened[transaction.bundle] 
                          ? <Details details={transaction.transfer}
                              promoteTransaction={this.promoteTransaction}
                              onReplayBundle={this.replayBundle} />
                          : ''
                      }
                    </div>
                  )
              }) 
            : <div className="row mt-9">
                <div className="col-12 text-center text-xs text-gray">
                  No Transactions
                </div>
              </div>
          }
        </div>
      </React.Fragment>
    )
  }
}

export default Transactions