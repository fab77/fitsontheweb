"use strict";

/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github URL
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 * 
 * 
 * FITS standard keywords document:
 * https://heasarc.gsfc.nasa.gov/docs/fcg/standard_dict.html
 * 
 * FITS standard:
 * http://archive.stsci.edu/fits/fits_standard/
 * 
 * 
 * BITPIX definition from https://archive.stsci.edu/fits/fits_standard/node39.html
 * 8	Character or unsigned binary integer
 * 16	16-bit twos-complement binary integer
 * 32	32-bit twos-complement binary integer
 * -32	IEEE single precision floating point
 * -64	IEEE double precision floating point
 * 
 */

class FabFitsReader {

		
		BITPIX; // mandatory
		BLANK;
		BZERO = 0;	// physical_value = BZERO + BSCALE * array_value;
		BSCALE = 1;	// physical_value = BZERO + BSCALE * array_value;
		NAXIS1;
		NAXIS2;
		NAXIS = 2;
		SIMPLE = "T"; // for FITS following the STSCI standard. F if different standard
		
//		colorMap = [];
		colorMap;
		PVMIN = "NaN";
		PVMAX = "NaN";
		PVMIN_orig = "NaN";
		PVMAX_orig = "NaN";
		BLANK_pv;
		physicalValues = [];
		img;
		tfPhysicalValues;
		tFunction;
		data;
		headerOffset;
		
	/**
	 * @param url: FITS HTTP URL
	 * @param in_colorMap: array in the form of one from ColorMap.js
	 * @param pvMin: minimum physical value
	 * @param pvMax: maximum physical value
	 * @param callback: function to be called once the FITS has been converted in Image
	 */
	constructor (url, in_colorMap, in_tFunction, pvMin, pvMax, callback){
		var self = this;
		this.colorMap = in_colorMap;
		this.tFunction = in_tFunction;
		if (typeof pvMin == 'number' && pvMin != null){
//			console.log("min IS a number"+pvMin);
//			this.PVMIN = pvMin;
			this.PVMIN_orig = pvMin;
		}
		if (typeof pvMax == 'number' && pvMax != null){
//			this.PVMAX = pvMax;
			this.PVMAX_orig = pvMax;
		}
		
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
	    xhr.overrideMimeType("text/plain; charset=x-user-defined");
	    
	    xhr.onload = function() {
	    	var img = self.processFits(xhr.responseText);
	    	img.onclick = function(){
	    		console.log("Clicked on img "+url);
	    	}
	    	callback(img);
	    }

		xhr.send(null);
	}
	
	processFits (data) {
		var headerOffset = this.readHeader(data);
		
		this.data = data;
		this.headerOffset =  headerOffset;
		
		return this.readPayload();
	}
	
	readHeader (fitsFile) {
		var length = fitsFile.length;
		var offset = 0;
		var LINEWIDTH = 80;
		var header = {};
		var key;
		var val;

		var str;
		
		while (offset < length){
			str = this.getStringAt(fitsFile, offset,LINEWIDTH);
			offset += LINEWIDTH;
			var eq = str.indexOf('=');
			key = this.trim(str.substring(0,eq))
			val = this.trim(str.substring(eq+1,Math.max(str.indexOf('/'),str.length)))
			if(key.length > 0){
				if(val.indexOf("'") == 0 || key == "SIMPLE"){
					// It is a string
					val = val.substring(1,val.length-2)
				}else{
					if(val.indexOf('.') >= 0) val = parseFloat(val); // Floating point
					else val = parseInt(val); // Integer
				}
				header[key] = val;
			}
			if(str.indexOf('END') == 0) {
//				console.log("Found END with offset "+offset);
				break;
			}
		}

		this.BZERO = 0;	// physical_value = BZERO + BSCALE * array_value;
		this.BSCALE = 1;
		
		if(typeof header.NAXIS1=="number") this.width = header.NAXIS1;
		if(typeof header.NAXIS2=="number") this.height = header.NAXIS2;
		
		if (header.SIMPLE !== "undefined"){
			this.SIMPLE = header.SIMPLE; 
		}else{
			console.err("Not STSCI standard FITS. SIMPLE = "+header.SIMPLE);
			exit(-1);
		}
		
		if (header.BITPIX !== "undefined"){
			this.BITPIX = header.BITPIX; 
		}else{
			console.err("BITPIX not defined.");
			exit(-1);
		}
		
		if (header.BLANK !== "undefined"){
			this.BLANK = header.BLANK; 
		}
		
		if (header.BZERO !== "undefined"){
			this.BZERO = header.BZERO; 
		}
		
		if (header.BSCALE !== "undefined"){
			this.BSCALE = header.BSCALE; 
		}
		
		if (isNaN(this.PVMIN_orig) && header.DATAMIN !== "undefined"){
			this.PVMIN_orig = header.DATAMIN;
		}
		
		if (isNaN(this.PVMAX_orig) && header.DATAMAX !== "undefined"){
			this.PVMAX_orig = header.DATAMAX;
		}
		
		this.physicalValues = new Array(this.width * this.height);
		
		console.log("width "+this.width+", height "+this.height);
		// Remove any space padding
		while(offset < length && this.getStringAt(fitsFile,offset,1) == " ") offset++;
		return offset;
	}
	
	firstRun = true;
	
	readPayload (in_min, in_max){		
		let length = this.data.length;
    	var i = this.headerOffset;
    	var p = 0;
		var x;
//		var min = 'NaN';
//		var max = 'NaN';
		var c=document.createElement('canvas');
    	c.width = this.width;
        c.height = this.height;
    	var ctx=c.getContext("2d");
    	var imgData=ctx.createImageData(this.width, this.height);
    	var val;
    	// NON FUNZIONAAAAA
//    	min = max = val = this.getLongAt(fitsFile, i, true); //IEEE float32 is always big-endian
//    	max =0;
//    	var maxindex;
//    	let checkMin = isNaN(this.PVMIN) ? true : false;
//    	let checkMax = isNaN(this.PVMAX) ? true : false;
    	
    	
    	if (this.BZERO == undefined || this.BSCALE == undefined){
    		this.BZERO = 0;
    		this.BSCALE = 1;
		}
    	
    	this.BLANK_pv = this.BZERO + this.BSCALE * this.BLANK;
    	
    	
    	var p = 0;
    	
//    	let p_val = this.BLANK_pv;
    	
    	
    	let  min2bChecked = false;
    	let  max2bChecked = false;
    	let p_val;
    	
    	if (isNaN(this.PVMIN_orig)){
    		min2bChecked = true;
    	}
    	if (isNaN(this.PVMAX_orig)){
    		max2bChecked = true;
    	}
    	
    	if (in_min != null){
    		this.PVMIN = in_min;
    	}else if (isNaN(this.PVMIN_orig)){
    		p_val = this.getPhysicalNumber(i);
    		this.PVMIN = p_val;
    	}else {
    		this.PVMIN = this.PVMIN_orig;
    	}
    	
    	if (in_max != null){
    		this.PVMAX = in_max;
    	}else if (isNaN(this.PVMAX_orig)){
    		p_val = this.getPhysicalNumber(i);
    		this.PVMAX = p_val;
    	}else {
    		this.PVMAX = this.PVMAX_orig;
    	}
    	
    	
    	console.log("this.PVMIN "+this.PVMIN);
		console.log("this.PVMAX "+this.PVMAX);
    	
    	
		while (i < length){
//			p_val = this.getPhysicalNumber(i);
			if (this.BITPIX == 16){ // 16-bit 2's complement binary integer
				val = this.parse16bit2sComplement(this.data, i, true); //IEEE 754 half precision (float16)
			}else if (this.BITPIX == -32){	// 32 bit single precision 
				val = this.parse32bitSinglePrecisionFloatingPoint (this.data, i, true); //IEEE 754 float32 is always big-endian	
				if (val != 0){
					val = (1.0+((val&0x007fffff)/0x0800000)) * Math.pow(2,((val&0x7f800000)>>23) - 127); // long to float conversion
//					val = (1.0+((val&0x007fffff)/(val&0x0800000)>>31)) * Math.pow(2,((val&0x7f800000)>>23) - 127);
				}
			}
			
			
			
			// STSCI standard: physical_value = BZERO + BSCALE * array_value;
			p_val = this.BZERO + this.BSCALE * val;
			
			// this could be checked against the array blanck value val !== this.BLANK
			if( min2bChecked && p_val < this.PVMIN ) {
				this.PVMIN = p_val;
				console.log(this.PVMIN);
			}

			if(max2bChecked && p_val > this.PVMAX) {
				this.PVMAX = p_val;
				console.log(this.PVMAX);
			}

			
			
			if( p_val !== this.BLANK_pv && p_val >= this.PVMIN && p_val <= this.PVMAX ) {
				this.physicalValues[p++] = p_val;
//				i += Math.abs(this.BITPIX/8);
			}
			else{
				this.physicalValues[p++] = "NaN";	
			} 

			i += Math.abs(this.BITPIX/8);
		}
		console.log("this.PVMIN "+this.PVMIN);
		console.log("this.PVMAX "+this.PVMAX);
		
		if (this.firstRun){
			this.firstRun = false;		
			if (isNaN(this.PVMIN_orig)){
				this.PVMIN_orig = this.PVMIN;
			}
			if (isNaN(this.PVMAX_orig)){
				this.PVMAX_orig = this.PVMAX;
			}
		}
		
		
		this.tfPhysicalValues = this.physicalValues;
		this.img = this.applyScaleFunction(this.tFunction);
		
//		this.img = this.applyColorMap(this.colorMap);
    
        return this.img;

	}
	
	
	
	
	get min(){
		return this.PVMIN_orig;
	}
	
	get max(){
		return this.PVMAX_orig;
	}
	
	set min(in_min){
		this.PVMIN = in_min;
	}
	
	set max(in_max){
		this.PVMAX = in_max;
	}
	
	get img(){
		return this.img;
	}
	
	getPhysicalNumber(idx){
		let val;
    	if (this.BITPIX == 16){ // 16-bit 2's complement binary integer
    		val = this.parse16bit2sComplement(this.data, idx, true); //IEEE 754 half precision (float16)
		}else if (this.BITPIX == -32){	// 32 bit single precision 
			val = this.parse32bitSinglePrecisionFloatingPoint (this.data, idx, true); //IEEE 754 float32 is always big-endian	
			if (val != 0){
				val = (1.0+((val&0x007fffff)/0x0800000)) * Math.pow(2,((val&0x7f800000)>>23) - 127); // long to float conversion
			}
		}
    	let p_val = this.BZERO + this.BSCALE * val;
    	return p_val;
	}
	
	applyScaleFunction(tFunc, inverse){
		var self = this;
		this.tfPhysicalValues = [];
		if (tFunc == 'log'){
			this.physicalValues.forEach(function(element, idx){ 
				self.tfPhysicalValues[idx] = Math.log(element) 
			});
		}else if (tFunc == 'sqrt'){
			this.physicalValues.forEach(function(element, idx){ 
				self.tfPhysicalValues[idx] = Math.sqrt(element) 
			});
		}else if (tFunc == 'linear'){
			this.tfPhysicalValues = this.physicalValues;
		}
		this.img = this.applyColorMap(this.colorMap, inverse);
		return this.img;
	}
	
	
	applyColorMap(colorMapName, inverse){
		
		this.colorMap = colorMapName;
		var c=document.createElement('canvas');
    	c.width = this.width;
        c.height = this.height;
    	var ctx=c.getContext("2d");
    	var imgData=ctx.createImageData(this.width, this.height);
    	
    	var row = 0;
    	var col = 0;
    	var i=0;
    	var pos;
    	var colors;
    	
		for (row=0;row<this.width; row++){
    		for (col=0;col<this.height;col++){
    			pos = ((this.width-row)*this.height+col)*4;
//    			colors = this.colorImage2(this.physicalValues[i],this.PVMIN, this.PVMAX);
    			colors = this.colorImage(this.tfPhysicalValues[i], colorMapName, inverse);

    			imgData.data[pos] = colors.r;
    			imgData.data[pos+1] = colors.g;
    			imgData.data[pos+2] = colors.b;
    			imgData.data[pos+3] = 0xff; // alpha
    			i++;
    		}
    	}
    	ctx.putImageData(imgData, 0, 0);
    	var img = new Image();
        img.src = c.toDataURL();
        this.img = img;
        return img;
	}
	
	getStringAt (data, offset, length) {
		var chars = [];
		for (var i=offset,j=0;i<offset+length;i++,j++) {
			chars[j] = String.fromCharCode(data.charCodeAt(i) & 0xFF);
		}
		return chars.join("");
	}
	

	parse32bitSinglePrecisionFloatingPoint (data, offset) {
		var byte1 = this.getByteAt(data, offset),
			byte2 = this.getByteAt(data, offset + 1),
			byte3 = this.getByteAt(data, offset + 2),
			byte4 = this.getByteAt(data, offset + 3);
		
		var long = (((((byte1 << 8) + byte2) << 8) + byte3) << 8) + byte4;
		if (long < 0) long += 4294967296;
		
//		if (byte1 !== 192 && byte2 !== 0 && byte3 !== 0 && byte4 !== 127){
//			check = true;
//		}

		return long;
	}
	
	
	
	
	parse16bit2sComplement(data, offset) {
		var byte1 = this.getByteAt(data, offset),
		byte2 = this.getByteAt(data, offset + 1);
		var h = 0x0000 | (byte1 << 8) | byte2;
		
	    var s = (h & 0x8000) >> 15;
	    var e = (h & 0x7C00) >> 10;
	    var f = h & 0x03FF;

	    var res = h & 0x0000FFFF;
	    
	    if (s){
	    	res = (~h & 0x0000FFFF)  + 1;
	    	return -1 * res;
	    }
	    return res;

	}
	
	getByteAt (data, offset) {
		var dataOffset = 0;
		return data.charCodeAt(offset + dataOffset) & 0xFF;
	}
	
	colorImage (v, colorMapName, inverse){
		
		let min = this.PVMIN;
		let max = this.PVMAX;
		if (v<0) v = -v;
		let colormap_idx = ( (v-min) / (max-min)) * 256;
		let idx = Math.round(colormap_idx);
		let colorMap = ColorMaps[colorMapName];
		if (idx<0){
			idx = -idx;
		}
		
		if (v <= this.BLANK_pv ){
//			console.log(v);
			return {
				r:0,
				g:0,
				b:0
			};
		}
		
		if (colorMapName == 'grayscale'){
			if (inverse){
				return {
					r: (255 - idx),
					g: (255 - idx),
					b: (255 - idx)
				};
			}
			
			return {
				r:idx,
				g:idx,
				b:idx
			};
		}else{
			if (inverse){
				return {
					r: (255 - colorMap.r[idx]),
					g: (255 - colorMap.g[idx]),
					b: (255 - colorMap.b[idx])
				};
			}
			
			return {
				r:colorMap.r[idx],
				g:colorMap.g[idx],
				b:colorMap.b[idx]
			};
		}

	}


	trim (s) {
		s = s.replace(/(^\s*)|(\s*$)/gi,"");
		s = s.replace(/[ ]{2,}/gi," ");
		s = s.replace(/\n /,"\n");
		return s;
	}
}
	
	
	
	
	
	
	