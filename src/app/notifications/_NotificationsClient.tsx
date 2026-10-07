"use client";

import React, { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  useGetNotifications,
  useGetUnreadCount,
  useMarkNotificationRead,
  NotificationItem,
} from "@/feature/notifications/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface NotificationsClientProps {
  showBackButton?: boolean;
}

export default function NotificationsClient({ showBackButton = false }: NotificationsClientProps) {
  const [tab, setTab] = useState<"all" | "unread" | "read">("all");
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data, isLoading, isFetching } = useGetNotifications(tab, page, limit);
  const { data: unreadData } = useGetUnreadCount();
  const markReadMutation = useMarkNotificationRead();

  const notifications = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 15 };
  const totalPages = Math.ceil(pagination.total / limit) || 1;
  const unreadCount = unreadData?.unreadCount || 0;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "TOKEN_CALLED":
        return <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />;
      case "APPOINTMENT_CREATED":
        return <Calendar className="h-5 w-5 text-emerald-500" />;
      case "APPOINTMENT_STATUS_CHANGED":
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      case "RESCHEDULE_REQUESTED":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "RESCHEDULE_APPROVED":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "RESCHEDULE_REJECTED":
        return <XCircle className="h-5 w-5 text-rose-500" />;
      case "APPOINTMENT_RESCHEDULED":
        return <Calendar className="h-5 w-5 text-indigo-500" />;
      case "PAYMENT_RECEIVED":
        return <CreditCard className="h-5 w-5 text-violet-500" />;
      case "PRESCRIPTION_ADDED":
        return <FileText className="h-5 w-5 text-teal-500" />;
      case "REVISIT_SCHEDULED":
        return <Calendar className="h-5 w-5 text-cyan-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.isRead) {
      markReadMutation.mutate({ notificationId: notif.id });
    }
  };

  return (
    <div className="space-y-6">
      {/* Optional Back to Dashboard Button for Patient Side */}
      {showBackButton && (
        <div>
          <Link
            href="/history"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-800 transition-all w-fit group"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Bell className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Notifications
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Stay updated with your latest appointments, payments, prescriptions, and other important activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled={markReadMutation.isPending}
              onClick={() => markReadMutation.mutate({ markAll: true })}
              className="gap-2 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl"
            >
              {markReadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <button
            onClick={() => {
              setTab("all");
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === "all"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            All
          </button>

          <button
            onClick={() => {
              setTab("unread");
              setPage(1);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === "unread"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white text-[11px] px-1.5 py-0 rounded-full">
                {unreadCount}
              </Badge>
            )}
          </button>

          <button
            onClick={() => {
              setTab("read");
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === "read"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Read
          </button>
        </div>

        {isFetching && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Updating real-time...
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
            <p className="text-slate-500 text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              No notifications found
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              {tab === "unread"
                ? "You don't have any unread notifications right now."
                : tab === "read"
                ? "No read notifications found."
                : "Your notifications will appear here when appointments, reschedule requests, or payment updates occur."}
            </p>
          </div>
        ) : (
          notifications.map((notif: NotificationItem) => {
            const notifDate = notif.createdAt ? new Date(notif.createdAt) : new Date();
            const distance = formatDistanceToNow(notifDate, { addSuffix: true });
            const exactDate = format(notifDate, "MMM d, yyyy 'at' h:mm a");

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                  !notif.isRead
                    ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-900/60 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30 shadow-xs"
                    : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                }`}
              >
                {/* Unread indicator pill */}
                {!notif.isRead && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full" />
                )}

                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 group-hover:scale-105 transition-transform">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        !notif.isRead
                          ? "text-slate-900 dark:text-slate-100"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap" title={exactDate}>
                      {distance}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {!notif.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      markReadMutation.mutate({ notificationId: notif.id });
                    }}
                    title="Mark as read"
                    className="h-8 w-8 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/50 rounded-lg shrink-0"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page <span className="font-semibold text-slate-900 dark:text-slate-100">{page}</span> of{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">{totalPages}</span> ({pagination.total} total)
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1 rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1 rounded-xl"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
