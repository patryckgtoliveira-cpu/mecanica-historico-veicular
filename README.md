# mecanica-historico-veicular

Equipe: ***

Protótipo estático Garagem, em português do Brasil, para visualizar o painel de um veículo, consultar o wireframe e ler os requisitos iniciais do produto.

## Acessar o repositório

O projeto está disponível no [repositório GitHub](https://github.com/patryckgtoliveira-cpu/mecanica-historico-veicular). O GitHub não publica nem executa o `index.html` no domínio `github.com`; para abrir o protótipo, baixe ou clone o repositório e abra o arquivo localmente no navegador.

## Arquivos

- `index.html`: estrutura e conteúdo das telas, navegação e formulário.
- `styles.css`: identidade visual, responsividade, modo wireframe e estilos de impressão.
- `app.js`: navegação entre telas, notificações, impressão e registro/validação de manutenção.
- `FASE-2.md`: contexto, hipóteses, requisitos e critérios para validação do protótipo.

## Como executar

Abra `index.html` em um navegador moderno. O projeto não requer instalação de pacotes nem conexão com serviços externos.

Para imprimir uma tela específica, use:

- `index.html?print=wireframe` para o wireframe.
- `index.html?print=high-fidelity` para o painel de alta fidelidade.

## Registro de manutenção

O formulário exige serviço, data e quilometragem. O valor e a oficina são opcionais; campos inválidos exibem mensagens junto aos respectivos controles e recebem foco. Ao salvar, o registro é inserido no início do histórico e a contagem é atualizada.

Os registros são mantidos apenas na página aberta: recarregar ou fechar o navegador os descarta. Veículo, pessoa, histórico e valores apresentados são demonstrativos, e os avisos de documentos não consultam calendários oficiais.

## Organização do código

O HTML mantém a marcação e o conteúdo das telas; CSS e JavaScript ficam em arquivos separados para que estilos e interações possam ser alterados sem misturar responsabilidades. No JavaScript, a navegação, validação, criação de itens do histórico, notificações e impressão foram divididas em funções dedicadas. O conteúdo fornecido pelo formulário é inserido como texto, sem interpretar entradas como HTML.

Para alterar o conteúdo de uma tela, edite `index.html`; para aparência e comportamento responsivo, edite `styles.css`; para interações e regras do formulário, edite `app.js`.
