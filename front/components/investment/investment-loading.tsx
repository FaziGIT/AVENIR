export const InvestmentLoading = () => (
  <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
    <main className="mx-auto max-w-[1800px] p-6">
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
          <p className="mt-4 text-gray-600">Loading investment data...</p>
        </div>
      </div>
    </main>
  </div>
);
