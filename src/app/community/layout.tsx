import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Browse public AI debates: Pro vs Contra on topics people chose to share.",
};

export default function CommunityLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
