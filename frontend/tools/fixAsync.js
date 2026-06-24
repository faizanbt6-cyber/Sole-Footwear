const fs = require('fs');

let content = fs.readFileSync('productDetail.html', 'utf8');

// 1. Make getProductData async
content = content.replace(/function getProductData\(id\)\s*\{/g, 'async function getProductData(id) {');

// 2. Wrap load product logic in an async IIFE
const loadProductStartRegex = /\/\/  LOAD PRODUCT \s+if \(!productId\)/;
const loadProductStartReplace = `//  LOAD PRODUCT \n(async function initProductPage() {\n  if (!productId)`;

content = content.replace(loadProductStartRegex, loadProductStartReplace);

// 3. Find the end of the init block
// The init block ends right before //  RELATED PRODUCTS
const relatedStartRegex = /\/\/  RELATED PRODUCTS /;
const relatedStartReplace = `})();\n\n//  RELATED PRODUCTS `;

content = content.replace(relatedStartRegex, relatedStartReplace);

// 4. Also make sure currentProduct is awaited
content = content.replace(/currentProduct = getProductData\(productId\);/g, 'currentProduct = await getProductData(productId);');

// 5. Make renderRelatedProducts async
content = content.replace(/function renderRelatedProducts\(\)\s*\{/g, 'async function renderRelatedProducts() {');

fs.writeFileSync('productDetail.html', content, 'utf8');
console.log('Fixed productDetail.html async logic');
