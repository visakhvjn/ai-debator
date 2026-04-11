import { RequireAuth } from "@/components/auth/RequireAuth";

export default function DebateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RequireAuth>{children}</RequireAuth>;
}
