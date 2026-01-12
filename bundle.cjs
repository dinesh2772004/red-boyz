const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');
const assetsPath = path.join(distPath, 'assets');

if (!fs.existsSync(indexPath)) {
    console.error('dist/index.html not found. Run npm run build first.');
    process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf-8');

// Find CSS file
const cssFiles = fs.readdirSync(assetsPath).filter(f => f.endsWith('.css'));
if (cssFiles.length > 0) {
    const cssContent = fs.readFileSync(path.join(assetsPath, cssFiles[0]), 'utf-8');
    // Flexible regex for link tag
    const linkRegex = /<link\s+[^>]*?href="\/assets\/[^"]*?\.css"[^>]*?>/g;
    html = html.replace(linkRegex, () => `<style>${cssContent}</style>`);
    console.log(`Inlined ${cssFiles[0]}`);
}

// Find JS file
const jsFiles = fs.readdirSync(assetsPath).filter(f => f.endsWith('.js'));
if (jsFiles.length > 0) {
    const jsContent = fs.readFileSync(path.join(assetsPath, jsFiles[0]), 'utf-8');
    // Flexible regex for script tag
    const scriptRegex = /<script\s+[^>]*?src="\/assets\/[^"]*?\.js"[^>]*?><\/script>/g;
    html = html.replace(scriptRegex, () => `<script type="module">${jsContent}</script>`);
    console.log(`Inlined ${jsFiles[0]}`);
}

fs.writeFileSync(path.join(__dirname, 'redboyz.html'), html);
console.log('Successfully created redboyz.html');
