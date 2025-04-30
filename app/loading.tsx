export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl p-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Document Q&A Assistant</h1>
      <p className="mb-8 text-gray-600">Loading application...</p>

      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </div>
  )
}
