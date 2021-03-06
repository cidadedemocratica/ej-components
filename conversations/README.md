# Componente de participação

*Web component* para permitir coleta de opinião via API da EJ.
A motivação desse projeto é permitir a participação de usuários sem a exigência
de ter que acessar a EJ diretamente. Vários clientes e parceiros possuem seus
próprios sites e sistemas, e forçar o usuário à acessar outro sistema para
participar de uma coleta de opinião gera quebra de experiência e
reduz a conversão.

![Exemplo](./example.png)

## Desenvolvimento

Antes de executar o componente, é preciso ter uma [instância local da EJ rodando](https://gitlab.com/pencillabs/ej/ej-server/-/blob/develop/README.rst). 
Depois de subir a EJ, é necessário criar uma nova conversa, e configurar o componente para
utiliza-la.
Para apontar o componente para essa instância, edite o arquivo `src/index.html`. Encontre
o componente `ej-conversation` dentro do arquivo, e altere a variável `host`, 
apontando para a instância local da EJ. 
Altere também a variável `cid`, para o ID de uma conversa que exista na instância local.

Todos os componentes são desenvolvidos utilizando o framework [stenciljs](https://stenciljs.com/).
Para subir o servidor de desenvolvimento, execute:

	sudo npm install @stencil/core@latest --save-exact -g
	cd conversations && npm start

Para executar os testes:

	cd conversations && npm test


Para publicar uma nova versão do componente, faça as alterações necessárias,
faça bump da versão do componente no `package.json` e utilize a task `publish` do
Makefile, presente na raiz do projeto do componente.

## Distribuição

Para o usuário final, o componente é distribuido via pacote npm, e pode ser
encontrado no seguinte registry:
https://www.npmjs.com/package/ej-conversations

Para utilizar o componente em um site qualquer, os seguintes passos são
necessários:

1. Publicação do componente via `make publish`;

2. Inclusão do pacote npm do componente no header do site;

	`<script src='https://unpkg.com/ej-conversations@1.3.1/dist/conversations.js'></script>`

3. Inclusão do componente no body da pagina em que o usuário deseje fazer uso;

	`<ej-conversation host=https://www.ejplatform.org cid="54"></ej-conversation>`

Essas instruções também podem ser encontradas na pagina `conversations/<conversation_id>/<conversation_slug>/integrations`.
Nessa pagina as instruções e versão dos pacotes estarão sempre atualizadas,
uma vez que puxamos diretamente do npm a ultima versão publicada do componente.


## Processo de Coleta

Para participar de uma coleta, a EJ exige que o usuário esteja autenticado.
Na versão atual dos componentes (1.x.x), a autenticação é feita de duas formas:
1. Um cookie de sessão criado por alguma ferramenta de marketing segmentado. Atualmente suportamos apenas o cookie da ferramenta Mautic (mtc_id).
2. Caso não exista um cookie de sessão,  a autenticação é feita via tela de registro, utilizando nome e email.

A partir do momento que o usuário se autentica, o componente irá se comunicar
com a API da EJ e viabilizar o processo de participação, que envolve:

1. Votar nos comentários aprovados da conversa;
2. Adicionar novos comentários para moderação;

## Planning and Roadmap

O planejamento das sprints e milestones está sendo feito no seguinte repositório:

https://github.com/cidadedemocratica/ej-server/
