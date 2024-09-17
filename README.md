# **cosmos-chess-ui**

A **React** front-end built with **Vite** for interacting with the **cosmos-chess** smart contract, allowing users to create, view, and play chess games on the blockchain.

## **Overview**

This UI enables users to:
- **View Chess Games:** Browse through existing games and challenges.
- **Create and Accept Challenges:** Users can initiate new games or accept challenges from other players.
- **Play Chess:** Take turns playing chess directly through the UI.

### **Game Management:**
- The **cosmos-chess** smart contract supports paging through lists of games and challenges and filtering by game status, though these features are not yet implemented in the dashboard.

## **Development Notes**

- **Libraries and Tools:**
  - The project utilizes `@cosmjs/cosmwasm-stargate` and associated libraries for interacting with the blockchain, including handling connections to **Keplr** wallet and localnet.
  - The `useCosmWasm` hook is central to the interaction with the blockchain but may require further refinement to optimize its functionality.

- **Contract Interactions:**
  - All interfaces and logic for communicating with the **Juno**-based chess smart contract are centralized in `src/chess/CosmWasmChess.ts`.

- **Chessboard Implementation:**
  - A custom chessboard implementation has been developed, allowing for flexible and user-friendly interactions, particularly through click-based movements.

## **Local Testing**

To test the UI locally, follow these steps:

1. **Start the Local Node:**
   - Ensure the local **Juno** node for **cosmos-chess** is running.
   - If the smart contract is not yet deployed, follow the deployment instructions in the **cosmos-chess** project's `README.md`.

2. **Update Imports:**
   - In `src/App.tsx`, replace imports from **juno** with **testnet** to match your local environment.

3. **Update Smart Contract Address**
   - In `testnet.ts`, locate line 43 and replace `CONTRACT` address value with the actual deployed smart contract address.

4. **Configure Player Wallet Addresses:**
  
    To simulate a real chess game, create two clients with different player configurations:
   - Player 1
     - In `useLocalWallet.ts`, locate line 44 and set `player` variable to `tester1`.
     - The default port for this client is 5173.
   - Player 2
     - In `useLocalWallet.ts`, locate line 44 and set `player` variable to `tester2`.
     - In `vite.config.ts`, add the following snippet at line 28 to configure with a different port.
        ```ts
        server: {
          host: '127.0.0.1',
          port: 4000, /* any port number */
        }
        ```

5. **Install Dependencies:**
   - Run the following commands to install the required packages:
     ```bash
     yarn install
     ```

6. **Run the Development Server:**
   - Start the development server with:
     ```bash
     yarn dev
     ```
   - The application should now be accessible in your browser, allowing you to interact with the **cosmos-chess** smart contract and play chess games.