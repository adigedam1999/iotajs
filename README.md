![Alt text](packages/popup/public/material/logo/pegasus-64.png?raw=true "Title")
# PEGASUS
 Pegasus is a chrome extension that implements a wallet for the IOTA cryptocurrency. In addition, Pegasus injects the iotajs library allowing developers to interact with IOTA ecosystem without paying attention on how to keep the seed safe.


### Installing

```
git clone https://github.com/allemanfredi/PEGASUS.git
```

```
cd PEGASUS
```

```
yarn install
lerna bootstrap
```

```
yarn build
```

If you want to build only the popup:

```
yarn build:popup
```

if you want to build background, contentScript and lib

```
yarn build:core
```


After having built the application, it needs to be loaded on chrome.

## How to install Chrome extensions manually

* Go to chrome://extensions/ and check the box for Developer mode in the top right.
* Click the Load unpacked extension button and select the build folder for your extension to install it.

## How the seed is stored?
An user during the initialization phase will have to enter a password that will be used as a key to encrypt the seed. Of this password the hash will be saved in the localStorage in order to use it during login. The plain text of the password (encryption key) will be saved in a variable within the background script. After 15 minutes of inactivity, the wallet will delete this variable so that the key has not been saved anywhere. In this way the seed encryption key is saved only in the user's mind and in a variable when using the wallet.


## In development : iotaJs injection.


```js
if (window.iota) {
    const iotajs = window.iota.iotajs;
    const selectedAddress = window.iota.selectedAddress
    
    const transfers = [{
        address: 'address here',
        value: 10, 
        tag: '', // optional tag of `0-27` trytes
        message: '' // optional message in trytes
    }];

    iotajs.prepareTransfers(transfers , (bundle,err) => {
        if (!err){
            console.log(bundle);
        }
    });
}
```

## List of Supported injected functions

### addNeighbors(uris,callback)

| Param | Type | Description |
| --- | --- | --- |
| uris | <code>Array</code> | List of URI's |
| callback | <code>function</code> | callback |

### attachToTangle(trunkTransaction, branchTransaction, minWeightMagnitude, trytes, callback)

| Param | Type | Description |
| --- | --- | --- |
| trunkTransaction | <code>Hash</code> | Trunk transaction as returned by [`getTransactionsToApprove`](#module_core.getTransactionsToApprove) |
| branchTransaction | <code>Hash</code> | Branch transaction as returned by [`getTransactionsToApprove`](#module_core.getTransactionsToApprove) |
| minWeightMagnitude | <code>number</code> | Number of minimun trailing zeros in tail transaction hash |
| trytes | <code>Array.&lt;TransactionTrytes&gt;</code> | List of transaction trytes |
| [callback] | <code>Callback</code> | Optional callback |

Performs the Proof-of-Work required to attach a transaction to the Tangle by
calling [`attachToTangle`](https://docs.iota.works/iri/api#endpoints/attachToTangle) command.
Returns list of transaction trytes and overwrites the following fields:
 - `hash`
 - `nonce`
 - `attachmentTimestamp`
 - `attachmentTimsetampLowerBound`
 - `attachmentTimestampUpperBound`

 ### broadcastBundle(tailTransactionHash, callback)

 | Param | Type | Description |
| --- | --- | --- |
| tailTransactionHash | <code>Hash</code> | Tail transaction hash |
| [callback] | <code>Callback</code> | Optional callback |

Re-broadcasts all transactions in a bundle given the tail transaction hash.
It might be useful when transactions did not properly propagate,
particularly in the case of large bundles.


### getNodeInfo(callback)

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | callback |


### prepareTransfers(transfers,callback)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| transfers | <code>object</code> |  |  |
| [options] | <code>object</code> |  |  |
| [options.inputs] | <code>Array.&lt;Input&gt;</code> |  | Inputs used for signing. Needs to have correct security, keyIndex and address value |
| [options.inputs[].address] | <code>Hash</code> |  | Input address trytes |
| [options.inputs[].keyIndex] | <code>number</code> |  | Key index at which address was generated |
| [options.inputs[].security] | <code>number</code> | <code>2</code> | Security level |
| [options.inputs[].balance] | <code>number</code> |  | Balance in iotas |
| [options.address] | <code>Hash</code> |  | Remainder address |
| [options.security] | <code>Number</code> |  | Security level to be used for getting inputs and reminder address |
| callback | <code>function</code> |  | callback |

