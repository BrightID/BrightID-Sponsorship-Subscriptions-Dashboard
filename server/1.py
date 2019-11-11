from serverbase import ErrorToClient, revoked_store, ACCESS_EXPIRES, REFRESH_EXPIRES
from flask import Blueprint, request, g, jsonify, redirect, send_from_directory
from insta_pic_genrator import InstagramQrCode
from web3 import Web3, HTTPProvider
import nacl.encoding
import nacl.signing
import requests
import twitter
import base64
import config
import json
import uuid
import os

from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token, get_jti,
    jwt_refresh_token_required, get_jwt_identity, jwt_required, get_raw_jwt
)


bp = Blueprint('server', __name__)


def check_eth_addr(address):
    try:
        g.w3 = Web3(HTTPProvider(config.INFURA_URL))
        return g.w3.toChecksumAddress(address)
    except Exception:
        raise ErrorToClient('Invalid Address')


def check_dao_confirm(publicKey):
    res = g.db.dao.find_one({'publicKey': publicKey})
    if not res:
        return False
    return res['confirm']


@bp.route('/get-info', methods=['POST'])
@jwt_required
def get_info():
    data = json.loads(request.data)
    if 'publicKey' not in data:
        raise ErrorToClient('Error in connection - No publicKey Founded')
    # TODO: check if needed
    res = g.db.members.find_one({'publicKey': data['publicKey']})
    if not res:
        raise ErrorToClient('No data')
    for key in ['_id', 'signedMessage', 'timestamp', 'twitter']:
        del res[key]
    res['BDT_balance'] = 0
    res['points'] = calculate_rewards(res['publicKey'])
    res['dao_confirmed'] = check_dao_confirm(data['publicKey'])
    # TODO: check bright id confirm
    return json.dumps({'status': True, 'data': res, 'brightid_confirm': True})


@bp.route('/check-bdt-balance/<publicKey>')
@jwt_required
def check_bdt_balance(publicKey):
    BDT_balance = 0
    try:
        res = g.db.members.find_one({'publicKey': publicKey})
        BDT_balance = blank_token_balance(
            check_eth_addr(res['ethereum_address']))
    except:
        BDT_balance = 0
    return jsonify({'status': True, 'BDT_balance': BDT_balance})


@bp.route('/submit-ethereum', methods=['POST'])
@jwt_required
def submit_ethereum():
    data = json.loads(request.data)
    if 'publicKey' not in data:
        raise ErrorToClient('Error in connection - No publicKey Founded')
    if 'account' not in data:
        raise ErrorToClient('Error in connection - No Account Founded')
    check_eth_addr(data['account'])
    res = g.db.members.find_one({'publicKey': data['publicKey']})
    if not res:
        raise ErrorToClient('No Public Key Founded')
    g.db.members.update_one({
        '_id': res['_id']
    }, {'$set': {
        'ethereum_address': data['account'],
    }},
        upsert=False)
    return json.dumps({'status': True})


@bp.route('/submit-dao', methods=['POST'])
@jwt_required
def submit_dao():
    data = json.loads(request.data)
    if 'publicKey' not in data:
        raise ErrorToClient('Error in connection - No publicKey Founded')
    if 'dao' not in data:
        raise ErrorToClient('Error in connection - No DAO Founded')
    res = g.db.members.find_one({'publicKey': data['publicKey']})
    if not res:
        raise ErrorToClient('No Public Key Founded')
    g.db.dao.update_one({
        'publicKey': data['publicKey']
    }, {'$set': {
        'publicKey': data['publicKey'],
        'dao': data['dao'],
        'confirm': False,
        'processed': False,
        'counter': 0,
    }}, upsert=True)
    return json.dumps({'status': True})


@bp.route('/check-dao', methods=['POST'])
def check_dao():
    data = json.loads(request.data)
    if 'publicKey' not in data:
        raise ErrorToClient('Error in connection - No publicKey Founded')
    res = g.db.dao.find_one({'publicKey': data['publicKey']})
    if not res:
        raise ErrorToClient('No Public Key Founded')
    if res['confirm']:
        return json.dumps({'status': True})
    if res['processed'] and not res['confirm']:
        raise ErrorToClient(
            'Your DAO Address not Confirmed, Please Enter Your DAO Again')
    return json.dumps({'status': False})


@bp.route('/submit-city', methods=['POST'])
@jwt_required
def submit_city():
    data = json.loads(request.data)
    if 'publicKey' not in data:
        raise ErrorToClient('Error in connection - No publicKey Founded')
    if 'city' not in data:
        raise ErrorToClient('Error in connection - No Account Founded')
    res = g.db.members.find_one({'publicKey': data['publicKey']})
    if not res:
        raise ErrorToClient('No Public Key Founded')
    g.db.members.update_one({
        '_id': res['_id']
    }, {'$set': {
        'city': data['city'],
    }}, upsert=False)
    g.db.points.insert_one({
        'publicKey': data['publicKey'],
        'type': 'city',
        'value': config.REWARDS.city
    })
    return json.dumps({'status': True})


@bp.route('/is-login')
@jwt_required
def is_login():
    return json.dumps({'status': True, 'login_status': True, 'msg': 'You are login'})


def calculate_rewards(publicKey):
    res = g.db.points.find({'publicKey': publicKey})
    if res.count() == 0:
        return 0
    points = 0
    for item in res:
        points += item['value']
    return points


def add_brightid_score(publicKey, brightid_level_reached=False, score=0):
    g.db.members.update_one({
        'publicKey': publicKey
    }, {'$set': {
        'score': score,
    }},
        upsert=False)

    if brightid_level_reached:
        return True

    score = True if score >= 90 else False

    # if not score:
    #         return score

    g.db.members.update_one({
        'publicKey': publicKey
    }, {'$set': {
        'brightid_level_reached': score,
    }},
        upsert=False)

    if not score:
        return False
    g.db.points.insert_one({
        'publicKey': publicKey,
        'type': 'brightid_score',
        'value': config.REWARDS.brightid_score
    })
    return True


def init_types(data):
    data['points'] = 0
    data['credit'] = 0
    data['earned'] = 0
    data['instagram'] = None
    data['city'] = None
    data['instagram_confirmation'] = False
    data['twitter'] = None
    data['twitter_confirmation'] = False
    data['brightid_level_reached'] = False
    return data


def jwt_create_token(publicKey):
    # Create our JWTs
    access_token = create_access_token(identity=publicKey)
    refresh_token = create_refresh_token(identity=publicKey)

    access_jti = get_jti(encoded_token=access_token)
    refresh_jti = get_jti(encoded_token=refresh_token)
    revoked_store.set(access_jti, 'false', ACCESS_EXPIRES * 1.2)
    revoked_store.set(refresh_jti, 'false', REFRESH_EXPIRES * 1.2)

    ret = {
        'access_token': access_token,
        'refresh_token': refresh_token
    }
    return ret


def save_photo(photo):
    filename = str(uuid.uuid4())
    # user photo its not important, so we save it in tmp folder
    path = '/tmp/blankdao-user-images'
    if not os.path.exists(path):
        os.mkdir(path)

    data = photo.split(',')[1]
    data = base64.b64decode(data)
    with open('{}/{}.png'.format(path, filename), 'wb') as f:
        f.write(data)
    return filename


@bp.route('/user-photo/<file>')
def user_photo(file):
    return send_from_directory('/tmp/blankdao-user-images/', file + '.png')


@bp.route('/login', methods=['POST'])
def submit_member():
    # TODO: just allow the js server call this function - get a signutare
    data = json.loads(request.data)

    if not verify_message(data['publicKey'], data['timestamp'],
                          data['signedMessage']):
        raise ErrorToClient('Invalid Data')

    res = g.db.members.find_one({'publicKey': data['publicKey']})
    r = {'status': True, 'publicKey': data['publicKey']}
    if res:
        add_brightid_score(data['publicKey'],
                           res['brightid_level_reached'], data['score'])
        token = jwt_create_token(data['publicKey'])
        r.update(token)
        return jsonify(r)

    data = init_types(data)
    data['photoURL'] = save_photo(data['photo'])
    del data['photo']
    g.db.members.insert_one(data)
    add_brightid_score(data['publicKey'], False, data['score'])
    token = jwt_create_token(data['publicKey'])
    r.update(token)
    return jsonify(r)


@bp.route('/logout')
@jwt_required
def logout():
    jti = get_raw_jwt()['jti']
    revoked_store.set(jti, 'true', ACCESS_EXPIRES * 1.2)
    return json.dumps({'status': True, 'msg': 'Logout Successfully'})


@bp.route('/new-code')
def new_code():
    try:
        r = requests.get('http://127.0.0.1:2200/new-code')
        return r.text
    except Exception as e:
        raise ErrorToClient('Cant Get New Connection')


@bp.route('/check-code', methods=['POST'])
def check_code():
    data = json.loads(request.data)
    r = requests.post('http://127.0.0.1:2200/check-code', data=data)
    return r.text


@bp.route('/check-account', methods=['POST'])
def check_account():
    data = json.loads(request.data)
    account = check_eth_addr(data['account'])
    res = g.db.referrers.find_one({'account': account})
    if res:
        if res['registered']:
            raise ErrorToClient('Your account has already been registered',
                                {'referrer': res['referrer']})
    return json.dumps({'status': True, 'msg': 'Allow'})


@bp.route('/add-referrer', methods=['POST'])
def add_referrer():
    data = json.loads(request.data)

    referrer = check_eth_addr(data['referrer'])
    account = check_eth_addr(data['account'])
    res = g.db.referrers.find_one({'account': account})
    if res:
        if res['registered']:
            raise ErrorToClient('Your account has already been registered')
        else:
            g.db.referrers.update_one({
                '_id': res['_id']
            }, {'$set': {
                'referrer': referrer,
                'hash': data['hash'],
            }},
                upsert=False)
    else:
        g.db.referrers.insert_one({
            'referrer': referrer,
            'account': account,
            'hash': data['hash'],
            'registered': False
        })
    return json.dumps({
        'msg': 'Your Address Submited Successfully',
        'status': True
    })


@bp.route('/get-referrer', methods=['POST'])
def get_referrer():
    data = json.loads(request.data)
    account = check_eth_addr(data['account'])
    doc = g.db.referrers.find({'account': account})
    if doc:
        if doc['registered']:
            return json.dumps({'referrer': doc['referrer'], 'status': True})
    return json.dumps({'msg': 'No referrer', 'status': False})


@bp.route('/get-referred-investors', methods=['POST'])
def get_referred_investors():
    referred_investors = []
    data = json.loads(request.data)
    account = check_eth_addr(data['account'])
    docs = g.db.referrers.find({'referrer': account})
    for doc in docs:
        if doc['registered']:
            referred_investors.append(doc['account'])
    return json.dumps({
        'referred-investors': referred_investors,
        'status': True
    })


@bp.route('/submit-instagram', methods=['POST'])
@jwt_required
def submit_instagram():
    data = json.loads(request.data)
    public_key = data['publicKey']
    res = g.db.members.find_one({'publicKey': public_key})
    if not res:
        return json.dumps({'msg': 'User Not Found', 'status': False})
    if res['instagram_confirmation']:
        return json.dumps({
            'msg': 'Instagram registered before',
            'status': False
        })
    g.db.members.update_one({
        'publicKey': public_key
    }, {'$set': {
        'instagram': data['instagram_username']
    }},
        upsert=False)
    return json.dumps({
        'msg':
        'Your Instagram Username Submited Successfully. It will be confirmed in next 24 hours',
        'status': True
    })


@bp.route('/twitter-login', methods=['POST'])
def twitter_login():
    data = json.loads(request.data)
    pk = data['publicKey']
    res = g.db.members.find_one({'publicKey': pk})
    if not res:
        raise ErrorToClient('Cant find your publicKey')

    if res['twitter_confirmation'] == True:
        raise ErrorToClient('Your twitter account submited')

    url = twitter.twitter_get_oauth_request_token(pk)
    return json.dumps({
        'url': url,
        'msg': 'Done Successfully',
        'status': True
    })


@bp.route('/twitter-authorized')
def twitter_authorized():
    res = g.db.twitter_temp.find_one(
        {'resource_owner_key': request.args.get('oauth_token')})
    if not res:
        raise ErrorToClient('Wrong oauth_token')

    key = res['resource_owner_key']
    secret = res['resource_owner_secret']
    access_token_list = twitter.twitter_get_oauth_token(
        request.args.get('oauth_verifier'), key, secret)
    user_data = twitter.twitter_get_access_token(access_token_list)
    user_data['publicKey'] = res['publicKey']
    g.db.twitter.insert_one(user_data)
    update_member_twitters_state(res['publicKey'])
    g.db.twitter_temp.delete_one({'_id': res['_id']})
    g.db.points.insert_one({
        'publicKey': res['publicKey'],
        'type': 'twitter',
        'value': config.REWARDS.twitter
    })
    return redirect('/index.html')


@bp.route('/instagram-image', methods=['POST'])
def instagram_image():
    data = json.loads(request.data)
    pk = data['publicKey']
    res = g.db.members.find_one({'publicKey': pk})
    if not res:
        raise ErrorToClient('Cant find your publicKey')

    image = InstagramQrCode()
    file_name = image.get_file(pk)
    return json.dumps({
        'file_name': file_name,
        'status': True
    })


# user allow us to check her/his account for new post
@bp.route('/instagram-apply', methods=['POST'])
def instagram_apply():
    data = json.loads(request.data)
    pk = data['publicKey']
    res = g.db.members.find_one({'publicKey': pk})
    if not res:
        raise ErrorToClient('Cant find your publicKey')

    image = InstagramQrCode()
    file_name = image.get_file(pk)
    return json.dumps({
        'file_name': file_name,
        'status': True
    })


@bp.route('/instagram-image/<file>')
def get_instagram_image(file):
    # TODO: if its not exsist, then call pic genrator
    return send_from_directory('/tmp/insta-images', file + '.png')


def update_member_twitters_state(publicKey):
    res = g.db.members.find_one({'publicKey': publicKey})
    if not res:
        raise ErrorToClient('something wrong, your public key is not defined')

    g.db.members.update_one({
        '_id': res['_id']
    }, {'$set': {
        'twitter_confirmation': True
    }},
        upsert=False)


def brightid_score():
    # TODO get scro from BrightID API ASAP
    pass


def verify_message(public_key, timestamp, sig):
    message = bytearray(
        public_key + config.BLANKDAO_PUBLIC_KEY + str(timestamp), 'utf8')

    try:
        verify_key = nacl.signing.VerifyKey(
            public_key, encoder=nacl.encoding.URLSafeBase64Encoder)
        encoder = nacl.encoding.URLSafeBase64Encoder
        verify_key.verify(message, encoder.decode(sig))
        return True
    except Exception:
        return False


def blank_token_balance(account):
    account = check_eth_addr(account)
    g.blank_token_contract = g.w3.eth.contract(
        address=config.BLANK_TOKEN_ADDR, abi=config.BLANK_TOKEN_ABI)

    func = g.blank_token_contract.functions.balanceOf(account)
    result = func.call({'from': account})
    return result
