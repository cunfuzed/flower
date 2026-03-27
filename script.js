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
    speed: 5,
    weight: 5,
    damage: 2,
    maxHealth: 10000,
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
  }
};

//petals 
let petalTypes = {
  basic: {
    health: 5,
    damage: 5,
    reloadTime: 100,
    size: 10,
    weight: 0.2,
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
// Entity constructor — add vx/vy
function Entity(type, x, y) {
  this.type = type;
  this.x = x;
  this.y = y;
  this.vx = 0;
  this.vy = 0;
  this.size = entityTypes[type].size;
  this.speed = entityTypes[type].speed;
  this.weight = entityTypes[type].weight;
  this.behavior = entityTypes[type].behavior;
  this.maxHealth = entityTypes[type].maxHealth;
  this.health = this.maxHealth;
  this.damage = entityTypes[type].damage || 0;
  this.side = entityTypes[type].side;
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
        this.vx += (dx / dist) * 0.5;   // accelerate toward player
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
      if (dist > 0) {
        let move = Math.min(dist, this.speed);  // ← clamp: fixes vibration
        this.vx = (dx / dist) * move;
        this.vy = (dy / dist) * move;
      } else {
        this.vx = 0;
        this.vy = 0;
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
  this.x += this.vx;
  this.y += this.vy;
  this.vx *= 0.8;
  this.vy *= 0.8;
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
function Petal(orbitRadius, orbitSpeed, index, type) {
  this.type = type;
  this.index  = index;
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
  this.x = player.x;
  this.y = player.y;
}

Petal.prototype.update = function () {
  // reload
  if (!this.alive) {
    this.reloadTimer--;
    if (this.reloadTimer <= 0) {
      this.alive = true;
      this.spawning = true;
      this.currentRadius = 0;
      this.health = this.maxHealth;
    }
    return;
  }

  // move somewhere
  if (this.spawning) {
    this.currentRadius += (this.orbitRadius - this.currentRadius) * 0.12;
    if (this.orbitRadius - this.currentRadius < 0.5) {
      this.currentRadius = this.orbitRadius;
      this.spawning = false;
    }
  }

  // nerd stuff
  let myAngle = petalAngle + (Math.PI * 2 / petals.length) * this.index;
  this.x = player.x + Math.cos(myAngle) * this.currentRadius;
  this.y = player.y + Math.sin(myAngle) * this.currentRadius;

  // no hit while ded
  if (this.spawning) return;

  // moving outward if told to
  if(this.currentRadius!==this.orbitRadius){
    if(this.currentRadius<this.orbitRadius){
      this.currentRadius += (this.orbitRadius - this.currentRadius) * 0.12;
      if (this.orbitRadius - this.currentRadius < 0.5) {
        this.currentRadius = this.orbitRadius;
      }
    }
    else{
      this.currentRadius -= (this.currentRadius - this.orbitRadius) * 0.12;
      if (this.currentRadius - this.orbitRadius < 0.5){
        this.currentRadius = this.orbitRadius;
      }
    }
  }

  // collisions
  for (let i = 0; i < entities.length; i++) {
    if (entities[i] === this) continue;
    let other = entities[i];
    let dist = distance(this.x, this.y, other.x, other.y);
    if (dist < this.size + other.size) {
      let overlap = (this.size + other.size) - dist;
      let dx = this.x - other.x;
      let dy = this.y - other.y;

      let totalWeight = this.weight + other.weight;
      let myShare     = other.weight / totalWeight;
      let theirShare  = this.weight  / totalWeight;

      this.x  += (dx / dist) * overlap * myShare;
      this.y  += (dy / dist) * overlap * myShare;
      other.vx -= (dx / dist) * overlap * theirShare;
      other.vy -= (dy / dist) * overlap * theirShare;

      this.health -= other.damage;
      other.health -= this.damage;
      if (other.health <= 0){
        score += entityTypes[other.type].score;
        entities.splice(i, 1);
      }
    }
  }

  // ded
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

  petalTypes[this.type].draw.call(this);
};

//starting entities
let player = new Entity("player", 100, 100);
entities.push(player);
entities.push(new Entity("blob",    400, 300));
entities.push(new Entity("speeder", 600, 200));
entities.push(new Entity("tank",    700, 500));

// petals settings
let petals = [];
let petalAngle = 0;             // single shared angle — all petals derive from this
let PETAL_COUNT  = 5;
const ORBIT_RADIUS = 100;
const ORBIT_SPEED  = 0.03;
let maxOrbitRadius = 150;
let minOrbitRadius = 75;

for (let i = 0; i < PETAL_COUNT; i++) {
  petals.push(new Petal(ORBIT_RADIUS, ORBIT_SPEED, i, "basic"));
}

// input
let keys = {};
document.addEventListener("keydown", e => { keys[e.key] = true; });
document.addEventListener("keyup",   e => { keys[e.key] = false; });

let mouse = { x: 0, y: 0 };
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

let shootCooldown = 0;
canvas.addEventListener("click", () => {
  if (gameOver || shootCooldown > 0) return;
  let dx = mouse.x - player.x;
  let dy = mouse.y - player.y;
  let dist = Math.hypot(dx, dy);
  if (dist === 0) return;
  projectiles.push(new Projectile(player.x, player.y, dx / dist, dy / dist));
  shootCooldown = 12;
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
}

//game loop
function update() {
  if (player.health <= 0) { gameOver = true; return; }
  if (shootCooldown > 0) shootCooldown--;

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
    petals[i].draw();
  }

  //killing undead stuff
  for (let i = 0;i<entities.length;i++){
    if(entities[i].health<=0&&entities[i].type!=="player"){
      score += entityTypes[entities[i].type].score;
      entities.splice(i, 1);
    }
  }

  drawDisplay();
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
  if (Math.random() < 0.01){
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    let type = Math.random() < 0.5 ? "blob" : Math.random() < 0.5 ? "speeder" : "tank";
    entities.push(new Entity(type, x, y));
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
  
  update();
  requestAnimationFrame(gameLoop);
}
gameLoop();
