let video;
let handpose;
let predictions = [];

let index = 0;
let hold = 0;
let state = "start"; // 狀態：start(開場), spinWait(等張開), play(左右選/自動), select(選中)
let isAutoSpin = true; // 是否處於自動轉牌狀態

// 粒子與魔法陣角度
let stars = [];
let magicAngle = 0;

// 音效振盪器 (免外部音效檔)
let synth;

// 22張大阿爾克那完整牌組
const cards = [
  {name:"愚者", desc:"新的開始、冒險、自由、不拘一格"},
  {name:"魔術師", desc:"創造力、行動力、熟練技術、新計畫的開始"},
  {name:"女祭司", desc:"直覺、潛意識、智慧、靜心思考、隱秘"},
  {name:"皇后", desc:"豐盛、孕育、愛與美、大自然、物質享受"},
  {name:"皇帝", desc:"權力、控制、秩序、領導力、父親形象、穩定"},
  {name:"教皇", desc:"傳統、精神指引、體制、援助、儀式感、學習"},
  {name:"戀人", desc:"選擇、和諧、伴侶關係、價值觀的契合"},
  {name:"戰車", desc:"意志力、勝利、克服障礙、衝勁、掌控混亂"},
  {name:"力量", desc:"內在勇氣、耐心、溫柔的掌控、克服恐懼"},
  {name:"隱者", desc:"內省、尋求真理、獨處、嚮導、深思熟慮"},
  {name:"命運之輪", desc:"轉折點、好運、命運、不可抗拒的改變"},
  {name:"正義", desc:"公平、誠實、因果報應、理性決定、法律事務"},
  {name:"倒吊人", desc:"換位思考、犧牲、等待、奉獻、換個角度看世界"},
  {name:"死神", desc:"結束、新生、徹底的改變、淘汰舊事物"},
  {name:"節制", desc:"平衡、淨化、溝通、融合、細水長流"},
  {name:"惡魔", desc:"慾望、束縛、物質誘惑、成癮、內心的陰暗面"},
  {name:"高塔", desc:"突如其來的劇變、幻滅、打破限制、重新開始"},
  {name:"星星", desc:"希望、寧靜、靈感、療癒、美好的未來"},
  {name:"月亮", desc:"不安、迷茫、恐懼、幻覺、隱藏的秘密"},
  {name:"太陽", desc:"成功、快樂、活力、自信、光明正大"},
  {name:"審判", desc:"覺醒、復活、重大的決定、因果清算"},
  {name:"世界", desc:"圓滿、達成目標、旅程結束、完美結局"}
];

function setup(){
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  // 📷 攝影機初始化
  video = createCapture(VIDEO);
  video.size(220, 160);
  video.hide();

  // 🤖 ml5 handpose
  handpose = ml5.handpose(video, () => {
    console.log("AI Model Ready");
  });
  handpose.on("predict", results => {
    predictions = results;
  });

  // ✨ 初始化星空粒子
  for(let i = 0; i < 100; i++){
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      speed: random(0.2, 1)
    });
  }

  // 🎵 初始化合成器音效
  synth = new p5.Oscillator('sine');
}

function draw(){
  background(10, 10, 25); // 暗藍夜空底色

  // 1. 繪製背景：星空與旋轉魔法陣
  drawStarfield();
  drawMagicCircle();

  // 2. 顯示相機鏡頭（右上角）
  image(video, width - 240, 20, 220, 160);

  // 3. 核心狀態機
  if (state === "start") {
    drawStartScreen();
  } else {
    // 進入占卜流程後，處理手勢核心邏輯
    handleHandGesture();

    if (state === "spinWait") {
      drawSpinWaitScreen();
    } else if (state === "play") {
      drawPlayScreen();
    } else if (state === "select") {
      drawSelectScreen();
    }
  }
}

// ==========================================
// 🌌 背景特效系統
// ==========================================
function drawStarfield() {
  noStroke();
  fill(255, 255, 255, 150);
  for(let star of stars) {
    ellipse(star.x, star.y, star.size);
    star.y += star.speed;
    if(star.y > height) star.y = 0;
  }
}

function drawMagicCircle() {
  push();
  translate(width / 2, height / 2);
  magicAngle += 0.3; // 緩慢旋轉
  rotate(magicAngle);
  
  noFill();
  stroke(100, 150, 255, 40); // 淡藍色線條
  strokeWeight(2);
  
  ellipse(0, 0, 450);
  ellipse(0, 0, 400);
  
  // 繪製十二角星幾何形狀
  for(let i = 0; i < 12; i++) {
    rotate(30);
    line(0, -225, 0, 225);
  }
  pop()
}

// ==========================================
// ✋ 手勢核心邏輯處理
// ==========================================
function handleHandGesture() {
  if (predictions.length === 0) {
    // 沒偵測到手時，如果在 play 狀態就自動輪播
    if (state === "play" && isAutoSpin) {
      autoMode();
    }
    return;
  }

  let lm = predictions[0].landmarks;
  let fist = isFist(lm);

  if (state === "spinWait") {
    // ✊ 偵測到手先握拳，再「張開」時觸發轉盤
    if (!fist) {
      playT tarotSound(440, 0.1); // 觸發音效
      state = "play";
      isAutoSpin = true; 
    }
  } 
  else if (state === "play") {
    let x = lm[8][0]; // 食指 X 座標

    // 手掌左右移動切換卡牌（關閉自動輪播）
    if (frameCount % 8 === 0) {
      if (x < 70) {
        index = (index - 1 + cards.length) % cards.length;
        isAutoSpin = false;
        playTarotSound(300, 0.05);
      } else if (x > 150) {
        index = (index + 1) % cards.length;
        isAutoSpin = false;
        playTarotSound(350, 0.05);
      }
    }

    // ✊ 握拳 3 秒確認 (約 180 幀，每秒 60 幀)
    if (fist) {
      hold++;
      if (hold > 180) { 
        state = "select";
        playTarotSound(600, 0.5); // 成功音效
      }
    } else {
      hold = max(0, hold - 2); // 沒握拳時慢慢消退
    }
  }
}

// ==========================================
// 🖥️ 各畫面繪製
// ==========================================

// 1. 開場畫面
function drawStartScreen() {
  // 說明書外框
  rectMode(CENTER);
  fill(15, 15, 35, 220);
  stroke(138, 43, 226); // 神秘紫邊框
  strokeWeight(3);
  rect(width / 2, height / 2, 500, 450, 20);

  // 文字內容
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  
  textSize(28);
  fill(255, 215, 0); // 金色
  text("✨ 核心神祕學塔羅占卜 ✨", width / 2, height / 2 - 160);
  
  textSize(18);
  fill(200, 220, 255);
  text("「心中想著你的問題 抽選一張塔羅牌」", width / 2, height / 2 - 100);
  
  // 說明書應用細則
  stroke(100, 150, 255, 50);
  line(width/2 - 200, height/2 - 60, width/2 + 200, height/2 - 60);
  noStroke();
  
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  let startX = width / 2 - 160;
  text("【手勢說明書】", startX, height / 2 - 30);
  textSize(14);
  fill(180);
  text("1. 進入後請伸出手掌，先「握拳再張開」來觸發轉盤。", startX, height / 2 + 5);
  text("2. 手掌「左右移動」可以手動自由切換牌卡。", startX, height / 2 + 35);
  text("3. 無手勢操作時，系統將會啟動「自動翻牌」。", startX, height / 2 + 65);
  text("4. 面對鏡頭「維持握拳 3 秒鐘」即可確認抽牌。", startX, height / 2 + 95);

  // 點擊提示按鈕
  rectMode(CENTER);
  fill(138, 43, 226, 150);
  rect(width / 2, height / 2 + 160, 250, 45, 10);
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(16);
  text("滑鼠點擊畫面進入占卜", width / 2, height / 2 + 160);
}

// 2. 等待張開手掌觸發畫面
function drawSpinWaitScreen() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(22);
  text("🔮 請面向鏡頭「先握拳再張開」以啟動命運轉盤", width / 2, height / 2);
}

// 3. 抽牌/選牌中畫面
function drawPlayScreen() {
  // 繪製當前卡牌
  push();
  rectMode(CENTER);
  fill(25, 25, 50);
  stroke(255, 255, 255, 150);
  strokeWeight(2);
  rect(width / 2, height / 2, 200, 300, 15);
  
  // 卡背裝飾
  stroke(255, 215, 0, 80);
  rect(width / 2, height / 2, 180, 280, 10);

  noStroke();
  fill(255, 215, 0);
  textAlign(CENTER, CENTER);
  textSize(36);
  text("？", width / 2, height / 2);
  pop();

  // ⭕ 圓形進度條 (握拳 3 秒確認)
  if (hold > 0) {
    push();
    translate(width / 2, height / 2 + 200);
    noFill();
    stroke(255, 255, 255, 50);
    strokeWeight(6);
    ellipse(0, 0, 60); // 底圈
    
    stroke(0, 255, 255); // 青色進度
    let endAngle = map(hold, 0, 180, 0, 360);
    arc(0, 0, 60, 60, -90, endAngle - 90);
    
    noStroke();
    fill(255);
    textSize(12);
    textAlign(CENTER, CENTER);
    text("蓄力中", 0, 0);
    pop();
  } else {
    fill(200, 220, 255);
    textAlign(CENTER, CENTER);
    textSize(16);
    if(isAutoSpin) {
      text("［自動翻牌中］ 握拳3秒即可鎖定此牌", width / 2, height / 2 + 180);
    } else {
      text("［手動選牌中］ 左右移動切換 / 握拳3秒確認", width / 2, height / 2 + 180);
    }
  }
}

// 4. 選中牌發光結果畫面
function drawSelectScreen() {
  push();
  rectMode(CENTER);
  
  // ✨ 牌身發光特效 (多層陰影外框)
  let glow = sin(frameCount * 5) * 15 + 15;
  for(let i = 5; i > 0; i--) {
    fill(255, 215, 0, 10);
    stroke(255, 215, 0, 50 / i);
    strokeWeight(i * 4 + glow);
    rect(width / 2, height / 2 - 30, 220, 320, 15);
  }

  // 正式卡牌本體
  fill(20, 20, 40);
  stroke(255, 215, 0);
  strokeWeight(3);
  rect(width / 2, height / 2 - 30, 220, 320, 15);

  // 顯示牌名與解釋 (全中文)
  noStroke();
  fill(255, 215, 0);
  textAlign(CENTER, CENTER);
  textSize(28);
  text(cards[index].name, width / 2, height / 2 - 120);

  // 牌義文字自動換行排版
  fill(240);
  textSize(16);
  textWrap(WORD);
  text(cards[index].desc, width / 2 - 90, height / 2 - 60, 180);
  pop();

  // 重新占卜按鈕
  drawResetButton();
}

// 🔄 重新占卜按鈕
function drawResetButton() {
  push();
  rectMode(CENTER);
  let btnY = height - 80;
  
  // 檢查滑鼠是否懸停在按鈕上
  if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && mouseY > btnY - 22 && mouseY < btnY + 22) {
    fill(138, 43, 226);
    cursor(HAND);
  } else {
    fill(75, 0, 130);
    cursor(ARROW);
  }
  
  stroke(255);
  strokeWeight(1);
  rect(width / 2, btnY, 200, 44, 8);
  
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(16);
  text("重新占卜", width / 2, btnY);
  pop();
}

// ==========================================
// ⚙️ 工具函式 (自動模式、手勢判斷、音效)
// ==========================================

function autoMode(){
  if (frameCount % 45 === 0){ // 每 0.75 秒自動切換下一張
    index = (index + 1) % cards.length;
    playTarotSound(200, 0.02);
  }
}

function isFist(lm){
  // 判斷食指與中指指尖是否低於指節
  return lm[8][1] > lm[6][1] && lm[12][1] > lm[10][1];
}

// 🎵 網頁音效產生器
function playTarotSound(freq, duration) {
  try {
    synth.start();
    synth.freq(freq);
    synth.amp(0.3, 0.05);
    setTimeout(() => {
      synth.amp(0, 0.1);
      setTimeout(() => synth.stop(), 100);
    }, duration * 1000);
  } catch(e) {
    console.log("Audio contextual alert");
  }
}

// ==========================================
// 🖱️ 點擊事件監聽
// ==========================================
function mousePressed() {
  // 開場點擊進入
  if (state === "start") {
    playTarotSound(523.25, 0.15); // 播放一個中央 C 魔法音
    state = "spinWait";
  } 
  // 結束畫面點擊重新占卜
  else if (state === "select") {
    let btnY = height - 80;
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && mouseY > btnY - 22 && mouseY < btnY + 22) {
      playTarotSound(440, 0.1);
      hold = 0;
      index = 0;
      state = "spinWait"; // 返回等待手勢啟動狀態
    }
  }
}