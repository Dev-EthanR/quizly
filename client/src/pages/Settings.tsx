import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileInput } from "shared";
import Navbar from "../components/layout/Navbar";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import ErrorRetry from "../components/ui/ErrorRetry";
import ProfileAvatarField from "../components/settings/ProfileAvatarField";
import GoogleConnectionCard from "../components/settings/GoogleConnectionCard";
import { useProfile } from "../hooks/useProfile";
import { useUpdateProfileMutation } from "../hooks/useUpdateProfileMutation";
import { getInitials } from "../lib/initials";
import { AVATAR_COLORS } from "../lib/avatarColors";

function Settings() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const updateProfileMutation = useUpdateProfileMutation();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: profile
      ? {
          name: profile.name ?? "",
          email: profile.email,
          avatarColor: profile.avatarColor as UpdateProfileInput["avatarColor"],
          image: profile.image,
        }
      : undefined,
  });

  const name = useWatch({ control, name: "name" });
  const image = useWatch({ control, name: "image" });
  const avatarColor = useWatch({ control, name: "avatarColor" });

  const onSubmit = (values: UpdateProfileInput) => {
    updateProfileMutation.mutate(values);
  };

  return (
    <div className="page-shell">
      <Navbar />

      <div className="page-container max-w-2xl">
        <h1 className="heading text-3xl">Settings</h1>

        <div className="mt-8">
          {isLoading && (
            <div className="flex justify-center py-24">
              <p className="text-muted">Loading your profile...</p>
            </div>
          )}

          {!isLoading && isError && (
            <ErrorRetry
              message="Couldn't load your profile."
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !isError && profile && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-8"
            >
              <div className="card flex flex-col gap-4 p-6">
                <h2 className="section-title">
                  Profile
                </h2>

                <ProfileAvatarField
                  image={image ?? null}
                  avatarColor={avatarColor ?? AVATAR_COLORS[0].id}
                  initials={getInitials(name || profile.email)}
                  onImageChange={(value) =>
                    setValue("image", value, { shouldDirty: true })
                  }
                  onColorChange={(value) =>
                    setValue(
                      "avatarColor",
                      value as UpdateProfileInput["avatarColor"],
                      { shouldDirty: true },
                    )
                  }
                />

                <Input
                  label="Display name"
                  placeholder="NovaFox"
                  maxLength={20}
                  error={errors.name?.message}
                  {...register("name")}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>

              <div className="card flex flex-col gap-4 p-6">
                <h2 className="section-title">
                  Connected accounts
                </h2>
                <GoogleConnectionCard
                  connected={profile.providers.includes("google")}
                />
              </div>

              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  disabled={!isDirty || updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending
                    ? "Saving..."
                    : "Save changes"}
                </Button>

                {updateProfileMutation.isSuccess && (
                  <span className="text-sm font-medium text-secondary">
                    Saved
                  </span>
                )}

                {updateProfileMutation.isError && (
                  <span className="text-sm text-danger">
                    {updateProfileMutation.error instanceof Error
                      ? updateProfileMutation.error.message
                      : "Couldn't save your changes."}
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
