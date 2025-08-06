# Blapy V2 - JSON Append Example

[Blapy V2 JSON Append Example](https://github.com/intersel/blapy2/tree/main/demos/json-append-example) is a demonstration of the new `json-append` functionality in Blapy V2. This example shows how to create a dynamic task list that appends new items without replacing existing content, with configurable append strategies and item limits.

## Features

This example demonstrates:
- **JSON Append functionality**: Add new items to existing JSON data
- **Append strategies**: Configure how new items are added (start, end, unique)
- **Item limits**: Automatically maintain maximum number of items
- **Mustache templating**: Dynamic HTML generation from JSON data
- **Real-time updates**: Interactive task management with live timestamps

## File structure

[Blapy V2 JSON Append Example](https://github.com/intersel/blapy2/tree/main/demos/json-append-example) uses the following file structure:

-------------

```
json-append-example/
    index.html                  # Main demo file
    ../../lib/
        jquery/
            jquery-3.7.1.min.js
        mustache/
            mustache.js
        navigo/
            index.js
        iFSM/
            extlib/
                jquery.attrchange.js
                jquery.dotimeout.js
            iFSM.js
        json5/
            index.min.js
        json2html/
            json2html.js
    ../../src/
        index.js                # Blapy V2 main module
```

## Key Blapy V2 attributes demonstrated

- `data-blapy-update="json-append"` - Enables JSON append mode
- `data-blapy-json-append-strategy="start"` - New items appear at the top
- `data-blapy-json-max-items="10"` - Limits list to 10 items maximum
- `data-blapy-container-tpl` - Mustache template definition

## Code highlights

### Task list container with JSON append
```html
<div
  class="task-list"
  data-blapy-container="true"
  data-blapy-container-name="tasks"
  data-blapy-update="json-append"
  data-blapy-json-append-strategy="start"
  data-blapy-json-max-items="10"
>
```

### Mustache template for tasks
```html
<xmp data-blapy-container-tpl="true" style="display: none">
  {{#.}}
  <div class="task">
    <div class="task-title">{{title}}</div>
    <div class="task-time">Added at {{time}}</div>
  </div>
  {{/.}}
  {{^.}}
  <div class="empty-state">No tasks for now</div>
  {{/.}}
</xmp>
```

### Adding new tasks via Blapy V2 API
```javascript
blapy.myFSM.trigger('updateBlock', {
  html: JSON.stringify({
    'blapy-container-name': 'tasks',
    'blapy-container-content': 'new-task',
    'blapy-data': newTask,
  }),
  params: {
    blapyobjectid: 'myBlapy',
    blapyaction: 'update',
  },
})
```

### Listening to JSON append events
```javascript
document
  .querySelector('.task-list')
  .addEventListener('Blapy_jsonAppended', (event) => {
    console.log('🎉 JSON Append done!', event.detail)
  })
```

## How to run

1. Open `index.html` in a web browser
2. Click "➕ Add a task" to add single tasks
3. Click "➕➕ Add 3 tasks" to add multiple tasks at once
4. Click "🗑️ Reset with 10 new tasks" to clear and reload the list

## Browser requirements

- Modern browser with ES6 module support
- JavaScript enabled
- Local file system access (for running locally)

---

[Blapy V2 JSON Append Example](https://github.com/intersel/blapy2/tree/main/demos/json-append-example) was created to demonstrate the new JSON append capabilities in Blapy V2. Part of the [Blapy V2](https://github.com/intersel/blapy2) framework by [Intersel](http://www.intersel.fr). Copyright 2025 Intersel.