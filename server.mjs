//import { createServer } from 'http';
//const http http'
//var http = require('http');
import * as http from 'http';
import * as url from 'url';
import moment from 'moment';
import express from 'express';
var router = express.Router();
const app = express();


//var url = require("url");
//const { elasticSearch } = require('./config');
//const { Client } = require('@elastic/elasticsearch')
//import {Client} from '@elastic/elasticsearch';
//var elasticSearch = require('../services/elastic-service');
import {Client} from '@elastic/elasticsearch';
//import * as elasticSearch from './services/elastic-service.js';
class ElasticSearchService {
  constructor(cloudId, apiKey) {
      this.esService = new Client({
          cloud: {  id:  'RepfabricElastic:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyQxNjJjYzY4ZTYzNjc0YmUwOTkzNTFiMjM1MzRmY2FmYiQzNWEzMDEzZDU0ZTg0MTgxOTczNjdmOWU5OWM4NjY1Ng==' },
          auth: { apiKey:  'S01vQlZZWUJDdmNRXzhlSmk4eDM6dDc5OFpLaWlUSmluNEU4d3MyZW5ldw==' },
      });
  }

async getDataAggregate(query,page,limit,range){
  return this.esService.search({
      index: "tenant_1",
      track_total_hits: true,
      size :0,
      query: {
          bool:{
          must: [
              {
              range:{
                  "body.INVOICE_DATE": {
                      "gte": range[0],
                      "lte": range[1]
                  }
                  }
              }
          ]
          }
  },
      aggs: {
          partNumbers: {
          terms: {
              field: "body.PART_NUMBER.keyword" ,
              size: 30000
          },
          aggs: {
              manufacturer: {
              terms: {
                  field: "body.MANUFACTURER.keyword",
                  size: 100
              },
              aggs: {
                  primaryCustomer: {
                  terms: {
                      field: "body.PRIMARY_CUSTOMER.keyword"
                  },
                  aggs: {
                      salesStats: {
                      stats: {
                          field: "body.SALES_AMOUNT"
                      }
                      }
                  }
                  }
              }
              }
          }
          }
      }
})
}
}
const elasticSearchClient = new ElasticSearchService(false,false);
// Create a local server to receive data from
//const server = http.createServer();
console.log("Hey");
// Listen to the request event
app.listen(3000, () =>
  console.log('Example app listening on port 3000!'),
);
/* server.on('request', (req, res) => {
  var parsedUrl = url.parse(req.url, true); // true to get query as object
  var queryAsObject = parsedUrl.query;
  //console.log(1)
  res.writeHead(200, { 'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Allow': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method' });
  

  res.write(''); 
  //console.log(2)
  //console.log(queryAsObject.query);
  if(queryAsObject){
    console.log(JSON.stringify(queryAsObject));
    let {page,query,limit,table,from,to,flag} = queryAsObject;
    console.log(query)
    try{
      if(!query || !page || !limit || !from || !to ){
        res.end(JSON.stringify({code:0,msg:`Error: you need to send page,query,limit,from,to`}));
    }
    let now = [from,to];
    let pastyear = [moment(from).subtract(1,"year").format("YYYY-MM-DD"),moment(to).subtract(1,"year").format("YYYY-MM-DD")];
    console.log(now);
    console.log(pastyear);
    let resnow = elasticSearchClient.getDataAggregate(query,page,limit,now);
    let resbefore = elasticSearchClient.getDataAggregate(query,page,limit,pastyear);
    Promise.all([resnow,resbefore]).then((results)=>{
        //console.log(results);
        //console.log(results)
        if(!results[0]?.aggregations){
          res.end(JSON.stringify({code:0,msg:"Error: Can't get results from range"}));
        }
        if(!results[0]?.aggregations.partNumbers.buckets.length>0){  
          res.end(JSON.stringify({code:0,msg:"Error: Can't get results from range"}));  
        }
        let resultsName;
        let resultres;
        if(table=="true"){
            resultsName=true;
            var nowarray = results[0].aggregations;
            var beforearray = results[1].aggregations;
            var arrayPartNumbersKeys = nowarray.partNumbers.buckets.map((elem)=>{
                return elem.key
            })
            var arrayPartNumbersBeforeKeys = beforearray.partNumbers.buckets.map((elem)=>{
                return elem.key
            })
            let desAggregateArray = [];
            let desAggregateArrayBefore = [];
            let onlybefore = [];
            let cont = 0;
            let cont2 = 0;
            beforearray.partNumbers.buckets.forEach((part)=>{
                part.manufacturer.buckets.forEach((manufact)=>{
                    manufact.primaryCustomer.buckets.forEach((priCustom)=>{
                        desAggregateArrayBefore.push({
                            id:cont2++,
                            partnumber:part.key,
                            manufacturer:manufact.key,
                            customer:priCustom.key,
                            amount:priCustom.salesStats.sum,
                            amountPYTD:0,
                            amountSubs:0,
                            percentage:0
                        })
                    })
                })
            })
            nowarray.partNumbers.buckets.forEach((part)=>{
                part.manufacturer.buckets.forEach((manufact)=>{
                    manufact.primaryCustomer.buckets.forEach((priCustom)=>{
                        desAggregateArray.push({
                            id:cont++,
                            partnumber:part.key,
                            manufacturer:manufact.key,
                            customer:priCustom.key,
                            amount:priCustom.salesStats.sum,
                            amountPYTD:0,
                            amountSubs:0,
                            percentage:0
                        })
                    })
                })
            })
            desAggregateArray.forEach((elem)=>{
                //console.log(elem.partnumber)
                //console.log(elem)
                let resfind = desAggregateArrayBefore.find((elemfind)=>{
                    return elem.partnumber == elemfind.partnumber && elem.manufacturer == elemfind.manufacturer && elem.customer == elemfind.customer
                });
                if(resfind){
                    elem.amountPYTD = resfind.amount.toFixed(0);
                    elem.amountSubs = (elem.amount - resfind.amount).toFixed(0);
                    elem.percentage =  ((elem.amount - resfind.amount)/resfind.amount).toFixed(2);
                }else{
                    elem.amountPYTD = 0;
                    elem.amountSubs =  (elem.amount - elem.amountPYTD).toFixed(0);
                    elem.percentage = ((elem.amount - 0)/0).toFixed(2);

                }
                if(elem.percentage == "Infinity"){
                    elem.percentage = 100
                }
                if(elem.percentage == "-Infinity"){
                    elem.percentage = -100
                }
                elem.amount = elem.amount.toFixed(0)
                
            })
            desAggregateArrayBefore.forEach((elem)=>{
                //console.log(elem.partnumber)
                //console.log(elem)
                let resfind = desAggregateArray.find((elemfind)=>{
                    return elem.partnumber == elemfind.partnumber && elem.manufacturer == elemfind.manufacturer && elem.customer == elemfind.customer
                });
                if(resfind){
                }else{
                    onlybefore.push({
                        id:cont++,
                        partnumber:elem.partnumber,
                        manufacturer:elem.manufacturer,
                        customer:elem.customer,
                        amount:0,
                        amountPYTD:elem.amount.toFixed(0),
                        amountSubs:elem.amount.toFixed(0),
                        percentage:-100
                    })
                    //elem.amountPYTD = 0;
                    //elem.amountSubs =  (elem.amount - elem.amountPYTD).toFixed(0);
                    //elem.percentage = ((elem.amount - 0)/0).toFixed(2);

                }
                
            })
            //console.log("onlybefore");
            //console.log(onlybefore)
            //console.log(desAggregateArray);

            res.end(JSON.stringify({code:1,data:desAggregateArray.concat(onlybefore) || []}));
        }else{
          res.end(JSON.stringify({code:1,now:resultsName?resultres:(results[0].hits.hits || []),before:resultsName?resultres:(results[1].hits.hits || [])}));
        }
        //console.log(resultsName)
        
    })
    }
    catch(err){
      console.log(err)
    }
  }

});
 server.listen(process.env.PORT); */




/*
createServer((req, res) => {
  res.write('Hello World!');
  res.end();
}).listen(process.env.PORT);
 */