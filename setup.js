//Vars
let width = window.innerWidth;
let height = window.innerHeight;
const input = {ll: false, l: false, r: false, rr: false};
const g = 2.5;
let space = false;
let canvas;
let ctx;
let imageStatus = {standingSprites: false};

const standingSprites = new Image();
standingSprites.src = 'Soldier Stand.png';
standingSprites.onload = function() {
  imageStatus.standingSprites = true;
};


//Useful Functions
function max(n1, n2) {
  if(n1 > n2) {
    return n1;
  }
  return n2;
}

function min(n1, n2) {
  if(n1 < n2) {
    return n1;
  }
  return n2;
}

function randColor() {
  return 'rgba(' + rand(0,255) + ',' + rand(0,255) + ',' + rand(0,255) + ')';
}

function rand(min, max) {
  return Math.floor(Math.random() * (max-min+1)) + (min);
}
function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

function radToDeg(rad) {
  return rad / Math.PI * 180;
}

function drawLine(x1, y1, x2, y2, style = white, r = 1) {
  ctx.strokeStyle = style;
  ctx.lineWidth = r;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function equals(arr1, arr2) {
  if(arr1.length != arr2.length) {
    return false;
  }
  for(let i = 0; i < arr1.length; i++) {
    if(arr1[i] != arr2[i]) {
      return false;
    }
  }
  return true;
}

function copy(arr) {
  return JSON.parse(JSON.stringify(arr));
}

function remove(arr, n) {
  const i = arr.indexOf(n);
  if(i >= 0) {
    arr.splice(i, 1);
    return true;
  }
  return false;
}

function shuffle(arr) {
  let m = arr.length - 1;
  while(m > 0) {
    const i = rand(0, m);
    const temp = arr[i];
    arr[i] = arr[m];
    arr[m] = temp;
    m--;
  }
  return arr;
}

function intersects(p11, p12, p21, p22) {
  const m1 = (p11.y - p12.y) / (p11.x - p12.x);
  const m2 = (p21.y - p22.y) / (p21.x - p22.x);
  const x = ((m1 * p11.x) - (m2 * p21.x) - p11.y + p21.y) / (m1 - m2);
  if((x > p11.x != x > p12.x) && (x > p21.x != p22.x)) {
    return {'x': x, 'y': m1 * (x - p11.x) + p11.y};
  }
  return false;
}

function meterToPix(n) {
  return n * 20;
}

function pixToMeter(n) {
  return n / 20;
}

//Classes
class Vector {
  constructor(x = 0, y = 0, x0 = 0, y0 = 0) {
    this.x = x - x0;
    this.y = y - y0;
    this.getMag();
  }

  getMag() {
    this.mag = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  normalize() {
    if(this.mag == 0) {
      return;
    }
    this.x /= this.mag;
    this.y /= this.mag;
    this.getMag();
  }

  setMag(mag) {
    this.normalize();
    this.x *= mag;
    this.y *= mag;
    this.mag = mag;
  }

  limit(mag) {
    this.getMag();
    if(this.mag > mag) {
      this.setMag(mag);
    }
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    this.getMag();
  }

  sub(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    this.getMag();
  }
}

class Game {
  constructor() {
    this.player = new Player();
    this.maxVel = meterToPix(1.5);
    this.width = meterToPix(500);
    this.height = meterToPix(100);
    this.sideBuffer = meterToPix(0);
    this.bottomBuffer = meterToPix(4);
    this.wallWidth = meterToPix(3);
    this.gasEnabled = false;
    this.houses = [];
    this.addHouse(100);
    this.titans = [new Titan()];
    this.counter = 0;
  }

  addHouse(n = 1) {
    for(let i = 0; i < n; i++) {
      const house = [];
      const width = rand(10, 20);
      const height = rand(20, pixToMeter(this.height) - 20);
      const x = rand(0, pixToMeter(this.width) - width);
      house.push(meterToPix(width));
      house.push(meterToPix(height));
      house.push(meterToPix(x));
      this.houses.push(house);
    }
  }

  step() {
    const grav = new Vector(0, meterToPix(g));
    this.player.applyForce(grav, 60);

    //Pull with grapples
    if(space && (!this.gasEnabled || this.player.gas > 0)) {
      for(let dir in this.player.grapples) {
        const grapple = this.player.grapples[dir];
        if(grapple && !grapple.shooting && !grapple.retracting) {
          const force = new Vector(grapple.endPos.x, grapple.endPos.y, this.player.pos.x, this.player.pos.y);
          force.setMag(meterToPix(4));
          this.player.applyForce(force, 60);
          if(this.gasEnabled) {
            this.player.gas -= .0005;
          }
        }
      }
    }

    //Update Player position and check for edges
    this.player.vel.add(this.player.accel);
    this.player.vel.limit(this.maxVel);

    this.player.pos.add(this.player.vel);
    this.player.accel = new Vector();

    if(this.player.pos.y + this.player.height / 2 > this.height) {
      this.player.pos.y = this.height - this.player.height / 2;
      this.player.vel.y = 0;
      if(this.player.numGrapples == 0 && space) {
        this.player.vel.x *= .95;
        if(Math.abs(this.player.vel.x) < .5) {
          this.player.vel.x = 0;
        }
      }
      this.player.gas += .01;
      this.player.gas = min(1, this.player.gas);
    }
    if(this.player.pos.x + this.player.height / 2 > this.width) {
      this.player.pos.x = this.width - this.player.height / 2;
      this.player.vel.x = 0;
    }
    if(this.player.pos.x - this.player.height / 2 < 0) {
      this.player.pos.x = this.player.height / 2;
      this.player.vel.x = 0;
    }

    //Update all grapples with input
    for(let dir in input) {
      const grapple = this.player.grapples[dir];
      if(input[dir] != !!grapple) {
        if(input[dir] && this.player.numGrapples < 2) {
          this.player.numGrapples += 1;
          this.player.grapples[dir] = new Grapple(dir, this.player.grappleAngle);
        }
        if(!input[dir] && !grapple.retracting) {
          grapple.retracting = true;
          if(!grapple.shooting) {
            grapple.endPos = new Vector(grapple.endPos.x, grapple.endPos.y, this.player.pos.x, this.player.pos.y);
          }
          grapple.shooting = false;
        }
      }
      if(this.player.grapples[dir]) {
        if(grapple.shooting) {
          grapple.endPos.add(grapple.vel);
          if(grapple.endPos.mag > grapple.length) {
            grapple.shooting = false;
            grapple.endPos.limit(grapple.length);
            grapple.endPos.add(this.player.pos);
          }
        }
        if(grapple.retracting) {
          const vel = grapple.endPos.copy();
          vel.setMag(100);
          vel.limit(grapple.endPos.mag);

          grapple.endPos.sub(vel);

          if(grapple.endPos.mag <= 1) {
            this.player.grapples[dir] = false;
            this.player.numGrapples -= 1;
          }
        }
      }
    }

    for(let titan of this.titans) {
      if(titan.x < this.player.pos.x) {
        titan.vel += .2;
      } else {
        titan.vel -= .2;
      }
      titan.vel = max(min(titan.maxVel, titan.vel), -titan.maxVel);
      titan.x += titan.vel;
    }
  }

  draw() {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    //Move Camera
    let point = [this.player.pos.x - (width / 2), this.player.pos.y - (height / 2)];
    point[0] = min(max(point[0], -this.sideBuffer), this.width + this.sideBuffer - width);
    point[1] = min(max(0, point[1]), this.height + this.bottomBuffer - height);
    ctx.translate(-point[0], -point[1]);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';

    //Draw Ground And Walls
    ctx.beginPath();
    ctx.moveTo(-this.sideBuffer, this.height);
    ctx.lineTo(this.width + this.sideBuffer, this.height);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, this.height);
    ctx.moveTo(this.width, 0);
    ctx.lineTo(this.width, this.height);
    ctx.stroke();

    for(let house of this.houses) {
      ctx.clearRect(house[2], this.height - house[1], house[0], house[1]);
      ctx.beginPath();
      ctx.moveTo(house[2], this.height);
      ctx.lineTo(house[2], this.height - house[1]);
      ctx.lineTo(house[2] + house[0], this.height - house[1]);
      ctx.lineTo(house[2] + house[0], this.height);
      ctx.stroke();
    }

    ctx.lineWidth = 2;
    ctx.fillStyle = 'maroon';

    for(let titan of this.titans) {
      const headDiam = titan.height / 8;
      const shoulderDiam = headDiam * 1.25;
      const headGap = headDiam * .7;
      ctx.beginPath();
      ctx.arc(titan.x, this.height - titan.height, headDiam / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(titan.x - shoulderDiam / 2, this.height - titan.height + headGap, shoulderDiam, titan.height - headGap);
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';


    //Draw player
    if(imageStatus.standingSprites) {
      const r = this.player.height / 2;
      ctx.drawImage(standingSprites, Math.floor(this.counter / 30) * 64, 0, 64, 64, this.player.pos.x - r, this.player.pos.y - r, this.player.height, this.player.height);
      this.counter = (this.counter + 1) % 60;
    } else {
      ctx.beginPath();
      ctx.arc(this.player.pos.x, this.player.pos.y, this.player.height / 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    for(const dir in this.player.grapples) {
      const grapple = this.player.grapples[dir];
      if(!grapple) {
        continue;
      }
      if(grapple.shooting || grapple.retracting) {
        ctx.beginPath();
        ctx.moveTo(this.player.pos.x, this.player.pos.y);
        ctx.lineTo(grapple.endPos.x + this.player.pos.x, grapple.endPos.y + this.player.pos.y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(this.player.pos.x, this.player.pos.y);
        ctx.lineTo(grapple.endPos.x, grapple.endPos.y);
        ctx.stroke();
      }
    }

    if(this.gasEnabled) {
      const distFromEdge = 10;
      const barHeight = 10;
      const barWidth = 50;
      ctx.strokeRect(point[0] + distFromEdge + 1, point[1] + height - barHeight - distFromEdge - 1, barWidth, barHeight);
      ctx.fillStyle = 'white';
      ctx.fillRect(point[0] + distFromEdge + 1, point[1] + height - barHeight - distFromEdge - 1, barWidth * this.player.gas, barHeight);
    }

    ctx.restore();
  }
}

class Player {
  constructor() {
    this.pos = new Vector(500, 500);
    this.vel = new Vector();
    this.height = meterToPix(4);
    this.accel = new Vector(0, 0);
    this.grapples = {ll: false, l: false, r: false, rr: false};
    this.numGrapples = 0;
    this.grappleAngle = 140;
    this.onGround = false;
    this.gas = 1;
  }

  applyForce(force, dt) {
    force.x /= dt;
    force.y /= dt;
    force.getMag();
    this.accel.add(force);
  }

}

class Grapple {
  constructor(dir, angleRange) {
    this.endPos = new Vector();
    this.length = meterToPix(50);
    let angle = 0;
    switch(dir) {
      case 'll':
        angle = 90 + angleRange / 2;
        break;
      case 'l':
        angle = 90 + angleRange / 4;
        break;
      case 'r':
        angle = 90 - angleRange / 4;
        break;
      case 'rr':
        angle = 90 - angleRange / 2;
        break;
    }
    this.vel = new Vector();
    this.vel.x = Math.cos(degToRad(angle)) * 100;
    this.vel.y = -Math.sin(degToRad(angle)) * 100;
    this.vel.getMag();
    this.shooting = true;
    this.retracting = false;
  }
}

class Titan {
  constructor() {
    const possibleHeights = [30, 40, 60, 70]
    this.height = meterToPix(possibleHeights[rand(0, 3)]);
    this.x = 500;
    this.vel = 0;
    this.maxVel = meterToPix(1);
  }
}
