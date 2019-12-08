#!/usr/bin/env python
# -*- coding: utf-8 -*-
from flask import Flask, redirect, request, g, jsonify
from io import BytesIO as IO
import pymongo
import requests
import time
import gzip
import json
import os

app = Flask(__name__, static_url_path='', static_folder='../ui')
app.secret_key = os.urandom(24)

abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)


class ErrorToClient(Exception):
    pass


def gzip_content(response):
    accept_encoding = request.headers.get('Accept-Encoding', '')
    if 'gzip' not in accept_encoding.lower():
        return response
    response.direct_passthrough = False
    if (response.status_code < 200 or response.status_code >= 300 or 'Content-Encoding' in response.headers):
        return response
    gzip_buffer = IO()
    gzip_file = gzip.GzipFile(mode='wb', fileobj=gzip_buffer)
    gzip_file.write(response.data)
    gzip_file.close()
    response.data = gzip_buffer.getvalue()
    response.headers['Content-Encoding'] = 'gzip'
    response.headers['Vary'] = 'Accept-Encoding'
    response.headers['Content-Length'] = len(response.data)
    return response


@app.errorhandler(ErrorToClient)
def error_to_client(error):
    return jsonify({
        'msg': error.args[0],
        'args': error.args[1:],
        'status': False
    })


@app.before_request
def before_request():
    g.client = pymongo.MongoClient('mongodb://localhost:27017/')
    g.db = g.client['BrightID']


@app.after_request
def after_request(response):
    return gzip_content(response)


@app.teardown_request
def teardown_request(exception):
    g.client.close()


@app.route('/')
def index():
    return redirect('/index.html')


@app.route('/action', methods=['POST'])
def submit_purchase():
    data = request.form.to_dict()
    location = get_ip_location(request.remote_addr)
    data['country'] = location.get('country_name')
    data['state'] = location.get('region_name')
    data['city'] = location.get('city')
    data['timestamp'] = time.time()
    g.db.purchases.insert_one(data)
    return jsonify({'status': True})


def get_ip_location(ip):
    attempts = 20
    url = "https://freegeoip.app/json/{0}".format(ip)
    headers = {
        'accept': "application/json",
        'content-type': "application/json"
    }
    for i in range(attempts):
        try:
            response = requests.request("GET", url, headers=headers)
            location = json.loads(response.text)
            if location:
                return location
        except:
            pass
    return {}


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=7070, threaded=True)
