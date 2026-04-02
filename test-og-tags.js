/**
 * Quick OG Tags Tester
 * Run this after building your Next.js app to verify OG tags
 */

const http = require('http');

const PORT = 3000;
const VIDEO_ID = '67115a3a5a6b6c001f6f8e8a'; // Replace with actual video ID

console.log('\n🔍 Testing Open Graph Tags...\n');
console.log('Make sure your Next.js app is running on port 3000');
console.log('Run: npm run build && npm start\n');

const testUrl = `http://localhost:${PORT}/video/${VIDEO_ID}`;

http.get(testUrl, (res) => {
  let html = '';
  
  res.on('data', (chunk) => {
    html += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Page loaded successfully\n');
    
    // Check for OG tags
    const ogTags = [
      'og:title',
      'og:description',
      'og:image',
      'og:url',
      'og:type',
      'og:site_name',
      'twitter:card',
      'twitter:title',
      'twitter:description',
      'twitter:image'
    ];
    
    console.log('📋 Open Graph Tags Found:\n');
    
    ogTags.forEach(tag => {
      const regex = new RegExp(`<meta[^>]*(?:property|name)="${tag}"[^>]*content="([^"]*)"`, 'i');
      const match = html.match(regex);
      
      if (match) {
        const content = match[1].substring(0, 80) + (match[1].length > 80 ? '...' : '');
        console.log(`✅ ${tag.padEnd(20)} : ${content}`);
      } else {
        console.log(`❌ ${tag.padEnd(20)} : NOT FOUND`);
      }
    });
    
    // Check for structured data
    if (html.includes('application/ld+json')) {
      console.log('\n✅ JSON-LD Structured Data: FOUND');
    } else {
      console.log('\n❌ JSON-LD Structured Data: NOT FOUND');
    }
    
    console.log('\n📊 Summary:');
    const foundCount = ogTags.filter(tag => {
      const regex = new RegExp(`<meta[^>]*(?:property|name)="${tag}"`, 'i');
      return html.match(regex);
    }).length;
    
    console.log(`Found ${foundCount}/${ogTags.length} meta tags`);
    
    if (foundCount === ogTags.length) {
      console.log('\n🎉 All OG tags are properly configured!');
    } else {
      console.log('\n⚠️  Some OG tags are missing. Check the output above.');
    }
    
    console.log('\n💡 To test on social media:');
    console.log('1. Use ngrok: ngrok http 3000');
    console.log('2. Test URL on: https://developers.facebook.com/tools/debug/');
    console.log('3. Or use: https://cards-dev.twitter.com/validator\n');
  });
  
}).on('error', (err) => {
  console.error('❌ Error: Make sure Next.js app is running on port 3000');
  console.error('Run: npm run build && npm start');
  console.error('\nError details:', err.message);
});
