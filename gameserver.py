
import sys
import os

import socket

import tornado.ioloop
import tornado.web

import tornado.websocket

import json

from tornado.options import define, options, parse_command_line

define("port", default=8888, help="run on the given port", type=int)

# Full filesystem path to the project.
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
# Handy function to specify paths based on the project root
proj_root = lambda *paths: os.path.join(PROJECT_ROOT, '..', *paths)
# Static path
static_path=os.path.join(os.path.dirname(__file__), "static")
# Other way of demonstrating the static path (same result as above)
STATIC_ROOT = proj_root('..', 'static')

usernames = []

online_players = {}

class MainHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        items = ["Item 1", "Item 2", "Item 3"]
        self.render("templates/template.html", title="My title", items=items)

class GameBoardHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self, username):
      ip = socket.gethostbyname(socket.gethostname())
      self.render("templates/gameboard.html", title="Game Board", username=username, ip=ip)

class UsernamePickHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render("templates/index.html", title="Welcome!")

    def post(self):
      self.set_header("Content-Type", "text/plain")
      username = self.get_argument("username")
      if username not in usernames:
        usernames.append(username)
        # send to GameBoardHandler view
        self.redirect("/gameboard/"+username)
      else:
        self.write("Username has already been taken!")

class StoryHandler(tornado.web.RequestHandler):
  def get(self, story_id):
      self.write("You requested the story " + story_id)

class MyFormHandler(tornado.web.RequestHandler):
  def get(self):
      self.write('<html><body><form action="/message" method="post">'
                 '<input type="text" name="message">'
                 '<input type="submit" value="Submit">'
                 '</form></body></html>')

  def post(self):
      self.set_header("Content-Type", "text/plain")
      self.write("You wrote " + self.get_argument("message"))

class PlayerWebSocket(tornado.websocket.WebSocketHandler):
  # To store clients
  clients = dict()

  def open(self):
      self.id = self.get_argument("Id")
      self.stream.set_nodelay(True)
      PlayerWebSocket.clients[self.id] = {"id": self.id, "object": self}
      print "WebSocket opened"

  def on_message(self, message):
      o = json.loads(message)
      print "Client %s received a message : %s" % (self.id, message)
      #self.write_message(u"You said: " + o['msg'])
      # Chat
      if o['type'] == 'chat':
        for eid,ews in PlayerWebSocket.clients.items():
          #ews['object'].write_message("["+o['user']+"]: "+ o['msg'])
          ews['object'].write_message(o);
      # Player Update
      if o['type'] == 'update':
        for eid,ews in PlayerWebSocket.clients.items():
          if eid != o['user']: # for all the websocket connections but the one to the user who updated
            ews['object'].write_message(o)

  def on_close(self):
      if self.id in PlayerWebSocket.clients:
        del PlayerWebSocket.clients[self.id]
      print "WebSocket closed"

class NoCacheStaticFileHandler(tornado.web.StaticFileHandler):
  # Not currently in use but I put this here in case it comes in handy
  def set_extra_headers(self, path):
    self.set_header("Cache-control", "no-cache")

app_settings = {
    'debug':True,
    #'static_path': os.path.join(PATH, 'static')
    'static_path':os.path.join(os.path.dirname(__file__), "static"),
} 

application = tornado.web.Application([
    #(r"/", MainHandler),
    (r"/", UsernamePickHandler),
    (r"/story/([0-9]+)", StoryHandler),
    (r"/message/", MyFormHandler),
    (r"/websocket/", PlayerWebSocket),
    (r"/gameboard/([a-z0-9A-Z]+)", GameBoardHandler),
    (r"/static/(.*)", tornado.web.StaticFileHandler, {'path': STATIC_ROOT})
], **app_settings)

if __name__ == "__main__":
  parse_command_line()
  application.listen(options.port)
  tornado.ioloop.IOLoop.instance().start()