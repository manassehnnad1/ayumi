import React from "react";
import { MoveUpRight } from "lucide-react";
import {Link} from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";



const App: React.FC = () => {
  const navigate = useNavigate();
  const { ready, authenticated, login } = usePrivy();

const handleConnectWallet = async () => {
    if (!ready) return;
    
    if (authenticated) {

      navigate('/dashboard');
    } else {

      login();
    }
  };

  React.useEffect(() => {
    if (authenticated) {
      navigate('/dashboard');
    }
  }, [authenticated, navigate]);



  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-gray-50 to-gray-100 text-center px-4">
         <header className="pt-8 px-8 text-center mt-10 mb-12">
          <img src="/ayum.svg" alt="" className="h-5 w-5 ml-4"/>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          ayumi.
        </h1>
      </header>
      {/* Top Text */}
      <div className="mt-8 space-y-2 mb-4">
        <h1 className="text-4xl sm:text-5xl font-semibold text-gray-800">
          AI agent that manages your portfolio
        </h1>
        <h2 className="text-4xl mt-4 sm:text-5xl font-semibold text-gray-900">
          with fully <span className="bg-yellow-200 px-2">encrypted balances,</span> <br></br>onchain.
        </h2>
      </div>

           <button onClick={handleConnectWallet}
              disabled={!ready}
            className="inline-flex items-center gap-2 bg-black cursor-pointer mt-8 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-black transition-colors shadow-lg"
          >
           {authenticated ? 'Go to Dashboard' : 'Connect Wallet'}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        
    
      <div className="relative mt-12">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-[20rem] font-extrabold text-gray-200 opacity-30 select-none">
          
        </div>

        <div className="relative mx-auto bg-white shadow-[0_-6px_20px_rgba(0,0,0,0.1)] rounded-4xl w-[700px] border-t border-x border-gray-200
 overflow-hidden">
     

          <div className="p-6 text-left">
            <p className="text-gray-500 text-xl text-center mb-1">
              OCT 27, 2025
            </p>
            <p className="text-gray-900 text-2xl text-center">Good morning</p>
            <p className="text-4xl font-semibold text-center mb-6">John Doe</p>

            <h2 className="text-4xl font-bold text-center mb-6">$**,***.**</h2>

            <div className="flex justify-center gap-4 mb-8">
              <button className="bg-black text-white w-10 h-10 flex items-center justify-center rounded-full">
                ↑
              </button>
              <button className="bg-gray-200 text-gray-600 w-10 h-10 flex items-center justify-center rounded-full">
                ○
              </button>
              <button className="bg-gray-200 text-gray-600 w-10 h-10 flex items-center justify-center rounded-full">
                ↻
              </button>
            </div>

            {/* Transactions */}
            <div className="space-y-3">
              {[
                { name: "ZAMA", amount: "+13.30", color: "bg-green-100 text-green-700" },
                { name: "ETH", amount: "+9.43", color: "bg-green-100 text-green-700" },
                { name: "XRP", amount: "-13.30", color: "bg-red-100 text-red-700" },
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2"
                >
                  <span className="text-black text-2xl">{t.name}</span>
                  <span className={`text-xl px-2 py-1 rounded ${t.color}`}>
                    {t.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>


        <p className="mt-10 text-2xl italic font-semibold">Powered by  <img src="/zama.png" alt="" className="h-6 inline-block"/></p>

        {/* Bottom links */}
       
      </div>
       <div className="bg-black w-full mt-10 py-32">
        <div className="flex  mt-5   text-white gap-8  justify-center">
           <Link to='https://github.com/manassehnnad1/ayumi'><p className="text-2xl cursor-pointer hover:text-gray-200">GitHub <MoveUpRight className="inline-block h-4  mb-2 hover:text-gray-200" /></p></Link> 
            <Link to='https://medium.com/@islathebuilder'><p className="text-2xl cursor-pointer hover:text-gray-200">Docs<MoveUpRight className="inline-block mb-2 h-4" /></p></Link>
            <Link to='https://x.com/islathebuilder'><p className="text-2xl cursor-pointer hover:text-gray-200">X<MoveUpRight className="inline-block mb-2 h-4" /></p></Link>
            <Link to='https://'><p className="text-2xl cursor-pointer hover:text-gray-200">Demo<MoveUpRight className="inline-block mb-2 h-4" /></p></Link>
        </div>
        <p className="text-gray-200 mt-16 text-xl">Copyright © ayumi-zama 2025</p>
       </div>

    </div>
    
  );
};

export default App;
