import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import keyPairJson from "../keypair.json";

const { secretKey } = decodeSuiPrivateKey(keyPairJson.privateKey);
const keypair = Ed25519Keypair.fromSecretKey(secretKey);
const suiAddress = keypair.getPublicKey().toSuiAddress();

const PACKAGE_ID = `0x9603a31f4b3f32843b819b8ed85a5dd3929bf1919c6693465ad7468f9788ef39`;
const VAULT_ID = `0x8d85d37761d2a4e391c1b547c033eb0e22eb5b825820cbcc0c386b8ecb22be33`;

const rpcUrl = getFullnodeUrl("testnet");
const suiClient = new SuiClient({ url: rpcUrl });

const main = async () => {
  const tx = new Transaction();

  const key = tx.moveCall({
    target: `${PACKAGE_ID}::key::new`,
  });

  tx.moveCall({
    target: `${PACKAGE_ID}::key::set_code`,
    arguments: [key, tx.pure.u64(745223)],
  });

  const coin = tx.moveCall({
    target: `${PACKAGE_ID}::vault::withdraw`,
    typeArguments: ["0x2::sui::SUI"],
    arguments: [tx.object(VAULT_ID), key],
  });

  tx.transferObjects([coin], suiAddress);

  const result = await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
    options: {
      showEffects: true,
      showEvents: true,
      showObjectChanges: true,
    },
  });

  console.log("Transaction Result:", result);
};

main().catch((err) => {
  console.error("Transaction failed:", err);
});
