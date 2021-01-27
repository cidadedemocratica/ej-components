# Componentes de participação da EJ

Componentes de participação para permitir coleta de opinião via API da EJ.
A motivação desse projeto é permitir a participação de usuários sem a exigência
de ter que acessar a EJ diretamente. Vários clientes e parceiros possuem seus
próprios sites e sistemas, e forçar o usuário à acessar outro sistema (EJ) para
participar de uma coleta de opinião gera quebra de experiência e
reduz a conversão.

Esses componentes permitem que usuários participem
de conversas criadas na EJ, mas sem a quebra de experiência de ter que acessar
um segundo ambiente.

## Componentes

Existem dois componentes mantidos nesse repositório:

1. **conversations**: Componente principal de coleta. Irá permitir que o usuário
vote e adicione novos comentários. Para executar o componente, acesse `conversations/README.md`.
2. **opinion-button**: Componente que permite redirecionar o usuário para uma subrota do
site. Normalmente esse componente é utilizado para redirecionar o usuário para
a pagina em que o componente **conversations** foi incluído.

## Distribuição

Para o usuário final, o componente é distribuido via pacote npm, e pode ser
encontrado no seguinte registry:
https://www.npmjs.com/package/ej-conversations

Para utilizar o componente em um site qualquer, os seguintes passos são
necessários:

1. Inclusão do pacote npm do componente no header do site.

	`<script src='https://unpkg.com/ej-conversations@1.3.1/dist/conversations.js'></script>`

2. Inclusão do componente no body da pagina em que o usuário deseje fazer uso.

	`<ej-conversation host=https://www.ejplatform.org cid="54"></ej-conversation>`

## Processo de Coleta

Para participar de uma coleta, a EJ exige que o usuário esteja autenticado.
Na versão atual dos componentes (1.x.x), a autenticação é feita de duas formas:
1. Um cookie de sessão criado por alguma ferramenta de marketing segmentado. Atualmente suportamos apenas o cookie da ferramenta Mautic (mtc_id) e do Analytics (_ga).
2. Caso não exista um cookie de sessão,  a autenticação é feita via tela de registro, utilizando nome e email.

A partir do momento que o usuário se autentica, o componente irá se comunicar
com a API da EJ e viabilizar o processo de participação, que envolve:

1. Votar nos comentários aprovados da conversa;
2. Adicionar novos comentários para moderação;
3. Visualizar informações sobre os grupos de opinião;

## Planning and Roadmap

O planejamento das sprints e milestones está sendo feito no seguinte repositório:

https://github.com/cidadedemocratica/ej-server/projects/1
