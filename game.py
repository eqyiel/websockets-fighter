# game.py ---

# Copyright (C) 2015 Ruben Maher <r@rkm.id.au>

# Author: Ruben Maher <r@rkm.id.au>

# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 3
# of the License, or (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.

from tornado import websocket
import json
import uuid


class Game(websocket.WebSocketHandler):

    waiting_players = [] # available to all instances of this class
    debug_p = False

    def check_origin(self, origin):
        return True

    def open(self):
        """Try to get a reference to another Player from the pool of
        waiting_players.  If there is one, assign a reference to that Player to
        this Player's attribute other_player, and assign a reference to this
        Player to the other Player's attribute other_player.  Otherwise, add a
        reference to this Player to the pool of waiting_players."""
        self.debug("WebSocket opened")
        try:
            self.other_player = self.waiting_players.pop()
            self.stats = {
                "message": 1, # waiting
                "playerID": str(uuid.uuid4()),
                "ready": False,
                "state": 1,
                "x": 0,
                "y": 218
            }
            self.other_player.other_player = self
            self.debug("Player 2 joined!")
            # Make each client aware of the other's ID.  The first playerID the
            # client sees is assigned to player1 in the client code.  The second
            # ID it sees is assigned to player2.  After that we can start
            # passing data around for either player.
            self.message({"playerID": self.stats.get("playerID")})
            self.message({"playerID": self.other_player.stats.get("playerID")})
            self.other_player.message({"playerID": self.stats.get("playerID")})
            self.update({"message": 1, # waiting
                         "playerID": self.stats.get("playerID"),
                         "ready": True,
                         "sprite": None,
                         "state": 0, # facing left
                         "y": 218,
                         "x": 352})
            self.other_player.update({"message": 1, # waiting
                                      "playerID":
                                      self.other_player.stats.get("playerID"),
                                      "ready": True,
                                      "sprite": None,
                                      "state": 1, # facing right
                                      "x": 96,
                                      "y": 218})
            self.message(self.stats)
            self.other_player.message(self.other_player.stats)
            self.message(self.other_player.stats)
            self.other_player.message(self.stats)
        except IndexError: # failed to pop() from waiting_players
            self.other_player = None
            self.stats = {
                "message": 1, # waiting
                "playerID": str(uuid.uuid4()),
                "ready": False,
                "sprite": None,
                "state": 1, # facing right
                "x": 0,
                "y": 218
            }
            self.debug(self.stats.get("playerID"))
            self.message({"playerID": self.stats.get("playerID")})
            self.waiting_players.append(self)
            self.debug("Waiting for player 2...")
            self.debug(self.waiting_players)

    def on_message(self, message):
        """Parse the message from the client and load it into this Player's
        stats attribute.  Then pass these stats to the client referenced by
        other_player for redrawing."""
        if self.other_player is not None:
            try:
                data = json.loads(message)
                self.debug(data)
                self.other_player.message(data)
            except websocket.WebSocketClosedError:
                pass

    def on_close(self):
        """If this Player has not yet joined a game, remove the reference from
        the pool of waiting_players.  If they left another player behind, let
        someone else join the other_player's game."""
        if self.other_player is None:
            try:
                self.waiting_players.remove(self)
                self.debug("Discarding player that didn't join any game.")
            except ValueError:
                # Shouldn't happen, but a ValueError will be thrown if trying to
                # remove an nonexistent item from a list.
                pass
        if self.other_player is not None:
            try:
                self.debug("Recycling other player")
                self.other_player.other_player = None
                self.waiting_players.append(self.other_player)
                self.update({"message": 0, # quit
                             "playerID": self.stats.get("playerID"),
                             "ready": False,
                             "sprite": None
                })
                self.other_player.message(self.stats)
                self.debug(self.stats)
                self.other_player.message({"playerID": None})
                self.debug(self.waiting_players)
            except AttributeError:
                self.debug("ATTRIBUTEERROR")
                pass
            except websocket.WebSocketClosedError:
                self.debug("WEBSOCKETCLOSEDERROR")
                pass

    def update(self, s):
        if type(s) == dict:
            self.stats.update(s)

    def message(self, s):
        if (type(s)) == dict:
            try:
                self.write_message(json.dumps(s))
            except websocket.WebSocketClosedError:
                pass

    def debug(self, s):
        if self.debug_p is True:
            print(s)
