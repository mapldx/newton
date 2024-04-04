# <p align="center">🦊 newton</p>
<p align="center">A CLI that creates your API documentation for you with AI.</p>

## While in beta...
### Versions covered
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
3. Specify an `OPENAI_API_KEY` with funds or credits in a `.env` file, e.g.
```
echo "OPENAI_API_KEY=sk-123" > .env
```
4. Install `newton`'s dependencies
```
yarn
```
5. Install `newton` as a global package
```
npm install -g
```
6. Check that the latest version of `newton` is installed
```
npx newton --version
```

### Usage
```
npx newton
```
