import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { joinRoomSchema } from "shared";
import type { z } from "zod";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import AvatarColorField from "../components/ui/AvatarColorField";
import { getRandomUsername } from "../lib/usernames";
import { getInitials } from "../lib/initials";
import { AVATAR_COLORS } from "../lib/avatarColors";
import { createSessionToken } from "../lib/session";

const homeJoinFormSchema = joinRoomSchema.omit({ token: true });

type HomeJoinFormValues = z.infer<typeof homeJoinFormSchema>;

function Home() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<HomeJoinFormValues>({
    resolver: zodResolver(homeJoinFormSchema),
    defaultValues: { name: "", color: AVATAR_COLORS[0].id, roomCode: "" },
  });

  const name = useWatch({ control, name: "name" });

  const onSubmit = (values: HomeJoinFormValues) => {
    const resolvedName = values.name || getRandomUsername();
    navigate(`/lobby/${values.roomCode}`, {
      state: {
        name: resolvedName,
        color: values.color,
        token: createSessionToken(),
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-4xl font-bold text-foreground">
        Quiz<span className="text-primary">zly</span>
      </h1>

      <div className="flex w-fit max-w-full flex-col gap-4 rounded-xl border border-border bg-surface p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Join a game</h2>
          <p className="mt-1 text-muted">Enter a room code to join a game</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <Input
            label="Username"
            placeholder="NovaFox"
            maxLength={20}
            error={errors.name?.message}
            className=" caret-primary"
            {...register("name")}
          />

          <Input
            label="Room code"
            placeholder="X9L2P3"
            maxLength={6}
            autoFocus
            className="border-2 py-4 text-center text-3xl font-semibold uppercase tracking-[0.3em] caret-primary"
            error={errors.roomCode?.message}
            {...register("roomCode")}
          />

          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <AvatarColorField
                value={field.value ?? AVATAR_COLORS[0].id}
                onChange={field.onChange}
                initials={getInitials(name)}
              />
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            Join Game
          </Button>
        </form>

        <p className="text-center text-muted">
          Want run the show?{" "}
          <Link
            to="/host"
            className="text-primary font-semibold hover:underline"
          >
            Host your own game
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Home;
