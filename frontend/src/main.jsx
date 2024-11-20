import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Cabin:ital,wght@0,400..700;1,400..700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);