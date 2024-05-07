import React from "react";

function LogoutButton({
  account,
  web3Modal,
  loadWeb3Modal,
  web3Provider,
  setWeb3Provider,
  logoutOfWeb3Modal,
}) {
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
          {account.substring(0, 5) +
            "..." +
            account.substring(account.length - 4)}
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
