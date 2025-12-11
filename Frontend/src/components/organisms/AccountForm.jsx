import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";

import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { Pencil, X, Loader2 } from "lucide-react";

import { ProfilePhotoUpload } from "@/components/molecules/ProfilePhotoUpload";
import { ChangePasswordModal } from "@/components/molecules/ConfirmPasswordModal";

import {
  getMyProfile,
  updateMyProfile,
  updateMyAvatar,
  updateMyPassword,
} from "@/api/users";
import { Skeleton } from "../ui/skeleton";

export function AccountForm() {
  const { getToken } = useAuth();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const [editField, setEditField] = useState(null);
  const [originalValues, setOriginalValues] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  /* ------------------ LOAD PROFILE ------------------ */
  const { data: user, isLoading: isProfileLoading } = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const token = await getToken();
      return getMyProfile({ token });
    },
    select: (res) => res.user,
  });

  useEffect(() => {
    if (!user) return;

    const initial = {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      newPassword: "",
      confirmNewPassword: "",
    };

    reset(initial);
    setOriginalValues(initial);
  }, [user]);

  const firstName = watch("firstName");
  const lastName = watch("lastName");

  const hasChanges =
    originalValues &&
    (firstName !== originalValues.firstName ||
      lastName !== originalValues.lastName);

  /* ------------------ SAVE PROFILE ------------------ */
  const { mutate: saveProfile, isPending: isSavingProfile } = useMutation({
    mutationFn: async (formData) => {
      const token = await getToken();
      return updateMyProfile({
        token,
        payload: {
          name: {
            first: formData.firstName.trim(),
            last: formData.lastName.trim(),
          },
        },
      });
    },
    onSuccess: () => {
      toast.success("Profile updated.");

      queryClient.invalidateQueries(["myProfile"]);
      setEditField(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    },
  });

  const handleProfileSubmit = (data) => {
    if (!hasChanges) {
      setEditField(null);
      return;
    }
    saveProfile(data);
  };

  /* ------------------ AVATAR ------------------ */
  const { mutate: changeAvatar, isPending: isAvatarUpdating } = useMutation({
    mutationFn: async (file) => {
      const token = await getToken();
      return updateMyAvatar({ token, file });
    },
    onSuccess: () => {
      toast.success("Avatar updated.");
      queryClient.invalidateQueries(["myProfile"]);
    },
    onError: () => {
      toast.error("Failed to update avatar");
    },
  });

  /* ------------------ PASSWORD ------------------ */
  const { mutate: changePassword, isPending: isPasswordUpdating } = useMutation(
    {
      mutationFn: async ({ newPassword }) => {
        const token = await getToken();
        return updateMyPassword({ token, newPassword });
      },
      onSuccess: (res) => {
        toast.success(res?.message || "Password updated successfully", {
          toastId: "password-update-success",
        });
        setIsPasswordModalOpen(false);
        // clear form fields
        reset({
          newPassword: "",
          confirmNewPassword: "",
        });
        // optional: refresh user profile
        queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      },
      onError: (err) => {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to update password",
          { toastId: "password-update-error" }
        );
      },
    }
  );

  const onPasswordSubmit = (data) => {
    changePassword({ newPassword: data.newPassword });
  };

  /* ------------------ UI ------------------ */

  return (
    <div className="w-full h-full relative">
      {isProfileLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-20">
          <Spinner className="size-10" />
        </div>
      )}

      <form
        onSubmit={handleSubmit(handleProfileSubmit)}
        className="p-6 flex flex-col gap-6"
      >
        {/* Avatar */}
        <div className="self-center">
          {isAvatarUpdating ? (
            <Skeleton className="relative w-20 h-20 rounded-full bg-gray-900" />
          ) : (
            <ProfilePhotoUpload
              src={user?.profileImageUrl}
              alt="Avatar"
              onEdit={(file) => changeAvatar(file)}
              isUploading={false}
              name={user?.firstName}
            />
          )}
        </div>

        {/* Name */}
        <div className="flex justify-between">
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm text-muted-foreground">Name</label>

            {editField === "name" ? (
              <div className="flex gap-2">
                <Input
                  {...register("firstName", {
                    required: "First name required",
                  })}
                  placeholder="First name"
                  disabled={isSavingProfile}
                />
                <Input
                  {...register("lastName", { required: "Last name required" })}
                  placeholder="Last name"
                  disabled={isSavingProfile}
                />
              </div>
            ) : (
              <p className="font-medium">
                {user?.firstName} {user?.lastName}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() =>
              editField === "name" ? setEditField(null) : setEditField("name")
            }
            disabled={isSavingProfile}
          >
            {editField === "name" ? <X /> : <Pencil />}
          </Button>
        </div>

        {/* Email */}
        <div>
          <label className="text-sm text-muted-foreground">Email</label>
          <p className="font-medium">{user?.email}</p>
        </div>

        {/* Password */}
        <div className="flex justify-between items-center">
          <div>
            <label className="text-sm text-muted-foreground">Password</label>
            <p className="font-medium">********</p>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            Change
          </Button>
        </div>

        {editField && (
          <Button
            type="submit"
            className="mt-8 w-full"
            disabled={!hasChanges || isSavingProfile}
          >
            {isSavingProfile ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        )}
      </form>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <ChangePasswordModal
          register={register}
          errors={errors}
          newPassword={watch("newPassword")}
          onSubmit={handleSubmit(onPasswordSubmit)}
          onClose={() => setIsPasswordModalOpen(false)}
          isUpdating={isPasswordUpdating}
        />
      )}
    </div>
  );
}
