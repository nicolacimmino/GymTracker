

<?php
class gym_tracker extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		$this->load->model('training_programme_model');
	}

	public function index()
	{
		$data['title'] = "Gym Tracker";
		$data['workouts'] = $this->training_programme_model->get_workouts();
		
		$this->load->view('header', $data);
		$this->load->view('main_view', $data);
	}

	
}
?>