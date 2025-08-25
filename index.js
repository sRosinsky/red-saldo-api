/*
@author: sRosinsky
*/
const express = require("express");
const tarjetaBip = require("./lib/tarjetabip/tarjetaBip");
const estadoRed = require("./lib/tarjetabip/estadoRed");
const tarjetaBioTren = require("./lib/biotren/tarjetaBioTren");
const paseEscolar = require("./lib/tne/paseEscolar.js");
const bodyparser = require('body-parser');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config()

let api = express();
api.use(cors())

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada:', promise, '\nrazón: \n', reason);
});

process.on('unhandledException', (reason, promise) => {
  console.error('Excepción no controlada: \n', promise, '\nrazón: \n', reason);
});

api.use(bodyparser.json());
api.use(helmet());

//helmet 
api.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], 
      styleSrc: ["'self'"],
      objectSrc: ["'none'"],  
      upgradeInsecureRequests: []
    }
  })
);

api.use(helmet.dnsPrefetchControl({ allow: false }));

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;
const AUTH_TOKEN = process.env.AUTHORIZED_TOKEN_GENERATION;
const TIME = process.env.MAX_TIME_TOKEN;
const allowed_ips = ["::1", "::ffff:127.0.0.1"]

api.set("port", PORT)

api.use((req,res,next) => {
  if (allowed_ips.includes(req.ip)) {
    return next()
  } else {
    return (res.status(403)).json("Acceso denegado");
  }
});

const verificarToken = (req,res,next) => {

  const token = req.headers['authorization'];
  if (!token) {
    return (res.send(("Acceso denegado")).status(403));

  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY)
    req.user = decoded;
    next();

  } catch (error) {
    return (res.send(("Acceso denegado")).status(403));
  }
}


api.post("/api/generartoken", (req, res) => {
  const { auth_token } = req.body;
  if (!auth_token || auth_token !== AUTH_TOKEN ) {
    return (res.status(403)).json("Acceso denegado");
  }

  const token = jwt.sign({auth_token}, SECRET_KEY, {expiresIn: TIME || "24h"})
  res.json({token})
});


api.get("/api/bip/estadored", verificarToken, (req,res) => {
  estadoRed()
    .then((data) => {
      jsonData = {
        respuesta: true,
        estadoRedMetro: {
          L1: data[0],
          L2: data[1],
          L3: data[2],
          L4: data[3],
          L4a: data[4],
          L5: data[5],
          L6: data[6],
          trenNos: data[7],
        },
      };
      res.send(jsonData);
    })
    .catch((error) => {
      jsonData = {
        respuesta: false,
        error,
      };
      res.send(jsonData);
    });
});

api.get("/api/biotren/:numerotarjeta", verificarToken, async (req,res) => {
  const numtarjeta = req.params.numerotarjeta;
  
  jsonData = {}

  try {
    if (numtarjeta.length >= 7 && numtarjeta.length <= 10) {
      const data = await tarjetaBioTren(numtarjeta)
      res.send(data)
    } else {
      jsonData.respuesta = false, jsonData.mensaje = "La tarjeta ingresada no es válida."
      res.send(jsonData)
    }
  } catch (e) {
    jsonData.respuesta = false, jsonData.mensaje = e
  }
})

api.get("/api/bip/:numerotarjeta", verificarToken, (req, res) => {
  let jsonData = {};
  numtarjeta = req.params.numerotarjeta;

  tarjetaBip(numtarjeta)
    .then((data) => {
      jsonData = {
        respuesta: true,
        datosTarjeta: {
          numeroTarjeta: data[1],
          tipoContrato: data[2],
          balance: data[3],
          fechaSaldo: data[4],
        },
      };

      res.json(jsonData);
    })
    .catch((e) => {
      jsonData = {
        "respuesta": false,
        "mensaje": e
      }
      res.json(jsonData)
    });
});

api.get("/api/paseescolar/:numtarjeta", verificarToken, (req,res) => {
  paseEscolar(req.params.numtarjeta)
  .then((data) => {
    res.json({
      "respuesta": true,
      "saldo": data
    })
  })
  .catch((e) => {
    res.json({
      "respuesta": false,
      "mensaje": e
    })
  })
})

api.all([
"/api/bip/estadored", 
"/api/bip/:numerotarjeta", 
"/api/generartoken", 
"/api/bip/", 
"/api/bip/", 
"/api/biotren/:numerotarjeta"], verificarToken, (req,res) => {
  res.send(("Método no permitido")).status(405)
})

api.all("*", verificarToken, (req,res) => {
  res.send(("Página no encontrada")).status(404)
})

api.listen(api.get("port"), () => {
  console.log(`La aplicación de express está a la escucha en el puerto ${api.get("port")}`);
});
