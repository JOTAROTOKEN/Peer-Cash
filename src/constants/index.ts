export const PROJECT_ID="8c5f9792a05e186182bec15a70d269bb";

export const RPC_URL = {
    1: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    5: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    56: "https://bsc-dataseed.binance.org",
    97: "https://data-seed-prebsc-1-s1.binance.org:8545"
}

export const NETWORK_LOGOS = {
    1: "https://img.icons8.com/external-vitaliy-gorbachev-flat-vitaly-gorbachev/512/external-ethereum-cryptocurrency-vitaliy-gorbachev-flat-vitaly-gorbachev.png", // eth
    5: "https://img.icons8.com/external-vitaliy-gorbachev-flat-vitaly-gorbachev/512/external-ethereum-cryptocurrency-vitaliy-gorbachev-flat-vitaly-gorbachev.png", // goerli
    56: "https://cdn-icons-png.flaticon.com/512/6001/6001283.png", // bsc
    97: "https://cdn-icons-png.flaticon.com/512/6001/6001283.png" // bsc test
};

export const VALUE_STEPS = ['0.1', '0.5', '1', '5', '10', '100'];

export const CONTRACTS = {
    5: {
        '0.1': "0x157b1854860e48cc51E47abe68E73C51987d43E4",
        '0.5': "0x20438D23D45ec3507b015428C28dA28253C427a1",
        '1': "0x13CA94C7859EF32cBe46721f9A5f69987ea0904C",
        '5': "0x4963D73d4B11bBb8D0275712F7fa6AC332260d90",
        '10': "0xE7BAea860e807add4d3b218218E8050B596A0cE0",
        '100': "0x4e007162335bC6342621DE8ccd24c5EA1B611753"
    },
    97: {
        '0.1': "0x82345BF211F0a502E5134A1D519EC7B1FE1a32Fe",
        '0.5': "0xA387164a4B9c72917Fc3239Eb29f11551D9B8A3B",
        '1': "0x4153bfA84e747012bbAcd97A5b284eca91be96eB",
        '5': "0x4963D73d4B11bBb8D0275712F7fa6AC332260d90",
        '10': "0xE7BAea860e807add4d3b218218E8050B596A0cE0",
        '100': "0x4e007162335bC6342621DE8ccd24c5EA1B611753"
    }
}

export const TOKENS = {
    1: "ETH",
    5: "ETH",
    56: "BNB",
    97: "BNB"
};

export const TOKENS_2_CHAINS = {
    "ETH": 5,
    "BNB": 97
};

export const BLOCK_TIME = {
    1: 12,
    5: 15,
    56: 3,
    97: 3
};

export const SERVER_URL = "http://localhost:5000";
// export const SERVER_URL = "https://peercash.onrender.com";