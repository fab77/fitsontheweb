"use strict";


class FitsLoader {
	
	_url;
	_file;
	_callback;
	_data;
	
	
	constructor (url, file, caller) {
		
		this._blob = null;
		
		this._caller = caller;
		
		if (url !== undefined && url != null){
			this._url = url;
			this.loadFITSFromURL();
		}else if (file !== undefined && file != null){
			this._file = file;
			this.loadFITSFromFile(file);
		}else{
			throw 'No file nor url passed.';
		}
		
	}

	loadFITSFromURL () {
		
		let self = this;
		
		let xhr = new XMLHttpRequest();

//		xhr.overrideMimeType("text/plain; charset=x-user-defined");
		xhr.overrideMimeType("text/plain; charset=iso-8859-1");
// 		xhr.overrideMimeType("text/plain; charset=UTF-8");
		
	    xhr.onload = function() {
	    	self._caller.onFitsLoaded(xhr.responseText);
	    }
	    xhr.open("GET", this._url, true);
		xhr.send(null);
		
	}	


	loadFITSFromFile (file) {

		let self = this;
		
        var chunkSize = 1024 * 1024 * 16; // 16MB Chunk size
        var fileSize = file.size;
        var currentChunk = 1;
        var totalChunks = Math.ceil((fileSize/chunkSize), chunkSize);

        while (currentChunk <= totalChunks) {

            var offset = (currentChunk-1) * chunkSize;
            var currentFilePart = file.slice(offset, (offset+chunkSize));

            let reader = new FileReader();
            // reader.readAsText(currentFilePart, "iso-8859-1");
			reader.readAsArrayBuffer(currentFilePart);

            reader.onload = function (e) {
            	self._caller.onFitsLoaded(reader.result);
            }
            currentChunk++;
        }
}

// // WORKING WITH SMALL FILES
// loadFITSFromFile () {
//
// let self = this;
//		
// let reader = new FileReader();
//
// reader.readAsText(this._file, "iso-8859-1");
//		
// reader.onload = function() {
// console.log("File loaded");
// self._caller.onFitsLoaded(reader.result);
// };
//		
// reader.onerror = function() {
// throw 'Error: '+reader.error;
// };
// }
	

}



export default FitsLoader;