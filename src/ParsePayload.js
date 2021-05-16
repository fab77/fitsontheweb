"use strict";
/**
 * Summary. (bla bla bla)
 * 
 * Description. (bla bla bla)
 * 
 * @link github https://github.com/fab77/fitsontheweb
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 * 
 */

import ParseUtils from './ParseUtils';
import ColorMaps from './ColorMaps';


let tFunctions = new Map();

tFunctions.set("linear", "linear");
tFunctions.set("log", "log");
tFunctions.set("-power-", "-power");
tFunctions.set("sqrt", "sqrt");
tFunctions.set("-squared", "-squared");
tFunctions.set("-asinh", "-asinh");
tFunctions.set("-sinh", "-sinh");
tFunctions.set("-histogram", "-histogram");


let colorsMap = new Map();
colorsMap.set("grayscale","grayscale");
colorsMap.set("planck","planck");
colorsMap.set("eosb","eosb");
colorsMap.set("rainbow","rainbow");
colorsMap.set("cmb","cmb");
colorsMap.set("cubehelix","cubehelix");



class ParsePayload{
	
	_data;
	_headerOffset;
	_header;
	_BLANK_pv; // physical value for BLANK {BLANK_pv = BZERO + BSCALE * BLANK;}
	_PVMIN;
	_PVMAX;
	_PVMIN_orig;
	_PVMAX_orig;
	_BLANK_pv;
	_physicalValues;
	_tfPhysicalValues;
	
// _BZERO;
// _BSCALE;
// _BLANK;
// _BPIX;
	
	_inverse;
	_img;
	
	_tFunction;
	_colorMap;
	
	values;
	f;
	/**
	 * @param header:
	 *            ParseHeader.js
	 * @param fitsFile:
	 *            FITS binary file
	 * @param tFunction:
	 *            name of the trunsfer function
	 * @param coloMap:
	 *            name of the color map
	 */
	constructor (header, fitsFile, headerOffset, colorMap, tFunction){
		
		this.values = [];
		this.f = 0;
		
		this._header = header;
		this._headerOffset = headerOffset;

		this._data = fitsFile;
		
		this.firstRun = true;
// this._BZERO = this._header.getValue("BZERO");
// this._BSCALE = this._header.getValue("BSCALE");
// this._BLANK = this._header.getValue("BLANK");
// this._BPIX = this._header.getValue("BPIX");
		
		this._PVMIN = "NaN";
		this._PVMAX = "NaN";
		this._PVMIN_orig = "NaN";
		this._PVMAX_orig = "NaN";
		this._BLANK_pv = this._header.getValue("BZERO") + this._header.getValue("BSCALE") * this._header.getValue("BLANK") || undefined;
//		this._BLANK_pv = this.getPhysicalValue(this._header.getValue("BLANK"));
		
		
		this._physicalValues = new Array(this._header.getValue("NAXIS1") * this._header.getValue("NAXIS2"));
		
		this._tfPhysicalValues = undefined;
		
		this._tFunction = tFunction;
		if (tFunction == undefined || tFunction == null || tFunctions.get(tFunction) == undefined){
			this._tFunction = tFunctions.get("linear");
		}
		
		this._colorMap = colorMap;
		if (colorMap == undefined || colorMap == null || colorsMap.get(colorMap) == undefined){
			this._colorMap = colorsMap.get("grayscale");
		}
		
		this._inverse = false;
	}
	
	
	parse (in_min, in_max) {
		
		this.parseData(in_min, in_max);
		
		this.applyScaleFunction(this._tFunction);

//		let str;
//		for (let j=0; j < 512; j++){
//			str += j+") "+this.values[j]+" | ";
//		}
//		console.log(str);
		
//		this.inspectParsedData ();
		
//		this.inspectScaledData ()
		
        return this._img;

	}
	
	parseData (in_min, in_max) {
		
		
		let length = (this._data.length === undefined ) ? this._data.size : this._data.length;
    	let i = this._headerOffset;
    	let p = 0;

    	let val;

    	
    	
    	let  min2bChecked = false;
    	let  max2bChecked = false;
    	let p_val;
    	
    	if (isNaN(this._PVMIN_orig)){
    		min2bChecked = true;
    	}
    	if (isNaN(this._PVMAX_orig)){
    		max2bChecked = true;
    	}
    	
    	if (in_min != null){
    		this._PVMIN = in_min;
    	}else if (isNaN(this._PVMIN_orig)){
    		p_val = this.getPhysicalNumber(i);
    		this._PVMIN = p_val;
    	}else {
    		this._PVMIN = this._PVMIN_orig;
    	}
    	
    	if (in_max != null){
    		this._PVMAX = in_max;
    	}else if (isNaN(this._PVMAX_orig)){
    		p_val = this.getPhysicalNumber(i);
    		this._PVMAX = p_val;
    	}else {
    		this._PVMAX = this._PVMAX_orig;
    	}
    	
    	
    	// console.log("this.PVMIN "+this.PVMIN);
		// console.log("this.PVMAX "+this.PVMAX);
    	console.log("this._BLANK_pv "+this._BLANK_pv);
    	console.log("this._BLANK "+this._header.getValue("BLANK"));
    	
    	
		while (i < length){
			
			let p_val = this.getPhysicalNumber(i);			
			
			// this could be checked against the array blanck value val !==
			// this.BLANK
			if( min2bChecked && p_val < this._PVMIN && p_val > Number.MIN_VALUE) {
				this._PVMIN = p_val;
				// console.log(this.PVMIN);
			}

			if(max2bChecked && p_val > this._PVMAX && p_val < Number.MAX_VALUE) {
				this._PVMAX = p_val;
				// console.log(this.PVMAX);
			}

			
			if( p_val > Number.MIN_VALUE && p_val >= this._PVMIN && p_val <= this._PVMAX) {
//			if( p_val !== this._BLANK_pv && p_val >= this._PVMIN && p_val <= this._PVMAX) {
//			if( p_val !== this._header.getValue("BLANK") && p_val >= this._PVMIN && p_val <= this._PVMAX ) {	
				this._physicalValues[p++] = p_val;
// i += Math.abs(this.BITPIX/8);
			}
			else{
				this._physicalValues[p++] = "NaN";	
			} 

			i += Math.abs(this._header.getValue("BITPIX")/8);
		}
		// console.log("this.PVMIN "+this.PVMIN);
		// console.log("this.PVMAX "+this.PVMAX);
		
		if (this.firstRun){
			this.firstRun = false;		
			if (isNaN(this._PVMIN_orig)){
				this._PVMIN_orig = this._PVMIN;
			}
			if (isNaN(this._PVMAX_orig)){
				this._PVMAX_orig = this._PVMAX;
			}
		}
		
		
// this._tfPhysicalValues = this._physicalValues;
		
	}
	
	inspectParsedData () {
			let str = "";
			for ( let i = 0; i< 512; i++) {
				str += i+") "+this._physicalValues[i]+" | ";
			}
			console.log(str);
	}


	inspectScaledData () {
		let str = "";
		for ( let i = 0; i< 512; i++) {
			str += this._tfPhysicalValues[i]+" | ";
		}
		console.log(str);
	}
	
	getPhysicalValue(value) {
		
		let val;
    	if (this._header.getValue("BITPIX") == 16){ // 16-bit 2's complement
													// binary integer
    		
    		val = ParseUtils.parse16bit2sComplement(value, 0, true); // IEEE
																			// 754
																			// half
																			// precision
																			// (float16)

    	}else if (this._header.getValue("BITPIX") == 32){ // 16-bit 2's
															// complement binary
															// integer
			
			val = ParseUtils.parse32bit2sComplement(value, 0, true); // IEEE
																			// 754
																			// half
																			// precision
																			// (float16)
			
		}else if (this._header.getValue("BITPIX") == -32){	// 32 bit single
															// precision
			
			val = ParseUtils.parse32bitSinglePrecisionFloatingPoint (value, 0, true); // IEEE
																								// 754
																								// float32
																								// is
																								// always
																								// big-endian
			if (val != 0){
				val = (1.0+((val&0x007fffff)/0x0800000)) * Math.pow(2,((val&0x7f800000)>>23) - 127); // long
																										// to
																										// float
																										// conversion
			}
			
		}
    
    	// STSCI standard: physical_value = BZERO + BSCALE * array_value;
    	let p_val = this._header.getValue("BZERO") + this._header.getValue("BSCALE") * val;
    	return p_val;
	}
	
	
	getPhysicalNumber (idx){
		
		let val;
    	if (this._header.getValue("BITPIX") == 16){ // 16-bit 2's complement
													// binary integer
    		
    		val = ParseUtils.parse16bit2sComplement(this._data, idx, true); // IEEE
																			// 754
																			// half
																			// precision
																			// (float16)

    	}else if (this._header.getValue("BITPIX") == 32){ // 16-bit 2's
															// complement binary
															// integer
			
			val = ParseUtils.parse32bit2sComplement(this._data, idx, true); // IEEE
																			// 754
																			// half
																			// precision
																			// (float16)
			
		}else if (this._header.getValue("BITPIX") == -32){	// 32 bit single
															// precision
			
			val = ParseUtils.parse32bitSinglePrecisionFloatingPoint (this._data, idx, true); // IEEE
																								// 754
																								// float32
																								// is
																								// always
																								// big-endian
			if (val != 0){
				val = (1.0+((val&0x007fffff)/0x0800000)) * Math.pow(2,((val&0x7f800000)>>23) - 127); // long
																										// to
																										// float
																										// conversion
			}
			
		}
    	if (this.f < 512){
    		this.values[this.f] = val;
    		this.f++;
    	}
    	// STSCI standard: physical_value = BZERO + BSCALE * array_value;
    	let p_val = this._header.getValue("BZERO") + this._header.getValue("BSCALE") * val;
    	return p_val;
	}
	
	applyScaleFunction (scaleFunction) {
		
		let self = this;
		this._tfPhysicalValues = [];
		
		this._tFunction = scaleFunction;
		
		if (this._tFunction == 'log'){
		
			this._physicalValues.forEach(function(element, idx){ 
				self._tfPhysicalValues[idx] = Math.log(element) 
			});
			
		}else if (this._tFunction == 'sqrt'){
			
			this._physicalValues.forEach(function(element, idx){ 
				self._tfPhysicalValues[idx] = Math.sqrt(element) 
			});
			
		}else if (this._tFunction == 'linear'){
			
			this._tfPhysicalValues = this._physicalValues;
			
		}
		
		this.applyColorMap(this._colorMap);

	}
	
	
	applyColorMap (colorMapName) {
		
		if (colorMapName != null && colorMapName !== undefined){
			this._colorMap = colorMapName;	
		}
		
		let c = document.createElement('canvas');
    	c.width = this._header.getValue("NAXIS1");
        c.height = this._header.getValue("NAXIS2");
        let ctx = c.getContext("2d");
        let imgData = ctx.createImageData(c.width, c.height);
    	
        let row = 0;
        let col = 0;
        let i=0;
        let pos;
        let colors;
    	
		for (row=0; row < this._header.getValue("NAXIS1"); row++){
    		for (col=0; col < this._header.getValue("NAXIS2"); col++){

    			/** to invert x and y replace the pos computation with the following */
    			/** pos = ((c.width - row) * (c.height) + col ) * 4; */
    			pos = ( col * c.width + row ) * 4;
// colors = this.colorImage2(this.physicalValues[i],this.PVMIN, this.PVMAX);
    			colors = this.colorImage(this._tfPhysicalValues[i], this._inverse);

    			imgData.data[pos] = colors.r;
    			imgData.data[pos+1] = colors.g;
    			imgData.data[pos+2] = colors.b;
    			imgData.data[pos+3] = 0xff; // alpha
    			i++;
    		}
    	}
    	ctx.putImageData(imgData, 0, 0);
    	let img = new Image();
        img.src = c.toDataURL();
        this._img = img;
// return img;
	}
	
	
	colorImage (v, inverse){
		
		let min = this._PVMIN;
		let max = this._PVMAX;
		if (v<0) v = -v;
		let colormap_idx = ( (v-min) / (max-min)) * 256;
		let idx = Math.round(colormap_idx);
		let colorMap = ColorMaps[this._colorMap];
		if (idx<0){
			idx = -idx;
		}
		
		if (v <= this.BLANK_pv ){
// console.log(v);
			return {
				r:0,
				g:0,
				b:0
			};
		}
		
		if (this._colorMap == 'grayscale'){
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
	
	changeTransferFunction(tFunction){
		this._tFunction = tFunction;
		this.applyScaleFunction();
	}
	
	changeColorMap(colorMap){
		this._colorMap = colorMap;
		this.applyColorMap();
	}
	
	changeInverse(inverse){
		this._inverse = inverse;
		this.applyColorMap();
	}
	
	get img () {
		return this._img;
	}
	
// set inverse (bool){
// this._inverse = bool;
// }
	getPhysicalPixelValue(i, j){
// let idx = this._headerOffset + (i * j);
//		let idx = ((j-1) * this._header.getValue("NAXIS2") ) + i;
//		let idx = ((i-1) * this._header.getValue("NAXIS1") ) + j;
//		let size = this._tfPhysicalValues.length;
		
		let idx =   ( (i-1) * this._header.getValue("NAXIS1") ) + (j-1) ;
		
//		let idx = ((512-i)*512+j)
//		let idx = i*512+ (512 -j)
// let idx = (j * this._header.getValue("NAXIS1") ) + i;
		return this._tfPhysicalValues[idx];
	}
}

export default ParsePayload;