"use strict";
const express = require("express");
const cors = require("cors");  
const fetch = require("node-fetch");
const redis = require("redis");
const { URL, URLSearchParams } = require('url');
const PORT = process.env.PORT || 4000;
const PORT_REDIS = process.env.PORT || 6379;
const app = express();
app.use(cors());
const redisClient = redis.createClient(PORT_REDIS);
const API = 'https://pokeapi.co/api';
const set = (key, value) => {
   redisClient.set(key, JSON.stringify(value));
}
const get = (req, res, next) => {
    let key = ""
    let ruta = req.route.path
    console.log(ruta)
    if(ruta=="/pokemon/"){
       
        key = ruta+"?limit="+req.query.limit+"&offset="+req.query.offset;
    }    
    else if(ruta=="/pokemon/:id"){
        key = "pokemon/"+req.params.id
    }
    console.log(key)
    redisClient.get(key, (error, data) => {
      if (error) res.status(400).send(err);
      if (data !== null) res.status(200).send(JSON.parse(data));
      else next();
 	});
}
app.get("/pokemon/:id", get, (req, res) => {
  var id = req.param("id");
  fetch(API+"/v2/pokemon/"+id)
    .then(res => res.json())
    .then(json => {
    	set(req.route.path, json);
    	res.status(200).send(json);
    })
    .catch(error => {
      console.error(error);
      res.status(400).send(error);
    });
});

app.get("/species/:id", get, (req, res) => {
  var id = req.param("id");
  fetch(API+"/v2/pokemon-species/"+id)
    .then(res => res.json())
    .then(json => {
    	set(req.route.path, json);
    	res.status(200).send(json);
    })
    .catch(error => {
      console.error(error);
      res.status(400).send(error);
    });
});

app.get("/evolution-chain/:id", get, (req, res) => {
  var id = req.param("id");
  fetch(API+"/v2/evolution-chain/"+id)
    .then(res => res.json())
    .then(json => {
    	set(req.route.path, json);
    	res.status(200).send(json);
    })
    .catch(error => {
      console.error(error);
      res.status(400).send(error);
    });
});

app.get("/pokemon/", get, (req, res) => {
    
    var url = new URL(API+"/v2/pokemon/")
    var params = {limit:req.query.limit, offset:req.query.offset}
    console.log(params)
    url.search = new URLSearchParams(params).toString();
    console.log(url)
    fetch(url)
      .then(res => res.json())
      .then(json => {
          set(req.route.path, json);
          res.status(200).send(json);
      })
      .catch(error => {
        console.error(error);
        res.status(400).send(error);
      });
  });
app.listen(PORT, () => console.log(`Server up and running on ${PORT}`));