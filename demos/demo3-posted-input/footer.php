<script type="module">
	import Blapy2 from '../../src/index.js';

	document.addEventListener("DOMContentLoaded", () => {
		document
			.querySelectorAll('#myBlapy')
			.forEach(el => el.Blapy({
				LogLevelIfsm: 3,
				debugIfsm: false
			}));

		document
			.querySelectorAll('#myBlapy').forEach((el) => {
				el.addEventListener("Blapy_ErrorOnPageChange", (event, error) => {
					console.error("An error is occured " + error)
				})

			})
	});

	$("body").append('<h3>HTML code of the page</h3>').append(jQuery('<pre />').text($('html').html()));


</script>


</html>
