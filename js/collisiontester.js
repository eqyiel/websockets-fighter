// collisiontester.js ---

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

function CollisionTester() {
  this.isColliding = function(a, b) {
    // First do cheaper test for box collision.  Only do the more expensive
    // pixel collision test if the boxes overlap like so.
    // ┌────────┐
    // │    ┌───┼────┐
    // │    │###│    │
    // └────┼───┘    │
    //      └────────┘
    var box = this.testForBoxCollision(a, b);
    if (box != null) {
      return this.testForPixelCollision(a, b, box.ax, box.bx, box.ay, box.by,
                                        box.sx, box.sy, box.sw, box.sh);
    } else return false;
  };

  this.testForBoxCollision = function(a, b) {
    // We may be using these as array indices later, so we need integers.  Use
    // double bitwise not operator to get fast floor of of all these.  See:
    // http://rocha.la/JavaScript-bitwise-operators-in-practice
    var ax = ~~a.x,
        ay = ~~a.y,
        bx = ~~b.x,
        by = ~~b.y,
        sx = Math.max(ax, bx),
        sy = (Math.max(ay, by)),
        // Working with pixel sprites, height and width are already integers.
        sw = Math.min((ax + a.width), (bx + b.width)),
        sh = Math.min((ay + a.height), (by + b.height));
    if ((sx - sw) < 0 && (sy - sh) < 0) {
      // Box collision detected.  The overlapping area can be described by:
      // ctx.fillRect(sx, sy, Math.abs(sx - sw), Math.abs(sy - sh));
      return {ax: ax, bx: bx, ay: ay, by: by, sx: sx, sy: sy, sw: sw, sh: sh};
    } else return null;
  };

  this.testForPixelCollision = function(a, b, ax, bx, ay, by, sx, sy, sw, sh) {
    var img1 = this.getImageData(a),
        img2 = this.getImageData(b);
    if ((img1 == null) || (img2 == null)) { return false; }
    for (var x = sx; x < sw; x++) {
      for (var y = sy; y < sh; y++) {
        // ImageData.data is a Uint8ClampedArray containing the pixel data in
        // RGBA order.  We're interested in the alpha values, which are found at
        // every fourth index.  They describe the opacity of the image at that
        // pixel, 0 being completely transparent.  If a pixel is found in the
        // overlapping area which is not fully transparent in both sprites,
        // a collision has been found.
        if (img1.data[((x - ax) + ((y - ay) * a.width)) * 4 + 3] != 0
            && img2.data[((x - bx) + ((y - by) * b.width)) * 4 + 3] != 0) {
          return true;
        }
      }
    }
    return false;
  };

  this.getImageData = function(player) {
    // Get an ImageData object from player.img.  Can't just invoke this on an
    // Image object, it has to be gotten from a Canvas.  So create a temporary
    // invisble Canvas with the same dimensions as player.img, draw the Image,
    // and return the ImageData object.
    var tmp = document.createElement("canvas");
    tmp.width = player.width;
    tmp.height = player.height;
    var context = tmp.getContext("2d");
    var frame = player.sprite.get();
    if (frame == null) { return null; }
    context.drawImage(player.img, frame.x, frame.y, player.width,
                      player.height, 0, 0, player.width, player.height);

    tmp = null; // tidy up
    return context.getImageData(0, 0, player.width, player.height);
  };
};
