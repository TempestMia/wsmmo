import tornado.ioloop
import tornado.web

import tornado.websocket

import json

from tornado.options import define, options, parse_command_line

define("port", default=8888, help="run on the given port", type=int)

# we gonna store clients in dictionary..
clients = dict()

class MainHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        items = ["Item 1", "Item 2", "Item 3"]
        self.render("templates/template.html", title="My title", items=items)

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

class EchoWebSocket(tornado.websocket.WebSocketHandler):
  def open(self):
      self.id = self.get_argument("Id")
      self.stream.set_nodelay(True)
      clients[self.id] = {"id": self.id, "object": self}
      print "WebSocket opened"

  def on_message(self, message):
      o = json.loads(message)
      print "Client %s received a message : %s" % (self.id, message)
      self.write_message(u"You said: " + o['msg'])

  def on_close(self):
      if self.id in clients:
        del clients[self.id]
      print "WebSocket closed"

class NoCacheStaticFileHandler(tornado.web.StaticFileHandler):
  def set_extra_headers(self, path):
    self.set_header("Cache-control", "no-cache")

app_settings = {
    'debug':True
} 

application = tornado.web.Application([
    (r"/", MainHandler),
    (r"/story/([0-9]+)", StoryHandler),
    (r"/message", MyFormHandler),
    (r"/websocket/", EchoWebSocket),
], **app_settings)

if __name__ == "__main__":
  parse_command_line()
  application.listen(options.port)
  tornado.ioloop.IOLoop.instance().start()