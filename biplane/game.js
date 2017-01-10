(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function (keys, el, ground, worldHeight) {
  var ctx = el.getContext('2d');
  var i;

  this.height = worldHeight;
  this.ground = ground;
  this.keys = keys;

  this.entities = [];

  this.add = function (e) {
    this.entities.push(e);
  };

  this.remove = function (entity) {
    for (i=0; i<this.entities.length; i++) {
      if (this.entities[i] === entity) {
        this.entities.splice(i, 1);
      }
    }
  };

  this.update = function (dur) {
    el.width = window.innerWidth;
    el.height = window.innerHeight;

    for (i=0; i<this.entities.length; i++) {
      if (this.entities[i].x < 0
          || this.entities[i].x >= ground.length
          || this.entities[i].y < 0
          || this.entities[i].y > worldHeight)
      { 
        this.entities.splice(i, 1);
      } else {
        this.entities[i].update(dur);
      }
    }
  };

  this.depress = function (x, n) {
    x = Math.floor(x);
    var depth = Math.ceil(n/2);
    var start = x - Math.floor(n/2);
    var end = start + n - 1;
    for (var i=start; i<=end; i++) {
      if (this.ground[i]) {
        if (this.ground[i] > 0) {
          if (i < 3650 || i > 3800) {
            this.ground[i] += depth - (Math.abs(x - i));
            if (this.ground[i] > this.height) {
                this.ground[i] = this.height;
            }
          }
        }
      }
    }
  };

  this.draw = function () {
    var i;
    var posX = Math.floor(this.entities[0].x);
    var posY = Math.floor(this.entities[0].y);
    var vw = el.width;
    var vh = el.height;
    var offsetX = posX - Math.floor(vw/2);
    var offsetY = posY - Math.floor(vh/2);
    
    ctx.fillStyle = '#584';
    ctx.strokeStyle = '#453';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.clearRect(0, 0, vw, vh);

    var started = false;
    var firstX;
    var lastX;
    
    for (i=-1; i<=vw; i++) {
      var groundX = i + offsetX;
      var groundY = this.ground[groundX];

      if (groundY) {
        var lineY = groundY - offsetY;

        if (!started) {
          started = true;
          firstX = i;
          ctx.moveTo(i, lineY);
        } else {
          ctx.lineTo(i, lineY);
        }
        lastX = i;
      }
    }

    ctx.lineTo(lastX, vh-1);
    ctx.lineTo(0, vh-1);
    ctx.lineTo(firstX, vh -1);
    ctx.stroke()
    ctx.fill();

    for (i=this.entities.length-1; i>=0; i--) {
      ctx.save();
      ctx.lineWidth = 2;
      ctx.translate(this.entities[i].x - offsetX, this.entities[i].y - offsetY);
      ctx.rotate(this.entities[i].r);
      this.entities[i].draw(ctx);
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = '#444';
    ctx.fillText(
      Math.round(this.entities[0].x) + ',' + Math.round(this.entities[0].y),
      20,
      el.height-20
    );
    ctx.restore();
  };
};


},{}],2:[function(require,module,exports){
var Smoke = require('./Smoke');
var vectors = require('./vectors');

module.exports = function Bomb (world, x, y, v, r) {
  this.collides = true;
  this.x = x;
  this.y = y;

  var vec = vectors.rotate({x: v, y: 0}, r);
  var vx = vec.x;
  var vy = vec.y;
  
  this.r = 0;

  this.draw = function (ctx) {
    ctx.fillStyle = '#555';
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  this.update = function (dur) {
    this.x += vx * dur * 0.9;
    this.y += vy * dur * 0.9;
    vy += 0.0001 * dur;

    for (var i=0; i<world.entities.length; i++) {
      if (world.entities[i] !== this && world.entities[i].collides && world.entities[i].contains(this.x, this.y)) {
        world.entities[i].hit(50);
        world.remove(this);
      }
    }

    if (world.ground[Math.floor(this.x)] < this.y) {
      world.depress(this.x, 80);
      world.remove(this);
      world.add(new Smoke(world, this.x, this.y - 10, 30));
    }
  };

  this.contains = function (x, y) {
    return Math.sqrt(Math.pow(this.x-x, 2) + Math.pow(this.y-y, 2)) < 10;
  };

  this.hit = function (n) {
    world.remove(this);
    world.add(new Smoke(world, this.x, this.y, 30));
  };
};

},{"./Smoke":6,"./vectors":8}],3:[function(require,module,exports){
var vectors = require('./vectors');
var Smoke = require('./Smoke');

module.exports = function Bullet (world, x, y, v, r) {
  this.collides = true;
  this.x = x;
  this.y = y;
  this.r = r;

  var vec = vectors.rotate({x: v, y: 0}, r);
  var vx = vec.x;
  var vy = vec.y;
  
  this.draw = function (ctx) {
    ctx.fillStyle = '#999';
    ctx.beginPath();
    ctx.scale(2,1);
    ctx.arc(0, 0, 3, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
  }

  this.update = function (dur) {
    this.x += vx * dur;
    this.y += vy * dur;
    vy += 0.0001 * dur;

    for (var i=0; i<world.entities.length; i++) {
      if (world.entities[i] !== this && world.entities[i].collides && world.entities[i].contains(this.x, this.y)) {
        world.entities[i].hit(10);
        world.remove(this);
      }
    }

    if (world.ground[Math.floor(this.x)] < this.y) {
      world.depress(this.x, 10);
      world.remove(this);
    }
  };

  this.contains = function (x, y) {
    return Math.sqrt(Math.pow(this.x-x, 2) + Math.pow(this.y-y, 2)) < 5;
  };

  this.hit = function (n) {
    world.remove(this);
    world.add(new Smoke(world, this.x, this.y, 10));
  };
};

},{"./Smoke":6,"./vectors":8}],4:[function(require,module,exports){
var Bullet = require('./Bullet');
var Smoke = require('./Smoke');
var vectors = require('./vectors');

module.exports = function Bunker (world, x) {
  this.collides = true;
  this.x = x;
  this.y = world.ground[x];
  this.r = 0;

  var w = 50;
  var h = 40;

  var alive = true;

  var mayShoot = true;

  this.update = function (dur) {
    var distx = world.entities[0].x - this.x;
    var disty = world.entities[0].y - this.y;
    var dist = Math.sqrt(Math.pow(distx, 2) + Math.pow(disty, 2))
    if (dist < 400) {
      if (mayShoot) {
        mayShoot = false;
        var deviation = Math.random() * Math.PI / 16 + Math.PI / 32;
        var angle = (Math.atan2(disty, distx) + deviation) % (Math.PI * 2);
        var exit = vectors.add({x: this.x, y: this.y}, vectors.rotate({x: w, y: 0}, angle));
        setTimeout(function () {
          if (alive) {
            world.add(new Bullet(world, exit.x, exit.y, 0.25, angle));
          }
        }, Math.random() * 2000);
        setTimeout(function () {
          mayShoot = true;
        }, 3000);
      }
    }
  };

  this.draw = function (ctx) {
    ctx.lineWidth = 2;
    ctx.fillStyle = '#666';
    ctx.strokeStyle = '#444';
    ctx.fillRect(-w/2, -h/2, w, h);
    ctx.strokeRect(-w/2, -h/2, w, h);
  };

  this.contains = function (x, y) {
    var contained = x >= this.x - w/2
        && x <= this.x + w/2
        && y >= this.y - h/2
        && y <= this.y + h/2;
    return contained;
  };

  this.hit = function (n) {
    alive = false;
    world.depress(this.x, 100);
    world.add(new Smoke(world, this.x, this.y, 60));
    world.remove(this);
  };
};

},{"./Bullet":3,"./Smoke":6,"./vectors":8}],5:[function(require,module,exports){
var Bomb = require('./Bomb');
var Bullet = require('./Bullet');
var Smoke = require('./Smoke');
var vectors = require('./vectors');

module.exports = function Plane (world, x, y) {
  var width = 50;
  var height = 20;

  var alive = true;
  var mayBomb = true;
  var mayShoot = true;
  var mayFlip = true;
  var maySmoke = true;
  var inverted = false;
  var crashed = false;

  this.reset = function () {
    this.x = x;
    this.y = y;
    this.r = 63*Math.PI/32;
    this.v = 0;
    this.collides = true;
    inverted = false;
  };

  this.reset();
  
  var that = this;

  var points = [
    {x: -width/2, y: -height/2},
    {x: width/2, y: -height/2},
    {x: width/2, y: height/2},
    {x: -width/2, y: 0},
    {x: -width/3, y: height/2}, // rear landing gear
    {x: width/2.2, y: height}, // front landing gear
  ];

  function localPoints () {
    return points.map(function (p) {
      if (inverted) {
        return vectors.rotate({x: p.x, y: -p.y}, that.r);
      } else {
        return vectors.rotate(p, that.r);
      }
    });
  }

  function globalPoints () {
    return localPoints().map(function (point) {
      return vectors.add({x: that.x, y: that.y}, point);
    });
  }

  this.draw = function (ctx) {
    if (inverted) ctx.scale(1, -1);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#333';

    // gear linkage
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width/3, height/1.4);
    ctx.lineTo(width/2, height/6);
    ctx.stroke();

    // wing linkage
    ctx.beginPath();
    ctx.moveTo(width/4, 0);
    ctx.lineTo(width/4, -height/2.5);
    ctx.moveTo(width/2.8, 0);
    ctx.lineTo(width/2.5, -height/2.5);
    ctx.stroke();

    ctx.strokeStyle = '#222';

    // gear
    ctx.beginPath();
    ctx.arc(width/3, height/1.4, 4, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fillStyle = '#555';
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#c21';
    ctx.strokeStyle = '#610';

    // wing
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width/8, -height/2.5);
    ctx.lineTo(width/2.2, -height/2.5);
    ctx.lineTo(width/2.2, -height/1.7);
    ctx.lineTo(width/8, -height/2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // fuselage
    ctx.lineWidth = 2;
    ctx.moveTo(width/8, -height/2.5);
    ctx.moveTo(0, height/2.5);
    ctx.lineTo(width/4, height/2.5);
    ctx.lineTo(width/2, height/3.0);
    ctx.lineTo(width/2, -height/5);
    ctx.lineTo(width/16, -height/5);
    ctx.lineTo(-width/4, -height/8);
    ctx.lineTo(-width/2.5, -height/2);
    ctx.lineTo(-width/2, -height/2.5);
    ctx.lineTo(-width/2.5, height/3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  this.handleInput = function (dur) {
    if (world.keys.isDown('SPACE')) {
      if (mayShoot) {
        mayShoot = false;

        setTimeout(function () {
          var exit = vectors.add({x: that.x, y: that.y}, vectors.rotate({x: 3*width/4 + width * that.v, y: 0}, that.r));
          var bullet = new Bullet(world, exit.x, exit.y, 1.5, that.r);
          world.add(bullet);
          mayShoot = true;
        }, 125);
      }
    }

    if (world.keys.isDown('B')) {
      if (mayBomb) {
        mayBomb = false;
        var bombRelativePos = vectors.rotate({
          x: 0,
          y: 2 * height * (inverted ? -1 : 1)  + height * this.v
        }, this.r);

        var bombVec = vectors.rotate({x: this.v, y: 0}, this.r);
        var bombPos = vectors.add({x: this.x, y: this.y}, bombRelativePos);
        var bombAngle = Math.atan2(bombVec.y, bombVec.x);
        var bomb = new Bomb(world, bombPos.x, bombPos.y, this.v*0.9, bombAngle);
        world.add(bomb);
        setTimeout(function () {
          mayBomb = true;
        }, 300);
      }
    }

    if (world.keys.isDown('J')) {
      this.v = Math.min(this.v + (dur / 1000), 5);
      if (maySmoke) {
        maySmoke = false;
        world.add(new Smoke(world, this.x, this.y, 8));
        setTimeout(function () {
          maySmoke = true;
        }, 50);
      }
    } else if (world.keys.isDown('X')) {
      this.v += (dur / 3000);
    }

    // handle pitch up/down

    if (world.keys.isDown('LEFT')) {
      this.r -= Math.min(0.3, this.v) * dur / 80 * (inverted ? -1 : 1);
      if (this.r < 0) this.r += Math.PI * 2;
      this.r = this.r % (Math.PI * 2)
      this.v *= Math.pow(0.9998, dur);
    }

    if (world.keys.isDown('RIGHT')) {
      this.r += Math.min(0.3, this.v) * dur / 80 * (inverted ? -1 : 1);
      if (this.r < 0) this.r += Math.PI * 2;
      this.r = this.r % (Math.PI * 2)
      this.v *= Math.pow(0.9998, dur);
    }
    
    if (world.keys.isDown('UP') || world.keys.isDown('DOWN')) {
      if (mayFlip) {
        mayFlip = false;
        inverted = !inverted;
        setTimeout(function () {
          mayFlip = true;
        }, 250);
      }
    }
  };
    
  function noseDown(dur, gradualness) {
    if (that.r > Math.PI / 2 && that.r < 3 * Math.PI / 2) {
      that.r = ((gradualness * that.r) + (dur * Math.PI / 2)) / (gradualness + dur);
    } else if (that.r <= Math.PI / 2) {
      that.r = ((gradualness * that.r) + (dur * Math.PI / 2)) / (gradualness + dur);
    } else if (that.r >= 3 * Math.PI / 2) {
      that.r = ((gradualness * that.r) + (dur * 5 * Math.PI / 2)) / (gradualness + dur);
    }
    that.r = that.r % (2*Math.PI)
  }

  this.update = function (dur) {
    dur = Math.min(100, dur); // keep duration reasonable
      
    // air resistance

    this.v *= Math.pow(0.9996, dur);

    // gravity

    this.y += dur / 10;

    // lift

    this.y -= dur * this.v * Math.abs(Math.cos(this.r)) / 3;
    
    // apply user inputs

    if (alive) {
      this.handleInput(dur);
    } else {
      noseDown(dur, 500);
    }

    // speed up when the nose is down

    this.v = Math.max(0, this.v + Math.sin(this.r) * dur / 10000);

    // limit velocity unless the jet is firing

    if (!world.keys.isDown('J')) {
      this.v = Math.min(0.4, this.v);
    }

    // movement

    var vec = vectors.rotate({x: this.v * dur, y: 0}, this.r);
    this.x += vec.x;
    this.y += vec.y;
    
    // constrain to boundaries

    if (this.x < 0) {
      this.x = 0;
    }

    if (this.x >= world.ground.length) {
      this.x = world.ground.length - 1;
    }

    if (this.y < 0) {
      this.y = 0;
    }

    if (this.y >= world.height) {
      this.y = world.height - 1;
    }

    // ground collision

    var collisionOffset = 0;
    var i;
    var groundY;
    var p;

    var localPs = localPoints();
    var globalPs = globalPoints();

    for (i=0; i<localPs.length; i++) {
      var p = vectors.add({x: this.x, y: this.y}, localPs[i]);
      groundY = world.ground[Math.floor(p.x)];
      if (p.y > groundY) {
        collisionOffset = Math.min(collisionOffset, groundY - p.y);
        if (i < 4 || !alive) { // don't crash on gear collision if the plane is still alive
          if (!crashed) {
            crashed = true;

            if (alive) {
              this.hit(50);
            } else {
              world.add(new Smoke(world, this.x, this.y, 40));
            }

            world.depress(p.x, 80);
            this.v = 0;

            setTimeout(function () {
              that.reset();
            }, 500);
          }
        }
      }
    }

    if (collisionOffset) {
      this.y += collisionOffset;
      if (!world.keys.isDown('X')) { // brakes
        this.v *= Math.pow(0.997, dur);
      }
    } else {
      // nose down when going too slow in the air
      if (this.v < 0.1) {
        noseDown(dur, 1000);
      }
    }

    // entity collisions

    for (i=0; i<world.entities.length; i++) {
      if (world.entities[i] !== this && world.entities[i].collides) {
        for (var j=0; j<globalPs.length; j++) {
          if (world.entities[i].contains(globalPs[j].x, globalPs[j].y)) {
            world.entities[i].hit(50);
            if (alive) this.hit(50);
            break;
          }
        }
      }
    }
  };

  this.reset = function () {
    this.x = x;
    this.y = y;
    this.r = 63*Math.PI/32;
    this.v = 0;
    inverted = false;
    alive = true;
    crashed = false;
  };
  
  this.contains = function (x, y) {
    var topLeft = vectors.rotate({x: this.x - width/2, y: this-height/2}, this.r);
    var bottomRight = vectors.rotate({x: this.x + width/2, y: this+height/2}, this.r);

    return x >= topLeft.x && x <= bottomRight.x &&
           y >= topLeft.y && y <= bottomRight.y;
  };

  this.hit = function (n) {
    world.add(new Smoke(world, this.x, this.y, n));
    alive = false;
  };
};

},{"./Bomb":2,"./Bullet":3,"./Smoke":6,"./vectors":8}],6:[function(require,module,exports){
module.exports = function Smoke (world, x, y, size) {
  this.r = 0;
  this.x = x;
  this.y = y;
  this.collides = false;
  var that = this;

  var alpha = 0.4;

  this.update = function (dur) {
    alpha -= dur / 2000;
    if (alpha <= 0) {
      world.remove(this);
    }
  }

  this.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
    ctx.arc(0, 0, size, 0, Math.PI*2);
    ctx.closePath();
    ctx.fill();
  }
  
  this.contains = function (x, y) {
    return Math.sqrt(Math.pow(this.x-x, 2) + Math.pow(this.y-y, 2)) < size;
  };

  this.hit = function (n) {
  };
}

},{}],7:[function(require,module,exports){
module.exports = {
  Plane: require('./Plane'),
  Bunker: require('./Bunker'),
};

},{"./Bunker":4,"./Plane":5}],8:[function(require,module,exports){
module.exports = {
  rotate: function rotate (vector, angle) {
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var rotated = {
      x: vector.x * cos - vector.y * sin,
      y: vector.x * sin + vector.y * cos,
    }
    return rotated;
  },

  add: function add (v1, v2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
  }
};

},{}],9:[function(require,module,exports){
"use strict";

var World = require('./World');

var keys = require('./keys')(document);
var entities = require('./entities');
var ground = require('./map');

var worldHeight = 2000;

var viewWidth = 640;
var viewHeight = 480;

var container = document.createElement('div');
container.style.position = 'relative';
var canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.background = '#bdf';
container.appendChild(canvas);

var world = new World(keys, canvas, ground, worldHeight);

var startX = 3700;
world.add(new entities.Plane(world, startX, ground[startX]-10));

var locs = [
  100,
  140,
  200,
  270,
  340,
  400,
  470,

  780,
  890,
  880,
  1040,
  1080,
  1150,
  1190,
  1270,
  1350,
  1380,
];

for (var i=0; i<locs.length; i++)  {
  world.add(new entities.Bunker(world, locs[i] * 6));
}

var guide = document.createElement('div');
guide.style.position = 'absolute';
guide.style.top = 0;
guide.style.right = '20px';
guide.style.color = '#444';
guide.innerHTML = '<h3>Controls</h3><dl>' +
  '<dt>X</dt><dd>Accelerate</dd>' +
  '<dt>Left</dt><dd>Nose up</dd>' +
  '<dt>Right</dt><dd>Nose down</dd>' +
  '<dt>Up</dt><dd>Invert</dd>' +
  '<dt>Space</dt><dd>Shoot</dd>' +
  '<dt>B</dt><dd>Bomb</dd>' +
  '<dt>J</dt><dd>Jet</dd>' +
  '</dl>';

var lastTs = null;
function step(ts) {
  if (!lastTs) lastTs = ts;
  var dur = ts - lastTs;

  world.update(dur);
  world.draw();
  lastTs = ts;

  setTimeout(function () {
    requestAnimationFrame(step);
  }, 1);
}

container.appendChild(guide);
document.body.appendChild(container);
requestAnimationFrame(step);

},{"./World":1,"./entities":7,"./keys":10,"./map":12}],10:[function(require,module,exports){
module.exports = function (document) {
  var codes = {
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
    J: 74,
    B: 66,
    X: 88,
    Y: 89,
    Z: 90,
    COMMA: 188,
    PERIOD: 190,
    SLASH: 191,
    SPACE: 32,
  }

  var keys = {};

  document.body.addEventListener('keydown', function (e) {
    for (var i in codes) {
      if (e.keyCode === codes[i]) {
        keys[i] = true;
      }
    }
    if (e.keyCode === codes.Z) {
      addOnly = true;
    }
  });

  document.body.addEventListener('keyup', function (e) {
    //console.log('keyCode ' + e.keyCode);
    for (var i in codes) {
      if (e.keyCode === codes[i]) {
        keys[i] = false;
      }
    }
    if (e.keyCode === codes.Z) {
      addOnly = false;
    }
  });

  return {
    isDown: function (k) {
      return keys[k];
    },
  }
};

},{}],11:[function(require,module,exports){
module.exports = [199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,198,197,196,195,194,193,192,191,190,189,188,187,186,185,184,183,182,181,180,179,178,177,176,175,174,173,172,171,170,169,168,167,166,165,164,163,162,161,160,159,158,157,156,155,154,153,152,151,150,149,148,147,146,145,144,143,142,141,140,139,138,137,136,135,134,133,132,131,130,129,128,127,126,125,124,123,122,121,120,119,118,117,116,115,114,113,112,111,110,109,108,107,106,105,104,103,102,101,100,99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68,67,66,65,64,63,62,61,60,59,58,57,56,55,54,53,52,51,50,49,48,47,46,45,44,43,42,41,40,39,38,37,36,35,34,33,32,31,30,29,28,27,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,26,26,26,26,26,26,26,26,27,27,28,28,29,29,30,30,31,31,32,32,32,32,32,32,32,32,32,32,31,31,30,29,28,28,27,26,26,26,26,27,27,28,28,28,28,29,29,29,29,29,28,28,28,28,27,27,27,27,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,28,28,29,29,30,30,31,31,32,32,33,34,35,35,36,37,38,38,39,39,40,40,41,41,42,42,43,44,44,45,46,47,48,49,50,51,52,54,55,56,58,59,60,61,62,63,64,65,66,67,68,69,70,71,73,74,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,74,74,74,74,73,73,72,72,71,71,70,69,69,68,67,66,64,63,62,60,58,57,55,53,51,50,48,46,44,43,41,39,37,36,34,32,30,29,27,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,27,27,28,28,29,29,30,30,31,32,33,34,35,36,36,37,38,39,40,41,42,42,43,44,44,45,45,46,46,47,47,48,49,50,51,52,53,54,55,56,56,57,58,59,59,60,61,62,62,63,63,64,65,65,66,66,67,68,69,69,70,71,72,72,73,74,75,75,75,75,75,75,75,75,75,75,75,75,75,74,74,74,74,74,74,75,75,74,74,74,74,73,73,73,73,72,72,71,71,71,71,70,70,69,69,68,68,67,67,66,66,66,66,65,65,65,65,64,64,63,63,62,62,61,61,60,60,59,59,59,58,58,58,58,58,58,58,58,58,59,59,59,59,60,60,61,61,61,61,62,62,62,62,63,63,63,63,62,62,62,62,61,61,61,61,62,62,62,62,63,63,63,63,63,63,62,62,62,62,61,61,60,60,59,59,58,58,57,57,56,55,55,54,53,53,52,52,51,51,50,50,49,49,48,48,47,47,46,46,45,45,44,44,43,43,42,42,42,42,42,42,41,41,41,41,41,41,41,41,41,41,41,41,42,42,42,43,43,44,44,45,45,46,47,47,48,49,50,50,51,52,53,53,54,55,56,56,57,58,59,59,60,61,62,62,63,64,64,65,65,66,67,68,69,70,71,72,73,74,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,74,74,73,73,73,72,72,72,72,72,72,72,71,71,71,71,70,70,69,69,68,68,67,67,66,66,65,65,64,64,63,62,61,60,59,58,57,56,54,53,52,51,49,48,47,46,45,44,44,44,44,44,43,43,43,43,42,42,42,42,42,41,41,41,41,41,41,40,40,40,40,39,39,39,39,39,38,38,38,38,38,37,37,37,37,37,36,36,36,36,36,35,35,35,35,34,34,34,34,33,33,33,33,32,32,32,32,31,31,31,30,30,30,29,29,29,28,28,27,27,27,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,27,27,27,27,27,27,27,28,28,28,28,29,29,29,29,30,30,30,30,31,31,31,32,32,32,33,33,34,34,34,35,35,36,36,37,37,38,38,39,39,40,40,41,41,42,42,43,43,43,44,44,45,45,46,46,46,47,47,47,48,48,49,49,49,50,50,50,51,51,52,52,53,53,53,54,54,55,55,56,56,57,57,58,58,59,59,60,60,60,61,61,62,62,63,63,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,64,63,63,62,62,61,61,61,61,60,60,60,60,60,60,59,59,59,59,59,59,59,59,58,58,58,58,58,57,57,57,57,56,56,56,56,56,56,55,55,55,55,55,55,54,54,54,54,54,54,53,53,53,53,53,53,52,52,52,52,52,52,52,52,51,51,51,51,51,51,51,51,50,50,50,50,50,50,50,50,50,50,50,50,50,50,51,51,51,51,51,51,51,52,52,52,52,53,53,53,53,54,54,54,54,55,55,56,56,56,57,57,58,58,59,59,59,60,60,60,61,61,61,62,62,62,63,63,63,64,64,64,64,65,65,65,65,66,66,66,66,67,67,67,67,67,68,68,68,68,68,68,68,69,69,69,69,69,69,69,69,70,70,70,70,71,71,71,71,72,72,72,72,73,73,73,73,74,74,74,74,75,75,75,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,75,74,73,72,71,70,69,68,67,66,65,64,63,62,61,60,59,58,57,56,55,54,54,54,54,53,53,53,53,53,53,53,53,52,52,52,52,51,51,51,51,50,50,50,50,50,49,49,49,49,49,49,49,48,48,48,48,48,48,48,48,48,48,47,47,47,47,47,47,47,47,46,46,46,46,46,46,46,46,46,46,46,46,46,47,47,46,46,46,46,46,46,46,46,46,46,46,46,45,45,45,45,45,45,45,44,44,44,44,44,44,44,43,43,43,43,43,43,42,42,42,42,42,42,41,41,41,41,41,40,40,40,39,39,39,38,38,38,38,37,37,37,36,36,35,35,35,34,34,34,33,33,32,32,31,31,31,30,30,29,29,28,28,28,27,27,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,27,27,28,28,28,29,29,30,30,31,31,32,32,33,33,34,34,34,35,35,36,36,37,37,38,39,40,40,41,42,43,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,57,58,58,59,59,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,59,59,59,59,58,58,58,58,57,57,57,57,56,56,56,56,55,55,55,55,54,54,54,54,54,55,55,56,57,58,58,59,60,61,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,75,75,75,75,75,75,75,74,74,74,74,73,73,73,73,72,72,72,71,71,70,70,69,68,67,67,66,65,64,63,62,61,60,59,58,57,56,54,53,52,51,49,48,47,46,44,43,41,40,38,37,35,34,32,31,29,28,26,26,26,26,26,26,27,27,27,28,28,29,29,29,30,30,30,30,30,30,30,30,30,31,31,31,31,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,31,31,31,30,30,30,30,29,29,29,28,28,27,26,26,26,26,26,26,26,26,26,26,26,27,27,27,27,28,28,28,29,29,30,30,30,30,30,30,30,30,30,31,31,32,32,32,33,33,33,33,34,34,34,34,35,35,36,36,37,37,38,39,39,40,41,41,42,42,43,43,43,44,44,44,45,45,46,46,47,47,47,47,47,48,48,49,49,50,50,51,51,52,52,53,53,54,55,56,57,57,58,59,59,59,59,59,59,59,59,59,59,59,59,59,59,58,58,57,57,56,56,55,55,54,54,53,53,52,52,51,51,51,50,50,50,49,49,48,48,47,47,46,46,45,44,43,42,41,40,39,38,37,36,35,34,34,34,33,33,33,32,32,31,31,31,30,30,30,29,29,28,28,27,27,27,27,28,28,28,28,28,28,28,28,28,28,28,28,28,27,27,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,27,27,28,28,28,29,29,30,30,31,31,31,31,32,32,32,31,31,31,31,31,31,31,31,30,30,30,30,29,29,28,28,28,28,27,27,27,27,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,27,27,27,27,27,26,26,26,26,26,26,26,26,26,26,26,26,27,27,28,28,29,29,29,29,29,28,28,28,28,27,27,27,27,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,28,28,28,28,29,29,29,29,29,29,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199,199];

},{}],12:[function(require,module,exports){
var raw = require('./data');

var scaled = [];
var pos;
var prev;
var i;
var m;
var b;

for (i=0; i<raw.length; i++) {
  var pos = { x: 3*i, y: 3*(199 - raw[i]) + 1000 };

  if (prev === undefined) {
    prev = pos;
    m = 0;
  } else {
    m = (pos.y - prev.y) / (pos.x - prev.x);
  }

  b = pos.y - m*pos.x;

  for (var x=prev.x; x<pos.x; x++) {
    var y = m * x + b;
    scaled.push(y);
  }
  prev = pos;
}

var smoothed = [];
var radius = 25;

for (i=0; i<scaled.length; i++) {
  var n = 0;
  var total = 0;

  for (var j=i-radius; j<=i+radius; j++) {
    if (scaled[j] !== undefined) {
      var weight = radius+1-Math.abs(i-j);
      n += weight;
      total += scaled[j] * weight;
    }
  }

  smoothed.push(1.4*total/n - 1000);
}

module.exports = smoothed;

},{"./data":11}]},{},[9]);
