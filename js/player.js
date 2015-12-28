// player.js ---

// Copyright (C) 2015 Ruben Maher <r@rkm.id.au>

// Author: Ruben Maher <r@rkm.id.au>

// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 3
// of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

function Player(src, ctx, ws, c, player2) {
  this.baseY = 218;
  this.c = c || null;
  this.connectKick = null;
  this.connectPunch = null;
  this.connectRoll = null;
  this.connectSpin = null;
  this.ctx = ctx;
  this.height = 64;
  this.isLoaded = false;
  this.muted = null;
  this.player2 = player2 || null;
  this.playerID = null;
  this.ready = false;
  this.speed = 8;
  this.tryKick = null;
  this.tryPunch = null;
  this.tryRoll = null;
  this.trySpin = null;
  this.width = 64;
  this.ws = ws;
  this.x = 0;
  this.y = 218;

  this.fetchSfx = function() {
    // Don't try to GET all these files for both player objects, just the one
    // that represents this client.
    this.tryKick = new Audio("./assets/ogg/swish-1.ogg");
    this.tryPunch = new Audio("./assets/ogg/swish-7.ogg");
    this.trySpin = new Audio("./assets/ogg/swish-10.ogg");
    this.tryRoll = new Audio("./assets/ogg/swish-12.ogg");
    this.connectKick = new Audio("./assets/ogg/hit28.ogg");
    this.connectPunch = new Audio("./assets/ogg/hit30.ogg");
    this.connectSpin = new Audio("./assets/ogg/hit31.ogg");
    this.connectRoll = new Audio("./assets/ogg/hit32.ogg");
  };

  this.update = function() {
    if (ws.readyState == 1) {   // socket open
      // Save a bit of bandwidth, just send what is necessary for drawing.
      ws.send(JSON.stringify({"action": this.action,
                              "message": this.message,
                              "playerID": this.playerID,
                              "ready": this.ready,
                              "state": this.state,
                              "x": this.x,
                              "y": this.y,
                              "sprite": true}));
    }
  };

  this.update_other = function() {
    if (ws.readyState == 1) {   // socket open
      // Save a bit of bandwidth, just send what is necessary for drawing.
      ws.send(JSON.stringify({"action": player2.action,
                              "message": player2.message,
                              "playerID": player2.playerID,
                              "ready": player2.ready,
                              "state": player2.state,
                              "x": player2.x,
                              "y": player2.y,
                              "sprite": true}));
    }
  };

  this.moveLeft = function() {
    this.state = this.states.FACING_LEFT;
    this.action = this.actions.WALKING;
    this.x -= this.speed;
    if (this.c.isColliding(this, this.player2)) {
      this.x += this.speed;
    }
    this.update();
  };

  this.moveRight = function() {
    this.state = this.states.FACING_RIGHT;
    this.action = this.actions.WALKING;
    this.x += this.speed;
    if (this.c.isColliding(this, this.player2)) {
      this.x -= this.speed;
    }
    this.update();
  };

  this.punch = function() {
    this.action = this.actions.PUNCHING;
    this.message = this.messages.TRYHIT;
    if (!this.muted) { this.tryPunch.play(); }
    if (this.c.isColliding(this, this.player2)) {
      this.message = this.messages.CONNECTHIT;
      if (!this.muted) { this.connectPunch.play(); }
      if (player2.x > this.x) {
        player2.x += (player2.speed * 8);
      } else { player2.x -= (player2.speed * 8); }
      this.update_other();
    }
    this.update();
  };

  this.kick = function() {
    this.action = this.actions.KICKING;
    this.message = this.messages.TRYHIT;
    if (!this.muted) { this.trySpin.play(); }
    if (this.c.isColliding(this, this.player2)) {
      this.message = this.messages.CONNECTHIT;
      if (!this.muted) { this.connectKick.play(); }
      if (player2.x > this.x) {
        player2.x += (player2.speed * 8);
      } else { player2.x -= (player2.speed * 8); }
      this.update_other();
    }
    this.update();
  };

  this.spin = function() {
    this.action = this.actions.SPINNING;
    this.message = this.messages.TRYHIT;
    if (!this.muted) { this.trySpin.play(); }
    if (this.c.isColliding(this, this.player2)) {
      this.message = this.messages.CONNECTHIT;
      if (!this.muted) { this.connectSpin.play(); }
      if (player2.x > this.x) {
        player2.x += (player2.speed * 8);
      } else { player2.x -= (player2.speed * 8); }
      this.update_other();
    }
    this.update();
  };

  this.roll = function() {
    this.action = this.actions.ROLLING;
    this.message = this.messages.TRYHIT;
    if (!this.muted) { this.tryRoll.play(); }
    if (this.c.isColliding(this, this.player2)) {
      this.message = this.messages.CONNECTHIT;
      if (!this.muted) { this.connectRoll.play(); }
      if (player2.x > this.x) {
        player2.x += (player2.speed * 8);
      } else { player2.x -= (player2.speed * 8); }
      this.update_other();
    }
    this.update();
  };

  this.fall = function() {
    this.y += this.speed * 2;
    if (this.y > 512) {
      // play the death sound
      // reset game
      this.ws.close();
    }
    this.update();
  };

  this.reset = function() {
    this.action = this.actions.IDLE;
    this.update();
  };

  this.loadSpriteSheet = function(src) {
    var spriteSheet = new Image();
    spriteSheet.src = src;
    return spriteSheet;
  };
  this.img = this.loadSpriteSheet(src);

  this.loaded = function() {
    this.isLoaded = true;
  };
  this.img.onload = this.loaded();

  this.sprites = new SpriteSheet({
    width: this.height,
    height: this.width,
    sprites: [
      { id: 'idle_facing_right_0', x: 0, y: 0 },
      { id: 'idle_facing_right_1', x: 1, y: 0 },
      { id: 'idle_facing_right_2', x: 2, y: 0 },
      { id: 'idle_facing_right_3', x: 3, y: 0 },
      { id: 'idle_facing_left_0', x: 3, y: 1 },
      { id: 'idle_facing_left_1', x: 2, y: 1 },
      { id: 'idle_facing_left_2', x: 1, y: 1 },
      { id: 'idle_facing_left_3', x: 0, y: 1 },
      { id: 'walking_facing_right_0', x: 0, y: 2 },
      { id: 'walking_facing_right_1', x: 1, y: 2 },
      { id: 'walking_facing_right_2', x: 2, y: 2 },
      { id: 'walking_facing_right_3', x: 3, y: 2 },
      { id: 'walking_facing_right_4', x: 4, y: 2 },
      { id: 'walking_facing_right_5', x: 5, y: 2 },
      { id: 'walking_facing_right_6', x: 6, y: 2 },
      { id: 'walking_facing_right_7', x: 7, y: 2 },
      { id: 'walking_facing_left_0', x: 7, y: 3 },
      { id: 'walking_facing_left_1', x: 6, y: 3 },
      { id: 'walking_facing_left_2', x: 5, y: 3 },
      { id: 'walking_facing_left_3', x: 4, y: 3 },
      { id: 'walking_facing_left_4', x: 3, y: 3 },
      { id: 'walking_facing_left_5', x: 2, y: 3 },
      { id: 'walking_facing_left_6', x: 1, y: 3 },
      { id: 'walking_facing_left_7', x: 0, y: 3 },
      { id: 'punching_facing_right_0', x: 0, y: 6 },
      { id: 'punching_facing_right_1', x: 1, y: 6 },
      { id: 'punching_facing_right_2', x: 2, y: 6 },
      { id: 'punching_facing_right_3', x: 3, y: 6 },
      { id: 'punching_facing_right_4', x: 4, y: 6 },
      { id: 'punching_facing_right_5', x: 5, y: 6 },
      { id: 'punching_facing_right_6', x: 6, y: 6 },
      { id: 'punching_facing_right_7', x: 7, y: 6 },
      { id: 'punching_facing_right_8', x: 8, y: 6 },
      { id: 'punching_facing_right_9', x: 9, y: 6 },
      { id: 'punching_facing_right_10', x: 10, y: 6 },
      { id: 'punching_facing_right_11', x: 11, y: 6 },
      { id: 'punching_facing_right_12', x: 12, y: 6 },
      { id: 'punching_facing_left_0', x: 12, y: 7 },
      { id: 'punching_facing_left_1', x: 11, y: 7 },
      { id: 'punching_facing_left_2', x: 10, y: 7 },
      { id: 'punching_facing_left_3', x: 9, y: 7 },
      { id: 'punching_facing_left_4', x: 8, y: 7 },
      { id: 'punching_facing_left_5', x: 7, y: 7 },
      { id: 'punching_facing_left_6', x: 6, y: 7 },
      { id: 'punching_facing_left_7', x: 5, y: 7 },
      { id: 'punching_facing_left_8', x: 4, y: 7 },
      { id: 'punching_facing_left_9', x: 3, y: 7 },
      { id: 'punching_facing_left_10', x: 2, y: 7 },
      { id: 'punching_facing_left_11', x: 1, y: 7 },
      { id: 'punching_facing_left_12', x: 0, y: 7 },
      { id: 'kicking_facing_right_0', x: 0, y: 8 },
      { id: 'kicking_facing_right_1', x: 1, y: 8 },
      { id: 'kicking_facing_right_2', x: 2, y: 8 },
      { id: 'kicking_facing_right_3', x: 3, y: 8 },
      { id: 'kicking_facing_right_4', x: 4, y: 8 },
      { id: 'kicking_facing_right_5', x: 5, y: 8 },
      { id: 'kicking_facing_left_0', x: 5, y: 9 },
      { id: 'kicking_facing_left_1', x: 4, y: 9 },
      { id: 'kicking_facing_left_2', x: 3, y: 9 },
      { id: 'kicking_facing_left_3', x: 2, y: 9 },
      { id: 'kicking_facing_left_4', x: 1, y: 9 },
      { id: 'kicking_facing_left_5', x: 0, y: 9 },
      { id: 'spinning_facing_right_0', x: 0, y: 10 },
      { id: 'spinning_facing_right_1', x: 1, y: 10 },
      { id: 'spinning_facing_right_2', x: 2, y: 10 },
      { id: 'spinning_facing_right_3', x: 3, y: 10 },
      { id: 'spinning_facing_right_4', x: 4, y: 10 },
      { id: 'spinning_facing_right_5', x: 5, y: 10 },
      { id: 'spinning_facing_right_6', x: 6, y: 10 },
      { id: 'spinning_facing_right_7', x: 7, y: 10 },
      { id: 'spinning_facing_left_0', x: 7, y: 11 },
      { id: 'spinning_facing_left_1', x: 6, y: 11 },
      { id: 'spinning_facing_left_2', x: 5, y: 11 },
      { id: 'spinning_facing_left_3', x: 4, y: 11 },
      { id: 'spinning_facing_left_4', x: 3, y: 11 },
      { id: 'spinning_facing_left_5', x: 2, y: 11 },
      { id: 'spinning_facing_left_6', x: 1, y: 11 },
      { id: 'spinning_facing_left_7', x: 0, y: 11 },
      { id: 'rolling_facing_right_0', x: 0, y: 12 },
      { id: 'rolling_facing_right_1', x: 1, y: 12 },
      { id: 'rolling_facing_right_2', x: 2, y: 12 },
      { id: 'rolling_facing_right_3', x: 3, y: 12 },
      { id: 'rolling_facing_right_4', x: 4, y: 12 },
      { id: 'rolling_facing_right_5', x: 5, y: 12 },
      { id: 'rolling_facing_right_6', x: 6, y: 12 },
      { id: 'rolling_facing_right_7', x: 7, y: 12 },
      { id: 'rolling_facing_right_8', x: 8, y: 12 },
      { id: 'rolling_facing_right_9', x: 9, y: 12 },
      { id: 'rolling_facing_left_0', x: 9, y: 13 },
      { id: 'rolling_facing_left_1', x: 8, y: 13 },
      { id: 'rolling_facing_left_2', x: 7, y: 13 },
      { id: 'rolling_facing_left_3', x: 6, y: 13 },
      { id: 'rolling_facing_left_4', x: 5, y: 13 },
      { id: 'rolling_facing_left_5', x: 4, y: 13 },
      { id: 'rolling_facing_left_6', x: 3, y: 13 },
      { id: 'rolling_facing_left_7', x: 2, y: 13 },
      { id: 'rolling_facing_left_8', x: 1, y: 13 },
      { id: 'rolling_facing_left_9', x: 0, y: 13 },
    ]
  });

  this.idle_facing_right = new Animator([
    { id: 'idle_facing_right_0', t: 0.2 },
    { id: 'idle_facing_right_1', t: 0.2 },
    { id: 'idle_facing_right_2', t: 0.2 },
    { id: 'idle_facing_right_3', t: 0.2 }
  ], this.sprites);

  this.idle_facing_left = new Animator([
    { id: 'idle_facing_left_0', t: 0.2 },
    { id: 'idle_facing_left_1', t: 0.2 },
    { id: 'idle_facing_left_2', t: 0.2 },
    { id: 'idle_facing_left_3', t: 0.2 }
  ], this.sprites);

  this.walking_facing_right = new Animator([
    { id: 'walking_facing_right_0', t: 0.2 },
    { id: 'walking_facing_right_1', t: 0.2 },
    { id: 'walking_facing_right_2', t: 0.2 },
    { id: 'walking_facing_right_3', t: 0.2 },
    { id: 'walking_facing_right_4', t: 0.2 },
    { id: 'walking_facing_right_5', t: 0.2 },
    { id: 'walking_facing_right_6', t: 0.2 },
    { id: 'walking_facing_right_7', t: 0.2 }
  ], this.sprites);

  this.walking_facing_left = new Animator([
    { id: 'walking_facing_left_0', t: 0.2 },
    { id: 'walking_facing_left_1', t: 0.2 },
    { id: 'walking_facing_left_2', t: 0.2 },
    { id: 'walking_facing_left_3', t: 0.2 },
    { id: 'walking_facing_left_4', t: 0.2 },
    { id: 'walking_facing_left_5', t: 0.2 },
    { id: 'walking_facing_left_6', t: 0.2 },
    { id: 'walking_facing_left_7', t: 0.2 }
  ], this.sprites);

  this.punching_facing_left = new Animator([
    { id: 'punching_facing_left_0', t: 0.05 },
    { id: 'punching_facing_left_1', t: 0.05 },
    { id: 'punching_facing_left_2', t: 0.05 },
    { id: 'punching_facing_left_3', t: 0.05 },
    { id: 'punching_facing_left_4', t: 0.05 },
    { id: 'punching_facing_left_5', t: 0.05 },
    { id: 'punching_facing_left_6', t: 0.05 },
    { id: 'punching_facing_left_7', t: 0.05 },
    { id: 'punching_facing_left_8', t: 0.05 },
    { id: 'punching_facing_left_9', t: 0.05 },
    { id: 'punching_facing_left_10', t: 0.05 },
    { id: 'punching_facing_left_11', t: 0.05 },
    { id: 'punching_facing_left_12', t: 0.05 }
  ], this.sprites);

  this.punching_facing_right = new Animator([
    { id: 'punching_facing_right_0', t: 0.05 },
    { id: 'punching_facing_right_1', t: 0.05 },
    { id: 'punching_facing_right_2', t: 0.05 },
    { id: 'punching_facing_right_3', t: 0.05 },
    { id: 'punching_facing_right_4', t: 0.05 },
    { id: 'punching_facing_right_5', t: 0.05 },
    { id: 'punching_facing_right_6', t: 0.05 },
    { id: 'punching_facing_right_7', t: 0.05 },
    { id: 'punching_facing_right_8', t: 0.05 },
    { id: 'punching_facing_right_9', t: 0.05 },
    { id: 'punching_facing_right_10', t: 0.05 },
    { id: 'punching_facing_right_11', t: 0.05 },
    { id: 'punching_facing_right_12', t: 0.05 }
  ], this.sprites);

  this.kicking_facing_right = new Animator([
    { id: 'kicking_facing_right_0', t: 0.05 },
    { id: 'kicking_facing_right_1', t: 0.05 },
    { id: 'kicking_facing_right_2', t: 0.05 },
    { id: 'kicking_facing_right_3', t: 0.05 },
    { id: 'kicking_facing_right_4', t: 0.05 },
    { id: 'kicking_facing_right_5', t: 0.05 },
  ], this.sprites);

  this.kicking_facing_left = new Animator([
    { id: 'kicking_facing_left_0', t: 0.05 },
    { id: 'kicking_facing_left_1', t: 0.05 },
    { id: 'kicking_facing_left_2', t: 0.05 },
    { id: 'kicking_facing_left_3', t: 0.05 },
    { id: 'kicking_facing_left_4', t: 0.05 },
    { id: 'kicking_facing_left_5', t: 0.05 },
  ], this.sprites);

  this.spinning_facing_right = new Animator([
    { id: 'spinning_facing_right_0', t: 0.05 },
    { id: 'spinning_facing_right_1', t: 0.05 },
    { id: 'spinning_facing_right_2', t: 0.05 },
    { id: 'spinning_facing_right_3', t: 0.05 },
    { id: 'spinning_facing_right_4', t: 0.05 },
    { id: 'spinning_facing_right_5', t: 0.05 },
    { id: 'spinning_facing_right_6', t: 0.05 },
    { id: 'spinning_facing_right_7', t: 0.05 },
  ], this.sprites);

  this.spinning_facing_left = new Animator([
    { id: 'spinning_facing_left_0', t: 0.05 },
    { id: 'spinning_facing_left_1', t: 0.05 },
    { id: 'spinning_facing_left_2', t: 0.05 },
    { id: 'spinning_facing_left_3', t: 0.05 },
    { id: 'spinning_facing_left_4', t: 0.05 },
    { id: 'spinning_facing_left_5', t: 0.05 },
    { id: 'spinning_facing_left_6', t: 0.05 },
    { id: 'spinning_facing_left_7', t: 0.05 },
  ], this.sprites);

  this.rolling_facing_right = new Animator([
    { id: 'rolling_facing_right_0', t: 0.05 },
    { id: 'rolling_facing_right_1', t: 0.05 },
    { id: 'rolling_facing_right_2', t: 0.05 },
    { id: 'rolling_facing_right_3', t: 0.05 },
    { id: 'rolling_facing_right_4', t: 0.05 },
    { id: 'rolling_facing_right_5', t: 0.05 },
    { id: 'rolling_facing_right_6', t: 0.05 },
    { id: 'rolling_facing_right_7', t: 0.05 },
    { id: 'rolling_facing_right_8', t: 0.05 },
    { id: 'rolling_facing_right_9', t: 0.05 },
  ], this.sprites);

  this.rolling_facing_left = new Animator([
    { id: 'rolling_facing_left_0', t: 0.05 },
    { id: 'rolling_facing_left_1', t: 0.05 },
    { id: 'rolling_facing_left_2', t: 0.05 },
    { id: 'rolling_facing_left_3', t: 0.05 },
    { id: 'rolling_facing_left_4', t: 0.05 },
    { id: 'rolling_facing_left_5', t: 0.05 },
    { id: 'rolling_facing_left_6', t: 0.05 },
    { id: 'rolling_facing_left_7', t: 0.05 },
    { id: 'rolling_facing_left_8', t: 0.05 },
    { id: 'rolling_facing_left_9', t: 0.05 },
  ], this.sprites);

  this.actions = {
    IDLE: 0,
    WALKING: 1,
    PUNCHING: 2,
    KICKING: 3,
    SPINNING: 4,
    ROLLING: 5,
    FALLING: 6
  };

  this.states = {
    FACING_LEFT: 0,
    FACING_RIGHT: 1
  };

  this.state = null;
  this.sprite = null;

  this.messages = {
    QUIT: 0,
    WAITING: 1,
    TRYHIT: 2,
    CONNECTHIT: 3
  };

  this.message = this.messages.WAITING;
  this.timer = new Timer();

  this.draw = function() {
    if ((36 > this.x) || (this.x > 416)) {
      this.action = this.actions.FALLING;
      this.fall();
    }
    switch (this.state) {
    case this.states.FACING_RIGHT:
      switch (this.action) {
      case this.actions.IDLE:
        this.sprite = this.idle_facing_right;
        break;
      case this.actions.WALKING:
        this.sprite = this.walking_facing_right;
        break;
      case this.actions.PUNCHING:
        this.sprite = this.punching_facing_right;
        break;
      case this.actions.KICKING:
        this.sprite = this.kicking_facing_right;
        break;
      case this.actions.SPINNING:
        this.sprite = this.spinning_facing_right;
        break;
      case this.actions.ROLLING:
        this.sprite = this.rolling_facing_right;
        break;
      case this.actions.FALLING:
        this.sprite = this.idle_facing_right;
        break;
      }
      break;
    case this.states.FACING_LEFT:
      switch (this.action) {
      case this.actions.IDLE:
        this.sprite = this.idle_facing_left;
        break;
      case this.actions.WALKING:
        this.sprite = this.walking_facing_left;
        break;
      case this.actions.PUNCHING:
        this.sprite = this.punching_facing_left;
        break;
      case this.actions.KICKING:
        this.sprite = this.kicking_facing_left;
        break;
      case this.actions.SPINNING:
        this.sprite = this.spinning_facing_left;
        break;
      case this.actions.ROLLING:
        this.sprite = this.rolling_facing_left;
        break;
      case this.actions.FALLING:
        this.sprite = this.idle_facing_left;
        break;
      }
      break;
    default:
      console.log("error: state: " + this.state + " action: " + this.action);
      break;
    }
    this.sprite.update(this.timer.get());
    var frame = this.sprite.get();

    this.ctx.drawImage(this.img, frame.x, frame.y, this.width,
                       this.height, this.x, this.y, this.width, this.height);
  };

  this.init = function() {
    // Depending on which player joined the game first, a player is either
    // facing left or right when they begin.  Set the appropriate sprite.
    if (this.state == this.states.FACING_RIGHT) {
      this.action = this.actions.IDLE;
      this.sprite = this.idle_facing_right;
    } else {
      this.action = this.actions.IDLE;
      this.sprite = this.idle_facing_left;
    }
  };
};
