-- Análise da rede por IA roda sozinha a cada novo cadastro: o gatilho chama a função insights-parceiros
-- ({ acao: "novo_cadastro", id }), que gera a análise da base em segundo plano. A função só aceita um cadastro
-- criado há menos de 10 minutos; as demais chamadas continuam exigindo a conta de administradora.
create or replace function public.analise_rede_novo_cadastro()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform net.http_post(
    url := 'https://lipfvnerohkaajegqvwr.supabase.co/functions/v1/insights-parceiros',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('acao', 'novo_cadastro', 'id', new.id)
  );
  return new;
end;
$$;
drop trigger if exists cadastros_analise_rede on public.cadastros;
create trigger cadastros_analise_rede after insert on public.cadastros
  for each row execute function public.analise_rede_novo_cadastro();
