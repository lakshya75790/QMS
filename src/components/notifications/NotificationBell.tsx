"use client";

import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCheck,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  useGetNotifications,
  useGetUnreadCount,
  useMarkNotificationRead,
} from "@/feature/notifications/hooks/useNotifications";
import useWebName from "@/hooks/useWebName";
import Link from "next/link";
import { formateReadableDateTime } from "@/lib/utils/dateUtils";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function NotificationBell() {
  const user = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const { webName } = useWebName();
  const notificationsUrl = webName
    ? `/admin/dashboard/organization/o/${encodeURIComponent(webName)}/notifications`
    : "/notifications";

  const { data: unreadData } = useGetUnreadCount();
  const unreadCount = unreadData?.unreadCount || 0;

  const { data, isLoading } = useGetNotifications("all", 1, 10, isOpen);
  const notifications = data?.data || [];

  const { mutate: markRead } = useMarkNotificationRead();

  if (user?.role === "SUPER_ADMIN") {
    return null;
  }

  const handleMarkAllRead = () => {
    markRead({ markAll: true });
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markRead({ notificationId: notification.id });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "TOKEN_CALLED":
        return <Bell className="h-4 w-4 text-amber-500 animate-bounce" />;
      case "RESCHEDULE_REQUESTED":
      case "RESCHEDULE_APPROVED":
      case "RESCHEDULE_REJECTED":
      case "APPOINTMENT_RESCHEDULED":
        return <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "PRESCRIPTION_ADDED":
        return <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case "PAYMENT_RECEIVED":
        return <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "REVISIT_SCHEDULED":
        return <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Bell className="h-4 w-4 text-teal-600 dark:text-teal-400" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-xs hover:border-teal-300 dark:hover:border-teal-700 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-extrabold text-white shadow-xs animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-0 rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
      >
        {/* Dropdown Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Notifications
            </h4>
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-100 dark:bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                {unreadCount} New
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-7 px-2 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 gap-1 rounded-lg"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notification Items List */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {isLoading ? (
            <div className="p-6 text-center text-xs text-slate-400 space-y-2">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto text-slate-400" />
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Bell className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                No notifications yet
              </p>
              <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                Updates regarding your appointments and clinic visits will appear here.
              </p>
            </div>
          ) : (
            notifications.map((item: any) => (
              <button
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/60 ${
                  !item.isRead
                    ? "bg-blue-50/40 dark:bg-blue-950/20"
                    : "bg-white dark:bg-slate-950"
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  {getNotificationIcon(item.type)}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={`text-xs font-bold truncate ${
                        !item.isRead
                          ? "text-blue-900 dark:text-blue-200"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {item.title}
                    </p>
                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                  <p className="text-[10px] text-slate-400 pt-0.5">
                    {formateReadableDateTime(item.createdAt)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer Link */}
        <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center">
          <Link
            href={notificationsUrl}
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 py-1"
          >
            <span>View All Notifications</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
