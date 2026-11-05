# mecanica-historico-veicular

Equipe: ***

Protótipo estático Garagem, em português do Brasil, para visualizar o painel de um veículo, consultar o wireframe e ler os requisitos iniciais do produto.

## Acessar o site

O endereço temporário do GitHub Pages é:

**https://patryckgtoliveira-cpu.github.io/mecanica-historico-veicular/**

Para publicar sem Actions ou arquivos em `.github/workflows`, habilite o Pages uma vez em [Settings → Pages](https://github.com/patryckgtoliveira-cpu/mecanica-historico-veicular/settings/pages): em **Build and deployment**, selecione **Deploy from a branch**, escolha a branch `main` e a pasta `/(root)`, e clique em **Save**. O GitHub publicará o `index.html` e atualizará o site a partir da branch. O link acima só abrirá o site depois que essa configuração for salva.

O código-fonte continua disponível no [repositório GitHub](https://github.com/patryckgtoliveira-cpu/mecanica-historico-veicular).

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

## Veículo e registro de manutenção

O botão **Editar veículo** permite atualizar marca, modelo, versão, ano, combustível, placa, quilometragem atual e quilometragem da última revisão. Ao registrar uma revisão periódica no histórico, o painel atualiza a quilometragem do veículo e calcula a próxima revisão para 10.000 km depois; as quilometragens também podem ser corrigidas manualmente. A estimativa aparece no painel e no próximo cuidado, com indicação de atraso se a quilometragem ultrapassar o prazo. O intervalo é demonstrativo: consulte o manual do fabricante. O painel busca pela internet uma foto de referência com licença aberta no Wikimedia Commons e mostra o crédito e a licença junto à imagem; o ano e a versão da foto podem ser diferentes dos dados cadastrados. Se não encontrar uma foto adequada ou não houver conexão, exibe a ilustração local como alternativa. A lista de sugestões no campo Modelo ajuda no preenchimento, e a marca é sugerida automaticamente para os modelos reconhecidos. O formulário de manutenção exige o tipo realizado (por exemplo, revisão, óleo e filtros, freios, pneus, bateria, suspensão, motor ou transmissão), um detalhe do serviço, data e quilometragem. O valor e a oficina são opcionais; campos inválidos exibem mensagens junto aos respectivos controles e recebem foco. Ao salvar, o tipo e o detalhe aparecem no início do histórico e a contagem é atualizada. O perfil demonstrativo aceita nome e e-mail, sem senha; também é possível selecionar uma oficina de exemplo ou informar outra. A oficina salva é sugerida no formulário de manutenção.

O perfil, a oficina preferida e os dados do veículo são guardados no armazenamento local do navegador e não são enviados a um servidor. Isso não cria uma conta autenticada nem sincroniza os dados entre dispositivos. Os registros de manutenção são mantidos apenas na página aberta: recarregar ou fechar o navegador os descarta. Veículo, histórico e valores apresentados inicialmente são demonstrativos, e os avisos de documentos não consultam calendários oficiais.

## Organização do código

O HTML mantém a marcação e o conteúdo das telas; CSS e JavaScript ficam em arquivos separados para que estilos e interações possam ser alterados sem misturar responsabilidades. No JavaScript, a navegação, validação, criação de itens do histórico, notificações e impressão foram divididas em funções dedicadas. O conteúdo fornecido pelo formulário é inserido como texto, sem interpretar entradas como HTML.

Para alterar o conteúdo de uma tela, edite `index.html`; para aparência e comportamento responsivo, edite `styles.css`; para interações e regras do formulário, edite `app.js`.
