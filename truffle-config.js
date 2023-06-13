// COPYRIGHT: FUNDACIÓN TECNALIA RESEARCH & INNOVATION, 2022.
// Licensed to SIC4CHANGE under the following conditions: non-exclusive, irrevocable, non-transferable, and non-sublicensable.
// This license is effective without end date in the field of traceability of patients at risk of malnutrition.

const Web3 = require("web3")
const HDWalletProvider = require("@truffle/hdwallet-provider")

require("dotenv").config()

const createProvider = endpointUrl => {
  if (process.env.DEPLOYER_KEY) {
    return new HDWalletProvider({
      privateKeys: [process.env.DEPLOYER_KEY],
      providerOrUrl: endpointUrl
    })
  }

  return new Web3.providers.HttpProvider(endpointUrl)
}

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    tecnalia: {
      provider: createProvider("https://node1.ethereum.bclab.dev"),
      network_id: "*" // Match any network id
    }
  },
  compilers: {
    solc: {
      version: "0.8.17", // Fetch exact version from solc-bin (default: truffle's version)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
}
