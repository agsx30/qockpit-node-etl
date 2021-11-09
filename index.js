require('dotenv').config()
const axios = require('axios').default;   
const sql = require('mssql')

console.log('***** QOCKPIT | ETL *****')

console.log(process.argv);

// Verificação dos parâmetros de configuração.

if ( !process.env.URL ) {
    process.env.URL = 'https://www.qockpit.io/api';
}

if ( !process.env.DOMAIN ) {
    console.error('Dominio nao definido ({dominio}.qockpit.io): [DOMAIN]');
    return;
}

if ( !process.env.API_TOKEN ) {
    console.error('Token nao definido: [API_TOKEN]');
    return;
}

console.log('API:', process.env.URL);
console.log('DOMINIO:', process.env.DOMAIN + '.qockpit.io');

axios.defaults.baseURL = process.env.URL;
axios.defaults.headers.common['X-API-DOMAIN'] = process.env.DOMAIN;
axios.defaults.headers.common['X-API-TOKEN'] = process.env.API_TOKEN;

// Verificação do acesso a API da plataforma.

if ( process.argv.find(item => item == '-t') ) {

    axios.get("/test")
        .then(res => { 
            console.log(res.data);
        })
        .catch(err => {
            console.error(err.response.data);
        })
        .then(() => {
            // Validação do Token de Autenticação

            axios.get("/test/token")
                .then(res => {
                    console.log(res.data);
                })
                .catch(err => {
                    console.error(err.response.data);
                })
                .finally(() => {
                    console.log('====== FIM ======');
                });        
        });

    return;

}
  
console.log('Acessando API...');

let freq = process.argv.find(item => item.substr(0,3) == '-m=');
let ref = process.argv.find(item => item.substr(0,3) == '-r=');

freq = freq ? freq.substr(3) : "m";
ref = ref ? ref.substr(3) : "MA";

console.log('Referencia: ', ref);

// Busca das integrações cadastradas.

console.log('Verificando serviços registrados...');

axios.get("/prepare/kpi?freq=" + freq + "&ref=" + ref)
    .then(res => {
        console.log(res.data);

        getKpi(res.data, 0);
    })
    .catch(err => {
        console.error(err.response.data);
    });

console.log("=======")

function getKpi(lista, index) {

    if ( index >= lista.length ) {
        console.log('===== Fim =====');
        process.exit();
        return;
    }

    let kpi = lista[index];

    console.log("=> Buscando Indicador " + kpi.id + "...");
    
    try {
        sql.connect(getStrConnection())
            .then(() => { 
                sql.query(kpi.query)
                    .then(resultado => { 
                        console.log('Resultado: ', resultado.recordset);        

                        if ( !resultado.recordset[0].numerador ) {
                            console.log('Valor não retornado.');
                        }

                        let params = { 
                            id: kpi.id, 
                            ref: kpi.ref, 
                            numerador: resultado.recordset[0].numerador ? resultado.recordset[0].numerador : 0, 
                            denominador: resultado.recordset[0].denominador ? resultado.recordset[0].denominador : 1, 
                            query: kpi.query
                        };

                        console.log('Enviando...');
                  
                        axios.post('/kpi', params)
                            .then(res => {
                                console.log(res.data);
                            })
                            .finally(() => {
                                getKpi(lista, index + 1);
                            });
                    });
            });

    } catch (err) {
        console.error(err);
    }

}

function getStrConnection () {
    return {
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        server: process.env.HOST,
        port: parseInt(process.env.PORT), 
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000
        },
        options: {
          encrypt: true, 
          trustServerCertificate: true 
        }
      };
}