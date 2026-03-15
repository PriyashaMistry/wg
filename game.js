let players=[]
let scores=[]
let currentPlayer=0
let canGuess = false

let puzzle=""
let revealed=[]

const vowels=["A","E","I","O","U"]

let vowelAllowed = false

const wheel=[
100000,"🐍",1,10000,75000,
45000,25000,10,90000,"LOSE",
20000,35000,50000,80000,5000
]

let wheelAngle = 0

let currentSpinValue = 0

const spinSound=new Audio("sounds/spin.wav")
const correctSound=new Audio("sounds/correct.wav")
const wrongSound=new Audio("sounds/fail.mp3")
const winSound=new Audio("sounds/win.wav")

function show(screen){
document.querySelectorAll(".screen")
.forEach(s=>s.classList.remove("active"))

document.getElementById(screen)
.classList.add("active")
}

function showMode(){
show("modeScreen")
}

function setupPuzzle(){
show("playerScreen")
}

function setupRapid(){
show("rapidScreen")
}

function checkSub(){

let cat=document.getElementById("category").value

if(cat==="BOLLYWOOD")
document.getElementById("subcategory").style.display="block"
else
document.getElementById("subcategory").style.display="none"
}

function startPuzzle(){

players=[]
scores=[]

for(let i=1;i<=5;i++){

let name=document.getElementById("p"+i).value

if(name){
players.push(name)
scores.push(0)
}

}

if(players.length<2){
alert("Need at least 2 players")
return
}

startGame()

}

function startGame(){

show("gameScreen")


document.getElementById("scoreBoard").innerHTML=""

players.forEach((p,i)=>{

let div=document.createElement("div")
div.className="player"
div.id="score"+i
div.innerText=p+": 0"

scoreBoard.appendChild(div)

})

selectPuzzle()

createKeyboard()

updateScores()

}

function selectPuzzle(){

let category = document.getElementById("category").value
let sub = document.getElementById("subcategory").value

let filtered

// Bollywood uses subcategory chosen by player
if(category === "BOLLYWOOD"){

filtered = puzzleDatabase.filter(q =>
q.Category === category && q.SubCategory === sub
)

}

// other categories choose randomly
else{

filtered = puzzleDatabase.filter(q =>
q.Category === category
)

}

if(filtered.length === 0){
alert("No puzzles found")
return
}

let q = filtered[Math.floor(Math.random()*filtered.length)]

puzzle = q.Question

// IMPORTANT: display real category + subcategory
document.getElementById("categoryDisplay").innerText =
"Category: " + q.Category

document.getElementById("subDisplay").innerText =
"Subcategory: " + q.SubCategory

revealed = Array(puzzle.length).fill("")

createBoard()

}

function createBoard(){

puzzleBoard.innerHTML=""

let words = puzzle.split(" ")

let maxLettersPerRow = 14
let rows = []
let currentRow = []
let currentLength = 0

words.forEach(word=>{

if(currentLength + word.length > maxLettersPerRow){

rows.push(currentRow)
currentRow = [word]
currentLength = word.length + 1

}else{

currentRow.push(word)
currentLength += word.length + 1

}

})

if(currentRow.length > 0){
rows.push(currentRow)
}

let index = 0

rows.forEach(row=>{

let rowDiv=document.createElement("div")
rowDiv.style.display="flex"
rowDiv.style.justifyContent="center"
rowDiv.style.gap="6px"
rowDiv.style.margin="5px"

row.forEach((word,wIndex)=>{

for(let i=0;i<word.length;i++){

let div=document.createElement("div")
div.className="tile"

let c = word[i]

if(/[A-Z]/.test(c)){
if(revealed[index]){
div.innerText = revealed[index]
div.classList.add("reveal")
}else{
div.innerText = ""
}
}
else{
div.innerText = c
div.classList.add("symbol")
}

rowDiv.appendChild(div)

index++

}

// add space between words
if(wIndex < row.length-1){
let spacer=document.createElement("div")
spacer.style.width="20px"
rowDiv.appendChild(spacer)
}

index++ // skip space

})

puzzleBoard.appendChild(rowDiv)

})

}

function createKeyboard(){

keyboard.innerHTML=""

let letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ"

for(let l of letters){

let b=document.createElement("button")
b.innerText=l
b.className="key"

// disable vowels initially
if(vowels.includes(l)){
b.disabled=true
b.classList.add("used")
b.classList.add("vowel")
}


b.onclick=()=>guess(l,b)

keyboard.appendChild(b)

}

}

function guess(letter,btn){

// VOWEL LOGIC
if(vowels.includes(letter)){

if(!vowelAllowed){
alert("Buy a vowel first!")
return
}

}

// CONSONANT LOGIC
else{

if(!canGuess){
alert("Spin the wheel first!")
return
}

}	

// disable the button after clicking
btn.disabled = true
btn.classList.add("used")

let count = 0

for(let i=0;i<puzzle.length;i++){

if(puzzle[i]===letter){

revealed[i]=letter
count++

}

}

createBoard()

if(count > 0){

correctSound.play()

if(!vowels.includes(letter)){
let winnings = currentSpinValue * count
scores[currentPlayer] += winnings
showMoney(winnings)
}

updateScores()

}else{

wrongSound.play()
nextPlayer()
updateScores()

}
canGuess=false
vowelAllowed = false
currentSpinValue = 0

}

let spinning=false

function spinWheel(){

if(spinning) return

spinSound.play()

spinning = true
canGuess = false
vowelAllowed = false

let velocity = 0.6 + Math.random() * 0.6
const friction = 0.985

function animate(){

wheelAngle += velocity
velocity *= friction

drawWheel()

if(velocity > 0.01){
requestAnimationFrame(animate)
}
else{

spinning = false
determineResult()

}

}

requestAnimationFrame(animate)

}

function determineResult(){

const arc = 2 * Math.PI / wheel.length

let normalized = wheelAngle % (2 * Math.PI)

let pointer = 3 * Math.PI / 2

let relative = pointer - normalized

if(relative < 0){
relative += 2 * Math.PI
}

let index = Math.floor(relative / arc) % wheel.length

let result = wheel[index]

document.getElementById("wheelResult").innerText = "Result: " + result

if(result === "🐍"){

scores[currentPlayer] = 0
updateScores()
nextPlayer()

}

else if(result === "LOSE"){

nextPlayer()

}

else{

currentSpinValue = result
canGuess = true

}

updateScores()

}

function showMoney(amount){

let div=document.createElement("div")

div.className="moneyPopup"

div.innerText="+ "+amount

document.body.appendChild(div)

setTimeout(()=>{

div.remove()

},1500)

}

function updateScores(){

players.forEach((p,i)=>{

let el=document.getElementById("score"+i)

let turn = i===currentPlayer ? " ← TURN" : ""

el.innerText = p + " : ₹" + scores[i] + turn

if(i===currentPlayer){
el.style.background="gold"
el.style.color="black"
el.style.transform="scale(1.1)"
}
else{
el.style.background="black"
el.style.color="white"
el.style.transform="scale(1)"
}

})

document.getElementById("turnIndicator").innerText =
"Current Turn: " + players[currentPlayer]

}

function nextPlayer(){

currentPlayer++

if(currentPlayer>=players.length)
currentPlayer=0

vowelAllowed=false

updateScores()

}

function buyVowel(){

if(scores[currentPlayer] < 20000){
alert("You need 20000 to buy a vowel")
return
}

// subtract money
scores[currentPlayer] -= 20000

updateScores()

vowelAllowed = true
canGuess = true

// enable vowel buttons
document.querySelectorAll(".key").forEach(btn=>{

if(vowels.includes(btn.innerText) && btn.disabled){

btn.disabled=false
btn.classList.remove("used")

}

})

}

function solvePuzzle(){

revealed=puzzle.split("")

createBoard()

celebrate()

winSound.play()

}

function celebrate(){

let confetti=document.createElement("div")

confetti.className="confetti"

document.body.appendChild(confetti)

setTimeout(()=>{
confetti.remove()
},3000)

}

//// RAPID GAME

let rapidPuzzle=""
let rapidRevealed=[]

function startRapid(){
	
magicalUsed=false
playerLetters=[]
consonants=0
vowelsChosen=0

let category=document.getElementById("rapidCategorySelect").value

let filtered=rapid_database.filter(q=>q.Category===category)

if(filtered.length === 0){
alert("No puzzles found for this category")
return
}

let q=filtered[Math.floor(Math.random()*filtered.length)]

rapidPuzzle=q.Question

rapidRevealed=Array(rapidPuzzle.length).fill("")

document.getElementById("rapidCategory").innerText =
"Category: "+ q.Category

document.getElementById("rapidSub").innerText =
"Subcategory: "+ q.SubCategory

createRapidBoard()

createRapidKeyboard()

}

function createRapidBoard(){

let rapidBoard=document.getElementById("rapidBoard")
rapidBoard.innerHTML=""

let index=0

for(let i=0;i<rapidPuzzle.length;i++){

let d=document.createElement("div")

if(rapidPuzzle[i]==" "){

d.className="space"
rapidBoard.appendChild(d)
index++
continue

}

d.className="tile"

if(/[A-Z]/.test(rapidPuzzle[i]))
if(rapidRevealed[index]){
d.innerText = rapidRevealed[index]
d.classList.add("reveal")
}else{
d.innerText = ""
}
else
d.innerText=rapidPuzzle[i]

rapidBoard.appendChild(d)

index++

}

}

let magicalUsed=false

function fillMagical(){

if(magicalUsed){
alert("Magical letters already used")
return
}

let magical=["R","S","N","T","L","E"]

magical.forEach(l=>{
setTimeout(()=>revealRapid(l),200)
})

magicalUsed=true

}

let playerLetters=[]
let consonants=0
let vowelsChosen=0

function fillPlayerLetters(){

let rapidKeyboard=document.getElementById("rapidKeyboard")
rapidKeyboard.innerHTML=""

let letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ"

for(let l of letters){

let b=document.createElement("button")
b.innerText=l

b.onclick=()=>{

if(vowels.includes(l)){

if(vowelsChosen>=1){
alert("Only 1 vowel allowed")
return
}

vowelsChosen++

}else{

if(consonants>=3){
alert("Only 3 consonants allowed")
return
}

consonants++

}

playerLetters.push(l)

revealRapid(l)

b.disabled=true

}

rapidKeyboard.appendChild(b)

}

}

function revealRapid(letter){

for(let i=0;i<rapidPuzzle.length;i++){

if(rapidPuzzle[i]===letter)
rapidRevealed[i]=letter

}

createRapidBoard()

}

function createRapidKeyboard(){

let rapidKeyboard=document.getElementById("rapidKeyboard")
rapidKeyboard.innerHTML=""

let letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ"

for(let l of letters){

let b=document.createElement("button")
b.innerText=l

b.onclick=()=>revealRapid(l)

rapidKeyboard.appendChild(b)

}

}

function startTimer(){

let time=30

let timer=document.getElementById("timer")
timer.innerText=time

let t=setInterval(()=>{

time--

timer.innerText=time

if(time<=0){

clearInterval(t)

alert("Time Up!")

document.getElementById("rapidKeyboard").style.display="none"

}

},1000)

}

function solveRapid(){

let ans=prompt("Enter your answer").toUpperCase()

if(ans===rapidPuzzle){

alert("Correct!")

rapidRevealed=rapidPuzzle.split("")

createRapidBoard()

}
else{

alert("Wrong answer")

}

}

function passRapid(){

rapidRevealed=rapidPuzzle.split("")

createRapidBoard()

}


const colors=[
"#ff5757","#ffbd59","#59ff8c","#59a6ff",
"#d659ff","#ff8f59","#59fff0","#a6ff59",
"#ffd659","#ff59a6","#8cff59","#59c3ff",
"#ff9c59","#9f59ff","#59ffbd"
]


function drawWheel(){

let canvas = document.getElementById("wheelCanvas")
let ctx = canvas.getContext("2d")

let arc = (2 * Math.PI) / wheel.length

ctx.clearRect(0,0,canvas.width,canvas.height)

for(let i=0;i<wheel.length;i++){

let start = wheelAngle + i*arc

ctx.beginPath()

ctx.fillStyle = colors[i]

ctx.moveTo(175,175)

ctx.arc(
175,
175,
170,
start,
start + arc
)

ctx.fill()

ctx.strokeStyle = "black"
ctx.lineWidth = 2
ctx.stroke()

ctx.save()

ctx.translate(175,175)
ctx.rotate(start + arc/2)

ctx.textAlign = "right"
ctx.fillStyle = "black"
ctx.font = "bold 16px Arial"

let text = wheel[i]

if(text === "🐍") text = "🐍"
else if(text === "LOSE") text = "❌"
else text = "₹" + text

ctx.fillText(text,150,5)

ctx.restore()

}

}

drawWheel()

