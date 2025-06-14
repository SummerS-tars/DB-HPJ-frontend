requestion:

```txt
GET 
http://localhost:8080/api/v1/candidate-answers/import?type=SUBJECTIVE
```

response:

```json
{
    "success": true,
    "data": {
        "message": "候选答案导入完成",
        "importedCount": 9,
        "failedCount": 0,
        "errors": []
    },
    "message": null
}
```

problem:

the feedback is "导入成功"，but the top popping information is "导入完成！成功导入 undefined 条记录"
