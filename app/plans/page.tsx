"use client";

export default function Plans() {
  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Choose a Plan</h1>
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold">Basic Plan</h2>
          <p className="mt-2">Description of the basic plan.</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
            Subscribe
          </button>
        </div>
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold">Pro Plan</h2>
          <p className="mt-2">Description of the pro plan.</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
            Subscribe
          </button>
        </div>
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold">Enterprise Plan</h2>
          <p className="mt-2">Description of the enterprise plan.</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}