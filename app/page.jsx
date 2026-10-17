"use client";

import { useEffect, useRef, useState } from "react";
import { createMqttClient, MQTT_CONFIGURED, TOPIC_ROOT } from "./lib/mqtt";

const INITIAL_STATE = {
  relay1: false,
  relay2: false,
  temp: "--",
  hum: "--",
  online: false,
};

function Card({ title, val, color }) {
  return (
    <div className="p-6 bg-zinc-950 border border-zinc-800/50 rounded-xl">
      <p className="text-xs font-semibold text-zinc-500 uppercase">{title}</p>
      <p className={`text-4xl font-mono font-bold mt-2 ${color}`}>{val}</p>
    </div>
  );
}

function Relay({ id, label, state, online, onToggle }) {
  const buttonClass = !online
    ? "bg-zinc-800 text-zinc-600"
    : state
      ? "bg-red-500/10 text-red-400 border border-red-500/30"
      : "bg-blue-600 text-white";

  return (
    <div className="p-6 bg-zinc-950 border border-zinc-800/50 rounded-xl flex flex-col justify-between gap-4">
      <div className="flex justify-between">
        <div>
          <h3 className="text-sm font-bold">{label}</h3>
          <p className="text-xs text-zinc-500">System Channel</p>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${state ? "bg-green-500/10 text-green-400" : "bg-zinc-800 text-zinc-400"}`}
        >
          {state ? "Active" : "Inactive"}
        </span>
      </div>
      <button
        type="button"
        disabled={!online}
        onClick={() => onToggle(id, state)}
        className={`w-full py-2 rounded-lg font-semibold text-sm ${buttonClass}`}
      >
        {state ? "Turn Off" : "Turn On"}
      </button>
    </div>
  );
}

export default function Home() {
  const clientRef = useRef(null);
  const [data, setData] = useState(INITIAL_STATE);

  useEffect(() => {
    const client = createMqttClient();
    if (!client) return;
    clientRef.current = client;

    const handleMessage = (topic, payload) => {
      const msg = payload.toString();
      setData((prev) => {
        const next = { ...prev, online: msg !== "offline" };
        if (topic.endsWith("relay1/state")) next.relay1 = msg === "ON";
        if (topic.endsWith("relay2/state")) next.relay2 = msg === "ON";
        if (topic.endsWith("temperature")) next.temp = msg;
        if (topic.endsWith("humidity")) next.hum = msg;
        if (topic.endsWith("status")) next.online = msg === "online";
        return next;
      });
    };

    client.on("connect", () => client.subscribe(`${TOPIC_ROOT}/#`));
    client.on("message", handleMessage);
    client.on("close", () => setData((prev) => ({ ...prev, online: false })));

    return () => {
      client.end(true);
      clientRef.current = null;
    };
  }, []);

  const toggle = (key, state) => {
    clientRef.current?.publish(
      `${TOPIC_ROOT}/control/${key}`,
      state ? "OFF" : "ON",
      {
        qos: 1,
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white p-6">
      <main
        className={`flex w-full max-w-3xl flex-col gap-6 p-8 bg-zinc-900 border border-zinc-800 rounded-2xl transition-opacity duration-300 ${data.online ? "opacity-100" : "opacity-60"}`}
      >
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <h1 className="text-2xl font-black tracking-wider">CUTTIE DOLLS</h1>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${data.online ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-zinc-600"}`}
            />
            <span
              className={`text-xs font-bold uppercase ${data.online ? "text-green-400" : "text-zinc-500"}`}
            >
              {data.online ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        {!MQTT_CONFIGURED && (
          <p className="text-sm text-amber-400">
            MQTT is not configured. Set NEXT_PUBLIC_MQTT_URL in .env.local and
            restart the app.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card
            title="Temperature"
            val={data.temp === "--" ? "--" : `${data.temp}°C`}
            color="text-blue-400"
          />
          <Card
            title="Humidity"
            val={data.hum === "--" ? "--" : `${data.hum}%`}
            color="text-teal-400"
          />
          <Relay
            id="relay1"
            label="Relay Channel 1"
            state={data.relay1}
            online={data.online}
            onToggle={toggle}
          />
          <Relay
            id="relay2"
            label="Relay Channel 2"
            state={data.relay2}
            online={data.online}
            onToggle={toggle}
          />
        </div>
      </main>
    </div>
  );
}
