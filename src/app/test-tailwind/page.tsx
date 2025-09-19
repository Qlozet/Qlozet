export default function TestTailwind() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Tailwind CSS Test</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Colors</h2>
            <div className="space-y-2">
              <div className="bg-red-500 text-white p-2 rounded">Red Background</div>
              <div className="bg-blue-500 text-white p-2 rounded">Blue Background</div>
              <div className="bg-green-500 text-white p-2 rounded">Green Background</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Custom Colors</h2>
            <div className="space-y-2">
              <div className="bg-primary text-white p-2 rounded">Primary Color</div>
              <div className="bg-primary-200 text-white p-2 rounded">Primary 200</div>
              <div className="bg-success text-white p-2 rounded">Success Color</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Scroll Test</h2>
            <div className="h-32 overflow-y-auto scrollbar-hide bg-gray-50 p-2 rounded">
              <p>This is a scrollable area with hidden scrollbar.</p>
              <p>Line 2</p>
              <p>Line 3</p>
              <p>Line 4</p>
              <p>Line 5</p>
              <p>Line 6</p>
              <p>Line 7</p>
              <p>Line 8</p>
              <p>Line 9</p>
              <p>Line 10</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Responsive Test</h2>
          <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">
            This text should change size based on screen size
          </div>
        </div>
      </div>
    </div>
  );
}