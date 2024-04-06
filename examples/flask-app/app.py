from flask import Flask, jsonify, request

app = Flask(__name__)

# Dummy authentication function
def authenticate(username, password):
    # Replace this with your actual authentication logic
    if username == 'admin' and password == 'password':
        return True
    return False

@app.route('/')
def hello():
    return jsonify(message='Hello, World!'), 200

@app.route('/api/data')
def get_data():
    try:
        # Some code that might raise an exception
        data = {'name': 'John Doe', 'age': 30, 'city': 'New York'}
        return jsonify(data), 200
    except Exception as e:
        # Handle the exception and return HTTP 500
        return jsonify(message='Internal Server Error'), 500

@app.route('/api/users', methods=['POST'])
def create_user():
    username = request.form.get('username')
    password = request.form.get('password')

    if not authenticate(username, password):
        return jsonify(message='Unauthorized'), 401

    return jsonify(message='User created'), 201

@app.errorhandler(404)
def not_found(error):
    return jsonify(message='Not Found'), 404

if __name__ == '__main__':
    app.run()