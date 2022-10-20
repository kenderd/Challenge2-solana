// Import Solana web3 functinalities
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmRawTransaction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
printWalletBalance = async (fromPublicKey, toPublicKey) => {
  const fromWalletBalance = await connection.getBalance(fromPublicKey);
  const toWalletBalance = await connection.getBalance(toPublicKey);
  console.log(
    `To Wallet balance: ${parseInt(fromWalletBalance) / LAMPORTS_PER_SOL} SOL`
  );
  console.log(
    `From Wallet balance: ${parseInt(toWalletBalance) / LAMPORTS_PER_SOL} SOL`
  );
};

const DEMO_FROM_SECRET_KEY = new Uint8Array([
  149, 249, 17, 97, 40, 27, 69, 182, 216, 60, 139, 4, 210, 224, 246, 119, 205,
  139, 146, 49, 109, 146, 195, 188, 177, 140, 162, 106, 215, 254, 239, 33, 20,
  180, 203, 254, 60, 90, 168, 114, 153, 183, 17, 153, 19, 22, 113, 11, 218, 102,
  75, 251, 173, 213, 15, 95, 83, 68, 231, 109, 118, 228, 193, 38,
]);

const transferSol = async () => {
  // Get Keypair from Secret Key
  var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

  // Other things to try:
  // 1) Form array from userSecretKey
  // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
  // 2) Make a new Keypair (starts with 0 SOL)
  // const from = Keypair.generate();

  // Generate another Keypair (account we'll be sending to)
  const to = Keypair.generate();
  printWalletBalance(from.publicKey, to.publicKey);

  // Aidrop 2 SOL to Sender wallet
  console.log("Airdopping some SOL to Sender wallet!");
  const fromAirDropSignature = await connection.requestAirdrop(
    new PublicKey(from.publicKey),
    2 * LAMPORTS_PER_SOL
  );

  // Latest blockhash (unique identifer of the block) of the cluster
  let latestBlockHash = await connection.getLatestBlockhash();

  // Confirm transaction using the last valid block height (refers to its time)
  // to check for transaction expiration
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: fromAirDropSignature,
  });

  console.log("Airdrop completed for the Sender account");

  printWalletBalance(from.publicKey, to.publicKey);
  // Send money from "from" wallet and into "to" wallet
  const fromWalletBalance = await connection.getBalance(from.publicKey);
  var transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: fromWalletBalance * 0.5,
    })
  );

  // Sign transaction
  var signature = await sendAndConfirmTransaction(connection, transaction, [
    from,
  ]);
  console.log("Signature is ", signature);
  printWalletBalance(from.publicKey, to.publicKey);
};

transferSol();
