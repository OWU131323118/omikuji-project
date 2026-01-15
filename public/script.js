/* public/script.js */

const socket = io();
socket.emit('join', 'game');

let rotationSpeed = 0.01;
let isShaking = false;

// ========== p5.js のセットアップ（変更なし） ==========
function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);

    let baseUrl = window.location.href;
    
    if (baseUrl.endsWith("index.html")) {
        baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf("index.html"));
    }
    if (baseUrl.endsWith("/")) {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1);
    }

    const smartUrl = baseUrl + "/smart.html";
    console.log("スマホ用URL:", smartUrl);

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

// ========== アニメーション描画（変更なし） ==========
function draw() {
    background(224, 242, 241); 
    ambientLight(150);
    pointLight(255, 255, 255, 0, -100, 200);

    rotateX(frameCount * rotationSpeed);
    rotateY(frameCount * rotationSpeed);

    specularMaterial(240);
    stroke(255);
    sphere(150, 6, 4); 
}

// ========== スマホセンサー連携（変更なし） ==========
socket.on('sensor', (data) => {
    if (data.type === 'shake') {
        if (!isShaking) {
            isShaking = true;
            document.getElementById("setup-area").style.display = "none";
            document.getElementById("action-area").style.display = "block";
        }
        
        rotationSpeed = 0.4;
        
        clearTimeout(window.shakeTimer);
        window.shakeTimer = setTimeout(() => {
            rotationSpeed = 0.02;
            document.getElementById("shake-message").innerText = "運勢が溜まりました";
            document.getElementById("open-btn").style.display = "inline-block";
        }, 2000);
    }
});

// ========== ★ここからAI関連の大幅アップデート★ ==========

async function fetchAIResult() {
    // 1. HTMLに追加した入力欄から「気分」を取得する
    const userMood = document.getElementById("user-input").value;
    
    // 入力がなければデフォルト値にする
    const userContext = userMood ? userMood : "特になし（なんとなく）";

    // 画面切り替え
    document.getElementById("action-area").style.display = "none";
    document.getElementById("result-area").style.display = "block";
    const responseDiv = document.getElementById("ai-response");
    
    // 待機メッセージを少しリッチに
    responseDiv.innerHTML = "🔮 星と交信中...<br>（あなたの悩みを聞いています...）";

    // ▼▼▼ APIキー（ご自身のものを設定してください） ▼▼▼
    const API_KEY = "ここにAPIキーを入れてください"; 
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    // 2. プロンプトにユーザーの気分を埋め込み、キャラクター性を強化
    const prompt = `
    あなたはエレガントで少しミステリアスな占い師です。
    ユーザーは今「${userContext}」という気分・悩みを抱えています。
    
    それを踏まえて、以下の3点を教えてください。
    ①ラッキーカラー（その悩みに効く色）
    ②ラッキーアクション（具体的で、少し笑えるもの）
    ③ポジティブな一言
    
    出力は装飾なしのプレーンテキストでお願いします。
    `;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("API Error:", data);
            throw new Error(data.error?.message || "API Error");
        }

        const resultText = data.candidates[0].content.parts[0].text;

        // 3. いきなり表示せず、タイプライター関数を呼び出す
        responseDiv.innerHTML = ""; // 一旦クリア
        typeWriterEffect(resultText, responseDiv);

    } catch (error) {
        console.error("Connection Error:", error);
        responseDiv.innerHTML = `<span style="color:red; font-size:0.8rem;">エラーが発生しました:<br>${error.message}</span>`;
    }
}

// ========== ★新機能: 文字を1文字ずつ表示する演出★ ==========
function typeWriterEffect(text, element) {
    let i = 0;
    const speed = 40; // 文字を表示するスピード（数字が小さいほど速い）

    function type() {
        if (i < text.length) {
            // 改行コード(\n)が来たら <br> タグを入れる
            if (text.charAt(i) === '\n') {
                element.innerHTML += '<br>';
            } else {
                element.innerHTML += text.charAt(i);
            }
            i++;
            setTimeout(type, speed); // 次の文字へ
        }
    }
    type(); // 実行開始
}