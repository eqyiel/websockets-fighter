// timer.js ---

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

function Timer() {
  this.t0 = (new Date()).getTime();

  this.get = function() {
    var t1 = (new Date()).getTime();
    var delta = t1 - this.t0;
    this.t0 = t1;
    return (delta / 1000);
  };
}
