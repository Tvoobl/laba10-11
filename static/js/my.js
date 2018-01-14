//Using LocalStorage -START-
var idMask = 'divId_';

var useLocalStorage = false;

$.fn.deleteDBItems = function () {
	var DBOpenRequest = window.indexedDB.open("reviewsdatabase", 1);

	DBOpenRequest.onsuccess = function(event) {
  		console.log('Success opened DB on delete');
    
	  // store the result of opening the database in the db variable.
	  // This is used a lot below
	  db = DBOpenRequest.result;
	    
	  // Clear all the data form the object store
	  $.fn.clearData();
	};
}


$.fn.clearData = function() {
  var transaction = db.transaction(["reviews"], "readwrite");

  // report on the success of the transaction completing, when everything is done
  transaction.oncomplete = function(event) {
  	console.log('Transaction completed');
  };

  transaction.onerror = function(event) {
  	console.log('Transaction error'+transaction.error);
  };

  // create an object store on the transaction
  var objectStore = transaction.objectStore("reviews");

  // Make a request to clear all the data out of the object store
  var objectStoreRequest = objectStore.clear();

  objectStoreRequest.onsuccess = function(event) {
  	console.log('Request successful');
  };
};

window.addEventListener('online', showIfOnline);

function showIfOnline() {
	var request = indexedDB.open('reviewsdatabase', 1);
	request.onsuccess = function(e) {
		console.log('Success opened DB');
		db = e.target.result;
		$.fn.showReviewsFromIndexDB();
	}
	$.fn.deleteDBItems();
};

window.addEventListener('load',function() {
	if (useLocalStorage) {
		if (navigator.onLine) {
			$.fn.showReviews();
			localStorage.clear();
		} 
	} else {
		$.fn.createIDB();
	}
});

$.fn.localStorageUsed = function() {
	if (!navigator.onLine) {
	    alert ("Pushed");
		var newDiv = $.fn.createNewDiv();
		var reviewId = $.fn.createReviewId();
	    localStorage.setItem(idMask+reviewId, newDiv);
		$.fn.clearReviewInputs();
	} else {
		alert("Online");
		$.fn.clearReviewInputs();
	}
}

//Create New Review Function
$.fn.createNewDiv = function() {

        var name = document.getElementById('send_user_name').value;
	    var date = new Date();
		var dateString = "";
			dateString = date.getDate() + "." + (date.getMonth()+1) + "." + (date.getFullYear())
			+ ", " + date.getHours() + ":" + date.getMinutes();
		var reviewText = document.getElementById('send_review').value;

		if(name !== null && name !== '' && reviewText !==null && reviewText !== '') {
	    	
	    	var reviewId = $.fn.createReviewId();

	    	var newDiv = '<div class="review divider_bottom" data-divid="'
	    	+ idMask+reviewId
	    	+  '"><div class="user_name"><h1>' 
	    	+ name 
	    	+ '</h1></div>'
	    	+ '<div class="review_post_time"><h4>'
	    	+ dateString
	    	+ '</h4></div>'
	    	+ '<div class="review_text"><p>'
	    	+ reviewText
	    	+ '</p></div>';

	    	return newDiv;
		} else {
		   	$.fn.errorAlert();
		}
}

//Search All Existing Id And Create +1 Id Value
$.fn.createReviewId = function() {
	var reviewId = 0;
	$('div[data-divid]').each(function() {
	    var jelId = $(this).attr('data-divid').slice(6);
	    if (jelId > reviewId)
			reviewId = jelId;
	});
	reviewId++;
	return reviewId;
}

//Show All Existing
$.fn.showReviews = function() {
	var lsLen = localStorage.length;
	if (lsLen > 0) {
		for (var i = 0; i < lsLen; i++){
			var key = localStorage.key(i);
			if (key.indexOf(idMask) == 0) {
				$("#reviews").append(localStorage.getItem(key));
			}
		}
	}
}

//Using LocalStorage -END-


$.fn.createIDB = function() {
	
	var request = indexedDB.open('reviewsdatabase', 1);

	request.onupgradeneeded = function(e) {
		var db = e.target.result;

		if(!db.objectStoreNames.contains('reviews')) {
			var os = db.createObjectStore('reviews', { keyPath: "id", autoIncrement: true});
			os.createIndex('name', 'name',{unique:false});
		}
	}

	request.onsuccess = function(e) {
		console.log('Success opened DB')
		db = e.target.result;
	}

	request.onerror = function(e) {
		console.log('Error with DB open')
	}

}

//Create New Review On Button Click
function sendReview() {
	if (useLocalStorage) {
		alert("Using localStorage");
		$.fn.localStorageUsed();
	} else {
		alert("Using indexedDB");
		if (!navigator.onLine) {
			$.fn.addReviewToIndexedDB();	
		} else {
			alert("Online");
		}
	}
	$.fn.clearReviewInputs();
}

$.fn.clearReviewInputs = function() {
    document.getElementById("send_user_name").value = "";
 	document.getElementById("send_review").value = "";
}

$.fn.errorAlert = function() {
    alert("Вам необхідно заповнити усі поля");
}

$.fn.addReviewToIndexedDB = function() {
		var name = document.getElementById('send_user_name').value;
	    var date = new Date();
		var dateString = "";
			dateString = date.getDate() + "." + (date.getMonth()+1) + "." + (date.getFullYear())
			+ ", " + date.getHours() + ":" + date.getMinutes();
		var reviewText = document.getElementById('send_review').value;

		var transaction = db.transaction(["reviews"], "readwrite");

		var store = transaction.objectStore("reviews");

		var review = {
			name: name,
			dateString: dateString,
			reviewText: reviewText
		}

		if(name !== null && name !== '' && reviewText !==null && reviewText !== '') {
			var request = store.add(review);
		}

		request.onsuccess = function(e) {
			alert("Success");
		}
}

$.fn.showReviewsFromIndexDB = function() {

	var transaction = db.transaction(["reviews"], "readonly");

	var store = transaction.objectStore("reviews");

	var index = store.index('name');


	index.openCursor().onsuccess = function(e) {
		var cursor = e.target.result;
		if (cursor) {
			var output = '<div class="review divider_bottom" data-divid="'
				    	+ idMask+cursor.value.id
				    	+  '"><div class="user_name"><h1>' 
				    	+ cursor.value.name  
				    	+ '</h1></div>'
				    	+ '<div class="review_post_time"><h4>'
				    	+ cursor.value.dateString
				    	+ '</h4></div>'
				    	+ '<div class="review_text"><p>'
				    	+ cursor.value.reviewText
				    	+ '</p></div>';
			cursor.continue();
		}
		$('#reviews').append(output);
	}
}
		
	