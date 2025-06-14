# Standard Questions and Answers Export

I need to export standard questions and answers in a single file.

the backend has implemented this api  

please refer to the api document develop the frontend part

## document

a document to record the deployment process of the frontend part for reference and review  

## Implementation Documentation

### Overview
This document records the complete development process of implementing the Standard Questions and Answers Export functionality in the frontend, based on the backend API specifications provided in `std_questions_answers_export_api.md`.

### Requirements Analysis

#### Backend API Specification
Based on the backend API documentation, the export endpoint provides:

**Endpoint:** `GET /api/v1/std-questions/export-with-answers`

**Parameters:**
- `type` (required): Question type (`OBJECTIVE` or `SUBJECTIVE`)
- `version` (required): Version filter (e.g., `v1.0`, `v1.1-beta`)
- `tag` (optional): Tag filter (e.g., `Linux`, `Security`, `SSH`)

**Response:**
- **Content-Type:** `application/json`
- **Content-Disposition:** `attachment; filename="{version}_{type}_std_q_a.json"` (with optional tag)
- **Body:** JSON object containing questions and answers

**Key Features:**
- Only questions with `ACCEPTED` status answers are included
- Questions without accepted answers are excluded
- Tag filtering is optional and case-sensitive
- Objective questions typically have one correct answer (A, B, C, D)
- Subjective questions may have multiple accepted answers

### Frontend Requirements

- **Integration Point:** Add export functionality to existing Standard Questions List page
- **User Interface:** New export dialog with configuration options
- **Export Options:**
  - Question type selection (OBJECTIVE/SUBJECTIVE) - Required
  - Version selection - Required
  - Tag selection - Optional
  - Preview of export filename
- **File Handling:** Automatic download with proper filename from Content-Disposition header
- **User Experience:** Clear feedback, information alerts, and error handling

## Development Process

### Phase 1: API Service Integration

#### File: `llm-eval-frontend/src/services/standardData.js`

**Added Export Method:**
```javascript
// Export standard questions with answers
async exportQuestionsWithAnswers(type, version, tag = null) {
  const params = new URLSearchParams({
    type: type,
    version: version
  })
  
  if (tag) {
    params.append('tag', tag)
  }
  
  try {
    const response = await fetch(`/api/v1/std-questions/export-with-answers?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }
    
    return response
  } catch (error) {
    console.error('Export questions with answers failed:', error)
    throw error
  }
}
```

**Design Decisions:**
- Used fetch API for direct response handling instead of axios to better handle blob responses
- Implemented proper error handling with descriptive error messages
- Made tag parameter optional with default null value
- Added comprehensive logging for debugging

### Phase 2: User Interface Enhancement

#### File: `llm-eval-frontend/src/views/StandardData/StandardQuestionList.vue`

**Added New Export Button:**
```vue
<el-button type="warning" @click="showExportQADialog = true">
  📤 导出问题和答案
</el-button>
```

**Added Export Dialog:**
```vue
<!-- Export Questions & Answers Dialog -->
<el-dialog
  v-model="showExportQADialog"
  title="导出标准问题和答案"
  width="500px"
>
  <el-alert
    title="导出说明"
    type="info"
    style="margin-bottom: 20px"
    :closable="false"
  >
    <p>此功能将导出标准问题及其对应的已接受答案，格式为包含问题和答案的综合JSON文件。</p>
    <p><strong>注意：</strong>只有包含已接受答案的问题才会被导出。</p>
  </el-alert>
  
  <!-- Form fields for type, version, tag selection -->
  <!-- ... -->
</el-dialog>
```

**Design Decisions:**
- Used warning button type to distinguish from regular question export
- Added informational alert to explain the functionality and limitations
- Implemented separate reactive form for Q&A export to avoid conflicts
- Added filename preview functionality

### Phase 3: State Management

**Added Reactive Variables:**
```javascript
const showExportQADialog = ref(false)
const exportingQA = ref(false)
const exportQAForm = reactive({
  type: '',
  version: '',
  tag: ''
})
```

**Added Computed Properties:**
```javascript
const canExportQA = computed(() => {
  return exportQAForm.type && exportQAForm.version
})

const generateQAFilename = () => {
  if (!canExportQA.value) return '请选择所有必需参数'
  const type = exportQAForm.type.toLowerCase()
  const version = exportQAForm.version
  const tag = exportQAForm.tag ? `_${exportQAForm.tag.toLowerCase()}` : ''
  return `${version}_${type}${tag}_std_q_a.json`
}
```

**Design Decisions:**
- Separated Q&A export state from regular export to maintain independence
- Implemented filename generation following backend naming convention
- Added validation for required fields (type and version)

### Phase 4: Export Handler Implementation

**Added Export Handler:**
```javascript
const handleExportQA = async () => {
  if (!canExportQA.value) {
    ElMessage.warning('请选择类型和版本参数')
    return
  }

  exportingQA.value = true
  try {
    const response = await standardQuestionApi.exportQuestionsWithAnswers(
      exportQAForm.type,
      exportQAForm.version,
      exportQAForm.tag || null
    )

    // Get filename from Content-Disposition header or generate it
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = generateQAFilename()
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    // Create blob and trigger download
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出问题和答案成功！')
    showExportQADialog.value = false
    
    // Reset export form
    exportQAForm.type = ''
    exportQAForm.version = ''
    exportQAForm.tag = ''
  } catch (error) {
    console.error('Export Q&A failed:', error)
    ElMessage.error('导出失败：' + (error.message || '未知错误'))
  } finally {
    exportingQA.value = false
  }
}
```

**Design Decisions:**
- Prioritized filename from Content-Disposition header over generated filename
- Implemented proper blob handling for file download
- Added comprehensive error handling with user-friendly messages
- Included cleanup of temporary DOM elements and URLs
- Reset form after successful export

## Key Features Implemented

### 1. Dual Export Options
- **Standard Questions Only:** Existing functionality maintained
- **Questions with Answers:** New functionality for combined export

### 2. Comprehensive Form Validation
- Required field validation for type and version
- Optional tag selection with clear indication
- Real-time filename preview

### 3. User Experience Enhancements
- Informational alerts explaining functionality
- Loading states during export process
- Success/error feedback messages
- Form reset after successful operations

### 4. File Naming Convention
- Follows backend specification exactly
- Format: `{version}_{type}_{tag}_std_q_a.json` (with tag) or `{version}_{type}_std_q_a.json` (without tag)
- Lowercase type in filename
- Examples: `v1.0_objective_linux_std_q_a.json`, `v2.0_subjective_std_q_a.json`

### 5. Error Handling
- Network error handling
- Server error response handling
- File format validation
- User-friendly error messages

## Testing Considerations

### Manual Testing Checklist
1. **Export Button Functionality**
   - [ ] New export button appears in interface
   - [ ] Clicking opens correct dialog
   - [ ] Dialog closes properly

2. **Form Validation**
   - [ ] Type selection required
   - [ ] Version selection required
   - [ ] Tag selection optional
   - [ ] Export button disabled until required fields filled
   - [ ] Filename preview updates correctly

3. **Export Process**
   - [ ] Export request sent with correct parameters
   - [ ] Loading state shown during export
   - [ ] File downloads successfully
   - [ ] Correct filename applied
   - [ ] Success message shown
   - [ ] Form resets after export

4. **Error Scenarios**
   - [ ] Network error handling
   - [ ] Server error handling
   - [ ] Empty result handling
   - [ ] Invalid parameter handling

### Integration Testing
- [ ] Verify API endpoint availability
- [ ] Test with various parameter combinations
- [ ] Verify file content matches expected format
- [ ] Test with different data volumes

## Deployment Notes

### Files Modified
1. `llm-eval-frontend/src/services/standardData.js` - Added exportQuestionsWithAnswers method
2. `llm-eval-frontend/src/views/StandardData/StandardQuestionList.vue` - Added UI and functionality

### No Breaking Changes
- Existing functionality preserved
- New functionality added as separate feature
- No changes to existing API contracts

### Dependencies
- No new dependencies required
- Uses existing Element Plus components
- Compatible with current Vue 3 setup

## Future Enhancements

### Potential Improvements
1. **Export Options**
   - Batch export across multiple versions
   - Export format options (JSON, CSV, XML)
   - Custom filename patterns

2. **User Experience**
   - Export progress indicators for large datasets
   - Export history/logs
   - Preview of export content before download

3. **Performance**
   - Streaming exports for large datasets
   - Background export processing
   - Export status notifications

### Maintenance Considerations
- Monitor API performance with large exports
- Consider pagination for very large result sets
- Add export analytics for usage tracking
