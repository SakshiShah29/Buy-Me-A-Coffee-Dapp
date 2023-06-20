const {ethers}= require("hardhat");
const abi= require("../artifacts/contracts/BuyMeCoffee.sol/BuyMeCoffee.json");

async function getBalance(provider,address){
    const balanceBigInt=await provider.getBalance(address);
    return ethers.utils.formatEther(balanceBigInt);
}

async function main(){
    // get the contract that has been deployed to goerli
    const contractAddress="0x2f434ce25611BdF68eA7780ca6F690A65b4A9c6c";
    const contractABI=abi.abi;

    ///get the node connection and wallet connection 

    const provider = new ethers.providers.AlchemyProvider("goerli",process.env.GOERLI_API_KEY);

    //ensuring that the signer is of the same address as of the original deployer of the contract
    const signer= new ethers.Wallet(process.env.PRIVATE_KEY,provider);

    //instantiate the connected contract
    const buyMeACoffee=new ethers.Contract(contractAddress,contractABI,signer);

    //checking the starting balances
    console.log("current balance of owner:",await getBalance(provider,signer.address),"ETH");
    const contractBalance=await getBalance(provider,buyMeACoffee.address);
    console.log("current balance of contract:",await getBalance(provider,buyMeACoffee.address),"ETH");

    //withdraw funds if ther are anny
    if(contractBalance!==0.0){
        console.log("withdrawing funds ...")
        const withdrawTxn=await buyMeACoffee.withdrawTips();
        await withdrawTxn.wait();
    }else{
        console.log("no funds to withdraw!");
    }
    //check the ending balance
    console.log("current balance of owner: ",await getBalance(provider,signer.address),"ETH");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

