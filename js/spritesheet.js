// spritesheet.js ---

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


var SpriteSheet = function(data) {

  this.y = data.height;
  this.x = data.width;
  this.sprites = data.sprites;

  this.get = function(id) {
    for (var i = 0; i < this.sprites.length; i++) {
      var sprite = this.sprites[i];
      if (sprite.id == id) {
        return {
          x: (sprite.x * this.x),
          y: (sprite.y * this.y),
          width: this.x,
          height: this.y
        };
      }
    } return null;
  };
};
