import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, ExternalLink, Calendar, Users, Building2 } from "lucide-react";
import { UseViewOrgResponseT } from "../../hooks/useViewOrg";
import Link from "next/link";
import DeleteOrgButton from "../buttons/DeleteOrgButton";

interface EditableOrgCardProps {
  org: UseViewOrgResponseT["data"][number];
  onEdit: (webName: string) => void;
}

const EditableOrgCard = ({ org, onEdit }: EditableOrgCardProps) => {
  return (
    <Card className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <CardContent className="p-5 flex flex-col justify-between flex-1 gap-4">
        {/* Card Header: Name and ID */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <Building2 className="h-4 w-4" />
              </div>
              <Link
                href={`/admin/dashboard/organization/o/${org.doctorWebName}`}
                className="text-base font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors truncate capitalize block"
                title={org.doctorWebName}
              >
                {org.doctorWebName}
              </Link>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate pl-10 font-mono">
              ID: {org.id}
            </p>
          </div>
        </div>

        {/* License & Service Details */}
        <div className="space-y-2 py-1 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 pt-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-teal-600" />
              <span>Validity</span>
            </span>
            <span className="font-medium font-mono text-[11px]">
              {new Date(org.serviceStartDate).toLocaleDateString()} – {new Date(org.serviceEndDate).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Users className="h-3.5 w-3.5 text-cyan-600" />
              <span>User Limit</span>
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {org.userLimit} Users
            </span>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 rounded-lg text-xs font-semibold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/50"
          >
            <Link
              href={`/admin/dashboard/organization/o/${org.doctorWebName}`}
              className="flex items-center gap-1.5"
            >
              <span>Manage</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              onClick={() => onEdit(org.doctorWebName)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors"
              title="Edit Organization"
              aria-label="Edit Organization"
            >
              <Edit className="h-4 w-4" />
            </Button>

            <DeleteOrgButton
              variant="icon"
              webName={org.doctorWebName}
              displayName={org.doctorWebName}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditableOrgCard;
