<script src="../../dist/blapy2.js"></script>
<script>

  document.addEventListener('DOMContentLoaded', () => {
    document
      .querySelectorAll('#myBlapyApp1,#myBlapyApp2,#myBlapyApp3')
      .forEach(el => el.Blapy())

    document
      .querySelectorAll('#myBlapyApp1,#myBlapyApp2,#myBlapyApp3').forEach((el) => {
      el.addEventListener('Blapy_ErrorOnPageChange', (event, error) => {
        console.error('An error is occured ' + error)
      })
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