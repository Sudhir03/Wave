import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ProfilePhotoUpload } from "@/components/molecules/ProfilePhotoUpload";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Pencil, X } from "lucide-react";

export function AccountForm() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "John Doe",
      phone: "+91 9876543210",
      email: "john@example.com",
      bio: "This is my bio",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const [editField, setEditField] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const name = useWatch({ control, name: "name" });
  const phone = useWatch({ control, name: "phone" });
  const email = useWatch({ control, name: "email" });
  const bio = useWatch({ control, name: "bio" });
  const newPassword = watch("newPassword");

  const onSubmit = (data) => {
    console.log("Submitted:", data);
    setEditField(null);
  };

  const handleDeactivate = () => {
    console.log("Account deactivated");
    // Add your deactivate logic here
  };

  const handlePasswordChange = (data) => {
    console.log("Password change data:", data);
    setIsPasswordModalOpen(false);
    setValue("currentPassword", "");
    setValue("newPassword", "");
    setValue("confirmNewPassword", "");
    // Add your password update logic here
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 p-6 flex-grow"
      >
        {/* Profile Photo */}
        <div className="self-center">
          <ProfilePhotoUpload
            src="/default-avatar.png"
            onEdit={() => console.log("Edit photo")}
          />
        </div>

        {/* Name */}
        <div className="flex justify-between gap-1">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">
              Name
            </label>
            {editField === "name" ? (
              <Input
                {...register("name", { required: "Name is required" })}
                placeholder="Enter your name"
              />
            ) : (
              <p className="text-foreground font-medium">{name || "Not set"}</p>
            )}
            {errors.name && (
              <span className="text-xs text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="self-end"
            onClick={() => setEditField(editField === "name" ? null : "name")}
          >
            {editField === "name" ? (
              <X className="w-4 h-4" />
            ) : (
              <Pencil className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Phone */}
        <div className="flex justify-between gap-1">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-muted-foreground">
              Phone Number
            </label>
            {editField === "phone" ? (
              <Input
                {...register("phone", { required: "Phone number is required" })}
                type="tel"
                placeholder="Enter your number"
              />
            ) : (
              <p className="text-foreground font-medium">
                {phone || "Not set"}
              </p>
            )}
            {errors.phone && (
              <span className="text-xs text-red-500">
                {errors.phone.message}
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="self-end"
            onClick={() => setEditField(editField === "phone" ? null : "phone")}
          >
            {editField === "phone" ? (
              <X className="w-4 h-4" />
            ) : (
              <Pencil className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Email */}
        <div className="flex justify-between gap-1">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            {editField === "email" ? (
              <Input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format",
                  },
                })}
                type="email"
                placeholder="Enter your email"
              />
            ) : (
              <p className="text-foreground font-medium">
                {email || "Not set"}
              </p>
            )}
            {errors.email && (
              <span className="text-xs text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="self-end"
            onClick={() => setEditField(editField === "email" ? null : "email")}
          >
            {editField === "email" ? (
              <X className="w-4 h-4" />
            ) : (
              <Pencil className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Bio */}
        <div className="flex justify-between gap-1">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-muted-foreground">
              Bio
            </label>
            {editField === "bio" ? (
              <textarea
                {...register("bio")}
                className="bg-background text-foreground border border-border rounded-md px-3 py-2 text-sm focus-visible:border-2 focus-visible:border-border focus-visible:ring-0 focus-visible:outline-none shadow-none h-24 resize-none"
              />
            ) : (
              <p className="text-foreground">{bio || "No bio set"}</p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="self-start mt-6"
            onClick={() => setEditField(editField === "bio" ? null : "bio")}
          >
            {editField === "bio" ? (
              <X className="w-4 h-4" />
            ) : (
              <Pencil className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Password */}
        <div className="flex justify-between gap-1 items-center">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-muted-foreground">
              Password
            </label>
            <p className="text-foreground font-medium">********</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="self-end "
            onClick={() => setIsPasswordModalOpen(true)}
          >
            Change
          </Button>
        </div>

        {/* Actions */}
        {editField && (
          <div className="flex flex-col gap-4 mt-10">
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </div>
        )}
      </form>

      {/* Deactivate Account */}
      <div className="p-6 border-t border-border">
        <Button
          type="button"
          variant="destructive"
          className="w-full"
          onClick={handleDeactivate}
        >
          Deactivate Account
        </Button>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Change Password</h3>
            <form
              onSubmit={handleSubmit(handlePasswordChange)}
              className="flex flex-col gap-4"
            >
              <Input
                {...register("currentPassword", {
                  required: "Current password is required",
                })}
                type="password"
                placeholder="Current Password"
              />
              {errors.currentPassword && (
                <span className="text-xs text-red-500">
                  {errors.currentPassword.message}
                </span>
              )}

              <Input
                {...register("newPassword", {
                  required: "New password is required",
                })}
                type="password"
                placeholder="New Password"
              />
              {errors.newPassword && (
                <span className="text-xs text-red-500">
                  {errors.newPassword.message}
                </span>
              )}

              <Input
                {...register("confirmNewPassword", {
                  required: "Please confirm your new password",
                  validate: (value) =>
                    value === newPassword || "Passwords do not match",
                })}
                type="password"
                placeholder="Confirm New Password"
              />
              {errors.confirmNewPassword && (
                <span className="text-xs text-red-500">
                  {errors.confirmNewPassword.message}
                </span>
              )}

              <div className="flex gap-4 mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
