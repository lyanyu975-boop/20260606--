let video;
let handpose;
let predictions = [];

let state = "lobby"; 
// 狀態：lobby, start, spinWait, play, select, game2_name, game2_intro, game2, game2_rank
let index = 0;
let hold = 0;
let spreadProgress = 0; 
let cardFloatAngle = 0;

// 🎮 遊戲二抗噪平滑變數
let game2Timer = 0;
let game2MaxTime = 1800; 
let game2Score = 0;
let pinchTargets = [];
let grabbedItem = null; 
let playerName = "";
let nameInput;
let leaderboard = [];

// 🌀 避震器與防甩落快取
let smoothCenterRx = -1;
let smoothCenterRy = -1;
let unpinchFrames = 0; // 防誤放緩衝計算

// ✨ 華麗特效
let starsFar = [];
let starsNear = [];
let burstParticles = [];
let magicAngle1 = 0;
let magicAngle2 = 0;

// 🎵 音效
let synth;
let soundEnabled = false; 

// 🔮 22張大阿爾克那塔羅牌
const cards = [
  { name: "愚者", desc: ["新的開始、冒險與未知旅程。", "勇敢踏出第一步，", "", "不要過度擔心結果，", "", "新的機會正在等待你。"] },
  { name: "魔術師", desc: ["創造力與萬事俱備的起點。", "你已擁有足夠的資源，", "", "發揮你的行動力與技巧，", "", "現在是展現才華的時刻。"] },
  { name: "女祭司", desc: ["直覺、潛意識與內在智慧。", "暫時停下外在的追尋，", "", "保持靜心與沉穩，", "", "你的直覺會帶領你找到答案。"] },
  { name: "皇后", desc: ["豐盛、孕育與溫慢的愛。", "物質與情感正迎來豐收，", "", "大膽享受大自然的恩賜，", "", "生活將充滿喜悅與感性。"] },
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
  { name: "世界", desc: ["圓滿大結束、旅程結束與完美。", "一個重要的生命週期已達成，", "", "情感與目標皆獲得圓滿，", "", "準備好迎接更高層次的冒險。"] }
];

function setup(){
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  // 📷 初始化視訊
  video = createCapture(VIDEO);
  video.size(220, 160);
  video.hide(); 

  // 🤖 載入 Handpose
  handpose = ml5.handpose(video, () => console.log("AI Ready"));
  handpose.on("predict", results => {
    if (state === "select") { predictions = []; return; }
    predictions = results;
  });

  // ✨ 名稱輸入框初始化
  nameInput = createInput('');
  nameInput.size(200, 30);
  nameInput.style('font-size', '18px');
  nameInput.style('text-align', 'center');
  nameInput.hide();

  // 🌌 星空背景數據生成
  for(let i = 0; i < 60; i++) {
    starsFar.push({ x: random(width), y: random(height), size: random(1, 2), speed: random(0.1, 0.4) });
  }
  for(let i = 0; i < 30; i++) {
    starsNear.push({ x: random(width), y: random(height), size: random(2.5, 4), speed: random(0.5, 1) });
  }

  if (typeof p5.Oscillator !== 'undefined') { synth = new p5.Oscillator('sine'); soundEnabled = true; }
}

function draw(){
  // 🎬 底層視訊鏡像
  if (state === "game2") {
    push(); translate(width, 0); scale(-1, 1); image(video, 0, 0, width, height); pop();
    background(8, 8, 24, 160); 
  } else {
    background(8, 8, 20, 45); 
  }

  // 斷手時重置濾波器快取
  if (predictions.length === 0) {
    smoothCenterRx = -1;
    smoothCenterRy = -1;
  }

  drawStarfield(predictions.length > 0 ? (220 - predictions[0].landmarks[8][0] - 110) : 0);
  drawLuxuryMagicCircle();
  updateBurstParticles();

  // 🤖 手勢骨架與中心點映射
  let tX = 0, tY = 0, iX = 0, iY = 0, midX = 0, midY = 0; 
  let hasHand = false, isPinching = false;

  if (predictions.length > 0) {
    hasHand = true;
    let lm = predictions[0].landmarks;
    
    // 🎛️ 雙重動態捏合閥值 (未抓取時嚴格，抓取後放寬抗噪)
    let rawDist = dist(lm[4][0], lm[4][1], lm[8][0], lm[8][1]);
    let currentPinchThresh = (grabbedItem !== null) ? 46 : 31; 
    if (rawDist < currentPinchThresh) isPinching = true;

    let pThumb = getHandCoords(lm[4], state);
    let pIndex = getHandCoords(lm[8], state);
    tX = pThumb.x; tY = pThumb.y; iX = pIndex.x; iY = pIndex.y;
    midX = (tX + iX) / 2; midY = (tY + iY) / 2;

    drawHandSkeleton(lm, state);
    drawPinchPointsUI(tX, tY, iX, iY, midX, midY, isPinching, state);
  }

  // 🎛️ 狀態機切換
  if (state === "lobby") drawLobby();
  else if (state === "start") drawStartScreen();
  else if (state === "game2_name") drawNameInputScreen();
  else if (state === "game2_intro") drawGame2Intro();
  else if (state === "game2") runGame2Logic(midX, midY, hasHand, isPinching);
  else if (state === "game2_rank") drawLeaderboard();
  else {
    handleHandGesture(); cardFloatAngle += 2.5;
    if (state === "spinWait") { spreadProgress = lerp(spreadProgress, 0, 0.1); drawTarotFan(); drawSpinWaitScreen(); }
    else if (state === "play") { spreadProgress = lerp(spreadProgress, 1, 0.08); drawTarotFan(); drawPlayUI(); }
    else if (state === "select") drawSelectScreen(); 
  }

  // 📷 右上小視訊
  if (state !== "game2" && state !== "lobby" && state !== "game2_name") {
    push(); translate(width - 20, 20); scale(-1, 1); image(video, -220, 0, 220, 160); pop();
  }
}

// 🔀 避震座標映射器 (抗噪核心)
function getHandCoords(pt, currentMode) {
  let rx = 220 - pt[0], ry = pt[1];
  if (currentMode === "game2") {
    let lm = predictions[0].landmarks;
    let sumRx = 0, sumRy = 0;
    for (let i = 0; i < lm.length; i++) { sumRx += (220 - lm[i][0]); sumRy += lm[i][1]; }
    let avgRx = sumRx / 21;
    let avgRy = sumRy / 21;
    
    // 🚀 核心避震：使用 lerp 讓整隻手的中心移動變得極度平滑
    if (smoothCenterRx === -1) {
      smoothCenterRx = avgRx;
      smoothCenterRy = avgRy;
    } else {
      smoothCenterRx = lerp(smoothCenterRx, avgRx, 0.16); 
      smoothCenterRy = lerp(smoothCenterRy, avgRy, 0.16);
    }
    
    let screenCenterX = map(smoothCenterRx, 45, 175, 0, width, true);
    let screenCenterY = map(smoothCenterRy, 35, 125, 0, height, true);
    
    // 局部手指微幅抖動不進行大映射放大，消除顫抖
    return { x: screenCenterX + (rx - avgRx) * 1.3, y: screenCenterY + (ry - avgRy) * 1.3 };
  } else {
    return { x: (width - 240) + map(rx, 0, 220, 0, 220), y: 20 + map(ry, 0, 160, 0, 160) };
  }
}

// 🦴 骨架渲染器 (微縮卡牌版)
function drawHandSkeleton(lm, currentMode) {
  stroke(0, 255, 255, 160); strokeWeight(currentMode === "game2" ? 1.0 : 0.6);
  let fingers = [[0,1,2,3,4],[0,5,6,7,8],[0,9,10,11,12],[0,13,14,15,16],[0,17,18,19,20],[5,9,13,17]];
  for (let f of fingers) {
    for (let i = 0; i < f.length - 1; i++) {
      let p1 = getHandCoords(lm[f[i]], currentMode), p2 = getHandCoords(lm[f[i+1]], currentMode);
      line(p1.x, p1.y, p2.x, p2.y);
    }
  }
  noStroke(); fill(0, 255, 255, 220);
  for (let i = 0; i < lm.length; i++) {
    let pt = getHandCoords(lm[i], currentMode);
    ellipse(pt.x, pt.y, currentMode === "game2" ? 3.5 : 1.5);
  }
}

function drawPinchPointsUI(tX, tY, iX, iY, midX, midY, isPinching, currentMode) {
  if (currentMode !== "game2") return;
  push(); noStroke(); fill(255, 255, 255, 240);
  ellipse(tX, tY, 4); ellipse(iX, iY, 4); 
  if (isPinching) {
    fill(255, 215, 0, 200); stroke(255, 215, 0); strokeWeight(1.2);
    ellipse(midX, midY, 14 + sin(frameCount * 15) * 2);
  } else {
    fill(0, 255, 255, 40); stroke(0, 255, 255, 150); strokeWeight(0.8);
    ellipse(midX, midY, 6);
  }
  pop();
}

// 🏛️ 選單與輸入畫面
function drawLobby() {
  rectMode(CENTER); fill(12, 12, 28, 220); stroke(255, 215, 0, 120); strokeWeight(2);
  rect(width / 2, height / 2, 620, 400, 15);
  noStroke(); textAlign(CENTER, CENTER); fill(255, 215, 0); textSize(38); text("手勢互動遊戲網", width / 2, height / 2 - 130);
  fill(180, 200, 255); textSize(16); text("點擊下方進入手勢魔法空間", width / 2, height / 2 - 80);
  drawLobbyButton(width / 2 - 140, height / 2 + 30, "🔮 命運塔羅占卜", color(75, 0, 130));
  drawLobbyButton(width / 2 + 140, height / 2 + 30, "🤏 雙指捏捏連連看", color(25, 25, 112));
}

function drawNameInputScreen() {
  rectMode(CENTER); fill(12, 12, 28, 230); stroke(0, 255, 255);
  rect(width/2, height/2, 500, 300, 15);
  fill(255, 215, 0); textSize(28); textAlign(CENTER, CENTER); text("輸入您的魔法稱號", width/2, height/2 - 80);
  nameInput.position(width/2 - 100, height/2 - 15);
  nameInput.show();
  drawLobbyButton(width/2, height/2 + 80, "登錄代號", color(0, 128, 128));
}

function drawGame2Intro() {
  rectMode(CENTER); fill(12, 12, 28, 240); stroke(0, 255, 255);
  rect(width/2, height/2, 580, 420, 15);
  fill(255, 215, 0); textSize(30); textAlign(CENTER, CENTER); text("手勢說明書", width/2, height/2 - 140);
  textAlign(LEFT, CENTER); fill(200, 220, 255); textSize(16);
  let tx = width/2 - 220;
  text("1. 伸出大拇指與食指，靠近即為『捏起』。", tx, height/2 - 60);
  text("2. 捏起時中心圈會由青轉金，即可拖曳方塊。", tx, height/2 - 20);
  text("3. 將相同符號的方塊重疊，即可消除得分。", tx, height/2 + 20);
  text("4. 您的代號：" + playerName, tx, height/2 + 60);
  drawLobbyButton(width/2, height/2 + 140, "開始儀式", color(138, 43, 226));
}

// 🤏 連連看核心 (防疊加與多圈圈)
function initGame2Data() {
  game2Score = 0; game2Timer = game2MaxTime; pinchTargets = []; grabbedItem = null; unpinchFrames = 0;
  let symbols = ["☀️", "🌙", "⭐", "🪐", "🌀", "🔮", "💎", "🧿"]; 
  for (let sym of symbols) {
    for (let j = 0; j < 2; j++) {
      let attempts = 0, rx, ry, overlapping;
      do {
        overlapping = false;
        rx = random(150, width - 200); ry = random(150, height - 150);
        for (let t of pinchTargets) if (dist(rx, ry, t.x, t.y) < 95) overlapping = true;
        attempts++;
      } while (overlapping && attempts < 150);
      pinchTargets.push({ id: random(100000), x: rx, y: ry, icon: sym, size: 65, isMatched: false });
    }
  }
}

// 🛡️ 核心防斷開、防誤落邏輯
function runGame2Logic(mX, mY, hasHand, isPinching) {
  if (game2Timer > 0) game2Timer--;
  
  if (hasHand) {
    if (isPinching) {
      unpinchFrames = 0; // 一旦偵測到捏合，立刻清除斷開計數器
      if (!grabbedItem) {
        // 磁吸範圍擴大至 68，讓抓取極為靈敏輕鬆
        for (let t of pinchTargets) {
          if (!t.isMatched && dist(mX, mY, t.x, t.y) < 68) { 
            grabbedItem = t; 
            break; 
          }
        }
      } else {
        grabbedItem.x = mX; grabbedItem.y = mY;
      }
    } else {
      // 🛡️ 關鍵防抖機制：當 AI 瞬間誤判斷開時，啟用 5 影格的緩衝盾牌
      if (grabbedItem) {
        unpinchFrames++;
        if (unpinchFrames >= 5) { // 必須連續 5 格都沒捏住（約0.15秒），才會真正執行放下/判定
          for (let t of pinchTargets) {
            if (t.id !== grabbedItem.id && !t.isMatched && t.icon === grabbedItem.icon && dist(grabbedItem.x, grabbedItem.y, t.x, t.y) < 70) {
              t.isMatched = grabbedItem.isMatched = true; 
              game2Score += 20; 
              triggerGame2Burst(t.x, t.y); 
              playTarotSound(600, 0.1); 
              break;
            }
          }
          grabbedItem = null;
          unpinchFrames = 0;
        } else {
          // 在緩衝期內，物件依舊吸附在手心跟著走，不會因為路過其他物件而掉落！
          grabbedItem.x = mX; grabbedItem.y = mY;
        }
      }
    }
  } else {
    unpinchFrames = 0; // 移出鏡頭則直接不計算
  }

  let active = 0;
  for (let t of pinchTargets) {
    if (t.isMatched) continue; active++;
    push(); rectMode(CENTER); fill(25, 25, 50, 190); stroke(grabbedItem==t ? color(255, 215, 0) : color(0, 255, 255, 150));
    rect(t.x, t.y, t.size, t.size, 10); noStroke(); fill(255); textAlign(CENTER, CENTER); textSize(26); text(t.icon, t.x, t.y); pop();
  }
  if (active === 0) initGame2Data();
  fill(0, 255, 255); textSize(24); textAlign(LEFT, TOP); text("魔法師: " + playerName + "  得分: " + game2Score, 40, 40);
  textAlign(RIGHT, TOP); text("⏳ " + ceil(game2Timer/60) + "s", width - 40, 40);
  if (game2Timer <= 0) {
    leaderboard.push({ name: playerName, score: game2Score });
    leaderboard.sort((a,b) => b.score - a.score);
    state = "game2_rank";
  }
}

function drawLeaderboard() {
  rectMode(CENTER); fill(12, 12, 28, 240); stroke(255, 215, 0);
  rect(width/2, height/2, 450, 500, 15);
  fill(255, 215, 0); textSize(32); textAlign(CENTER, CENTER); text("星空排行榜", width/2, height/2 - 180);
  textSize(20); fill(255); textAlign(CENTER, CENTER);
  for (let i=0; i < min(leaderboard.length, 5); i++) {
    text((i+1) + ". " + leaderboard[i].name + " : " + leaderboard[i].score, width/2, height/2 - 100 + i*40);
  }
  drawLobbyButton(width/2, height/2 + 180, "返回大廳", color(75, 0, 130));
}

// 🎨 其他組件 (星空、按鈕、卡牌背面)
function drawLobbyButton(x, y, label, c) {
  push(); rectMode(CENTER); fill(dist(mouseX, mouseY, x, y) < 80 ? color(red(c)+40, green(c)+40, blue(c)+40) : c);
  stroke(255); rect(x, y, 220, 60, 10); noStroke(); fill(255); textSize(18); textAlign(CENTER, CENTER); text(label, x, y); pop();
}

function drawCardBack(w, h) {
  push(); fill(16, 24, 48); stroke(230, 185, 60); strokeWeight(2); rect(0, 0, w, h, 10);
  noFill(); stroke(230, 185, 60, 100); rect(0, 0, w-10, h-10, 8);
  ellipse(0, 0, w*0.4); fill(230, 185, 60, 150); ellipse(0,0, w*0.1); pop();
}

function drawStarfield(hX) {
  starsFar.forEach(s => { noStroke(); fill(255, 150); ellipse(s.x + hX*0.1, s.y, s.size); s.y = (s.y+s.speed)%height; });
  starsNear.forEach(s => { noStroke(); fill(135, 206, 250, 200); ellipse(s.x + hX*0.3, s.y, s.size); s.y = (s.y+s.speed)%height; });
}

function drawLuxuryMagicCircle() {
  push(); translate(width/2, state==="game2"?height/2:height/2+320);
  magicAngle1 += 0.2; rotate(magicAngle1); noFill(); stroke(100,160,255,30); ellipse(0,0,720); ellipse(0,0,680); pop();
}

// ✋ 塔羅專用手勢
function handleHandGesture() {
  if (state === "select" || predictions.length === 0) return;
  let lm = predictions[0].landmarks;
  let fist = lm[8][1] > lm[6][1] && lm[12][1] > lm[10][1];
  if (state === "spinWait" && !fist) state = "play";
  else if (state === "play") {
    let rx = 220 - lm[8][0];
    if (!fist && hold === 0 && frameCount % 5 === 0) {
      if (rx < 75) index = (index - 1 + cards.length) % cards.length;
      else if (rx > 145) index = (index + 1) % cards.length;
    }
    if (fist) { if (++hold > 45) { predictions = []; state = "select"; triggerBurst(width/2, height/2); } }
    else hold = max(0, hold - 3);
  }
}

function drawTarotFan() {
  push(); translate(width/2, height/2+320);
  let startA = -75 * spreadProgress, endA = 75 * spreadProgress;
  for (let i = 0; i < cards.length; i++) {
    push(); rotate(startA + i * (endA - startA) / (cards.length - 1));
    let r = i===index && state==="play" ? -490-sin(cardFloatAngle)*8 : -440;
    if (state === "spinWait") { translate(0, -250+sin(cardFloatAngle)*6); drawCardBack(130, 210); }
    else { translate(0, r); drawCardBack(80, 140); }
    pop();
  } pop();
}

// 🏢 UI 畫面
function drawStartScreen() {
  rectMode(CENTER); fill(12, 12, 28, 240); stroke(138, 43, 226); rect(width/2, height/2, 520, 420, 20);
  noStroke(); fill(255, 215, 0); textSize(32); textAlign(CENTER, CENTER); text("命運塔羅占卜", width/2, height/2 - 140);
  drawLobbyButton(width/2, height/2 + 30, "開始占卜", color(138, 43, 226));
  drawLobbyButton(width/2, height/2 + 130, "返回大廳", color(50, 50, 60));
}

function drawSpinWaitScreen() { fill(0, 255, 255); textSize(22); textAlign(CENTER, CENTER); text("🔮 請先握拳再張開展開陣列", width/2, height/2 - 160); }
function drawPlayUI() { 
  if (hold > 0) { push(); translate(width/2, height/2-160); noFill(); stroke(0,255,255); arc(0,0,60,60,-90,map(hold,0,45,0,360)-90); pop(); }
  else { fill(200, 220, 255); textAlign(CENTER, CENTER); text("左右擺動切換 / 握拳鎖定", width/2, height/2-160); }
}
function drawSelectScreen() {
  push(); translate(width/2, height/2+sin(cardFloatAngle*0.5)*10); rectMode(CENTER);
  fill(15, 15, 32); stroke(255, 215, 0); rect(0, -20, 290, 430, 15);
  fill(255, 215, 0); textSize(28); textAlign(CENTER, CENTER); text(cards[index].name, 0, -165);
  fill(240); textSize(13); textAlign(CENTER, TOP); let lines = cards[index].desc;
  for (let i = 0; i < lines.length; i++) text(lines[i], 0, -95 + (i * 24));
  pop(); drawLobbyButton(width/2, height - 60, "重新儀式", color(138, 43, 226));
}

function triggerGame2Burst(x, y) { for(let i=0; i<20; i++) burstParticles.push({ x, y, vx: cos(random(360))*5, vy: sin(random(360))*5, size: random(4,7), alpha: 255, color: color(255,215,0) }); }
function triggerBurst(x, y) { for(let i=0; i<40; i++) burstParticles.push({ x, y, vx: cos(random(360))*random(3,8), vy: sin(random(360))*random(3,8), size: random(4,8), alpha: 255, color: color(0,255,255) }); }
function updateBurstParticles() { for (let i = burstParticles.length - 1; i >= 0; i--) { let p = burstParticles[i]; p.x += p.vx; p.y += p.vy; p.alpha -= 5; noStroke(); p.color.setAlpha(p.alpha); fill(p.color); ellipse(p.x, p.y, p.size); if (p.alpha <= 0) burstParticles.splice(i, 1); } }
function playTarotSound(f, d) { if (!soundEnabled) return; synth.start(); synth.freq(f); synth.amp(0.1, 0.1); setTimeout(() => synth.stop(), d*1000); }

// 🖱️ 滑鼠判定
function mousePressed() {
  if (state === "lobby") {
    if (mouseX > width/2 - 250 && mouseX < width/2 - 30 && mouseY > height/2 && mouseY < height/2 + 60) { state = "start"; }
    if (mouseX > width/2 + 30 && mouseX < width/2 + 250 && mouseY > height/2 && mouseY < height/2 + 60) { state = "game2_name"; }
  } 
  else if (state === "game2_name") {
    if (mouseX > width/2 - 110 && mouseX < width/2 + 110 && mouseY > height/2 + 50 && mouseY < height/2 + 110) {
      playerName = nameInput.value().trim() || "未知法師";
      nameInput.hide(); state = "game2_intro";
    }
  } 
  else if (state === "game2_intro") {
    if (mouseX > width/2 - 110 && mouseX < width/2 + 110 && mouseY > height/2 + 110 && mouseY < height/2 + 170) { initGame2Data(); state = "game2"; }
  } 
  else if (state === "start") {
    if (mouseX > width/2 - 110 && mouseX < width/2 + 110 && mouseY > height/2 && mouseY < height/2 + 60) { state = "spinWait"; }
    if (mouseX > width/2 - 110 && mouseX < width/2 + 110 && mouseY > height/2 + 100 && mouseY < height/2 + 160) { state = "lobby"; }
  } 
  else if (state === "game2_rank") {
    if (mouseX > width/2 - 110 && mouseX < width/2 + 110 && mouseY > height/2 + 150 && mouseY < height/2 + 210) { state = "lobby"; }
  }
  else if (state === "select") {
    if (mouseX > width/2 - 110 && mouseX < width/2 + 110 && mouseY > height - 90 && mouseY < height - 30) { state = "start"; }
  }
}