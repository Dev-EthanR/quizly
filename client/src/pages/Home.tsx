import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import {
  joinRoomSchema,
  type JoinRoomFormValues,
} from "../lib/schemas/joinRoom";

function Home() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JoinRoomFormValues>({
    resolver: zodResolver(joinRoomSchema),
  });

  const onSubmit = (values: JoinRoomFormValues) => {
    navigate(`/lobby/${values.roomCode}`, { state: { name: values.name } });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-4xl font-bold text-foreground">
        Quiz<span className="text-primary">zly</span>
      </h1>

      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-surface p-6">
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
            placeholder="Foxy"
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
