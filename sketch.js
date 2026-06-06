let video;
let handpose;
let predictions = [];

let index = 0;
let hold = 0;
let state = "start"; // start, spinWait, play, select
let isAutoSpin = true; 

// 粒子與魔法陣角度
let stars = [];
let magicAngle = 0;

// 音效振盪器
let synth;
let soundEnabled = false; // 音效安全鎖

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
      size: random(1, 4),
      speed: random(0.5, 2)
    });
  }

  // 🎵 安全初始化合成器音效（防止因缺少庫而崩潰）
  if (typeof p5.Oscillator !== 'undefined') {
    synth = new p5.Oscillator('sine');
    soundEnabled = true;
    console.log("音效系統載入成功！");
  } else {
    console.warn("未偵測到 p5.sound 庫，將以無聲模式執行，不影響畫面。");
  }
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
  fill(255, 255, 255, 180);
  for(let star of stars) {
    ellipse(star.x, star.y, star.size);
    star.y += star.speed; // 特效：向下流動的星空
    if(star.y > height) star.y = 0;
  }
}

function drawMagicCircle() {
  push();
  translate(width / 2, height / 2);
  magicAngle += 0.4; // 魔法陣自動旋轉
  rotate(magicAngle);
  
  noFill();
  stroke(100, 150, 255, 50); 
  strokeWeight(2);
  
  ellipse(0, 0, 500);
  ellipse(0, 0, 460);
  ellipse(0, 0, 200);
  
  // 繪製多角神祕學幾何線條
  for(let i = 0; i < 12; i++) {
    rotate(30);
    line(0, -250, 0, 250);
    rect(-20, -20, 40, 40);
  }
  pop();
}

// ==========================================
// ✋ 手勢核心邏輯處理
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
    // ✊ 先握拳再張開 (非 fist) 觸發
    if (!fist) {
      playTarotSound(440, 0.1); 
      state = "play";
      isAutoSpin = true; 
    }
  } 
  else if (state === "play") {
    let x = lm[8][0]; 

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

    // ✊ 握拳 3 秒確認 (180 幀)
    if (fist) {
      hold++;
      if (hold > 180) { 
        state = "select";
        playTarotSound(600, 0.5); 
      }
    } else {
      hold = max(0, hold - 2); 
    }
  }
}

// ==========================================
// 🖥️ 各畫面繪製
// ==========================================

function drawStartScreen() {
  rectMode(CENTER);
  fill(15, 15, 35, 230);
  stroke(138, 43, 226); 
  strokeWeight(3);
  rect(width / 2, height / 2, 520, 460, 20);

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  
  textSize(28);
  fill(255, 215, 0); 
  text("✨ 核心神秘學塔羅占卜 ✨", width / 2, height / 2 - 160);
  
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
  fill(190);
  text("1. 進入後請伸出手掌，先「握拳再張開」來觸發轉盤。", startX, height / 2 + 5);
  text("2. 手掌「左右移動」可以手動自由切換牌卡。", startX, height / 2 + 35);
  text("3. 無手勢操作時，系統將會啟動「自動翻牌」。", startX, height / 2 + 65);
  text("4. 面對鏡頭「維持握拳 3 秒鐘」即可確認抽牌。", startX, height / 2 + 95);

  rectMode(CENTER);
  fill(138, 43, 226, 180);
  rect(width / 2, height / 2 + 170, 260, 45, 10);
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(16);
  text("滑鼠點擊畫面進入占卜", width / 2, height / 2 + 170);
}

function drawSpinWaitScreen() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(22);
  fill(0, 255, 255);
  text("🔮 請面向鏡頭「先握拳再張開」以啟動命運轉盤", width / 2, height / 2);
}

function drawPlayScreen() {
  push();
  rectMode(CENTER);
  fill(25, 25, 50);
  stroke(255, 255, 255, 150);
  strokeWeight(2);
  rect(width / 2, height / 2, 200, 300, 15);
  
  stroke(255, 215, 0, 80);
  rect(width / 2, height / 2, 180, 280, 10);

  noStroke();
  fill(255, 215, 0);
  textAlign(CENTER, CENTER);
  textSize(48);
  text("？", width / 2, height / 2);
  pop();

  // ⭕ 精緻圓形進度條 (利用 arc 函數製作)
  if (hold > 0) {
    push();
    translate(width / 2, height / 2 + 200);
    noFill();
    stroke(255, 255, 255, 40);
    strokeWeight(8);
    ellipse(0, 0, 70); // 底圈
    
    stroke(0, 191, 255); // 圓形深藍/天藍色蓄力條
    let endAngle = map(hold, 0, 180, 0, 360);
    arc(0, 0, 70, 70, -90, endAngle - 90);
    
    noStroke();
    fill(255);
    textSize(13);
    textAlign(CENTER, CENTER);
    text(floor(hold/60) + "s", 0, 0);
    pop();
  } else {
    fill(200, 220, 255);
    textAlign(CENTER, CENTER);
    textSize(16);
    if(isAutoSpin) {
      text("［自動翻牌中］ 握拳 3 秒以鎖定此牌", width / 2, height / 2 + 180);
    } else {
      text("［手動選牌中］ 左右移動切換 / 握拳 3 秒確認", width / 2, height / 2 + 180);
    }
  }
}

function drawSelectScreen() {
  push();
  rectMode(CENTER);
  
  // ✨ 牌身發光特效
  let glow = sin(frameCount * 6) * 20 + 20;
  for(let i = 4; i > 0; i--) {
    fill(255, 215, 0, 12);
    stroke(255, 215, 0, 60 / i);
    strokeWeight(i * 5 + glow);
    rect(width / 2, height / 2 - 30, 220, 320, 15);
  }

  // 正式卡牌本體
  fill(15, 15, 30);
  stroke(255, 215, 0);
  strokeWeight(3);
  rect(width / 2, height / 2 - 30, 220, 320, 15);

  // 顯示牌名與解釋 (全中文)
  noStroke();
  fill(255, 215, 0);
  textAlign(CENTER, CENTER);
  textSize(28);
  text(cards[index].name, width / 2, height / 2 - 110);

  fill(240);
  textSize(16);
  textWrap(WORD);
  text(cards[index].desc, width / 2 - 90, height / 2 - 50, 180);
  pop();

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
// ⚙️ 工具功能
// ==========================================
function autoMode(){
  if (frameCount % 45 === 0){ 
    index = (index + 1) % cards.length;
    playTarotSound(200, 0.02);
  }
}

function isFist(lm){
  return lm[8][1] > lm[6][1] && lm[12][1] > lm[10][1];
}

function playTarotSound(freq, duration) {
  if (!soundEnabled) return; // 如果沒引入庫，直接跳出不報錯
  try {
    synth.start();
    synth.freq(freq);
    synth.amp(0.3, 0.05);
    setTimeout(() => {
      synth.amp(0, 0.1);
      setTimeout(() => synth.stop(), 100);
    }, duration * 1000);
  } catch(e) {
    console.log("Audio Context Alert");
  }
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
      state = "spinWait"; 
    }
  }
}