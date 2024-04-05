# <p align="center">🦊 newton</p>
<p align="center">A CLI that creates your API documentation for you with AI.</p>

## While in beta...
### Versions covered
- `1.0.2`:
    - add functionality to export generated documentation to responsive Next.js site
- `1.0.1`:
    - add support for Flask (Python) projects
    - allow user to specify their own OpenAI API key for saved locally for persistent use
- `1.0.0`: add functionality to generate documentation in JSON, Markdown, and HTML for Express.js (Node.js) APIs using GPT-3.5 Turbo

### Set up
1. Clone the repo
```
git clone https://github.com/mapldx/newton.git
```
2. Navigate to the directory
```
cd newton
```
3. Install `newton`'s dependencies
```
yarn
```
4. Install `newton` as a global package
```
npm install -g
```
5. Perform first time set up by configuring `newton` with an OpenAI API key that has billing set up
```
npx newton
```

### Usage
```
npx newton
```
1. For **Express.js (Node.js)** projects, `newton` works when:
- a valid package.json exists in the project folder (ideally, initialized by `npm init`)
- a "main" field exists and is populated in the package.json file
- the "main" field points to the app's entrypoint, which contains the Express.js routes, e.g. where each route begins on a new line with `app.{get, post, put, delete}`:
```
const express = require('express')
const app = express()
const port = 80

app.use(express.json());

app.post('/api/auth', async (req, res) => {
  const uid = req.body.uid;
  const user = db.collection('users').doc(uid);

  await user.set({
    uid: uid,
    last_login: Timestamp.now(),
  });

  res.send('Logged in user with uid ' + uid);
});
.
.
.
```
2. For **Flask (Python)** projects, `newton` works when:
- a file called `app.py` exists in the project directory (can be nested)
- `app.py` houses the Flask routes, e.g. where each route begins on a new line with `@app.route`:
```
from flask import Flask, request
.
.
.
app = Flask(__name__)

@app.route("/user/metadata", methods=['GET'])
def get_user():
    email = request.args.get('email')
    user = users.get_user(email)
    return user, 200

@app.route("/user/create", methods=['POST'])
def create_user():
    email = request.args.get('email')
    role = request.args.get('role')
    if role not in ["staff"]:
        return "Invalid role", 400
    user_created = users.create_user(email, role)
    return user_created, 200
.
.
.
```
> Note: The files mentioned above are provided for illustrative purposes only and do not guarantee functionality. However, their format served as a guideline for Newton's parsing functionalities.
