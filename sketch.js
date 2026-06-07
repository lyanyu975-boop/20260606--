let video;
let handpose;
let predictions = [];

let state = "lobby"; // lobby, start, spinWait, play, select, game2
let index = 0;
let hold = 0;
let spreadProgress = 0; 
let cardFloatAngle = 0;

// 🎮 遊戲二：雙指捏捏連連看變數 (恢復30秒限制，取消說明書)
let game2Timer = 0;
let game2MaxTime = 1800; // 30秒 (60幀/秒 * 30)
let game2Score = 0;
let pinchTargets = [];
let grabbedItem = null; 

// ✨ 華麗特效變數
let starsFar = [];
let starsNear = [];
let burstParticles = [];
let magicAngle1 = 0;
let magicAngle2 = 0;
let hueOffset = 0;

// 🎵 音效系統變數
let synth;
let soundEnabled = false; 
let isAutoSpin = false; 

// 🔮 22張大阿爾克那 (原版卡牌完整保留，完全不更改)
const cards = [
  { name: "愚者", desc: ["新的開始、冒險與未知旅程。", "勇敢踏出第一步，", "", "不要過度擔心結果，", "", "新的機會正在等待你。"] },
  { name: "魔術師", desc: ["創造力與萬事俱備的起點。", "你已擁有足夠的資源，", "", "發揮你的行動力與技巧，", "", "現在是展現才華的時刻。"] },
  { name: "女祭司", desc: ["直覺、潛意識與內在智慧。", "暫時停下外在的追尋，", "", "保持靜心與沉穩，", "", "你的直覺會帶領你找到答案。"] },
  { name: "皇后", desc: ["豐盛、孕育與溫暖的愛。", "物質與情感正迎來豐收，", "", "大膽享受大自然的恩賜，", "", "生活將充滿喜悅與感性。"] },
  { name: "皇帝", desc: ["秩序、掌控力與穩定權力。", "展現你的領導與理智，", "", "建立清晰的規則與紀律，", "", "你有實力穩定眼前的局面。"] },
  { name: "教皇", desc: ["精神指引、傳統與貴人相助。", "近期適合尋求長輩或", "", "專業人士的建議，", "", "遵循正道將獲得體制的支持。"] },
  { name: "戀人", desc: ["感情與重要選擇的象像。", "近期可能面臨關於感情、", "", "人際或未來方向的抉擇，", "", "請傾聽自己的內心。"] },
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
  { name: "世界", desc: ["圓滿大結束、旅程結束與完美。", "一個重要的生命週期已達成，", "", "情感與目標皆獲得圓滿，", "", "準備好迎接更高層次的冒險。"] }
];

function setup(){
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  // 📷 初始化視訊
  video = createCapture(VIDEO);
  video.size(220, 160);
  video.hide(); 

  // 🤖 載入 AI 手勢識別
  handpose = ml5.handpose(video, () => {
    console.log("Handpose AI Ready");
  });
  handpose.on("predict", results => {
    if (state === "select") {
      predictions = [];
      return;
    }
    predictions = results;
  });

  // ✨ 背景背景星空生成
  for(let i = 0; i < 60; i++){
    starsFar.push({ x: random(width), y: random(height), size: random(1, 2), speed: random(0.1, 0.4) });
  }
  for(let i = 0; i < 30; i++){
    starsNear.push({ x: random(width), y: random(height), size: random(2.5, 4), speed: random(0.5, 1) });
  }

  // 🎵 初始化音效
  if (typeof p5.Oscillator !== 'undefined') {
    synth = new p5.Oscillator('sine');
    soundEnabled = true;
  }
}

function draw(){
  background(8, 8, 20, 45); 

  // 1. 解析手勢座標
  let handX = 0;
  let tX = 0, tY = 0; // 大拇指尖
  let iX = 0, iY = 0; // 食指尖
  let midX = 0, midY = 0; // 雙指中心
  let hasHand = false;
  let isPinching = false;

  if (predictions.length > 0) {
    hasHand = true;
    let lm = predictions[0].landmarks;
    
    // 橫向物理鏡像座標
    let rawX = 220 - lm[8][0]; 
    handX = rawX - 110; 
    
    // 映射至全網頁畫布 (全畫布辨識)
    tX = map(220 - lm[4][0], 15, 205, 0, width);
    tY = map(lm[4][1], 15, 145, 0, height);
    iX = map(220 - lm[8][0], 15, 205, 0, width);
    iY = map(lm[8][1], 15, 145, 0, height);
    
    midX = (tX + iX) / 2;
    midY = (tY + iY) / 2;

    // 🤏 雙指捏起判定 (物理距離小於 40 像素)
    if (dist(tX, tY, iX, iY) < 40) {
      isPinching = true;
    }

    // 如果在連連看遊戲進行中，繪製完整的手勢骨架與變色辨識圈
    if (state === "game2") {
      drawHandSkeleton(lm);
      drawPinchPointsUI(tX, tY, iX, iY, midX, midY, isPinching);
    }
  }

  drawStarfield(handX);
  drawLuxuryMagicCircle();
  updateBurstParticles();

  // 2. 🎛️ 狀態機場景切換
  if (state === "lobby") {
    drawLobby();
  } else if (state === "start") {
    drawStartScreen();
  } else if (state === "game2") {
    runGame2Logic(midX, midY, hasHand, isPinching);
  } else {
    // 🔮 卡牌部分核心邏輯 (完全保留原版)
    handleHandGesture(); 
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

  // 3. 🛡️ 畫布內建式視訊框渲染 (徹底解決對不上的問題)
  let camX = width - 240;
  let camY = 20;
  
  push();
  translate(camX + 220, camY); 
  scale(-1, 1);
  image(video, 0, 0, 220, 160); 
  pop();
  
  noFill();
  stroke(138, 43, 226, 180);
  strokeWeight(2);
  rect(camX, camY, 220, 160, 6);

  // 4. 一般狀態下的手勢指引點
  if (hasHand && state !== "game2") {
    fill(0, 255, 255, 180);
    noStroke();
    ellipse(iX, iY, 15);
  }
}

// ==========================================
// 🏛️ 主選單大廳
// ==========================================
function drawLobby() {
  rectMode(CENTER);
  fill(12, 12, 28, 220);
  stroke(255, 215, 0, 120);
  strokeWeight(2);
  rect(width / 2, height / 2, 620, 400, 15);

  noStroke();
  textAlign(CENTER, CENTER);
  fill(255, 215, 0);
  textSize(38);
  text("手勢互動遊戲網", width / 2, height / 2 - 130);
  
  fill(180, 200, 255);
  textSize(16);
  text("請使用滑鼠點擊選擇想進入的互動空間", width / 2, height / 2 - 80);

  drawLobbyButton(width / 2 - 140, height / 2 + 30, "🔮 命運塔羅占卜", color(75, 0, 130));
  drawLobbyButton(width / 2 + 140, height / 2 + 30, "🤏 雙指捏捏連連看", color(25, 25, 112));
}

function drawLobbyButton(x, y, label, btnColor) {
  push();
  rectMode(CENTER);
  if (mouseX > x - 110 && mouseX < x + 110 && mouseY > y - 40 && mouseY < y + 40) {
    fill(btnColor.levels[0]+30, btnColor.levels[1]+30, btnColor.levels[2]+30);
    cursor(HAND);
  } else {
    fill(btnColor);
  }
  stroke(255);
  strokeWeight(1);
  rect(x, y, 220, 80, 10);
  noStroke(); fill(255); textSize(18); textAlign(CENTER, CENTER); text(label, x, y);
  pop();
}

// ==========================================
// 🦴 遊戲二專屬：手勢骨架與變色識別UI
// ==========================================
function drawHandSkeleton(lm) {
  stroke(0, 255, 255, 90);
  strokeWeight(2.5);
  
  let fingers = [
    [0, 1, 2, 3, 4],
    [0, 5, 6, 7, 8],
    [0, 9, 10, 11, 12],
    [0, 13, 14, 15, 16],
    [0, 17, 18, 19, 20],
    [5, 9, 13, 17]
  ];

  for (let f of fingers) {
    for (let i = 0; i < f.length - 1; i++) {
      let x1 = map(220 - lm[f[i]][0], 15, 205, 0, width);
      let y1 = map(lm[f[i]][1], 15, 145, 0, height);
      let x2 = map(220 - lm[f[i+1]][0], 15, 205, 0, width);
      let y2 = map(lm[f[i+1]][1], 15, 145, 0, height);
      line(x1, y1, x2, y2);
    }
  }

  noStroke();
  fill(0, 255, 255, 180);
  for (let i = 0; i < lm.length; i++) {
    let x = map(220 - lm[i][0], 15, 205, 0, width);
    let y = map(lm[i][1], 15, 145, 0, height);
    ellipse(x, y, 7);
  }
}

function drawPinchPointsUI(tX, tY, iX, iY, midX, midY, isPinching) {
  push();
  noStroke();
  fill(255, 255, 255, 220);
  ellipse(tX, tY, 12); 
  ellipse(iX, iY, 12); 

  // 🎯 核心需求：雙指捏起時，圓圈會辨識並變色
  if (isPinching) {
    fill(255, 215, 0, 150); // 捏起：變耀眼金色
    stroke(255, 215, 0);
    strokeWeight(2.5);
    ellipse(midX, midY, 32 + sin(frameCount * 12) * 4);
  } else {
    fill(0, 255, 255, 50);  // 未捏起：原版青色
    stroke(0, 255, 255, 150);
    strokeWeight(1);
    ellipse(midX, midY, 22);
  }
  pop();
}

// ==========================================
// 🤏 遊戲二：雙指捏捏連連看 (含30秒時間限制)
// ==========================================
function initGame2Data() {
  game2Score = 0;
  game2Timer = game2MaxTime; // 重設為 30秒
  pinchTargets = [];
  grabbedItem = null;

  let symbols = ["☀️", "🌙", "⭐", "🪐", "🌀", "🔮"];
  for (let sym of symbols) {
    for (let j = 0; j < 2; j++) {
      pinchTargets.push({
        id: random(100000),
        x: random(120, width - 300), 
        y: random(120, height - 120),
        icon: sym,
        size: 60,
        isMatched: false
      });
    }
  }
}

function runGame2Logic(mX, mY, hasHand, isPinching) {
  if (game2Timer > 0) {
    game2Timer--; // 只有在時間大於0時才倒數
  }

  // 抓取與碰撞消除核心
  if (hasHand && game2Timer > 0) {
    if (isPinching) {
      if (grabbedItem === null) {
        for (let t of pinchTargets) {
          if (!t.isMatched && dist(mX, mY, t.x, t.y) < t.size * 0.8) {
            grabbedItem = t;
            break;
          }
        }
      } else {
        grabbedItem.x = mX;
        grabbedItem.y = mY;
      }
    } else {
      if (grabbedItem !== null) {
        for (let t of pinchTargets) {
          if (t.id !== grabbedItem.id && !t.isMatched && t.icon === grabbedItem.icon) {
            if (dist(grabbedItem.x, grabbedItem.y, t.x, t.y) < t.size + 20) {
              t.isMatched = true;
              grabbedItem.isMatched = true;
              game2Score += 20;
              triggerGame2Burst((t.x + grabbedItem.x)/2, (t.y + grabbedItem.y)/2);
              playTarotSound(580, 0.1);
              break;
            }
          }
        }
        grabbedItem = null;
      }
    }
  }

  // 繪製卡牌圖標
  let remaining = 0;
  for (let t of pinchTargets) {
    if (t.isMatched) continue;
    remaining++;

    push();
    rectMode(CENTER);
    if (grabbedItem && grabbedItem.id === t.id) {
      fill(255, 215, 0, 50);
      stroke(255, 215, 0);
      strokeWeight(2.5);
    } else {
      fill(25, 25, 50, 190);
      stroke(0, 255, 255, 90);
      strokeWeight(1.5);
    }
    rect(t.x, t.y, t.size, t.size, 10);
    
    noStroke(); fill(255);
    textAlign(CENTER, CENTER); textSize(26);
    text(t.icon, t.x, t.y);
    pop();
  }

  // 自動補牌 (全部消完且時間還沒到時)
  if (remaining === 0 && game2Timer > 0) {
    initGame2Data();
    game2Timer = game2Timer; // 保留當前剩餘時間
  }

  // 渲染 UI 資訊
  textAlign(LEFT, TOP); fill(0, 255, 255); textSize(24);
  text("得分: " + game2Score, 40, 40);

  textAlign(RIGHT, TOP);
  let timeLeft = max(0, ceil(game2Timer / 60));
  if (timeLeft <= 5) fill(255, 50, 50); else fill(255, 215, 0);
  text("限時倒數: " + timeLeft + " 秒", width - 260, 40);

  // 門檻判定：時間到時跳出結算
  if (game2Timer <= 0) {
    rectMode(CENTER);
    fill(12, 12, 28, 245); stroke(0, 255, 255); strokeWeight(2);
    rect(width / 2, height / 2, 400, 250, 15);
    
    fill(255, 215, 0); textAlign(CENTER, CENTER); textSize(32);
    text("時間到！", width / 2, height / 2 - 40);
    fill(255); textSize(20);
    text("最終得分: " + game2Score, width / 2, height / 2 + 15);
    
    drawLobbyButton(width / 2, height / 2 + 75, "返回選單大廳", color(138, 43, 226));
  } else {
    drawLobbyButton(100, height - 40, "⬅ 返回選單大廳", color(40, 40, 50));
  }
}

function triggerGame2Burst(x, y) {
  for(let i = 0; i < 20; i++) {
    let angle = random(360);
    let speed = random(3, 7);
    burstParticles.push({
      x: x, y: y,
      vx: cos(angle) * speed, vy: sin(angle) * speed,
      size: random(4, 7), alpha: 255,
      color: color(255, 215, 0)
    });
  }
}

// ==========================================
// 🌌 星空環境與粒子系統
// ==========================================
function drawStarfield(handX) {
  for(let star of starsFar) {
    noStroke(); fill(255, 255, 255, 150);
    ellipse(star.x + handX * 0.1, star.y, star.size);
    star.y += star.speed; if(star.y > height) star.y = 0;
  }
  for(let star of starsNear) {
    noStroke(); fill(135, 206, 250, 200);
    ellipse(star.x + handX * 0.3, star.y, star.size);
    star.y += star.speed; if(star.y > height) star.y = 0;
  }
}

function drawLuxuryMagicCircle() {
  push(); translate(width / 2, height / 2 + 320); 
  magicAngle1 += 0.2; magicAngle2 -= 0.15;
  push(); rotate(magicAngle1); noFill(); stroke(100, 160, 255, 25); ellipse(0, 0, 720); pop();
  push(); rotate(magicAngle2); noFill(); stroke(138, 43, 226, 20); ellipse(0, 0, 580); pop();
  pop();
}

function triggerBurst() {
  for(let i = 0; i < 40; i++) {
    let angle = random(360); let speed = random(3, 8);
    burstParticles.push({
      x: width / 2, y: height / 2,
      vx: cos(angle) * speed, vy: sin(angle) * speed,
      size: random(4, 8), alpha: 255,
      color: random([color(0, 255, 255), color(138, 43, 226), color(255, 215, 0)])
    });
  }
}

function updateBurstParticles() {
  for (let i = burstParticles.length - 1; i >= 0; i--) {
    let p = burstParticles[i];
    p.x += p.vx; p.y += p.vy; p.alpha -= 5; p.size *= 0.96;
    noStroke(); p.color.setAlpha(p.alpha); fill(p.color);
    ellipse(p.x, p.y, p.size);
    if (p.alpha <= 0) burstParticles.splice(i, 1);
  }
}

// ==========================================
// ✋ 卡牌部分手勢邏輯 (完全保留原版不更改)
// ==========================================
function handleHandGesture() {
  if (state === "select") return;
  if (predictions.length === 0) return;

  let lm = predictions[0].landmarks;
  let fist = isFist(lm);

  if (state === "spinWait") {
    if (!fist) {
      playTarotSound(440, 0.1); state = "play"; isAutoSpin = true; 
    }
  } 
  else if (state === "play") {
    let x = 220 - lm[8][0]; 
    if (!fist && hold === 0) { 
      if (frameCount % 5 === 0) { 
        if (x < 75) { 
          index = (index - 1 + cards.length) % cards.length; playTarotSound(350, 0.03);
        } else if (x > 145) { 
          index = (index + 1) % cards.length; playTarotSound(380, 0.03);
        }
      }
    }
    if (fist) {
      hold++;
      if (hold > 45) { 
        predictions = []; state = "select"; isAutoSpin = false; triggerBurst(); playTarotSound(600, 0.4); 
      }
    } else { hold = max(0, hold - 3); }
  }
}

function drawTarotFan() {
  push(); translate(width / 2, height / 2 + 320); 
  let totalCards = cards.length;
  let startAngle = -75 * spreadProgress;
  let endAngle = 75 * spreadProgress;
  let angleStep = (totalCards > 1) ? (endAngle - startAngle) / (totalCards - 1) : 0;
  let hoverY = sin(cardFloatAngle) * 8;

  for (let i = 0; i < totalCards; i++) {
    push();
    let currentAngle = startAngle + i * angleStep; rotate(currentAngle);
    let radius = -440; 
    
    if (state === "spinWait") {
      radius = -250 + sin(cardFloatAngle * 0.8) * 6;
      rectMode(CENTER); fill(25, 25, 55); stroke(255, 215, 0); strokeWeight(2.5);
      rect(0, radius, 130, 210, 10); pop(); continue; 
    }
    if (i === index && state === "play") {
      radius -= (50 + hoverY); rectMode(CENTER); fill(0, 191, 255, sin(frameCount * 8) * 15 + 20); noStroke(); rect(0, radius, 95, 155, 10);
    }
    rectMode(CENTER); fill(18, 18, 40);
    if (i === index && state === "play") { stroke(255, 215, 0); strokeWeight(2.5); } 
    else { stroke(255, 255, 255, 60); strokeWeight(1); }
    rect(0, radius, 80, 140, 8); pop();
  }
  pop();
}

// ==========================================
// 🖥️ UI 介面
// ==========================================
function drawStartScreen() {
  rectMode(CENTER); fill(12, 12, 28, 240); stroke(138, 43, 226); strokeWeight(3);
  rect(width / 2, height / 2, 520, 420, 20);
  noStroke(); textAlign(CENTER, CENTER); fill(255, 215, 0); textSize(32); text("命運塔羅占卜", width / 2, height / 2 - 140);
  fill(180); textSize(14); text("【玩法】左右擺動手掌切換卡牌，握拳蓄力完成選牌。", width / 2, height / 2 - 80);
  drawLobbyButton(width / 2, height / 2 + 30, "開始占卜", color(138, 43, 226));
  drawLobbyButton(width / 2, height / 2 + 130, "返回選單", color(50, 50, 60));
}

function drawSpinWaitScreen() {
  fill(255); textAlign(CENTER, CENTER); textSize(22); fill(0, 255, 255);
  text("🔮 請面向鏡頭「先握拳再張開」展開占卜陣列", width / 2, height / 2 - 160);
  drawLobbyButton(100, height - 40, "⬅ 返回選單大廳", color(40, 40, 50));
}

function drawPlayUI() {
  drawLobbyButton(100, height - 40, "⬅ 返回選單大廳", color(40, 40, 50));
  if (hold > 0) {
    push(); translate(width / 2, height / 2 - 160); noFill();
    stroke(255, 255, 255, 30); strokeWeight(6); ellipse(0, 0, 60); 
    stroke(0, 255, 255); arc(0, 0, 60, 60, -90, map(hold, 0, 45, 0, 360) - 90); pop();
  } else {
    fill(200, 220, 255); textAlign(CENTER, CENTER); textSize(16); text("［命運抽選中］左右擺動切換 / 握拳蓄力鎖定", width / 2, height / 2 - 160);
  }
}

function drawSelectScreen() {
  push(); translate(0, sin(cardFloatAngle * 0.5) * 10); rectMode(CENTER);
  hueOffset += 0.8; let rGlow = sin(hueOffset) * 40 + 215; let gGlow = sin(hueOffset + 120) * 30 + 185;
  fill(15, 15, 32); stroke(rGlow, gGlow, 100); strokeWeight(3.5); rect(width / 2, height / 2 - 20, 290, 430, 15);
  noStroke(); fill(255, 215, 0); textAlign(CENTER, CENTER); textSize(28); text(cards[index].name, width / 2, height / 2 - 165);
  fill(240); textSize(13); textAlign(CENTER, TOP);
  let lines = cards[index].desc; for (let i = 0; i < lines.length; i++) { text(lines[i], width / 2, height / 2 - 95 + (i * 24)); }
  pop();
  drawLobbyButton(width / 2, height - 60, "重新占卜", color(138, 43, 226));
}

function isFist(lm){ return lm[8][1] > lm[6][1] && lm[12][1] > lm[10][1]; }

function playTarotSound(freq, duration) {
  if (!soundEnabled) return; 
  try {
    synth.start(); synth.freq(freq); synth.amp(0.15, 0.05);
    setTimeout(() => { synth.amp(0, 0.1); setTimeout(() => synth.stop(), 100); }, duration * 1000);
  } catch(e) {}
}

// ==========================================
// 🖱️ 滑鼠與大廳點擊控制
// ==========================================
function mousePressed() {
  if (state === "lobby") {
    // 點擊 塔羅牌
    if (mouseX > width/2 - 250 && mouseX < width/2 - 30 && mouseY > height/2 - 10 && mouseY < height/2 + 70) {
      playTarotSound(523, 0.1); state = "start";
    }
    // 點擊 連連看 (立刻發動初始化並直接開局)
    if (mouseX > width/2 + 30 && mouseX < width/2 + 250 && mouseY > height/2 - 10 && mouseY < height/2 + 70) {
      playTarotSound(587, 0.1); 
      initGame2Data();
      state = "game2";
    }
  } 
  else if (state === "start") {
    if (mouseX > width/2 - 110 && mouseX < width/2 + 110 && mouseY > height/2 - 10 && mouseY < height/2 + 70) { state = "spinWait"; }
    if (mouseX > width/2 - 110 && mouseX < width/2 + 110 && mouseY > height/2 + 90 && mouseY < height/2 + 170) { state = "lobby"; }
  }
  else if (state === "game2") {
    // 時間到了點擊「返回選單大廳」
    if (game2Timer <= 0) {
      if (mouseX > width/2 - 110 && mouseX < width/2 + 110 && mouseY > height/2 + 75 - 40 && mouseY < height/2 + 75 + 40) {
        state = "lobby";
      }
    } else {
      // 遊戲中點擊左下角「⬅ 返回選單大廳」
      if (mouseX > 100 - 110 && mouseX < 100 + 110 && mouseY > height - 40 - 40 && mouseY < height - 40 + 40) { 
        state = "lobby"; 
      }
    }
  }
  else if (state === "spinWait" || state === "play") {
    if (mouseX > 100 - 110 && mouseX < 100 + 110 && mouseY > height - 40 - 40 && mouseY < height - 40 + 40) { state = "lobby"; }
  }
  else if (state === "select") {
    if (mouseX > width/2 - 110 && mouseX < width/2 + 110 && mouseY > height - 60 - 40 && mouseY < height - 60 + 40) { state = "start"; }
  }
}