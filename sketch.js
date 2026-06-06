let video;
let handpose;
let predictions = [];

let state = "start";
let index = 0;
let hold = 0;

const cards = [
{name:"愚者",desc:"新的開始"},
{name:"魔術師",desc:"創造力"},
{name:"戀人",desc:"選擇"},
{name:"太陽",desc:"成功"}
];

function setup(){
createCanvas(windowWidth, windowHeight);

video = createCapture(VIDEO);
video.size(220,165);
video.hide();

handpose = ml5.handpose(video, modelReady);
handpose.on("predict", results => {
predictions = results;
});
}

function modelReady(){
console.log("handpose ready");
}

function draw(){

background(0);

/* 🔴 右上角影像視窗 */
image(video, width-230, 10);

fill(255);

/* 沒手 */
if(predictions.length == 0) return;

let hand = predictions[0];
let lm = hand.landmarks;

/* 👉 食指 */
let x = lm[8][0];
let y = lm[8][1];

/* ===== UI ===== */
textSize(20);
textAlign(CENTER);

/* ===== 狀態 ===== */
if(state === "start"){
text("張開手開始占卜", width/2, height/2);
}

/* 👉 開始 */
if(isOpen(lm)){
state = "select";
text("左右移動選牌", width/2, height/2-100);
}

/* 👉 左右選牌 */
if(state === "select"){

if(x < 150) index--;
if(x > 350) index++;

index = constrain(index,0,cards.length-1);

text(cards[index].name, width/2, height/2);

}

/* 👉 握拳確認 */
if(isFist(lm)){
hold++;
text("確認中 " + hold, width/2, height/2+100);

if(hold > 60){
state = "result";
}
}else{
hold = 0;
}

/* 👉 結果 */
if(state === "result"){
textSize(30);
text(cards[index].name, width/2, height/2);
textSize(18);
text(cards[index].desc, width/2, height/2+40);
}
}

/* ===== 手勢判斷 ===== */
function isOpen(lm){
return lm[8][1] < lm[6][1] && lm[12][1] < lm[10][1];
}

function isFist(lm){
return lm[8][1] > lm[6][1] && lm[12][1] > lm[10][1];
}