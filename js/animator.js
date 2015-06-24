// animation.js ---

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

function Animator(data, sprites) {
  this.frame = null;
  this.ids = data;
  this.i = 0;
  this.t0 = data[0].t;
  this.sprites = sprites;

  this.update = function(t1) {
    this.t0 -= t1;
    if (this.t0 <= 0) {
      (this.i + 1) == this.ids.length
        ? this.i = 0
        : this.i++;
      this.t0 = this.ids[this.i].t;
    }
  };

  this.get =  function() {
    return this.sprites.get(this.ids[this.i].id);
  };
};
