let video;
let handpose;
let predictions = [];

let state = "start";
let index = 0;
let hold = 0;

const cards = [
{name:"愚者",desc:"新的開始與自由"},
{name:"魔術師",desc:"創造與行動力"},
{name:"女祭司",desc:"直覺與智慧"},
{name:"皇后",desc:"愛與豐盛"},
{name:"皇帝",desc:"秩序與權力"},
{name:"戀人",desc:"選擇與關係"},
{name:"戰車",desc:"意志與勝利"},
{name:"力量",desc:"勇氣與內在力量"},
{name:"隱者",desc:"內省與思考"},
{name:"命運之輪",desc:"轉變與機會"},
{name:"正義",desc:"公平與平衡"},
{name:"吊人",desc:"等待與犧牲"},
{name:"死神",desc:"結束與重生"},
{name:"節制",desc:"平衡與調和"},
{name:"惡魔",desc:"慾望與束縛"},
{name:"高塔",desc:"崩壞與覺醒"},
{name:"星星",desc:"希望與療癒"},
{name:"月亮",desc:"迷惘與潛意識"},
{name:"太陽",desc:"成功與喜悅"},
{name:"審判",desc:"覺醒與重生"},
{name:"世界",desc:"完成與圓滿"}
];

function setup(){
createCanvas(windowWidth, windowHeight);

// 📷 攝影機
video = createCapture(VIDEO);
video.size(220,165);
video.hide();

// 🖐️ 手勢模型
handpose = ml5.handpose(video, () => {
console.log("手勢模型載入完成");
});

handpose.on("predict", results => {
predictions = results;
});
}

function draw(){

background(0);

// =====================
// 📌 右上角攝影機
// =====================
image(video, width - 230, 10, 220, 165);

// =====================
// ❗ 沒偵測到手
// =====================
if(predictions.length === 0){
textAlign(CENTER);
fill(255);
textSize(20);

if(state === "start"){
text("請點擊畫面開始占卜", width/2, height/2);
} else {
text("請將手放入鏡頭", width/2, height/2);
}

return;
}

let hand = predictions[0];
let lm = hand.landmarks;

// 👉 食指座標
let x = lm[8][0];

// =====================
// 🟣 START 畫面
// =====================
if(state === "start"){

fill(255);
textAlign(CENTER);

textSize(28);
text("塔羅牌占卜系統", width/2, height/2 - 60);

textSize(16);
text("請將手放入鏡頭", width/2, height/2 - 20);

textSize(18);
text("👉 點擊畫面開始", width/2, height/2 + 40);

return;
}

// =====================
// ✋ 張手 → 進入選牌
// =====================
if(isOpen(lm)){
state = "select";
}

// =====================
// 🎴 選牌
// =====================
if(state === "select"){

textAlign(CENTER);
fill(255);

textSize(22);
text("左右移動選擇塔羅牌", width/2, height/2 - 80);

if(x < 150) index--;
if(x > 350) index++;

index = constrain(index, 0, cards.length - 1);

textSize(30);
text(cards[index].name, width/2, height/2);
}

// =====================
// ✊ 握拳 → 計數
// =====================
if(isFist(lm)){
hold++;

textSize(16);
text("確認中 " + hold, width/2, height/2 + 60);

if(hold > 60){
state = "result";
}
}else{
hold = 0;
}

// =====================
// 🎴 結果畫面
// =====================
if(state === "result"){

fill(255);
textAlign(CENTER);

textSize(32);
text(cards[index].name, width/2, height/2 - 20);

textSize(18);
text(cards[index].desc, width/2, height/2 + 20);

textSize(14);
text("點擊畫面重新開始", width/2, height/2 + 80);
}
}

// =====================
// 🖐️ 手勢判斷
// =====================
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

// =====================
// 🖱️ 滑鼠控制（關鍵修復）
// =====================
function mousePressed(){

// 👉 start → select
if(state === "start"){
state = "select";
}

// 👉 result → restart
else if(state === "result"){
state = "start";
index = 0;
hold = 0;
}
}