const http = require("http");
const ch = require("cheerio");

function PeticionPost(numTarjeta) {
  let opciones = {
    hostname: "pocae.tstgo.cl",
    port: 80,
    path: `/PortalCAE-WAR-MODULE/SesionPortalServlet?accion=6&NumDistribuidor=99&NomUsuario=usuInternet&NomHost=AFT&NomDominio=aft.cl&Trx&RutUsuario=0&NumTarjeta=${numTarjeta}&bloqueable=`,
    method: "POST",
    headers: {
      "server": "Apache",
      "link": '<https://www.red.cl/wp-json/>; rel="https://api.w.org/", <https://www.red.cl/wp-json/wp/v2/pages/68>; rel="alternate"; type="application/json", <https://www.red.cl/>; rel=shortlink',
      "Content-Type": "text/html",
      "content-encoding": "gzip",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "connection": "close",
      "Accept": "*/*",
    },
  };

  return new Promise((resolved, rejected) => {
    const req = http.request(opciones, (response) => {
      let resultadoString = "";
      response.on("data", (codigoHTML) => {
        resultadoString += codigoHTML;
      });
      response.on("end", () => {
        if (response.statusCode === 200) {
          numTarjeta = parseInt(numTarjeta);
          let arrayData = [];
          arrayData.push(true);

          if (isNaN(numTarjeta) || numTarjeta < 0) {
            rejected(
              'El parámetro ingresado no cumple con los requisitos para ser aceptada como Bip!.'
            );
          } else {
            numTarjeta = numTarjeta.toString();
            const html = ch.load(resultadoString);
            if (numTarjeta.length >= 7 && numTarjeta.length <= 12) {
              try {
                for (let i = 0; i <= 3; i++) {
                  arrayData.push(
                    html('td[bgcolor="#B9D2EC"]')[i]["children"][0].data
                  );
                }
                resolved(arrayData);
              } catch {
                rejected(
                  'Hubo un problema al obtener los datos de la tarjeta.'
                );
              }
            } else {
              rejected('Tarjeta ingresada inválida.');
            }
          }
        } else {
          rejected(
            `Transantiago no contesta. Respuesta HTTP: ${response.statusCode}.`
          );
        }
      });
    });

    req.on(
      "error",
      (err) => err.code === "ENOTFOUND" && rejected("Error inesperado.")
    );
    req.end();
  });
}

module.exports = function devuelveTarjetaBip(numTarjeta) {
  try {
    return (obtencionDatos = PeticionPost(numTarjeta));
  } catch (e) {
    console.log(`Ocurrió un error inesperado \n ${e}`);
  }
};
