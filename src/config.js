import * as fcl from "@onflow/fcl"
import { send as httpSend } from "@onflow/transport-http"
import { send as grpcSend } from "@onflow/transport-grpc"

const USE_LOCAL = false

// prettier-ignore
fcl.config()
  .put("app.detail.title", "Test Harness")
  .put("app.detail.icon", "https://placekitten.com/g/200/200")
  .put("service.OpenID.scopes", "email")

if (USE_LOCAL) {
  // prettier-ignore
  fcl
    .config()
    .put("env", "local")
    .put("accessNode.api", "http://localhost:8080")
    .put("sdk.transport", grpcSend)
    .put("discovery.wallet", "http://localhost:8701/fcl/authn")
} else {
  // prettier-ignore
  fcl
    .config()
    .put("env", "testnet")
    // http
    .put("accessNode.api", "https://rest-testnet.onflow.org")
    .put("sdk.transport", httpSend)
    .put("discovery.authn.include", ["0x9d2e44203cb13051"])
    // grpc
    // .put("accessNode.api", "https://access-testnet.onflow.org")
    // .put("sdk.transport", grpcSend)
    .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
  // mainnet
  //.put("accessNode.api", "https://access-mainnet-beta.onflow.org")
  //.put("discovery.wallet", "https://fcl-discovery.onflow.org/authn")
}
