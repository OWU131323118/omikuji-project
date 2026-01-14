const socket = io();

// サーバーの 'game' ルームに参加
socket.emit('join', 'game');

const btn = document.getElementById('start-btn');
const statusDiv = document.getElementById('status');

btn.onclick = () => {
    // iOSなどのための権限許可（これがないとセンサーが動きません）
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission().then(response => {
            if (response == 'granted') {
                startSensor();
            }
        });
    } else {
        startSensor();
    }
};

function startSensor() {
    btn.style.display = 'none';
    statusDiv.innerText = "スマホを振ってください！";

    window.addEventListener("devicemotion", (event) => {
        let acc = event.acceleration;
        if(!acc || !acc.x) return;

        // 振りの強さを計算 (三平方の定理)
        let speed = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);

        if (speed > 25) { // 25は「しっかり振った」くらいの強さ
            // サーバー経由でPCに通知を送る
            socket.emit('sensor', { type: 'shake' });
            
            // 画面を一瞬シルバーに光らせてフィードバック
            document.body.style.backgroundColor = "silver";
            statusDiv.innerText = "パワーを送りました！";
            setTimeout(() => { 
                document.body.style.backgroundColor = ""; 
            }, 100);
        }
    });
}