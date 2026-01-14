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

async function fetchAIResult() {
    document.getElementById("action-area").style.display = "none";
    document.getElementById("result-area").style.display = "block";
    
    // AIへのプロンプト設定
    const prompt = "あなたはエレガントな占い師です。以下の3点を上品な言葉で教えて。①ラッキーカラー、②簡単なラッキーアクション、③ポジティブな言葉。";
    
    try {
        const res = await fetch("https://授業指定のAPIパス", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: prompt })
        });
        const data = await res.json();
        
        // 改行などを整えて表示
        const formattedText = data.response.replace(/\n/g, '<br>');
        document.getElementById("ai-response").innerHTML = `<p style="text-align:left; display:inline-block;">${formattedText}</p>`;
    } catch (e) {
        document.getElementById("ai-response").innerText = "通信エラー：運勢を読み取れませんでした。";
    }
}