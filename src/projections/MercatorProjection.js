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
        this._scale = 20;
        this._deltara = deltara;
        this._deltadec = deltadec;
        this._minra = minra;
        this._mindec = mindec;
        this._fotw = fotw;


        let ij1 = this._fotw.computeFITSij(this._minra, this._mindec);
		let ij2 = this._fotw.computeFITSij(this._minra+this._deltara, this._mindec);
		this._np1 = this._scale * Math.abs(ij1[0] - ij2[0]);
		console.debug("[cutout np1]: "+this._np1);
		this._stepra = Math.abs(this._minra + this._deltara - this._minra) / this._np1;
		let ij3 = this._fotw.computeFITSij(this._minra, this._mindec);
		let ij4 = this._fotw.computeFITSij(this._minra, this._mindec + this._deltadec);
		this._np2 = this._scale * Math.abs(ij3[1] - ij4[1]);
		this._stepdec = Math.abs(this._mindec + this._deltadec - this._mindec) / this._np2;
		console.debug("[cutout np2]: " + this._np2);

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
    world2pix (radeg, decdeg) {
        
    }


    generateMatrix () {

        let radec;  // double array of degrees
        let data = new Uint8Array(2 * this._np1 * this._np2);
        let idx = 0;
        for (let i = 0; i < this._np1; i++) {
            
            for (let j = 0; j < this._np2; j++) {
                
                radec = this.pix2world(i, j);

                // retrieving pixel raw value from the original file using the original projection
                let origProj_ij = this._fotw.computeFITSij(radec[0], radec[1]);
                let pxval = this._fotw.getPixelValueFromScreenMouse(origProj_ij[0], origProj_ij[1]);
                // taking the only the 4th and 3rd bytes
                // let byte4 = (pxval & 0x000000FF) ;
                // let byte3 = (pxval & 0x0000FF00)>>8;


                // let byte1 = (pxval[0] & 0xFF000000) >> 24;
                // let byte2 = (pxval[0] & 0x00FF0000) >> 16;
                // let byte3 = (pxval[0] & 0x0000FF00) >> 8;
                // let byte4 = (pxval[0] & 0x000000FF);
                // let str = pxval[0] + pxval[1];
                // let byte11 = ParseUtils.getByteAt(str, 0);
                // let byte12 = ParseUtils.getByteAt(str, 1);
                // console.log(str.toString(2));
                
                // console.log(byte12.toString(2));
                // let tmp = 1.2179013843831301 + 0.00012976993255276655 * pxval;
                // let test1 = (new TextEncoder().encode(pxval)).length;
                // console.log((new TextEncoder().encode(pxval)));
                // console.log(((new TextEncoder().encode(pxval)) >>> 0).toString(2));
                
                // let tmp = parseInt((new TextEncoder().encode(pxval)));
                // console.log((tmp >>> 0).toString(2));

                idx = 2 * ( (this._np2 * i) + j );
                data[idx] = (new TextEncoder().encode(pxval))[0];
                data[idx+1] = (new TextEncoder().encode(pxval))[1];

            }
        }

        let crpix1 = Math.floor(this._np1 / 2);
        let crpix2 = Math.floor(this._np2 / 2);
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
            "naxis1": this._np1,
            "naxis2": this._np2
            
        };

    }
}

export default MercatorProjection;