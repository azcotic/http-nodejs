import {Client} from '@elastic/elasticsearch';

export default class ElasticSearchService {
    constructor(cloudId, apiKey) {
        console.log(elasticSearch.apiKey)
        this.esService = new Client({
            cloud: {  id:  'RepfabricElastic:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyQxNjJjYzY4ZTYzNjc0YmUwOTkzNTFiMjM1MzRmY2FmYiQzNWEzMDEzZDU0ZTg0MTgxOTczNjdmOWU5OWM4NjY1Ng==' },
            auth: { apiKey:  'S01vQlZZWUJDdmNRXzhlSmk4eDM6dDc5OFpLaWlUSmluNEU4d3MyZW5ldw==' },
        });
    }

    async createIndex(index, indexProperties) {
        // const index = elasticSearch.migrationIndex;
        console.log(`checking for index ${index}`);
        const checkIndex = await this.esService.indices.exists({ index });
        if (!checkIndex) {
            console.log(`creating index ${index}`);
            this.esService.indices.create({
                index,
                body: {
                    mappings: {
                        properties: indexProperties,
                    },
                    settings: {
                        analysis: {
                            filter: {
                                autocomplete_filter: {
                                    type: 'edge_ngram',
                                    min_gram: 1,
                                    max_gram: 20,
                                },
                            },
                            analyzer: {
                                autocomplete: {
                                    type: 'custom',
                                    // tslint:disable-next-line
                                    tokenizer: 'standard',
                                    filter: ['lowercase', 'autocomplete_filter'],
                                },
                            },
                        },
                    },
                },
            });
            console.log('Index created!');
        }
    }

    async indexMigration(migration) {
        return this.esService.index({
            index: this.configService.get('ELASTICSEARCH_INDEX'),
            body: migration,
        });
    }

    async add(document) {
        return this.esService.index({
            index: document.header.TENANT,
            document,
        });
    }

    async remove(migrationId) {
        this.esService.deleteByQuery({
            index: this.configService.get('ELASTICSEARCH_INDEX'),
            body: {
                query: {
                    match: {
                        id: migrationId,
                    },
                },
            },
        });
    }

    async findAll() {
        const index = this.configService.get('ELASTICSEARCH_INDEX');
        this.logger.log(`Searching all items in the index: ${index}`);
        const results = new Set();
        const total = await this.esService
            .search({
                index,
                body: {
                    size: 50,
                },
            })
            .then((response) => {
                response.hits.hits.forEach((item) => {
                    // eslint-disable-next-line no-underscore-dangle
                    results.add(item._source);
                });
                return response.hits.total;
            })
            .catch((err) => {
                this.logger.error(err);
            });

        return { results: Array.from(results), total };
    }

    async search(search) {
        const results = new Set();
        const response = await this.esService.search({
            index: this.configService.get('ELASTICSEARCH_INDEX'),
            body: {
                size: 50,
                query: {
                    match_phrase: search,
                },
            },
        });
        const { hits } = response.hits;
        hits.forEach((item) => {
            // eslint-disable-next-line no-underscore-dangle
            results.add(item._source);
        });

        return { results: Array.from(results), total: response.hits.total };
    }

    async bulkInsert(data) {
        return this.esService.bulk(data);
    }

    async countItems(data) {
        return this.esService.count({ index: data });
    }
    /** Deleting random existing indexes **/
    async deleteIndex(indexName) {
        return this.esService.indices.delete({
            index: indexName
        })
    }
    async initIndex(indexName) {
        return this.esService.indices.create({
            index: indexName
        })
    }
    async isIndexExist(indexName) {
        return this.esService.indices.exists({
            index: indexName
        })
    }
    /** Mapping data to be stored in elastic search**/
async initMapping(indexName) {
    return this.esService.indices.putMapping({
        index: indexName,
        type: "document",
        includeTypeName: true,
        body: {
            properties: {
                title: { type: 'text' },
                content: { type: 'text' },
                suggest: {
                    type: 'completion',
                    analyzer: 'simple',
                    search_analyzer: 'simple'
                }
            }
        }
    })
}
/** Function to add coument to index**/
async addDocumentToIndex(indexName,doc) {
    return this.esService.index({
        index: indexName,
        type: 'document',
        body: {
            title: doc.title,
            content: doc.content,
            suggest: {
                input: doc.title.split(' ')
            },
            output: doc.title
        }
    })
}


/** Function to get suggestd documents**/
async getsuggestedDocs(indexName,input) {
    return this.esService.search({
        index: indexName,
        type: 'document',
        body: {
            query: {
                match: {
                    title: {
                        query: input,
                        fuzziness: "AUTO"
                    }
                }
            }
        }
    })
}
async getData(query,page,limit,range){
    console.log(limit)
    console.log(page)
    console.log(range)
    return this.esService.search({
        index: "tenant_2",
        track_total_hits: true,
        from: Number(page>0?page*10:0),
        size: Number(limit),
        sort: [
            {"body.INVOICE_DATE":{"order": "asc"}},
        ],
        query:{
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
                  ],
                  must_not: [
                    { "match_phrase": { "body.PART_NUMBER": "" }}
                  ]
            },
        },
        _source: ["body.PRIMARY_CUSTOMER","body.MANUFACTURER","body.PART_NUMBER","body.SALES_AMOUNT","body.INVOICE_DATE"]
    })
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



