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

    generateMatrixData(leftmostRa, deltaRa, stepRa, lowestDec, deltaDec, stepDec, fOTW) {

        let idx = 0;
        let fits_width = deltaRa / stepRa;
        let fits_height = deltaDec / stepDec;
        let data = [];
        let rows = 0;


        let r1 = Math.floor(fits_width/2);
        let r2 = Math.floor(fits_height/2);
        let s1 = deltaRa;
        let s2 = deltaDec;
        let p1, p2;

        for (let currRa = leftmostRa; currRa < leftmostRa + deltaRa; currRa += stepRa) {
            
            for (let currDec = lowestDec; currDec < lowestDec + deltaDec; currDec += stepDec) {

                /**
                 * Paper "Representation of celestial coordinates in FITS":
                 * - section 5.1.3 for the TAN projection
                 * - eq (1) assuming PCi_j is an identical matrix => s1 and s2 are CDELT1 and CDELT2 respectively
                 * 
                 * Paper "Representation of world coordinates in FITS":
                 * - eq. (1), (2), (3)
                 * 
                 * algo to find coordinates in the final (TAN) FITS
                 * (x1, x2) in deg unprojrcted with gnomonic to the plane x1, x2
                 * s1 = cdelt1 = stepRa, s2 = cdelt2 = stepDec
                 * from x1 = s1*(p1 - r1) we derive p1 = Math.floor(x1/s1 + r1)
                 * from x2 = s2*(p2 - r2) we derive p2 = Math.floor(x2/s2 + r2)
                 */
                
                // computing (x1, x2) from RA and Dec in Gnomonic proj
                let xy = this.world2intermediateWorld(currRa, currDec);

                // computing pixel coordinates
                p1 = Math.floor(r1 + xy[0]/s1 );
                p2 = Math.floor(r2 + xy[1]/s2 );
                
                idx = (p1 * rows) + p2  ;

                // computing pixel value using input FITS data (HPX projection)
                let origProj_ij = fOTW.computeFITSij(currRa, currDec);
                let pxval = fOTW.getPixelValueFromScreenMouse(origProj_ij[0], origProj_ij[1]);
                data[idx] = pxval;
                // idx += 1;
            }
         
            rows +=1;
        }

        return {
            'data': data,
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