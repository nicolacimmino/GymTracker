<?php
	if(session_id() == '') 
	{
		session_start();
	}
	
	include "db.php";

	if(isset($_REQUEST['transactions']))
	{
		$transactions = $_REQUEST['transactions'];
	
		// Keep track of transactions at least until system is fully tested.
		$insertTransaction = $gymdb->prepare("INSERT INTO test (transaction) VALUES (:transaction)");
		$insertTransaction->bindParam(':transaction', $transactions, PDO::PARAM_STR, 256);
		$insertTransaction->Execute();	
		
		// Process each transaction
		foreach(explode('|', $transactions) as $transaction)
		{
			// Expolode each transaction into tokens
			$tokens = explode(';', $transaction);
			
			if($tokens[0] == "done")
			{
				// Get current workout info
				$workoutInfo = $gymdb->prepare("SELECT * FROM gy_training_programme_workouts 
												WHERE training_programme_id=1
														AND workout_id=:workout_id");
				$workoutInfo->bindParam(':workout_id', $tokens[1], PDO::PARAM_INT);
				$workoutInfo->Execute();
				$workoutInfo = $workoutInfo->fetch();
				$session_id=$_SESSION['session_id'];
				
				$insertWorkoutPerformed = $gymdb->prepare("INSERT INTO gy_performed_workouts (
													session_id, workout_id, timestamp, weight, series, repetitions) 
													VALUES (:session_id, :workout_id, :timestamp, :weight, :series, :repetitions)");
				$insertWorkoutPerformed->bindParam(':session_id', $session_id, PDO::PARAM_INT);
				$insertWorkoutPerformed->bindParam(':workout_id', $tokens[1], PDO::PARAM_INT);
				$insertWorkoutPerformed->bindParam(':timestamp', $tokens[2], PDO::PARAM_STR, 32);
				$insertWorkoutPerformed->bindParam(':weight', $workoutInfo['weight'], PDO::PARAM_STR, 32);
				$insertWorkoutPerformed->bindParam(':series', $workoutInfo['series'], PDO::PARAM_INT, 32);
				$insertWorkoutPerformed->bindParam(':repetitions', $workoutInfo['repetitions'], PDO::PARAM_STR, 32);
				
				$insertWorkoutPerformed->Execute();	
			}
			
			if($tokens[0] == "wchange")
			{
				$updateWorkout = $gymdb->prepare("UPDATE gy_training_programme_workouts SET weight=:weight
													WHERE training_programme_id=1
													AND workout_id=:workout_id");
				$updateWorkout->bindParam(':workout_id', $tokens[1], PDO::PARAM_INT);
				$updateWorkout->bindParam(':weight', $tokens[2], PDO::PARAM_INT);
				
				$updateWorkout->Execute();	
			}
			
			if($tokens[0] == "session_start")
			{
				$startSession = $gymdb->prepare("INSERT INTO gy_sessions SET 
													start_time=:start_time");
				$startSession->bindParam(':start_time', $tokens[2], PDO::PARAM_STR, 30);
			
				$startSession->Execute();	
				
				// Store the session ID in a session variable so when we get a stop
				//	we know which session to stop. Note that this is the only way
				//	to keep this working if the user is offline and all trasactions
				//	are pushed out at once later.
				$_SESSION['session_id'] = $gymdb->lastInsertId();
				
			}
			
			if($tokens[0] == "session_stop")
			{
				$endSession = $gymdb->prepare("UPDATE gy_sessions SET 
													end_time=:end_time
													WHERE id=:id");
				$endSession->bindParam(':id', $_SESSION['session_id'], PDO::PARAM_INT);
				$endSession->bindParam(':end_time', $tokens[2], PDO::PARAM_STR, 30);
			
				$endSession->Execute();	
			}
		}
	}
?>
