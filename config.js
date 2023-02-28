const elasticSearch = {
    elasticSearch: {
    clusterId:
      process.env.ELASTICSEARCH_CLUSTER_ID
      || 'RepfabricElastic:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyQxNjJjYzY4ZTYzNjc0YmUwOTkzNTFiMjM1MzRmY2FmYiQzNWEzMDEzZDU0ZTg0MTgxOTczNjdmOWU5OWM4NjY1Ng==',
    apiKey: process.env.ELASTICSEARCH_ENCODED_KEY || 'S01vQlZZWUJDdmNRXzhlSmk4eDM6dDc5OFpLaWlUSmluNEU4d3MyZW5ldw==',
  
}
}
  
module.exports = elasticSearch