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
     */
    world2pix(ra, deg) {

        let phiTheta = this.convertRaDec2PhiTheta(ra, deg);
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

        for (let i = leftmostRa; i < leftmostRa + deltaRa; i += stepRa) {
            
            for (let j = lowestDec; j < lowestDec + deltaDec; j += stepDec) {
                let xy = this.world2pix(i, j);
                let origProj_ij = fOTW.computeFITSij(i, j);
                //TODO !!! this should take the pixel value instead of the computed physical value !!!
			    // let pxval = fOTW.getPhysicalPixelValueFromScreenMouse(origProj_ij[0], origProj_ij[1]);
                let pxval = fOTW.getPixelValueFromScreenMouse(origProj_ij[0], origProj_ij[1]);
                

                data[idx] = pxval;
                idx += 1;
            }
            // console.log(data);    
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