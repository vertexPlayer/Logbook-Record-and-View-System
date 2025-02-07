function setDefaultDateTime() {
	$('#datebox').val(new moment().format("DD/MM/YYYY"));

	// Time Picker
	$('#timebox').val(new moment().format("HH:mm"));
}

//To determine if the webpage (document) is "ready" or fully loaded
//then will execute the functions
$(document).ready(function(){

	// Init Summernote
	$('#actbox').summernote({
		height: 200,
	});

	// Init Pikaday Date Picker
	var picker = new Pikaday({
		field: $('#datebox, #selectStartDate')[0],
		format: 'DD/MM/YYYY'
	});

	var picker2 = new Pikaday({
		field: $('#selectEndDate')[0],
		format: 'DD/MM/YYYY'
	});

	setDefaultDateTime();

	//add log
	//jQuery will detect if button with ID "addBut" is clicked, then execute the function
	$('#addBut').click(function(){

		//empty is to remove the content at the div choosen
		//in this case it will clear all the errors notification
		$('#errAct').empty();
		$('#errTime').empty();
		$('#errDate').empty();
		$('#status').empty();

		var add = "option=add&"+$('#addForm').serialize();

		if(($('#actbox').val() != "") && ($('#datebox').val() != "") && ($('#timebox').val() != "")) //check if not empty
		{
			//jQuery POST function. will send data from input form to PHP using POST just like $_POST
			$.post("process.php" , add , function(data){

					swal("Success!", "Log recorded", "success");

					//empty all input
					$('#actbox').summernote('code', '');
					$('#datebox').val("");
					$('#timebox').val("");

					setDefaultDateTime();

			});
		}
		else
		{
			//form error handling. return error if the fields are empty
			var stattext = "<b><font color='red' size='4'>Error. Please complete all fields.</font></b>"
			var errBox = "<font color='red' size='1'>Required</font>";
			//append is to add error status to the page
			$('#errAct').append(errBox).hide().fadeIn('slow');
			$('#errTime').append(errBox).hide().fadeIn('slow');
			$('#errDate').append(errBox).hide().fadeIn('slow');
			$('#status').append(stattext).hide().fadeIn('slow');
		}


	});

	//count text and display current char count, show warning and disable submit when reached limit
	$(".note-editable").on("keypress", function(){
	//$('#actbox').keyup(function () {
	  var max = 250;
	  var len = $(this).text().length;

	  if (len >= (max-10) && len <= max) {
		 var char = max - len;
		$('#charNum').html("<font color='red'>"+char + " characters left</font>");
		$('#addBut').prop('disabled', false);
	  }
	  else if (len >= max) {
		 var char = max - len;
		$('#charNum').html("<font color='red'>"+char + " you have reached the limit</font>");
		$('#addBut').prop('disabled', true);
	  }
	  else {
		var char = max - len;
		$('#charNum').text(char + ' characters left');
		$('#addBut').prop('disabled', false);
	  }

	});

	//view log
	//jQuery will detect if the input Date value is change, it will execute function
	//there is no need to press submit button anymore
	function getLogs() {
		$('#showLog').empty();

		var view = "option=view&"+$('#viewLog').serialize();
		 //jQuery POST function send request to PHP
		$.post("process.php" , view , function(data){

				//append the data received from the PHP to the webpage. will add to the <div id="showLog"></div> in view.php
				$('#showLog').append(data).hide().fadeIn('slow');

				initDataTables();

		});
	}

	function initDataTables() {
		var logTitle = $('#logTitle').text();

		$('#logbookData').dataTable().fnDestroy();
		var table = $('#logbookData').DataTable( {
			"ordering": false,
			"searching": false,
			aLengthMenu: [
	        [25, 50, 100, 200, -1],
	        [25, 50, 100, 200, "All"]
	    ],
			"pageLength": 50,
       dom: 'Bfrtilp',
       buttons: [
             'copy',
             {
                  extend: 'excel',
                  text: '<i class="fa fa-fw fa-file-excel-o"></i> Excel',
                  titleAttr: 'Export all data into Excel file',
                  title: logTitle,
									exportOptions: {
                      columns: 'th:not(:first-child)'
                  }
              },
              {
                   extend: 'csv',
                   text: '<i class="fa fa-fw fa-file-excel-o"></i> CSV',
                   titleAttr: 'Export all data into CSV file',
                   title: logTitle,
									 exportOptions: {
                       columns: 'th:not(:first-child)'
                   }
               },
            {
                 extend: 'pdf',
                 text: '<i class="fa fa-fw fa-file-pdf-o"></i> PDF',
                 titleAttr: 'Export all data into PDF file',
                 title: logTitle,
								 exportOptions: {
										 columns: 'th:not(:first-child)'
								 }
             },
             {
                  extend: 'print',
                  text: '<i class="fa fa-fw fa-print"></i> Print',
                  titleAttr: 'Print Data',
                  title: logTitle,
									exportOptions: {
                      columns: 'th:not(:first-child)'
                  },
									customize: function(win) {
										//generateSignature(date, win);
										var date = $('#selectStartDate').val();
										generateSignature(date, win);
								  }
              }
       ],
   });
	}

	//generate field for Supervisor signature every Friday
	function generateSignature(date, win) {
 	 if(moment(date,'DD/MM/YYYY').day() == 5) {

 		 var signature = "<div id='logtable'>"+
 									 		"<div class='signature'>"+
 									 		"Supervisor's Signature : <br><br>"+
 									 		"_________________________<br>"+
 									 		"(YOUR SUPERVISOR'S NAME)"+
 									 	  "</div>"+
 									 		"</div>";

 		$(win.document.body).append(signature);
 	 }
	}

	if($('#showLog').length > 0) {
		$('#selectStartDate').val(new moment().format("DD/MM/YYYY"));

		getLogs();

		$('input').on("change",function(){
			getLogs();
		});
	}

	// Delete log
	$(document).on("click", "#delBtn", function () {
		var delID = $(this).attr("delID");
		var row = $(this).closest("tr"); // Finds the closest row <tr>

		var deletes = "option=delete&id="+delID;

		swal({
			  title: "Are you sure?",
			  text: "Do you want to delete this log?",
			  icon: "warning",
			  buttons: true,
			  dangerMode: true,
			})
			.then((willDelete) => {
			  if (willDelete) {
					$.post("process.php" , deletes , function(data){
						swal("Log deleted.", {
					    icon: "success",
					  });
						var item = row.fadeOut("slow", function() {
												 $(this).remove();
											 });
					});
			  }
			});

	});

	// Download Logs
	$('#downloadBtn').click(function() {
		var startdate = $('#selectStartDate').val();
		var enddate = $('#selectEndDate').val();

		if(startdate != "" && enddate != "") {

			var success = '<div class="alert alert-success">Logs for '+startdate+' to '+enddate+' successfully downloaded.</div>';
			$('#alert').empty("");
			$('#alert').append(success).hide().fadeIn('slow');

			window.location.href = "./process.php?generate&startdate="+startdate+"&enddate="+enddate;
		} else {

			var error = '<div class="alert alert-danger">Please select both start and end date to download.</div>';
			$('#alert').empty("");
			$('#alert').append(error).hide().fadeIn('slow');
		}
	});

});
