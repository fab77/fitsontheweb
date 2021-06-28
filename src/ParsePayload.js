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
	// _BLANK_pv;
	_physicalValues;
	_tfPhysicalValues;
	_bitpix;
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
		// this.f = 0;
		
		this._header = header;
		this.u8data = new Uint8Array(fitsFile, headerOffset);
		
		this.firstRun = true;
		
		this._PVMIN = "NaN";
		this._PVMAX = "NaN";
		this._PVMIN_orig = "NaN";
		this._PVMAX_orig = "NaN";
		this._BLANK_pv = this._header.getValue("BZERO") + this._header.getValue("BSCALE") * this._header.getValue("BLANK") || undefined;
		this._bitpix = this._header.getValue("BITPIX");

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
		
        return this._img;

	}
	
	parseData (in_min, in_max) {
		
    	let i = 0;
		let px_val; // pixel value
		let ph_val; // pixel physical value
		
		let bytesXelem = Math.abs(this._bitpix / 8);
		let length = this.u8data.byteLength / bytesXelem;
		// let length = this.u8data.byteLength / 2;



    	let  min2bChecked = false;
    	let  max2bChecked = false;
    	
		if (isNaN(this._PVMIN_orig)){
			min2bChecked = true;
		}
		if (isNaN(this._PVMAX_orig)){
			max2bChecked = true;
		}

		px_val = undefined;
		px_val = this.extractPixelValue(0);

		if (px_val !== undefined){
			ph_val = this.pixel2physicalValue(px_val);
		} else {
			throw new ErrorEvent("pixel value undefined");
		}
			

		if (in_min != null){
			this._PVMIN = in_min;
		}else if (isNaN(this._PVMIN_orig)){
			this._PVMIN = ph_val;
		}else {
			this._PVMIN = this._PVMIN_orig;
		}

		if (in_max != null){
			this._PVMAX = in_max;
		}else if (isNaN(this._PVMAX_orig)){
			this._PVMAX = ph_val;
		}else {
			this._PVMAX = this._PVMAX_orig;
		}

		
		let p = 0;
		while (i < length){
			
			// px_val = ParseUtils.test16bit2complements(this.u8data[2*i], this.u8data[2*i+1]);
			// ph_val = this._header.getValue("BZERO") + this._header.getValue("BSCALE") * px_val;
			
			px_val = this.extractPixelValue(bytesXelem*i);
			ph_val = this.pixel2physicalValue(px_val);


			if( min2bChecked && ph_val < this._PVMIN && ph_val > Number.MIN_VALUE) {
				this._PVMIN = ph_val;
			}

			if(max2bChecked && ph_val > this._PVMAX && ph_val < Number.MAX_VALUE) {
				this._PVMAX = ph_val;
			}

			
			if( ph_val > Number.MIN_VALUE && ph_val >= this._PVMIN && ph_val <= this._PVMAX) {
				this._physicalValues[p++] = ph_val;
			}
			else{
				this._physicalValues[p++] = "NaN";	
			}
			i++;
		}
		
		if (this.firstRun){
			this.firstRun = false;		
			if (isNaN(this._PVMIN_orig)){
				this._PVMIN_orig = this._PVMIN;
			}
			if (isNaN(this._PVMAX_orig)){
				this._PVMAX_orig = this._PVMAX;
			}
		}
		
	}

	pixel2physicalValue (pxval) {
		return this._header.getValue("BZERO") + this._header.getValue("BSCALE") * pxval;
	}
	
	extractPixelValue(offset) {

		let px_val = undefined; // pixel value
		if (this._bitpix == 16) { // 16-bit 2's complement binary integer
			px_val = ParseUtils.parse16bit2sComplement(this.u8data[offset], this.u8data[offset+1]);
		} else if (this._header.getValue("BITPIX") == 32) { // IEEE 754 half precision (float16) ?? 
			px_val = ParseUtils.parse32bit2sComplement(this.u8data[offset], this.u8data[offset+1], this.u8data[offset+2], this.u8data[offset+3]); 
		} else if (this._bitpix == -32) { // 32-bit IEEE single-precision floating point

			// let p = new Float32Array(this.u8data.buffer, offset*4);

			px_val = ParseUtils.parse32bitSinglePrecisionFloatingPoint (this.u8data[offset], this.u8data[offset+1], this.u8data[offset+2], this.u8data[offset+3]); 
			// if (px_val != 0){
			// 	// long to float conversion
			// 	px_val = (1.0+((px_val&0x007fffff)/0x0800000)) * Math.pow(2,((px_val&0x7f800000)>>23) - 127); 
			// }
		} else if (this._bitpix == 64) { // 64-bit 2's complement binary integer 
			throw new TypeError("BITPIX=64 -> 64-bit 2's complement binary integer NOT supported yet.");
		} else if (this._bitpix == -64) { // 64-bit IEEE double-precision floating point 
			throw new TypeError("BITPIX=-64 -> IEEE double-precision floating point NOT supported yet.");
		}

		// if (px_val !== undefined){
		// 	ph_val = this._header.getValue("BZERO") + this._header.getValue("BSCALE") * px_val;
		// } else {
		// 	throw new ErrorEvent("pixel value undefined");
		// }
		return px_val;
	}


	getPhysicalValue(value) {

		let val;
		// 16-bit 2's complement binary integer
    	if (this._header.getValue("BITPIX") == 16) { 
    		// IEEE 754 half precision (float16)
    		val = ParseUtils.parse16bit2sComplement(value, 0, true); 

		// 32-bit 2's complement binary integer 
    	} else if (this._header.getValue("BITPIX") == 32) { 
			// IEEE 754 half precision (float16) ?? 
			val = ParseUtils.parse32bit2sComplement(value, 0, true); 
		
		// 32-bit IEEE single-precision floating point
		} else if (this._header.getValue("BITPIX") == -32) {	
			// IEEE 754 float32 is always big-endian
			val = ParseUtils.parse32bitSinglePrecisionFloatingPoint (value, 0, true); 
			if (val != 0){
				// long to float conversion
				val = (1.0+((val&0x007fffff)/0x0800000)) * Math.pow(2,((val&0x7f800000)>>23) - 127); 
			}
		// 64-bit 2's complement binary integer 
		} else if (this._header.getValue("BITPIX") == 64) {
			throw new TypeError("BITPIX=64 -> 64-bit 2's complement binary integer NOT supported yet.");
		// 64-bit IEEE double-precision floating point 
		} else if (this._header.getValue("BITPIX") == -64) {
			throw new TypeError("BITPIX=-64 -> IEEE double-precision floating point NOT supported yet.");
		// 64-bit IEEE double-precision floating point 
		} else if (this._header.getValue("BITPIX") == -64) {
			throw new TypeError("BITPIX=-64 -> IEEE double-precision floating point NOT supported yet.");
		}
		

    
    	// STSCI standard: physical_value = BZERO + BSCALE * array_value;
    	let p_val = this._header.getValue("BZERO") + this._header.getValue("BSCALE") * val;
    	return p_val;
	}
	
	
	getPhysicalNumber (idx){
		
		let val;
		// 16-bit 2's complement binary integer (BITPIX 16)
    	if (this._header.getValue("BITPIX") == 16){ 
    		// IEEE 754 half precision (float16)
    		val = ParseUtils.parse16bit2sComplement(this._data, idx, true); 
		
		// 16-bit 2's complement binary integer (BITPIX 32)
    	}else if (this._header.getValue("BITPIX") == 32){ 
			// IEEE 754 half precision (float16)
			val = ParseUtils.parse32bit2sComplement(this._data, idx, true); 
			
		// 32 bit single precision (BITPIX -32)
		}else if (this._header.getValue("BITPIX") == -32){	
			// IEEE 754 float32 is always big-endian
			val = ParseUtils.parse32bitSinglePrecisionFloatingPoint (this._data, idx, true); 
			if (val != 0){
				// long to float conversion
				val = (1.0+((val&0x007fffff)/0x0800000)) * Math.pow(2,((val&0x7f800000)>>23) - 127);
			}
			
		}
    	// if (this.f < 512){
    	// 	this.values[this.f] = val;
    	// 	this.f++;
    	// }
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
    	
//        console.log("Physical length: " + this._tfPhysicalValues.length);
//        console.log("Image length: " + imgData.data.length);
		for (row=0; row < this._header.getValue("NAXIS1"); row++){
    		for (col=0; col < this._header.getValue("NAXIS2"); col++){

    			/** to invert x and y replace the pos computation with the following */
    			/** pos = ((c.width - row) * (c.height) + col ) * 4; */
//    			pos = ( col * c.width + row ) * 4;
    			pos = ( (this._header.getValue("NAXIS1") - row) * c.width + col ) * 4;


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
	
	getPhysicalPixelValueFromScreenMouse(i, j){
		let idx =   ( (this._header.getValue("NAXIS2")-j-1) * this._header.getValue("NAXIS1") ) + (i-1) ;		
		return this._tfPhysicalValues[idx];
	}

	getPixelValueFromScreenMouse(i, j){

		let arr = undefined;
		let idx =   ( (this._header.getValue("NAXIS2")-j-1) * this._header.getValue("NAXIS1") ) + (i-1) ;
		if (this._bitpix == 16) {
			// return [this.u8data[2*idx], this.u8data[2*idx+1]];
			arr = this.u8data.slice(2*idx, 2*idx+1);
		} else if (this._bitpix == 32 || this._bitpix == -32) {
			arr = this.u8data.slice(4*idx, 4*idx+3);
		} else if (this._bitpix == 64 || this._bitpix == -64) {
			arr = this.u8data.slice(8*idx, 8*idx+7);
		}
		return arr;
		
	}
}

export default ParsePayload;