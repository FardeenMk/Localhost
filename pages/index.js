import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [years, setYears] = useState(0);
  const [inflationRate, setInflationRate] = useState(0);
  const [amount, setAmount] = useState(0);
  const [inflationResult, setInflationResult] = useState(null);
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [isPinValid, setIsPinValid] = useState(false);
  const [principal, setPrincipal] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [compoundFrequency, setCompoundFrequency] = useState(1);
  const [compoundInterestResult, setCompoundInterestResult] = useState(null);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }
  };

  const handleAccount = async () => {
    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        console.log("Account connected: ", accounts[0]);
        setAccount(accounts[0]);
        getATMContract();
      } else {
        console.log("No account found");
      }
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(balance.toNumber());
    }
  }

  const deposit = async () => {
    if (atm) {
      try {
        const tx = await atm.deposit(1);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Deposit failed:", error);
      }
    }
  }

  const withdraw = async () => {
    if (atm) {
      try {
        const tx = await atm.withdraw(1);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Withdrawal failed:", error);
      }
    }
  }

  const calculateInflation = () => {
    const inflatedAmount = amount * (1 + inflationRate / 100) ** years;
    setInflationResult(inflatedAmount);
  }

  const handlePinChange = (e) => {
    setPin(e.target.value);
  };

  const handleNewPinChange = (e) => {
    setNewPin(e.target.value);
  };

  const handleConfirmNewPinChange = (e) => {
    setConfirmNewPin(e.target.value);
  };

  const handlePinSubmit = () => {
    if (pin === "1234") {
      setIsPinValid(true);
    } else {
      alert("Invalid PIN. Please try again.");
    }
  };

  const handleChangePin = () => {
    if (newPin === confirmNewPin) {
      setPin(newPin);
      alert("PIN changed successfully!");
      setNewPin("");
      setConfirmNewPin("");
    } else {
      alert("New PIN and Confirm PIN do not match. Please try again.");
    }
  };

  const calculateCompoundInterest = () => {
    const n = compoundFrequency;
    const r = interestRate / 100;
    const t = years;
    const P = principal;
    const A = P * Math.pow(1 + r / n, n * t);
    const compoundInterest = A - P;
    setCompoundInterestResult(compoundInterest);
  }

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (!isPinValid) {
      return (
        <div>
          <p>Please enter your PIN:</p>
          <input type="password" value={pin} onChange={handlePinChange} />
          <button onClick={handlePinSubmit}>Submit</button>
        </div>
      );
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <input type="number" placeholder="Years" value={years} onChange={(e) => setYears(e.target.value)} />
        <input type="number" placeholder="Inflation Rate" value={inflationRate} onChange={(e) => setInflationRate(e.target.value)} />
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <button onClick={calculateInflation}>Calculate Inflation</button>
        {inflationResult !== null && <p>Inflated Amount: {inflationResult}</p>}
        <div>
          <p>Change PIN:</p>
          <input type="password" placeholder="New PIN" value={newPin} onChange={handleNewPinChange} />
          <input type="password" placeholder="Confirm New PIN" value={confirmNewPin} onChange={handleConfirmNewPinChange} />
          <button onClick={handleChangePin}>Change PIN</button>
        </div>
        <hr />
        <p>Compound Interest Calculator:</p>
        <input type="number" placeholder="Principal" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        <input type="number" placeholder="Interest Rate (%)" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
        <input type="number" placeholder="Years" value={years} onChange={(e) => setYears(e.target.value)} />
        <input type="number" placeholder="Compound Frequency" value={compoundFrequency} onChange={(e) => setCompoundFrequency(e.target.value)} />
        <button onClick={calculateCompoundInterest}>Calculate Compound Interest</button>
        {compoundInterestResult !== null && <p>Compound Interest: {compoundInterestResult}</p>}
      </div>
    )
  }

  useEffect(() => { getWallet(); }, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
    </main>
  )
}
