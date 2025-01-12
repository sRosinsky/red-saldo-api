# red-saldo-API
<h4> Microservicio creado con Node para obtener datos de la red metro en un formato amigable. (Chile) </h4>
<br>

<h2> 📝 Prerrequisitos </h2>
    - Tener NodeJS instalado en tu equipo.

<h2> 📝 Instrucciones </h2>
<br>

<p> El servidor requiere de autorización JWT para funcionar, para esto se debe hacer un archivo .env con las siguientes variables </p>

```
SECRET_KEY="" // clave secreta
AUTHORIZED_TOKEN_GENERATION="" // clave alfanumérica para generar el token, se debe hacer un POST a localhost:3000/api/generartoken enviando auth_token en un body
MAX_TIME_TOKEN="" // tiempo máximo que dura el token generado anteriormente
```

<p> Para ejecutar el servidor de express (index.js:)  </p>

```
npm run api
```

<p> Para obtener un .json con los datos de la tarjeta debe hacer una petición GET a esta ruta: <p>

```
localhost:3000/api/bip/<numero de tu bip>
```

<strong>Ejemplo:</strong>

```
{
    "respuesta": true,
    "datosTarjeta": {
        "numeroTarjeta": "XXXXXX",
        "tipoContrato": "Contrato Activo",
        "balance": "$110",
        "fechaSaldo": "16/07/2030 15:14"
    }
}
```

<p> Para obtener datos del estado del servicio de metro se debe hacer una petición GET a esta ruta: <p>

```
localhost:3000/api/estadored
```

<strong>Ejemplo:</strong>

```
{
    "respuesta": true,
    "estadoRedMetro": {
        "L1": "Línea operativa",
        "L2": "Línea operativa",
        "L3": "Línea operativa",
        "L4": "Línea operativa",
        "L4a": "Línea operativa",
        "L5": "Línea operativa",
        "L6": "Línea operativa",
        "trenNos": "Hay problemas en el servicio"
    }
}
```

<p> Si hay errores, el estado de <<respuesta>> cambiará a false, y aparecerá la key "error" con la descripción del error:  </p>

<strong>Ejemplo:</strong>
<br />

```
{
    "respuesta": false,
    "error": "El parámetro ingresado no cumple con los requisitos para ser aceptada como Bip!."
}
```






