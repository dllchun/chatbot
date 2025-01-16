import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8">
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-green-500 hover:bg-green-600 text-sm normal-case",
              footerActionLink: "text-green-500 hover:text-green-600",
            },
          }}
          redirectUrl={"/"}
          afterSignUpUrl={"/"}
        />
      </div>
    </div>
  );
} 