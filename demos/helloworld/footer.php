</div>
</div>
</article>
</div>
<div style="font-size:80%">
  <a href="index.php">normal "Hello World" Link</a>
  - <a href="helloworld_2.php">normal "How is it going" Link</a><br>
  <a href="helloworld_3.php">normal "Load from an optimized code" Link</a>
  - <a href="helloworld_4.php">normal "Load with a blapy link" Link</a><br>
</div>
</body>

<script src="../../dist/blapy2.js"></script>
<script>

  document.addEventListener('DOMContentLoaded', () => {
    const blapyContainer = document.querySelector('#myBlapy')
    const mainContainer = document.querySelector('#mainContainer')

    blapyContainer.Blapy({
      enableRouter: true,
      debug: true,
    })

    blapyContainer.addEventListener('Blapy_ErrorOnPageChange', (event, error) => {
      console.error(error)
    })

    mainContainer.addEventListener("Blapy_doCustomChange", () => {
      console.log("tt")
    })

    mainContainer.addEventListener("Blapy_beforeContentChange", () => {
      //alert( 'Blapy_beforeContentChange' +$(this).html() );
    })

    mainContainer.addEventListener("Blapy_doCustomChange", (e, container) => {
      // 		  $("#mainContainer").animate({opacity:0},{duration:200, complete	: function(){
      // 			  $(aBlapyContainer).css({opacity:0});
      // 			  $("#mainContainer").replaceWith(aBlapyContainer);//replace content with the new one
      // 			  $("#mainContainer").animate({opacity:1},{duration:200});
      // 		  }});
    })


  })

  const h3 = document.createElement('h3')
h3.textContent = 'HTML code of the page'

const pre = document.createElement('pre')
pre.textContent = document.documentElement.outerHTML

document.body.appendChild(h3)
document.body.appendChild(pre)
</script>

</html>
