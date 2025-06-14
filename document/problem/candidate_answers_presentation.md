problem:  

request for candidate answers successfully, but no answers are presented on the page /candidate-answers  

request:

```txt
GET http://localhost:8080/api/v1/candidate-answers?page=0&size=20&type=SUBJECTIVE&status=PENDING
```

response:

```json
{
    "success": true,
    "data": {
        "content": [
            {
                "id": 31,
                "stdQuestionId": 5,
                "type": "SUBJECTIVE",
                "status": "PENDING",
                "objAnswer": null,
                "subAnswer": "\"Security-focused OpenID provider design: **Threat Model**: Protect against token theft",
                "createdAt": "2025-06-14T14:58:44.722252",
                "questionContent": "Design and explain the architecture for setting up a secure OpenID provider on Ubuntu. Include security considerations and implementation steps.",
                "questionTitle": "Standard Question 5",
                "notes": "replay attacks"
            },
            // ... other answers
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
        "last": false,
        "totalPages": 2,
        "totalElements": 27,
        "size": 20,
        "number": 0,
        "sort": {
            "empty": false,
            "sorted": true,
            "unsorted": false
        },
        "first": true,
        "numberOfElements": 20,
        "empty": false
    },
    "message": null
}
```