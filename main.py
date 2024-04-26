from flask import Flask, request
import requests
import os
app = Flask(__name__)
@app.route("/")
def hello():
    return "server proxy"
@app.route('/proxy', methods=['GET'])
def proxy():
    url = request.args.get('url')
    response = requests.get(url)
    return response.content, response.status_code, response.headers.items()
if __name__ == '__main__':
    app.run(host='0.0.0.0',port=int(os.environ.get('PORT', 5000)),debug=False)
