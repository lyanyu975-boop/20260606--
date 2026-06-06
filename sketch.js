let video;
let handpose;
let predictions = [];

let index = 0;
let state = "play";

const cards = [
{name:"愚者",desc:"新的開始與自由"},
{name:"魔術師",desc:"創造與行動力"},
{name:"女祭司",desc:"直覺與智慧"},
{name:"皇后",desc:"愛與豐盛"},
{name:"皇帝",desc:"秩序與權力"},
{name:"戀人",desc:"選擇與關係"},
{name:"戰車",desc:"意志與勝利"},
{name:"力量",desc:"勇氣與內在力量"}
];

function setup(){

createCanvas(windowWidth, windowHeight);

// 📷 攝影機
video = createCapture(VIDEO);
video.size(220,160);
video.hide();

// 🖐️ 手勢模型
handpose = ml5.handpose(video, () => {
console.log("model ready");
});

handpose.on("predict", r => predictions = r);
}

function draw(){

background(0);

// =====================
// 📷 右上角鏡頭（穩定）
// =====================
image(video, width - 240, 20, 220, 160);

// =====================
// 🃏 卡牌（保證一定會看到）
// =====================
fill(255);
textAlign(CENTER);

// 卡牌框
stroke(255);
noFill();
rect(width/2 - 80, height/2 - 120, 160, 220, 10);

// 卡牌內容
noStroke();
textSize(26);
text(cards[index].name, width/2, height/2 - 10);

textSize(16);
text(cards[index].desc, width/2, height/2 + 40);

// =====================
// ❗ 沒手也能操作（避免黑畫面）
// =====================
if(predictions.length == 0){

textSize(14);
fill(200);
text("請將手放入鏡頭", width/2, height - 80);

return;
}

let lm = predictions[0].landmarks;

// 👉 食指
let x = lm[8][0];

// =====================
// 👉 左右選牌
// =====================
if(x < 150) index--;
if(x > 350) index++;

index = constrain(index,0,cards.length-1);

// =====================
// ✊ 握拳（簡化穩定版）
// =====================
if(isFist(lm)){
text("確認中...", width/2, height - 50);
}
}

// =====================
// 🖐️ 手勢（穩定簡化版）
// =====================
function isFist(lm){
return lm[8][1] > lm[6][1] &&
lm[12][1] > lm[10][1];
}