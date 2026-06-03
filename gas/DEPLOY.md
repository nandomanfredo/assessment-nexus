# Deploy do Backend GAS — Assessment Nexus

## Pré-requisitos
- Conta Google com acesso ao Google Apps Script
- Claude API key (Phase 2)

---

## Passo 1 — Criar o projeto GAS

1. Acesse [script.google.com](https://script.google.com)
2. Clique em **Novo projeto**
3. Renomeie para `Assessment Nexus Backend`
4. Substitua o conteúdo de `Code.gs` pelo arquivo `gas/Code.gs` deste repositório
5. Crie novos arquivos GAS e cole o conteúdo de cada `.gs`:
   - `Sheets.gs`
   - `Assessment.gs`
   - `IA.gs`
6. No menu lateral, clique em **Projeto > appsscript.json** (ative "Mostrar arquivo de manifesto" em configurações) e substitua pelo conteúdo de `gas/appsscript.json`

---

## Passo 2 — Configurar a planilha

1. No editor GAS, abra `Sheets.gs`
2. Execute a função `setupPlanilha` (menu Run > Run function > setupPlanilha)
3. Autorize as permissões solicitadas
4. Copie o **ID da planilha** exibido no Log

O ID também é salvo automaticamente nas propriedades do script (PropertiesService).

---

## Passo 3 — Configurar propriedades do script

Vá em **Projeto > Configurações** → aba **Propriedades do script** e adicione:

| Propriedade       | Valor                                      |
|-------------------|--------------------------------------------|
| `SPREADSHEET_ID`  | ID da planilha criada no passo anterior    |
| `CLAUDE_API_KEY`  | Sua chave da API Anthropic (Phase 2)       |

---

## Passo 4 — Deploy como Web App

1. Clique em **Implantar > Nova implantação**
2. Tipo: **Aplicativo da Web**
3. Configurações:
   - Executar como: **Eu (seu e-mail)**
   - Quem tem acesso: **Qualquer pessoa**
4. Clique em **Implantar**
5. Copie a **URL do webapp** gerada

---

## Passo 5 — Conectar ao frontend

Abra `app.js` e cole a URL na constante:

```javascript
const GAS_URL = 'https://script.google.com/macros/s/SEU_ID_AQUI/exec';
```

---

## Testando a API

```bash
# Verificar se o backend está no ar
curl "https://script.google.com/macros/s/SEU_ID/exec"

# Salvar um assessment de teste (PowerShell)
$body = '{"action":"salvarAssessment","empresa":"Empresa Teste","setor":"ecommerce","faturamento":"ate_300k","funcionarios":"ate_20","scores":{"N1":{"score":3,"na":false,"naMotivo":"","obs":""}}}'
Invoke-RestMethod -Uri "https://script.google.com/macros/s/SEU_ID/exec" -Method POST -Body $body -ContentType "text/plain"
```

---

## Estrutura da planilha gerada

**Aba "Assessments"** — uma linha por assessment salvo:

| ID | Data/Hora | Empresa | Responsável | Setor | Faturamento | Funcionários | IMD | Faixa | Score N | Score T | Score P | Score G | Score IA | Scores JSON | Resultados JSON |

**Aba "Config"** — metadados:

| Chave | Valor | Atualizado em |

---

## Atualizando o deploy

Após qualquer mudança nos arquivos `.gs`, faça um novo deploy:
**Implantar > Gerenciar implantações > Nova versão**

> ⚠️ A URL do webapp **muda** apenas se você criar uma nova implantação do zero.  
> Ao adicionar versões à implantação existente, a URL permanece a mesma.
