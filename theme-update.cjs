const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Replace Design Tokens
css = css.replace(/--bg-primary:\s*[^;]+;/g, '--bg-primary: #ffffff;');
css = css.replace(/--bg-surface:\s*[^;]+;/g, '--bg-surface: #f8f9fa;');
css = css.replace(/--bg-card:\s*[^;]+;/g, '--bg-card: #ffffff;');
css = css.replace(/--bg-card-hover:\s*[^;]+;/g, '--bg-card-hover: #f0f0f0;');

css = css.replace(/--border:\s*[^;]+;/g, '--border: #000000;');
css = css.replace(/--border-hover:\s*[^;]+;/g, '--border-hover: #000000;');

css = css.replace(/--text-primary:\s*[^;]+;/g, '--text-primary: #000000;');
css = css.replace(/--text-secondary:\s*[^;]+;/g, '--text-secondary: #000000;');
css = css.replace(/--text-muted:\s*[^;]+;/g, '--text-muted: #333333;');

css = css.replace(/--accent:\s*[^;]+;/g, '--accent: #000000;');
css = css.replace(/--accent-cyan:\s*[^;]+;/g, '--accent-cyan: #000000;');
css = css.replace(/--accent-gold:\s*[^;]+;/g, '--accent-gold: #000000;');

css = css.replace(/--font-sans:\s*[^;]+;/g, '--font-sans: "Plus Jakarta Sans", sans-serif;');
css = css.replace(/--font-mono:\s*[^;]+;/g, '--font-mono: "Space Grotesk", sans-serif;');

// Replace shadows
css = css.replace(/--shadow-glow:\s*[^;]+;/g, '--shadow-glow: 4px 4px 0px 0px rgba(0,0,0,1);');
css = css.replace(/--shadow-cyan:\s*[^;]+;/g, '--shadow-cyan: 4px 4px 0px 0px rgba(0,0,0,1);');
css = css.replace(/--shadow-gold:\s*[^;]+;/g, '--shadow-gold: 4px 4px 0px 0px rgba(0,0,0,1);');

// 2. Adjust Specific Component Styles
// Buttons
css = css.replace(/\.btn-primary\s*{[^}]+}/g, match => {
    return match
        .replace(/border-radius:\s*[^;]+;/, 'border-radius: 0px; border: 3px solid #000000;')
        .replace(/box-shadow:\s*[^;]+;/, 'box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);');
});
css = css.replace(/\.btn-primary:hover\s*{[^}]+}/g, match => {
    return match
        .replace(/transform:\s*[^;]+;/, 'transform: translate(2px, 2px);')
        .replace(/box-shadow:\s*[^;]+;/, 'box-shadow: 2px 2px 0px 0px rgba(0,0,0,1);');
});

// Cards
css = css.replace(/\.card\s*{[^}]+}/g, match => {
    return match
        .replace(/border-radius:\s*[^;]+;/, 'border-radius: 0px;')
        .replace(/border:\s*[^;]+;/, 'border: 3px solid #000000;');
});
css = css.replace(/\.card:hover\s*{[^}]+}/g, match => {
    return match
        .replace(/transform:\s*[^;]+;/, 'transform: translate(-4px, -4px);')
        .replace(/box-shadow:\s*[^;]+;/, 'box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);');
});
css = css.replace(/\.card::before\s*{[^}]+}/g, '.card::before { display: none; }');

// Navbar
css = css.replace(/\.navbar\s*{[^}]+}/g, match => {
    return match
        .replace(/background:\s*[^;]+;/, 'background: #ffffff;')
        .replace(/border-bottom:\s*[^;]+;/, 'border-bottom: 4px solid #000000;')
        .replace(/backdrop-filter:\s*[^;]+;/, '');
});

// Remove gradients
css = css.replace(/background:\s*linear-gradient\([^;]+\);/g, 'background: transparent;');
css = css.replace(/background-image:\s*radial-gradient\([^;]+\);/g, 'background: transparent;');

fs.writeFileSync(cssPath, css, 'utf8');
console.log('CSS updated successfully!');
