let video;
let handpose;
let predictions = [];

let state = "lobby"; // lobby, start, spinWait, play, select, game2
let index = 0;
let hold = 0;
let spreadProgress = 0; 
let cardFloatAngle = 0;

// 🎮 遊戲二：雙指捏捏連連看 變數
let game2Timer = 0;
let game2Score = 0;
let game2MaxTime = 1800; // 30秒 (60幀/秒)
let pinchTargets = [];
let grabbedItem = null; // 當前抓取的物件

// 特效變數
let starsFar = [];
let starsNear = [];
let burstParticles = [];
let magicAngle1 = 0;
let magicAngle2 = 0;
let hueOffset = 0;

// 音效與原版相容變數
let synth;
let soundEnabled = false; 
let isAutoSpin = false; 

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
  { name: "正義", desc: ["公平、誠實與理性的因果決策。", "請用客觀平衡的角度審視),", "", "做出誠實、不偏頗的決定，", "", "付出什麼將收穫什麼。"] },
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
    if (state === "select") {
      predictions = [];
      return;
    }
    predictions = results;
  });

  // ✨ 雙層星空
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

  // 1. 紀錄手勢座標與物理位置
  let handX = 0;
  let tX = 0, tY = 0; // 大拇指 (Thumb)
  let iX = 0, iY = 0; // 食指 (Index)
  let midX = 0, midY = 0; // 雙指中心點
  let hasHand = false;
  let isPinching = false;

  if (predictions.length > 0) {
    let lm = predictions[0].landmarks;
    let rawX = 220 - lm[8][0]; 
    handX = rawX - 110; 
    
    // 映射大拇指 (lm[4]) 與食指 (lm[8]) 座標到全螢幕上
    tX = map(220 - lm[4][0], 20, 200, 0, width);
    tY = map(lm[4][1], 20, 140, 0, height);
    iX = map(220 - lm[8][0], 20, 200, 0, width);
    iY = map(lm[8][1], 20, 140, 0, height);
    
    midX = (tX + iX) / 2;
    midY = (tY + iY) / 2;
    hasHand = true;

    // 🤏 判斷捏起：當食指和大拇指距離小於 25 像素時算捏起
    if (dist(tX, tY, iX, iY) < 25) {
      isPinching = true;
    }
  }

  drawStarfield(handX);
  drawLuxuryMagicCircle();
  updateBurstParticles();

  // 2. 🎛️ 狀態機
  if (state === "lobby") {
    drawLobby();
  } else if (state === "start") {
    drawStartScreen();
  } else if (state === "game2") {
    updateAndDrawGame2(midX, midY, hasHand, isPinching);
  } else {
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

  // 3. 📷 右上角攝影機與邊框完美對位
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

  // 4. ✨ 渲染追蹤點（專屬遊戲二或通用手勢點）
  if (hasHand) {
    if (state === "game2") {
      // 渲染大拇指和食指兩個點
      noStroke();
      fill(0, 255, 255, 200);
      ellipse(tX, tY, 12); // 大拇指
      ellipse(iX, iY, 12); // 食指
      stroke(0, 255, 255, 100);
      line(tX, tY, iX, iY);

      // 🎯 核心要求：雙指捏起時，圓圈會辨識並變色
      if (isPinching) {
        fill(255, 215, 0, 150); // 捏起變「金色」
        stroke(255, 215, 0);
        strokeWeight(2);
        ellipse(midX, midY, 25);
      } else {
        fill(0, 255, 255, 60); // 未捏起為「青色半透明」
        stroke(0, 255, 255, 150);
        strokeWeight(1);
        ellipse(midX, midY, 20);
      }
    } else {
      // 其它模式單點顯示
      fill(0, 255, 255, 200);
      noStroke();
      ellipse(iX, iY, 14);
    }
  }
}

// ==========================================
// 🏛️ 模式選單大廳 (Lobby)
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
  text("請使用滑鼠點擊下方卡牌按鈕，開啟手勢魔法空間", width / 2, height / 2 - 80);

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
// 🤏 遊戲二：雙指捏捏連連看 (Pinch & Match)
// ==========================================
function initGame2() {
  game2Score = 0;
  game2Timer = game2MaxTime;
  pinchTargets = [];
  grabbedItem = null;

  // 初始化多個成對的圖標物件 (共有 6 對 = 12 個)
  let icons = ["☀️", "🌙", "⭐", "🪐", "🌀", "🔮"];
  
  for (let icon of icons) {
    // 每一種圖標產生兩個，散落在不同位置
    for (let j = 0; j < 2; j++) {
      pinchTargets.push({
        id: random(100000), // 獨一無二的身分證
        x: random(150, width - 300),
        y: random(150, height - 150),
        icon: icon,
        size: 50,
        isMatched: false
      });
    }
  }
}

function updateAndDrawGame2(mX, mY, hasHand, isPinching) {
  game2Timer--;

  // 邏輯處理：捏起 (Grab) 與釋放 (Drop)
  if (hasHand) {
    if (isPinching) {
      // 1. 如果還沒抓任何東西，嘗試去抓最近的物件
      if (grabbedItem === null) {
        for (let t of pinchTargets) {
          if (!t.isMatched && dist(mX, mY, t.x, t.y) < t.size) {
            grabbedItem = t;
            break;
          }
        }
      } else {
        // 2. 如果已經抓到了，物件就跟著雙指中心點移動
        grabbedItem.x = mX;
        grabbedItem.y = mY;
      }
    } else {
      // 3. 放開捏取時：檢查有沒有跟「相同圖標」重疊
      if (grabbedItem !== null) {
        for (let t of pinchTargets) {
          // 不能是自己本身、且不能是已被消除的、而且圖標圖案要一樣
          if (t.id !== grabbedItem.id && !t.isMatched && t.icon === grabbedItem.icon) {
            // 判斷重疊距離
            if (dist(grabbedItem.x, grabbedItem.y, t.x, t.y) < t.size + 15) {
              t.isMatched = true;
              grabbedItem.isMatched = true;
              game2Score += 20;
              triggerGame2Burst((t.x + grabbedItem.x)/2, (t.y + grabbedItem.y)/2);
              playTarotSound(580, 0.1);
              break;
            }
          }
        }
        grabbedItem = null; // 清空抓取狀態
      }
    }
  }

  // 繪製所有的連連看圖標
  let activeCount = 0;
  for (let t of pinchTargets) {
    if (t.isMatched) continue; // 被消除了就不畫
    activeCount++;

    push();
    rectMode(CENTER);
    // 繪製精美發光外底框
    if (grabbedItem && grabbedItem.id === t.id) {
      fill(255, 215, 0, 40); // 被抓住時發金光
      stroke(255, 215, 0);
      strokeWeight(2);
    } else {
      fill(30, 30, 60, 180);
      stroke(100, 150, 255, 100);
      strokeWeight(1);
    }
    rect(t.x, t.y, t.size, t.size, 8);
    
    // 繪製符號
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    text(t.icon, t.x, t.y);
    pop();
  }

  // 補位機制：如果全部被消光了，自動重新生成新的一輪
  if (activeCount === 0 && game2Timer > 0) {
    initGame2();
  }

  // UI 渲染與倒數計時
  textAlign(LEFT, TOP); fill(0, 255, 255); textSize(24);
  text("得分: " + game2Score, 40, 40);
  
  textAlign(RIGHT, TOP);
  let timeLeft = max(0, ceil(game2Timer / 60));
  text("限時倒數: " + timeLeft + "s", width - 260, 40);

  // 遊戲結束處理
  if (game2Timer <= 0) {
    rectMode(CENTER);
    fill(12, 12, 28, 240); stroke(0, 255, 255); strokeWeight(2);
    rect(width / 2, height / 2, 400, 250, 15);
    
    fill(255, 215, 0); textAlign(CENTER, CENTER); textSize(32);
    text("時間到！", width / 2, height / 2 - 40);
    fill(255); textSize(20);
    text("您的最終星空魔法得分: " + game2Score, width / 2, height / 2 + 15);
    
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
// 🌌 星空與特效系統
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
// ✋ 塔羅牌手勢核心邏輯
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

// ==========================================
// 🃏 牌組動態繪製
// ==========================================
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
  drawLobbyButton(width / 2, height - 60, "返回選單大廳", color(138, 43, 226));
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
// 🖱️ 滑鼠點擊選單大廳
// ==========================================
function mousePressed() {
  if (state === "lobby") {
    if (mouseX > width/2 - 250 && mouseX < width/2 - 30 && mouseY > height/2 - 10 && mouseY < height/2 + 70) {
      playTarotSound(523, 0.1); state = "start";
    }
    if (mouseX > width/2 + 30 && mouseX < width/2 + 250 && mouseY > height/2 - 10 && mouseY < height/2 + 70) {
      playTarotSound(587, 0.1); initGame2(); state = "game2";
    }
  } 
  else if (state === "start") {
    if (mouseX > width/2 - 110 && mouseX < width/2 + 110 && mouseY > height/2 - 10 && mouseY < height/2 + 70) { state = "spinWait"; }
    if (mouseX > width/2 - 110 && mouseX < width/2 + 110 && mouseY > height/2 + 90 && mouseY < height/2 + 170) { state = "lobby"; }
  }
  else if (state === "game2") {
    if (game2Timer <= 0) {
      if (mouseX > width/2 - 110 && mouseX < width/2 + 110 && mouseY > height/2 + 35 && mouseY < height/2 + 115) { state = "lobby"; }
    } else {
      if (mouseX > 100 - 110 && mouseX < 100 + 110 && mouseY > height - 40 - 40 && mouseY < height - 40 + 40) { state = "lobby"; }
    }
  }
  else if (state === "spinWait" || state === "play") {
    if (mouseX > 100 - 110 && mouseX < 100 + 110 && mouseY > height - 40 - 40 && mouseY < height - 40 + 40) { state = "lobby"; }
  }
  else if (state === "select") {
    if (mouseX > width/2 - 110 && mouseX < width/2 + 110 && mouseY > height - 60 - 40 && mouseY < height - 60 + 40) { state = "lobby"; }
  }
}