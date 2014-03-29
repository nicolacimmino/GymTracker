
<?php
class training_programme_model extends CI_Model {

	public function __construct()
	{
		$this->load->database();
	}
	
	public function get_workouts()
	{
	
		$query = $this->db->get('training_programme_view');
		return $query->result_array();
	}
}
?>