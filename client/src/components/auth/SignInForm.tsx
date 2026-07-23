import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInInput } from "shared";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useAuth } from "../../context/useAuth";

interface SignInFormProps {
  callbackUrl: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

function SignInForm({ callbackUrl, onSuccess, onError }: SignInFormProps) {
  const { signInWithCredentials } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInInput) => {
    try {
      await signInWithCredentials(values, callbackUrl);
      onSuccess();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Unable to sign in");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Password"
        type="password"
        placeholder="********"
        error={errors.password?.message}
        {...register("password")}
      />
      <Button type="submit" variant="secondary" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

export default SignInForm;
