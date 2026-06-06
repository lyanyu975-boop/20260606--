let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let state="idle";
let index=0;
let hold=0;

/* ⭐ 塔羅牌（中文） */
const cards=[
{name:"愚者",desc:"新的開始與自由",img:"fool.jpg"},
{name:"魔術師",desc:"行動與創造力",img:"magician.jpg"},
{name:"戀人",desc:"選擇與情感",img:"lovers.jpg"},
{name:"太陽",desc:"成功與喜悅",img:"sun.jpg"}
];

/* ===== 修正：開始按鈕一定能點 ===== */
document.getElementById("startBtn").addEventListener("click",startGame);

function startGame(){
document.getElementById("startScreen").style.display="none";
document.getElementById("gameScreen").style.display="block";
startCamera();
}

/* ===== 鏡頭（修正：真正啟動） ===== */
function startCamera(){
navigator.mediaDevices.getUserMedia({video:true})
.then(stream=>{
video.srcObject=stream;
});
}

/* ===== MediaPipe ===== */
const hands=new Hands({
locateFile:(file)=>{
return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}
});

hands.setOptions({
maxNumHands:1,
minDetectionConfidence:0.7,
minTrackingConfidence:0.7
});

hands.onResults(onResults);

/* ===== 修正：畫面更新 ===== */
function onResults(results){

ctx.clearRect(0,0,canvas.width,canvas.height);

if(!results.multiHandLandmarks) return;

let lm=results.multiHandLandmarks[0];

/* 張手 */
if(isOpen(lm)){
state="select";
document.getElementById("hint").innerText="左右移動選牌";
}

/* 左右選牌 */
if(state==="select"){
let x=lm[8].x;

if(x<0.4) index--;
if(x>0.6) index++;

index=Math.max(0,Math.min(cards.length-1,index));

document.getElementById("card").src=cards[index].img;
}

/* 握拳3秒 */
if(isFist(lm)){
hold++;

if(hold>80){
draw();
}
}else{
hold=0;
}
}

/* ===== 手勢 ===== */
function isOpen(lm){
return lm[8].y<lm[6].y && lm[12].y<lm[10].y;
}

function isFist(lm){
return lm[8].y>lm[6].y && lm[12].y>lm[10].y;
}

/* ===== 抽牌 ===== */
function draw(){
state="result";

document.getElementById("result").style.display="block";

document.getElementById("title").innerText=cards[index].name;
document.getElementById("desc").innerText=cards[index].desc;
}

/* ===== 重新 ===== */
function restart(){
location.reload();
}

/* ===== 啟動偵測 ===== */
const camera=new Camera(video,{
onFrame:async()=>{
await hands.send({image:video});
},
width:640,
height:480
});

camera.start();
