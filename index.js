const express = require("express");
const env = require('dotenv').config()
const tarjetaBip = require("./lib/tarjetabip/tarjetaBip");
const estadoRed = require("./lib/tarjetabip/estadoRed");
const tarjetaBioTren = require("./lib/biotren/tarjetaBioTren");
const bodyparser = require('body-parser');
const jwt = require('jsonwebtoken')

let api = express();
api.use(bodyparser.json());

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;
const AUTH_TOKEN = process.env.AUTHORIZED_TOKEN_GENERATION;
const TIME = process.env.MAX_TIME_TOKEN;


api.set("port", PORT)

const responseAuth = {
  respuesta: "No autorizado."
}

api.post("/api/generartoken", (req, res) => {
  const { auth_token } = req.body;
  ß
  if (!auth_token || auth_token !== AUTH_TOKEN ) {
    
    return (res.status(403)).json(responseAuth);
  }

  const token = jwt.sign({auth_token}, SECRET_KEY, {expiresIn: TIME || "24h"})
  res.json({token})
})

const verificarToken = (req,res,next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return (res.status(403)).json(responseAuth);
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY)
    req.user = decoded;
    next();

  } catch (error) {
    return (res.status(403)).json(responseAuth);
  }
}

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
  let jsonData = {}
  const numtarjeta = req.params.numerotarjeta;
  const data = await tarjetaBioTren(numtarjeta)

  try {
    jsonData.respuesta = true, jsonData.saldo = data[0], jsonData.movimientos = data[1]
    res.send(jsonData)
  } catch (error) {
    jsonData.respuesta = false, jsonData.mensaje = error
    res.send(jsonData)
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
    .catch((error) => {
      jsonData = {
        respuesta: false,
        error,
      }
      res.json(jsonData)
    });
});


api.all("/api/bip/", (req, res) => {
  res.redirect("/")
});


api.all("/api/", (req, res) => {
  res.redirect("/");
});

api.all("*", (req,res) => {
  res.json({respuesta: "Página no encontrada."})
})

api.listen(api.get("port"), () => {
  console.log(`La aplicación de express está a la escucha en el puerto ${api.get("port")}`);
});
