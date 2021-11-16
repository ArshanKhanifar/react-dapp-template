import React from "react";
import { useWeb3Context } from "../Web3Context";
import { AppBar, Button, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export const TopBar = () => {
  const { connect, connected, disconnect } = useWeb3Context();
  return (
    <AppBar position={"sticky"}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Awesome Project woohoo
        </Typography>
        {connected ? (
          <Button color="inherit" onClick={disconnect}>
            Disconnect
          </Button>
        ) : (
          <Button color="inherit" onClick={connect}>
            Connect Wallet
          </Button>
        )}
      </Toolbar>{" "}
    </AppBar>
  );
};
