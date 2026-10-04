# Liga UNI

Sistema web (pt-BR) para gerir entidades acadêmicas, o calendário de eventos e as reservas de salas
do Ágora. Construído com React + Vite + TypeScript + Tailwind, usando Enter Cloud (Postgres,
autenticação e políticas de acesso) como backend.

## Perfis e acesso

- **Líder (`lider`)** — entra com e-mail e senha, escolhe a entidade no cadastro e acessa `/lider/*`.
- **Administrador (`admin`)** — acessa `/admin/*` com a visão completa do campus.

Os papéis ficam na tabela `user_roles` (nunca no perfil). Todo cadastro novo entra automaticamente
como `lider` da entidade selecionada — o vínculo é criado por um gatilho no momento do cadastro.

## Como promover um usuário a administrador

### Opção 1 — pela interface (recomendado)

1. Entre com uma conta que já seja administradora.
2. Vá em **Entidades e membros → aba Usuários**.
3. Ative a chave **Admin** ao lado da pessoa desejada.

### Opção 2 — primeiro administrador (quando ainda não existe nenhum)

1. Crie uma conta normalmente em `/cadastro`.
2. No SQL editor do Enter Cloud, execute (trocando pelo e-mail usado no cadastro):

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'seu-email@exemplo.br'
on conflict (user_id, role) do nothing;
```

3. Saia e entre novamente: o login redireciona para `/admin`.

Para remover o acesso de administrador, exclua a linha correspondente em `user_roles`
(`delete from public.user_roles where user_id = '<uuid>' and role = 'admin';`). A própria interface
bloqueia o rebaixamento da sua própria conta.

## Modelo de dados

| Tabela | Descrição |
| --- | --- |
| `entidades` | Nome, descrição e cor (hex) usada no calendário. |
| `liga_profiles` | Perfil do usuário (nome e e-mail), criado no cadastro. |
| `user_roles` | Papéis `lider` e `admin`, sempre fora do perfil. |
| `lideres_entidades` | Vínculo entre usuário e entidade gerida. |
| `equipes` / `membros` | Times da entidade e membros com curso, universidade e função. |
| `eventos` | Calendário por entidade (nome, data, horários, local, descrição). |
| `salas` | Salas do Ágora: nome, capacidade, recursos e ativa/inativa. |
| `reservas` | Solicitações com status `pendente`, `aprovada` ou `recusada`. |

Todas as tabelas usam Row Level Security: o líder vê e edita apenas a própria entidade, o
administrador vê e edita tudo, e todos os usuários autenticados podem ler as salas.

### Regras garantidas pelo banco

- `hora_fim` precisa ser posterior a `hora_inicio` (reservas e eventos).
- Duas reservas **aprovadas** não podem se sobrepor na mesma sala, na mesma data — a tentativa é
  recusada pelo banco, mesmo fora da interface.
- O status `aprovada` só pode ser definido por administradores; líderes só editam solicitações
  ainda `pendentes`.

## Funcionalidades

**Líder** — minha entidade (descrição editável e indicadores), equipes e membros (CRUD com busca e
filtros por equipe, curso e universidade), calendário mensal/semanal com CRUD de eventos e reservas
de sala com status colorido e justificativa quando recusada.

**Administrador** — dashboard com totais, entidades e membros (CRUD de entidades, visão geral dos
membros e gestão de administradores), calendário consolidado com cor por entidade e multisseleção,
fila de reservas com aprovação/recusa justificada e alerta de conflito de horário, e gestão das
salas do Ágora.

## Scripts

```bash
pnpm dev      # ambiente de desenvolvimento
pnpm build    # build de produção
pnpm lint     # análise estática
pnpm check    # lint + verificação de tipos
```
