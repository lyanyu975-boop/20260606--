let video;
let handpose;
let predictions = [];

let index = 0;
let hold = 0;
let state = "start"; // start, spinWait, play, select

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
  { name: "愚者", desc: ["新的開始、冒險與未知旅程。", "勇敢踏出第一步，", "", "不要過度擔心結果，", "", "新的機會正在等待你。"] },
  { name: "魔術師", desc: ["創造力與萬事俱備的起點。", "你已擁有足夠的資源，", "", "發揮你的行動力與技巧，", "", "現在是展現才華的時刻。"] },
  { name: "女祭司", desc: ["直覺、潛意識與內在智慧。", "暫時停下外在的追尋，", "", "保持靜心與沉穩，", "", "你的直覺會帶領你找到答案。"] },
  { name: "皇后", desc: ["豐盛、孕育與溫暖的愛。", "物質與情感正迎來豐收，", "", "大膽享受大自然的恩賜，", "", "生活將充滿喜悅與感性。"] },
  { name: "皇帝", desc: ["秩序、掌控力與穩定權力。", "展現你的領導與理智，", "", "建立清晰的規則與紀律，", "", "你有實力穩定眼前的局面。"] },
  { name: "教皇", desc: ["精神指引、傳統與貴人相助。", "近期適合尋求長輩或", "", "專業人士的建議，", "", "遵循正道將獲得體制的支持。"] },
  { name: "戀人", desc: ["感情與重要選擇的象徵。", "近期可能面臨關於感情、", "", "人際或未來方向的抉擇，", "", "請傾聽自己的內心。"] },
  { name: "戰車", desc: ["堅強意志力與克服障礙的勝利。", "掌控內心的衝突與浮躁，", "", "鎖定目標，全力全速奔馳，", "", "你將成功突破重圍。"] },
  { name: "力量", desc: ["內在勇氣與溫柔的掌控。", "真正強大的是內心的堅韌，", "", "用包容與耐性融化剛強，", "", "你將優雅地戰勝恐懼。"] },
  { name: "隱者", desc: ["內省、獨處與尋求真理。", "這是一段與自己對話的時期，", "", "退回內心深處深思熟慮，", "", "你就是引領自己的那盞明燈。"] },
  { name: "命運之輪", desc: ["命運的轉折點與嶄新機會。", "不可抗拒的改變正在發生，", "", "順應時勢的潮起潮落，", "", "好運與轉機即將降臨。"] },
  { name: "正義", desc: ["公平、誠實與理性的因果決策。", "請用客觀平衡的角度審視，", "", "做出誠實、不偏頗的決定，", "", "付出什麼將收穫什麼。"] },
  { name: "倒吊人", desc: ["換位思考、等待與短暫犧牲。", "換個全新的角度看待世界，", "", "眼前的停滯是必要的修行，", "", "靜候智慧的果實成熟。"] },
  { name: "死神", desc: ["結束、淘汰與新生的陣痛。", "舊有的模式必須徹底結束，", "", "不要畏懼捨棄，", "", "唯有放手才能迎來全新的蛻變。"] },
  { name: "節制", desc: ["和諧平衡、淨化與溝通融合。", "在衝突中尋找細水長流，", "", "完美控制情感與理智，", "", "交流將會順暢並各退一步。"] },
  { name: "惡魔", desc: ["慾望、物質誘惑與內心束縛。", "注意那些讓你過度沉迷、", "", "或感到被制約的事物，", "", "覺察它是看清陰暗面的第一步。"] },
  { name: "高塔", desc: ["突如其來的劇變與幻滅。", "舊組織的限制與假象在崩塌，", "", "雖然震撼，但這能讓你", "", "在最堅固的基石上重新開始。"] },
  { name: "星星", desc: ["希望、心靈療癒與美好未來。", "風暴過後迎來了寧靜夜空，", "", "保持樂觀與純粹的信念，", "", "祝福與靈感正悄悄治癒你。"] },
  { name: "月亮", desc: ["迷茫不安、恐懼與隱藏的秘密。", "眼前面對的未知引發了焦慮，", "", "別被幻覺與流言黑影嚇倒，", "", "靜待迷霧散去、真相大白。"] },
  { name: "太陽", desc: ["象徵成功與幸福。", "目前的努力將逐漸看見成果，", "", "保持樂觀態度，", "", "好消息即將到來。"] },
  { name: "審判", desc: ["重要覺醒與重大的關鍵決定。", "聽從內心深處召喚的時刻，", "", "過去的努力將迎來最終清算，", "", "大膽跨入人生新階段。"] },
  { name: "世界", desc: ["圓滿大結局、旅程結束與完美。", "一個重要的生命週期已達成，", "", "情感與目標皆獲得圓滿，", "", "準備好迎接更高層次的冒險。"] }
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
    // 🔒【安全硬鎖】只要進入 select 結果狀態，直接拒絕更新手勢資料，防止殘留訊號干擾
    if (state !== "select") {
      predictions = results;
    } else {
      predictions = [];
    }
  });

  // ✨ 精美星空粒子
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
  background(8, 8, 20); 

  drawStarfield();
  drawLuxuryMagicCircle();

  // 🔄【鏡頭左右翻轉】將右上角相機畫面水平鏡像
  push();
  translate(width - 20, 20); // 移至右上角起點
  scale(-1, 1);              // 水平翻轉
  image(video, 0, 0, 220, 160); 
  pop();

  // 3. 核心狀態處理
  if (state === "start") {
    drawStartScreen();
  } else {
    handleHandGesture(); 

    if (state === "spinWait") {
      spreadProgress = lerp(spreadProgress, 0, 0.1); 
      drawTarotFan();
      drawSpinWaitScreen();
    } else if (state === "play") {
      spreadProgress = lerp(spreadProgress, 1, 0.08); 
      drawTarotFan();
      drawPlayUI();
    } else if (state === "select") {
      drawSelectScreen(); 
    }
  }
}

// ==========================================
// 🌌 特效系統
// ==========================================
function drawStarfield() {
  for(let star of stars) {
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
  translate(width / 2, height / 2 + 320); 
  magicAngle1 += 0.2; 
  magicAngle2 -= 0.15;
  
  push();
  rotate(magicAngle1);
  noFill();
  stroke(100, 160, 255, 35); 
  strokeWeight(2);
  ellipse(0, 0, 720);
  ellipse(0, 0, 680);
  for(let i = 0; i < 24; i++) {
    rotate(15);
    line(0, -360, 0, -340);
  }
  pop();

  push();
  rotate(magicAngle2);
  noFill();
  stroke(150, 100, 255, 30);
  strokeWeight(1.5);
  ellipse(0, 0, 580);
  ellipse(0, 0, 220);
  for(let i = 0; i < 12; i++) {
    rotate(30);
    line(0, -290, 0, 290);
    rect(-15, -15, 30, 30);
  }
  pop();
  pop();
}

// ==========================================
// ✋ 手勢核心邏輯（含左右翻轉座標修正與雙重硬鎖）
// ==========================================
function handleHandGesture() {
  // 🔒 第一重硬鎖：如果是結果畫面，直接阻斷所有手勢處理，牌面絕對不再移動！
  if (state === "select") return;

  if (predictions.length === 0) return;

  let lm = predictions[0].landmarks;
  let fist = isFist(lm);

  if (state === "spinWait") {
    if (!fist) {
      playTarotSound(440, 0.1); 
      state = "play";
    }
  } 
  else if (state === "play") {
    // 🔄【手勢座標鏡像翻轉】因為鏡頭翻轉了，X 座標也要用 (220 - 原座標) 修正，讓操作方向一致
    let x = 220 - lm[8][0]; 

    // 只有手勢左右擺動時切換
    if (frameCount % 5 === 0) { 
      if (x > 155) { // 原本小於65改為大於155（因為鏡像了）
        index = (index - 1 + cards.length) % cards.length;
        playTarotSound(350, 0.03);
      } else if (x < 65) { // 原本大於155改為小於65
        index = (index + 1) % cards.length;
        playTarotSound(380, 0.03);
      }
    }

    // ✊ 快速確認
    if (fist) {
      hold++;
      if (hold > 45) { 
        state = "select";
        predictions = []; // 🔒 第二重硬鎖：瞬間清空手勢快取
        playTarotSound(600, 0.4); 
      }
    } else {
      hold = max(0, hold - 2); 
    }
  }
}

// ==========================================
// 🃏 牌組動態
// ==========================================
function drawTarotFan() {
  push();
  translate(width / 2, height / 2 + 320); 
  
  let totalCards = cards.length;
  let startAngle = -75 * spreadProgress;
  let endAngle = 75 * spreadProgress;
  let angleStep = (totalCards > 1) ? (endAngle - startAngle) / (totalCards - 1) : 0;

  for (let i = 0; i < totalCards; i++) {
    push();
    let currentAngle = startAngle + i * angleStep;
    rotate(currentAngle);
    
    let radius = -440; 
    
    if (state === "spinWait") {
      radius = -250; 
      rectMode(CENTER);
      let initGlow = sin(frameCount * 5) * 10 + 15;
      fill(138, 43, 226, initGlow);
      rect(0, radius, 140, 220, 12);
      
      fill(25, 25, 55);
      stroke(255, 215, 0);
      strokeWeight(2.5);
      rect(0, radius, 130, 210, 10);
      
      stroke(255, 215, 0, 40);
      rect(0, radius, 115, 195, 8);
      
      noStroke();
      fill(255, 215, 0);
      textAlign(CENTER, CENTER);
      textSize(42);
      text("🔮", 0, radius);
      pop();
      continue; 
    }

    if (i === index && state === "play") {
      radius -= 50; 
      rectMode(CENTER);
      let pulseGlow = sin(frameCount * 8) * 10 + 15;
      fill(0, 191, 255, pulseGlow);
      noStroke();
      rect(0, radius, 95, 155, 10);
    }

    rectMode(CENTER);
    fill(18, 18, 40);
    
    if (i === index && state === "play") {
      stroke(255, 215, 0); 
      strokeWeight(2.5);
    } else {
      stroke(255, 255, 255, 80);
      strokeWeight(1);
    }
    rect(0, radius, 80, 140, 8);
    
    stroke(255, 215, 0, 20);
    rect(0, radius, 70, 130, 6);
    
    noStroke();
    if (i === index && state === "play") fill(255, 215, 0);
    else fill(120);
    textAlign(CENTER, CENTER);
    textSize(22);
    text("?", 0, radius);
    
    pop();
  }
  pop();
}

// ==========================================
// 🖥️ UI 介面繪製
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
  text("1. 進入後請伸出手掌，先「握拳再張開」來展開牌組。", startX, height / 2 + 5);
  text("2. 手掌「左右移動」可以手動切換選擇卡牌（已修正鏡像方向）。", startX, height / 2 + 35);
  text("3. 系統不會自動選牌，完全跟隨你的手勢擺動切換。", startX, height / 2 + 65);
  text("4. 面對鏡頭「快速握拳」蓄力條蓄滿即鎖定抽牌。", startX, height / 2 + 95);

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
  text("🔮 請面向鏡頭「先握拳再張開」展開大阿爾克那陣列", width / 2, height / 2 - 160);
}

function drawPlayUI() {
  if (hold > 0) {
    push();
    translate(width / 2, height / 2 - 160);
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
    text("［手動選牌中］左右移動切換 / 握拳快速確認", width / 2, height / 2 - 160);
  }
}

function drawSelectScreen() {
  push();
  rectMode(CENTER);
  
  let glow = sin(frameCount * 6) * 15 + 15;
  for(let i = 4; i > 0; i--) {
    fill(255, 215, 0, 6);
    stroke(255, 215, 0, 45 / i);
    strokeWeight(i * 5 + glow);
    rect(width / 2, height / 2 - 20, 290, 430, 15);
  }

  fill(16, 16, 35);
  stroke(255, 215, 0);
  strokeWeight(3.5);
  rect(width / 2, height / 2 - 20, 290, 430, 15);

  stroke(255, 215, 0, 80);
  strokeWeight(1);
  rect(width / 2, height / 2 - 20, 260, 400, 10);

  noStroke();
  
  fill(255, 215, 0);
  textAlign(CENTER, CENTER);
  textSize(26); 
  text(cards[index].name, width / 2, height / 2 - 165);

  fill(255, 215, 0, 130);
  textSize(11);
  text("✦ ARCHETYPAL REVELATION ✦", width / 2, height / 2 - 130);

  fill(235);
  textSize(13); 
  textAlign(CENTER, TOP);
  
  let lines = cards[index].desc;
  let startY = height / 2 - 95; 
  let lineHeight = 22;          
  
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], width / 2, startY + (i * lineHeight));
  }
  pop();

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
// ⚙️ 輔助工具
// ==========================================
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