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
import ParseUtils from './ParseUtils';
const LINEWIDTH = 80;

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
		
		let length = (this._data.length === undefined ) ? this._data.size : this._data.length;
		
		let key;
		let val;

		let str;
		
		// setting BZERO and BSCALE  default values.
		this._header.setHeaderItem("BZERO", 0);
		this._header.setHeaderItem("BSCALE", 1);
		this._header.setHeaderItem("BLANK", undefined);
		
		while (this._offset < length){
			
			str = ParseUtils.getStringAt(this._data, this._offset, LINEWIDTH);
			this._offset += LINEWIDTH;
			let eq = str.indexOf('=');
			key = this.trim(str.substring(0, eq))
			val = this.trim(str.substring(eq+1, Math.max(str.indexOf('/'), str.length)))
			
			if(key.length > 0){
				if(val.indexOf("'") == 0 || key == "SIMPLE"){
					// It is a string
					val = val.substring(1,val.length-2)
				}else{
					if(val.indexOf('.') >= 0) {
						val = parseFloat(val); // Floating point
					}else {
						val = parseInt(val); // Integer
					}
				}
				this._header.setHeaderItem(key, val);
			}
			if(str.indexOf('END') == 0) {
//				console.log("Found END with offset "+offset);
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
		
//		this.physicalValues = new Array(this.width * this.height);
		
		// console.log("width "+this.width+", height "+this.height);
		// Remove any space padding
		while(this._offset < length && ParseUtils.getStringAt(this._data, this._offset, 1) == " ") {
			this._offset++;
		}
	}
	
	trim (s) {
		s = s.replace(/(^\s*)|(\s*$)/gi,"");
		s = s.replace(/[ ]{2,}/gi," ");
		s = s.replace(/\n /,"\n");
		return s;
	}
	
}

export default ParseHeader;
