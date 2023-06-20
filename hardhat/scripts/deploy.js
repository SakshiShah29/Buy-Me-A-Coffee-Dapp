const {ethers} =require("hardhat")

async function main(){
    const BuyMeCoffee=await ethers.getContractFactory("BuyMeCoffee");
    const buymecoffee=await BuyMeCoffee.deploy();

    await buymecoffee.deployed();
    console.log("Buy Me A Coffee address :",buymecoffee.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });