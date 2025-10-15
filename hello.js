// Simple test function for DESERTGREENER system
// Thomas Laggner - DGRX Sales GmbH

exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'DESERTGREENER Lead System aktiv',
      timestamp: new Date().toISOString(),
      author: 'Thomas Laggner - DGRX Sales GmbH'
    })
  };
};