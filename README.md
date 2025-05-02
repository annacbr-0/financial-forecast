# Create a new React app
npx create-react-app financial-forecast
cd financial-forecast
# Install the libraries used in the model
npm install recharts lucide-react
# Install GitHub Pages dependency
npm install --save-dev gh-pages
"homepage": "https://yourusername.github.io/financial-forecast",
"scripts": {
  // other existing scripts
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
