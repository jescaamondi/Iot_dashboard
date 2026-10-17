# Cuttie Dolls IoT Dashboard

A real-time web dashboard for an IoT device over MQTT. It shows live temperature and humidity readings, shows whether the device is online, and switches two relays on and off from the browser.

<!-- Add a screenshot here: ![Dashboard](docs/screenshot.png) -->

## Features

- **Live sensor readings.** Temperature and humidity update as soon as the device publishes them.
- **Relay control.** Turn two relay channels on or off. The button shows the relay's real state, as reported back by the device.
- **Online status.** The dashboard dims and disables the controls when the device goes offline or the broker connection drops.
- **Automatic reconnect** to the broker every few seconds after a disconnect.

## How it works

The browser connects straight to an MQTT broker over WebSockets and subscribes to every topic under one root, `Princess/Fashion` by default.

| Topic | Direction | Payload |
| --- | --- | --- |
| `<root>/temperature` | device → dashboard | a number, for example `24.5` |
| `<root>/humidity` | device → dashboard | a number, for example `61` |
| `<root>/relay1/state`, `<root>/relay2/state` | device → dashboard | `ON` or `OFF` |
| `<root>/status` | device → dashboard | `online` or `offline` |
| `<root>/control/relay1`, `<root>/control/relay2` | dashboard → device | `ON` or `OFF` |

The dashboard only *requests* a change on the `control` topics. It updates the button when the device confirms the new state on the `state` topic, so the screen always matches the hardware.

## Run it locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill in `.env.local` with your broker details, then open http://localhost:3000.

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_MQTT_URL` | The broker's WebSocket URL, starting with `wss://` or `ws://` |
| `NEXT_PUBLIC_MQTT_USER` | Broker username |
| `NEXT_PUBLIC_MQTT_PASS` | Broker password |
| `NEXT_PUBLIC_MQTT_TOPIC_ROOT` | Topic prefix, `Princess/Fashion` by default |

## Security note

Because the browser connects to the broker directly, the MQTT username and password are included in the page and anyone using the dashboard can see them. Give the dashboard its own broker user, and use the broker's access control list (ACL) so that user can only read the sensor and status topics and write to the `control` topics.

## Tools

Next.js · React · Tailwind CSS · MQTT.js
