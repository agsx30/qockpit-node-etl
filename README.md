# QOCKPIT ETL 

Deve ser baixado o arquivo QPN.EXE (Executável para Windows).

## Configurações

Deve ser criado um arquivo ".env", e configurado os parâmetros conforme arquivo de exemplo .env.example.

    DOMAIN: Será preenchido com o domínio do cliente ({domain}.qockpit.io), sem o qockpit.io.
    API_TOKEN: Token de integração obtido no ambiente do cliente (integração)

    HOST: IP do Servidor
    PORT: Porta
    USER: Usuário
    PASSWORD: Senha
    DATABASE: Base de dados

## Testar conexão

Deve ser executado da forma abaixo:

    qpn -t

## Realizar Integração

Deve ser executado o qpn.exe.

Opcionalmente, pode-se passar como parâmetro, o mês de referência, conforme exemplo abaixo:

    qpn -r=2020-01


