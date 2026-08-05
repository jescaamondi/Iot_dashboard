
'use client';
import mqtt from "mqtt";

const client = mqtt.connect(process.env.MQTT_URL, {
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS
});

export default client;
