import "./config"
import "./decorate"
import { useState, useEffect } from "react"
import { COMMANDS } from "./cmds"
import useCurrentUser from "./hooks/use-current-user"
import useConfig from "./hooks/use-config"
import WalletConnectClient, { CLIENT_EVENTS } from "@walletconnect/client";
import QRCodeModal from "@walletconnect/legacy-modal";

const renderCommand = d => {
  return (
    <li key={d.LABEL}>
      <button onClick={d.CMD}>{d.LABEL}</button>
    </li>
  )
}

export default function Root() {
  const currentUser = useCurrentUser()
  const config = useConfig()

  const [client, setClient] = useState(null)
  const [session, setSession] = useState(null)

  const init = async () => {
    const client = await WalletConnectClient.init({
      projectId: "6427e017c4bd829eef203702a51688b0",
      relayUrl: "wss://relay.walletconnect.com",
      metadata: {
        name: "Example Dapp",
        description: "Example Dapp",
        url: "#",
        icons: ["https://walletconnect.com/walletconnect-logo.png"],
      },
    });

    client.on(
      CLIENT_EVENTS.pairing.proposal,
      async (proposal) => {
        // uri should be shared with the Wallet either through QR Code scanning or mobile deep linking
        const { uri } = proposal.signal.params;
        console.log("EVENT", "QR Code Modal open");

        if (/Mobi/.test(navigator.userAgent)) {
          window.location.assign('FWC://' + uri, '_blank')
        } else {
          QRCodeModal.open(uri, null, { mobileLinks: ['FWC://'] }, () => {
            console.log("EVENT", "QR Code Modal closed");
          });
        }
      }
    );

    client.on(CLIENT_EVENTS.pairing.created, async (proposal) => {
      // this.setState({ pairings: this.state.client.pairing.topics });
      console.log("[EVENT]", "session_created", proposal);
    });

    client.on(CLIENT_EVENTS.session.deleted, (session) => {
      // if (session.topic !== this.state.session?.topic) return;
      console.log("[EVENT]", "session_deleted", session);
      setSession(null);
    });

    setClient(client);
  }

  const sendAuthn = async () => {
    console.log('<--- handle Authn -->');
    const result = await client.request({
      topic: session.topic,
      request: {
        method: "flow_authn",
        params: [],
      },
    });
    console.log('<--- result -->', result);
  }

  const sendAuthz = async () => {
    console.log('<--- handle Authz -->');
    const result = await client.request({
      topic: session.topic,
      request: {
        method: "flow_authz",
        params: [{
          referenceId: "0x123123123",
          cadence: "import Crypto",
          args: [
            {type: "UInt8", value: "2"}
          ]
        }],
      },
    });
    console.log('<--- result -->', result);
  }

  const handleWalletConnect = async () => {
    console.log('<--- handleWalletConnect -->');

    const DEFAULT_APP_METADATA = {
      name: "Flow App",
      description: "Flow DApp for WalletConnect",
      url: "https://testFlow.com/",
      icons: ["https://avatars.githubusercontent.com/u/62387156?s=280&v=4"],
    };

    const session = await client.connect({
      metadata: DEFAULT_APP_METADATA,
      permissions: {
        blockchain: {
          chains: ["flow:1"],
        },
        jsonrpc: {
          methods: ["flow_signMessage", "flow_authz", "flow_authn"],
        },
      },
    });

    setSession(session);
    console.log('<--- session -->', session);
    QRCodeModal.close();
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <div>
      <ul>{COMMANDS.map(renderCommand)}</ul>
      <ul>
        {client && <button onClick={handleWalletConnect}>Wallet Connect</button>}
        {session && <button onClick={sendAuthn}>WalletConnect Authn</button>}
        {session && <button onClick={sendAuthz}>WalletConnect Authz</button>}
      </ul>
      <pre>{session && JSON.stringify({ session }, null, 2)}</pre>
      <pre>{JSON.stringify({ currentUser, config }, null, 2)}</pre>
    </div>
  )
}
