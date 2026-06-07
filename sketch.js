let video;
let handpose;
let predictions = [];

let index = 0;
let hold = 0;
let state = "start"; // start, spinWait, play, select

// 藝術動畫控制
let spreadProgress = 0; 
let cardFloatAngle = 0; // 卡牌漂浮角度

// 特效變數
let starsFar = [];
let starsNear = [];
let burstParticles = []; // 鎖定時的爆炸粒子
let magicAngle1 = 0;
let magicAngle2 = 0;
let hueOffset = 0; // 流光色彩偏移

// 音效
let synth;
let soundEnabled = false; 

// 🔮 22張大阿爾克那
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
  colorMode(RGB, 255, 255, 255, 255);

  // 📷 攝影機初始化
  video = createCapture(VIDEO);
  video.size(220, 160);
  video.hide();

  // 🤖 ml5 handpose
  handpose = ml5.handpose(video, () => {
    console.log("AI Model Ready");
  });
  handpose.on("predict", results => {
    if (state === "select") {
      predictions = [];
      return;
    }
    predictions = results;
  });

  // ✨ 雙層星空初始化 (優化效能，數量控制在安全範圍)
  for(let i = 0; i < 60; i++){
    starsFar.push({ x: random(width), y: random(height), size: random(1, 2), speed: random(0.1, 0.4) });
  }
  for(let i = 0; i < 30; i++){
    starsNear.push({ x: random(width), y: random(height), size: random(2.5, 4), speed: random(0.5, 1) });
  }

  // 🎵 初始化合成器音效
  if (typeof p5.Oscillator !== 'undefined') {
    synth = new p5.Oscillator('sine');
    soundEnabled = true;
  }
}

function draw(){
  // 讓背景有一點點上一幀的殘影，製造高貴的動態模糊感（非常有質感！）
  background(8, 8, 20, 40); 

  // 取得手勢X做視差
  let handX = 0;
  if (predictions.length > 0) {
    handX = (220 - predictions[0].landmarks[8][0]) - 110; // 映射出中央位移量
  }

  drawStarfield(handX);
  drawLuxuryMagicCircle();
  updateBurstParticles(); // 更新並繪製炸裂粒子

  // 🔄 鏡頭左右翻轉與科技感邊框
  push();
  translate(width - 20, 20); 
  scale(-1, 1);              
  image(video, 0, 0, 220, 160); 
  pop();
  noFill();
  stroke(138, 43, 226, 120);
  rect(width - 240, 20, 220, 160, 4);

  // 3. 核心狀態處理
  if (state === "start") {
    drawStartScreen();
  } else {
    handleHandGesture(); 

    // 卡牌懸浮微幅正弦波計算
    cardFloatAngle += 2.5;

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
// 🌌 特效系統（升級：視差星空、粒子波）
// ==========================================
function drawStarfield(handX) {
  // 遠景星（移動極慢）
  for(let star of starsFar) {
    noStroke();
    fill(255, 255, 255, 150);
    ellipse(star.x + handX * 0.1, star.y, star.size);
    star.y += star.speed; 
    if(star.y > height) star.y = 0;
  }
  // 近景星（移動較快，產生景深）
  for(let star of starsNear) {
    noStroke();
    fill(135, 206, 250, 200);
    ellipse(star.x + handX * 0.3, star.y, star.size);
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
  stroke(100, 160, 255, 25); 
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
  stroke(138, 43, 226, 20);
  strokeWeight(1.5);
  ellipse(0, 0, 580);
  ellipse(0, 0, 220);
  pop();
  pop();
}

// 💥 觸發鎖定時的魔法粒子擴散波
function triggerBurst() {
  for(let i = 0; i < 40; i++) {
    let angle = random(360);
    let speed = random(3, 8);
    burstParticles.push({
      x: width / 2,
      y: height / 2,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      size: random(4, 8),
      alpha: 255,
      color: random([color(0, 255, 255), color(138, 43, 226), color(255, 215, 0)])
    });
  }
}

function updateBurstParticles() {
  for (let i = burstParticles.length - 1; i >= 0; i--) {
    let p = burstParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 5; // 逐漸淡出
    p.size *= 0.96; // 逐漸變小
    
    noStroke();
    p.color.setAlpha(p.alpha);
    fill(p.color);
    ellipse(p.x, p.y, p.size);
    
    if (p.alpha <= 0) {
      burstParticles.splice(i, 1);
    }
  }
}

// ==========================================
// ✋ 手勢核心邏輯
// ==========================================
function handleHandGesture() {
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
    let x = 220 - lm[8][0]; 

    // 🛑 只要手是在「握拳蓄力（hold > 0）」或當前是握拳狀態下，直接跳過移動切換！
    if (!fist && hold === 0) { 
      if (frameCount % 5 === 0) { 
        if (x < 75) { 
          index = (index - 1 + cards.length) % cards.length;
          playTarotSound(350, 0.03);
        } else if (x > 145) { 
          index = (index + 1) % cards.length;
          playTarotSound(380, 0.03);
        }
      }
    }

    // ✊ 快速確認與藍色圈圈蓄力
    if (fist) {
      hold++;
      if (hold > 45) { 
        predictions = []; 
        state = "select";
        triggerBurst(); // 💥 觸發帥氣的粒子炸裂波！
        playTarotSound(600, 0.4); 
      }
    } else {
      hold = max(0, hold - 3); 
    }
  }
}

// ==========================================
// 🃏 牌組動態（升級：加入細緻微浮動動態）
// ==========================================
function drawTarotFan() {
  push();
  translate(width / 2, height / 2 + 320); 
  
  let totalCards = cards.length;
  let startAngle = -75 * spreadProgress;
  let endAngle = 75 * spreadProgress;
  let angleStep = (totalCards > 1) ? (endAngle - startAngle) / (totalCards - 1) : 0;

  // 使用 sin 計算平滑的魔法浮動量 (不消耗效能卻極精緻)
  let hoverY = sin(cardFloatAngle) * 8;

  for (let i = 0; i < totalCards; i++) {
    push();
    let currentAngle = startAngle + i * angleStep;
    rotate(currentAngle);
    
    let radius = -440; 
    
    if (state === "spinWait") {
      radius = -250 + sin(cardFloatAngle * 0.8) * 6; // 初始大牌也有微浮動
      rectMode(CENTER);
      let initGlow = sin(frameCount * 5) * 12 + 18;
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

    // 🌟 當前被選中的卡牌：加入浮動 hoverY
    if (i === index && state === "play") {
      radius -= (50 + hoverY); 
      rectMode(CENTER);
      let pulseGlow = sin(frameCount * 8) * 15 + 20;
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
      stroke(255, 255, 255, 60);
      strokeWeight(1);
    }
    rect(0, radius, 80, 140, 8);
    
    stroke(255, 215, 0, 15);
    rect(0, radius, 70, 130, 6);
    
    noStroke();
    if (i === index && state === "play") fill(255, 215, 0);
    else fill(110);
    textAlign(CENTER, CENTER);
    textSize(22);
    text("?", 0, radius);
    
    pop();
  }
  pop();
}

// ==========================================
// 🖥️ UI 介面與精緻結果畫面
// ==========================================
function drawStartScreen() {
  rectMode(CENTER);
  fill(12, 12, 28, 240);
  stroke(138, 43, 226); 
  strokeWeight(3);
  rect(width / 2, height / 2, 520, 460, 20);

  noStroke();
  textAlign(CENTER, CENTER);
  
  textSize(32);
  fill(255, 215, 0); 
  text("神秘學塔羅占卜", width / 2, height / 2 - 160);
  
  textSize(16);
  fill(200, 220, 255);
  text("「心中想著你的問題 抽選一張大阿爾克那」", width / 2, height / 2 - 100);
  
  stroke(138, 43, 226, 40);
  line(width/2 - 220, height/2 - 60, width/2 + 220, height/2 - 60);
  noStroke();
  
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  let startX = width / 2 - 190;
  text("【高級儀式說明】", startX, height / 2 - 30);
  textSize(14);
  fill(180);
  text("1. 伸出手掌，先「握拳再張開」喚醒中央魔法牌組。", startX, height / 2 + 5);
  text("2. 手掌「左右物理移動」控制大半圓卡牌的切換方向。", startX, height / 2 + 35);
  text("3. 「握拳蓄力」時卡牌會完全定格，防干擾機制啟動。", startX, height / 2 + 65);
  text("4. 蓄力條滿時會釋放魔法波，即刻為您顯現占卜結果。", startX, height / 2 + 95);

  rectMode(CENTER);
  fill(138, 43, 226, 180);
  rect(width / 2, height / 2 + 170, 260, 45, 10);
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(16);
  text("點擊畫面 開啟命運之門", width / 2, height / 2 + 170);
}

function drawSpinWaitScreen() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(22);
  fill(0, 255, 255);
  text("🔮 請面向鏡頭「先握拳再張開」展開占卜陣列", width / 2, height / 2 - 160);
}

function drawPlayUI() {
  if (hold > 0) {
    push();
    translate(width / 2, height / 2 - 160);
    noFill();
    stroke(255, 255, 255, 30);
    strokeWeight(6);
    ellipse(0, 0, 60); 
    
    // 蓄力外圈漸層色感
    stroke(0, 255, 255); 
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
    text("［命運抽選中］左右擺動切換 / 握拳蓄力鎖定", width / 2, height / 2 - 160);
  }
}

// 🎉 升級結果畫面：加入魔幻游走流光、緩慢懸浮動態
function drawSelectScreen() {
  push();
  
  // 讓整張卡牌結果框隨時間優雅地上下浮動
  let selectHoverY = sin(cardFloatAngle * 0.5) * 10;
  translate(0, selectHoverY);
  
  rectMode(CENTER);
  
  // 緩緩改變的流光邊框顏色
  hueOffset += 0.8;
  let rGlow = sin(hueOffset) * 40 + 215; // 在金色與神祕橘紅間流動
  let gGlow = sin(hueOffset + 120) * 30 + 185;
  
  let glowSize = sin(frameCount * 6) * 12 + 12;
  for(let i = 4; i > 0; i--) {
    fill(rGlow, gGlow, 0, 4);
    stroke(rGlow, gGlow, 0, 40 / i);
    strokeWeight(i * 4 + glowSize);
    rect(width / 2, height / 2 - 20, 295, 435, 15);
  }

  // 卡牌本體
  fill(15, 15, 32);
  stroke(rGlow, gGlow, 100);
  strokeWeight(3.5);
  rect(width / 2, height / 2 - 20, 290, 430, 15);

  stroke(rGlow, gGlow, 100, 70);
  strokeWeight(1);
  rect(width / 2, height / 2 - 20, 260, 400, 10);

  noStroke();
  
  // 1. 牌名
  fill(255, 225, 100);
  textAlign(CENTER, CENTER);
  textSize(28); 
  text(cards[index].name, width / 2, height / 2 - 165);

  fill(200, 200, 255, 120);
  textSize(11);
  text("✦ DESTINY REVELATION ✦", width / 2, height / 2 - 130);

  // 2. 文字多行精準渲染 (百分百安全鎖定在框內)
  fill(240);
  textSize(13); 
  textAlign(CENTER, TOP);
  
  let lines = cards[index].desc;
  let startY = height / 2 - 95; 
  let lineHeight = 24;          
  
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
    fill(55, 20, 100);
    cursor(ARROW);
  }
  
  stroke(255, 215, 0, 150);
  strokeWeight(1.5);
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
    synth.amp(0.15, 0.05);
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