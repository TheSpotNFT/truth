import { useEffect } from "react";

function LogoutButton({
  account,
  web3Modal,
  loadWeb3Modal,
  web3Provider,
  setWeb3Provider,
  logoutOfWeb3Modal,
}) {
  const AVAX_NETWORK_PARAMS = {
    chainId: "0xa86a", // Avalanche chain ID in hexadecimal (43114)
    chainName: "Avalanche C-Chain",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://cchain.explorer.avax.network/"],
  };

  const switchToAvalanche = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [AVAX_NETWORK_PARAMS],
      });
    } catch (error) {
      console.error("Failed to switch to the Avalanche network", error);
    }
  };

  useEffect(() => {
    const checkNetwork = async () => {
      if (web3Provider) {
        const network = await web3Provider.getNetwork();
        if (network.chainId !== 43114) {
          await switchToAvalanche();
        }
      }
    };
    checkNetwork();
  }, [web3Provider]);
  // const { logout, isAuthenticating, account } = useMoralis();
  // const { switchNetwork, chainId } = useChain();
  if (account) {
    return (
      <div className="text-right lg:flex align-middle py-2">
        <div className="align-middle py-2">
          {/* <h1 className="text-slate-600 text-right font-mono px-10 py-0"><b>Wallet:</b> {(chainId==="0xa86a")?account.substring(0,5)+'...'+account.slice(-4):<button className="text-[red]" onClick={()=>switchNetwork("0xa86a")}>Switch to Avalanche!</button>}</h1> */}
        </div>
        <button
          className="rounded-sm px-4 py-0 border-4 border-opacity-80 border-black text-l text-black 
          hover:bg-white hover:border-black hover:text-black duration-300 hover:scale-105"
          onClick={() => logoutOfWeb3Modal()}
        >
          {account.substring(0, 4) +
            ".." +
            account.substring(account.length - 3)}
        </button>
      </div>
    );
  }
  return (
    <div className="text-right lg:flex align-middle py-0">
      <div className="align-middle py-2">
        <button
          className="rounded-sm px-4 py-0 border-4 border-opacity-80 border-black text-xl text-black 
            hover:bg-white hover:border-black hover:text-black duration-300 hover:scale-105"
          onClick={() => loadWeb3Modal()}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default LogoutButton;
