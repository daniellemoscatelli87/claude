// Classes compostas a partir dos componentes do Design System Dani Moscatelli (sem cores próprias).
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

/** Link de texto (Link do Next, <a> ou botão em linha): variante "link" do botão do DS, sem altura nem espaçamento de botão. */
export const classeLink = cn(buttonVariants({ variant: "link", size: null }), "inline h-auto p-0 align-baseline text-[length:inherit] whitespace-normal underline underline-offset-4");
