let video;
let handpose;
let predictions = [];

let index = 0;
let hold = 0;
let state = "play";

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
{name:"命運之輪",desc:"轉變與機會"}
];

function setup(){
createCanvas(windowWidth, windowHeight);

// 📷 camera
video = createCapture(VIDEO);
video.size(220,160);
video.hide();

// 🤖 ml5 handpose（官方方式）
handpose = ml5.handpose(video, () => {
console.log("model ready");
});

handpose.on("predict", results => {
predictions = results;
});
}

function draw(){

background(0);

// 🌟 卡牌永遠存在（重點修復）
drawCard();

// 📷 camera
image(video, width-240, 20, 220, 160);

// =====================
// ❗ 沒手 → 自動動畫（避免卡死）
// =====================
if(predictions.length === 0){

fill(255);
textAlign(CENTER);
text("請將手放入鏡頭（或等待模型載入）", width/2, height/2);

autoMode(); // ⭐關鍵

return;
}

let lm = predictions[0].landmarks;

// =====================
// ✋ 手勢控制（簡化穩定版）
// =====================
let x = lm[8][0];

// 👉 左右選牌
if(x < 150) index--;
if(x > 350) index++;

index = constrain(index,0,cards.length-1);

// ✊ 握拳（簡化判斷）
if(isFist(lm)){
hold++;

if(hold > 40){
state = "select";
}
}else{
hold = 0;
}

// UI
fill(255);
textAlign(CENTER);
textSize(14);
text("手勢模式中", width/2, height - 30);
}

// =====================
// 🃏 卡牌
// =====================
function drawCard(){

fill(20);
stroke(255);
rect(width/2-80,height/2-120,160,240,10);

noStroke();
fill(255);
textAlign(CENTER);

textSize(22);
text(cards[index].name,width/2,height/2-10);

textSize(14);
text(cards[index].desc,width/2,height/2+30);
}

// =====================
// 🤖 沒手自動動
// =====================
function autoMode(){

if(frameCount % 60 === 0){
index = (index + 1) % cards.length;
}
}

// =====================
// 🖐️ 手勢（ml5簡化穩定版）
// =====================
function isFist(lm){

return lm[8][1] > lm[6][1] &&
lm[12][1] > lm[10][1];
}