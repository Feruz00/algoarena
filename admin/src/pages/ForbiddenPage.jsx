const ForbiddenPage = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold">403</h1>
        <p className="mt-2 text-gray-500">
          You don't have permission to access this page.
        </p>
      </div>
    </div>
  );
};

export default ForbiddenPage;
