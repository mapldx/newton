<div align="center">
    <div>
        <img src="https://raw.githubusercontent.com/mapldx/newton/main/examples/cover-example.png"/>
        <h1 align="center">🦊 newton</h1>
    </div>
	<p>A CLI that creates your API documentation for you with AI</p>
	<a href="https://www.npmjs.com/package/newton-aidocs">
        <img alt="NPM Version" src="https://img.shields.io/npm/v/newton-aidocs">
    </a>
    <img alt="GitHub Release Date" src="https://img.shields.io/github/release-date/mapldx/newton">
</div>

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
<table>
  <tr>
    <th>Light</th>
    <th>Dark</th>
  </tr>
  <tr>
    <td><img src="https://github.com/mapldx/newton/blob/main/examples/next-light-mode.png?raw=true"></td>
    <td><img src="https://github.com/mapldx/newton/blob/main/examples/next-dark-mode.png?raw=true"></td>
  </tr>
</table>
</details>
<details>
    <summary><code>npx newton</code> exported to simple HTML page <a href="https://github.com/mapldx/newton/blob/main/examples/express-app/api-documentation.html">(source)</a>:</summary>
    <img src="https://github.com/mapldx/newton/blob/main/examples/express-simple-html.png?raw=true">
</details>
<details>
    <summary><code>npx newton</code> exported to JSON <a href="https://github.com/mapldx/newton/blob/main/examples/express-app/api-documentation.json">here</a></summary>
</details>
<details>
    <summary><code>npx newton</code> exported to Markdown <a href="https://github.com/mapldx/newton/blob/main/examples/express-app/api-documentation.md">here</a></summary>
</details>

### Flask (Python) project 
_[showing steps in process]_
<details>
    <summary>Talking to AI to generate documentation for a route:</summary>
    <img src="https://github.com/mapldx/newton/blob/main/examples/flask-at-talking-to-ai.png?raw=true">
</details>
<details open>
    <summary>Generating a Next.js site from an existing newton-generated JSON:</summary>
    <img src="https://github.com/mapldx/newton/blob/main/examples/flask-at-transmogrifying-existing.png?raw=true">
</details>
<details>
    <summary>Generating of Next.js site export complete:</summary>
    <img src="https://github.com/mapldx/newton/blob/main/examples/flask-at-complete-next.png?raw=true">
</details>

## While in beta...
### Set up
1. Install `newton` globally
```
npm install -g newton-aidocs
```
2. Perform first time set up by configuring `newton` with an OpenAI API key that has billing set up
```
npx newton
```

### Versions covered
- `1.0.6`
- `1.0.5`
- `1.0.4`:
    - add search functionality on Next generated site, searching by endpoint title
    - add dark color scheme as an option for exporting Next generated site
    - add `npx newton -t` option to allow converting of previously generated or existing newton-generated JSON to other export options
- `1.0.3`
- `1.0.2`:
    - add functionality to export generated documentation to responsive Next.js site
    - add tab autocompletion for specifying project directory path
- `1.0.1`:
    - add support for Flask (Python) projects
    - allow user to specify their own OpenAI API key for saved locally for persistent use
- `1.0.0`:
    - add functionality to generate documentation in JSON, Markdown, and HTML for Express.js (Node.js) APIs using GPT-3.5 Turbo

### Usage
```
npx newton [--version/--transmogrify-only/--help]
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

### What is `transmogrify`?
<img src="https://github.com/mapldx/newton/blob/main/examples/transmogrifier-comic.png?raw=true">
