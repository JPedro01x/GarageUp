# Garagem do Condomínio

Aplicação web para controle de vagas de garagem de um condomínio.

- Backend: Java 17 + Spring Boot 3 (APIs REST)
- Frontend: HTML + Bootstrap 5 (responsivo), servido por `Spring` em `src/main/resources/static/`

## Funcionalidades
- Registrar entrada de veículo: nome do cliente, modelo, cor, placa.
- Registrar saída por placa (baixa automática na vaga).
- Painel mostra total de vagas, ocupadas, disponíveis e a lista de vagas livres.
- Tabela com veículos estacionados, com ação rápida de saída.
- Ajuste de capacidade total de vagas (admin) em tempo real.

## Como rodar
Pré-requisitos:
- Java 17 instalado
- Maven 3.9+

Passos:
1. No diretório do projeto, execute:
   ```bash
   mvn spring-boot:run
   ```
2. Acesse no navegador: http://localhost:8080

## Endpoints principais
- `GET /api/status` — Status do estacionamento (capacidade, ocupadas, disponíveis, vagas livres e ocupações)
- `POST /api/entrada` — Body JSON:
  ```json
  {"nomeCliente":"Fulano", "modelo":"Civic", "cor":"Preto", "placa":"ABC1234"}
  ```
- `POST /api/saida` — Body JSON:
  ```json
  {"placa":"ABC1234"}
  ```
- `PUT /api/config` — Body JSON:
  ```json
  {"capacidade": 25}
  ```

## Observações
- A persistência está em memória (Map), para fins de demo. Em produção, substituir por banco de dados.
- O frontend consome as APIs via `fetch` (arquivo `static/app.js`).
- O layout utiliza tema escuro, responsivo e botões/selos para melhor leitura.
