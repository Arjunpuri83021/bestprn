// Debug script to test VPS API vs Local API
const axios = require('axios');

const LOCAL_API = 'http://localhost:5000';
const VPS_API = 'https://api.majehimaje.life';

async function debugVpsApi() {
  try {
    console.log('🔍 Debugging VPS API vs Local API...\n');

    // Test 1: Compare total records
    console.log('1. Testing Total Records Count...');
    
    console.log('📡 Testing Local API...');
    const localResponse = await axios.get(`${LOCAL_API}/getpostdata?page=1&limit=16`).catch(err => {
      console.log('❌ Local API Error:', err.message);
      return null;
    });
    
    console.log('🌐 Testing VPS API...');
    const vpsResponse = await axios.get(`${VPS_API}/getpostdata?page=1&limit=16`).catch(err => {
      console.log('❌ VPS API Error:', err.message);
      return null;
    });

    if (localResponse && vpsResponse) {
      console.log('📊 COMPARISON:');
      console.log(`   Local Total Records: ${localResponse.data.totalRecords}`);
      console.log(`   VPS Total Records: ${vpsResponse.data.totalRecords}`);
      console.log(`   Local Total Pages: ${localResponse.data.totalPages}`);
      console.log(`   VPS Total Pages: ${vpsResponse.data.totalPages}`);
      console.log('');

      // Test 2: Check video numbers
      console.log('2. Testing Video Numbers...');
      
      console.log('📡 Local API - First 3 videos:');
      localResponse.data.records.slice(0, 3).forEach((video, index) => {
        console.log(`   ${index + 1}. dynamicVideoNo: ${video.dynamicVideoNo}, videoNo: ${video.videoNo}, title: "${video.titel}"`);
      });
      
      console.log('🌐 VPS API - First 3 videos:');
      vpsResponse.data.records.slice(0, 3).forEach((video, index) => {
        console.log(`   ${index + 1}. dynamicVideoNo: ${video.dynamicVideoNo}, videoNo: ${video.videoNo}, title: "${video.titel}"`);
      });
      console.log('');

      // Test 3: Check if VPS has the new numbering logic
      const vpsHasNumbering = vpsResponse.data.records.some(video => video.dynamicVideoNo);
      const localHasNumbering = localResponse.data.records.some(video => video.dynamicVideoNo);
      
      console.log('3. Numbering Logic Check...');
      console.log(`   Local has dynamicVideoNo: ${localHasNumbering ? '✅ YES' : '❌ NO'}`);
      console.log(`   VPS has dynamicVideoNo: ${vpsHasNumbering ? '✅ YES' : '❌ NO'}`);
      console.log('');

      // Test 4: Check multiple pages
      if (vpsResponse.data.totalPages > 1) {
        console.log('4. Testing Page 2...');
        const vpsPage2 = await axios.get(`${VPS_API}/getpostdata?page=2&limit=16`).catch(err => null);
        if (vpsPage2) {
          console.log(`   VPS Page 2 Records: ${vpsPage2.data.records.length}`);
          console.log(`   VPS Page 2 First Video Number: ${vpsPage2.data.records[0]?.dynamicVideoNo || 'NO NUMBER'}`);
        }
      }

      // Diagnosis
      console.log('🔧 DIAGNOSIS:');
      if (vpsResponse.data.totalRecords < localResponse.data.totalRecords) {
        console.log('   ⚠️  VPS has fewer records than Local');
        console.log('   📝 Possible causes:');
        console.log('      - Database not fully synced');
        console.log('      - Different database on VPS');
        console.log('      - Data migration incomplete');
      }
      
      if (!vpsHasNumbering && localHasNumbering) {
        console.log('   ⚠️  VPS missing dynamicVideoNo logic');
        console.log('   📝 Solution: Re-upload controler/controlers.js to VPS');
      }
      
      if (vpsResponse.data.totalRecords === 24) {
        console.log('   ⚠️  VPS showing exactly 24 records (suspicious)');
        console.log('   📝 This might be a pagination or database issue');
      }

    } else {
      console.log('❌ Could not connect to one or both APIs');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugVpsApi();
