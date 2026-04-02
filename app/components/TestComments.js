'use client';

import { useState, useEffect } from 'react';

const TestComments = () => {
  const [testResult, setTestResult] = useState('');
  
  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await fetch('http://localhost:5000/comments/stats');
        const data = await response.json();
        setTestResult(`API Test Successful: ${JSON.stringify(data)}`);
      } catch (error) {
        setTestResult(`API Test Failed: ${error.message}`);
      }
    };
    
    testAPI();
  }, []);
  
  return (
    <div className="p-4 bg-gray-800 rounded">
      <h3 className="text-white font-bold">API Connection Test</h3>
      <p className="text-gray-300">{testResult}</p>
    </div>
  );
};

export default TestComments;