export const getShortendAddress = (address: string) => {
    return address.substring(0,4).concat("...").concat(address.substr(-4));
}