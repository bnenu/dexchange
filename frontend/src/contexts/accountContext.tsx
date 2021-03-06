import React, { createContext, useState, useContext, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

export type Account = string | null;
export type AccountWeb3Provider = any | null;
export type AccountContextValue = {
  account?: Account;
  accountProvider: AccountWeb3Provider;
  connect: () => void;
};

export type AccountProviderProps = {
  children: React.ReactNode;
};

export const AccountContext = createContext<AccountContextValue>(
  {} as AccountContextValue
);

export const AccountProvider = ({
  children,
}: AccountProviderProps): JSX.Element => {
  const [account, setAccount] = useState<Account>(null);
  const [accountProvider, setAccountProvider] =
    useState<AccountWeb3Provider>(null);

  const getWeb3Modal = () => {
    const modal = new Web3Modal({
      cacheProvider: false,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: process.env.REACT_APP_INFURA_PROJECT_ID,
          },
        },
      },
    });

    return modal;
  };

  const connect = async () => {
    try {
      const modal = getWeb3Modal();
      const connection = await modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const accounts = await provider.listAccounts();

      setAccount(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const getWalletProvider = () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      console.log({ signer });

      setAccountProvider(provider);
    }
  };

  useEffect(() => {
    getWalletProvider();
  }, [window.ethereum]);

  return (
    <AccountContext.Provider value={{ account, accountProvider, connect }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  return useContext(AccountContext);
};
