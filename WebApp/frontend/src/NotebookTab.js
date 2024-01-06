import React from 'react';
import Iframe from 'react-iframe';

function NotebookTab() {
  const notebookUrl = 'Sentiment_Analysis_Python.html'; // Replace with the actual URL or path to your HTML file

  return (
    <div>
      <Iframe
        url={notebookUrl}
        width="100%"
        height="600px"
        id="notebook-iframe"
        className="iframe-class"
        display="initial"
        position="relative"
      />
    </div>
  );
}

export default NotebookTab;
