problem:

Standard Answers Presentation has problems  

thought asking for standard answers and getting the response successfully, but no answers are presented on the page /std-answers

request:

```txt
GET http://localhost:8080/api/v1/std-answers?page=0&size=20&type=SUBJECTIVE
```

response: 200 OK

```json
{
    "success": true,
    "data": {
        "content": [
            {
                "id": 1,
                "stdQuestionId": 5,
                "type": "SUBJECTIVE",
                "score": 6,
                "status": "ACCEPTED",
                "createdAt": "2025-06-14T16:46:58",
                "selectedFromCandidateId": 43,
                "notes": null,
                "objAnswer": null,
                "subAnswer": "Complex answer with commas, quotes \"within quotes\", and various punctuation marks!",
                "standardQuestion": {
                    "id": 5,
                    "originalRawQuestionId": 25,
                    "type": "SUBJECTIVE",
                    "content": "Design and explain the architecture for setting up a secure OpenID provider on Ubuntu. Include security considerations and implementation steps.",
                    "status": "WAITING_ANSWERS",
                    "createdAt": "2025-06-05T13:22:14",
                    "versions": [
                        {
                            "version": "v1.0",
                            "createdAt": "2025-06-05T13:13:00.168876",
                            "questionCount": null
                        }
                    ],
                    "tags": [
                        {
                            "tag": "Ubuntu",
                            "questionCount": null
                        },
                        {
                            "tag": "Security",
                            "questionCount": null
                        },
                        {
                            "tag": "OpenID",
                            "questionCount": null
                        },
                        {
                            "tag": "Authentication",
                            "questionCount": null
                        }
                    ],
                    "originalRawQuestion": {
                        "id": 25,
                        "title": "How do you set up an OpenID provider (server) in Ubuntu?",
                        "content": "I want to log onto Stack Overflow using OpenID, but I thought I'd set up my own OpenID provider, just because it's harder :) How do you do this in Ubuntu? Edit: Replacing 'server' with the correct term OpenID provider (Identity provider would also be correct according to wikipedia).",
                        "sourcePlatform": "stackoverflow",
                        "tags": "linux,ubuntu,openid",
                        "postId": 28588,
                        "score": 15,
                        "status": "CONVERTED"
                    }
                },
                "sourceCandidateAnswer": null
            }
        ],
        "pageable": {
            "pageNumber": 0,
            "pageSize": 20,
            "sort": {
                "empty": false,
                "unsorted": false,
                "sorted": true
            },
            "offset": 0,
            "unpaged": false,
            "paged": true
        },
        "last": true,
        "totalElements": 1,
        "totalPages": 1,
        "size": 20,
        "number": 0,
        "sort": {
            "empty": false,
            "unsorted": false,
            "sorted": true
        },
        "first": true,
        "numberOfElements": 1,
        "empty": false
    },
    "message": null
}
```
