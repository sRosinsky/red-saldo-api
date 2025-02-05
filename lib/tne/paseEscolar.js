
const ch = require("cheerio");
const { error } = require("console");
const https = require('https');

function PaseEscolar(numTarjeta) {
    return new Promise((resolved, rejected) => {
      // retorna un objeto con el saldo
      const peticionGet = (numero_tarjeta, token_movired) => {
        const obtainToken = () => {
          return token = String(token_movired).split(':')[2].split(',')[0].replaceAll('"', '')
        }

        token = obtainToken()

        const Headers = {
          "Authorization": `Bearer ${token}`,
          "Content-Length": "57",
          "Sec-Ch-Ua-Platform": "macOS",
          "Accept-Language": "es-419,es;q=0.9",
          "Sec-Ch-Ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
          "Sec-Ch-Ua-Mobile": "?0",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
          "Accept": "application/json, text/plain, */*",
          "Content-Type": "application/json",
          "Origin": "https://new.movired.cl",
          "Sec-Fetch-Site": "same-site",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
          "Referer": "https://new.movired.cl/",
          "Accept-Encoding": "gzip, deflate, br",
          "Priority": "u=4, i"
        } 

        const Options = {
          hostname: "movired.cl",
          port: 443,
          path: `/api/consulta/saldo`,
          method: "POST",
          headers: Headers
        }

        const req = https.request(Options, (res) => {
          let stringRespuesta = ''
          res.on("data", (chunk) => {
            stringRespuesta += chunk
          })

          res.on("end", () => {
            try {
              if (res.statusCode === 200) {
                let val = Object.values(JSON.parse(stringRespuesta))
                if ((numero_tarjeta.length < 8) || (numero_tarjeta.length > 10)) {
                  rejected("La tarjeta ingresada no cumple con los requisitos para ser considerada TNE.")
                } else {
                  if (val[0] === false || val[1] === null || val[0] === null) {
                    rejected('Ocurrió un error interno.')
                  } 
                  else {
                    resolved(val[1])
                  }
                }
      

              }
              else {
                rejected('Ocurrió un error HTTP. ' + res.statusCode)
              }
            } catch (e) {
              rejected("Ocurrió un error. " + e)
            }
          })
        })

        req.write(JSON.stringify({ 
          numero: numero_tarjeta,
          prodcuto: 34,
          productoCliente: 120
        }))

        req.on("error", (e) => {
          rejected("Ocurrió un error no controlado. " + e)
        })

        req.end()


      }
      // obtén el token generado
      const peticionPost = (numero_tarjeta, cliente) => {

        const Headers = {
            "Host": "movired.cl",
            "Content-Length": "77",
            "Sec-Ch-Ua-Platform": "\"macOS\"",
            "Accept-Language": "es-419,es;q=0.9",
            "Accept": "application/json, text/plain, */*",
            "Sec-Ch-Ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
            "Content-Type": "application/json",
            "Sec-Ch-Ua-Mobile": "?0",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
            "Origin": "https://new.movired.cl",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://new.movired.cl/",
            "Accept-Encoding": "gzip, deflate, br",
            "Priority": "u=4, i"
        }; 
        const Options = {
          hostname: "movired.cl",
          port: 443,
          path: `/api/generar/token`,
          method: "POST",
          headers: Headers
        }

        const cliente_id = JSON.stringify({
          "cliente_id": cliente
        });


        const req = https.request(Options, (res) => {
          let stringRespuesta = ""

          res.on("data", (chunk) => {
             stringRespuesta += chunk
          })

          res.on("end", () => {
            try {
              if (res.statusCode === 200) {
                peticionGet(numero_tarjeta, stringRespuesta)
              }
              else {
                rejected('Ocurrió un error HTTP. Código: ' + res.statusCode)
              }
            } catch (e) {
              rejected('Ocurrió un error al obtener los datos. ' + e)
            }
          })
        })

        req.write(cliente_id)
        
        req.on("error", (e) => {
          rejected(`Ocurrió un error con la solicitud: ${e.message}`)
        })

        req.write(JSON.stringify({ cliente_id: numero_tarjeta }))
        req.end()
      }
      // obtén el id de cliente
      const getClientId = (numero_tarjeta) => {
          const Headers = {
            "Host": "movired.cl",
            "Content-Length": "22",
            "Accept-Language": "es-419,es;q=0.9",
            "Accept": "application/json, text/plain, */*",
            "Sec-Ch-Ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
            "Content-Type": "application/json",
            "Sec-Ch-Ua-Mobile": "?0",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
            "Origin": "https://new.movired.cl",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://new.movired.cl/",
            "Accept-Encoding": "gzip, deflate, br",
            "Priority": "u=1, i"
          }

          const options = {
            hostname: "movired.cl",
            port: 443,
            path: "/api/movired/configuracion",
            method: "POST",
            headers: Headers
          }

            const req = https.request(options, res => {
              let resultado = ""
              if (res.statusCode === 200) {
                res.on("data", (chunk) => {
                  resultado += chunk
                })
  
                res.on("end", () => {
                  const cliente = Object.values(JSON.parse(resultado))[0]
                  peticionPost(numero_tarjeta, cliente)
                })  

              } else {
                rejected("Ocurrió un error HTTP.")
              }
            })
            req.write(JSON.stringify({
              "navigation_url":"/"
            }))

            req.on("error", (e) => {
              rejected('Ocurrió un error inesperado.') 
            })

            req.end()
      }
      // inicia la secuencia
      getClientId(numTarjeta)

    })


}

module.exports = function devuelveDatosTNE(numTarjeta) {
  try {
    return PaseEscolar(numTarjeta)
  } catch (e) {
    console.log(`Ocurrió un error inesperado. ${e}`)
  }
}