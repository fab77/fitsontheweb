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
	
	_inProjection; 

	onFitsLoaded (fitsData) {
		this._encodedFitsData = fitsData;
		this._img = this.processFits(this._encodedFitsData);
		
		this._inProjection = ProjectionFactory.getProjection(constants.PROJECTIONS.HEALPIX);
		let nside = Math.pow(2, this._header.getValue('ORDER'));
		this._inProjection.init(nside, this._header.getValue('NPIX'), this._header.getValue('NAXIS1'),this._header.getValue('NAXIS2'))

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
		return this._payload.getPixelValueFromScreenMouse (i, j);
	}
	


	getAstroCoordinatesFromFITS2(i_mouse, j_mouse) {
		return this._inProjection.pix2world(i_mouse, j_mouse);
	}

	
	
	// }
	/**
	 * 
	 * @param {*} nside 
	 * @param {*} thetaDeg 
	 * @param {*} phiDeg 
	 */
	getFITSIndexes (nside, thetaDeg, phiDeg) {

		let pointsGrid = getGridPixelCoordinates (nside);

		let thetaStep = Math.abs(pointsGrid.maxTheta - pointsGrid.minTheta) / this._header.getValue('NAXIS1');
		let phiStep = Math.abs(pointsGrid.maxPhi - pointsGrid.minPhi) / this._header.getValue('NAXIS2');
		let i, j;
		i = Math.floor(thetaDeg / thetaStep);
		j = Math.floor(phiDeg / phiStep);
		return [i, j];

	}

	computeFITSij2(radeg, decdeg){
		return this._inProjection.world2pix(radeg, decdeg);
	}
	

	/**
	 * @param {decimal degrees} leftMostRa 
	 * @param {decimal degrees} lowestDec 
	 * @param {decimal degrees} deltaRa 
	 * @param {decimal degrees} deltaDec 
	 */
	cutOutByBox (minra, deltara, mindec, deltadec, projectionType) {

		let projection = ProjectionFactory.getProjection(projectionType);

		let fitsData = projection.generatePxMatrix(minra, mindec, deltara, deltadec, this, 200);
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
	
	
	
	
	