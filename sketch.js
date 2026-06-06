let video;
let handpose;
let predictions = [];

let index = 0;
let hold = 0;
let state = "play"; // "play" = 輪播/選牌中, "select" = 已確認選中卡牌

const cards = [
  {name:"愚者", desc:"新的開始與自由"},
  {name:"魔術師", desc:"創造與行動力"},
  {name:"女祭司", desc:"直覺與智慧"},
  {name:"皇后", desc:"愛與豐盛"},
  {name:"皇帝", desc:"秩序與權力"},
  {name:"戀人", desc:"選擇與關係"},
  {name:"戰車", desc:"意志與勝利"},
  {name:"力量", desc:"勇氣與內在力量"},
  {name:"隱者", desc:"內省與思考"},
  {name:"命運之輪", desc:"轉變與機會"}
];

function setup(){
  createCanvas(windowWidth, windowHeight);

  // 📷 camera
  video = createCapture(VIDEO);
  video.size(220, 160);
  video.hide();

  // 🤖 ml5 handpose
  handpose = ml5.handpose(video, () => {
    console.log("model ready");
  });

  handpose.on("predict", results => {
    predictions = results;
  });
}

function draw(){
  background(0);

  // 📷 顯示攝影機畫面（右上角）
  image(video, width - 240, 20, 220, 160);

  // ==========================================
  // 核心狀態切換：遊玩中 (play) vs 選定卡牌 (select)
  // ==========================================
  if (state === "play") {
    
    // 檢查是否有偵測到手
    if (predictions.length === 0) {
      // 👐 沒手 → 進入自動輪播模式
      autoMode();
      
      fill(255);
      textAlign(CENTER);
      textSize(16);
      text("請將手放入鏡頭（或等待模型載入中...）", width / 2, height - 50);
    } else {
      // 🖐️ 有手 → 啟用手勢控制
      let lm = predictions[0].landmarks;
      let x = lm[8][0]; // 食指指尖 X 座標 (0 ~ 220 之間)

      // 👉 修正後的左右選牌座標（因為鏡頭寬度只有 220）
      if (frameCount % 10 === 0) { // 加個計時器避免切換過快
        if (x < 70) {
          index = (index - 1 + cards.length) % cards.length;
        } else if (x > 150) {
          index = (index + 1) % cards.length;
        }
      }

      // ✊ 握拳確認選牌
      if (isFist(lm)) {
        hold++;
        // 畫出蓄力條/進度條
        fill(255, 0, 0);
        rect(width / 2 - 80, height / 2 + 140, hold * 4, 10); 
        
        if (hold > 40) {
          state = "select"; // 觸發選定狀態
        }
      } else {
        hold = 0;
      }

      fill(0, 255, 0);
      textAlign(CENTER);
      textSize(16);
      text("偵測到手勢：左右移動選牌，握拳維持住選定", width / 2, height - 50);
    }

    // 永遠繪製當前卡牌
    drawCard();

  } else if (state === "select") {
    // 🎉 秀出最終抽卡結果的畫面
    drawSelectedCard();
  }
}

// =====================
// 🃏 繪製一般卡牌（翻滾/選牌中）
// =====================
function drawCard(){
  push();
  rectMode(CENTER);
  fill(20);
  stroke(255);
  strokeWeight(2);
  rect(width / 2, height / 2, 200, 300, 15); // 微調稍微大一點比較好看

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);

  textSize(26);
  text(cards[index].name, width / 2, height / 2 - 30);

  textSize(16);
  fill(180);
  text(cards[index].desc, width / 2, height / 2 + 30);
  pop();
}

// =====================
// 🎉 繪製選定卡牌畫面
// =====================
function drawSelectedCard() {
  push();
  rectMode(CENTER);
  // 選中時卡牌發金光
  fill(40, 30, 10);
  stroke(255, 215, 0); 
  strokeWeight(5);
  rect(width / 2, height / 2, 220, 320, 15);

  noStroke();
  fill(255, 215, 0); // 金黃色字體
  textAlign(CENTER, CENTER);
  textSize(32);
  text("✨ " + cards[index].name + " ✨", width / 2, height / 2 - 40);

  textSize(18);
  fill(255);
  text(cards[index].desc, width / 2, height / 2 + 30);
  
  // 重新開始提示
  textSize(14);
  fill(150);
  text("張開手掌或重新整理網頁以再次抽牌", width / 2, height - 50);
  
  // 偵測如果手掌重新張開，就回到遊玩狀態
  if (predictions.length > 0) {
    let lm = predictions[0].landmarks;
    if (!isFist(lm)) {
      hold = 0;
      state = "play";
    }
  }
  pop();
}

// =====================
// 🤖 沒手自動動
// =====================
function autoMode(){
  if (frameCount % 60 === 0){ // 每秒換一張牌
    index = (index + 1) % cards.length;
  }
}

// =====================
// 🖐️ 手勢（ml5簡化穩定版）
// =====================
function isFist(lm){
  // 比較指尖與指節的 Y 座標，指尖低於指節代表手指彎曲（握拳）
  return lm[8][1] > lm[6][1] && lm[12][1] > lm[10][1];
}