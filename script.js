/* script.js */
let rotationSpeed = 0.01;
let isShaking = false;

function setup() {
    // 画面いっぱいに3Dキャンバスを作成
    createCanvas(windowWidth, windowHeight, WEBGL);

    // QRコードの生成（Render公開後にURLを修正）
    const qrcode = new QRCode(document.getElementById("qrcode"), {
        text: window.location.href.replace("index.html", "") + "smart.html",
        width: 128,
        height: 128,
        colorDark : "#546e7a",
        colorLight : "#ffffff",
    });
}

function draw() {
    // 背景色（水色っぽく）
    background(224, 242, 241);

    // ライティング（シルバーの質感を出すために重要）
    let locX = mouseX - width / 2;
    let locY = mouseY - height / 2;
    pointLight(255, 255, 255, locX, locY, 100); // マウスの位置からのライト
    ambientLight(150); // 全体を明るく

    // クリスタルの回転
    rotateX(frameCount * rotationSpeed);
    rotateY(frameCount * rotationSpeed);

    // シルバーの質感設定
    specularMaterial(240); // 反射
    shininess(20);
    stroke(255); // 白い輪郭線
    strokeWeight(0.5);

    // ジオメトリ（球体を粗く分割するとクリスタルっぽくなります）
    sphere(150, 6, 4); 
}

// ウィンドウサイズが変わった時の対応
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// スマホから「振った」通知が来た時に呼ぶ関数（後で通信機能と繋ぎます）
function startShake() {
    isShaking = true;
    rotationSpeed = 0.2; // 回転を速くする
    // 一定時間後にボタンを出す
    setTimeout(() => {
        document.getElementById("setup-area").style.display = "none";
        document.getElementById("open-btn").style.display = "block";
    }, 2000);
}