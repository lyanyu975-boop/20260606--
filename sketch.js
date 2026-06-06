let video;
let handpose;
let predictions = [];

let modelReady = false;
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

// 📷 camera
video = createCapture(VIDEO);
video.size(220,165);
video.hide();

// 🖐️ handpose（重點修復）
handpose = ml5.handpose(video, () => {
modelReady = true;
console.log("model ready");
});

handpose.on("predict", results => {
predictions = results;
});
}

function draw(){

background(0);

// ======================
// 📷 右上角鏡頭（永遠顯示）
// ======================
image(video, width - 230, 10, 220, 165);

// ======================
// ❗ model還沒好
// ======================
if(!modelReady){
fill(255);
textAlign(CENTER);
textSize(20);
text("模型載入中...", width/2, height/2);
return;
}

// ======================
// 🟣 START畫面（不依賴手勢）
// ======================
if(state === "start"){
fill(255);
textAlign(CENTER);

textSize(30);
text("塔羅牌占卜", width/2, height/2 - 40);

textSize(16);
text("點擊畫面開始", width/2, height/2 + 10);

return;
}

// ======================
// ❗ 沒手也能進入（修復卡死問題）
// ======================
if(predictions.length === 0){
fill(255);
textAlign(CENTER);
text("請將手放入鏡頭", width/2, height/2);
return;
}

let hand = predictions[0];
let lm = hand.landmarks;

// ======================
// ✋ 張手 → select
// ======================
if(isOpen(lm)){
state = "select";
}

// ======================
// 🎴 選牌
// ======================
if(state === "select"){

fill(255);
textAlign(CENTER);

textSize(20);
text("左右移動選牌", width/2, height/2 - 80);

let x = lm[8][0];

if(x < 150) index--;
if(x > 350) index++;

index = constrain(index, 0, cards.length-1);

textSize(32);
text(cards[index].name, width/2, height/2);
}

// ======================
// ✊ 握拳
// ======================
if(isFist(lm)){
hold++;

if(hold > 60){
state = "result";
}
}else{
hold = 0;
}

// ======================
// 🎴 結果
// ======================
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

// ======================
// 🖐️ 手勢
// ======================
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

// ======================
// 🖱️ 強制進入（關鍵修復）
// ======================
function mousePressed(){
if(state === "start"){
state = "select";
}

if(state === "result"){
state = "start";
index = 0;
hold = 0;
}
}