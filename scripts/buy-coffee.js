const {ethers}=require("hardhat");

//returns the ether balance of given address
async function getBalance(address){
    const balanceBigInt=await ethers.provider.getBalance(address);
    return ethers.utils.formatEther(balanceBigInt);
}

//logs the ether balances for a list of addresses
async function printBalances(addresses){
    let idx=0;
    for(const address of addresses){
        console.log(`Address ${idx} balance:`,await getBalance(address));
        idx++;
    }
}

//logs the memos stored on-chain from coffee purchases
async function printMemos(memos){
    for(const memo of memos){
        const timestamp=memo.timestamp;
        const tipper=memo.name;
        const tipperAddress=memo.from;
        const message=memo.message;
        console.log(`At ${timestamp},${tipper} (${tipperAddress}) said: "${message}"`);
    }
}

async function main(){
    //get the example accounts we will be working with
    const  [owner,tipper,tipper2,tipper3]=await ethers.getSigners();


    //deplyin the contract
    const buyMeACoffee=await ethers.getContractFactory("BuyMeCoffee");
    const buymecoffee=await buyMeACoffee.deploy();

    await buymecoffee.deployed();
    console.log("BuyMeACoffee deployed to :",buymecoffee.address);

    //check balances before the coffee purchases
    const addresses=[owner.address,tipper.address,buymecoffee.address];
    console.log("==start==");
    await printBalances(addresses);

    //buy the owner a few coffees
    const tip={value:ethers.utils.parseEther("1")};
    await buymecoffee.connect(tipper).buyCoffee("Sakshi","You are the best!",tip);
    await buymecoffee.connect(tipper2).buyCoffee("Aryan","Amazing!",tip);
    await buymecoffee.connect(tipper3).buyCoffee("Sriyaa","I love it",tip);

    //check the balance after the coffee purchases
    console.log("==bought coffee==");
    await printBalances(addresses);

    //withdraw
    await buymecoffee.connect(owner).withdrawTips();
    

    //check balances after the withdrawal
    console.log("==withdraw tips");
    await printBalances(addresses);

    //check out the memos
    console.log("==memos==");
    const memos=await buymecoffee.getMemos();
    printMemos(memos);



}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
