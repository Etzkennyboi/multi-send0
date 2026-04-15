require('@nomicfoundation/hardhat-toolbox');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    xlayer: {
      url: process.env.RPC_URL || 'https://rpc.xlayer.tech',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};
