"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/fitsontheweb
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 * import GnomonicProjection from './GnomonicProjection';
 */


import AbstractProjection from './AbstractProjection';

class GnomonicProjection extends AbstractProjection {

    // data;

    constructor () {
        super();
        // this.data = [];
    }

    createHeader(){}

    /**
     * 
     * @param {double} i 
     * @param {double} j 
     * @returns RA, Dec
     */
    pix2world(x, y) {

        let R = Math.sqrt(x*x + y*y);
        let theta = Math.atan2( (Math.Pi * R) / 180 );
        


    }

    /**
     * 
     * @param {decimal degrees} ra 
     * @param {decimal degrees} dec 
     * @returns [X, Y] projection on the cartesian plane of RA and Dec
     * 
     * Paper "Representation of celestial coordinates in FITS":
     * - section 5.1.3 for the TAN projection
     */
     world2intermediateWorld(ra, dec) {

        let phiTheta = this.convertRaDec2PhiTheta(ra, dec);
        // let phiTheta = {
        //     "phi": ra,
        //     "theta": dec
        // }
        let R = 180 / Math.PI * Math.cos(phiTheta.theta) / Math.sin(phiTheta.theta);
        let x = R * Math.sin (phiTheta.phi);
        let y = - R * Math.cos (phiTheta.phi);

        return [x, y];
    }


    // assuming working with latitude [-90, 90] => (ra, dec) = (lon, lat) = (phi, lambda)
    // https://mathworld.wolfram.com/GnomonicProjection.html
    world2intermediateWorld2(ra, dec, centralra, centraldec) {

        
        let rads = {
            "p": (ra * Math.PI/180.0),            // point phi in rad
            "l": (dec * Math.PI/180.0),           // point lambda in rad
            "c_p": (centralra * Math.PI/180.0),   // central projection point phi in rad
            "c_l": (centraldec * Math.PI/180.0)   // central projection point lambda in rad
        }

        // c angular distance of point (x, y) from the center of the projection
        let cos_c = Math.sin(rads.c_p) * Math.sin(rads.p) + Math.cos(rads.c_p) * Math.cos(rads.c_p) * Math.cos(rads.l - rads.c_l);
        let x = 1/cos_c * Math.cos(rads.p) * Math.sin(rads.l - rads.c_l);
        let y = 1/cos_c * (Math.cos(rads.c_p) * Math.sin(rads.p) - Math.sin(rads.c_p) * Math.cos(rads.p) * Math.cos(rads.l - rads.c_l));

        let xDeg = x * 180 / Math.PI;
        let yDeg = y * 180 / Math.PI;

        return [xDeg, yDeg];
    }

    generateMatrixData(lowsetRa, deltaRa, stepRa, lowestDec, deltaDec, stepDec, fOTW) {

        let idx = 0;
        let fits_width = Math.floor(deltaRa / stepRa);
        let fits_height = Math.floor(deltaDec / stepDec);
        
        // let data = new Uint16Array(fits_width * fits_height +1);
        let data = new Uint8Array(2 *(fits_width * fits_height +1));
        
        let rows = 0;
        let cols = 0;


        let cRaDeg = lowsetRa + deltaRa / 2;
        let cDecDeg = lowestDec + deltaDec / 2;


        let r1 = Math.floor(fits_width/2);
        let r2 = Math.floor(fits_height/2);
        // let s1 = deltaRa/2;
        // let s2 = deltaDec/2;
        let s1 = stepRa;
        let s2 = stepDec;
        let p1, p2;

        for (let currRa = lowsetRa; currRa < lowsetRa + deltaRa; currRa += stepRa) {
            cols = 0;
            for (let currDec = lowestDec; currDec < lowestDec + deltaDec; currDec += stepDec) {

                /**
                 * Paper "Representation of celestial coordinates in FITS":
                 * - section 5.1.3 for the TAN projection
                 * - eq (1) assuming PCi_j is an identical matrix => s1 and s2 are CDELT1 and CDELT2 respectively
                 * 
                 * Paper "Representation of world coordinates in FITS":
                 * - eq. (1), (2), (3)
                 * 
                 * algorithm to find coordinates in the final (TAN) FITS
                 * (x1, x2) in deg unprojected with gnomonic to the plane x1, x2
                 * s1 = cdelt1 = stepRa, s2 = cdelt2 = stepDec
                 * from x1 = s1*(p1 - r1) we derive p1 = Math.floor(x1/s1 + r1)
                 * from x2 = s2*(p2 - r2) we derive p2 = Math.floor(x2/s2 + r2)
                 */
                
                // computing (x1, x2) from RA and Dec in Gnomonic proj
                // let xy = this.world2intermediateWorld(currRa, currDec);
                let xy = this.world2intermediateWorld(currRa, currDec, cRaDeg, cDecDeg);


                p1 = ((currRa - lowsetRa) / deltaRa) * fits_width;
                p2 = ((currDec - lowestDec) / deltaDec) * fits_height;
                // idx = Math.floor(p1 * fits_width + p2) ;
                idx = 2 * Math.floor(p1 * fits_width + p2) ;
                // computing pixel coordinates (WRONG! lienar interpolation instead)
                // p1 = Math.floor(r1 + xy[0]/s1 );
                // p2 = Math.floor(r2 + xy[1]/s2 );
                // WRONG AS WELL
                // idx = (p1 * rows) + p2;

                // computing pixel value using input FITS data (HPX projection)
                let origProj_ij = fOTW.computeFITSij(currRa, currDec);
                let pxval = fOTW.getPixelValueFromScreenMouse(origProj_ij[0], origProj_ij[1]);
                // data[idx] = pxval;
                // console.log("idx "+idx+" pxval "+pxval+" "+pxval.toString(2));
                let byte4 = (pxval & 0x000000FF) ;
                let byte3 = (pxval & 0x0000FF00)>>8;
                data[idx] = byte3;
                data[idx+1] = byte4;

                
                // console.log("data["+idx+"] "+data[idx]+" "+data[idx].toString(2));
                // data[idx+1] = pxval & 0x00FF;
                // console.log("data[idx+1] "+data[idx+1]+" "+data[idx+1].toString(2));
                // idx += 1;
                cols+= 1;
            }
         
            rows +=1;
        }

        // let ab = new ArrayBuffer(data.length);
        // let view = new Uint8Array(ab);

        let crxy = this.world2intermediateWorld2(cRaDeg, cDecDeg, cRaDeg, cDecDeg);
        let crp1 = Math.floor(r1 + crxy[0]/s1 );
        let crp2 = Math.floor(r2 + crxy[1]/s2 );

        // // computing pixel value using input FITS data (HPX projection)
        // let cr_origProj_ij = fOTW.computeFITSij(cRaDeg, cDecDeg);
        // let cr_pxval = fOTW.getPixelValueFromScreenMouse(cr_origProj_ij[0], cr_origProj_ij[1]);

        return {
            'crpix1': crp1,
            'crpix2': crp2,
            'crval1': cRaDeg,
            'crval2': cDecDeg,
            "cdelt1": s1,
            "cdelt2": s2,
            'data': data,
            "naxis1": rows,
            "naxis2": cols,
            'nrows': rows
        };
    }

    /**
     * 
     * @param {decimal degrees} ra 
     * @param {decimal degrees} dec 
     * @returns phi and theta {decimal degrees}
     */
    convertRaDec2PhiTheta (ra, dec) {

        let phi = ra;
        let theta = 90 - dec;
        return {
            "phi": phi,
            "theta": theta
        }
    }

    addToFITS() {}

    getFITS() {}

}

export default GnomonicProjection;