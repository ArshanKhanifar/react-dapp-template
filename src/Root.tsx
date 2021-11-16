import React from "react";
import "./App.css";
import {Web3ContextProvider} from "./Web3Context";
import {App} from "./App";

function Root() {
  return (
    <Web3ContextProvider>
      <App />
    </Web3ContextProvider>
  );
}

export default Root;
