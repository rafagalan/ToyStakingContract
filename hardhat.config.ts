import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import '@typechain/hardhat';

import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.4",
                settings: {
                    outputSelection: {
                        "*": {
                            "*": ["storageLayout"]
                        }
                    },
                    optimizer: {
                        enabled: false,
                        runs: 200
                    }
                },
            }
        ]
    },
    typechain: {
        outDir: "typechain",
        target: "ethers-v5",
    },
    networks: {}
};

export default config;
