(async () => {
  const keccak = require('keccak')
  const Web3 = require('web3')
  const Tx = require('ethereumjs-tx').Transaction

  const web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER))
  const { toBN, toHex, toWei } = web3.utils

  const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex')
  const from = web3.eth.accounts.privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`).address

  const data = process.env.BYTECODE
  const nonce = toHex(await web3.eth.getTransactionCount(from).then(data => data))
  const gas = toHex(await web3.eth.estimateGas({
    data
  }))

  const rawTransaction = {
    from,
    nonce,
    gasPrice: toHex(await web3.eth.getGasPrice().then(data => data)),
    gas: gas,
    data
  }

  const tx = new Tx(rawTransaction, { 'chain': process.env.NETWORK_NAME })
  tx.sign(privateKey)

  const serializedTx = tx.serialize()

  console.info(`Current provider: ${web3.currentProvider.host}`)
  console.info(`Sender:           ${rawTransaction.from}`)
  console.info(`Nonce:            ${rawTransaction.nonce}`)
  console.info('-----------------------------------------------------------------------------')
  console.info('Submitting Transaction')

  web3.eth.sendSignedTransaction(`0x${serializedTx.toString('hex')}`, (err, tx) => {
    if (err) {
      console.error(err)
      return
    }

    console.info('')
    console.info(`Transaction Hash: ${tx}`)
    console.info('')
  })
})()