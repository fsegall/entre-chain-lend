# Documentação do Fluxo n8n para Análise de Crédito Automatizada

## Introdução

Este documento apresenta a implementação de um fluxo de trabalho no n8n para análise de crédito automatizada, conforme solicitado para o projeto Hackathon. O fluxo foi desenvolvido seguindo as diretrizes do repositório GitHub "the_lenders" e tem como objetivo principal calcular e entregar um score de crédito do usuário para a aplicação Lovable, utilizando webhooks de entrada e saída para integração.

O módulo de análise de crédito automatizada representa um componente crucial do sistema, responsável por determinar a elegibilidade de usuários para empréstimos com base em diversos fatores. A implementação via n8n permite uma orquestração eficiente dos dados e processos, além de facilitar a integração com outros componentes do sistema, como o Supabase para armazenamento de dados e o módulo zk-credit para geração de provas de zero-knowledge.

## Arquitetura do Fluxo

O fluxo n8n implementado segue uma arquitetura modular e sequencial, composta por seis nós principais que trabalham em conjunto para processar a solicitação de análise de crédito, calcular o score e retornar o resultado para os sistemas integrados. A seguir, detalhamos cada componente do fluxo:

### Webhook de Entrada

O fluxo inicia com um webhook HTTP que recebe solicitações de análise de crédito. Este webhook serve como ponto de entrada para o fluxo e espera receber um payload JSON contendo o ID do usuário a ser analisado. O webhook é configurado para responder com o resultado do último nó do fluxo, garantindo que o cliente receba o resultado completo da análise.

O endpoint do webhook é configurado como `/credit-analysis` e aceita solicitações POST com o seguinte formato de payload:

```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

### Consulta ao Supabase

Após receber o ID do usuário, o fluxo consulta o Supabase para obter os dados necessários para a análise de crédito. A consulta é realizada através de uma requisição HTTP GET para a API REST do Supabase, utilizando autenticação via API Key. Os dados do usuário são recuperados da tabela `profiles` utilizando o ID recebido no webhook de entrada.

A consulta ao Supabase é configurada para selecionar todos os campos do perfil do usuário, que serão utilizados posteriormente para o cálculo do score de crédito. A autenticação é realizada utilizando variáveis de ambiente para armazenar as credenciais de forma segura.

### Cálculo do Score

O terceiro nó do fluxo é responsável pelo cálculo do score de crédito com base nos dados do usuário obtidos do Supabase. Este nó utiliza um script JavaScript para implementar o algoritmo de cálculo, que considera diversos fatores como renda, tempo de emprego, propriedades e histórico de pagamentos.

O algoritmo de cálculo implementado é um exemplo simplificado que pode ser adaptado conforme as necessidades específicas do projeto. O score base é definido como 500 e é ajustado positiva ou negativamente com base nos fatores analisados. O resultado final é garantido estar dentro dos limites de 300 a 850, seguindo padrões comuns de pontuação de crédito.

Além do score, o nó também define um threshold (limite mínimo) de 650 para aprovação e determina se o usuário passou ou não nesse threshold. O resultado é retornado como um objeto JSON contendo o score, o threshold e o status de aprovação.

### Formatação da Resposta

O quarto nó do fluxo é responsável por formatar a resposta para os diferentes sistemas que consumirão o resultado da análise. Este nó recebe o resultado do cálculo do score e o formata em dois formatos distintos:

1. **Formato para o webhook de saída**: Um objeto JSON contendo o score, o threshold e o status de aprovação, que será enviado para o Lovable.

2. **Formato para o zk-credit**: Um objeto JSON contendo o score e o threshold como strings, que será utilizado como entrada para o módulo de geração de provas de zero-knowledge.

Esta separação de formatos garante que cada sistema receba os dados no formato esperado, facilitando a integração e reduzindo a necessidade de transformações adicionais.

### Webhook de Saída

O quinto nó do fluxo é responsável por enviar o resultado da análise para o Lovable através de um webhook HTTP. Este nó realiza uma requisição HTTP POST para a URL configurada na variável de ambiente `LOVABLE_WEBHOOK_URL`, enviando o resultado da análise no formato JSON.

O payload enviado para o Lovable segue o formato:

```json
{
  "score": 720,
  "threshold": 650,
  "passed": true
}
```

### Webhook para ZK-Credit

O sexto e último nó do fluxo é responsável por enviar os dados necessários para o módulo zk-credit, que gerará a prova de zero-knowledge. Este nó realiza uma requisição HTTP POST para a URL configurada na variável de ambiente `ZK_CREDIT_WEBHOOK_URL`, enviando os dados no formato esperado pelo módulo.

O payload enviado para o zk-credit segue o formato:

```json
{
  "score": "720",
  "threshold": "650"
}
```

## Configuração e Implantação

Para configurar e implantar o fluxo n8n de análise de crédito, siga as instruções abaixo:

### Pré-requisitos

- n8n instalado e configurado (via Docker ou CLI)
- Acesso ao Supabase com permissões para consultar a tabela `profiles`
- URLs de webhook configuradas para receber os resultados da análise

### Passos para Implantação

1. Inicie o n8n via Docker ou CLI:

```bash
docker run -it --rm \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

2. Acesse a interface web do n8n em `http://localhost:5678`

3. Importe o arquivo `calculate_credit_score.json` no editor visual do n8n:
   - Clique em "Workflows" no menu lateral
   - Clique em "Import from File"
   - Selecione o arquivo `calculate_credit_score.json`

4. Configure as variáveis de ambiente necessárias:
   - Clique em "Settings" no menu lateral
   - Selecione "Variables"
   - Adicione as seguintes variáveis:
     - `SUPABASE_URL`: URL base do seu projeto Supabase (ex: https://xyzproject.supabase.co)
     - `SUPABASE_API_KEY`: Chave de API do seu projeto Supabase
     - `LOVABLE_WEBHOOK_URL`: URL do webhook de saída para o Lovable
     - `ZK_CREDIT_WEBHOOK_URL`: URL do webhook para o módulo zk-credit

5. Ative o fluxo:
   - Volte para o editor do fluxo
   - Clique em "Activate" no canto superior direito

6. Teste o webhook de entrada:
   - Copie a URL do webhook de entrada exibida no nó "Webhook de Entrada"
   - Utilize o Postman ou outra ferramenta para enviar uma requisição POST com o payload de exemplo

### Exemplo de Teste via cURL

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"user_id": "123e4567-e89b-12d3-a456-426614174000"}' \
  http://localhost:5678/webhook/credit-analysis
```

## Considerações de Segurança

A implementação do fluxo de análise de crédito segue as diretrizes de privacidade e segurança especificadas na documentação original:

1. O score de crédito é tratado como uma variável temporária e nunca é salvo em campos públicos.
2. As credenciais de acesso ao Supabase são armazenadas como variáveis de ambiente, não diretamente no código.
3. A única saída pública é o status de aprovação (`passed`), que será utilizado na prova ZK.
4. O fluxo implementa validação de dados e tratamento de erros para garantir robustez.

## Personalização e Extensão

O fluxo implementado pode ser personalizado e estendido de diversas formas para atender às necessidades específicas do projeto:

1. **Algoritmo de Cálculo**: O algoritmo de cálculo do score pode ser ajustado para considerar diferentes fatores ou pesos.
2. **Integração com APIs Externas**: O fluxo pode ser estendido para consultar APIs externas de bureaus de crédito.
3. **Armazenamento de Resultados**: Pode-se adicionar um nó para armazenar os resultados da análise no Supabase para fins de auditoria.
4. **Notificações**: O fluxo pode ser estendido para enviar notificações por e-mail ou outros canais.

## Conclusão

O fluxo n8n implementado para análise de crédito automatizada atende aos requisitos especificados na documentação original e oferece uma solução robusta e flexível para o cálculo e entrega do score de crédito. A arquitetura modular facilita a manutenção e extensão do fluxo, enquanto as considerações de segurança garantem a proteção dos dados sensíveis dos usuários.

A integração com o Lovable e o módulo zk-credit é realizada através de webhooks, permitindo uma comunicação eficiente entre os diferentes componentes do sistema. A configuração via variáveis de ambiente facilita a implantação em diferentes ambientes sem a necessidade de alterações no código.

Este fluxo representa um componente crucial do sistema entre-chain-lend, permitindo a automação do processo de análise de crédito e contribuindo para a experiência geral do usuário na plataforma.
