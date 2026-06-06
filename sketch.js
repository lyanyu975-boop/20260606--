let state="idle";
let index=0;
let hold=0;

const cards=[
{name:"愚者",desc:"新的旅程正在展開",img:"assets/cards/fool.jpg"},
{name:"魔術師",desc:"你的行動正在創造現實",img:"assets/cards/magician.jpg"},
{name:"女祭司",desc:"答案藏在直覺之中",img:"assets/cards/priestess.jpg"},
{name:"戀人",desc:"你正站在選擇的交叉點",img:"assets/cards/lovers.jpg"},
{name:"太陽",desc:"光明與成功正在靠近",img:"assets/cards/sun.jpg"}
];

/* ===== 開始 ===== */
function start(){
document.getElementById("start").style.display="none";
document.getElementById("app").style.display="block";
initCamera();
initParticles();
}

/* ===== 攝影機 ===== */
function initCamera(){
navigator.mediaDevices.getUserMedia({video:true})
.then(stream=>{
cam.srcObject=stream;
});
}

/* ===== 手勢穩定核心（展覽級） ===== */
function isOpen(lm){
return lm[8].y<lm[6].y && lm[12].y<lm[10].y;
}

function isFist(lm){
return lm[8].y>lm[6].y && lm[12].y>lm[10].y;
}

/* ===== 狀態機 ===== */
function update(lm){

if(isOpen(lm)){
state="select";
hint.innerText="命運流動中...";
}

if(state==="select"){
let x=lm[8].x;

if(x<0.4) index--;
if(x>0.6) index++;

index=Math.max(0,Math.min(cards.length-1,index));

card.src=cards[index].img;
}

if(isFist(lm)){
hold++;
circle.style.display="block";
updateCircle(hold);

if(hold>80){
draw();
}
}else{
hold=0;
circle.style.display="none";
}
}

/* ===== 抽牌 ===== */
function draw(){
state="result";

title.innerText=cards[index].name;
desc.innerText=cards[index].desc;

card.classList.add("flip");

playSound("confirm");
}

/* ===== 音效 ===== */
function playSound(name){
let a=new Audio(`assets/sounds/${name}.mp3`);
a.play();
}
