# Verificação realizada

Testes automatizados com WebKit 26.5 (motor do Safari), em tamanhos 375×667, 390×844, 768×1024, 1024×768 e 1440×1000. Não equivale a teste em um iPad/iPhone físico.

- 11 módulos sem transbordamento horizontal.
- Cadastro de lead, persistência após recarregar e conversão para outbound.
- Mudança de etapa e início de garantia.
- Edição de cliente, checklists e nova tarefa.
- Recebimento mensal sem duplicação na mesma competência.
- Receita/despesa e preservação do histórico ao perder ou excluir cliente.
- IDs duplicados e valores inválidos rejeitados na normalização de backup.
- Histórico IndexedDB, restauração e persistência da versão restaurada.
- Falha simulada de quota: a versão gravada permanece intacta e o app indica falha.
- Edição desatualizada em outra aba não sobrescreve a base mais recente no cenário testado.
- Backup JSON no formato original importado; persistência e exportação com os mesmos registros.
- Conteúdo HTML em notas exibido como texto, sem execução.
- Uso offline real: servidor de teste desligado após instalação do service worker; app reabriu, cadastrou um lead e preservou ambos os registros após nova recarga.
- Build estático e sintaxe JavaScript validados.

A simulação de rede offline do Playwright/WebKit apresentou erro interno do navegador. A validação offline foi então realizada desligando o servidor de teste, confirmando o comportamento real de fallback do cache.

As capturas em `portfolio/` usam somente dados fictícios. O app inicia com base vazia; a demonstração é ativada em Configurações e não altera os registros reais.

## NFC e navegação para iPad — 27/10/2026

- Navegação móvel e menu lateral visível em iPad nas duas orientações; botão Módulos em todas as larguras.
- Criação de clientes próprios de NFC e cadastro junto da primeira venda.
- Baixa automática de estoque, saídas manuais, saldo após recarregar e quantidade por cliente.
- Bloqueio de quantidades negativas, fracionárias, zero e acima do saldo.
- Custo total do lote, valor de venda, custo médio ponderado e arredondamento em centavos.
- Cancelamento restaura estoque e custo original e reverte a receita; repetição não duplica a devolução.
- Exclusão de cadastro mantém atribuição da venda no histórico e não altera saldo ou receita.
- Backup exportado e reimportado mantém movimentos e valores NFC; backups antigos continuam compatíveis.
- Histórico impossível, estorno duplicado e alterações inconsistentes de custo são recusados na importação.
- Testes automatizados em WebKit a 375×667, 390×844, 768×1024, 1024×768 e 1440×1000, incluindo as outras áreas do programa, sem transbordamento lateral.

- Identidade corporativa compartilhada, tabela de clientes NFC no desktop e linhas adaptadas ao toque no iPad e no celular.
