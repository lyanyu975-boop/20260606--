let video;
let handpose;
let predictions = [];

let index = 0;
let hold = 0;
let state = "start"; // start, spinWait, play, select
let isAutoSpin = true; 

// 扇形展開動畫控制
let spreadProgress = 0; // 0 = 疊成一張, 1 = 完全展開成半圓

// 粒子與魔法陣角度
let stars = [];
let magicAngle = 0;

// 音效振盪器
let synth;
let soundEnabled = false; 

// 22張大阿爾克那完整牌組
const cards = [
  {name:"愚者", desc:"新的開始、冒險、自由、不拘一格。"},
  {name:"魔術師", desc:"創造力、行動力、熟練技術、新計畫的開始。"},
  {name:"女祭司", desc:"直覺、潛意識、智慧、靜心思考、隱秘。"},
  {name:"皇后", desc:"豐盛、孕育、愛與美、大自然、物質享受。"},
  {name:"皇帝", desc:"權力、控制、秩序、領導力、父親形象。"},
  {name:"教皇", desc:"傳統、精神指引、體制、援助、儀式感。"},
  {name:"戀人", desc:"選擇、和諧、伴侶關係、價值觀的契合。"},
  {name:"戰車", desc:"意志力、勝利、克服障礙、掌控混亂。"},
  {name:"力量", desc:"內在勇氣、 patience、溫柔掌控、克服恐懼。"},
  {name:"隱者", desc:"內省、尋求真理、獨處、嚮導、深思熟慮。"},
  {name:"命運之輪", desc:"轉折點、好運、命運、不可抗拒的改變。"},
  {name:"正義", desc:"公平、誠實、因果報應、理性決定、法律。"},
  {name:"倒吊人", desc:"換位思考、犧牲、等待、奉獻、全新視角。"},
  {name:"死神", desc:"結束、新生、徹底的改變、淘汰舊事物。"},
  {name:"節制", desc:"平衡、淨化、溝通、融合、細水長流。"},
  {name:"惡魔", desc:"慾望、束縛、物質誘惑、成癮、內心陰暗。"},
  {name:"高塔", desc:"突如其來的劇變、幻滅、打破限制、重生。"},
  {name:"星星", desc:"希望、寧靜、靈感、療癒、美好的未來。"},
  {name:"月亮", desc:"不安、迷茫、恐懼、幻覺、隱藏的秘密。"},
  {name:"太陽", desc:"成功、快樂、活力、自信、光明正大。"},
  {name:"審判", desc:"覺醒、復活、重大的決定、因果清算。"},
  {name:"世界", desc:"圓滿、達成目標、旅程結束、完美結局。"}
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
      size: random(1, 4),
      speed: random(0.5, 2)
    });
  }

  // 🎵 安全初始化合成器音效
  if (typeof p5.Oscillator !== 'undefined') {
    synth = new p5.Oscillator('sine');
    soundEnabled = true;
  }
}

function draw(){
  background(10, 10, 25); 

  // 1. 背景特效：星空與旋轉魔法陣
  drawStarfield();
  drawMagicCircle();

  // 2. 右上角相機
  image(video, width - 240, 20, 220, 160);

  // 3. 核心狀態機
  if (state === "start") {
    drawStartScreen();
  } else {
    handleHandGesture();

    if (state === "spinWait") {
      spreadProgress = lerp(spreadProgress, 0, 0.1); // 緊緊疊在一起
      drawTarotFan();
      drawSpinWaitScreen();
    } else if (state === "play") {
      spreadProgress = lerp(spreadProgress, 1, 0.08); // 優雅地張開成半圓
      drawTarotFan();
      drawPlayUI();
    } else if (state === "select") {
      drawSelectScreen(); // 彈出單張發光結果
    }
  }
}

// ==========================================
// 🌌 背景特效系統
// ==========================================
function drawStarfield() {
  noStroke();
  fill(255, 255, 255, 180);
  for(let star of stars) {
    ellipse(star.x, star.y, star.size);
    star.y += star.speed; 
    if(star.y > height) star.y = 0;
  }
}

function drawMagicCircle() {
  push();
  translate(width / 2, height / 2 + 100); // 往下一點作為半圓陣列的圓心
  magicAngle += 0.3; 
  rotate(magicAngle);
  
  noFill();
  stroke(100, 150, 255, 40); 
  strokeWeight(2);
  ellipse(0, 0, 500);
  ellipse(0, 0, 460);
  
  for(let i = 0; i < 12; i++) {
    rotate(30);
    line(0, -250, 0, 250);
  }
  pop();
}

// ==========================================
// ✋ 手勢核心邏輯
// ==========================================
function handleHandGesture() {
  if (predictions.length === 0) {
    if (state === "play" && isAutoSpin) {
      autoMode();
    }
    return;
  }

  let lm = predictions[0].landmarks;
  let fist = isFist(lm);

  if (state === "spinWait") {
    // ✊ 偵測由拳頭「張開」的瞬間觸發
    if (!fist) {
      playTarotSound(440, 0.1); 
      state = "play";
      isAutoSpin = true; 
    }
  } 
  else if (state === "play") {
    let x = lm[8][0]; 

    // 手掌左右移動切換
    if (frameCount % 6 === 0) { 
      if (x < 70) {
        index = (index - 1 + cards.length) % cards.length;
        isAutoSpin = false;
        playTarotSound(350, 0.03);
      } else if (x > 150) {
        index = (index + 1) % cards.length;
        isAutoSpin = false;
        playTarotSound(380, 0.03);
      }
    }

    // ✊ 握拳確認（大幅縮短時間至 45 幀，約 0.75 秒）
    if (fist) {
      hold++;
      if (hold > 45) { 
        state = "select";
        playTarotSound(600, 0.4); 
      }
    } else {
      hold = max(0, hold - 2); 
    }
  }
}

// ==========================================
// 🃏 核心：22張牌半圓展開與微微凸出效果
// ==========================================
function drawTarotFan() {
  push();
  // 以畫面中下方為扇形的旋轉圓心
  translate(width / 2, height / 2 + 250); 
  
  let totalCards = cards.length;
  // 設定展開的總夾角 (120度夾角分布)
  let startAngle = -60 * spreadProgress;
  let endAngle = 60 * spreadProgress;
  let angleStep = (totalCards > 1) ? (endAngle - startAngle) / (totalCards - 1) : 0;

  for (let i = 0; i < totalCards; i++) {
    push();
    // 計算每張卡牌依照比例該有的角度
    let currentAngle = startAngle + i * angleStep;
    rotate(currentAngle);
    
    // 預設基本半徑（從圓心推開的距離）
    let radius = -350; 
    
    // ⭐【關鍵效果】如果這張牌是目前選中的牌，往外凸出 30 像素，並發微光
    if (i === index && state === "play") {
      radius -= 30; 
      // 凸出牌的淡淡外框發光
      rectMode(CENTER);
      fill(255, 215, 0, 40);
      noStroke();
      rect(0, radius, 90, 150, 8);
    }

    // 繪製單張卡牌外觀
    rectMode(CENTER);
    fill(25, 25, 50);
    if (i === index && state === "play") {
      stroke(255, 215, 0); // 被選中的卡牌金邊
      strokeWeight(2);
    } else {
      stroke(255, 255, 255, 100);
      strokeWeight(1);
    }
    rect(0, radius, 80, 140, 8);
    
    // 卡背神祕花紋
    stroke(255, 215, 0, 40);
    rect(0, radius, 70, 130, 6);
    
    // 中間畫個「？」
    noStroke();
    if (i === index && state === "play") fill(255, 215, 0);
    else fill(150);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("?", 0, radius);
    
    pop();
  }
  pop();
}

// ==========================================
// 🖥️ 畫面繪製介面
// ==========================================

// 1. 開場說明書
function drawStartScreen() {
  rectMode(CENTER);
  fill(15, 15, 35, 230);
  stroke(138, 43, 226); 
  strokeWeight(3);
  rect(width / 2, height / 2, 520, 460, 20);

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  
  textSize(32);
  fill(255, 215, 0); 
  text("塔羅牌占卜", width / 2, height / 2 - 160);
  
  textSize(18);
  fill(200, 220, 255);
  text("「心中想著你的問題 抽選一張塔羅牌」", width / 2, height / 2 - 100);
  
  stroke(100, 150, 255, 60);
  line(width/2 - 220, height/2 - 60, width/2 + 220, height/2 - 60);
  noStroke();
  
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  let startX = width / 2 - 190;
  text("【手勢說明書】", startX, height / 2 - 30);
  textSize(14);
  fill(180);
  text("1. 進入後請伸出手掌，先「握拳再張開」來觸發轉盤。", startX, height / 2 + 5);
  text("2. 手掌「左右移動」可以手動自由切換牌卡。", startX, height / 2 + 35);
  text("3. 無手勢操作時，系統將會啟動「自動翻牌」。", startX, height / 2 + 65);
  text("4. 面對鏡頭「快速握拳」蓄力滿即可確認抽牌。", startX, height / 2 + 95);

  rectMode(CENTER);
  fill(138, 43, 226, 180);
  rect(width / 2, height / 2 + 170, 260, 45, 10);
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(16);
  text("滑鼠點擊畫面進入占卜", width / 2, height / 2 + 170);
}

// 2. 等待張開手掌提示
function drawSpinWaitScreen() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(22);
  fill(0, 255, 255);
  text("🔮 請面向鏡頭「先握拳再張開」展開大阿爾克那陣列", width / 2, height / 2 - 80);
}

// 3. 玩牌時的圓形進度條 UI
function drawPlayUI() {
  if (hold > 0) {
    push();
    translate(width / 2, height / 2 - 80);
    noFill();
    stroke(255, 255, 255, 40);
    strokeWeight(6);
    ellipse(0, 0, 60); 
    
    stroke(0, 191, 255); 
    let endAngle = map(hold, 0, 45, 0, 360); // 45幀快速確認
    arc(0, 0, 60, 60, -90, endAngle - 90);
    
    noStroke();
    fill(255);
    textSize(12);
    textAlign(CENTER, CENTER);
    text("鎖定中", 0, 0);
    pop();
  } else {
    fill(200, 220, 255);
    textAlign(CENTER, CENTER);
    textSize(16);
    if(isAutoSpin) {
      text("［自動巡航中］握拳鎖定當前凸出的卡牌", width / 2, height / 2 - 80);
    } else {
      text("［手動選牌中］左右移動切換 / 握拳快速確認", width / 2, height / 2 - 80);
    }
  }
}

// 4. 🎉 抽中牌結果：所有文字都在精緻的卡牌框內！
function drawSelectScreen() {
  push();
  rectMode(CENTER);
  
  // 牌身豪華多層發光特效
  let glow = sin(frameCount * 6) * 15 + 15;
  for(let i = 4; i > 0; i--) {
    fill(255, 215, 0, 8);
    stroke(255, 215, 0, 50 / i);
    strokeWeight(i * 5 + glow);
    rect(width / 2, height / 2 - 40, 260, 380, 15);
  }

  // 卡牌主框體
  fill(15, 15, 30);
  stroke(255, 215, 0);
  strokeWeight(3);
  rect(width / 2, height / 2 - 40, 260, 380, 15);

  // 內部裝飾細線框（確保文字都在此框內）
  stroke(255, 215, 0, 80);
  strokeWeight(1);
  rect(width / 2, height / 2 - 40, 230, 350, 10);

  // --- 以下所有文字皆在框內排版 ---
  noStroke();
  
  // 1. 塔羅牌中文名字
  fill(255, 215, 0);
  textAlign(CENTER, CENTER);
  textSize(28);
  text(cards[index].name, width / 2, height / 2 - 160);

  // 分隔小符號
  fill(255, 215, 0, 150);
  textSize(14);
  text("✦ 占卜啟示 ✦", width / 2, height / 2 - 110);

  // 2. 牌意中文解釋文字自動換行（嚴格限縮在框內寬度）
  fill(240);
  textSize(16);
  textAlign(CENTER, TOP);
  textWrap(WORD);
  // 在寬度 200 的範疇內自動換行，完美待在框內
  text(cards[index].desc, width / 2 - 100, height / 2 - 70, 200);
  pop();

  // 重新占卜按鈕（在卡牌框外下方）
  drawResetButton();
}

function drawResetButton() {
  push();
  rectMode(CENTER);
  let btnY = height - 80;
  
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
// ⚙️ 其他核心運作工具
// ==========================================
function autoMode(){
  if (frameCount % 45 === 0){ 
    index = (index + 1) % cards.length;
    playTarotSound(220, 0.02);
  }
}

function isFist(lm){
  return lm[8][1] > lm[6][1] && lm[12][1] > lm[10][1];
}

function playTarotSound(freq, duration) {
  if (!soundEnabled) return; 
  try {
    synth.start();
    synth.freq(freq);
    synth.amp(0.2, 0.05);
    setTimeout(() => {
      synth.amp(0, 0.1);
      setTimeout(() => synth.stop(), 100);
    }, duration * 1000);
  } catch(e) {}
}

function mousePressed() {
  if (state === "start") {
    playTarotSound(523.25, 0.15); 
    state = "spinWait";
  } 
  else if (state === "select") {
    let btnY = height - 80;
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && mouseY > btnY - 22 && mouseY < btnY + 22) {
      playTarotSound(440, 0.1);
      hold = 0;
      index = 0;
      spreadProgress = 0; 
      state = "spinWait"; 
    }
  }
}