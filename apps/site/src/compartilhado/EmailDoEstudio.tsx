// O e-mail do estúdio fora da ofuscação de e-mails do Cloudflare (marcas email_off): sem elas, o Cloudflare troca o
// e-mail no HTML publicado e a página em React não hidrata. Usado na Política de Privacidade e na Rede de Parceiros.
import { EMAIL_DE_CONTATO } from "./marca";

export function EmailDoEstudio({ link = false }: { link?: boolean }) {
  const conteudo = link ? `<a href="mailto:${EMAIL_DE_CONTATO}">${EMAIL_DE_CONTATO}</a>` : EMAIL_DE_CONTATO;
  return <span dangerouslySetInnerHTML={{ __html: `<!--email_off-->${conteudo}<!--/email_off-->` }} />;
}
