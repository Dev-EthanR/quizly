import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "shared";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useAuth } from "../../context/useAuth";

interface SignUpFormProps {
  callbackUrl: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

function SignUpForm({ callbackUrl, onSuccess, onError }: SignUpFormProps) {
  const { register: registerUser, signInWithCredentials } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: RegisterInput) => {
    try {
      await registerUser(values);
      await signInWithCredentials(
        { email: values.email, password: values.password },
        callbackUrl,
      );
      onSuccess();
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Unable to create account",
      );
    }
  };

  return (
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
        {...register("name")}
      />
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
        {isSubmitting ? "Creating account..." : "Sign up"}
      </Button>
    </form>
  );
}

export default SignUpForm;
