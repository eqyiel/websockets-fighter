#!/usr/bin/env python
#
# app.py ---
#
# Copyright (C) 2015 Ruben Maher <r@rkm.id.au>
#
# Author: Ruben Maher <r@rkm.id.au>
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 3
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.

import os
from tornado import web, ioloop, httpserver
from game import Game


class Index(web.RequestHandler):
    def get(self):
        self.render("index.html")


app = web.Application([
    (r"/", Index),
    (r"/ws", Game),
    (r"/(style.css)", web.StaticFileHandler, {"path": ""}),
    (r"/js/(.*)", web.StaticFileHandler, {"path": "./js/"}),
    (r"/assets/(.*)", web.StaticFileHandler, {"path": "./assets/"})
])

if __name__ == "__main__":
    http_server = httpserver.HTTPServer(app, ssl_options={
        "certfile": os.path.join("/srv/certs/rkm.id.au/cert.pem"),
        "keyfile": os.path.join("/srv/certs/rkm.id.au/key.pem")
    })
    http_server.listen(8080)
    ioloop.IOLoop.instance().start()
