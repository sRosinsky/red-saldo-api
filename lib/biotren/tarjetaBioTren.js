const https = require('https');
const ch = require('cheerio');

const url = "https://sinteg.fesur.cl/saldo-tarjeta";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const Agent = new https.Agent({ rejectUnauthorized: false });

async function PeticionPost(xsrf_token, laravel_session, token, numTarjeta) {
    const controller = new AbortController();
    const { signal } = controller;
    setTimeout(() => controller.abort(), 5000);

    const Headers = {
        "Cookie": `${xsrf_token};${laravel_session}`,
        "Content-Length": "71",
        "Cache-Control": "max-age=0",
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

    try {
        const response = await fetch(url, { method: "POST", headers: Headers, body: `_token=${token}&numero_tarjeta=${numTarjeta}`, signal, agent: Agent });
        if (!response.ok) return { respuesta: false, mensaje: "Error HTTP: " + response.status };
        const text = await response.text();
        const $ = await ch.load(text);
        const saldo = $('div.inner > h3')?.text();
        if (!saldo) return { respuesta: false, mensaje: "Número de tarjeta inválido" };
        const movimientos = $('table.table.table-striped.table-condensed tbody tr');
        const arr_movimientos = [];
        const movimientos_ordenados = movimientos?.text()?.split('\t\t\t\t').toString()?.split('\t')?.toString()?.replaceAll('\n,','')?.split(',')?.slice(1, undefined);
        movimientos_ordenados.forEach((el, i) => {
        if (i % 5 === 0 && i > 4) {
        const new_object_data = {
            "fechaHora": movimientos_ordenados[i-5],
            "estacion": movimientos_ordenados[i-4],
            "operacion": movimientos_ordenados[i-3],
            "saldoAnterior": movimientos_ordenados[i-2],
            "saldoActual": movimientos_ordenados[i-1]   
        }
        arr_movimientos.push(new_object_data)
        }})
        return {
            respuesta: true,
            saldo: saldo,
            movimientos: arr_movimientos,
        };        
    } catch (e) {
        if (e.name === "AbortError") return { respuesta: false, mensaje: "La petición se abortó por tiempo de espera." };
        return { respuesta: false, mensaje: e.message || "Error desconocido" };
    }
}

async function PeticionGet(numTarjeta) {
    try {
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

        const response = await fetch(url, { method: "POST", headers: Headers, agent: Agent });
        if (!response.ok) return { respuesta: false, mensaje: "Error HTTP: " + response.status };

        const cookies = response.headers.getSetCookie();
        const html = await response.text();
        const $ = await ch.load(html);
        const token = $('input')[0]?.attribs.value;
        const xsrfToken = cookies[0]?.split(';')[0];
        const laravelSession = cookies[1]?.split(';')[0];

        return await PeticionPost(xsrfToken, laravelSession, token, numTarjeta);
    } catch (e) {
        return { respuesta: false, mensaje: e.message || "Error desconocido" };
    }
}

async function PeticionBioTren(numTarjeta) {
    return await PeticionGet(numTarjeta);
}

module.exports = async function devuelveDatosBiotren(numTarjeta) {
    return await PeticionBioTren(numTarjeta);
};