problem:

in page /evaluation-analysis
the list try to show the '问题标题' which is not corresponded to the response  

request:

```txt
GET /api/v1/evaluation-analysis?page=0&size=20&sortBy=id&sortDir=desc
```

response:

```json
{
    "success": true,
    "data": {
        "content": [
            {
                "id": 1,
                "evaluationResultId": 7,
                "analysisTagId": 1,
                "score": 10,
                "createdAt": "2025-06-15T04:15:28",
                "analysisModel": "gpt-4",
                "evaluationModel": "thesumst-114514",
                "standardQuestionId": 1,
                "standardQuestionContent": "Analyze the security implications and effectiveness of using SSH on port 443 for bypassing traffic shaping. Discuss the potential risks and better alternatives."
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
        "totalPages": 1,
        "totalElements": 1,
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

## Root Cause Analysis

The problem was caused by a field name mismatch between the frontend component and the backend API response:

- **Frontend Expected Field**: `standardQuestionTitle`
- **Backend Actual Field**: `standardQuestionContent`

This resulted in the question title column showing empty/undefined values in the `/evaluation-analysis` page.

## Solution Applied

### Changes Made to `EvaluationAnalysisList.vue`:

1. **Table Column Fix**:
   ```vue
   <!-- Before -->
   <el-table-column prop="standardQuestionTitle" label="问题标题" min-width="200" show-overflow-tooltip />
   
   <!-- After -->
   <el-table-column prop="standardQuestionContent" label="问题内容" min-width="200" show-overflow-tooltip />
   ```

2. **Detail Dialog Fix**:
   ```vue
   <!-- Before -->
   <el-descriptions-item label="问题标题" :span="2">
     {{ selectedAnalysisResult.standardQuestionTitle }}
   </el-descriptions-item>
   
   <!-- After -->
   <el-descriptions-item label="问题内容" :span="2">
     {{ selectedAnalysisResult.standardQuestionContent }}
   </el-descriptions-item>
   ```

### Additional Improvements:

- **Label Update**: Changed label from "问题标题" (Question Title) to "问题内容" (Question Content) to better reflect the actual data being displayed
- **Consistency**: Ensured both the table column and detail dialog use the same field name and labeling

## Result

✅ **Fixed**: The question content now displays correctly in both the table and detail dialog  
✅ **Improved**: More accurate labeling reflects the actual content being shown  
✅ **Consistent**: Field names match the backend API response structure  

## Testing

After the fix:
1. The `/evaluation-analysis` page properly displays question content in the table
2. The detail dialog shows the complete question content
3. No more empty/undefined values in the question content column

This fix resolves the presentation issue and improves the user experience by showing meaningful question content instead of empty cells.
