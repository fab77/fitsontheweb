"use strict";
import ColorMaps from './ColorMaps';
import FitsLoader from './FitsLoader';
import ParseHeader from './ParseHeader';
import ParsePayload from './ParsePayload';
import {Hploc, Vec3, Pointing} from "healpixjs";
import Healpix from "healpixjs";
import ProjectionFactory from './projections/ProjectionFactory';
import {constants} from './Constants';
import FITSWriter from './fitswriter/FITSWriter';
import ParseUtils from './ParseUtils';


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
 * 16	16-bit twos-complement binary integer	e.g. http://skies.esac.esa.int/Herschel/normalized/hips250_pnorm_allsky/Norder3/Dir0/Npix281.fits
 * 32	32-bit twos-complement binary integer
 * -32	IEEE single precision floating point
 * -64	IEEE double precision floating point
 * 
 */

const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;
const H = 4;
const K = 3;


class FITSOnTheWeb {

	_header;
	_payload;
	_img;
	_url;
	_localFile;
	_colorMap;
	_tFunction;
	_callback;
	_xyGridProj;
	_encodedFitsData;
	_fitsWidth;
	_fitsHeight;

	/**
	 * @param url: FITS HTTP URL
	 * @param in_colorMap: array in the form of one from ColorMap.js
	 * @param pvMin: minimum physical value
	 * @param pvMax: maximum physical value
	 * @param callback: function to be called once the FITS has been converted in Image
	 */
	constructor (url, localFile, callback, in_colorMap, in_tFunction, pvMin, pvMax){
		this.THETAX = Hploc.asin( (K - 1)/K );
		this._url = url;
		this._localFile = localFile;
		this.firstRun = true;
		
		this._colorMap = in_colorMap;
		this._tFunction = in_tFunction;
		
		// var self = this;

		if (this._url !== undefined && this._url != null){
			let fitsLoader = new FitsLoader(this._url, null, this);
		}else if (this._localFile !== undefined && this._localFile != null){
			let fitsLoader = new FitsLoader(null, this._localFile, this);	
		}
		
		this._callback = callback;

	}
	
	onFitsLoaded (fitsData) {
		this._encodedFitsData = fitsData;
		// this._img = this.processFits(fitsData);
		this._img = this.processFits(this._encodedFitsData);
		this._xyGridProj = this.getFacetProjectedCoordinates ();
		this._callback(this._img, this._payload._PVMIN, this._payload._PVMAX);
		
	}

	getEncodedFitsData () {
		return this._encodedFitsData;
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
		this._fitsWidth = parseHeader.width;
		this._fitsHeight = parseHeader.height;
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
	

	getPixelValueFromScreenMouse (i, j) {
		// let idx =   ( (this._header.getValue("NAXIS2")-j-1) * this._header.getValue("NAXIS1") ) + (i-1) ;
		// let byte1 = ParseUtils.getByteAt(this._encodedFitsData, 2880 + idx);
		// let byte2 = ParseUtils.getByteAt(this._encodedFitsData, 2880 + idx + 1);
		// let h = 0x0000 | (byte1 << 8) | byte2;
		// return h;
		return this._payload.getPixelValueFromScreenMouse (i, j);
	}
	


	getAstroCoordinatesFromFITS(i_mouse, j_mouse){
		result = {};


		// h_pixel, w_pixel
		
		// projecting
		//let xyGridProj = this.getFacetProjectedCoordinates ();

		/**
	 	 * (h_pixel,w_pixel) = (0,0) correspond to the lower-left corner of the facet in the image
		 * (h_pixel,w_pixel) = (1,1) is the upper right corner
		 * dimamond in figure 1 from "Mapping on the HEalpix grid" paper
		 * (0,0) leftmost corner
		 * (1,0) upper corner
		 * (0,1) lowest corner
		 * (1,1) rightmost corner
		 * Thanks YAGO! :p
		 */
		let h_pixel = (i_mouse + 0.5) / this._header.getValue('NAXIS1');
		let w_pixel = (j_mouse + 0.5) / this._header.getValue('NAXIS2');

		
		let xInterval = Math.abs(this._xyGridProj.max_x - this._xyGridProj.min_x) / 2.0;
		let yInterval = Math.abs(this._xyGridProj.max_y - this._xyGridProj.min_y) / 2.0;
		let yMean = (this._xyGridProj.max_y + this._xyGridProj.min_y) / 2.0;
		// let yMean = (xyGridProj.max_y + xyGridProj.min_y) / 2.0;
		// bi-linear interpolation
		let x_mouse = this._xyGridProj.max_x - xInterval * (h_pixel + w_pixel);
		let y_mouse = yMean - yInterval * (w_pixel - h_pixel);
		
		
		// invert transformation - unproject 
		let raDecDeg = this.unproject(x_mouse, y_mouse);

		
		// console.table({
		// 	"h_pixel":h_pixel,
		// 	"w_pixel":w_pixel,
		// 	"xyGridProj.min_x":this._xyGridProj.min_x, 
		// 	"xyGridProj.max_x":this._xyGridProj.max_x,
		// 	"xyGridProj.min_y":this._xyGridProj.min_y, 
		// 	"xyGridProj.max_y":this._xyGridProj.max_y, 
		// 	"xInterval deg":xInterval,
		// 	"yInterval deg":yInterval,
		// 	"x_mouse":x_mouse,
		// 	"y_mouse":y_mouse});
		// console.log("########################################################################");

		if (raDecDeg[0] > 360){
			raDecDeg[0] -= 360;
		}

		return {
			"skyCoords": [raDecDeg[0], raDecDeg[1]],
			"xyCoords": [x_mouse, y_mouse]
		};
	}

	/**
	 * compute boundaries of the current facet and compute max and min theta and phi projected on the HEALPix grid
	 * @param {} nside optional
	 * @returns result: object containing facet's corners coordinates and min and max theta and phi
	 */
	getFacetProjectedCoordinates (nside) {
		nside = (nside !== undefined) ? nside : Math.pow(2, this._header.getValue('ORDER'));
		// nside = 3;
		if (isNaN(nside)){
			throw new EvalError("nside not set");
		}
		let pix = this._header.getValue('NPIX');

		// pix =281;


		let healpix = new Healpix(nside);
		let cornersVec3 = healpix.getBoundariesWithStep(pix, 1);
		let pointings = [];
		
		for (let i = 0; i < cornersVec3.length; i++) {
			pointings[i] = new Pointing(cornersVec3[i]);
			console.log(pointings[i].phi, pointings[i].theta);
		}

		// case when RA is just crossing the origin (e.g. 357deg - 3deg)
		for (let i = 0; i < pointings.length - 1; i+=1) {
			let a = pointings[i].phi;
			let b = pointings[i+1].phi;
			if (Math.abs(a - b) > Math.PI) {
				if (pointings[i].phi < pointings[i+1].phi) {
					pointings[i].phi += 2 * Math.PI;
				}else{
					pointings[i+1].phi += 2 * Math.PI;
				}
			} 
		}

		let x_grid, y_grid;
		
		let gridPoints = [];

		let result = {
			"min_y": NaN,
			"max_y": NaN,
			"min_x": NaN,
			"max_x": NaN,
			"gridPointsDeg": []
		}
		
		// console.log("HEALPix phi\tHEALPix theta\tcotheta (deg)\tcotheta (rad)");

		for (let j = 0; j < pointings.length; j++) {
			let coThetaRad = pointings[j].theta;
			let thetaRad = Math.PI/2 - coThetaRad;
			//let thetaRad = coThetaRad;

			let phiRad = pointings[j].phi;
			

			// projection on healpix grid
			let xyDeg = this.projectOnHPXGrid(phiRad, thetaRad);
			result.gridPointsDeg[j * 2] = xyDeg[0];
			result.gridPointsDeg[j * 2 + 1] = xyDeg[1];
			console.table({
				"HEALPix phi":phiRad * RAD2DEG,
				"HEALPix theta":thetaRad * RAD2DEG,
				"Proj x": xyDeg[0],
				"Proj y": xyDeg[1],
				"cotheta (deg)":coThetaRad * RAD2DEG,
				"cotheta (rad)":coThetaRad
			});

			if (isNaN(result.max_y) || xyDeg[1] > result.max_y ) {
				result.max_y = xyDeg[1];
			}
			if (isNaN(result.min_y) || xyDeg[1] < result.min_y) {
				result.min_y = xyDeg[1];
			}

			if (isNaN(result.max_x) || xyDeg[0] > result.max_x) {

				result.max_x = xyDeg[0];
			}
			if (isNaN(result.min_x) || xyDeg[0] < result.min_x) {
				result.min_x = xyDeg[0];
			}
		}

		// case when RA is just crossing the origin (e.g. 357deg - 3deg)
		// if ( Math.abs (result.max_x - result.min_x) > 180){
		// 	let tmp = result.max_x;
		// 	result.max_x = result.min_x + 360;
		// 	result.min_x = tmp;

		// 	// result.min_x += 360;
		// }

		// for (let k =0; k < result.gridPointsDeg.length; k+=2) {
			// console.table({"PROJ x":result.gridPointsDeg[k],"PROJ y":result.gridPointsDeg[k + 1]});
			// console.log("PROJ (x, y) = "+ result.gridPointsDeg[k] +", "+ result.gridPointsDeg[k+1] );
		// }
		return result;
	}
	
	/**
	 * assuming we're working with Healpix projection
	 * @param {*} thetaRad 
	 * @param {*} phiRad 
	 */
	projectOnHPXGrid(phiRad, thetaRad) {

		
		let x_grid, y_grid;

		if ( Math.abs(thetaRad) <= this.THETAX) { // equatorial belts
			x_grid = phiRad * RAD2DEG;
			
			y_grid = Hploc.sin(thetaRad) * K * 90 / H;
			

		} else if ( Math.abs(thetaRad) > this.THETAX) { // polar zones

			let phiDeg = phiRad  * RAD2DEG;

			let w = 0; // omega
			if (K % 2 !== 0 || thetaRad > 0) { // K odd or thetax > 0
				w = 1;
			}

			let sigma = Math.sqrt( K * (1 - Math.abs(Hploc.sin(thetaRad)) ) );
			let phi_c = - 180 + ( 2 * Math.floor( ((phiRad + 180) * H/360) + ((1 - w)/2) ) + w ) * ( 180 / H );
			
			x_grid = phi_c + (phiDeg - phi_c) * sigma;
			y_grid = (180  / H) * ( ((K + 1)/2) - sigma);

			if (thetaRad < 0) {
				y_grid *= -1;
			}
		}

		return [x_grid, y_grid];
	}

	/**
	 * 
	 * @param {*} x_mouse 
	 * @param {*} y_mouse 
	 */
	unproject(x_mouse, y_mouse) {

		let phiDeg, thetaDeg;
		let Yx = 90 * (K - 1) / H;

		

		if (Math.abs(y_mouse) <= Yx) { // equatorial belts

			phiDeg = x_mouse;
			thetaDeg = Math.asin( (y_mouse  * H) / (90 * K)) * RAD2DEG;

		} else if (Math.abs(y_mouse) > Yx) { // polar regions

			let sigma = (K + 1) / 2 - Math.abs(y_mouse * H) / 180;
			let w = 0; // omega
			if (K % 2 !== 0 || thetaRad > 0) { // K odd or thetax > 0
				w = 1;
			}
			let x_c = -180 + ( 2 * Math.floor((x_mouse + 180) * H/360 + (1 - w) /2  ) + w) * (180 / H);
			phiDeg = x_c + ( x_mouse - x_c) / sigma;
			let thetaRad = Hploc.asin( 1 - (sigma * sigma) / K );
			thetaDeg = thetaRad * RAD2DEG;
			if (y_mouse <= 0){
				thetaDeg *= -1;
			}
		}
		return [phiDeg, thetaDeg];
	
	}
	/**
	 * 
	 * @param {*} nside 
	 * @param {*} thetaDeg 
	 * @param {*} phiDeg 
	 */
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

	computeFITSij (radeg, decdeg) {
		let phirad = radeg * DEG2RAD;
		let thetarad = decdeg * DEG2RAD;
		let pxy = this.projectOnHPXGrid(phirad, thetarad);

		// let xyGridProj = this.getFacetProjectedCoordinates ();

		let i,j;
		
		let xInterval = Math.abs(this._xyGridProj.max_x - this._xyGridProj.min_x);
		let yInterval = Math.abs(this._xyGridProj.max_y - this._xyGridProj.min_y);

		let pi_norm, pj_norm;
		if ( (this._xyGridProj.min_x > 360 || this._xyGridProj.max_x > 360) && pxy[0] < this._xyGridProj.min_x) {
			pi_norm = (pxy[0] + 360 - this._xyGridProj.min_x) / xInterval;	
		}else {
			pi_norm = (pxy[0] - this._xyGridProj.min_x) / xInterval;
		}
		pj_norm = (pxy[1] - this._xyGridProj.min_y) / yInterval;
		
		i = 0.5 - (pi_norm - pj_norm);
		j = (pi_norm + pj_norm) - 0.5;
		i = Math.floor(i * 512);
		j = Math.floor(j * 512) + 1;
		return [i , j];
	}
	

	/**
	 * 
	 * @param {decimal degrees} leftMostRa 
	 * @param {decimal degrees} lowestDec 
	 * @param {decimal degrees} deltaRa 
	 * @param {decimal degrees} deltaDec 
	 */
	cutOutByBox (minra, deltara, mindec, deltadec) {

		let projection = ProjectionFactory.getProjection(constants.PROJECTIONS.MERCATOR, minra, mindec, deltara, deltadec, this);

		let fitsData = projection.generateMatrix();
		let fitsWriter = new FITSWriter();

		fitsData.bitpix = this._header.getValue('BITPIX');
		fitsData.blank = this._header.getValue('BLANK');
		fitsData.bscale = this._header.getValue('BSCALE');
		fitsData.bzero = this._header.getValue('BZERO');

		fitsWriter.run(fitsData);
		let fitsURL = fitsWriter.typedArrayToURL();
		return fitsURL;
	}

	/**
	 * 
	 * @param {*} centerRa degrees
	 * @param {*} centerDec degrees
	 * @param {*} radius degrees
	 */
	 circleCutOut (centerRa, centerDec, radius, projection){

		// instantiate the projection obj basing on MyProj skeleton (pix2world in the new proj)
		// create new FITS header with the projection 
		// (create the FITS matrix with pixel <-> coordinates RA, Dec )

		// for each RA,Dec from the new FITS
		// 	compute pix_value using HEALPix projection above
		// save to the payload of the resulting FITS

	}

	getFITSwidth () {
		return this._fitsWidth;
	}


	getFITSheight () {
		return this._fitsHeight;
	}

}
	
export default FITSOnTheWeb; 
	
	
	
	
	