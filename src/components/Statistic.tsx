import { Box, CircularProgress, Typography, useMediaQuery, useTheme } from "@mui/material"
import { StatisticPageProps } from "../constants/types";
import { useNetwork } from "wagmi";
import { useEffect, useState } from "react";
import { goerli as network1} from 'wagmi/chains'
import { ethers } from "ethers";
import { BLOCK_TIME, CONTRACTS, RPC_URL } from "../constants";
import abi from "../abi/peer.json";
import { secondsToStr } from "../utils/String";

let items: number[] = [];
for(let i = 0; i < 40; i++) {
    items.push(i+4900);
}

export const Statistic:React.FC<StatisticPageProps> = ({toRefresh, setToRefresh, activeValue}) => {
    const theme = useTheme();
    const isSM = useMediaQuery(theme.breakpoints.down('sm'));

    const { chain } = useNetwork();
    const [ prevChain, setPrevChain ] = useState(Number(network1.id));
    const [ depositCount, setDepositCount] = useState(0);
    const [ deposits, setDeposits] = useState(new Array());
    const [ isLoading, setIsLoading] = useState(true);
    const [ lastDeposit, setLastDeposit] = useState(0);

    useEffect(()=>{
        let chainId = prevChain;
        setIsLoading(true);

        const provider = new ethers.providers.JsonRpcProvider(RPC_URL[chainId as keyof typeof RPC_URL]);
        const address = CONTRACTS[chainId as keyof typeof CONTRACTS][activeValue as keyof typeof CONTRACTS[5]];
        const contract = new ethers.Contract(address, abi, provider);
        provider.getBalance(address).then((re)=>{
            const bal = Number(ethers.utils.formatEther(re));
            setDepositCount(Math.floor(bal/Number(activeValue)));
        });
        contract.nextIndex().then((lastNum: any) => {
            setLastDeposit(Number(lastNum.toString()))
        });
        provider.getBlockNumber().then((num)=>{
            const filter = contract.filters.Deposit();
            contract.queryFilter(filter, num-5000, num).then((events)=>{
                setDeposits(events);
                setIsLoading(false);
            });
        });
    }, [toRefresh, activeValue, prevChain])

    useEffect(()=>{
        if(chain) {
            if(chain.id !== prevChain) {
                setPrevChain(chain.id);
            }
        } else {
            setPrevChain(network1.id);
        }
    },[chain])
    return (
        <Box className="component" display="flex" flexDirection="column" paddingY={3} paddingBottom={isSM?3:6} paddingX={isSM?1:4} marginTop={isSM?3:6} borderRadius={5} gap={2} justifyContent="space-around">
            <Box textAlign="left">
                <Typography className="white-text" fontSize="36px">
                    Statistic
                </Typography>
                
                <Typography mt={3} className="white-text" fontSize="24px">
                    Anonymity set
                </Typography>
                <Typography className="gray-text" fontSize="22px">
                    {lastDeposit} equal user deposits
                </Typography>

                <Typography mt={5} className="white-text" fontSize="20px">
                    Latest deposits(Since {secondsToStr(5000*BLOCK_TIME[prevChain as keyof typeof BLOCK_TIME])})
                </Typography>
            </Box>
            <Box className="lighter-component" display="flex" columnGap={5} rowGap={2} flexWrap="wrap" borderRadius={2} paddingY={2} paddingX={2} justifyContent="start">
                {
                    isLoading?
                    <Box flex={1} display="flex" justifyContent="center" alignItems="center" padding={5}>
                        <CircularProgress />
                    </Box>
                    :(deposits.length>0?deposits.slice(0).reverse().map((el, idx)=>(
                        <Box display="flex" paddingX={1} gap={2} whiteSpace="nowrap" justifyContent="space-around">
                            <Box className="gray-text">
                                {lastDeposit-idx}
                            </Box>
                            <Box className="green-text">
                                {secondsToStr(new Date().getTime()/1000 - el.args.timestamp.toNumber())}
                            </Box>
                        </Box>
                    )):<Box flex={1} display="flex" justifyContent="center" alignItems="center" padding={5} color="white">No recent deposit</Box>)
                }
            </Box>
        </Box>
    )
}