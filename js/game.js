// game.js ---

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


function Game() {
  var container = document.getElementById("container");
  var canvas = document.createElement("canvas");
  canvas.setAttribute("width", 512);
  canvas.setAttribute("height", 384);
  canvas.setAttribute("id", "game");
  canvas.setAttribute("class", "canvases");
  var ctx = canvas.getContext("2d");
  ctx.webkitImageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false; /// future
  container.appendChild(canvas);
  ctx.font = "24px Sans";
  ctx.textAlign = "center";
  ctx.textBaseline = "center";

  function scale(canvas) {
    var ratio = {x: 1, y: 1};
    ratio.x = (window.innerWidth - 10) / canvas.width;
    ratio.y = (window.innerHeight - 10) / canvas.height;
    if (ratio.x < 1 || ratio.y < 1) {
      ratio = '1, 1';
    } else if (ratio.x < ratio.y) {
      ratio = ratio.x + ', ' + ratio.x;
    } else {
      ratio = ratio.y + ', ' + ratio.y;
    }
    canvas.setAttribute("style","-ms-transform-origin: center top;"
                        + " -webkit-transform-origin: center top;"
                        + " -moz-transform-origin: center top;"
                        + " -o-transform-origin: center top;"
                        + " transform-origin: center top;"
                        + " -ms-transform: scale(" + ratio + ");"
                        + " -webkit-transform: scale3d(" + ratio + ", 1);"
                        + " -moz-transform: scale(" + ratio + ");"
                        + " -o-transform: scale(" + ratio + ");"
                        + " transform: scale(" + ratio + ");");
  };

  scale(canvas);
  window.addEventListener("resize", function() { scale(canvas); }, false);
  window.addEventListener("orientationchange",
                          function() { scale(canvas); }, false);


  var ws = new WebSocket("wss://demo.rkm.id.au:8080/ws");

  ws.onclose = function(){
    console.log("lol");
    window.location.reload(false);
  };

  ws.onmessage = function(message) {
    var json = JSON.parse(message.data);
    switch (json.playerID) {
    case player1.playerID:
      player1.message = json.message;
      player1.ready = json.ready;
      player1.state = json.state;
      player1.action = json.action;
      player1.x = json.x;
      player1.y = json.y;
      if (json.sprite == null) { player1.init(); }
      break;
    case player2.playerID:
      player2.message = json.message;
      player2.ready = json.ready;
      player2.state = json.state;
      player2.action = json.action;
      player2.x = json.x;
      player2.y = json.y;
      if (json.sprite == null) { player2.init(); }
      if (player2.message == player2.messages.TRYHIT && player2.ready) {
        if (!player1.muted) {
          switch (player2.action) {
          case player2.actions.PUNCHING:
            // we have already loaded these sound files for player1, save
            // bandwidth by re-using the loaded assets
            player1.tryPunch.play();
            break;
          case player2.actions.KICKING:
            player1.tryKick.play();
            break;
          case player2.actions.SPINNING:
            player1.trySpin.play();
            break;
          case player2.actions.ROLLING:
            player1.tryRoll.play();
            break;
          }
        }
      }
      if (player2.message == player2.messages.CONNECTHIT && player2.ready) {
        if (!player1.muted) {
          switch (player2.action) {
          case player2.actions.PUNCHING:
            // we have already loaded these sound files for player1, save
            // bandwidth by re-using the loaded assets
            player1.connectPunch.play();
            break;
          case player2.actions.KICKING:
            player1.connectKick.play();
            break;
          case player2.actions.SPINNING:
            player1.connectSpin.play();
            break;
          case player2.actions.ROLLING:
            player1.connectRoll.play();
            break;
          }
        }
      }
      break;
    default:
      // First time we receive a message, it should just be a UUID.  Assign it
      // to player1.  Assign the next UUID we receive to player2.  If we get a
      // json.playerID of type null after that, it means that player2 has left
      // the game.
      if (player1.playerID == null) {
        player1.playerID = json.playerID;
      } else {
        player2.playerID = json.playerID;
      }
    }
  };

  var keysDown = {};

  window.addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
  }, false);

  window.addEventListener("keyup", function (e) {
    switch (e.keyCode) {
    case 37:
    case 39:
    case 65:
    case 68:
    case 70:
    case 83:
      // Fall through to do this for any of the above.  Don't hog bandwidth by
      // sending key presses that have nothing to do with the game.
      player1.reset();
      break;
    }
    delete keysDown[e.keyCode];
  }, false);

  function move() {
    if ((player1.y == player1.baseY) && (player2.ready)) {
      if (37 in keysDown) { // ←
        player1.moveLeft();
      }
      if (39 in keysDown) { // →
        player1.moveRight();
      }
      if (65 in keysDown) { // a
        player1.kick();
      }
      if (68 in keysDown) { // d
        player1.punch();
      }
      if (70 in keysDown) { // f
        player1.spin();
      }
      if (83 in keysDown) { // s
        player1.roll();
      }
    }
  };

  function render() {
    // Don't draw anything unless another player has joined the game.
    if (player2.ready) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = bg_pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(moon, 0, 0);
      ctx.drawImage(platform, 0, 0);
      if (player1.isLoaded) { player1.draw(); }
      if (player2.isLoaded) { player2.draw(); }
      if (!player1.muted) {
        ctx.drawImage(speaker, 400, 300);
      } else {
        ctx.drawImage(mute, 400, 300);
      }
    } else {
      ctx.fillStyle = "black";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillText("Waiting for Player 2...",
                   (canvas.width / 2),
                   (canvas.height / 2));
      if (!player1.muted) {
        ctx.drawImage(speaker, 400, 300);
      } else {
        ctx.drawImage(mute, 400, 300);
      }
    }
  };

  function main() {
    move();
    render();
    requestAnimationFrame(main);
  };

  var requestAnimationFrame = window.requestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.msRequestAnimationFrame;


  var platform = new Image();
  platform.setAttribute("src", "./assets/sprites/platform.png");
  var bg = new Image();
  bg.setAttribute("src", "./assets/sprites/bg.png");
  var bg_pattern;
  bg.addEventListener("load", function() {
    bg_pattern = ctx.createPattern(bg, "repeat");
  });
  var moon = new Image();
  moon.setAttribute("src", "./assets/sprites/moon.png");

  var speaker = new Image();
  speaker.setAttribute("src", "./assets/sprites/speaker.png");
  var mute = new Image();
  mute.setAttribute("src", "./assets/sprites/mute.png");

  var c = new CollisionTester();
  var player2 = new Player("./assets/sprites/blue.png", ctx, ws);
  var player1 = new Player("./assets/sprites/red.png", ctx, ws, c, player2);
  player1.fetchSfx();

  canvas.addEventListener("click", function(e) {
    // offsetX and offsetY don't exist in Firefox, and layerX and layerY mean
    // something different in Chrom{e,ium}.
    var x = (e.offsetX == undefined) ? e.layerX : e.offsetX;
    var y = (e.offsetY == undefined) ? e.layerY : e.offsetY;
    ctx.beginPath();
    ctx.rect(400, 300, 64, 64);
    ctx.stroke();
    if (ctx.isPointInPath(x, y)) {
      if (player1.muted == null) { player1.muted = true; }
      player1.muted = !player1.muted;
      // Only strings in LocalStorage
      player1.muted
        ? localStorage.setItem("muted", "true")
        : localStorage.setItem("muted", "false");
    }
  });

  // LocalStorage can only store strings at the moment >___>
  if (localStorage.getItem("muted") == "true") {
    player1.muted = true;
    localStorage.setItem("muted", "true");
  } else {
    player1.muted = false;
    localStorage.setItem("muted", "false");
  }

  main();
}

window.addEventListener("load", function() {
  // bootstrap
  var go = new Game();
}, false);
