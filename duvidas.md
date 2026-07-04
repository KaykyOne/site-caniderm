# Duvidas e documentacao do site Caniderm

Este arquivo explica o site, o formulario, a integracao com Google Sheets, o deploy no GitHub Pages e o que enviar para outra IA quando precisar pedir alteracoes.

## Resumo do projeto

O projeto e uma landing page estatica de lancamento do Caniderm.

Objetivo principal:

- Apresentar o produto Caniderm.
- Mostrar beneficios e perguntas frequentes.
- Coletar leads para lista de lancamento.
- Enviar nome, WhatsApp e e-mail para uma planilha do Google Sheets.

Nao existe backend proprio. O site e apenas HTML, CSS e JavaScript. O armazenamento dos cadastros e feito por Google Apps Script conectado a uma planilha.

## Arquivos principais

- `index.html`: pagina principal usada em producao.
- `index1.html`: variante do site com funcionamento de formulario igual ao `index.html`.
- `index2.html`: outra versao antiga/alternativa do site.
- `site-config.js`: arquivo central com a URL do Google Apps Script usada pelos formularios.
- `google-apps-script.js`: codigo que deve ser colado no Google Apps Script.
- `.github/workflows/pages.yml`: workflow para publicar no GitHub Pages via GitHub Actions.
- `.nojekyll`: evita processamento Jekyll no GitHub Pages.
- `logo.png`, `logo-branca.png`, `hero-dog.jpg`, `icon-whatsapp.png`: imagens usadas no site.
- `branding.md` e `brandbook.html`: materiais de marca/apoio.

## Tamanhos das imagens no site

O site atual usa estas imagens e tamanhos aproximados por area:

- Hero principal: usa `logo.png` no topo e `hero-dog.jpg` no fundo. O logo fica bem com cerca de 264x264 px no desktop e 170x170 px no mobile. O fundo do hero deve ter pelo menos 1600x1200 px para manter qualidade em telas grandes.
- Rodape: usa `logo.png` com cerca de 150x150 px.
- WhatsApp flutuante: usa `icon-whatsapp.png` com cerca de 64x64 px no mobile e 78x78 px no desktop.
- Secao de beneficios: a primeira imagem aparece maior, em torno de 330x330 px no desktop e 260x260 px no mobile. As outras duas aparecem em torno de 220x220 px no desktop e 180x180 px no mobile.
- Secao "Por que Caniderm?": a foto lateral ocupa um bloco de banner e funciona melhor com imagens horizontais de pelo menos 1200x900 px.

Se alguma imagem vier por link externo, manter a mesma proporcao visual do bloco onde ela sera usada.

## Como o formulario funciona

O formulario fica perto do final da pagina, na secao `#cadastro`.

Campos coletados:

- `nome`
- `whatsapp`
- `email`

No arquivo `site-config.js`, existe esta configuracao:

```js
window.CANIDERM_CONFIG = {
  googleSheetsWebAppUrl: "https://script.google.com/macros/s/AKfycbwjdLZRuapxeBPFgzexGR8W8I3L80fyWaAcHzcWfOHpcibYUjzyw8pBa3OOCFmTP0uu/exec"
};
```

Quando o usuario envia o formulario, o site cria um `FormData` e manda um `POST` para essa URL do Google Apps Script:

```js
await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
  method: "POST",
  mode: "no-cors",
  body: formData
});
```

Tambem sao enviados estes campos extras:

- `origem`: `Caniderm landing page`
- `pagina`: URL da pagina onde o usuario enviou o formulario
- `data_envio`: data/hora em formato ISO

Depois do envio, o site mostra:

```txt
Cadastro enviado. Vamos avisar voce por e-mail e WhatsApp.
```

## Importante sobre `no-cors`

O site usa `mode: "no-cors"` porque o Google Apps Script costuma bloquear leitura direta da resposta por CORS quando chamado do navegador.

Consequencia:

- O navegador envia a requisicao.
- O Apps Script recebe e executa.
- Mas o JavaScript do site nao consegue ler o JSON de resposta.
- Por isso o front nao consegue confirmar 100% se gravou na planilha.

Para uma landing page simples, isso e aceitavel. Se precisar confirmacao real no front, o ideal e usar um backend pequeno, Netlify Forms, Formspree, Supabase ou outra solucao com CORS controlado.

## Google Apps Script

O arquivo `google-apps-script.js` deve ser colado no Google Apps Script.

Ele usa esta planilha:

```js
const SPREADSHEET_ID = "1JF8mjbEqrmt2xpO39yxppvMJLp6mBDqAxQDQNU9rX1w";
```

Esse ID veio da URL da planilha:

```txt
https://docs.google.com/spreadsheets/d/1JF8mjbEqrmt2xpO39yxppvMJLp6mBDqAxQDQNU9rX1w/edit?gid=0#gid=0
```

O Apps Script grava os dados na primeira aba da planilha:

```js
const sheet = spreadsheet.getSheets()[0];
```

Se a primeira aba estiver vazia, ele cria o cabecalho:

- Recebido em
- Nome
- WhatsApp
- Email
- Origem
- Pagina
- Data enviada pelo site

## Como publicar/atualizar o Apps Script

Sempre que alterar `google-apps-script.js`, precisa atualizar a implantacao:

1. Abrir o projeto no Google Apps Script.
2. Colar o codigo atualizado.
3. Clicar em salvar.
4. Ir em `Implantar > Gerenciar implantacoes`.
5. Editar a implantacao atual.
6. Em `Versao`, escolher `Nova versao`.
7. Clicar em `Implantar`.

Salvar o codigo sozinho nao atualiza automaticamente a URL `/exec`. Precisa publicar uma nova versao.

## Como testar o Apps Script sem usar o formulario

A URL do Apps Script aceita um teste direto com `?teste=1`.

Exemplo:

```txt
https://script.google.com/macros/s/AKfycbwjdLZRuapxeBPFgzexGR8W8I3L80fyWaAcHzcWfOHpcibYUjzyw8pBa3OOCFmTP0uu/exec?teste=1
```

Ao abrir isso no navegador, o Apps Script deve inserir uma linha de teste na primeira aba da planilha com:

```txt
Teste direto pela URL
```

Se isso funcionar, o Apps Script e a planilha estao corretos. Se o formulario nao funcionar depois disso, o problema esta no HTML/JavaScript ou na URL usada no site.

## Como verificar erro no Apps Script

No Google Apps Script:

1. Abrir o projeto.
2. Entrar em `Execucoes`.
3. Ver as chamadas `doPost` e `doGet`.
4. Se aparecer `Concluido`, a funcao terminou sem erro fatal.
5. Se aparecer `Falha`, clicar para ver a mensagem.

Observacao: `Concluido` nao garante que voce esta olhando a aba certa. O script atual grava na primeira aba da planilha.

## Como rodar localmente

Como o site e estatico, da para abrir `index.html` direto no navegador.

Tambem da para rodar com um servidor local simples, se preferir:

```bash
python -m http.server 8000
```

Depois abrir:

```txt
http://localhost:8000
```

O formulario funciona localmente tambem, desde que tenha internet e a URL do Apps Script esteja correta.

## Como publicar no GitHub Pages

O projeto tem um workflow em:

```txt
.github/workflows/pages.yml
```

Ele publica o site no GitHub Pages usando GitHub Actions.

Passos no GitHub:

1. Subir todos os arquivos para o repositorio.
2. Ir em `Settings > Pages`.
3. Em `Build and deployment`, selecionar `Source: GitHub Actions`.
4. Fazer push para o branch configurado no workflow.
5. A action `Deploy GitHub Pages` deve rodar automaticamente.

O workflow esta configurado para o branch `main`:

```yml
on:
  push:
    branches:
      - main
```

Se o repositorio usa `master`, trocar para:

```yml
on:
  push:
    branches:
      - master
```

## Erro `punycode` no deploy

Se aparecer algo assim:

```txt
(node:2125) [DEP0040] DeprecationWarning: The `punycode` module is deprecated.
```

Isso e apenas um aviso de dependencia Node usada por alguma action. Normalmente nao e a causa da falha.

O erro real costuma vir depois, por exemplo:

```txt
Error: Deployment failed, try again later.
```

Nesse caso, conferir:

- Se `Settings > Pages` esta em `GitHub Actions`.
- Se o branch do workflow bate com o branch do repositorio.
- Se existe outra action de Pages rodando ao mesmo tempo.
- Se o GitHub Pages esta habilitado no repositorio.
- Se os arquivos `.github/workflows/pages.yml` e `.nojekyll` foram commitados.

## O formulario continua funcionando no GitHub Pages?

Sim. O GitHub Pages so hospeda os arquivos estaticos. O cadastro vai direto do navegador para o Google Apps Script.

Para continuar funcionando:

- Nao mudar a URL `/exec` do Apps Script no HTML.
- Nao apagar a implantacao do Apps Script.
- Manter acesso do App da Web como publico/qualquer pessoa.
- Manter a planilha existente.
- Manter o `SPREADSHEET_ID` correto no Apps Script.

## O que enviar para uma IA entender este site

Use este prompt:

```txt
Estou trabalhando em uma landing page estatica chamada Caniderm.

Arquivos principais:
- index.html: pagina principal de producao.
- index1.html: variante que deve manter o mesmo funcionamento do formulario.
- site-config.js: arquivo central com a URL do Google Apps Script.
- google-apps-script.js: codigo do Google Apps Script que recebe os cadastros e grava no Google Sheets.
- .github/workflows/pages.yml: workflow de deploy para GitHub Pages.
- .nojekyll: arquivo para evitar processamento Jekyll no GitHub Pages.

O site e HTML/CSS/JS puro, sem backend proprio.

O formulario coleta:
- nome
- whatsapp
- email

No front, o formulario envia um POST com FormData para:
https://script.google.com/macros/s/AKfycbwjdLZRuapxeBPFgzexGR8W8I3L80fyWaAcHzcWfOHpcibYUjzyw8pBa3OOCFmTP0uu/exec

O fetch usa:
mode: "no-cors"

Por isso o navegador nao consegue ler o JSON de resposta. O site mostra mensagem de sucesso apos enviar, mas a confirmacao real deve ser feita olhando a planilha ou as execucoes do Apps Script.

O Apps Script usa a planilha:
1JF8mjbEqrmt2xpO39yxppvMJLp6mBDqAxQDQNU9rX1w

Ele grava os dados na primeira aba da planilha.

Antes de alterar o projeto, leia os arquivos index.html, index1.html, google-apps-script.js e .github/workflows/pages.yml. Preserve o layout existente e altere somente o necessario.
```

## Checklist antes de entregar para cliente

- Abrir o site publicado.
- Enviar um cadastro real de teste.
- Conferir se caiu na primeira aba da planilha.
- Testar o link do WhatsApp flutuante.
- Testar no celular.
- Conferir se as imagens carregam no GitHub Pages.
- Conferir se o Apps Script esta com a versao mais nova implantada.
- Remover linhas de teste da planilha antes de entregar.

## Possiveis melhorias futuras

- Adicionar texto de consentimento/LGPD perto do formulario.
- Adicionar campo oculto anti-spam/honeypot.
- Evitar cadastros duplicados por e-mail ou WhatsApp no Apps Script.
- Enviar notificacao por e-mail a cada novo lead.
- Migrar para Formspree, Netlify Forms ou Supabase se precisar painel, validacao mais forte ou confirmacao real no front.
