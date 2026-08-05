
"use client";
import { useEffect, useState } from "react";
import client from "./lib/mqtt";

export default function Home() {
  const [data, setData] = useState({ relay1: false, relay2: false, temp: "--", hum: "--", online: false });

  const toggle = (key, value) => {
    client.publish(`Princess/Fashion/control/${key}`, value ? "OFF" : "ON", { qos: 1 });
  };

  useEffect(() => {
    const handleMsg = (topic, pay) => {
      const msg = pay.toString();
      setData(prev => {
        let upd = { ...prev, online: msg === "offline" ? false : true };
        if (topic.includes("relay1/state")) upd.relay1 = msg === "ON";
        if (topic.includes("relay2/state")) upd.relay2 = msg === "ON";
        if (topic.includes("temperature")) upd.temp = msg;
        if (topic.includes("humidity")) upd.hum = msg;
        if (topic.includes("status")) upd.online = msg === "online";
        return upd;
      });
    };

    client.on("message", handleMsg);
    client.on("connect", () => client.subscribe("Princess/Fashion/#"));
    client.on("close", () => setData(prev => ({ ...prev, online: false })));
    if (client.connected) client.subscribe("Princess/Fashion/#");

    return () => {
      client.off("message", handleMsg);
    };
  }, []);

  const Card = ({ title, val, color }) => (
    <div className="p-6 bg-zinc-950 border border-zinc-800/50 rounded-xl">
      <p className="text-xs font-semibold text-zinc-500 uppercase">{title}</p>
      <p className={`text-4xl font-mono font-bold mt-2 ${color}`}>{val}</p>
    </div>
  );

  const Relay = ({ id, label, state }) => (
    <div className="p-6 bg-zinc-950 border border-zinc-800/50 rounded-xl flex flex-col justify-between gap-4">
      <div className="flex justify-between">
        <div><h3 className="text-sm font-bold">{label}</h3><p className="text-xs text-zinc-500">System Channel</p></div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${state ? "bg-green-500/10 text-green-400" : "bg-zinc-800 text-zinc-400"}`}>{state ? "Active" : "Inactive"}</span>
      </div>
      <button disabled={!data.online} onClick={() => toggle(id, state)} className={`w-full py-2 rounded-lg font-semibold text-sm ${!data.online ? "bg-zinc-800 text-zinc-600" : state ? "bg-red-500/10 text-red-400 border border-red-500/30" : "bg-blue-600 text-white"}`}>{state ? "Turn Off" : "Turn On"}</button>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white p-6">
      <main className={`flex w-full max-w-3xl flex-col gap-6 p-8 bg-zinc-900 border border-zinc-800 rounded-2xl transition-opacity duration-300 ${!data.online ? "opacity-60" : "opacity-100"}`}>
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div><h1 className="text-2xl font-black tracking-wider">CUTTIE DOLLS</h1></div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${data.online ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-zinc-600"}`} />
            <span className={`text-xs font-bold uppercase ${data.online ? "text-green-400" : "text-zinc-500"}`}>{data.online ? "Online" : "Offline"}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card title="Temperature" val={`${data.temp}${data.temp !== "--" ? "°C" : ""}`} color="text-blue-400" />
          <Card title="Humidity" val={`${data.hum}${data.hum !== "--" ? "%" : ""}`} color="text-teal-400" />
          <Relay id="relay1" label="Relay Channel 1" state={data.relay1} />
          <Relay id="relay2" label="Relay Channel 2" state={data.relay2} />
        </div>
      </main>
    </div>
  );
}


// "use client"

// import { useEffect, useState } from "react";
// import  client  from "./lib/mqtt";

// export default function Home() {
//   const [messages, setMessages] = useState('');


//   useEffect(() => {
//     client.on("connect",()=>{
//       console.log("Connected")
//       client.subscribe("Princess/Fashion", (err)=>{
//         if (err){
//           console.log("failed to subscribe")
//         } else{
//           console.log("subscribe successfull")
//         }
        
//       });
//     });
//     client.on("message", (topic, payload) => {
//       setMessages(payload.toString());
//     });
  
// }, []); 


// return (
//     <div className="flex flex-col flex-1 items-center justify-center bg-black font-sans text-white">
//       <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-zinc-900 border border-zinc-800 rounded-xl sm:items-start">
//         <div className="text-2xl font-bold tracking-wider text-zinc-100">CUTTIE DOLLS
//         <p className="text-lg text-blue-400 font-mono mt-4">{messages}</p>
//         </div>
//       </main>
//     </div>
//   );
// }

