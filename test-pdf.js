const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testPdfGeneration() {
  try {
    const response = await fetch('http://localhost:3000/api/generate-pdf-certificate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeName: 'Test User',
      }),
    });

    const result = await response.json();
    console.log('Response:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testPdfGeneration();
