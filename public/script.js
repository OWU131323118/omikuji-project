const socket = io();
socket.emit('join', 'game');

let rotationSpeed = 0.01;
let isShaking = false;

/* public/script.js */
function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);

    // 【修正版】現在開いているページのURLを元に、スマホ用URLを自動で作る
    // index.html を開いていても、ルート(/)を開いていても動くように調整
    let baseUrl = window.location.href;
    
    // もしURLの最後が index.html なら削る
    if (baseUrl.endsWith("index.html")) {
        baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf("index.html"));
    }
    // 末尾のスラッシュを削除して整える
    if (baseUrl.endsWith("/")) {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1);
    }

    // smart.html をくっつける
    const smartUrl = baseUrl + "/smart.html";

    console.log("スマホ用URL:", smartUrl);

    // QRコード生成
    // もし既にQRコードがある場合は消してから再生成（重複防止）
    const qrDiv = document.getElementById("qrcode");
    qrDiv.innerHTML = ""; 
    
    new QRCode(qrDiv, {
        text: smartUrl,
        width: 160,
        height: 160,
        colorDark : "#546e7a",
        colorLight : "#ffffff"
    });
}

function draw() {
    background(224, 242, 241); // エレガントな水色
    ambientLight(150);
    pointLight(255, 255, 255, 0, -100, 200);

    rotateX(frameCount * rotationSpeed);
    rotateY(frameCount * rotationSpeed);

    specularMaterial(240);
    stroke(255);
    sphere(150, 6, 4); // クリスタル
}

// スマホから振動データを受信
socket.on('sensor', (data) => {
    if (data.type === 'shake') {
        if (!isShaking) {
            isShaking = true;
            document.getElementById("setup-area").style.display = "none";
            document.getElementById("action-area").style.display = "block";
        }
        
        // 振っている間だけ回転を速くする
        rotationSpeed = 0.4;
        
        // 振るのをやめてから2秒後にボタンを出すタイマーをリセット
        clearTimeout(window.shakeTimer);
        window.shakeTimer = setTimeout(() => {
            rotationSpeed = 0.02;
            document.getElementById("shake-message").innerText = "運勢が溜まりました";
            document.getElementById("open-btn").style.display = "inline-block";
        }, 2000);
    }
});

/* public/script.js の fetchAIResult 関数をこれに入れ替える */

async function fetchAIResult() {
    // 画面切り替え
    document.getElementById("action-area").style.display = "none";
    document.getElementById("result-area").style.display = "block";
    document.getElementById("ai-response").innerHTML = "星に問い合わせ中...";

    // ▼▼▼ ここに取得したAPIキーを貼り付けてください ▼▼▼
    const API_KEY = "AIzaSyDGIYRNCsn66uZHy3bCuc5302ZE5QM7XAU"; 
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    // Geminiへの命令
    const prompt = "あなたはエレガントな占い師です。以下の3点を上品な言葉で教えて。①ラッキーカラー、②簡単なラッキーアクション、③ポジティブな言葉。出力は装飾なしのプレーンテキストでお願いします。";

    // Gemini APIのURL
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        const data = await response.json();

        // Geminiからの回答を取り出す
        const resultText = data.candidates[0].content.parts[0].text;

        // 改行を <br> に変換して表示
        document.getElementById("ai-response").innerHTML = resultText.replace(/\n/g, '<br>');

    } catch (error) {
        console.error("Error:", error);
        document.getElementById("ai-response").innerText = "エラー：運勢の星が見つかりませんでした。\n(APIキーを確認してください)";
    }
}