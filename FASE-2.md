# Fase 2: entendimento de requisitos e prototipagem

## Objetivo

Definir uma primeira experiência para um hub digital de manutenção e histórico veicular. O produto deve ajudar o motorista a reunir revisões, trocas de peças, despesas e lembretes de documentos em um prontuário consultável, inclusive como apoio à revenda.

## Base da análise

O material recebido contém a descrição da proposta, mas não inclui resultados de entrevistas, questionários ou análise de comportamento. Portanto, este documento não atribui conclusões a uma pesquisa inexistente. Necessidades, perfil e critérios são hipóteses de produto a validar com motoristas.

### Problema considerado

Registros de manutenção e datas de documentos podem ficar espalhados por notas fiscais, conversas e lembranças. Isso dificulta saber o que já foi feito, estimar gastos e demonstrar o cuidado do veículo a um comprador.

### Público inicial hipotético

Motoristas particulares que cuidam do próprio veículo, mas não necessariamente dominam termos mecânicos, e desejam consultar rapidamente o histórico e os próximos compromissos.

### Necessidades a validar

- Centralizar manutenções, peças, datas, quilometragem, oficinas e comprovantes.
- Lembrar o motorista de revisões e vencimentos de documentos.
- Acompanhar despesas sem planilhas externas.
- Apresentar um histórico organizado quando for vender o veículo.
- Entender o que precisa de atenção sem depender de conhecimento técnico.

## Requisitos do sistema

### Funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | Cadastrar e atualizar dados do veículo, incluindo marca, modelo, ano, placa e quilometragem. | Essencial |
| RF02 | Registrar serviço ou troca de peça com tipo de manutenção, data, quilometragem, oficina, valor e descrição. | Essencial |
| RF03 | Consultar o histórico de serviços por veículo, ordenado por data. | Essencial |
| RF04 | Configurar lembretes de manutenção por data e/ou quilometragem. | Essencial |
| RF05 | Registrar datas de IPVA e licenciamento considerando estado e ano de referência. | Essencial |
| RF06 | Anexar e consultar comprovantes associados a um registro. | Importante |
| RF07 | Exibir resumo de serviços e despesas registrados. | Importante |
| RF08 | Gerar uma apresentação ou exportação do prontuário para apoiar a revenda. | Futuro |
| RF09 | Manter um perfil do motorista e sua oficina preferida associados ao veículo. | Importante |

### Não funcionais

| ID | Requisito |
|---|---|
| RNF01 | Interface responsiva, utilizável em celular e computador. |
| RNF02 | Formulários com rótulos visíveis, validação compreensível e navegação por teclado. |
| RNF03 | Dados pessoais, placa e comprovantes devem ter acesso protegido. |
| RNF04 | Usar português do Brasil e formatos locais de data, quilometragem e moeda. |
| RNF05 | Distinguir lembretes cadastrados de informações oficiais. Datas legais devem ser contextualizadas por estado e ano, com indicação de fonte e data de atualização quando houver consulta a dados externos. |
| RNF06 | Permitir corrigir e excluir registros e deixar claras as consequências dessas ações. |

### Regras e dados que precisam de decisão

- A quilometragem não deve diminuir sem confirmação, pois pode indicar erro de digitação ou troca de painel.
- O calendário de IPVA/licenciamento varia por estado, exercício e regra aplicável. Um lembrete manual não deve ser apresentado como consulta oficial.
- Valores e datas devem ser registrados sem serem presumidos quando não informados.
- A proposta de “valorização na revenda” deve ser comunicada como apoio à organização e comprovação do histórico, não como promessa de aumento de preço.

## Fluxo prioritário

1. Cadastrar veículo e informar quilometragem.
2. Abrir a visão geral e identificar histórico e próximos cuidados.
3. Registrar uma manutenção concluída.
4. Criar lembretes de revisão e documentos.
5. Consultar ou compartilhar o prontuário organizado.

## Protótipo de baixa fidelidade

O wireframe está disponível na opção **Wireframe** do protótipo [index.html](./index.html). Ele organiza a tela principal nesta ordem:

1. Navegação principal, perfil e notificações.
2. Saudação e ação primária para registrar manutenção.
3. Identificação do veículo, quilometragem e próxima revisão.
4. Histórico recente ao lado do alerta de documento e do estado do prontuário.
5. Resumo de manutenção e próximo cuidado.

O objetivo é testar se a ação prioritária está evidente e se a informação do veículo e as pendências são encontradas sem percorrer um histórico extenso.

## Protótipo de alta fidelidade

O protótipo navegável também está em [index.html](./index.html), sem dependências externas. A opção **Visão geral** mostra a interface visual; os controles de navegação alternam para o wireframe e os requisitos. O histórico apresenta seis serviços ilustrativos com datas e quilometragens distribuídas pelos últimos 12 meses, e calcula a quantidade e os valores do período; novos registros da sessão atualizam esse resumo. O botão **Editar veículo** permite atualizar marca, modelo, versão, ano, combustível, placa, quilometragem atual e quilometragem da última revisão, guardando os dados no navegador. Ao registrar uma revisão periódica, a quilometragem atual é atualizada e a próxima revisão é estimada para 10.000 km depois; essa estimativa deve ser conferida no manual do fabricante. O formulário de manutenção exige uma categoria, uma descrição, data e quilometragem e insere o registro no histórico local da sessão. O perfil demonstrativo aceita nome e e-mail, e a preferência da oficina pode ser selecionada da lista ou informada pelo usuário.

### Decisões de interface

- Painel inicial centrado em um veículo e nas próximas ações.
- Histórico recente em primeiro plano, com data, serviço, quilometragem, oficina, status e valor.
- Dados do veículo editáveis, sem apagar o perfil ou a oficina preferida salvos no mesmo navegador.
- Categoria de manutenção visível no histórico e descrição livre para detalhar o serviço.
- Alerta documental contextual, sem simular integração com Detran ou dados oficiais.
- Ação de registro disponível diretamente na visão geral.
- Perfil local sem senha e seleção de oficina preferida, reutilizada como sugestão no registro de manutenção.
- Layout adaptado a telas estreitas e controles com foco visível.

### Limites do protótipo

Os dados da tela são demonstrativos, incluindo veículo, pessoa, histórico, valores e datas. O perfil e a oficina preferida ficam no armazenamento local do navegador; isso não cria uma conta autenticada nem sincroniza informações entre dispositivos. Os registros de manutenção ainda existem apenas na sessão da página. O alerta orienta a consultar o calendário oficial e não representa uma consulta ao Detran. Não há upload de comprovantes, integração com calendário oficial, notificações reais ou exportação de prontuário.

## Critérios de aceite para validação

- Um motorista consegue apontar a ação principal da tela sem orientação.
- A pessoa consegue explicar o vencimento e a ação sugerida para cada alerta.
- Um serviço válido pode ser adicionado e aparece no topo do histórico.
- Campos obrigatórios inválidos mostram mensagens junto ao campo e recebem foco.
- As telas permanecem utilizáveis em celular, teclado e leitor de tela.
- Em teste com usuários, confirmar se “quilometragem”, “próximo cuidado” e categorias de serviço são compreendidos sem explicação.

## Próxima etapa recomendada

Validar o wireframe e o protótipo com motoristas e oficinas, priorizando cadastro de veículo, registro de manutenção e entendimento dos alertas. Em seguida, revisar o escopo com os resultados reais e especificar persistência, privacidade, regras por estado e origem dos dados oficiais.
