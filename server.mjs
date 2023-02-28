//import { createServer } from 'http';
//const http http'
//var http = require('http');
import * as http from 'http';
//const { elasticSearch } = require('./config');
//const { Client } = require('@elastic/elasticsearch')
import {Client} from '@elastic/elasticsearch';
const clientSearch = new Client({
  cloud: { id:  'RepfabricElastic:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyQxNjJjYzY4ZTYzNjc0YmUwOTkzNTFiMjM1MzRmY2FmYiQzNWEzMDEzZDU0ZTg0MTgxOTczNjdmOWU5OWM4NjY1Ng==' },
  auth: { apiKey:  'S01vQlZZWUJDdmNRXzhlSmk4eDM6dDc5OFpLaWlUSmluNEU4d3MyZW5ldw==' },
});
// Create a local server to receive data from
const server = http.createServer();
console.log("Hey");
// Listen to the request event
server.on('request', (request, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  //res.write('Hello World!');
  return res.end(JSON.stringify([{
    id: 1,
    customer: 'DIEBOLD',
    manufacturer: "DIEBOLDManufacturer",
    partnumber: "170-00140",
    amount: 1740,
    amountPYTD: 1740,
    amountSubs: 0,
    percentage: 10,
    date: '2013/01/06',
  }, {
    id: 2,
    customer: 'CROWN EQUIPMENT/CONT',
    manufacturer: "HONEYWELL",
    partnumber: "170-00141",
    amount: 850,
    amountPYTD: 940,
    amountSubs: -100,
    percentage: 10,
    date: '2013/01/13',
  },
  {
    id: 3,
    customer: 'CROWN EQUIPMENT/CONT',
    manufacturer: "HONEYWELL",
    partnumber: "170-00142",
    amount: 850,
    amountPYTD: 1000,
    amountSubs: -150,
    percentage: 10,
    date: '2013/01/13',
  },
  {
    id: 4,
    customer: 'BORGWARNER',
    manufacturer: "LAIRD TECHNOLOGIES",
    partnumber: "180-00141",
    amount: 850,
    amountPYTD: 200,
    amountSubs: 650,
    percentage: 10,
    date: '2013/01/13',
  },
  {
    id: 5,
    customer: 'BORGWARNER',
    manufacturer: "LAIRD TECHNOLOGIES",
    partnumber: "180-00141",
    amount: 850,
    amountPYTD: 1000,
    amountSubs: -150,
    percentage: 10,
    date: '2013/01/13',
  },
  {
    id: 6,
    customer: 'BORGWARNER',
    manufacturer: "LAIRD TECHNOLOGIES",
    partnumber: "180-00142",
    amount: 850,
    amountPYTD: 300,
    amountSubs: 550,
    percentage: 10,
    date: '2013/01/13',
  },
  {
    id: 7,
    customer: 'BORGWARNER',
    manufacturer: "LAIRD TECHNOLOGIES",
    partnumber: "180-00142",
    amount: 850,
    amountPYTD: 300,
    amountSubs: 550,
    percentage: 10,
    date: '2013/11/13',
  },
  {
    id: 8,
    customer: 'BORGWARNER',
    manufacturer: "LAIRD TECHNOLOGIES",
    partnumber: "180-00142",
    amount: 850,
    amountPYTD: 300,
    amountSubs: 550,
    percentage: 10,
    date: '2013/06/13',
  }]));
  /* res.end(JSON.stringify({
    data: 'Hello World!',
  })); */
});
 server.listen(3000);
/*
createServer((req, res) => {
  res.write('Hello World!');
  res.end();
}).listen(process.env.PORT);
 */