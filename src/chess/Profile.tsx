import { Address } from "../Address";
import { CosmWasm } from "./useCosmWasm";
import "./Profile.css";

export interface ProfileProps {
  cosmWasm: CosmWasm;
}

export function Profile(props: ProfileProps) {
  const { address, connect, connected, disconnect, name } = props.cosmWasm;

  return (
    <div className="profile">
      {connected ? (
        <>
          <button onClick={disconnect}>Disconnect {name}</button>
          <br />
          <small>
            <Address address={address} />
          </small>
        </>
      ) : (
        <>
          <button onClick={connect}>Connect Keplr</button>
        </>
      )}
    </div>
  );
}
