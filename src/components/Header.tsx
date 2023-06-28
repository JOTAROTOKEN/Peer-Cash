
import { Web3NetworkSwitch, useWeb3Modal } from '@web3modal/react'
import { useAccount, useSwitchNetwork } from 'wagmi'
import { goerli as network1, bscTestnet as network2 } from 'wagmi/chains'
import { useNetwork } from 'wagmi'
import { CONTRACTS, NETWORK_LOGOS } from '../constants'
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material'
import { getShortendAddress } from '../utils/Address'
import { useEffect, useState } from 'react'
import { CommonPageProps } from '../constants/types'
import { getValidChains, isValidChain } from '../utils/Chain'

export const Header:React.FC<CommonPageProps> = ({toRefresh, setToRefresh}) => {
    const { address, isConnecting, isDisconnected } = useAccount();
    const { open } = useWeb3Modal();
    const { chain } = useNetwork();
    const { switchNetwork } = useSwitchNetwork();

    const openConnectModal = async() => {
        await open();
    };

    const openSwitchModal = async() => {
        await open({route:"SelectNetwork"});
    };

    useEffect(() => {
        if (!isDisconnected) {
            if (chain && !isValidChain(chain.id)) {
                switchNetwork?.(Number(getValidChains()[0].toString()));
                return;
            }
        }
    }, [chain, isDisconnected]);

    const theme = useTheme();
    const isSM = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <Box className="component" display="flex" flexWrap="wrap" justifyContent="space-between" padding={2} borderRadius={5} gap={2}>
            <Box display="flex" paddingX={2} alignItems="center" gap={2} borderRight="2px solid #212121">
                <Box>
                    <img src="/logo.png" />
                </Box>
                {!isSM &&
                <Box className="white-text" paddingRight={1}>
                    <Typography fontSize="32px" variant='h4'>
                        CASH
                    </Typography>
                </Box>}
            </Box>
            <Box display="flex" gap={3} flexWrap="wrap" justifyContent="end">
                <Box display="flex" borderRadius={3} overflow="hidden" className="lighter-component clickable-component" onClick={()=>openSwitchModal()}>
                    <Box className="gradient-bordered-component" display="flex" padding={0.5} borderRadius={3}>
                        <Box className="component" display="flex" alignItems="center" paddingX={1.5} paddingY={1.2} borderRadius={3}>
                            <img src={NETWORK_LOGOS[(chain&&isValidChain(chain.id)?chain.id:getValidChains()[0]) as keyof typeof NETWORK_LOGOS]} width={32} /> 
                        </Box>
                    </Box>
                    {!isSM &&
                    <Box paddingX={2} className="white-text" display="flex" alignItems="center">
                        <Typography fontSize="18px">
                            {(chain&&isValidChain(chain.id))?chain.name:network1.name}
                        </Typography>
                    </Box>}
                </Box>
                <Box display="flex" className="clickable-component">
                    <Box className="gradient-bordered-component" display="flex" padding={0.5} borderRadius={3}>
                        <Button variant='contained' className='connect-button' onClick={()=>openConnectModal()}>
                            <div className='gradient-text gradient-bordered-component'>
                                {!isSM?
                                (isConnecting?"Connecting...":(isDisconnected||!address?"Connect wallet":getShortendAddress(address.toString()))):
                                <img src={isConnecting?"https://img.icons8.com/fluency/512/spinner-frame-5.png":(isDisconnected||!address?"https://img.icons8.com/nolan/512/enter-2.png":"https://img.icons8.com/nolan/256/coin-wallet.png")} />}
                            </div>
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}