import { clerkMiddleware } from "@clerk/nextjs/server";

// "proxy" é o novo nome do antigo "middleware" (renomeado no Next.js 16) —
// só disponibiliza a sessão do Clerk pra Server Components/Actions, não
// bloqueia nenhuma rota (o site continua público sem login).
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
