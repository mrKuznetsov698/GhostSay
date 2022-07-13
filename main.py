import base64
import os
import sys
import threading

import tornado.web
import tornado.ioloop
from tornado.log import enable_pretty_logging

busy = False


def fun_for_thread(name: str):
    global busy
    try:
        os.system(f'ffplay "{name}" -autoexit -nodisp')
        busy = False
    except Exception as ex:
        print(ex)
    finally:
        os.remove(name)
        busy = False
        sys.exit()


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(open('static/html/index.html', 'rb').read())


class UploadFileHandler(tornado.web.RequestHandler):
    def post(self):
        global busy
        try:
            file = self.request.files['file'][0]
        except:
            self.redirect('/')
            return
        if not file['filename'] or \
                not file['content_type'] or \
                not file['content_type'].startswith('audio/') or \
                file['body'] == '' or busy:
            self.redirect('/')
            return
        with open('user_uploads/' + file['filename'], 'wb') as fl:
            fl.write(file['body'])
        self.redirect('/')
        busy = True
        thr = threading.Thread(target=fun_for_thread, kwargs={'name': 'user_uploads\\' + file['filename']})
        thr.start()


class PostDataHandler(tornado.web.RequestHandler):
    def post(self):
        global busy
        if busy:
            return
        busy = True
        with open(f'user_uploads/a.weba', 'wb') as fl:
            fl.write(base64.decodebytes(self.request.body))
            fl.close()
        thr = threading.Thread(target=fun_for_thread, kwargs={'name': 'user_uploads\\a.weba'})
        thr.start()


class ApiHandler(tornado.web.RequestHandler):
    def get(self):
        self.write('Busy' if busy else 'Free')


def create_app():
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/getStatus", ApiHandler),
        (r"/upload", UploadFileHandler),
        (r"/data", PostDataHandler),
        (r"/static/(.*)", tornado.web.StaticFileHandler, {'path': 'static', 'default_filename': 'error.html'})
    ])


if __name__ == '__main__':
    enable_pretty_logging()
    app = create_app()
    app.listen(80)
    tornado.ioloop.IOLoop.current().start()
