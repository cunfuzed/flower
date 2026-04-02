/*Set-up*/
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

let entities = [];
let projectiles = [];
let tiles = [];
let inventory = [];
let drops = [];
let score = 0;
let rarityColors = ["rgb(171, 255, 159)","rgb(213, 247, 74)","rgb(0, 80, 199)","rgb(135, 0, 199)","rgb(255, 0, 0)","rgb(0, 213, 255)","rgb(255, 40, 92)","rgb(17, 255, 0)"];
let rarityNames = ["common","unusual","rare","epic","legendary","mythic","ultra","super","unique"]
let gameOver = false;

//entity stuff
let entityTypes = {
  player: {
    size: 30,
    speed: 40,
    weight: 100,
    damage: 25,
    maxHealth: 1000000,
    behavior: "mouse",
    side: "player",
    draw: function () {
      ctx.fillStyle = "yellow";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      drawHealthBar(this);
    }
  },
  blob: {
    size: 30,
    speed: 4,
    weight: 3,
    maxHealth: 20,
    damage: 4,
    behavior: "ram",
    score: 100,
    side: "enemy",
    draw: function () {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      drawHealthBar(this);
    }
  },
  speeder: {
    size: 25,
    speed: 5,
    weight: 1,
    maxHealth: 10,
    damage: 10,
    behavior: "ram",
    score: 150,
    side: "enemy",
    draw: function () {
      ctx.fillStyle = "orange";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      drawHealthBar(this);
    }
  },
  tank: {
    size: 50,
    speed: 1.5,
    weight: 12,
    maxHealth: 50,
    damage: 25,
    behavior: "ram",
    score: 200,
    side: "enemy",
    draw: function () {
      ctx.fillStyle = "#8B0000";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      drawHealthBar(this);
    }
  },
  soldierAnt:{
    size: 50,
    speed: 3,
    weight: 0.5,
    maxHealth: 40,
    damage: 10,
    behavior: "ram",
    score: 50,
    side: "enemy",
    drops: [["basic",1,1]],
    draw: function (){
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = "rgb(50,50,50)";
      ctx.beginPath();
      ctx.arc(-10, 0, this.size*0.5, 0, Math.PI * 2);
      ctx.arc(25, 0, this.size*0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgb(100,100,100)";
      ctx.beginPath();
      ctx.arc(-10, 0, this.size*0.3, 0, Math.PI * 2);
      ctx.arc(25, 0, this.size*0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      drawHealthBar(this);
    }
  },
  tester:{
    size: 50,
    speed: 5,
    weight: 5,
    maxHealth: 100,
    damage: 0.001,
    behavior: "ram",
    score: 0,
    side: "enemy",
    aggroRange: Infinity,
    drops: [["basic",1,1],["light",1,1]],
    draw: function () {
      ctx.fillStyle = "rgb(255,255,255)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      drawHealthBar(this);
    }
  }
};

//petals 
let petalTypes = {
  basic: {
    health: 10,
    damage: 10,
    reloadTime: 250,
    size: 10,
    weight: 0.1,
    attraction: 150,
    class: "damage",
    draw: function (){
      ctx.fillStyle = "white";
      ctx.shadowColor = "white";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  rose:{
    health: 5,
    damage: 5,
    reloadTime: 150,
    size: 10,
    weight: 0.001,
    heal: 10,
    attraction: 0,
    class: "heal",
    draw: function (){
      ctx.fillStyle = "pink";
      ctx.shadowColor = "pink";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  heavy:{
    health: 20,
    damage: 20,
    reloadTime: 550,
    size: 15,
    weight: 100,
    attraction: 150,
    class: "damage",
    draw: function (){
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(this.x+5, this.y-5, this.size*0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  rock:{
    health: 19,
    damage: 15,
    reloadTime: 300,
    size: 10,
    weight: 2,
    attraction: 20,
    class: "damage",
    draw: function (){
      ctx.fillStyle = "rgb(100,100,100)";
      ctx.beginPath();
      ctx.lineTo(this.x,this.y-this.size/0.75);
      ctx.lineTo(this.x+this.size*1.2,this.y-this.size/2);
      ctx.lineTo(this.x+this.size*0.8,this.y+this.size);
      ctx.lineTo(this.x-this.size*0.8,this.y+this.size);
      ctx.lineTo(this.x-this.size*1.2,this.y-this.size/2);
      ctx.fill();
    }
  },
  stinger:{
    health: 1,
    damage: 100,
    reloadTime: 1000,
    size: 5,
    weight: 0.01,
    attraction: 10,
    class: "damage",
    amounts: [1, 1, 1, 1, 1, 3, 5, 5, 5],
    clumpType: "clump",
    draw: function (){
      ctx.fillStyle = "rgb(0,0,0)";
      ctx.beginPath();
      ctx.lineTo(this.x,this.y-this.size);
      ctx.lineTo(this.x+this.size,this.y+this.size);
      ctx.lineTo(this.x-this.size,this.y+this.size);
      ctx.fill();
    }
  },
  sand:{
    health: 1.25,
    damage: 5,
    reloadTime: 150,
    size: 5,
    weight: 0,
    attraction: 10,
    class: "damage",
    amounts: [4, 4, 4, 4, 4, 4, 4, 4, 4],
    clumpType: "clump",
    draw: function (){
      ctx.fillStyle = "rgb(255,255,0)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  light:{
    health: 1,
    damage: 1,
    reloadTime: 100,
    size: 5,
    weight: 0,
    attraction: 10,
    class: "damage",
    amounts: [1, 2, 2, 3, 3, 5, 5, 5, 5],
    clumpType: "linear",
    draw: function (){
      ctx.fillStyle = "white";
      ctx.shadowColor = "white";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    } 
  },
}

//tile types
let tileTypes ={
  grass:{
    isSolid: false,
    draw: function (){
      ctx.fillStyle = "rgb(0,100,0)";
      ctx.strokeStyle = "rgb(0,100,0)";
      ctx.fillRect(this.x,this.y,500,500);
    },
  },
  dirt:{
    isSolid: true,
    draw: function (){
      ctx.fillStyle = "rgb(100,50,0)";
      ctx.strokeStyle = "rgb(100,50,0)";
      ctx.fillRect(this.x,this.y,500,500);
    }
  },
  stone_wall:{
    isSolid: true,
    draw: function (){
      ctx.fillStyle = "rgb(100,100,100)";
      ctx.strokeStyle = "rgb(100,100,100)";
      ctx.fillRect(this.x,this.y,500,500);
    }
  },
  water:{
    isSolid: true,
    draw: function (){
      ctx.fillStyle = "rgb(0,0,255)";
      ctx.strokeStyle = "rgb(0,0,255)"
      ctx.fillRect(this.x,this.y,500,500);
      
    }
  }
}

let maps = [
  [   ["d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d"],
      ["d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","s","s","s","s","s","s","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","d","d","s","s","s","g","g","g","g","g","g","g","s","s","s","d","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","d","d","s","s","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","g","g","g","g","g","g","g","g","g","d"],
      ["d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","d","s","s","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","g","g","g","g","g","g","g","g","d"],
      ["d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","w","w","w","d","d","d","d","d","d","g","g","g","g","g","g","g","g","d","d","s","g","g","g","g","g","g","d","d","d","g","g","g","g","g","g","s","s","d","d","g","g","g","g","g","g","g","d"],
      ["d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","w","d","d","d","d","d","d","d","g","g","g","g","g","g","g","w","s","s","g","g","g","g","g","d","d","d","s","d","d","d","g","g","g","g","g","s","s","d","d","g","g","g","g","g","g","d"],
      ["d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","w","w","w","d","d","d","d","d","d","d","g","g","g","g","g","w","w","s","g","g","g","g","g","d","d","s","s","s","s","s","d","d","g","g","g","g","g","s","s","d","g","g","g","g","g","g","d"],
      ["d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","w","s","s","g","g","g","d","d","s","s","s","s","s","s","s","s","d","g","g","g","g","g","s","s","d","g","g","g","g","g","g","d"],
      ["d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","w","w","d","w","d","d","d","d","d","d","g","g","g","g","g","w","s","s","g","g","d","s","s","s","d","d","d","d","d","d","s","d","d","g","g","g","g","g","s","s","d","g","g","g","g","g","d"],
      ["d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","w","s","g","g","g","d","d","d","d","d","g","g","g","g","d","d","s","d","g","g","g","g","g","s","s","d","d","g","g","g","g","d"],
      ["d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","w","w","g","g","d","d","s","d","g","g","g","g","g","g","g","d","d","d","g","g","g","g","g","g","s","s","d","g","g","g","g","d"],
      ["d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","w","d","d","d","d","d","d","d","d","g","g","g","g","w","w","g","g","d","s","d","g","g","g","g","g","g","g","g","g","d","d","d","g","g","g","g","g","s","s","d","g","g","g","g","d"],
      ["d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","w","w","w","d","d","d","d","d","d","d","d","d","g","g","g","w","w","g","g","d","s","d","g","g","g","g","g","g","g","g","g","d","s","d","g","g","g","g","g","s","s","d","g","g","g","g","d"],
      ["d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","w","d","d","d","d","d","d","d","d","d","g","g","g","w","s","g","g","d","d","d","d","g","g","g","w","g","g","g","g","d","s","d","d","g","g","g","g","s","s","d","g","g","g","g","d"],
      ["d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","w","w","g","g","g","d","s","d","g","g","g","w","w","w","g","g","d","d","s","d","g","g","g","g","s","s","d","g","g","g","g","d"],
      ["d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","s","g","s","w","w","w","w","w","g","g","g","g","g","g","g","s","d","d","w","w","w","d","d","d","d","d","d","d","d","d","g","g","g","w","s","g","g","g","d","s","d","g","g","g","g","w","w","w","g","g","d","s","d","g","g","g","g","s","s","d","g","g","g","g","d"],
      ["d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","s","g","s","w","w","w","w","w","w","g","g","g","g","g","g","s","d","d","d","w","d","d","d","d","d","d","d","d","d","d","g","g","g","w","s","g","g","g","d","s","d","g","g","g","g","w","w","w","w","g","d","d","d","d","g","g","g","g","s","s","d","g","g","g","d"],
      ["d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","w","w","w","s","s","s","g","s","s","s","w","w","w","w","g","g","g","g","g","g","s","s","d","w","w","d","d","d","d","d","d","d","d","d","d","d","g","g","w","s","g","g","g","d","s","d","d","g","g","g","w","w","s","w","g","g","d","s","d","g","g","g","g","s","s","d","g","g","g","d"],
      ["d","d","d","d","d","d","d","d","s","s","s","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","w","w","s","s","g","g","g","g","g","g","s","w","w","w","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","w","s","g","g","g","d","s","s","d","g","g","g","g","w","s","w","g","g","d","d","d","g","g","g","g","s","s","d","g","g","g","d"],
      ["d","d","d","d","s","s","s","s","s","g","s","s","s","s","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","w","w","s","g","g","g","g","g","g","g","s","w","w","g","g","g","g","g","g","g","g","s","d","w","w","w","d","d","d","d","d","d","d","d","d","d","g","g","w","s","g","g","g","d","d","s","d","g","g","g","g","w","s","w","g","g","g","d","d","g","g","g","g","s","s","d","g","g","g","d"],
      ["d","d","d","s","s","g","g","g","g","g","g","g","g","s","s","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","w","w","s","s","s","g","g","g","g","g","s","w","w","g","g","g","g","g","g","g","g","s","d","w","d","w","w","d","d","d","d","d","d","d","d","d","g","g","w","w","g","g","g","g","d","s","d","g","g","g","g","w","s","w","g","g","g","d","d","g","g","g","g","g","s","d","g","g","d","d"],
      ["d","d","d","s","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","g","g","g","g","g","g","g","g","g","g","w","w","w","w","s","s","s","s","s","s","s","w","w","g","g","g","g","g","g","g","d","s","d","w","d","w","d","d","d","d","d","d","d","d","d","d","g","g","g","w","s","g","g","g","d","d","d","g","g","g","g","w","s","w","g","g","g","d","d","g","g","g","g","g","s","d","g","g","d","d"],
      ["d","d","s","s","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","w","s","g","g","g","g","d","d","g","g","g","g","w","s","w","g","g","g","d","s","d","g","g","g","g","s","d","g","g","g","d"],
      ["d","d","s","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","g","g","g","g","g","g","g","g","g","s","d","d","w","w","d","d","d","d","d","d","d","d","d","d","g","g","g","g","w","s","s","g","g","g","g","g","g","g","g","g","w","s","w","g","g","g","d","s","d","g","g","g","g","s","d","g","g","g","d"],
      ["d","d","s","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","w","d","d","d","d","d","d","d","d","d","g","g","g","g","w","s","s","g","g","g","g","g","g","g","g","g","w","s","w","g","g","g","d","s","d","g","g","g","g","s","d","g","g","g","d"],
      ["d","d","s","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","w","w","s","w","g","g","g","g","g","g","g","w","w","w","g","g","g","g","d","s","d","g","g","g","g","s","d","g","g","g","d"],
      ["d","d","s","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","w","w","w","d","d","d","d","d","d","d","d","g","g","g","g","g","g","w","s","w","w","g","g","g","g","g","w","w","w","w","g","g","g","g","g","d","d","g","g","g","g","s","d","g","g","g","d"],
      ["d","d","s","s","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","w","d","w","w","d","d","d","d","d","d","d","g","g","g","g","g","g","w","w","s","w","w","w","w","w","w","w","w","w","g","g","g","g","g","d","d","d","g","g","g","g","s","d","g","g","g","d"],
      ["d","d","d","s","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","w","d","w","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","w","s","s","s","s","s","s","w","w","w","g","g","g","g","g","g","d","s","d","g","g","g","g","s","d","g","g","g","d"],
      ["d","d","d","s","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","w","s","s","s","s","w","w","w","g","g","g","g","g","g","g","g","d","s","d","g","g","g","g","s","d","g","g","g","d"],
      ["d","d","d","s","s","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","w","w","s","w","w","w","g","g","g","g","g","g","g","g","g","g","d","s","d","g","g","g","g","s","d","g","g","g","d"],
      ["d","d","d","d","s","g","g","g","g","g","g","g","g","g","s","s","s","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","w","w","w","g","g","g","g","g","g","g","g","g","g","g","g","d","s","d","g","g","g","g","s","d","g","g","g","d"],
      ["d","d","d","d","s","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","g","g","g","g","g","s","d","d","g","g","d"],
      ["d","d","d","d","s","s","g","g","g","g","g","g","s","s","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","s","d","g","g","g","g","g","s","s","d","g","g","d"],
      ["d","d","d","d","d","s","g","g","g","g","g","s","s","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","s","d","g","g","g","g","g","s","s","d","g","g","d"],
      ["d","s","s","s","s","s","g","g","g","g","s","s","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","s","d","g","g","g","g","g","g","s","s","d","g","g","d"],
      ["d","s","s","s","g","g","g","g","g","g","s","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","s","d","g","g","g","g","g","g","s","s","g","g","g","d"],
      ["d","s","s","s","g","g","g","g","g","g","s","s","s","s","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","s","d","g","g","g","g","g","g","s","d","g","g","g","d"],
      ["d","s","s","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","s","s","d","g","g","g","g","g","g","s","d","g","g","g","d"],
      ["d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","s","s","d","g","g","g","g","g","g","s","d","d","g","g","d"],
      ["d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","s","s","s","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","s","d","d","g","g","g","g","g","g","s","s","d","g","g","d"],
      ["d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","d","d","d","d","d","d","s","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","d","d","s","d","d","g","g","g","g","g","g","g","g","g","g","g","d","d","s","s","d","g","g","g","g","g","g","s","s","s","d","g","g","d"],
      ["d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","s","s","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","d","d","s","d","d","d","g","g","g","g","g","g","g","g","g","d","d","s","s","d","d","g","g","g","g","g","g","s","s","s","d","g","g","d"],
      ["d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","s","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","s","s","d","s","s","d","d","d","g","g","g","g","d","d","d","d","d","s","s","d","d","g","g","g","g","g","g","s","s","s","d","g","g","g","d"],
      ["d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","s","s","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","s","s","d","s","s","s","d","d","d","d","d","d","d","s","s","s","s","s","d","d","g","g","g","g","g","g","g","s","s","s","d","g","g","g","d"],
      ["d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","s","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","s","d","d","s","s","s","s","s","s","s","s","s","s","s","s","s","d","d","g","g","g","g","g","g","g","s","s","s","s","d","g","g","g","d"],
      ["d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","s","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","s","d","d","s","s","s","s","s","s","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","s","s","s","d","d","g","g","g","d"],
      ["d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","s","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","s","s","d","d","s","s","s","s","s","s","s","s","d","d","d","d","g","g","g","g","g","g","g","g","g","g","s","s","s","d","g","g","g","g","d"],
      ["d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","s","s","s","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","s","s","d","d","s","s","s","s","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","d","d","g","g","g","g","d"],
      ["d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","d","g","g","g","g","g","d"],
      ["d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","s","s","s","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","d","g","g","g","g","g","d"],
      ["d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","d","d","g","g","g","g","g","d"],
      ["d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","d","d","g","g","g","g","g","g","d"],
      ["d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","d","d","g","g","g","g","g","g","g","d"],
      ["d","g","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","d"],
      ["d","g","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","d","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","s","s","s","s","d","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","d","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","s","s","s","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","s","s","s","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","s","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","g","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","d","d","d","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","s","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","g","g","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","d","d","d","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","g","g","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","g","g","g","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","s","s","s","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","g","g","g","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","g","g","g","g","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","g","g","g","g","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","s","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","g","g","g","g","g","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","g","g","g","g","g","g","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","w","w","g","g","g","g","g","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","w","w","w","g","g","g","g","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","w","w","w","w","w","g","g","g","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","w","w","w","w","w","w","w","g","g","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","g","g","g","g","g","g","g","d"],
      ["d","g","g","w","w","w","w","w","w","w","g","g","g","d","d","d","d","d","d","w","w","w","w","w","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","d"],
      ["d","g","g","w","w","w","w","w","w","w","w","g","g","g","d","d","d","d","d","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","s","s","s","s","s","s","s","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","d"],
      ["d","g","g","w","w","w","w","w","w","w","w","g","g","g","g","d","d","d","d","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","s","s","s","s","s","d","s","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","d"],
      ["d","g","g","w","w","w","w","w","w","w","w","g","g","g","g","d","d","d","d","d","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","d"],
      ["d","g","g","g","w","w","w","w","w","w","w","g","g","g","g","g","d","d","d","d","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","d"],
      ["d","g","g","g","w","w","w","w","w","w","w","g","g","g","g","g","d","d","d","d","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","d"],
      ["d","g","g","g","w","w","w","w","w","w","w","g","g","g","g","g","g","d","d","d","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","d"],
      ["d","g","g","g","g","w","w","w","w","w","w","g","g","g","g","g","g","g","g","d","d","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","d"],
      ["d","g","g","g","g","g","w","w","w","w","w","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","s","s","s","s","s","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","g","d"],
      ["d","g","g","g","g","g","g","w","w","w","w","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","s","s","s","s","s","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","g","d"],
      ["d","g","g","g","g","g","g","g","w","w","w","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","g","g","g","g","g","g","w","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","g","d","d"],
      ["d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","g","d","d"],
      ["d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d","d","d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","w","w","w","w","w","w","w","w","w","w","w","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","w","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","s","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","d"],
      ["d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d","d"]
    ],
  [
    ["d","d","d"],
    ["d","g","d"],
    ["d","d","d"]
  ],
];
let rarityMaps = [
  [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0],
      [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,0],
      [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,0],
      [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0,5,5,5,5,5,5,5,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,6,6,6,6,6,6,6,6,6,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,0,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,0,6,6,6,6,6,6,6,6,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,0,0,0,5,5,5,5,5,5,0,0,0,5,5,5,5,5,5,0,0,0,0,6,6,6,6,6,6,6,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,0,0,0,5,5,5,5,5,0,0,0,0,0,0,0,5,5,5,5,5,0,0,0,0,6,6,6,6,6,6,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,0,0,0,5,5,5,5,5,0,0,0,0,0,0,0,0,0,5,5,5,5,5,0,0,0,6,6,6,6,6,6,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,0,0,0,5,5,5,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,0,0,0,6,6,6,6,6,6,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,0,0,0,6,6,6,6,6,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,0,0,5,5,5,0,0,0,0,0,6,6,6,6,0,0,0,0,5,5,5,5,5,0,0,0,0,6,6,6,6,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,0,0,5,5,0,0,0,0,6,6,6,6,6,6,6,0,0,0,5,5,5,5,5,5,0,0,0,6,6,6,6,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,0,0,5,5,0,0,0,6,6,6,6,6,6,6,6,6,0,0,0,5,5,5,5,5,0,0,0,6,6,6,6,0],
      [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,0,0,5,5,0,0,0,6,6,6,6,6,6,6,6,6,0,0,0,5,5,5,5,5,0,0,0,6,6,6,6,0],
      [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,0,0,5,5,0,0,0,0,6,6,6,0,6,6,6,6,0,0,0,0,5,5,5,5,0,0,0,6,6,6,6,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,0,0,5,5,5,0,0,0,6,6,6,0,0,0,6,6,0,0,0,0,5,5,5,5,0,0,0,6,6,6,6,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,1,1,0,0,0,0,1,0,0,0,0,0,0,1,1,1,1,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,0,0,5,5,5,0,0,0,6,6,6,6,0,0,0,6,6,0,0,0,5,5,5,5,0,0,0,6,6,6,6,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,4,0,0,0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,0,0,5,5,5,0,0,0,5,5,5,5,0,0,0,0,6,0,0,0,0,5,5,5,5,0,0,0,6,6,6,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,4,0,0,0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,0,0,5,5,5,0,0,0,0,5,5,5,0,0,0,0,6,6,0,0,0,5,5,5,5,0,0,0,6,6,6,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,4,4,4,4,4,4,0,0,0,0,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,0,0,5,5,5,0,0,0,0,5,5,5,5,0,0,0,6,6,0,0,0,5,5,5,5,0,0,0,6,6,6,0],
      [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,0,0,0,4,4,4,4,4,4,4,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,0,0,5,5,5,0,0,0,0,5,5,5,5,0,0,0,6,6,6,0,0,5,5,5,5,0,0,0,6,6,6,0],
      [0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,4,4,4,4,4,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,0,0,5,5,5,5,0,0,0,5,5,5,5,0,0,0,6,6,6,0,0,5,5,5,5,5,0,0,6,6,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,0,0,5,5,5,0,0,0,5,5,5,5,0,0,0,6,6,6,0,0,5,5,5,5,5,0,0,6,6,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,0,0,5,5,5,5,0,0,5,5,5,5,0,0,0,6,6,6,0,0,0,5,5,5,5,0,0,6,6,6,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,0,0,0,5,5,5,5,5,5,5,5,5,0,0,0,6,6,6,0,0,0,5,5,5,5,0,0,6,6,6,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,0,0,0,5,5,5,5,5,5,5,5,5,0,0,0,6,6,6,0,0,0,5,5,5,5,0,0,6,6,6,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,0,0,0,0,5,5,5,5,5,5,5,0,0,0,6,6,6,6,0,0,0,5,5,5,5,0,0,6,6,6,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,0,0,0,0,5,5,5,5,5,0,0,0,0,6,6,6,6,6,0,0,5,5,5,5,0,0,6,6,6,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,0,0,0,5,5,5,5,0,0,6,6,6,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,0,0,0,5,5,5,5,0,0,6,6,6,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,0,0,0,5,5,5,5,0,0,6,6,6,0],
      [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,0,0,0,5,5,5,5,0,0,6,6,6,0],
      [0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,5,5,5,5,0,0,6,6,6,0],
      [0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,5,5,5,5,5,0,0,0,6,6,0],
      [0,0,0,0,0,0,3,3,3,3,3,1,0,0,0,0,0,0,0,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,5,5,5,5,5,0,0,0,6,6,0],
      [0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,5,5,5,5,5,0,0,0,6,6,0],
      [0,0,0,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,0,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,5,5,5,5,5,5,0,0,0,6,6,0],
      [0,0,0,0,3,3,3,3,3,3,0,0,0,0,0,0,0,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,5,5,5,5,5,5,0,0,6,6,6,0],
      [0,0,0,0,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,5,5,5,5,5,5,0,0,6,6,6,0],
      [0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,5,5,5,5,5,5,0,0,6,6,6,0],
      [0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,5,5,5,5,5,5,0,0,0,6,6,0],
      [0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0,5,5,5,5,5,5,0,0,0,6,6,0],
      [0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0,5,5,5,5,5,5,0,0,0,0,6,6,0],
      [0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,0,0,0,0,0,0,5,5,5,5,5,5,0,0,0,0,6,6,0],
      [0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,0,0,0,0,0,0,0,0,6,6,6,6,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,0,0,0,0,6,6,6,0],
      [0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,0,0,0,0,6,6,6,0],
      [0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,0,0,0,0,0,6,6,6,0],
      [0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,0,0,0,0,0,6,6,6,0],
      [0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,5,5,5,5,5,5,5,5,0,0,0,0,6,6,6,6,0],
      [0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,5,5,5,5,5,5,0,0,0,0,0,6,6,6,6,0],
      [0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,5,5,5,5,5,5,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,0,0,0,0,6,6,6,6,6,0],
      [0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,5,5,5,5,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,0,0,0,0,0,6,6,6,6,6,0],
      [0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,5,5,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,6,6,6,6,6,0],
      [0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,6,6,6,6,6,6,0],
      [0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,6,6,6,6,6,6,6,0],
      [0,8,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,0],
      [0,8,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,0],
      [0,8,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,0],
      [0,8,8,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,0],
      [0,8,8,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,0],
      [0,8,8,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,0],
      [0,8,8,8,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0],
      [0,8,8,8,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,0],
      [0,8,8,8,8,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,6,6,6,6,6,6,6,6,6,6,6,6,0],
      [0,8,8,8,8,8,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,6,6,6,6,6,6,6,6,0],
      [0,8,8,8,8,8,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,6,6,6,0],
      [0,8,8,8,8,8,8,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0],
      [0,8,8,8,8,8,8,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0],
      [0,8,8,8,8,8,8,8,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0],
      [0,8,8,8,8,8,8,8,8,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0],
      [0,8,8,8,8,8,8,8,8,8,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0],
      [0,8,8,8,0,0,8,8,8,8,8,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0],
      [0,8,8,8,0,0,0,8,8,8,8,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,7,7,7,7,7,7,7,7,7,7,7,0],
      [0,8,8,8,0,0,0,0,0,8,8,8,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,0],
      [0,8,8,0,0,0,0,0,0,0,8,8,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,0],
      [0,8,8,0,0,0,0,0,0,0,8,8,8,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,0],
      [0,8,8,0,0,0,0,0,0,0,0,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,0],
      [0,8,8,0,0,0,0,0,0,0,0,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,0],
      [0,8,8,0,0,0,0,0,0,0,0,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,0],
      [0,8,8,8,0,0,0,0,0,0,0,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,0],
      [0,8,8,8,0,0,0,0,0,0,0,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,0],
      [0,8,8,8,0,0,0,0,0,0,0,8,8,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,0],
      [0,8,8,8,8,0,0,0,0,0,0,8,8,8,8,8,8,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,0],
      [0,8,8,8,8,8,0,0,0,0,0,8,8,8,8,8,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,0],
      [0,8,8,8,8,8,8,0,0,0,0,8,8,8,8,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,0],
      [0,8,8,8,8,8,8,8,0,0,0,8,8,8,8,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,0],
      [0,8,8,8,8,8,8,8,8,8,0,8,8,8,8,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,0,0],
      [0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,0,0],
      [0,8,8,8,8,8,8,8,8,8,8,8,8,8,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,0],
      [0,8,8,8,8,8,8,8,8,8,8,8,8,8,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,0],
      [0,8,8,8,8,8,8,8,8,8,8,8,8,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,0],
      [0,8,8,8,8,8,8,8,8,8,8,8,8,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,0],
      [0,0,8,8,8,8,8,8,8,8,8,8,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0],
      [0,0,8,8,8,8,8,8,8,8,8,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0],
      [0,8,8,8,8,8,8,8,8,8,8,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0],
      [0,8,8,8,8,8,8,8,8,8,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  ],
];

// drawing health bar
function drawHealthBar(entity) {
  const bw = entity.size * 2;
  const bh = 6;
  const bx = entity.x - entity.size;
  const by = entity.y + entity.size + 20;
  const ratio = Math.max(0, entity.health / entity.maxHealth);

  ctx.fillStyle = "#333";
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = ratio > 0.5 ? "#0f0" : ratio > 0.25 ? "#ff0" : "#f00";
  ctx.fillRect(bx, by, bw * ratio, bh);
  
  if(entity.type!=="player"){
    ctx.textAlign = "center";
    ctx.font = "20px monospace"
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillText(entity.type, entity.x+entity.size, entity.y-entity.size-14)
    ctx.fillStyle = rarityColors[entity.rarity-1];
    ctx.fillText(rarityNames[entity.rarity-1], entity.x-entity.size, entity.y-entity.size-14)
  }
  
}

//entity
function Entity(type, x, y, rarity) {
  this.type = type;
  this.x = x;
  this.y = y;
  this.vx = 0;
  this.vy = 0;
  this.othervx = 0;
  this.othervy = 0;
  this.angle = 0;
  this.size = entityTypes[type].size;
  this.speed = entityTypes[type].speed;
  this.weight = entityTypes[type].weight;
  this.behavior = entityTypes[type].behavior;
  this.maxHealth = entityTypes[type].maxHealth;
  this.health = this.maxHealth;
  this.damage = entityTypes[type].damage || 0;
  this.side = entityTypes[type].side;
  this.rarity = rarity || 1;
  switch(this.rarity){
      case 1: this.rarityMultiplier = 1; break;//common
      case 2: this.rarityMultiplier = 3; break;//unusual
      case 3: this.rarityMultiplier = 9; break;//rare
      case 4: this.rarityMultiplier = 27; break;//epic
      case 5: this.rarityMultiplier = 81; break;//legendary
      case 6: this.rarityMultiplier = 243; break;//mythic
      case 7: this.rarityMultiplier = 1822.5; break;//ultra
      case 8: this.rarityMultiplier = 10935; break;//super
  }

  this.damage*=this.rarityMultiplier;
  this.maxHealth*=this.rarityMultiplier;
  this.health*=this.rarityMultiplier;
  this.size+=this.rarityMultiplier/100000;
  this.weight*=this.rarityMultiplier/5;
}

Entity.prototype.draw = function () {
  entityTypes[this.type].draw.call(this);
};

Entity.prototype.update = function () {
  switch (this.behavior) {
    case "ram": {
      let dx = player.x - this.x;
      let dy = player.y - this.y;
      let dist = Math.hypot(dx, dy);
      if (dist > 1) {
        this.vx += (dx / dist) * 0.5;
        this.vy += (dy / dist) * 0.5;
        let spd = Math.hypot(this.vx, this.vy);
        if (spd > this.speed) {          // cap at max speed
          this.vx = (this.vx / spd) * this.speed;
          this.vy = (this.vy / spd) * this.speed;
        }
      }
      break;
    }
    case "mouse": {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let dist = Math.hypot(dx, dy);
      if (dist > this.speed*4) {
        this.vx += (dx / dist) * this.speed;
        this.vy += (dy / dist) * this.speed;
        let spd = Math.hypot(this.vx, this.vy);
        if (spd > this.speed) {          // cap at max speed
          this.vx = (this.vx / spd) * this.speed;
          this.vy = (this.vy / spd) * this.speed;
        }
      }
      break;
    }
  }

  // collisions — push via velocity instead of nudging position directly
  for (let i = 0; i < entities.length; i++) {
    if (entities[i] === this) continue;
    let other = entities[i];
    let dist = distance(this.x, this.y, other.x, other.y);
    if (dist < this.size + other.size && dist > 0.01) {
      let overlap = (this.size + other.size) - dist;
      let nx = (this.x - other.x) / dist;
      let ny = (this.y - other.y) / dist;

      let totalWeight = this.weight + other.weight;
      let myShare    = other.weight / totalWeight;
      let theirShare = this.weight  / totalWeight;

      this.vx  += nx * overlap * myShare;
      this.vy  += ny * overlap * myShare;
      other.vx -= nx * overlap * theirShare;
      other.vy -= ny * overlap * theirShare;

      if(this.side !== other.side){
        this.health -= other.damage;
      }
    }
  }

  // apply velocity then friction
  this.x += this.vx + this.othervx;
  this.y += this.vy + this.othervy;
  this.vx *= 0.85;
  this.vy *= 0.85;
  this.othervx *= 0.95;
  this.othervy *= 0.95;

  // update angle to match movement direction
  if (Math.hypot(this.vx, this.vy) > 0.1) {
    this.angle = Math.atan2(this.vy, this.vx);
  }
};

// moving dot
function Projectile(x, y, dx, dy) {
  this.x = x;
  this.y = y;
  this.dx = dx;
  this.dy = dy;
  this.speed = 14;
  this.damage = 25;
  this.size = 6;
  this.range = 650;
  this.traveled = 0;
  this.dead = false;
  this.angle = Math.atan2(dy, dx);
}

Projectile.prototype.update = function () {
  this.x += this.dx * this.speed;
  this.y += this.dy * this.speed;
  this.traveled += this.speed;

  if (
    this.traveled > this.range ||
    this.x < 0 || this.x > canvas.width ||
    this.y < 0 || this.y > canvas.height
  ) {
    this.dead = true;
    return;
  }
};

Projectile.prototype.draw = function () {
  ctx.fillStyle = "cyan";
  ctx.shadowColor = "cyan";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
};

//tiles
function tile(x,y,type){
  this.x = x;
  this.y = y;
  this.type = type;
  this.isSolid = tileTypes[type].isSolid;
  this.rarity = 0;
}

tile.prototype.update = function(){
  //collsions
  for(let i = 0; i < entities.length; i++){
    if(!this.isSolid) continue;
    let e = entities[i];
    let overlapX = Math.min(e.x + e.size, this.x + 500) - Math.max(e.x - e.size, this.x);
    let overlapY = Math.min(e.y + e.size, this.y + 500) - Math.max(e.y - e.size, this.y);
    if(overlapX > 0 && overlapY > 0){
      if(overlapX < overlapY){
        if(e.x < this.x + 250){ e.x -= overlapX; e.vx = Math.min(e.vx, 0); }
        else { e.x += overlapX; e.vx = Math.max(e.vx, 0); }
      } else {
        if(e.y < this.y + 250){ e.y -= overlapY; e.vy = Math.min(e.vy, 0); }
        else { e.y += overlapY; e.vy = Math.max(e.vy, 0); }
      }
    }
  }
  //spawning
  if(Math.random()<0.000001&&this.rarity!==0&&entities.length<500){
    entities.push(new Entity("soldierAnt", this.x+Math.random()*500,this.y+Math.random()*500,this.rarity));
  }
}

tile.prototype.draw = function (){
  tileTypes[this.type].draw.call(this);
}

//petals
function Petal(orbitRadius, orbitSpeed, index, type, side, rarity, totalSlots, subIndex, subTotal) {
  this.type = type;
  this.index = index;
  this.totalSlots = totalSlots || 1;
  this.subIndex = subIndex || 0;
  this.subTotal = subTotal || 1;
  this.clumpAngle = (Math.PI * 2 / this.subTotal) * this.subIndex;
  this.orbitRadius = orbitRadius;
  this.currentRadius = 0;
  this.orbitSpeed = orbitSpeed;
  this.size = petalTypes[this.type].size;
  this.damage = petalTypes[this.type].damage;
  this.reloadTime = petalTypes[this.type].reloadTime;
  this.reloadTimer = 0;
  this.alive = true;
  this.spawning = true;
  this.maxHealth = petalTypes[this.type].health;
  this.weight = petalTypes[this.type].weight;
  this.health = this.maxHealth;
  this.class = petalTypes[this.type].class;
  this.heal = petalTypes[this.type].heal;
  this.side = side;
  this.aliveTimer = 0;
  this.hitTick = 0;
  this.rarity = rarity;
  this.rarityMultiplier = 3 ** (this.rarity - 1);
  this.clumpType = petalTypes[this.type].clumpType || "clump";
  this.x = player.x;
  this.y = player.y;
  this.angle = 0;
  this.vx = 0; 
  this.vy = 0;
  this.attraction = petalTypes[this.type].attraction;
  this.shouldAttract = false;

  //offsets
  this.ox = 0;
  this.oy = 0;

  this.damage *= this.rarityMultiplier;
  this.maxHealth *= this.rarityMultiplier;
  this.health *= this.rarityMultiplier;
  this.weight *= this.rarityMultiplier/4;

  if (this.class === "heal") {
    this.heal *= this.rarityMultiplier;
  }
}

Petal.prototype.update = function () {
  if (!this.alive) {
    this.reloadTimer--;
    if (this.reloadTimer <= 0) {
      this.alive = true;
      this.spawning = true;
      this.currentRadius = 0;
      this.health = this.maxHealth;
      this.aliveTimer = 0;
      this.vx = 0; this.vy = 0;
      this.ox = 0; this.oy = 0;
    }
    return;
  }

  if (this.spawning) {
    this.currentRadius += (this.orbitRadius - this.currentRadius) * 0.12;
    if (this.orbitRadius - this.currentRadius < 0.5) {
      this.currentRadius = this.orbitRadius;
      this.spawning = false;
    }
  }

  // snap radius toward target
  if (this.currentRadius !== this.orbitRadius) {
    this.currentRadius += (this.orbitRadius - this.currentRadius) * 0.12;
    if (Math.abs(this.orbitRadius - this.currentRadius) < 0.5)
      this.currentRadius = this.orbitRadius;
  }

  // healing
  if (this.class === "heal") {
    if (player.health < entityTypes[player.type].maxHealth) { this.aliveTimer++; }
    if (this.aliveTimer >= 20) { this.orbitRadius = 0; }
    if (this.aliveTimer >= 100) {
      player.health += this.heal;
      if (player.health > entityTypes[player.type].maxHealth)
        player.health = entityTypes[player.type].maxHealth;
      this.health = 0;
      this.aliveTimer = 0;
    }
  }

  // use totalSlots so sub-petals don't compress the angular spacing
  let myAngle = petalAngle + (Math.PI * 2 / this.totalSlots) * this.index;
  this.angle = myAngle;
  let orbitX = player.x + Math.cos(myAngle) * this.currentRadius;
  let orbitY = player.y + Math.sin(myAngle) * this.currentRadius;

  if (!this.spawning && this.hitTick <= 0) {
    //attraction
    for (let i = 0; i < entities.length; i++){
      if(entities[i].side !== this.side){
        let dx = entities[i].x - this.x;
        let dy = entities[i].y - this.y;
        let dist = Math.hypot(dx, dy);
        if (dist < this.attraction && dist > 0.01){
          let force = (1 - dist / this.attraction) * 10;  // stronger near enemy
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
          this.shouldAttract = true;
        }
      }
    }
  }

  // spring: pull offset back toward orbit anchor
  if(!this.shouldAttract){
    this.vx += -this.ox * 0.3;
    this.vy += -this.oy * 0.3;
  }
  this.shouldAttract = false;
  // apply and damp
  this.ox += this.vx;
  this.oy += this.vy;
  this.vx *= 0.6;
  this.vy *= 0.6;

  // each sub-petal positions itself — clump/linear logic lives here now
  if (this.subTotal > 1) {
    switch (this.clumpType) {
      case "clump":
        this.clumpAngle += 0.05;
        const clumpR = this.size * 2.5;
        this.x = orbitX + this.ox + Math.cos(this.clumpAngle) * clumpR;
        this.y = orbitY + this.oy + Math.sin(this.clumpAngle) * clumpR;
      break;
      case "linear":
        const totalPieces = this.totalSlots * this.subTotal;
        const globalIndex = this.index * this.subTotal + this.subIndex;
        const a = petalAngle + (Math.PI * 2 / totalPieces) * globalIndex;
        this.x = player.x + Math.cos(a) * this.currentRadius + this.ox;
        this.y = player.y + Math.sin(a) * this.currentRadius + this.oy;
      break;
    }
  } else {
    this.x = orbitX + this.ox;
    this.y = orbitY + this.oy;
  }

  if (this.spawning) return;

  if (this.hitTick > 0) this.hitTick--;

  // collisions
  for (let i = entities.length - 1; i >= 0; i--) {
    let other = entities[i];
    let dist = distance(this.x, this.y, other.x, other.y);
    if (dist < this.size + other.size && dist > 0.01) {
      let overlap = (this.size + other.size) - dist;
      let nx = (this.x - other.x) / dist;
      let ny = (this.y - other.y) / dist;

      let totalWeight = this.weight + other.weight;
      let myShare    = other.weight / totalWeight;
      let theirShare = this.weight  / totalWeight;

      let mult = 1;
      //calculating multiplier for petal
      if(this.shouldAttract){
        mult = 0.0;
      }
      // push petal via offset so position recalculates correctly next frame
      this.ox += nx * overlap * myShare * mult;
      this.oy += ny * overlap * myShare * mult;
      // push entity via its own velocity
      other.othervx -= nx * overlap * theirShare * 4;
      other.othervy -= ny * overlap * theirShare * 4;

      if (this.side !== other.side && this.hitTick <= 0) {
        other.health -= this.damage*(this.health/this.maxHealth);
        this.health  -= other.damage;
        this.hitTick = 10;
      }
    }
  }

  if (this.health <= 0) {
    this.alive = false;
    this.reloadTimer = this.reloadTime;
  }
};

Petal.prototype.draw = function () {
  if (!this.alive) return;
  petalTypes[this.type].draw.call(this);
};

//drops
function drop(x,y,type,rarity){
  this.x = x;
  this.y = y;
  this.type = type;
  this.rarity = rarity;
  this.size = petalTypes[this.type].size;
  this.clumpType = petalTypes[this.type].clumpType;
}

drop.prototype.draw = function(){
  ctx.save();

  //background
  ctx.fillStyle = rarityColors[this.rarity - 1];
  ctx.beginPath();
  ctx.rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  ctx.fill();

  //petal
  const amt = petalTypes[this.type].amounts ? petalTypes[this.type].amounts[this.rarity - 1] : 1;
  const clumpR = this.size * 2.5;
  ctx.translate(this.x, this.y);
  if (amt > 1) {
    const spread = this.clumpType === "linear" ? this.size * 2.2 * (amt - 1) / 2 : clumpR + this.size;
    const scale = (this.size * 0.38) / (spread + this.size);
    ctx.scale(scale, scale);
    const prevX = this.x, prevY = this.y;
    for (let j = 0; j < amt; j++) {
      const a = (Math.PI * 2 / amt) * j;
      this.x = Math.cos(a) * clumpR;
      this.y = Math.sin(a) * clumpR;
      petalTypes[this.type].draw.call(this);
    }
    this.x = prevX; this.y = prevY;
  } else {
    this.x = 0; this.y = 0;
    petalTypes[this.type].draw.call(this);
  }
  ctx.restore();
}

drop.prototype.update = function(){
  for(let i = 0; i < entities.length; i++){
    if(entities[i].type==="player"){
      let dx = entities[i].x - this.x;
      let dy = entities[i].y - this.y;
      let dist = Math.hypot(dx, dy);
      if (dist < this.size + entities[i].size && dist > 0.01) {
        //drops.splice(drops.indexOf(this),1);
      }
    }
  }
}
//petal functions
function displayPetal(orbitRadius, orbitSpeed, index, type, side, rarity, totalSlots){
  let p = new Petal(orbitRadius, orbitSpeed, index, type, side, rarity, totalSlots);
  displayPetals.push(p);
}
function renderPetals(){
  for(let i = 0; i < displayPetals.length; i++){
    let dp = displayPetals[i];
    let amt = (petalTypes[dp.type].amounts ? petalTypes[dp.type].amounts[dp.rarity - 1] : 1) || 1;
    for(let j = 0; j < amt; j++){
      petals.push(new Petal(dp.orbitRadius, dp.orbitSpeed, dp.index, dp.type, dp.side, dp.rarity, dp.totalSlots, j, amt));
    }
  }
  console.log(petals.length);
}

//starting entities
let player = new Entity("player", 3000, 3000);
entities.push(player);
for(let i = 0;i<0;i++){
  entities.push(new Entity("tester", 900, 900, 8));
}

// petals settings
let petals = [];
let displayPetals = [];
let petalAngle = 0;             // single shared angle — all petals derive from this
let PETAL_COUNT  = 10;
const ORBIT_RADIUS = 100;
const ORBIT_SPEED  = 0.03;
let maxOrbitRadius = 300;
let minOrbitRadius = 75;
let zoom = 0.1; 

function basicLoad(){
  petals = [];
  displayPetals = [];
  displayPetal(ORBIT_RADIUS, ORBIT_SPEED, 0, "basic",   "player", 2);
  displayPetal(ORBIT_RADIUS, ORBIT_SPEED, 1, "stinger", "player", 2);
  displayPetal(ORBIT_RADIUS, ORBIT_SPEED, 2, "rock",    "player", 2);
  displayPetal(ORBIT_RADIUS, ORBIT_SPEED, 3, "heavy",   "player", 2);
  displayPetal(ORBIT_RADIUS, ORBIT_SPEED, 4, "rose",    "player", 2);
  renderPetals();
}

function fillAll(type, rarity){
  petals = [];
  displayPetals = [];
  for(let i = 0; i < PETAL_COUNT; i++){
    displayPetal(ORBIT_RADIUS, ORBIT_SPEED, i, type, "player", rarity, PETAL_COUNT);
  }
  renderPetals();
}
fillAll("basic", 7);
//basicLoad();

function drawPetalSlots(){
  const slotPetals = displayPetals;
  const slotSize = 55;
  const gap = 8;
  const nameH = 16;
  const pad = 10;
  const totalW = slotPetals.length * (slotSize + gap) - gap;
  const startX = (canvas.width - totalW) / 2;
  const startY = canvas.height - slotSize - nameH - pad * 2 - 10;

  for (let i = 0; i < slotPetals.length; i++) {
    const p = slotPetals[i];
    const siblings = petals.filter(q => q.index === p.index && q.type === p.type);
    const sx = startX + i * (slotSize + gap);
    const sy = startY;
    const cx = sx + slotSize / 2;
    const cy = sy + slotSize / 2;
    ctx.shadowColor = rarityColors[p.rarity-1];
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.shadowBlur = 0;  

    // slot background
    ctx.fillStyle = rarityColors[p.rarity-1];
    ctx.beginPath();
    ctx.roundRect(sx, sy, slotSize, slotSize, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(sx, sy, slotSize, slotSize, 8);
    ctx.stroke();

    // draw petal icon (clipped + scaled)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(sx, sy, slotSize, slotSize, 8);
    ctx.clip();
    
    ctx.translate(cx, cy);
    const amt = siblings.length;
    if (amt <= 1) {
      const scale = (slotSize * 0.22) / p.size;
      ctx.scale(scale, scale);
      const prevX = p.x, prevY = p.y;
      p.x = 0; p.y = 0;
      petalTypes[p.type].draw.call(p);
      p.x = prevX; p.y = prevY;
    } else {
      const clumpR = p.size * 2.5;
      const spread = p.clumpType === "linear" ? p.size * 2.2 * (amt - 1) / 2 : clumpR + p.size;
      const scale = (slotSize * 0.38) / (spread + p.size);
      ctx.scale(scale, scale);
      const prevX = p.x, prevY = p.y;
      for (let j = 0; j < amt; j++) {
        const a = (Math.PI * 2 / amt) * j;
        p.x = Math.cos(a) * clumpR;
        p.y = Math.sin(a) * clumpR;
        petalTypes[p.type].draw.call(p);
      }
      p.x = prevX; p.y = prevY;
    }
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.restore();

    // overlays drawn in screen space, also clipped to slot
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(sx, sy, slotSize, slotSize, 8);
    ctx.clip();

    if (siblings.some(q => !q.alive)) {
      // dark overlay + reload arc
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(sx, sy, slotSize, slotSize);
      const deadSibling = siblings.find(q => !q.alive);
      const progress = deadSibling ? 1 - (deadSibling.reloadTimer / deadSibling.reloadTime) : 0;
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, slotSize * 0.28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();
    } else {
      const totalHealth = siblings.reduce((sum, q) => sum + q.health, 0);
      const totalMaxHealth = siblings.reduce((sum, q) => sum + q.maxHealth, 0);
      const ratio = 1 - (totalHealth / totalMaxHealth);
      const drainH = slotSize * ratio;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(sx, sy, slotSize, drainH);
    }
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.restore();

    // petal type name
    ctx.fillStyle = "white";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(p.type, cx, sy + slotSize + nameH);
  }
  ctx.textAlign = "left";
}

// input
let keys = {};
document.addEventListener("keydown", e => { keys[e.key] = true; });
document.addEventListener("keyup",   e => { keys[e.key] = false; });

let mouse = { x: 0, y: 0 };
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left - canvas.width / 2) / zoom + player.x;
  mouse.y = (e.clientY - rect.top - canvas.height / 2) / zoom + player.y;
});

// display
function drawDisplay() {
  ctx.fillStyle = "white";
  ctx.font = "20px monospace";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 14, 32);

  const bw = 220, bh = 18;
  const bx = canvas.width / 4 - bw / 2;
  const by = canvas.height - (canvas.height * 0.95);
  const ratio = Math.max(0, player.health / player.maxHealth);

  ctx.fillStyle = "#333";
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = ratio > 0.5 ? "#0f0" : ratio > 0.25 ? "#ff0" : "#f00";
  ctx.fillRect(bx, by, bw * ratio, bh);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(bx, by, bw, bh);

  ctx.fillStyle = "white";
  ctx.font = "13px monospace";
  ctx.textAlign = "center";
  ctx.fillText("HP  " + Math.ceil(player.health) + " / " + player.maxHealth, canvas.width / 2, by + bh + 16);
  ctx.textAlign = "left";

  //calling
  drawPetalSlots();
}

//tiles
function loadMap(num){
  tiles = [];
  for(let i = 0; i < maps[num].length; i++){
    for(let j = 0; j < maps[num][i].length; j++){
      switch(maps[num][i][j]){
        case "g":
          tiles.push(new tile(j*500, i*500, "grass"));
        break;
        case "d":
          tiles.push(new tile(j*500, i*500, "dirt"));
        break;
        case "s": 
          tiles.push(new tile(j*500, i*500, "stone_wall"));
        break;
        case "w":
          tiles.push(new tile(j*500, i*500, "water"));
        break;
      }
    }
  }

  //rarities
  for(let i = 0;i< rarityMaps[num].length;i++){
    for(let j = 0;j<rarityMaps[num][i].length;j++){
      tiles[i*rarityMaps[num][i].length+j].rarity = rarityMaps[num][i][j];
    }
  }
}
loadMap(0);

//game loop
function update() {
  if (player.health <= 0) { gameOver = true; return; }

  for(let i = 0; i < tiles.length; i++){
    tiles[i].draw();
  }

  for (let i = entities.length - 1; i >= 0; i--) {
    entities[i].update();
    entities[i].draw();
  }

  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].update();
    if (!projectiles[i].dead) projectiles[i].draw();
    else projectiles.splice(i, 1);
  }

  petalAngle += ORBIT_SPEED;
  for (let i = 0; i < petals.length; i++) {
    petals[i].update();
    if(petals[i].alive){petals[i].draw()}
  }

  for (let i = drops.length - 1; i >= 0; i--) {
    drops[i].update();
    drops[i].draw();
  }

  //updating after petals
  for(let i = 0; i < tiles.length; i++){
    tiles[i].update();
  }

  //killing undead stuff
  for (let i = entities.length - 1; i >= 0; i--) {
    const e = entities[i];

    if (e.health <= 0 && e.type !== "player") {
      const typeData = entityTypes[e.type];

      console.log("Entity died:", e.type);

      if (typeData && typeData.drops) {
        console.log("Drops found:", typeData.drops);

        for (let j = 0; j < typeData.drops.length; j++) {
          const dropData = typeData.drops[j];

          const dropType = dropData[0];
          const min = dropData[1];
          const max = dropData[2];

          const amount = Math.floor(Math.random() * (max - min + 1)) + min;

          console.log("Spawning", amount, dropType);

          for (let k = 0; k < amount; k++) {
            drops.push(new drop(e.x, e.y, dropType, e.rarity));
          }
        }
      }

      entities.splice(i, 1);
    }
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "bold 52px monospace";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "26px monospace";
    ctx.fillText("Final score: " + score, canvas.width / 2, canvas.height / 2 + 30);
    return;
  }
  //passive spawning
  /**
  if (Math.random() < 0.1&&entities.length<100){
    let x = 0;
    let y = 0;
    let type = "soldierAnt";
    entities.push(new Entity(type, x, y, 5));
  }
  **/
  //petal radius change
  if (keys[" "]) {
    for (let i = 0; i < petals.length; i++) {
      petals[i].orbitRadius = maxOrbitRadius;
    }
  } else if (keys["Shift"]) {
    for (let i = 0; i < petals.length; i++) {
      petals[i].orbitRadius = minOrbitRadius;
    }
  } else {
    for (let i = 0; i < petals.length; i++) {
      petals[i].orbitRadius = ORBIT_RADIUS;
    }
  }


  //camera
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-player.x, -player.y);
  update();
  ctx.restore();

  //the display
  drawDisplay();

  //stuff for selecting petals
  if(keys["h"]) fillAll("heavy",   7);
  if(keys["b"]) fillAll("basic",   7);
  if(keys["r"]) fillAll("rose",    7);
  if(keys["s"]) fillAll("stinger", 7);
  if(keys["l"]) fillAll("light",   7);
  if(keys["k"]) fillAll("rock",    7);
  if(keys["d"]) fillAll("sand",    7);
  if(keys["n"]) basicLoad();
  if(keys["/"])entities.push(new Entity("soldierAnt", player.x, player.y, 7));
  if(keys["="]) zoom+=0.0005;
  if(keys["-"]) zoom-=0.0005;

  requestAnimationFrame(gameLoop);
}
gameLoop();
console.log(petals.length)
