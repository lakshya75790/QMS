"use client";

import { useState, useMemo } from "react";
import useGetUsers, {
  useGetUsersResponseT,
} from "@/feature/organization/users/hooks/useGetUsers";
import { Card, CardContent } from "@/components/ui/card";
import UsersViewSkeleton from "@/feature/organization/users/components/UsersViewSkeleton";
import UserCard from "@/feature/organization/users/components/card/UserCard";
import dynamic from "next/dynamic";
import { useAddEditOrgUserDialog } from "@/feature/organization/users/hooks/useAddEditOrgUserDialog";
import useWebName from "@/hooks/useWebName";
import { userRoleLimitedAccess } from "@/constant";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import useDeleteOrgUser from "@/feature/organization/users/hooks/useDeleteOrgUser";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, UserX, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const AddEditOrgUserDialog = dynamic(
  () =>
    import(
      "@/feature/organization/users/components/dialog/AddEditOrgUserDialog"
    ),
  {
    ssr: false,
  },
);

type User = useGetUsersResponseT["users"][number];

const ViewUsers = () => {
  const { data, isLoading } = useGetUsers();
  const { webName } = useWebName();
  const onOpen = useAddEditOrgUserDialog((s) => s.onOpen);
  const currentUser = useCurrentUser();
  const { showAlertDialog, setAlertDialogLoading, closeAlertDialog } =
    useAlertDialog();
  const { mutateAsync: deleteMutateAsync } = useDeleteOrgUser();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");

  const users = useMemo(() => data?.users || [], [data?.users]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        selectedRole === "ALL" || u.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);

  const handleDelete = async (user: User) => {
    const confirmed = await showAlertDialog({
      title: "Are you sure?",
      description: (
        <span>
          This action cannot be undone. This will permanently delete the user
          <strong className="mx-2 text-2xl font-bold capitalize">
            {user.name}
          </strong>
          .
        </span>
      ),
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });

    if (confirmed) {
      setAlertDialogLoading(true);
      await deleteMutateAsync({
        param: {
          doctorWebName: webName,
          userId: user.userId,
        },
      });
      setAlertDialogLoading(false);
      setTimeout(() => {
        closeAlertDialog();
      }, 0);
    }
  };

  if (isLoading) {
    return <UsersViewSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      {users.length > 0 && (
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-card p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 h-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0">
                <SlidersHorizontal className="h-3.5 w-3.5 text-teal-600" />
                <span>Role:</span>
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-xs font-medium">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">
                    All Roles
                  </SelectItem>
                  {userRoleLimitedAccess.map((role) => (
                    <SelectItem key={role} value={role} className="text-xs">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* User Cards Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.userId}
              user={user}
              usersCount={users?.length}
              onDelete={() => handleDelete(user)}
              onEdit={() => {
                onOpen({
                  type: "edit",
                  orgUserInfo: {
                    webName: webName,
                    userId: user.userId,
                    name: user.name,
                    phoneNumber: user.phone,
                    role: user.role as (typeof userRoleLimitedAccess)[number],
                  },
                });
              }}
              showEdit={
                !!(
                  currentUser?.role === "ADMIN" ||
                  currentUser?.role === "SUPER_ADMIN"
                )
              }
              showDelete={
                !!(
                  currentUser?.role === "ADMIN" ||
                  currentUser?.role === "SUPER_ADMIN"
                )
              }
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-card p-10 text-center">
          <CardContent className="pt-4 flex flex-col items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 mb-3 shadow-sm">
              <UserX className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {users.length === 0 ? "No Users Registered" : "No Staff Matching Search"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {users.length === 0
                ? "No clinic staff or organization users have been created yet."
                : "Try adjusting your search query or role filter to find the staff member."}
            </p>
            {(searchTerm || selectedRole !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedRole("ALL");
                }}
                className="mt-4 rounded-xl text-xs font-semibold"
              >
                Reset Search Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <AddEditOrgUserDialog />
    </div>
  );
};

export default ViewUsers;
