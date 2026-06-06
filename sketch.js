let video;
let handpose;
let predictions = [];

let state = "start";
let index = 0;
let hold = 0;

const cards = [
{name:"愚者",desc:"新的開始與自由"},
{name:"魔術師",desc:"創造與行動力"},
{name:"女祭司",desc:"直覺與內在智慧"},
{name:"皇后",desc:"豐盛與愛"},
{name:"皇帝",desc:"穩定與權力"},
{name:"戀人",desc:"選擇與關係"},
{name:"戰車",desc:"意志與勝利"},
{name:"力量",desc:"勇氣與控制"},
{name:"隱者",desc:"思考與內省"},
{name:"命運之輪",desc:"轉變與機會"},
{name:"正義",desc:"公平與因果"},
{name:"吊人",desc:"等待與犧牲"},
{name:"死神",desc:"結束與重生"},
{name:"節制",desc:"平衡"},
{name:"惡魔",desc:"慾望與束縛"},
{name:"高塔",desc:"崩壞與覺醒"},
{name:"星星",desc:"希望"},
{name:"月亮",desc:"迷惘"},
{name:"太陽",desc:"成功與喜悅"},
{name:"審判",desc:"覺醒"},
{name:"世界",desc:"完成與圓滿"}
];

function setup(){
createCanvas(windowWidth, windowHeight);

// 📷 鏡頭
video = createCapture(VIDEO);
video.size(220,165);
video.hide();

// 🖐️ 手勢模型
handpose = ml5.handpose(video, () => {
console.log("handpose ready");
});

handpose.on("predict", results => {
predictions = results;
});
}

function draw(){
background(0);

// 📷 右上角鏡頭（老師同款穩定）
image(video, width-230, 10, 220, 165);

// 沒手
if(predictions.length == 0){
textAlign(CENTER);
textSize(20);
text("請將手放入鏡頭", width/2, height/2);
return;
}

let hand = predictions[0];
let lm = hand.landmarks;

// 👉 食指座標
let x = lm[8][0];
let y = lm[8][1];

// =========================
// 🎮 狀態：開始
// =========================
if(state === "start"){
textAlign(CENTER);
textSize(22);
text("張開手開始占卜", width/2, height/2);
}

// =========================
// ✋ 張手 → 進入選牌
// =========================
if(isOpen(lm)){
state = "select";
text("左右移動選牌", width/2, height/2 - 100);
}

// =========================
// 👉 選牌
// =========================
if(state === "select"){

if(x < 150) index--;
if(x > 350) index++;

index = constrain(index, 0, cards.length-1);

textSize(30);
textAlign(CENTER);
text(cards[index].name, width/2, height/2);
}

// =========================
// ✊ 握拳 → 確認
// =========================
if(isFist(lm)){
hold++;

textSize(16);
text("確認中：" + hold, width/2, height/2 + 60);

if(hold > 60){
state = "result";
}
}else{
hold = 0;
}

// =========================
// 🎴 結果
// =========================
if(state === "result"){
textSize(32);
text(cards[index].name, width/2, height/2);

textSize(18);
text(cards[index].desc, width/2, height/2 + 40);
}
}

// =========================
// 🖐️ 手勢判斷（穩定版）
// =========================
function isOpen(lm){
return lm[8][1] < lm[6][1] &&
lm[12][1] < lm[10][1] &&
lm[16][1] < lm[14][1];
}

function isFist(lm){
return lm[8][1] > lm[6][1] &&
lm[12][1] > lm[10][1] &&
lm[16][1] > lm[14][1];
}