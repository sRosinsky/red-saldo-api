const https = require('https')
const cheerio = require('cheerio')
function PetcionGet() {
    let opciones = {
        hostname: "www.red.cl",
        port: 443,
        method: "GET",
        path: "/",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            'Accept': '*/*',
            'Content-Type': 'text/html; charset=UTF-8',
            'content-encoding': 'gzip',
        }
    };

    return new Promise((resolved, rejected) => {
        const req = https.request(opciones, (response) => {
            let resultadoString = ""
                response.on("data", (codigoHTML) => {
                    resultadoString += codigoHTML;
                })

                response.on("end", () => {
                    if (response.statusCode === 200) {
                        const arrayData = [];
                        const $ = cheerio.load(resultadoString);
                        $('tr').get().map((el, i) => {
                            const data = $(el).children('td[class="recorrido"]').next().text()
                            arrayData.push(data)
                        })
                        
                        const newArrayData = arrayData.filter((el, index) => (index > 5 && index !== 13 && index < 15)) 
                            try {
                                newArrayData.map((el, index) => {
                                    (el) === "Sin alteraciones"
                                    ? 
                                    newArrayData[index] = 'Línea operativa'
                                    :
                                    (el) === "Con alteraciones" 
                                    ?
                                    newArrayData[index] = 'Hay problemas en el servicio'
                                    :
                                    ""
                                })
                            } catch {
                                rejected('Hubo un problema al obtener el estado de la red metro.')
                            }
                   
                        resolved(newArrayData)

                    } else {
                        rejected(`Red no contesta. Respuesta HTTP: ${response.statusCode}.`)
                    }            
                })

        })
        req.on('respuesta', err => (err.code === 'ENOTFOUND' && rejected('Error inesperado.')))
        req.end()
    }
)}

module.exports = function devuelveEstadoRed() {
    try {
        return obtencionDatos = PetcionGet()
    } catch (e) {
        console.log(`Ocurrió un error inesperado \n ${e}`);
    }
}
