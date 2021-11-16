import React, {
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

export enum NetworkID {
  MAIN_NET = 0,
  LOCAL_NET = 31337,
}

type onChainProvider = {
  connect: () => void;
  disconnect: () => void;
  provider: ethers.providers.Web3Provider;
  hasCachedProvider: () => Boolean;
  address: string;
  chainID: number;
  connected: Boolean;
  web3Modal: Web3Modal;
  uri: string;
};

export type Web3ContextData = {
  onChainProvider: onChainProvider;
} | null;

export const Web3Context = React.createContext<Web3ContextData>(null);

export const useWeb3Context = () => {
  const web3Context = useContext(Web3Context);
  if (!web3Context) {
    throw new Error(
      "useWeb3Context() can only be used inside of <Web3ContextProvider />, " +
        "please declare it at a higher level."
    );
  }
  const { onChainProvider } = web3Context;
  return useMemo(() => {
    return { ...onChainProvider };
  }, [onChainProvider]);
};

const getLocalnetURI = () => "https://127.0.0.1:8545";
const getMainnetURI = () => process.env.REACT_APP_MAINNET_URI;

const CHAIN_ADDRESS: {
  [key: number]: string;
} = {
  [NetworkID.LOCAL_NET]: getLocalnetURI(),
  [NetworkID.MAIN_NET]: getLocalnetURI(),
};

const CHAIN_INFO = {
  [NetworkID.LOCAL_NET]: {
    chainId: "0x7a69",
    chainName: "Hardhat Chain",
    rpcUrls: [getLocalnetURI()],
  },
  [NetworkID.MAIN_NET]: {
    chainId: "1",
    chainName: "Ethereum Mainnet",
    rpcUrls: [getMainnetURI()],
  },
};

const VALID_CHAIN = NetworkID.MAIN_NET;

export const Web3ContextProvider: FunctionComponent<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [connected, setConnected] = useState(false);
  const [chainID, setChainID] = useState<NetworkID>(NetworkID.LOCAL_NET);
  const [address, setAddress] = useState("");
  const [uri, setUri] = useState(CHAIN_ADDRESS[chainID] as string);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>(
    null!
  );

  const [web3Modal] = useState<Web3Modal>(
    new Web3Modal({
      cacheProvider: true,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            rpc: {
              [NetworkID.LOCAL_NET]: getLocalnetURI(),
              [NetworkID.MAIN_NET]: getMainnetURI(),
            },
          },
        },
      },
    })
  );

  const _checkNetwork = useCallback(
    (otherChainID: number): Boolean => {
      if (chainID !== otherChainID) {
        console.warn("You are switching networks");
        if (otherChainID === VALID_CHAIN) {
          setChainID(otherChainID);
          setUri(CHAIN_ADDRESS[otherChainID]);
          return true;
        }
        return false;
      }
      return true;
    },
    [chainID]
  );

  const _initListeners = useCallback(
    (rawProvider) => {
      if (!rawProvider.on) {
        return;
      }
      rawProvider.on("accountsChanged", async (accounts: string[]) => {
        accounts[0] && setAddress(accounts[0]);
      });

      rawProvider.on("chainChanged", async (chain: number) => {
        console.log("chain changed", chain);
        _checkNetwork(chain);
      });

      rawProvider.on("network", (_newNetwork: any, oldNetwork: any) => {
        console.log("network changed", _newNetwork);
      });
    },
    [_checkNetwork]
  );

  const connect = async () => {
    const rawProvider = await web3Modal.connect();
    _initListeners(rawProvider);
    const connectedProvider = new ethers.providers.Web3Provider(rawProvider);
    const chainId = await connectedProvider
      .getNetwork()
      .then((network) => network.chainId);
    const connectedAddress = await connectedProvider.getSigner().getAddress();
    const validNetwork = _checkNetwork(chainId);

    const validChain = CHAIN_INFO[NetworkID.MAIN_NET];

    if (!validNetwork) {
      console.info("Wrong network, requesting to switch to hardhat.");
      return connectedProvider.send("wallet_addEthereumChain", [
        {
          ...validChain,
          chainId: "0x7a69",
          chainName: "Hardhat Chain",
          rpcUrls: ["https://127.0.0.1:8545"],
        },
      ]);
    }
    setAddress(connectedAddress);
    setProvider(connectedProvider);
    setConnected(true);
    return connectedProvider;
  };

  const disconnect = useCallback(async () => {
    web3Modal.clearCachedProvider();
    console.log("cached provider", web3Modal.cachedProvider);
    setConnected(false);
    setTimeout(() => window.location.reload(), 1);
  }, [provider, web3Modal, connected]);

  const hasCachedProvider = (): Boolean => {
    if (!web3Modal) return false;
    if (!web3Modal.cachedProvider) return false;
    return true;
  };

  const onChainProvider = useMemo(
    () => ({
      connect,
      disconnect,
      hasCachedProvider,
      provider,
      connected,
      address,
      chainID,
      web3Modal,
      uri,
    }),
    [
      disconnect,
      hasCachedProvider,
      provider,
      connected,
      address,
      chainID,
      web3Modal,
      uri,
    ]
  );

  console.log({ connected, address, chainID, uri });

  return (
    <Web3Context.Provider value={{ onChainProvider }}>
      {children}
    </Web3Context.Provider>
  );
};
