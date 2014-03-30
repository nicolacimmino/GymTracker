
/*
 * Process a message posted by some other thread.
 */
self.onmessage = function(e) 
{
	xmlhttp=new XMLHttpRequest();
	xmlhttp.open("GET","/GymTracker/transactions?transactions=" + e.data, /*async=*/false);
	xmlhttp.send();
	if(xmlhttp.status == 200)
	{
		postMessage(e.data);
	}
};

