// Base do roteador (/admin/app na prévia, /admin depois do corte) e links que respeitam o corte página a página.
import * as React from "react";
import { Link } from "react-router-dom";
import { resolverHref } from "@/rotas";

export const BaseContext = React.createContext("/admin");
export const useBase = () => React.useContext(BaseContext);

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

/**
 * Link para uma página da área restrita (sempre escrito como /admin/<caminho>): navega sem recarregar quando a
 * página já é em React na base atual; senão, abre a página de HTML. Aceita asChild dos componentes do DS.
 */
export const LinkDaArea = React.forwardRef<HTMLAnchorElement, Props>(function LinkDaArea({ href, ...props }, ref) {
  const d = resolverHref(href, useBase());
  return d.interno ? <Link ref={ref} to={d.href} {...props} /> : <a ref={ref} href={d.href} {...props} />;
});
