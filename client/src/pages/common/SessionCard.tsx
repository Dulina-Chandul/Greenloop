import { Loader2, Trash2, Monitor, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import useDeleteSession from "@/hooks/useDeleteSession";

interface SessionProps {
  session: {
    _id: string;
    createdAt: string;
    userAgent: string;
    isCurrent: boolean;
  };
}

const SessionCard = ({ session }: SessionProps) => {
  const { _id, createdAt, userAgent, isCurrent } = session;
  const { deleteSession, ...rest } = useDeleteSession(_id);

  const isMobile = /mobile|android|iphone/i.test(userAgent);
  const DeviceIcon = isMobile ? Smartphone : Monitor;

  return (
    <Card
      className={`w-full transition-all ${isCurrent ? "border-green-200 bg-green-50/30" : "hover:border-gray-300"}`}
    >
      <CardContent className="flex items-center justify-between p-4">
        {/* Left Side: Icon & Info */}
        <div className="flex items-center gap-4 overflow-hidden">
          {/* Device Icon */}
          <div
            className={`rounded-full p-2 ${isCurrent ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
          >
            <DeviceIcon className="h-5 w-5" />
          </div>

          {/* Text Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-medium text-gray-900 truncate">
                {new Date(createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </span>
              {isCurrent && (
                <Badge
                  variant="outline"
                  className="border-green-600 text-green-600 text-[10px] px-1.5 py-0 h-5"
                >
                  Current
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate" title={userAgent}>
              {userAgent}
            </p>
          </div>
        </div>

        {/* Right Side: Delete Action */}
        {!isCurrent && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => deleteSession()}
            disabled={rest.isPending}
            title="Revoke Session"
          >
            {rest.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="sr-only">Revoke session</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionCard;
