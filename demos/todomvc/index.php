<!doctype html>
<html lang="en" data-framework="javascript">

<head>

  <meta charset="utf-8">
  <base href="<?php echo dirname("//$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI])") . '/' ?>">
  <title>Blapy • TodoMVC</title>

  <link rel="stylesheet" href="node_modules/todomvc-common/base.css">
  <link rel="stylesheet" href="node_modules/todomvc-app-css/index.css">

  <!-- Blapy2 modern build: mustache/navigo/json5/json2html are bundled in, no jQuery needed -->

</head>

<body>
<section class="todoapp" id="myBlapy">
  <header class="header">
    <h1>todos</h1>
    <input class="new-todo" placeholder="What needs to be done?" autofocus
           onkeypress="if (event.keyCode==13) { document.getElementById('myBlapy').Blapy().myFSM.trigger('postData',{aUrl:'php/addAction.php',params:{actionName:this.value}}); this.value=''}">
  </header>
  <section class="main">
    <input id="selectAllToggle" class="toggle-all" type="checkbox" data-blapy-container="true"
           data-blapy-container-name="selectAllToggle" data-blapy-container-content="selectAllToggle-Off"
           onclick="document.getElementById('myBlapy').Blapy().myFSM.trigger('postData',{aUrl:'php/allCompleted.php',params:{toggleStatus:this.checked}})">
    <label for="toggle-all">Mark all as complete</label>
    <ul class="todo-list" id="todo-list" data-blapy-container="true" data-blapy-container-name="todo-list"
        data-blapy-container-content="todo-list-void"></ul>
  </section>
  <footer class="footer">
			<span class="todo-count"><strong><span id="numberOfItems" data-blapy-container="true"
                                             data-blapy-container-name="numberOfItems"
                                             data-blapy-container-content="numberOfItems-void">0</span></strong> items left</span>
    <ul id="filters-All" class="filters" data-blapy-container="true" data-blapy-container-name="filters"
        data-blapy-container-content="filters-All">
      <li>
        <a href="php/getAll.php" data-blapy-link class="selected">All</a>
      </li>
      <li>
        <a href="php/getActive.php" data-blapy-link>Active</a>
      </li>
      <li>
        <a href="php/getCompleted.php" data-blapy-link>Completed</a>
      </li>
    </ul>
    <button id="showClear" class="clear-completed" data-blapy-container="true"
            data-blapy-container-name="showClear" data-blapy-container-content="showClear-False"
            style="display:none">Clear completed
    </button>

  </footer>
</section>
<footer class="info">
  <p>Double-click to edit a todo</p>
  <p>Reload the whole page (with F5) will reset the todo list completly</p>
  <p>Created by <a href="https://github.com/intersel">Emmanuel Podvin</a></p>
  <p>Still not part of... <a href="http://todomvc.com">TodoMVC</a> but completly inspired from it!</p>
</footer>


<script src="../../dist/blapy.umd.js"></script>
<script>

  document.addEventListener('DOMContentLoaded', () => {
    let myBlapy = document.querySelector('#myBlapy')
    myBlapy.Blapy({ enableRouter: true, debug: true })

    myBlapy.Blapy().myFSM.trigger('postData', { aUrl: 'php/resetActions.php' })

    var oriVal
    document.addEventListener('dblclick', function(e) {
      const label = e.target.closest('#todo-list label')
      if (!label) return
      oriVal = label.textContent
      label.textContent = ''
      const input = document.createElement('input')
      input.type = 'text'
      input.style.fontSize = '22px'
      label.appendChild(input)
      input.value = oriVal
      input.focus()
    })
    document.addEventListener('keypress', function(e) {
      const input = e.target.closest('#todo-list label > input')
      if (!input) return
      if (e.which == 13) {
        e.preventDefault()
        input.blur() // fires focusout below
      }
    })

    document.addEventListener('focusout', function(e) {
      const input = e.target.closest('#todo-list label > input')
      if (!input) return
      const newText = input.value || oriVal
      const label = input.parentElement
      const actionId = label.getAttribute('data-id')
      label.textContent = newText
      document.getElementById('myBlapy').Blapy().myFSM.trigger('postData', {
        aUrl: 'php/editAction.php',
        params: { actionName: newText, actionId: actionId },
      })
      input.remove() // Don't just hide, remove the element.
    })
  })

  //
  //   //catch errors
  //   $('#myBlapy').on('Blapy_ErrorOnPageChange', function(event, anError) {
  //     alert('Blapy error: ' + anError)
  //   })
  //

  //
  // })


</script>

</body>

</html>