import abi from '../utils/BuyMeCoffee.json';
import { ethers } from "ethers";
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css'
import img from "../public/buymecoffee.png";
export default function Home(){
  //contract address and Abi
  const contractAddress="0x2f434ce25611BdF68eA7780ca6F690A65b4A9c6c";
  const contractABI=abi.abi;

  //states
  const [currentAccount,setCurrentAccount]=useState("");
  const [name,setName]=useState("");
  const [message,setMessage]=useState("");
  const [memos,setMemos]=useState([]);

  const onNameChange=(event)=>{
    setName(event.target.value);
  }

  const onMessageChange=(event)=>{
    setMessage(event.target.value);
  }

  //wallet connection 
  const isWalletConnected=async()=>{
    try{
      const {ethereum}=window;
      const accounts= await ethereum.request({method:'eth_accounts'});
      console.log("accounts:",accounts);

      if(accounts.length>0){
        const account=accounts[0];
        console.log("wallet is connected!"+account);
      }else{
        console.log("make sure metamask is connected!")
      }
    }catch(err){
      console.log("error :",err);
    }
  }


  const connectWallet=async()=>{
    try{
      const {ethereum}=window;
      if(!ethereum){
        console.log("Please install a metamask account");
      }
      const accounts=await ethereum.request({
        method:'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    }catch(err){
      console.log("error: ",err);
    }
  }

  const buyCoffee=async()=>{
    try{
      const {ethereum}=window;
      if (ethereum){
        const provider= new ethers.providers.Web3Provider(ethereum,"any");
        const signer=provider.getSigner();
        const buyMeACoffee=new ethers.Contract(contractAddress,contractABI,signer);
        console.log("buying coffee ...");
        const coffeeTxn=await buyMeACoffee.buyCoffee(name ? name:anonymous,message?message:"Enjoy your coffee",{value:ethers.utils.parseEther("0.001")});

        await coffeeTxn.wait();

        console.log("mined :",coffeeTxn.hash);
        console.log("coffee has been purchased!");


        // clearing the form fields
        setName("");
        setMessage("");
      }
    }catch(err){
      console.log("error:",err)
    }
  };

  //function to fetch all the memos stored on-chain
  const getMemos=async()=>{

    try{
      const {ethereum}=window;
      if(ethereum){
        const provider= new ethers.providers.Web3Provider(ethereum);
        const signer=provider.getSigner();
        const buyMeACoffee=new ethers.Contract(contractAddress,contractABI,signer);

        console.log("fetching memos from the blockchain..");
        const memos =await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      }else{
        console.log("Metamask is not connected");
      }
    }catch(err){
      console.log(err);
    }
  }

  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const {ethereum} = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      buyMeACoffee.on("newMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("newMemo", onNewMemo);
      }
    }
  }, []);

  return(
    <div className={styles.container}>
    <Head>
    <title>Buy Sakshi A Coffee ☕</title>
    <meta name="description" content="Tipping site"/>
    <link rel="icon" href="/favicon.ico"/>
    </Head>

    <main className={styles.main}>
    <div className={styles.img}><Image className={styles.img} src={img} /></div>

    {currentAccount ? (
      <div className={styles.flexContainer}>
      <form className={styles.card}>
      <div >
      <label className={styles.description}><h2>Name</h2></label>

      <input  className={styles.input} id="name" type="text" placeholder='Your Name' onChange={onNameChange}/>
      </div> 

      <div>
      <label className={styles.description}>
      <h2>Send Sakshi A Message📝</h2>
      </label>

      <textarea className={styles.input} rows={3} placeholder="Enjoy your coffee!" id="message" onChange={onMessageChange}></textarea>
      </div>
      <div>
      <button className={styles.btn} type="button" onClick={buyCoffee}>Send 1 Coffee for 0.001ETH</button>
      </div>
      </form>
      </div>
    ):(
      <button  className={styles.btn1} onClick={connectWallet}>Connect your wallet</button>
    )}
    </main>

    {currentAccount && (<h1>Memos received</h1>)}

      {currentAccount && (memos.map((memo, idx) => {
        return (
          <div key={idx} style={{border:"2px solid", "width":"30%" ,"borderRadius":"5px", padding: "5px", margin: "5px"}}>
            <p style={{"fontWeight":"bold"}}>"{memo.message}"</p>
            <p>From: {memo.name} at {memo.timestamp.toString()}</p>
          </div>
        )
      }))}

      <footer className={styles.footer}>
        <a
          
          target="_blank"
          rel="noopener noreferrer"
        >
          Created by Sak_sheesh💛!
        </a>
      </footer>
    </div>
  );
}