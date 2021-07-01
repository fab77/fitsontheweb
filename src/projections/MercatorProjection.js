"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/fitsontheweb
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */


import AbstractProjection from './AbstractProjection';
import ParseUtils from '../ParseUtils';

class MercatorProjection extends AbstractProjection {

    _deltara;
    _deltadec;
    _minra;
    _mindec;
    _stepra;
    _stepdec;
    _np1;
    _np2;
    _scale;
    _fotw;

    constructor (minra, mindec, deltara, deltadec, fotw) {
        super();
        // this._scale = 200;
        // this._deltara = deltara;
        // this._deltadec = deltadec;
        // this._minra = minra;
        // this._mindec = mindec;
        // this._fotw = fotw;


        // let ij1 = this._fotw.computeFITSij(this._minra, this._mindec);
		// let ij2 = this._fotw.computeFITSij(this._minra+this._deltara, this._mindec);
		// this._np1 = this._scale * Math.abs(ij1[0] - ij2[0]);
		// console.debug("[cutout np1]: "+this._np1);
		// this._stepra = Math.abs(this._minra + this._deltara - this._minra) / this._np1;

		// // let ij3 = this._fotw.computeFITSij(this._minra, this._mindec);
		// let ij4 = this._fotw.computeFITSij(this._minra, this._mindec + this._deltadec);
		// this._np2 = this._scale * Math.abs(ij1[1] - ij4[1]);
		// this._stepdec = Math.abs(this._mindec + this._deltadec - this._mindec) / this._np2;
		// console.debug("[cutout np2]: " + this._np2);

    }

    
    pix2world (i, j) {

        let ra, dec;
        ra = i * this._stepra + this._minra;
        dec = j * this._stepdec + this._mindec;
        return [ra, dec];

    }

    /**
     * 
     * @param {*} radeg 
     * @param {*} decdeg
     *  
     */
    world2pix (radeg, decdeg) {}


    generatePxMatrix (minra, mindec, deltara, deltadec, fotw, pxscale) {

        this._minra = minra;
        this._mindec = mindec;
        
        let np1, np2;
        let ij1, ij2, ij4;
        


        ij1 = fotw.computeFITSij2(this._minra, this._mindec);
		ij2 = fotw.computeFITSij2(this._minra + deltara, this._mindec);
		np1 = pxscale * Math.abs(ij1[0] - ij2[0]);
		console.debug("[cutout np1]: " + np1);
		this._stepra = Math.abs(this._minra + deltara - this._minra) / np1;

		// let ij3 = this._fotw.computeFITSij(this._minra, this._mindec);
		ij4 = fotw.computeFITSij2(this._minra, this._mindec + deltadec);
		np2 = pxscale * Math.abs(ij1[1] - ij4[1]);
		this._stepdec = Math.abs(this._mindec + deltadec - this._mindec) / np2;
		console.debug("[cutout np2]: " + np2);

        let radec;  // double array of degrees
        let data = new Uint8Array(2 * np1 * np2);
        let idx = 0;
        for (let j = 0; j < np2; j++) {
            for (let i = 0; i < np1; i++) {
            
                
                radec = this.pix2world(i, j);

                // retrieving pixel raw value from the original file using the original projection
                let origProj_ij = fotw.computeFITSij2(radec[0], radec[1]);
                let pxval = fotw.getPixelValueFromScreenMouse(origProj_ij[0], origProj_ij[1]);
                
                data[idx++] = pxval[0];
                data[idx++] = pxval[1];
                
            }
        }

        let crpix1 = Math.floor(np1 / 2);
        let crpix2 = Math.floor(np2 / 2);
        let crvals = this.pix2world(crpix1, crpix2);
        let crval1 = crvals[0];
        let crval2 = crvals[1];
        return {
            "crpix1": crpix1,
            "crpix2": crpix2,
            "crval1": crval1,
            "crval2": crval2,
            "ctype1": "RA---MER",
            "ctype2": "DEC--MER",
            "cdelt1": this._stepra,
            "cdelt2": this._stepdec,
            "data": data,
            "naxis1": np1,
            "naxis2": np2
            
        };

    }
}

export default MercatorProjection;