
# <p align="center">🦊 newton</p>
<p align="center">A CLI that creates your API documentation for you with AI.</p>

## Examples
### Node.js (Express) project 
_[showing completed results]_
<details open>
    <summary>Raw <code>index.js</code> as source file:</summary>

    const express = require('express');
    const app = express();

    app.post('/users', (req, res) => {
        const { username, email } = req.body;

        res.status(200).json({ message: 'User created successfully', username, email });
        if (!username || !email) {
            res.status(400).send('Missing required arguments');
        }
    });
    .
    .
    .
    [full source in examples/express-app/index.js]
</details>
<details open>
    <summary><code>npx newton</code> exported to Next.js site:</summary>
    <img src="https://github.com/mapldx/newton/blob/main/examples/express-app/express-next-page.png?raw=true">
</details>
<details>
    <summary><code>npx newton</code> exported to simple HTML page <a href="https://github.com/mapldx/newton/blob/main/examples/express-app/api-documentation.html">(source)</a>:</summary>
    <img src="https://github.com/mapldx/newton/blob/main/examples/express-app/express-simple-html.png?raw=true">
</details>
<details>
    <summary><code>npx newton</code> exported to JSON <a href="https://github.com/mapldx/newton/blob/main/examples/express-app/api-documentation.json">here</a></summary>
</details>
<details>
    <summary><code>npx newton</code> exported to Markdown <a href="https://github.com/mapldx/newton/blob/main/examples/express-app/api-documentation.md">here</a></summary>
</details>

### Flask (Python) project 
_[showing steps in process]_
<details open>
    <summary>Talking to AI to generate documentation for a route:</summary>
    <img src="https://github.com/mapldx/newton/blob/main/examples/flask-app/flask-at-talking-to-ai.png?raw=true">
</details>
<details>
    <summary>Configuring generating of Next.js site export:</summary>
    <img src="https://github.com/mapldx/newton/blob/main/examples/flask-app/flask-at-creating-next-export.png?raw=true">
</details>
<details>
    <summary>Generating of Next.js site export complete:</summary>
    <img src="https://github.com/mapldx/newton/blob/main/examples/flask-app/flask-at-complete-next.png?raw=true">
</details>

## While in beta...
### Versions covered
- `1.0.2`:
    - add functionality to export generated documentation to responsive Next.js site
    - add tab autocompletion for specifying project directory path
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
- one valid package.json exists in the project folder (ideally, initialized by `npm init`), other than any in `node_modules` as they are ignored by default
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
> Note: The files mentioned above are provided for illustrative purposes only and do not guarantee functionality. However, their formats served as a guideline for Newton's parsing functionalities.
