import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.sessionKind === "platform") {
    redirect("/backoffice");
  }
  if (session?.sessionKind === "erp") {
    redirect("/app");
  }
  redirect("/login");
}
