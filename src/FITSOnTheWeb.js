"use strict";
import ColorMaps from './ColorMaps';
import FitsLoader from './FitsLoader';
import ParseHeader from './ParseHeader';
import ParsePayload from './ParsePayload';
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/fitsontheweb
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

class FITSOnTheWeb {

	_header;
	_payload;
	_img;
	_url;
	_localFile;
	_colorMap;
	_tFunction;
	_callback;
	/**
	 * @param url: FITS HTTP URL
	 * @param in_colorMap: array in the form of one from ColorMap.js
	 * @param pvMin: minimum physical value
	 * @param pvMax: maximum physical value
	 * @param callback: function to be called once the FITS has been converted in Image
	 */
	constructor (url, localFile, callback, in_colorMap, in_tFunction, pvMin, pvMax){
	
		this._url = url;
		this._localFile = localFile;
		this.firstRun = true;
		
		
		this._colorMap = in_colorMap;
		this._tFunction = in_tFunction;
		
		
		var self = this;

		
		if (this._url !== undefined && this._url != null){
			let fitsLoader = new FitsLoader(this._url, null, this);
		}else if (this._localFile !== undefined && this._localFile != null){
			let fitsLoader = new FitsLoader(null, this._localFile, this);	
		}
		
		this._callback = callback;
		
		
		

	}
	
	onFitsLoaded (fitsData) {
		this._img = this.processFits(fitsData);
		this._callback(this._img, this._payload._PVMIN, this._payload._PVMAX);
	}
	
	reprocess(min, max){
		this._payload.parse(min, max);
		this._img = this._payload.img;
		return this._img;
	}

	stop(){
		this.xhr.abort();
	}

	start(){
		this.xhr.open("GET", this._url, true);
		this.xhr.send(null);
	}
	
	processFits (data) {

		let parseHeader = new ParseHeader(data);
		this._header = parseHeader.header;
		let headerOffset = parseHeader.offset;

		this._payload = new ParsePayload(this._header, data, headerOffset, this._colorMap, this._tFunction);
		let image = this._payload.parse();
		return image;
	}

	
	changeTransferFunction(scaleFunction) {
		
		this._payload.applyScaleFunction(scaleFunction);
		this._img = this._payload.img;
		
	}
	
	changeColorMap(colorMap) {
		
		this._payload.changeColorMap(colorMap);
		this._img = this._payload.img;
		
	}
	
	changeInverse(inverse){
		
		this._payload.changeInverse(inverse);
		this._img = this._payload.img;
		
	}
	
	get header () {
		return this._header;
	}
	
	get payload () {
		return this._payload;
	}
	
	
	get min(){
		return this._payload._PVMIN;
	}
	
	get max(){
		return this._payload._PVMAX;
	}
	
	get img(){
		return this._img;
	}
	
	set inverse (bool){
		this._payload.inverse = bool;
	}
	
	header2String () {
		let str = "";
		this._header._keyValues.forEach( (values, keys)=>{
			str += keys+": "+values+"<br>";
		});
		return str;
	}
	
	getPhysicalPixelValueFromScreenMouse (i, j) {
		return this._payload.getPhysicalPixelValueFromScreenMouse (i, j);
	}

}
	
export default FITSOnTheWeb; 
	
	
	
	
	