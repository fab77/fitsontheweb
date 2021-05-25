"use strict";
import ColorMaps from './ColorMaps';
import FitsLoader from './FitsLoader';
import ParseHeader from './ParseHeader';
import ParsePayload from './ParsePayload';
import {Hploc, Vec3, Pointing} from "healpixjs";
import Healpix from "healpixjs";
// import {asin} from "healpixjs";

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

const RAD2DEG = 180 / Math.PI;

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

	/**
	 * assuming we work with Healpix projection
	 * @param {} nside 
	 */
	getGridPixelCoordinates (nside) {
		nside = (nside !== undefined) ? nside : Math.pow(2, this._header.getValue('ORDER'));
		let pix = this._header.getValue('NPIX');
		let healpix = new Healpix(nside);
		let cornersVec3 = healpix.getBoundaries(pix);
		let pointings = [];
		for (let i = 0; i < cornersVec3.length; i++) {
			pointings[i] = new Pointing(cornersVec3[i]);
		}
		let x_grid, y_grid;
		const H = 3;
		const K = 3;
		let gridPoints = [];

		let result = {
			"minTheta": NaN,
			"maxTheta": NaN,
			"minPhi": NaN,
			"maxPhi": NaN,
			"gridPointsRad": []
		}

		const THETAX = Hploc.asin(2/3);
		const DEG2RAD = Math.PI / 180;

		for (let j = 0; j < pointings.length; j++) {
			let thetaRad = pointings[j].theta;
			let phiRad = pointings[j].phi;

			console.log("(ra, dec) = "+ phiRad * RAD2DEG +", "+ (90 - (thetaRad * RAD2DEG)) );

			if (isNaN(result.maxTheta) || thetaRad > result.maxTheta ) {
				result.maxTheta = thetaRad;
			} else if (isNaN(result.minTheta) || thetaRad < result.minTheta) {
				result.minTheta = thetaRad;
			}
			if (isNaN(result.maxPhi) || phiRad > result.maxPhi) {
				result.maxPhi = phiRad;
			} else if (isNaN(result.minPhi) || phiRad < result.minPhi) {
				result.minPhi = phiRad;
			}
			
			let gridCoords = this.getGridPoint(thetaRad,  phiRad);

			// // equatorial belt
			// if ( Math.abs(pointings[j].theta) <= THETAX) {
			// 	x_grid = pointings[j].phi;
			// 	y_grid = Hploc.sin(thetaRad) * (K * 90) / H;
			// } else { // polar zones
			// 	let sigma = Math.sqrt( K * (1 - Math.abs(Hploc.sin(thetaRad) ) ) );
			// 	let w = ( K % 2 == 0) ? 1 : 0;
			// 	let phi_c = -180 + 2 * Math.floor( ((pointings[j].phi + 180) * H / 360) + (1 - w) / 2  ) + w;


			// 	x_grid = phiRad;
			// 	y_grid = ( ((K + 1) / 2) - sigma) * 180 / H;
			// 	if (thetaRad <= 0) {
			// 		y_grid *= -1;
			// 	}
			// }
			// result.gridPointsRad[j * 2] = x_grid;
			// result.gridPointsRad[j * 2 + 1] = y_grid;
			result.gridPointsRad[j * 2] = gridCoords[0];
			result.gridPointsRad[j * 2 + 1] = gridCoords[1];
		}
		return result;
	}

	getAstroCoordinatesFromFITS(x, y){
		result = [];

		
		let pointsGrid = this.getGridPixelCoordinates ();
		let thetaStep = Math.abs(pointsGrid.maxTheta - pointsGrid.minTheta) / this._header.getValue('NAXIS1');
		let phiStep = Math.abs(pointsGrid.maxPhi - pointsGrid.minPhi) / this._header.getValue('NAXIS2');

		let phiDeg = phiStep * x * RAD2DEG;
		let thetaDeg = thetaStep * y * RAD2DEG;

		let raDeg = phiDeg;
		if (raDeg < 0){
			raDeg += 360;
		}
		let decDeg = 90 - thetaDeg;

		return [raDeg + (pointsGrid.minPhi * RAD2DEG), decDeg + (pointsGrid.minTheta * RAD2DEG)];
	}

	/**
	 * assuming we're working with Healpix projection
	 * @param {*} thetaRad 
	 * @param {*} phiRad 
	 */
	getGridPoint(thetaRad, phiRad) {

		const THETAX = Hploc.asin(2/3);
		let x_grid, y_grid;
		let H = 3;

		if ( Math.abs(thetaRad) <= THETAX) {
			x_grid = phiRad;
			y_grid = Hploc.sin(thetaRad) * (3 * Math.PI) / (2*H);
		} else { // polar zones
			let sigma = Math.sqrt( 3 * (1 - Math.abs(Hploc.sin(thetaRad) ) ) );
			x_grid = phiRad;
			y_grid = (2 - sigma) * Math.PI / H;
			if (thetaRad < 0) {
				y_grid *= -1;
			}
		}
		return [x_grid, y_grid];
	}

	getFITSIndexes (nside, thetaDeg, phiDeg) {

		// TODO handling different norder or nside
		// nside = (nside !== undefined) ? nside : Math.pow(2, this._header.getValue('ORDER'));
		// compute here new pixel value with bits shift in respect to the current norder
		// pix = ...

		let pointsGrid = getGridPixelCoordinates (nside);

		let thetaStep = Math.abs(pointsGrid.maxTheta - pointsGrid.minTheta) / this._header.getValue('NAXIS1');
		let phiStep = Math.abs(pointsGrid.maxPhi - pointsGrid.minPhi) / this._header.getValue('NAXIS2');
		let i, j;
		i = Math.floor(thetaDeg / thetaStep);
		j = Math.floor(phiDeg / phiStep);
		return [i, j];

	}

	// angularDistance (theta1, phi1, theta2, phi2) {

	// 	let theta = Hploc.acos( Hploc.sin() )

	// }
}
	
export default FITSOnTheWeb; 
	
	
	
	
	