require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    xlayer: {
      url: process.env.RPC_URL || "https://rpc.xlayer.tech",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    hardhat: {
      forking: {
        url: "https://rpc.xlayer.tech",
        enabled: process.env.FORK_ENABLED === "true",
      },
    },
  },
  etherscan: {
    apiKey: {
      xlayer: process.env.XLAYER_API_KEY || "",
    },
    customChains: [
      {
        network: "xlayer",
        chainId: 196,
        urls: {
          apiURL: "https://www.oklink.com/api/explorer/v1/contract/verify/async/xlayer",
          browserURL: "https://www.oklink.com/xlayer",
        },
      },
    ],
  },
};
