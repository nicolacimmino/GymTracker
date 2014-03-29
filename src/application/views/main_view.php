<body>
<div id='canvas'>
<div id='home' onclick="ShowDiv('body_part_selector');">&nbsp;</div><div id='topbar'>Ready.</div>
<div id='inner_canvas'>
<div id='body_part_selector' class='main_screen_area'>
<div id='body_part_selector_button_arms' class="body_part_selector_button" onclick="ShowDiv('arms_workout_selector')">
&nbsp;
</div>
<div id='body_part_selector_button_torso' class="body_part_selector_button" onclick="ShowDiv('torso_workout_selector')">
&nbsp;
</div>
<div id='body_part_selector_button_legs' class="body_part_selector_button" onclick="ShowDiv('legs_workout_selector')">
&nbsp;
</div>
<br><br>
<div id='start_button' onclick='startSession()'>&nbsp;</div>
<div id='stop_button' onclick='stopSession()'>&nbsp;</div>
<div id='session_timer'>&nbsp;</div>
</div>
<div id='arms_workout_selector' class='main_screen_area'>
Workouts:

<?php foreach ($workouts as $workout): 
		$div_id="workout_data_".str_replace(' ','',$workout['id']);
		$button_id="button_workout_data_".str_replace(' ','',$workout['id']);
		$label_weight_id="label_weight_".$workout['id'];
		$workout_id=$workout['id']; ?>

  
	
	<div class='workout_selection_button' id='<?=$button_id?>' onclick='$("#<?=$div_id?>").appendTo("#inner_canvas");ShowDiv("<?=$div_id?>")'>
		<?=$workout['name']?>
		</div>
		<div class='workout_data' id='<?=$div_id?>'>
		<b><h2><?=$workout['name']?></h2></b>
		<br><br>
		<div class='workout_data_area'>
		<div class='workout_button' onclick='stepDownWeight("<?=$workout_id?>")'>-</div>
		<div class='workout_weight' id='<?=$label_weight_id?>'><?=$workout['weight']?></div>
		<div class='workout_weight'>Kg</div>
		<div class='workout_button' onclick='stepUpWeight("<?=$workout_id?>")'>+</div>
		<div style='clear:both'></div>
		</div>
		<div><h2><b><?=$workout['repetitions']?></b> X <b><?=$workout['series']?></b></h2></div>
		<div id='button_ok_<?=$workout_id?>' class='button_ok' onclick='addWorkoutWeightChange("<?=$workout_id?>")'>&nbsp;</div>
		<div id='button_cancel_<?=$workout_id?>' class='button_cancel' onclick='cancelWorkoutWeightChange("<?=$workout_id?>")'>&nbsp;</div>
		<div style='clear:both'></div>		
		<div id='action_menu'>
		<div class='action_menu_button' id='button_done_<?=$workout_id?>' onclick="ShowDiv('body_part_selector');addWorkoutDone('<?=$workout_id?>');$('#<?=$button_id?>').css('background-color','#555555');">
		Done
		</div>
		</div>
	</div>
	
   
<?php endforeach ?>

</div>
</div>
</div>
</body>
