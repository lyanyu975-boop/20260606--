let video;
let handpose;
let predictions = [];

let state = "start";
let index = 0;
let hold = 0;
let angle = 0;
let stars = [];
let trails = [];

let question = "";
let resultText = "";

/* 🎴 塔羅牌 */
const cards = [
{name:"愚者",desc:"新的開始，自由與冒險"},
{name:"魔術師",desc:"行動與創造力"},
{name:"女祭司",desc:"直覺與潛意識"},
{name:"皇后",desc:"愛與豐盛"},
{name:"皇帝",desc:"秩序與掌控"},
{name:"戀人",desc:"選擇與關係"},
{name:"戰車",desc:"意志與勝利"},
{name:"力量",desc:"勇氣與內在力量"},
{name:"隱者",desc:"內省與智慧"},
{name:"命運之輪",desc:"轉變與命運"}
];

/* 🌟 星空粒子 */
function initStars(){
for(let i=0;i<200;i++){
stars.push({
x:random(width),
y:random(height),
r:random(1,3)
});
}
}

function setup(){
createCanvas(windowWidth, windowHeight);

video = createCapture(VIDEO);
video.size(220,165);
video.hide();

handpose = ml5.handpose(video, () => {
console.log("model ready");
});

handpose.on("predict", r => predictions = r);

initStars();
}

/* ===================== */
function draw(){

background(0,20);

/* 🌌 星空背景 */
drawStars();

/* 🪄 魔法陣 */
drawMagicCircle();

/* 📷 鏡頭 */
image(video, width-240, 20, 220, 165);

/* ❗ start */
if(state === "start"){
drawStart();
return;
}

/* ❗ 無手 */
if(predictions.length === 0){
textAlign(CENTER);
fill(255);
text("請將手放入鏡頭", width/2, height/2);
return;
}

let hand = predictions[0];
let lm = hand.landmarks;

/* ✋ 光軌 */
drawTrail(lm);

/* ===================== */
/* ✋ 張手 */
/* ===================== */
if(isOpen(lm)){
state = "select";
}

/* ===================== */
/* 🎴 選牌 */
/* ===================== */
if(state === "select"){

let x = lm[8][0];

if(x < 150) index--;
if(x > 350) index++;

index = constrain(index,0,cards.length-1);

/* 🃏 卡牌（3D翻牌） */
push();
translate(width/2, height/2);
rotateY(sin(frameCount*0.02)*0.2);
fill(255);
textAlign(CENTER);
textSize(30);
text(cards[index].name, 0, 0);
pop();
}

/* ===================== */
/* ✊ 握拳 */
/* ===================== */
if(isFist(lm)){
hold++;
drawProgress(hold);

if(hold > 60){
state = "result";
generateAI(cards[index]);
}
}else{
hold = 0;
}

/* ===================== */
/* 🎴 結果 */
/* ===================== */
if(state === "result"){
drawResult();
}
}

/* ===================== */
/* 🌌 星空 */
/* ===================== */
function drawStars(){
fill(255);
noStroke();

for(let s of stars){
circle(s.x,s.y,s.r);

s.y += 0.3;
if(s.y > height){
s.y = 0;
s.x = random(width);
}
}
}

/* ===================== */
/* 🪄 魔法陣 */
/* ===================== */
function drawMagicCircle(){
push();
translate(width/2,height/2);

rotate(angle);
angle += 0.01;

noFill();
stroke(0,150,255,100);
circle(0,0,200);
circle(0,0,300);
circle(0,0,400);

pop();
}

/* ===================== */
/* ✨ start畫面 */
/* ===================== */
function drawStart(){
fill(255);
textAlign(CENTER);

textSize(32);
text("塔羅牌占卜系統", width/2, height/2 - 40);

textSize(16);
text("點擊開始進入命運空間", width/2, height/2 + 20);
}

/* ===================== */
/* ✨ 光軌 */
/* ===================== */
function drawTrail(lm){
let x = lm[8][0];
let y = lm[8][1];

trails.push({x,y});

if(trails.length > 30){
trails.shift();
}

noFill();
stroke(0,200,255);

beginShape();
for(let t of trails){
vertex(t.x,t.y);
}
endShape();
}

/* ===================== */
/* ✊ 判斷 */
/* ===================== */
function isOpen(lm){
return lm[8][1] < lm[6][1];
}

function isFist(lm){
return lm[8][1] > lm[6][1];
}

/* ===================== */
/* 🔵 進度條 */
/* ===================== */
function drawProgress(v){
stroke(0,200,255);
noFill();
circle(width/2,height/2,100 + v);
}

/* ===================== */
/* 🎴 AI解牌（內建版） */
/* ===================== */
function generateAI(card){
resultText =
"你的能量正在與「" + card.name + "」共振。\n\n" +
card.desc + "\n\n" +
"這代表你目前正處於轉變階段，請相信直覺。";
}

/* ===================== */
/* 🎴 結果畫面 */
/* ===================== */
function drawResult(){
fill(255);
textAlign(CENTER);

textSize(30);
text(cards[index].name, width/2, height/2 - 40);

textSize(16);
text(resultText, width/2, height/2);
}