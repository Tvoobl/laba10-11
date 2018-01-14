//Using LocalStorage -START-
var idNewsMask = 'newId_';

var useLocalStorage = true;

deleteDBItems = function () {
	var DBOpenRequest = window.indexedDB.open("newsdb", 1);

	DBOpenRequest.onsuccess = function(event) {
  		console.log('Success opened DB on delete');
    
	  // store the result of opening the database in the db variable.
	  // This is used a lot below
	  db = DBOpenRequest.result;
	    
	  // Clear all the data form the object store
	  clearData();
	};
}

	
function clearData() {
  var transaction = db.transaction(["news"], "readwrite");

  // report on the success of the transaction completing, when everything is done
  transaction.oncomplete = function(event) {
  	console.log('Transaction completed');
  };

  transaction.onerror = function(event) {
  	console.log('Transaction error'+transaction.error);
  };

  // create an object store on the transaction
  var objectStore = transaction.objectStore("news");

  // Make a request to clear all the data out of the object store
  var objectStoreRequest = objectStore.clear();

  objectStoreRequest.onsuccess = function(event) {
  	console.log('Request successful');
  };
};

window.addEventListener('online', showIfOnline);

function showIfOnline() {
	var request = indexedDB.open('newsdb', 1);
	request.onsuccess = function(e) {
		console.log('Success opened DB');
		db = e.target.result;
		showNewsFromIndexDB();
	}
	deleteDBItems();
};


window.addEventListener("load", function(event) {
    if (useLocalStorage) {
		if (navigator.onLine) {
			showNews();
			localStorage.clear();
		} 
	} else {
		createIDB();
	}
  });

function localStorageUsed() {
	if (!navigator.onLine) {
	    alert ("Pushed");
		var newDiv = createNewDiv();
		var newsId = createNewsId();
	    localStorage.setItem(idNewsMask+newsId, newDiv);
		clearReviewInputs();
	} else {
		alert("Online");
		clearReviewInputs();
	}
}

//Create New Review Function
function createNewDiv() {

        var uploadedImage = document.getElementById('my-file-selector');
    	var newsContent = document.getElementById('news_text_admin_page').value;
		var newsTitle = document.getElementById('news_title_admin_page').value;

		if(newsContent !== null && newsContent !== '' && newsTitle !==null && newsTitle !== '' && uploadedImage.value !==null && uploadedImage.value !== '') {
	    	
	    	var newsId = createNewsId();

	    	var newNewsDiv = '<div class="col-md-4 news_table centered" data-newsdivid="'
	    	+ idNewsMask+newsId
	    	+ '"><a href="#" class="thumbnail"><img src="../img/news_image_2.jpg" alt="Зображення новини"><div class="caption"><p>' 
	    	+ newsTitle 
	    	+ '</p></div></a></div>'

	    	alert(uploadedImage);
	    	return newNewsDiv;
		} else {
		   	errorAlert();
		}
}

//Search All Existing Id And Create +1 Id Value
function createNewsId() {
	var newsId = 0;
	var lsLen = localStorage.length;
	if (lsLen > newsId) {
		newsId = lsLen+1;
		return newsId;
	}
	return newsId;
}

//Show All Existing
function showNews() {
	var lsLen = localStorage.length;
	if (lsLen > 0) {
		for (var i = 0; i < lsLen; i++){
			var key = localStorage.key(i);
			if (key.indexOf(idNewsMask) == 0) {
				$("#news_container").append(localStorage.getItem(key));
			}
		}
	}
}

//Using LocalStorage -END-


function createIDB() {
	
	var request = indexedDB.open('newsdb', 1);

	request.onupgradeneeded = function(e) {
		var db = e.target.result;

		if(!db.objectStoreNames.contains('news')) {
			var os = db.createObjectStore('news', { keyPath: "id", autoIncrement: true});
			os.createIndex('newsTitle', 'newsTitle',{unique:false});
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
function sendNews() {
	if (useLocalStorage) {
		alert("Using localStorage");
		localStorageUsed();
	} else {
		alert("Using indexedDB");
		if (!navigator.onLine) {
			addReviewToIndexedDB();	
		} else {
			alert("Online");
		}
	}
	clearReviewInputs();
}

function clearReviewInputs() {
    document.getElementById("news_text_admin_page").value = "";
	document.getElementById("news_title_admin_page").value = "";
	$("#remove_image_button").click()
}

function errorAlert() {
    alert("Вам необхідно заповнити усі поля");
}

function addReviewToIndexedDB() {
	var uploadedImage = document.getElementById('my-file-selector');
	var newsContent = document.getElementById('news_text_admin_page').value;
	var newsTitle = document.getElementById('news_title_admin_page').value;

	var transaction = db.transaction(["news"], "readwrite");

	var store = transaction.objectStore("news");

	var news = {
		newsContent: newsContent,
		newsTitle: newsTitle,
	}

	if(newsContent !== null && newsContent !== '' && newsTitle !==null && newsTitle !== '') {
		var request = store.add(news);
	}

	request.onsuccess = function(e) {
		alert("Success");
	}
}

function showNewsFromIndexDB() {

	var transaction = db.transaction(["news"], "readonly");

	var store = transaction.objectStore("news");

	var index = store.index('newsTitle');


	index.openCursor().onsuccess = function(e) {
		var cursor = e.target.result;
		if (cursor) {
			var output = '<div class="col-md-4 news_table centered" data-newsdivid="'
					    	+ idNewsMask	+cursor.value.id
					    	+ '"><a href="#" class="thumbnail"><img src="../img/news_image_2.jpg" alt="Зображення новини"><div class="caption"><p>' 
					    	+ cursor.value.newsTitle 
					    	+ '</p></div></a></div>'
			cursor.continue();
		}
		$('#news_container').append(output);
	}
}
		
