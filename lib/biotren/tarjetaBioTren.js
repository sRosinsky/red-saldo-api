    const https = require('https');
    const ch = require('cheerio');

    const url = "https://sinteg.fesur.cl/saldo-tarjeta";

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    function PeticionBioTren(numTarjeta) {
        
        const Agent = new https.Agent({
            rejectUnauthorized: false
        });
        
        return new Promise((resolve, reject) => {
        
        function PeticionPost(xsrf_token, laravel_session, token) {
                const controller = new AbortController();
                const { signal } = controller;
                setTimeout(() => controller.abort(), 2000);
                
                const Headers = {
                    "Cookie": `${xsrf_token};${laravel_session}`,
                    "Content-Length": "71",
                    "Cache-Control": "max-age=0",
                    "Sec-Ch-Ua": '\"Not?A_Brand\";v=\"99\", \"Chromium\";v=\"130\"' ,
                    "Sec-Ch-Ua-Mobile": "?0",
                    "Sec-Ch-Ua-Platform": "\"macOS\"",
                    "Accept-Language": "es-419,es;q=0.9",
                    "Origin": "https://sinteg.fesur.cl",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Upgrade-Insecure-Requests": "1",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.70 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-User": "?1",
                    "Sec-Fetch-Dest": "document",
                    "Referer": "https://sinteg.fesur.cl/saldo-tarjeta",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Priority": "u=0, i",
                    "Connection": "keep-alive"
                }

                const Options = {
                    method: "POST",
                    headers: Headers,
                    body: `_token=${token}&numero_tarjeta=${numTarjeta}`
                }

                async function scraper(data) {
                    const arrayReadable = []
                    const $ = await ch.load(data)
                    const saldo = $('div.inner > h3')?.text()
                    const movimientos = $('table.table.table-striped.table-condensed tbody tr')
                    const movimientos_ordenados = movimientos?.text()?.split('\t\t\t\t').toString()?.split('\t')?.toString()?.replaceAll('\n,','')?.split(',')?.slice(1, undefined);
                    return {respuesta: true, saldo: saldo, movimientos: movimientos_ordenados};
                }

                fetch(url, { ...Options, Agent, signal })
                .then(response => {
                    if (response.status == 200 && response) {
                        return response.text()
                    }
                    else {
                        reject(jsonData = {
                                respuesta: false,
                                mensaje: "Error HTTP: " + response.status
                        }) 
                        }
                    })
                .then((data) => {
                    resolve(scraper(data));
                })
                .catch((e) => {reject(jsonData = {
                    respuesta: false,
                    mensaje: "Ocurrió un error inesperado: " + e
                })})

        }

        function PeticionGet() {
               
            const Headers = {
                    "Sec-Ch-Ua": '"Not?A_Brand";v="99", "Chromium";v="130"',
                    "Sec-Ch-Ua-Mobile": "?0",
                    "Sec-Ch-Ua-Platform": '"macOS"',
                    "Accept-Language": "es-419,es;q=0.9",
                    "Origin": "https://sinteg.fesur.cl",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Upgrade-Insecure-Requests": "1",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.70 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-User": "?1",
                    "Sec-Fetch-Dest": "document",
                    "Referer": "https://sinteg.fesur.cl/saldo-tarjeta",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Priority": "u=0, i",
                    "Connection": "keep-alive"
                };

                const Options = {
                    method: "POST",
                    headers: Headers
                };

                function getData() {
                    const scraping = async (obj) => {
                        const xsrfToken = obj?.param1[0]?.split(';')[0];
                        const laravelSession = obj?.param1[1]?.split(';')[0];
                        const $ = await ch.load(obj?.param2);
                        const etiqueta = $('input');
                        const token = etiqueta[0]?.attribs.value;
                        PeticionPost(xsrfToken, laravelSession, token);       

                            
                    };

                    const obj = {};

                    const getCookie = (data) => {
                        obj.param1 = data;
                    };

                    const getText = (data) => {    
                        obj.param2 = data;
                        try {
                            scraping(obj)
                        } catch (e) {
                            reject(
                                jsonData = {
                                    respuesta: false,
                                    mensaje: "Ocurrió un error de lógica: " + e
                                }
                            )
                        }
                    };

                    fetch(url, { ...Options, Agent })
                        .then((response) => {
                            jsonData = {}
                            
                            if (response && response.status == 200)
                            {
                            const cookies = response.headers.getSetCookie();
                            return response.text().then((data) => {
                                return { cookies, data };
                            });
                            }
                            else {
                                reject(jsonData = {
                                    respuesta: false,
                                    mensaje: "Error HTTP: " + response.status
                                })   
                            }
                        })
                        .then(({ cookies, data }) => {
                            getCookie(cookies);
                            getText(data);
                        }) 
                        .catch((e) => {
                                reject(
                                    jsonData = {
                                        respuesta: false,
                                        mensaje: "Ocurrió un error inesperado: " + e
                                    }
                                )
                        });
                }
                try {
                    getData();
                }
                catch(e) {
                    const jsonData = {
                        respuesta: false,
                        mensaje: "Ocurrió un error inesperado: " + e
                    }

                    return jsonData
                }
        }

            fetch(url)
            .then((res) => {
                if (res.status === 200) {
                    PeticionGet()
                } else {
                    resolve({respuesta: false, mensaje: "Ocurrió un error HTTP: " + res.status})
                } 
            }).catch((e) => {
                resolve({respuesta: false, mensaje: "Ocurrió un error inesperado: "  + e})
            })
        })
    }
    
    
    module.exports = function devuelveDatosBiotren(numTarjeta) {
        try {
            return obtencionDatos = PeticionBioTren(numTarjeta);
        } catch (e) {
            throw {e}
        }
    };
