<script src="../../dist/blapy.umd.js"></script>
<script>

  document.addEventListener("DOMContentLoaded", () => {

    let myBlapy = document.querySelector("#myBlapy");

    myBlapy.Blapy();

    myBlapy.addEventListener("Blapy_ErrorOnPageChange", function(e, error) {
      alert(error);
    })
  })

	//do the testing from a URL...
	var emailPos=0;
	function oneTesting()
	{
		console.log(emailPos)
		emailPos++;
		emailToGet=document.querySelector("#results tr:nth-child("+emailPos+") td:first-child")?.innerHTML;
		if (!emailToGet)
		{
			emailPos=0;
			return;
		}
		document.querySelector("#results tr:nth-child("+emailPos+") td:nth-child(2)").innerHTML="wait...";

		document.querySelector("#myBlapy").Blapy().myFSM.trigger('loadUrl',{aUrl:'verifyEmail.php?email='+emailToGet,params:{embeddingBlockId:'oneresult'}});
	}

	document.querySelector("#oneresult").addEventListener('Blapy_afterContentChange', function(event,aBlock) {
		console.log(event)
		if (emailPos == 0) return;
		document.querySelector("#results tr:nth-child("+emailPos+") td:nth-child(2)").innerHTML=document.querySelector('#oneresult td:nth-child(2)').innerHTML;
		document.querySelector("#results tr:nth-child("+emailPos+") td:nth-child(3)").innerHTML=document.querySelector('#oneresult td:nth-child(3)').innerHTML;
		
		oneTesting(); 
	});

  const h3 = document.createElement('h3')
  h3.textContent = 'HTML code of the page'

  const pre = document.createElement('pre')
  pre.textContent = document.documentElement.outerHTML

  document.body.appendChild(h3)
  document.body.appendChild(pre)
</script>


