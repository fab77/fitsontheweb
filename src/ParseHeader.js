"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/fitsontheweb
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 * 
 */

import FITSHeader from './FITSHeader';


class ParseHeader {
	
	_header;
	_data;
	_width;
	_height;
	_offset; // number of digit used for the header 
	
	
	constructor (fitsFile){
		
		this._data = fitsFile;
		this._offset = 0;
		this._header = new FITSHeader();
		this.parse();
		
	}
	
	getValue (key) {
		return this._header.getValue(key);
	}
	
	
	get header () {
		return this._header;
	}
	
	get offset (){
		return this._offset;
	}
	
	get width (){
		return this._width;
	}
	
	get height (){
		return this._height;
	}
	
	
	parse () {
		
		let length = this._data.byteLength;
		
		let header = new Uint8Array(this._data, 0, 2880);
		let textDecoder = new TextDecoder('iso-8859-1');
		
		// setting BZERO and BSCALE default values.
		this._header.setHeaderItem("BZERO", 0);
		this._header.setHeaderItem("BSCALE", 1);
		this._header.setHeaderItem("BLANK", undefined);

		for (let i = 0; i < 2880/80; i++) {
			let u8line = new Uint8Array(header.slice(i*80, i*80 + 80));
			let line = textDecoder.decode(u8line);
			let u8key = new  Uint8Array(u8line.slice(0, 7));
			let key = textDecoder.decode(u8key).trim();
			
			let u8val = new  Uint8Array(u8line.slice(10, 80));
			let val = textDecoder.decode(u8val).trim();

			if(val.indexOf("'") !== 0 && key !== "SIMPLE"){
				
				if(val.indexOf('.') >= 0) {
					val = parseFloat(val); // Floating point
				}else {
					val = parseInt(val); // Integer
				}

			}

			this._header.setHeaderItem(key, val);

			console.log(line);
			if (key == 'END') {
				break;
			}
		}
		
		
		if (typeof this._header.getValue("NAXIS1") == "number") {
			this._width = this._header.getValue("NAXIS1");
		}
		if (typeof this._header.getValue("NAXIS2") == "number") {
			this._height = this._header.getValue("NAXIS2");
		}
		
		if (this._header.getValue("SIMPLE") !== "undefined"){
			this.SIMPLE = this._header.getValue("SIMPLE"); 
		}else{
			console.err("Not STSCI standard FITS. SIMPLE = " + this._header.get("SIMPLE"));
			exit(-1);
		}
		
		if (this._header.getValue("BITPIX") !== "undefined"){
			this.BITPIX = this._header.getValue("BITPIX"); 
		}else{
			console.err("BITPIX not defined.");
			exit(-1);
		}
		
		if (this._header.getValue("BLANK") !== "undefined"){
			this.BLANK = this._header.getValue("BLANK"); 
		}
		
		if (this._header.getValue("BZERO") !== "undefined"){
			this.BZERO = this._header.getValue("BZERO"); 
		}
		
		if (this._header.getValue("BSCALE") !== "undefined"){
			this.BSCALE = this._header.getValue("BSCALE"); 
		}
		
		if (isNaN(this.PVMIN_orig) && this._header.getValue("DATAMIN") !== "undefined"){
			this.PVMIN_orig = this._header.getValue("DATAMIN");
		}
		
		if (isNaN(this.PVMAX_orig) && this._header.getValue("DATAMAX") !== "undefined"){
			this.PVMAX_orig = this._header.getValue("DATAMAX");
		}
		
		this._offset = 2880;
		console.debug("header offset in bytes: "+this._offset);
	}
	
	// trim (s) {
	// 	s = s.replace(/(^\s*)|(\s*$)/gi,"");
	// 	s = s.replace(/[ ]{2,}/gi," ");
	// 	s = s.replace(/\n /,"\n");
	// 	return s;
	// }
	
}

export default ParseHeader;

