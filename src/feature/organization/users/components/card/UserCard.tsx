import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Edit, Trash2, ShieldCheck, UserCheck } from "lucide-react";
import { useGetUsersResponseT } from "../../hooks/useGetUsers";
import { getInitials } from "@/lib/utils/stringUtils";

interface UserCardProps {
  user: useGetUsersResponseT["users"][number];
  usersCount: number;
  onEdit: (user: useGetUsersResponseT["users"][number]) => void;
  onDelete: (user: useGetUsersResponseT["users"][number]) => void;
  showEdit?: boolean;
  showDelete?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  usersCount,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
}) => {
  const isRoleAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <Card className="overflow-hidden border-slate-200/80 dark:border-slate-800/80 bg-card hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3 pt-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-sm border shadow-sm ${
                  isRoleAdmin
                    ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                    : "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800"
                }`}
              >
                {getInitials(user.name || "U")}
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground line-clamp-1">
                  {user.name}
                </CardTitle>
                <span className="text-[11px] font-mono text-muted-foreground">
                  User ID: {user.userId.slice(0, 8)}...
                </span>
              </div>
            </div>

            <Badge
              variant="outline"
              className={`capitalize px-2.5 py-0.5 text-[11px] font-semibold flex items-center gap-1 ${
                isRoleAdmin
                  ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                  : "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800"
              }`}
            >
              {isRoleAdmin ? (
                <ShieldCheck className="h-3 w-3" />
              ) : (
                <UserCheck className="h-3 w-3" />
              )}
              <span>{user.role}</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-4 pt-1">
          <div className="flex items-center text-xs font-medium text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/60">
            <Phone className="mr-2 h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="font-mono text-foreground">{user.phone}</span>
          </div>
        </CardContent>
      </div>

      <CardFooter className="flex items-center justify-end gap-2 pt-2 pb-4 bg-muted/20 border-t border-border/60">
        {showEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(user)}
            className="h-8 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/50"
          >
            <Edit className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Button>
        )}
        {usersCount >= 2 && showDelete && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-lg text-xs font-semibold gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/50"
            onClick={() => onDelete(user)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default UserCard;
