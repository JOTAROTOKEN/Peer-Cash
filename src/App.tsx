import { WagmiConfig, configureChains, createClient } from 'wagmi';
import './App.css';
import { Header } from './components/Header';
import { PROJECT_ID, VALUE_STEPS } from './constants';
import { goerli as network1, bscTestnet as network2 } from 'wagmi/chains'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { Action } from './components/Action';
import { Statistic } from './components/Statistic';
import { useState } from 'react';
import { SnackbarProvider } from 'notistack';

function App() {  

  const projectId = PROJECT_ID;

  const chains = [network1, network2];

  const { provider } = configureChains(chains, [w3mProvider({ projectId })]);
  const wagmiClient = createClient({
      autoConnect: true,
      connectors: w3mConnectors({ version: 1, chains, projectId }),
      provider
  });

  const ethereumClient = new EthereumClient(wagmiClient, chains);

  const [toRefresh, setToRefresh] = useState(false);

  const [activeValue, setActiveValue] = useState(VALUE_STEPS[0]);
  return (
    <WagmiConfig client={wagmiClient}>
      <SnackbarProvider autoHideDuration={3000}>
        <div className="main-container">
          <Header toRefresh={toRefresh} setToRefresh={setToRefresh}/>
          <Action toRefresh={toRefresh} setToRefresh={setToRefresh} setActiveValue={setActiveValue} />
          <Statistic toRefresh={toRefresh} setToRefresh={setToRefresh} activeValue={activeValue} />
        </div>
        <Web3Modal themeVariables={{"--w3m-background-color":"#181818"}} projectId={projectId} ethereumClient={ethereumClient} />
      </SnackbarProvider>
    </WagmiConfig>
  )
}

export default App;
