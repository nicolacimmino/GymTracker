    window.addEventListener('load', function(e) { syncTransactions(); updateTimer(); }, false);	

	/* 
	 * Start a new workout session
	 */
	function startSession()
	{
		localStorage['startTime'] = new Date().getTime() / 1000;
		document.getElementById("stop_button").style.display = 'block';
		document.getElementById("start_button").style.display = 'none';
		
		queueTransaction("session_start;0;" + getCurrentTimeAsTimestamp());
		
		// Reset all workout selection buttons to default color
		$('.workout_selection_button').each(function(i, obj) {
			$(this).css('background-color','');
		});
		
		// Show body part selection buttons
		$('.body_part_selector_button').each(function(i, obj) {
			$(this).css('display','block');
		});
		$("#session_timer").css('display','block');
	}
	
	/*
	 * Stop the currently running workout session
	 */
	function stopSession()
	{
		if(confirm("Press OK to stop the session."))
		{
			localStorage['startTime'] = 0;
			document.getElementById("stop_button").style.display = 'none';
			document.getElementById("start_button").style.display = 'block';
					
			// Hide body part selection buttons
			$('.body_part_selector_button').each(function(i, obj) {
				$(this).css('display','none');
			});
			$("#session_timer").css('display','none');
		
			queueTransaction("session_stop;0;" + getCurrentTimeAsTimestamp());
		}
	}
	
	/*
	 * Update the onscreen workout timer
	 */
	function updateTimer()
	{
		if(localStorage['startTime'] != 0 && localStorage['startTime'] != null)
		{
			$("#session_timer").html(secondsToHms((new Date().getTime() / 1000) - localStorage['startTime']));
			document.getElementById("stop_button").style.display = 'block';
    		document.getElementById("start_button").style.display = 'none';
			
			// Show body part selection buttons (in case we are reloaded and session was running)
			$('.body_part_selector_button').each(function(i, obj) {
				$(this).css('display','block');
			});
			$("#session_timer").css('display','block');
		}
		else
		{
			$("#session_timer").html("0:00");
		}
		setTimeout("updateTimer()",1000);
	}
	
	/*
	 * Convert amount of seconds to a string hh:mm:ss
	 */
	function secondsToHms(d) 
	{
		d = Number(d);
		var h = Math.floor(d / 3600);
		var m = Math.floor(d % 3600 / 60);
		var s = Math.floor(d % 3600 % 60);
		return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s); 
	}

	/*
	 * Show a div with a specified ID, hide the one
	 *	that was shown before.
	 */
    var divToHide = null;
	function ShowDiv(id) 
	{
		if(divToHide)
		{
			divToHide.style.display = 'none';
		}
		else
		{
			document.getElementById('body_part_selector').style.display = 'none';
		}
		document.getElementById(id).style.display = 'block';
		divToHide = document.getElementById(id);
	}

	/*
	 * Background worker responsible to keep workout data
	 *	in sync with server.
	 */
	var syncWorker = null; 
	
	/*
	 * Add a workount to the list of workouts done and push it to server.
	 */
	function addWorkoutDone(workoutid)
	{
		// Get current timestamp. This is local browser time but at least we can keep
		//	timestamp consistent if the network is not available and we will end up
		//	pushing stuff out later.
		var timestamp = getCurrentTimeAsTimestamp();
		
		queueTransaction("done;" + workoutid + ";" + timestamp);
	}

	// Get the current time as a SQL timestamp "YYYY-MM-DD hh::mm:ss"
	function getCurrentTimeAsTimestamp()
	{
		var currentTime = new Date()
		var timestamp = currentTime.getFullYear() + "-" + (currentTime.getMonth() + 1) 
							+ "-" + currentTime.getDate() + " " + currentTime.getHours()
							+ ":" + ((currentTime.getMinutes()<10?'0':'') + currentTime.getMinutes())
							+ ":" + ((currentTime.getSeconds()<10?'0':'') + currentTime.getSeconds());  

		return timestamp;
	}
	
	/*
	 * Add a transaction to the queue of transactions to process
	 */
	function addWorkoutWeightChange(workoutid)
	{
		queueTransaction("wchange;" + workoutid + ";" + $("#label_weight_" + workoutid).text());
		
		document.getElementById("button_ok_"+ workoutid).style.display = 'none';
		document.getElementById("button_cancel_"+ workoutid).style.display = 'none';
		document.getElementById("button_done_"+ workoutid).style.display = 'block';

	}

	/*
     * Queues one transation to the current queue.
	 */
	function queueTransaction(transaction)
	{
		$("#topbar").html("Sync pending");
		
		if(localStorage['transactions'] == null)
		{
			localStorage['transactions'] = "";
		}
		localStorage['transactions'] = localStorage['transactions'] + "|" + transaction;	
	}
	
	/*
	 * Pushes eventual pending transactions to server
	 */
	function syncTransactions()
	{
		// Check if client supports background workers.
		if(typeof(Worker)!=="undefined")
		{
			if(syncWorker == null)
			{
				syncWorker = new Worker("workoutdata_sync_worker.js");
				/*
				 * Process messages from background worker
				 */
				syncWorker.onmessage = function(e) 
				{
					localStorage['transactions'] = localStorage['transactions'].replace(e.data, "");
					$("#topbar").html("Sync done.");
				};			
			}
			if(localStorage['transactions'] != null && localStorage['transactions'] != "")
			{
				$("#topbar").html("Sync ongoing...");
				syncWorker.postMessage(localStorage['transactions']);
			}
			else
			{
				$("#topbar").html("Ready.");
			}
		}
		else
		{
			//No background workers. We need to push syncronously.
			if(localStorage['transactions'] != null && localStorage['transactions'] != "")
			{
				$("#topbar").html("Sync ongoing...");
				try
				{
					xmlhttp=new XMLHttpRequest();
					xmlhttp.open("GET","sync.php?transactions=" + localStorage['transactions'], /*async=*/false);
					xmlhttp.send();
					if(xmlhttp.status == 200)
					{
						localStorage['transactions'] = "";
						$("#topbar").html("Sync ok.");
					}
					else
					{
						$("#topbar").html("Server not in sync.");
					}
				}
				catch(err)
				{
					$("#topbar").html("Server not in sync.");				
				}
			}
			else
			{
				$("#topbar").html("Ready.");
			}
		}
		setTimeout("syncTransactions()",1000);
	}
	
	/*
	 * Step down a workout weight
	 */
	function stepDownWeight(workout_id)
	{
		if(parseInt($("#label_weight_" + workout_id).text())>0)
		{
			$("#label_weight_" + workout_id).text(parseInt($("#label_weight_" + workout_id).text())-1);
			document.getElementById("button_ok_"+ workout_id).style.display = 'block';
			document.getElementById("button_cancel_"+ workout_id).style.display = 'block';
			document.getElementById("button_done_"+ workout_id).style.display = 'none';
		}
	}
	
	/*
	 * Step up a workout weight
	 */
	function stepUpWeight(workout_id)
	{
		$("#label_weight_" + workout_id).text(parseInt($("#label_weight_" + workout_id).text())+1);
		document.getElementById("button_ok_"+ workout_id).style.display = 'block';
		document.getElementById("button_cancel_"+ workout_id).style.display = 'block';		
		document.getElementById("button_done_"+ workout_id).style.display = 'none';
	}