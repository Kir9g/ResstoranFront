import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const socket = new SockJS('http://localhost:8080/ws');
const client = new Client({
  webSocketFactory: () => socket,
  onConnect: () => {
    client.subscribe('/topic/waiter-alerts', (message) => {
      alert('Заказ ' + message.body);
    });
  },
});

client.activate();
