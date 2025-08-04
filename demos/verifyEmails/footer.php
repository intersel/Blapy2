<script src="../../dist/blapy2.js"></script>
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
		//get our next email to check
		emailPos++;
		emailToGet=$("#results tr:nth-child("+emailPos+") td:first-child").html();
		$("#results tr:nth-child("+emailPos+") td:nth-child(2)").html("wait...");
		if (!emailToGet) 
		{
			emailPos=0;
			return;
		}

		//call blapy with the result stored in #oneresult block
		$( "#myBlapy" ).trigger('loadUrl',{aUrl:'verifyEmail.php?email='+emailToGet,params:{embeddingBlockId:'oneresult'}});
	}

	//activate the next search when last has been done
	$(document).on('Blapy_afterContentChange','#oneresult', function(event,aBlock) {

		if (emailPos == 0) return; 
		//update the general result table
		$("#results tr:nth-child("+emailPos+") td:nth-child(2)").html($('#oneresult td:nth-child(2)').html());
		$("#results tr:nth-child("+emailPos+") td:nth-child(3)").html($('#oneresult td:nth-child(3)').html());
		
		//call for the next test
		oneTesting(); 
	});

  const h3 = document.createElement('h3')
  h3.textContent = 'HTML code of the page'

  const pre = document.createElement('pre')
  pre.textContent = document.documentElement.outerHTML

  document.body.appendChild(h3)
  document.body.appendChild(pre)
</script>


