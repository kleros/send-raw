(async () => {
  const keccak = require('keccak')
  const Web3 = require('web3')
  const Tx = require('ethereumjs-tx').Transaction

  const web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER))
  const { toBN, toHex } = web3.utils

  const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex')
  const from = web3.eth.accounts.privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`).address
  const data = process.env.BYTECODE

  const [nonce, gas, gasPrice] = await Promise.all([
    web3.eth.getTransactionCount(from).then(data => data),
    web3.eth.estimateGas({ data }),
    web3.eth.getGasPrice().then(data => data)
  ])

  const rawTransaction = {
    from,
    nonce: toHex(nonce),
    gasPrice: toHex(gasPrice) > 20000000000 ? toHex(gasPrice) : 20000000000,
    gas: toHex(gas),
    data,
    value: 0x00
  }

  const tx = new Tx(rawTransaction, { 'chain': process.env.NETWORK_NAME })
  tx.sign(privateKey)

  const serializedTx = tx.serialize()

  console.info(`Current provider: ${web3.currentProvider.host}`)
  console.info(`Sender:           ${rawTransaction.from}`)
  console.info(`Nonce:            ${rawTransaction.nonce}`)
  console.info(`Estimated Gas:    ${rawTransaction.gas}`)
  console.info(`Gas Price Used:   ${rawTransaction.gasPrice}`)
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