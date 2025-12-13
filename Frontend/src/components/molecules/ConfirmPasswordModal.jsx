import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Loader2 } from "lucide-react";

export function ChangePasswordModal({
  register,
  errors,
  newPassword,
  onSubmit,
  onClose,
  isUpdating,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Change Password</h3>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {/* Current password */}
          <Input
            {...register("currentPassword", {
              required: "Current password is required",
            })}
            type="password"
            placeholder="Current Password"
            disabled={isUpdating}
          />
          {errors.currentPassword && (
            <span className="text-xs text-red-500">
              {errors.currentPassword.message}
            </span>
          )}

          {/* New password */}
          <Input
            {...register("newPassword", {
              required: "New password is required",
            })}
            type="password"
            placeholder="New Password"
            disabled={isUpdating}
          />
          {errors.newPassword && (
            <span className="text-xs text-red-500">
              {errors.newPassword.message}
            </span>
          )}

          {/* Confirm new password */}
          <Input
            {...register("confirmNewPassword", {
              required: "Please confirm your new password",
              validate: (value) =>
                value === newPassword || "Passwords do not match",
            })}
            type="password"
            placeholder="Confirm New Password"
            disabled={isUpdating}
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
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>

            <Button type="submit" className="flex-1" disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
