/* index.js */
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// 'public' フォルダの中身（HTML, CSS, JS）を公開する設定
app.use(express.static('public'));

io.on('connection', (socket) => {
  // クライアントが接続した際のログ
  console.log('A user connected: ' + socket.id);

  // 1. ルームへの参加処理（PC側もスマホ側も 'game' ルームに入る）
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`Client ${socket.id} joined room: ${room}`);
  });

  // 2. センサーデータの転送
  // スマホから送られてきたデータを、同じルームにいる他のクライアント（PC）に送る
  socket.on('sensor', (data) => {
    // センサーデータを'game'ルームにいる自分以外の全員（PC画面）に送信する
    socket.to('game').emit('sensor', data);
  });

  // 3. チャットや接続確認用の汎用イベント（必要に応じて）
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  // 4. 切断時の処理
  socket.on('disconnect', () => {
    console.log('Client disconnected: ' + socket.id);
  });
});

// Renderなどのクラウド環境では、環境変数 PORT で指定された番号を使う必要があります
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});