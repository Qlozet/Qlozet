type Params = Promise<{ userid: string }>;

export default async function VerifyUserPage({ params }: { params: Params }) {
  const { userid } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-gray-900">Verify account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Mirror of vendor /verify/[userid]. Replace with admin verification handler.
        </p>
        <p className="mt-4 text-xs text-gray-400">User ID: {userid}</p>
      </div>
    </div>
  );
}
