#!/usr/bin/env python
# -*- coding: utf-8 -*-
from flask import Flask, redirect, request, g
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
    return json.dumps({
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


@app.route('/submit-purchase', methods=['POST'])
def submit_purchase():
    data = request.form.to_dict()
    data['ip'] = request.remote_addr
    data['location'] = get_ip_location(request.remote_addr)
    data['timestamp'] = time.time()
    g.db.purchases.insert_one(data)
    return json.dumps({'status': True})


def get_ip_location(ip):
    location = None
    url = "https://freegeoip.app/json/{0}".format(ip)
    headers = {
        'accept': "application/json",
        'content-type': "application/json"
    }
    while not location:
        response = requests.request("GET", url, headers=headers)
        location = json.loads(response.text)
    return location


@app.route('/report')
def report():
    return redirect('/pages/report.html')


@app.route('/purchases-report', methods=['POST'])
def purchases_report():
    purchases = []
    cursor = g.db.purchases.find({})
    for purchase in cursor:
        del purchase['_id']
        purchase['country'] = purchase['location']['country_name']
        purchase['state'] = purchase['location']['region_name']
        del purchase['location']
        purchase['daiAmount'] = int(int(purchase['daiAmount']) / 10**18)
        purchase['time'] = time.strftime(
            "%Y-%m-%d %H:%M:%S", time.localtime(int(purchase['timestamp'])))
        purchases.append(purchase)
    return json.dumps({'purchases': purchases, 'status': True})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5008, threaded=True)
