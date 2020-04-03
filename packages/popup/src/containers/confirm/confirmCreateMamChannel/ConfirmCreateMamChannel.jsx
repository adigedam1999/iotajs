import React from 'react'
import RequestHeader from '../../../components/requestHeader/RequestHeader'

const ConfirmCreateMamChannel = props => {
  return (
    <div className="container">
      <RequestHeader title="Confirm MAM operation" />
      <hr className="mt-2 mb-2" />

      <div className="row mt-8">
        <div className="col-12 text-center text-md text-blue">
          Are you sure you want to create a MAM channel?
        </div>
      </div>

      <hr className="mt-24 mb-2" />

      <div className="row mt-3">
        <div className="col-6 pr-2">
          <button
            onClick={() => props.onReject(props.request)}
            className="btn btn-border-blue text-sm text-bold btn-big"
          >
            Reject
          </button>
        </div>
        <div className="col-6 pl-2">
          <button
            onClick={() => props.onConfirm(props.request)}
            className="btn btn-blue text-sm text-bold btn-big"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmCreateMamChannel
