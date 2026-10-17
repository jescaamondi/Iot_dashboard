import mqtt from "mqtt";

export const TOPIC_ROOT = process.env.NEXT_PUBLIC_MQTT_TOPIC_ROOT || "Princess/Fashion";
export const MQTT_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_MQTT_URL);

export function createMqttClient() {
  const url = process.env.NEXT_PUBLIC_MQTT_URL;
  if (!url) return null;

  return mqtt.connect(url, {
    username: process.env.NEXT_PUBLIC_MQTT_USER,
    password: process.env.NEXT_PUBLIC_MQTT_PASS,
    reconnectPeriod: 3000,
  });
}
