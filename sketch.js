let video;
let handpose;
let predictions = [];

let index = 0;
let hold = 0;
let state = "start"; // start, spinWait, play, select
let isAutoSpin = true; 

// 扇形展開動畫控制
let spreadProgress = 0; 

// 精美特效變數
let stars = [];
let magicAngle1 = 0;
let magicAngle2 = 0;

// 音效
let synth;
let soundEnabled = false; 

// 🔮 22張大阿爾克那：深度多行中文釋義
const cards = [
  {name:"愚者", desc:"新的開始、冒險與未知旅程。\n\n勇敢踏出第一步，\n不要過度擔心結果，\n新的機會正在等待你。"},
  {name:"魔術師", desc:"創造力與萬事俱備的起點。\n\n你已擁有足夠的資源，\n發揮你的行動力與技巧，\n現在是展現才華的時刻。"},
  {name:"女祭司", desc:"直覺、潛意識與內在智慧。\n\n暫時停下外在的追尋，\n保持靜心與沉穩，\n你的直覺會帶領你找到答案。"},
  {name:"皇后", desc:"豐盛、孕育與溫暖的愛。\n\n物質與情感正迎來豐收，\n大膽享受大自然的恩賜，\n生活將充滿喜悅與感性。"},
  {name:"皇帝", desc:"秩序、掌控力與穩定權力。\n\n展現你的領導與理智，\n建立清晰的規則與紀律，\n你有實力穩定眼前的局面。"},
  {name:"教皇", desc:"精神指引、傳統與貴人相助。\n\n近期適合尋求長輩或\n專業人士的建議，\n遵循正道將獲得體制的支持。"},
  {name:"戀人", desc:"感情與重要選擇的象徵。\n\n近期可能面臨關於感情、\n人際或未來方向的抉擇，\n請傾聽自己的內心。"},
  {name:"戰車", desc:"堅強意志力與克服障礙的勝利。\n\n掌控內心的衝突與浮躁，\n鎖定目標，全力全速奔馳，\n你將成功突破重圍。"},
  {name:"力量", desc:"內在勇氣與溫柔的掌控。\n\n真正強大的是內心的堅韌，\n用包容與耐性融化剛強，\n你將優雅地戰勝恐懼。"},
  {name:"隱者", desc:"內省、獨處與尋求真理。\n\n這是一段與自己對話的時期，\n退回內心深處深思熟慮，\n你就是引領自己的那盞明燈。"},
  {name:"命運之輪", desc:"命運的轉折點與嶄新機會。\n\n不可抗拒的改變正在發生，\n順應時勢的潮起潮落，\n好運與轉機即將降臨。"},
  {name:"正義", desc:"公平、誠實與理性的因果決策。\n\n請用客觀平衡的角度審視，\n做出誠實、不偏頗的決定，\n付出什麼將收穫什麼。"},
  {name:"倒吊人", desc:"換位思考、等待與短暫犧牲。\n\n換個全新的角度看待世界，\n眼前的停滯是必要的修行，\n靜候智慧的果實成熟。"},
  {name:"死神", desc:"結束、淘汰與新生的陣痛。\n\n舊有的模式必須徹底結束，\n不要畏懼捨棄，\n唯有放手才能迎來全新的蛻變。"},
  {name:"節制", desc:"和諧平衡、淨化與溝通融合。\n\n在衝突中尋找細水長流，\n完美控制情感與理智，\n交流將會順暢並各退一步。"},
  {name:"惡魔", desc:"慾望、物質誘惑與內心束縛。\n\n注意那些讓你過度沉迷、\n或感到被制約的事物，\n覺察它是看清陰暗面的第一步。"},
  {name:"高塔", desc:"突如其來的劇變與幻滅。\n\n舊有的限制與假象在崩塌，\n雖然震撼，但這能讓你\n在最堅固的基石上重新開始。"},
  {name:"星星", desc:"希望、心靈療癒與美好未來。\n\n風暴過後迎來了寧靜夜空，\n保持樂觀與純粹的信念，\n祝福與靈感正悄悄治癒你。"},
  {name:"月亮", desc:"迷茫不安、恐懼與隱藏的秘密。\n\n眼前面對的未知引發了焦慮，\n別被幻覺與流言黑影嚇倒，\n靜待迷霧散去、真相大白。"},
  {name:"太陽", desc:"象徵成功與幸福。\n\n目前的努力將逐漸看見成果，\n保持樂觀態度，\n好消息即將到來。"},
  {name:"審判", desc:"重要覺醒與重大的關鍵決定。\n\n聽從內心深處召喚的時刻，\n過去的努力將迎來最終清算，\n大膽跨入人生新階段。"},
  {name:"世界", desc:"圓滿大結局、旅程結束與完美。\n\n一個重要的生命週期已達成，\n情感與目標皆獲得圓滿，\n準備好迎接更高層次的冒險。"}
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
    // ⭐【安全鎖】如果已經選定卡牌，就不再接收新的預測，防止畫面跳動
    if (state !== "select") {
      predictions = results;
    }
  });

  // ✨ 精美星空粒子（加入亮度屬性）
  for(let i = 0; i < 120; i++){
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 4),
      speed: random(0.3, 1.5),
      brightness: random(100, 255),
      blinkSpeed: random(2, 5)
    });
  }

  // 🎵 初始化合成器音效
  if (typeof p5.Oscillator !== 'undefined') {
    synth = new p5.Oscillator('sine');
    soundEnabled = true;
  }
}

function draw(){
  background(8, 8, 20); // 更深邃的神祕夜空藍

  // 1. 繪製升級版精美特效
  drawStarfield();
  drawLuxuryMagicCircle();

  // 2. 右上角相機鏡頭
  image(video, width - 240, 20, 220, 160);

  // 3. 核心狀態機
  if (state === "start") {
    drawStartScreen();
  } else {
    handleHandGesture(); // 處理手勢

    if (state === "spinWait") {
      spreadProgress = lerp(spreadProgress, 0, 0.1); 
      drawTarotFan();
      drawSpinWaitScreen();
    } else if (state === "play") {
      spreadProgress = lerp(spreadProgress, 1, 0.08); 
      drawTarotFan();
      drawPlayUI();
    } else if (state === "select") {
      drawSelectScreen(); // 🔒 鎖定狀態，在此狀態下手勢不會再運作
    }
  }
}

// ==========================================
// 🌌 升級：精美的星空與雙層旋轉魔法陣
// ==========================================
function drawStarfield() {
  for(let star of stars) {
    // 讓星星有呼吸閃爍的效果
    star.brightness += sin(frameCount * star.blinkSpeed) * 5;
    star.brightness = constrain(star.brightness, 80, 255);
    
    noStroke();
    fill(255, 255, 255, star.brightness);
    ellipse(star.x, star.y, star.size);
    
    star.y += star.speed; 
    if(star.y > height) star.y = 0;
  }
}

function drawLuxuryMagicCircle() {
  push();
  // 將圓心放在畫面下方展開陣列交會點
  translate(width / 2, height / 2 + 320); 
  
  // 雙層反向旋轉，更具動態感
  magicAngle1 += 0.2; 
  magicAngle2 -= 0.15;
  
  // --- 外層魔法陣 ---
  push();
  rotate(magicAngle1);
  noFill();
  stroke(100, 160, 255, 35); 
  strokeWeight(2);
  ellipse(0, 0, 680);
  ellipse(0, 0, 640);
  
  // 外圈神祕幾何刻度
  for(let i = 0; i < 24; i++) {
    rotate(15);
    line(0, -340, 0, -320);
  }
  pop();

  // --- 內層魔法陣 ---
  push();
  rotate(magicAngle2);
  noFill();
  stroke(150, 100, 255, 30);
  strokeWeight(1.5);
  ellipse(0, 0, 560);
  ellipse(0, 0, 200);
  
  // 內圈星芒線條
  for(let i = 0; i < 12; i++) {
    rotate(30);
    line(0, -280, 0, 280);
    rect(-15, -15, 30, 30);
  }
  pop();
  
  pop();
}

// ==========================================
// ✋ 手勢核心邏輯（含選中鎖定機制）
// ==========================================
function handleHandGesture() {
  // ⭐ 如果已經進入選定結果狀態，完全停止手勢邏輯（不再更新選牌）
  if (state === "select") return;

  if (predictions.length === 0) {
    if (state === "play" && isAutoSpin) {
      autoMode(); 
    }
    return;
  }

  let lm = predictions[0].landmarks;
  let fist = isFist(lm);

  if (state === "spinWait") {
    if (!fist) {
      playTarotSound(440, 0.1); 
      state = "play";
      isAutoSpin = true; 
    }
  } 
  else if (state === "play") {
    let x = lm[8][0]; 

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

    // ✊ 握拳快速鎖定（45幀 ≈ 0.75秒）
    if (fist) {
      hold++;
      if (hold > 45) { 
        state = "select";
        predictions = []; // 🔒 清空資料鎖定畫面，不給別的手勢干擾
        playTarotSound(600, 0.4); 
      }
    } else {
      hold = max(0, hold - 2); 
    }
  }
}

// ==========================================
// 🃏 升級：更大的半圓展開陣列與高質感凸出光暈
// ==========================================
function drawTarotFan() {
  push();
  // 圓心維持在中下方
  translate(width / 2, height / 2 + 320); 
  
  let totalCards = cards.length;
  // 大半圓夾角分配
  let startAngle = -70 * spreadProgress;
  let endAngle = 70 * spreadProgress;
  let angleStep = (totalCards > 1) ? (endAngle - startAngle) / (totalCards - 1) : 0;

  for (let i = 0; i < totalCards; i++) {
    push();
    let currentAngle = startAngle + i * angleStep;
    rotate(currentAngle);
    
    // ⭐ 半圓半徑加大（原本 -350 改為 -430，讓陣列變大）
    let radius = -430; 
    
    // 目前選中的卡牌：向上突起且加上華麗的天藍色擴散光暈
    if (i === index && state === "play") {
      radius -= 45; // 凸出程度變更明顯
      
      // 凸出卡牌的流光外溢效果
      rectMode(CENTER);
      let pulseGlow = sin(frameCount * 8) * 8 + 12;
      fill(0, 191, 255, pulseGlow);
      noStroke();
      rect(0, radius, 95, 155, 10);
    }

    // 繪製卡牌主體
    rectMode(CENTER);
    fill(20, 20, 45); // 深邃星空藍卡背
    
    if (i === index && state === "play") {
      stroke(255, 215, 0); // 凸出選中牌用亮金色邊框
      strokeWeight(2.5);
    } else {
      stroke(255, 255, 255, 90);
      strokeWeight(1);
    }
    rect(0, radius, 80, 140, 8);
    
    // 卡背星盤刻線
    stroke(255, 215, 0, 25);
    rect(0, radius, 70, 130, 6);
    ellipse(0, radius, 40);
    
    noStroke();
    if (i === index && state === "play") fill(255, 215, 0);
    else fill(130);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("?", 0, radius);
    
    pop();
  }
  pop();
}

// ==========================================
// 🖥️ 介面繪製（完美鎖定文字在卡牌框內）
// ==========================================

function drawStartScreen() {
  rectMode(CENTER);
  fill(12, 12, 28, 240);
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

function drawSpinWaitScreen() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(22);
  fill(0, 255, 255);
  text("🔮 請面向鏡頭「先握拳再張開」展開大阿爾克那陣列", width / 2, height / 2 - 150);
}

function drawPlayUI() {
  if (hold > 0) {
    push();
    translate(width / 2, height / 2 - 150);
    noFill();
    stroke(255, 255, 255, 40);
    strokeWeight(6);
    ellipse(0, 0, 60); 
    
    stroke(0, 191, 255); 
    let endAngle = map(hold, 0, 45, 0, 360); 
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
      text("［自動巡航中］握拳鎖定當前凸出的卡牌", width / 2, height / 2 - 150);
    } else {
      text("［手動選牌中］左右移動切換 / 握拳快速確認", width / 2, height / 2 - 150);
    }
  }
}

// 🎉 5. 抽中牌結果：字體縮小、支援隔行、極致嚴格包覆在卡牌框內
function drawSelectScreen() {
  push();
  rectMode(CENTER);
  
  // 牌身金光發光特效
  let glow = sin(frameCount * 6) * 15 + 15;
  for(let i = 4; i > 0; i--) {
    fill(255, 215, 0, 8);
    stroke(255, 215, 0, 50 / i);
    strokeWeight(i * 5 + glow);
    rect(width / 2, height / 2 - 20, 280, 420, 15); // 微調主框尺寸
  }

  // 卡牌主框體
  fill(16, 16, 35);
  stroke(255, 215, 0);
  strokeWeight(3.5);
  rect(width / 2, height / 2 - 20, 280, 420, 15);

  // 內部裝飾內細框（確保文字死死鎖在框內）
  stroke(255, 215, 0, 90);
  strokeWeight(1);
  rect(width / 2, height / 2 - 20, 250, 390, 10);

  noStroke();
  
  // 📥 【文字排版核心優化】
  // 1. 牌名 (中文加大置中)
  fill(255, 215, 0);
  textAlign(CENTER, CENTER);
  textSize(24); // 微調字體大小，視覺比例最完美
  text(cards[index].name, width / 2, height / 2 - 170);

  // 分隔花飾
  fill(255, 215, 0, 140);
  textSize(11);
  text("✦ ARCHETYPAL REVELATION ✦", width / 2, height / 2 - 135);

  // 2. 深入牌義解釋文字（小字體、居中對齊、完美容納在框中）
  fill(235);
  textSize(12.5); // 精細調整解釋文字大小，杜絕超出卡牌外
  textAlign(CENTER, TOP);
  textWrap(WORD);
  
  // 寬度限制設為 220 像素，完美符合內邊框
  text(cards[index].desc, width / 2 - 110, height / 2 - 100, 220);
  pop();

  // 重新占卜按鈕（完美待在卡牌框的下方）
  drawResetButton();
}

function drawResetButton() {
  push();
  rectMode(CENTER);
  let btnY = height - 60;
  
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
    synth.amp(0.18, 0.05);
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
    let btnY = height - 60;
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && mouseY > btnY - 22 && mouseY < btnY + 22) {
      playTarotSound(440, 0.1);
      hold = 0;
      index = 0;
      spreadProgress = 0; 
      state = "spinWait"; 
    }
  }
}