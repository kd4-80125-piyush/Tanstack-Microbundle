import React from 'react';

function DisplayData({ selectedData, fetchData }) {
  if (!fetchData) {
    return null;
  }

  return (
    <div style={{ marginTop: '20px', border: 'solid 1px gray', padding: '10px' }}>
      <h3>Selected Data</h3>
      <pre>{JSON.stringify(selectedData, null, 2)}</pre>
    </div>
  );
}

export default DisplayData;
