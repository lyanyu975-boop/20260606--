let video;
let handpose;
let predictions = [];

let state = "start";
let index = 0;
let flip = 0;
let holding = 0;

const cards = [
{name:"愚者",desc:"新的開始"},
{name:"魔術師",desc:"創造與行動"},
{name:"女祭司",desc:"直覺與內在智慧"},
{name:"皇后",desc:"愛與豐盛"},
{name:"皇帝",desc:"秩序與控制"},
{name:"戀人",desc:"選擇與關係"},
{name:"戰車",desc:"勝利與意志"},
{name:"力量",desc:"勇氣與內在力量"}
];

function setup(){
createCanvas(windowWidth, windowHeight, WEBGL);

video = createCapture(VIDEO);
video.size(220,165);
video.hide();

handpose = ml5.handpose(video, () => {
console.log("model ready");
});

handpose.on("predict", r => predictions = r);
}

function draw(){

background(0);

// 📷 右上角鏡頭（2D疊加）
resetMatrix();
image(video, width/2 + width/2 - 240, -height/2 + 20, 220, 165);
translate(-width/2, -height/2);

if(state === "start"){
drawStart();
return;
}

if(predictions.length === 0){
fill(255);
textAlign(CENTER);
text("請將手放入鏡頭", 0, 0);
return;
}

let lm = predictions[0].landmarks;
let x = lm[8][0];

// ✋ 張手
if(isOpen(lm)){
state = "select";
}

// =====================
// 🎴 3D卡牌
// =====================
push();

translate(0,0,0);

// 選牌滑動
if(state === "select"){
if(x < 150) index--;
if(x > 350) index++;
index = constrain(index,0,cards.length-1);
}

// ✨ 翻牌動畫
if(state === "flip"){
flip += 0.1;
}

rotateY(flip);

// 🃏 卡牌本體（3D平面）
fill(30,80,200);
stroke(255);
box(180,260,10);

// 🪄 卡牌文字
push();
translate(0,0,6);
fill(255);
textAlign(CENTER);
textSize(18);

if(flip < 1){
text("塔羅牌",0,0);
}else{
text(cards[index].name,0,0);
}
pop();

pop();

// ✊ 握拳
if(isFist(lm)){
holding++;

if(holding > 40){
state = "flip";
}
}else{
holding = 0;
}

// 結果
if(state === "flip" && flip > 3){
drawResult();
}
}

// =====================

function drawStart(){
fill(255);
textAlign(CENTER);
textSize(30);
text("塔羅牌占卜",0,0);
textSize(16);
text("點擊開始",0,40);
}

function drawResult(){
resetMatrix();
background(0);

fill(255);
textAlign(CENTER);

textSize(32);
text(cards[index].name,0,0);

textSize(16);
text(cards[index].desc,0,40);
}

// =====================
// 🖐️ 手勢
// =====================
function isOpen(lm){
return lm[8][1] < lm[6][1];
}

function isFist(lm){
return lm[8][1] > lm[6][1];
}