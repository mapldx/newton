# <p align="center">🦊 newton</p>
<p align="center">A CLI that creates your API documentation for you with AI.</p>

## While in beta...
### Versions covered
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
