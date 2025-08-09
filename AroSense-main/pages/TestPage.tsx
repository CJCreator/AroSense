import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-primary mb-4">UI Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Basic Card</h2>
          <p className="text-gray-600">This is a test card to verify UI components are working.</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Colored Card</h2>
          <p className="text-blue-600">Testing colored backgrounds and text.</p>
        </div>
      </div>
      
      <div className="mt-6">
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark mr-2">
          Primary Button
        </button>
        <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
          Secondary Button
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-green-800 font-semibold">Success Message</h3>
        <p className="text-green-600">If you can see this page, the basic UI is working!</p>
      </div>
    </div>
  );
};

export default TestPage;