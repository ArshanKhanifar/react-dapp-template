import React, { useEffect, useState } from "react";
import { useWeb3Context } from "./Web3Context";
import { TopBar } from "./components/TopBar";

export const App = () => {
  const { connected, address, hasCachedProvider, connect, chainID } =
    useWeb3Context();

  const secret = process.env.NOT_SECRET_CODE;

  const [color, setColor] = useState("#aabbcc");

  useEffect(() => {
    if (hasCachedProvider()) {
      connect();
    }
  }, []);

  return (
    <div className="App">
      <TopBar />
      <div className={"main-container"}>
        {connected ? (
          <>
            <h1>Connected</h1>
            <p>Chain ID: {chainID}</p>
            <p>address: {address}</p>
          </>
        ) : (
          <>
            <h1>Not Connected</h1>
            <p>You are not connected, connect to metamask</p>
          </>
        )}
        {connected && <h1>you're connected!</h1>}
      </div>
    </div>
  );
};
