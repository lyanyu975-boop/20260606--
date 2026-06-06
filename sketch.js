let video = document.getElementById("video");
let canvas = document.getElementById("handCanvas");
let ctx = canvas.getContext("2d");

let state = "idle";
let index = 0;
let hold = 0;

/* ⭐ 22張完整塔羅（中文比賽版） */
const cards = [
{ name:"愚者", meaning:"新的開始、自由與冒險", img:"assets/cards/fool.jpg" },
{ name:"魔術師", meaning:"創造力與行動力", img:"assets/cards/magician.jpg" },
{ name:"女祭司", meaning:"直覺與潛意識", img:"assets/cards/priestess.jpg" },
{ name:"皇后", meaning:"豐盛與愛", img:"assets/cards/empress.jpg" },
{ name:"皇帝", meaning:"秩序與權力", img:"assets/cards/emperor.jpg" },
{ name:"教皇", meaning:"傳統與信仰", img:"assets/cards/heirophant.jpg" },
{ name:"戀人", meaning:"選擇與情感", img:"assets/cards/lovers.jpg" },
{ name:"戰車", meaning:"意志與勝利", img:"assets/cards/chariot.jpg" },
{ name:"力量", meaning:"勇氣與內在力量", img:"assets/cards/strength.jpg" },
{ name:"隱者", meaning:"內省與智慧", img:"assets/cards/hermit.jpg" },
{ name:"命運之輪", meaning:"命運與轉變", img:"assets/cards/wheel.jpg" },
{ name:"正義", meaning:"公平與因果", img:"assets/cards/justice.jpg" },
{ name:"吊人", meaning:"犧牲與等待", img:"assets/cards/hanged.jpg" },
{ name:"死神", meaning:"結束與重生", img:"assets/cards/death.jpg" },
{ name:"節制", meaning:"平衡與調和", img:"assets/cards/temperance.jpg" },
{ name:"惡魔", meaning:"慾望與束縛", img:"assets/cards/devil.jpg" },
{ name:"高塔", meaning:"崩解與覺醒", img:"assets/cards/tower.jpg" },
{ name:"星星", meaning:"希望與療癒", img:"assets/cards/star.jpg" },
{ name:"月亮", meaning:"迷惘與潛意識", img:"assets/cards/moon.jpg" },
{ name:"太陽", meaning:"成功與喜悅", img:"assets/cards/sun.jpg" },
{ name:"審判", meaning:"覺醒與重生", img:"assets/cards/judgement.jpg" },
{ name:"世界", meaning:"完成與圓滿", img:"assets/cards/world.jpg" }
];

/* ===== 開始 ===== */
function start(){
document.getElementById("startScreen").style.display="none";
document.getElementById("game").style.display="block";
startCamera();
}

/* ===== 攝影機 ===== */
function startCamera(){
navigator.mediaDevices.getUserMedia({video:true})
.then(stream=>{
video.srcObject = stream;
});
}

/* ===== 手勢判斷（升級穩定版） ===== */
function openHand(lm){
return lm[8].y < lm[6].y &&
lm[12].y < lm[10].y &&
lm[16].y < lm[14].y;
}

function fist(lm){
return lm[8].y > lm[6].y &&
lm[12].y > lm[10].y &&
lm[16].y > lm[14].y;
}

/* ===== 選牌 ===== */
function select(){
document.getElementById("card").src = cards[index].img;
document.getElementById("card").classList.add("glow");
}

/* ===== 抽牌 ===== */
function draw(){
state="result";

document.getElementById("result").style.display="block";

document.getElementById("title").innerText = cards[index].name;
document.getElementById("meaning").innerText = cards[index].meaning;
}

/* ===== 重置 ===== */
function restart(){
location.reload();
}
