problem:

in the page /evaluation-tags  

id attribute is not presented correctly  

request:

```txt
GET http://localhost:8080/api/v1/evaluation-tags
```

response: 200 OK

```json
{
    "success": true,
    "data": {
        "content": [
            {
                "tagId": 1,
                "dataSetVersion": "v1.0",
                "evaluationTime": 1,
                "model": "thesumst-114514",
                "createdAt": "2025-06-15T07:03:03",
                "resultCount": 0,
                "versionName": null
            }
        ],
        "pageable": {
            "pageNumber": 0,
            "pageSize": 20,
            "sort": {
                "empty": false,
                "sorted": true,
                "unsorted": false
            },
            "offset": 0,
            "paged": true,
            "unpaged": false
        },
        "last": true,
        "totalElements": 1,
        "totalPages": 1,
        "size": 20,
        "number": 0,
        "sort": {
            "empty": false,
            "sorted": true,
            "unsorted": false
        },
        "first": true,
        "numberOfElements": 1,
        "empty": false
    },
    "message": null
}
```