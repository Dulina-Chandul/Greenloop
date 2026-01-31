import { Loader2, AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import useSession from "@/hooks/useSession";
import SessionCard from "./SessionCard";

const Settings = () => {
  const { sessions, isPending, isSuccess, isError } = useSession();

  return (
    <div className="container mx-auto mt-16 max-w-3xl px-4">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900">
        My Sessions
      </h1>

      {/* Loading State */}
      {isPending && (
        <div className="flex w-full justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load your active sessions. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Sessions List */}
      {isSuccess && (
        <div className="flex flex-col space-y-4">
          {sessions?.length === 0 ? (
            <p className="text-gray-500">No active sessions found.</p>
          ) : (
            sessions.map((session: any) => (
              <SessionCard key={session._id} session={session} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;
