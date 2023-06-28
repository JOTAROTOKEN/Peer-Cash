import { Box, MenuItem, Select, Typography, Step, Stepper, StepButton, StepConnector, styled, stepConnectorClasses, StepIconProps, SelectChangeEvent, Button, Theme, Breakpoint, useTheme, useMediaQuery, TextField, CircularProgress, Backdrop } from "@mui/material"
import { CONTRACTS, TOKENS, TOKENS_2_CHAINS, VALUE_STEPS } from "../constants"
import { ChangeEvent, useEffect, useState } from "react";
import { useAccount, useProvider, useContract, useContractWrite, useNetwork, usePrepareContractWrite, useSigner, useSwitchNetwork } from "wagmi";
import { useWeb3Modal } from "@web3modal/react";
import { ActionPageProps } from "../constants/types";
import abi from "../abi/peer.json";
import { getCommitment, getProof } from "../utils/Axios-functions";
import { ethers } from "ethers";
import { downloadText, getNoteString, parseNote } from "../utils/String";
import { useSnackbar } from "notistack";
import { getValidChains } from "../utils/Chain";

const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 10,
        left: 'calc(-50% + 16px)',
        right: 'calc(50% + 16px)',
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: 'rgba(255, 255, 255, 0.66)',
        borderTopWidth: 3,
        borderRadius: 1,
    },
}));

export const Action: React.FC<ActionPageProps> = ({ toRefresh, setToRefresh, setActiveValue }) => {
    const provider = useProvider();
    const [activeStep, setActiveStep] = useState(0);
    const handleStep = (step: number) => () => {
        setActiveStep(step);
        setActiveValue(VALUE_STEPS[step]);
    };
    const trapezoid = (scale: number, isDark: boolean, isHalf: boolean) => {
        return (
            <Box
                sx={{ transform: `scale(${scale})` }}
                position="absolute"
                bottom={isHalf ? -2 * scale : 0}
                left={0}
            >
                {
                    !isHalf &&
                    <div className={`trapezoid-up ${isDark ? "" : "lighter-trapezoid"} ${!isHalf && isDark && scale < 1 ? "less-dark-trapezoid" : ""}`}></div>
                }
                <div className={`trapezoid-down ${isDark ? "" : "lighter-trapezoid"} ${!isHalf && isDark && scale < 1 ? "less-dark-trapezoid" : ""}`}></div>
            </Box>
        )
    };
    const [token, setToken] = useState("ETH");
    const handleChangeToken = (event: SelectChangeEvent) => {
        if (chain) {
            const newChainId = TOKENS_2_CHAINS[event.target.value as keyof typeof TOKENS_2_CHAINS];
            switchNetwork?.(newChainId);
        } else {
            enqueueSnackbar(`Please connect your wallet.`, {
                variant: "warning"
            });
        }
    };

    const { address, isConnecting, isDisconnected } = useAccount();
    const { open } = useWeb3Modal();
    const { chain } = useNetwork();
    const { switchNetwork, switchNetworkAsync } = useSwitchNetwork();

    const openConnectModal = async () => {
        await open();
    };

    useEffect(() => {
        if (!isDisconnected) {
            if (chain)
                setToken(TOKENS[chain.id as keyof typeof TOKENS]);
        }
    }, [chain, isDisconnected]);

    const { enqueueSnackbar } = useSnackbar();

    const [note, setNote] = useState("");
    const [depositCommit, setDepositCommit] = useState("");
    const [loadingCommit, setLoadingCommit] = useState(false);

    useEffect(() => {
        setLoadingCommit(true);
        getCommitment().then(re => {
            setNote(re.note);
            setDepositCommit(re.commitment);
            setLoadingCommit(false);
        })
    }, [toRefresh])

    const { config } = usePrepareContractWrite({
        address: `0x${CONTRACTS[chain?.id as keyof typeof CONTRACTS]?.[VALUE_STEPS[activeStep] as keyof typeof CONTRACTS[5]]?.substring(2)}`,
        abi: abi,
        functionName: 'deposit',
        args: [depositCommit],
        overrides: {
            value: ethers.utils.parseEther(VALUE_STEPS[activeStep])
        }
    });
    const { writeAsync: doDeposit } = useContractWrite(config);
    const [loadingDeposit, setLoadingDeposit] = useState(false);

    const handleDeposit = async () => {
        enqueueSnackbar(`You must save this downloaded note file. It's used to withdraw your fund.`, {
            variant: "warning"
        });
        downloadText(`Note-${token}-${VALUE_STEPS[activeStep]}.txt`, getNoteString(token, Number(VALUE_STEPS[activeStep]), chain ? chain.id : 1, note));
        try {
            setLoadingDeposit(true);
            setShowBackDrop(true);
            setBackDropMsg("Please confirm sending transaction");
            let tx = await doDeposit?.();
            setBackDropMsg("Sending transaction");
            let result = await tx?.wait();

            const waitingFor20Block = async ()=>{
                const curBlock = await provider.getBlockNumber();
                if(result?.blockNumber) {
                    if(curBlock - result?.blockNumber <= 20) {
                        setBackDropMsg(`Waiting for transaction confirmation ${curBlock - result?.blockNumber}/20`);
                        setTimeout(waitingFor20Block, 1000);
                    } else {
                        completeDeposit();
                    }
                }                
            }
            waitingFor20Block();

            const completeDeposit = () => {
                setShowBackDrop(false);
                setBackDropMsg("");
                enqueueSnackbar(`Deposit is made.`, {
                    variant: "success"
                });
                setToRefresh(!toRefresh);
                setLoadingDeposit(false);
            };
        } catch (ex) {
            setShowBackDrop(false);
            setLoadingDeposit(false);
        }
    };
    const [noteForWithdraw, setNoteForWithdraw] = useState("");
    const [receipient, setReceipient] = useState("");
    const [loadingWithdraw, setLoadingWithdraw] = useState(false);
    const [withdrawChain, setWithdrawChain] = useState(getValidChains()[0]);
    const [withdrawAmount, setWithdrawAmount] = useState(VALUE_STEPS[0]);

    const { data: signer } = useSigner();
    const contract = useContract({
        address: `0x${CONTRACTS[Number(withdrawChain) as keyof typeof CONTRACTS]?.[withdrawAmount as keyof typeof CONTRACTS[5]]?.substring(2)}`,
        abi: abi,
        signerOrProvider: signer
    });

    const handleWithdraw = async () => {
        if (!noteForWithdraw || !receipient)
            return;
        setLoadingWithdraw(true);
        try {
            parseNote(noteForWithdraw);
            if (chain?.id !== Number(withdrawChain)) {
                const chainName = ethers.providers.getNetwork(Number(withdrawChain)).name;
                enqueueSnackbar(`Retry after switch network to ${chainName}.`, {
                    variant: "warning"
                });
                await switchNetworkAsync?.(Number(withdrawChain));
                setLoadingWithdraw(false);
            } else {    
                setShowBackDrop(true);
                setBackDropMsg("Getting Proof");
                const params = await getProof(noteForWithdraw, receipient);
                setBackDropMsg("Please confirm sending transaction");
                let tx = await contract?.withdraw(params[0], params[1], params[2], params[3], params[4], params[5], params[6]);
                setBackDropMsg("Sending transaction");
                
                let result = await tx?.wait();

                const waitingFor20Block = async ()=>{
                    const curBlock = await provider.getBlockNumber();
                    if(result?.blockNumber) {
                        if(curBlock - result?.blockNumber <= 20) {
                            setBackDropMsg(`Waiting for transaction confirmation ${curBlock - result?.blockNumber}/20`);
                            setTimeout(waitingFor20Block, 1000);
                        } else {
                            completeWithdraw();
                        }
                    }                
                }
                waitingFor20Block();

                const completeWithdraw = () => {
                    setBackDropMsg("");
                    setShowBackDrop(false);
                    enqueueSnackbar(`Withdraw is done.`, {
                        variant: "success"
                    });
                    setToRefresh(!toRefresh);
                    setLoadingWithdraw(false);
                }
            }
        } catch (_e) {
            enqueueSnackbar((_e as Error).message, {
                variant: "error"
            });
            setLoadingWithdraw(false);
            setShowBackDrop(false);
        }
    };

    const handleChangeNote = (event: ChangeEvent<HTMLInputElement>) => {
        const newNote = event.target.value;
        setNoteForWithdraw(newNote);
        let parsedNote = parseNote(newNote);
        setWithdrawChain(parsedNote.netId.toString());
        setWithdrawAmount(parsedNote.amount?.toString());
    }

    const [activeTab, setActiveTab] = useState("deposit");

    const theme = useTheme();
    const isSM = useMediaQuery(theme.breakpoints.down('sm'));

    const [showBackdrop, setShowBackDrop] = useState(false);
    const [backDropMsg, setBackDropMsg] = useState("");
    return (
        <Box className="component" display="flex" flexWrap="wrap" paddingY={isSM ? 4 : 11} paddingX={1} marginTop={isSM ? 3 : 6} borderRadius={5} gap={2} justifyContent="space-around">
            <Box display="flex" flexDirection="column" maxWidth="670px" flex={1}>
                <Box
                    className="lighter-component green-text"
                    paddingX={2.5}
                    paddingY={1}
                    borderRadius={2}
                    textTransform="uppercase"
                    width="max-content"
                >
                    Non-Tracable-Transactions
                </Box>
                <Box marginTop={4} className="white-text" fontSize={`${isSM ? 42 : 63}px`} lineHeight={1.1}>
                    A decentralized way to move your funds anonymously
                </Box>
                <Box className="gray-text" fontSize={`${isSM ? 18 : 22}px`} marginTop={3}>
                    With SATS Cash, you can obscure the origin and destination of your
                    funds, making it difficult for anyone to trace your transactions or link
                    them to your identity.
                </Box>
            </Box>
            <Box textAlign="center" flex={1} maxWidth="500px">
                <Box
                    position="relative"
                    paddingX={3.5}
                    paddingY={1.5}
                    width="max-content"
                    marginX="auto"
                >
                    {trapezoid(1.2, false, true)}
                    {trapezoid(1.15, true, true)}
                    {trapezoid(1, false, false)}
                    {trapezoid(0.95, true, false)}
                    <Box position="relative" width="max-content">
                        <img src="/images/hacker.png" />
                    </Box>
                </Box>
                <Box className="action-component lighter-border" borderRadius={3} marginTop="-40px" border={1}>
                    <Box
                        display="flex"
                        width="100%"
                        fontSize="23px"
                        className="lighter-border"
                        justifyContent="space-around"
                        gap={6}
                        border={0}
                        borderBottom={1}
                    >
                        <Box padding={2} className={`${activeTab === "deposit" ? "white-text" : "gray-text-2"} tab-button`} onClick={() => setActiveTab("deposit")}>
                            Deposit
                        </Box>
                        <Box padding={2} paddingLeft={5} className={`${activeTab === "withdraw" ? "white-text" : "gray-text-2"} tab-button`} onClick={() => setActiveTab("withdraw")}>
                            Withdraw
                        </Box>
                    </Box>
                    <Box padding={5} paddingTop={7}>
                        {activeTab === "deposit" &&
                            <>
                                <Box>
                                    <Typography mb={2} textAlign="left" className="white-text">Token</Typography>
                                    <Select
                                        id="token-select"
                                        value={token}
                                        label=""
                                        className="token-select"
                                        onChange={handleChangeToken}
                                    >
                                        <MenuItem value="ETH">ETH</MenuItem>
                                        <MenuItem value="BNB">BNB</MenuItem>
                                    </Select>
                                </Box>
                                <Box mt={3.5}>
                                    <Typography textAlign="left" className="white-text" my={2}>Amount</Typography>
                                    <Stepper nonLinear alternativeLabel activeStep={activeStep} connector={<QontoConnector />}>
                                        {VALUE_STEPS.map((label, index) => (
                                            <Step key={label} completed={false}>
                                                <StepButton color="inherit" onClick={handleStep(index)}>
                                                    {label}
                                                </StepButton>
                                            </Step>
                                        ))}
                                    </Stepper>
                                </Box>
                                <Box mt={2}>
                                    <Button variant="contained" fullWidth className="green-button clickable-component" onClick={!address || isConnecting || isDisconnected ? openConnectModal : handleDeposit} disabled={loadingDeposit || loadingCommit}>
                                        {
                                            loadingDeposit || loadingCommit ?
                                                <CircularProgress color="inherit" size={16} /> :
                                                (
                                                    !address || isConnecting || isDisconnected ?
                                                        "Connect wallet" :
                                                        "Deposit"
                                                )
                                        }
                                    </Button>
                                </Box>
                            </>}
                        {activeTab === "withdraw" &&
                            <>
                                <Box>
                                    <Typography mb={2} textAlign="left" className="white-text">Note</Typography>
                                    <TextField className="input-field" variant="outlined" value={noteForWithdraw} onChange={handleChangeNote} />
                                </Box>
                                <Box mt={2}>
                                    <Typography mb={2} textAlign="left" className="white-text">Recipient address</Typography>
                                    <TextField className="input-field" variant="outlined" value={receipient} onChange={(event) => setReceipient(event.target.value)} />
                                </Box>
                                <Box mt={2}>
                                    <Button variant="contained" fullWidth className="green-button clickable-component" onClick={!address || isConnecting || isDisconnected ? openConnectModal : handleWithdraw} disabled={loadingWithdraw}>
                                        {
                                            loadingWithdraw ?
                                                <CircularProgress color="inherit" size={16} /> :
                                                (
                                                    !address || isConnecting || isDisconnected ?
                                                        "Connect wallet" :
                                                        "Withdraw"
                                                )
                                        }
                                    </Button>
                                </Box>
                            </>
                        }
                    </Box>
                </Box>
            </Box>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={showBackdrop}
            >
                <CircularProgress color="inherit" sx={{marginRight: "0.5em"}} /> {backDropMsg}
            </Backdrop>
        </Box>
    )
}