import React from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import useAddEditOrgUserForm from "../../hooks/useAddEditOrgUserForm";
import { useAddEditOrgUserDialog } from "../../hooks/useAddEditOrgUserDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userRoleLimitedAccess } from "@/constant";
import { User, Phone, Shield } from "lucide-react";

const AddEditOrgUserForm = () => {
  const { form, handleSubmit, isLoading } = useAddEditOrgUserForm();
  const orgUserInfoDialog = useAddEditOrgUserDialog((s) => s.orgUserInfo);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Staff Name
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    disabled={isLoading}
                    placeholder="Enter full name"
                    className="pl-9 rounded-xl h-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Phone Number
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    disabled={isLoading}
                    type="tel"
                    placeholder="+919876543210"
                    className="pl-9 rounded-xl h-10 font-mono"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Access Role
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <div className="relative">
                    <SelectTrigger disabled={isLoading} className="rounded-xl h-10">
                      <SelectValue placeholder="Select an access role" />
                    </SelectTrigger>
                  </div>
                </FormControl>
                <SelectContent>
                  {userRoleLimitedAccess.map((role) => (
                    <SelectItem value={role} key={role} className="text-xs">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-xl bg-teal-600 font-semibold text-white hover:bg-teal-700 shadow-sm"
          >
            {orgUserInfoDialog?.type === "create" ? "Create User" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddEditOrgUserForm;
