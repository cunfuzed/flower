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
let score = 0;
let gameOver = false;

//entity stuff
let entityTypes = {
  player: {
    size: 30,
    speed: 1000,
    weight: 100,
    damage: 25,
    maxHealth: 200,
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
    speed: 1.5,
    weight: 5,
    maxHealth: 1000,
    damage: 0,
    behavior: "ram",
    score: 0,
    side: "enemy",
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
  light:{
    health: 1,
    damage: 1,
    reloadTime: 100,
    size: 5,
    weight: 0.01,
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

// drawing health bar
function drawHealthBar(entity) {
  const bw = entity.size * 2;
  const bh = 6;
  const bx = entity.x - entity.size;
  const by = entity.y - entity.size - 14;
  const ratio = Math.max(0, entity.health / entity.maxHealth);

  ctx.fillStyle = "#333";
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = ratio > 0.5 ? "#0f0" : ratio > 0.25 ? "#ff0" : "#f00";
  ctx.fillRect(bx, by, bw * ratio, bh);
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

  for (let i = entities.length - 1; i >= 0; i--) {
    let e = entities[i];
    if (e.type === "player") continue;
    if (distance(this.x, this.y, e.x, e.y) < this.size + e.size) {
      e.health -= this.damage;
      this.dead = true;
      if (e.health <= 0) {
        score += entityTypes[e.type].score;
        entities.splice(i, 1);
      }
      return;
    }
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

//petals
function Petal(orbitRadius, orbitSpeed, index, type, side, rarity) {
  this.type = type;
  this.index = index;
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
  this.amount = petalTypes[this.type].amounts ? petalTypes[this.type].amounts[this.rarity - 1] : 1;
  this.clumpAngle = 0;
  this.subX = [];
  this.subY = [];
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
  // compute orbit anchor
  let myAngle = petalAngle + (Math.PI * 2 / petals.length) * this.index;
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

  // final position = anchor + offset
  this.x = orbitX + this.ox;
  this.y = orbitY + this.oy;

  // update sub-petal positions for clump petals
  if(this.amount>1){
    switch(this.clumpType){ 
        case "clump": 
          this.clumpAngle += 0.05;
          const clumpR = this.size * 2.5;
          this.subX = [];
          this.subY = [];
          for (let j = 0; j < this.amount; j++) {
            let a = this.clumpAngle + (Math.PI * 2 / this.amount) * j;
            this.subX.push(this.x + Math.cos(a) * clumpR);
            this.subY.push(this.y + Math.sin(a) * clumpR);
          }
        break;
        case "linear":
          const angularGap = (this.size * 2.2) / (this.currentRadius || 1);
          const totalSpread = angularGap * (this.amount - 1);
          this.subX = [];
          this.subY = [];
          for (let j = 0; j < this.amount; j++) {
            let a = myAngle - totalSpread / 2 + angularGap * j;
            this.subX.push(player.x + Math.cos(a) * this.currentRadius);
            this.subY.push(player.y + Math.sin(a) * this.currentRadius);
          }
        break;
    }
  }

  if (this.spawning) return;

  if (this.hitTick > 0) this.hitTick--;

  // collisions
  if (this.amount > 1) {
    for (let j = 0; j < this.amount; j++) {
      let sx = this.subX[j];
      let sy = this.subY[j];
      for (let i = entities.length - 1; i >= 0; i--) {
        let other = entities[i];
        let dist = distance(sx, sy, other.x, other.y);
        if (dist < this.size + other.size && dist > 0.01) {
          let nx = (sx - other.x) / dist;
          let ny = (sy - other.y) / dist;
          let overlap = (this.size + other.size) - dist;

          other.othervx -= nx * overlap * 10;
          other.othervy -= ny * overlap * 10;

          if (this.side !== other.side && this.hitTick <= 0) {
            other.health -= this.damage * (this.health / this.maxHealth);
            this.health  -= other.damage;
            this.hitTick = 10;
          }

          if (other.health <= 0) {
            score += entityTypes[other.type].score;
            entities.splice(i, 1);
          }
        }
      }
    }
  } else {
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
        // push petal via offset velocity
        this.x  += nx * overlap * myShare * mult;
        this.y  += ny * overlap * myShare * mult;
        // push entity via its own velocity
        other.othervx -= nx * overlap * theirShare * 10;
        other.othervy -= ny * overlap * theirShare * 10;

        if (this.side !== other.side && this.hitTick <= 0) {
          other.health -= this.damage*(this.health/this.maxHealth);
          this.health  -= other.damage;
          this.hitTick = 10;
        }

        if (other.health <= 0) {
          score += entityTypes[other.type].score;
          entities.splice(i, 1);
        }
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

  const alpha = this.spawning
    ? this.currentRadius / this.orbitRadius
    : 1;

  if (this.amount > 1) {
    const anchorX = this.x;
    const anchorY = this.y;
    for (let j = 0; j < this.amount; j++) {
      this.x = this.subX[j];
      this.y = this.subY[j];
      petalTypes[this.type].draw.call(this);
    }
    this.x = anchorX;
    this.y = anchorY;
  } else {
    petalTypes[this.type].draw.call(this);
  }
};

//starting entities
let player = new Entity("player", 900, 900);
entities.push(player);
entities.push(new Entity("tester", 0, 0, 8));

// petals settings
let petals = [];
let petalAngle = 0;             // single shared angle — all petals derive from this
let PETAL_COUNT  = 10;
const ORBIT_RADIUS = 100;
const ORBIT_SPEED  = 0.03;
let maxOrbitRadius = 300;
let minOrbitRadius = 75;
let zoom = 0.5; 

function basicLoad(){
  petals[0] = new Petal(ORBIT_RADIUS, ORBIT_SPEED, 0, "basic", "player",2);
  petals[1] = new Petal(ORBIT_RADIUS, ORBIT_SPEED, 1, "stinger", "player",2);
  petals[2] = new Petal(ORBIT_RADIUS, ORBIT_SPEED, 2, "rock", "player",2);
  petals[3] = new Petal(ORBIT_RADIUS, ORBIT_SPEED, 3, "heavy", "player",2);
  petals[4] = new Petal(ORBIT_RADIUS, ORBIT_SPEED, 4, "rose", "player",2);
}

function fillAll(){
  for(let i = 0;i<PETAL_COUNT;i++){
    petals.push(new Petal(ORBIT_RADIUS, ORBIT_SPEED, i, "light", "player",4));
  }
}
fillAll();
//basicLoad();


//drawing the petal slots
function drawPetalSlots(){
  const slotSize = 55;
  const gap = 8;
  const nameH = 16;
  const pad = 10;
  const totalW = petals.length * (slotSize + gap) - gap;
  const startX = (canvas.width - totalW) / 2;
  const startY = canvas.height - slotSize - nameH - pad * 2 - 10;

  for (let i = 0; i < petals.length; i++) {
    const p = petals[i];
    const sx = startX + i * (slotSize + gap);
    const sy = startY;
    const cx = sx + slotSize / 2;
    const cy = sy + slotSize / 2;

    // slot background
    ctx.fillStyle = "rgba(255,255,255,0.12)";
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
    const scale = (slotSize * 0.22) / p.size;
    ctx.scale(scale, scale);
    const prevX = p.x, prevY = p.y;
    p.x = 0; p.y = 0;
    petalTypes[p.type].draw.call(p);
    p.x = prevX; p.y = prevY;
    ctx.restore();

    // overlays drawn in screen space, also clipped to slot
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(sx, sy, slotSize, slotSize, 8);
    ctx.clip();

    if (!p.alive) {
      // dark overlay + reload arc
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(sx, sy, slotSize, slotSize);
      const progress = 1 - (p.reloadTimer / p.reloadTime);
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, slotSize * 0.28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();
    } else {
      const ratio = 1 - (p.health / p.maxHealth);
      const drainH = slotSize * ratio;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(sx, sy, slotSize, drainH);
    }

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

//game loop
function update() {
  if (player.health <= 0) { gameOver = true; return; }

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

  //killing undead stuff
  for (let i = 0;i<entities.length;i++){
    if(entities[i].health<=0&&entities[i].type!=="player"){
      score += entityTypes[entities[i].type].score;
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
  if (Math.random() < 0.1&&entities.length<100){
    let x = 0;
    let y = 0;
    let type = "soldierAnt";
    entities.push(new Entity(type, x, y, 3));
  }
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
  if(keys["h"]){
    petals = [];
    for(let i = 0;i<PETAL_COUNT;i++){
      petals.push(new Petal(ORBIT_RADIUS, ORBIT_SPEED, i, "heavy", "player",2));
    }
  }
  if(keys["b"]){
    petals = [];
    for(let i = 0;i<PETAL_COUNT;i++){
      petals.push(new Petal(ORBIT_RADIUS, ORBIT_SPEED, i, "basic", "player",2));
    }
  }
  if(keys["r"]){
    petals = [];
    for(let i = 0;i<PETAL_COUNT;i++){
      petals.push(new Petal(ORBIT_RADIUS, ORBIT_SPEED, i, "rose", "player",2));
    }
  }
  if(keys["s"]){
    petals = [];
    for(let i = 0;i<PETAL_COUNT;i++){
      petals.push(new Petal(ORBIT_RADIUS, ORBIT_SPEED, i, "stinger", "player",2));
    }
  }
  if(keys["l"]){
    petals = [];
    for(let i = 0;i<PETAL_COUNT;i++){
      petals.push(new Petal(ORBIT_RADIUS, ORBIT_SPEED, i, "light", "player",2));
    }
  }
  if(keys["k"]){
    petals = [];
    for(let i = 0;i<PETAL_COUNT;i++){
      petals.push(new Petal(ORBIT_RADIUS, ORBIT_SPEED, i, "rock", "player",2));
    }
  }

  requestAnimationFrame(gameLoop);
}
gameLoop();
