import { CONTRACTS } from "../constants";

export const isValidChain = (chainId: number) => {
    return CONTRACTS[chainId as keyof typeof CONTRACTS] !== undefined;
}

export const getValidChains = () => {
    return Object.keys(CONTRACTS);
}