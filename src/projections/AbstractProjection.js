/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/fitsontheweb
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 * import GnomonicProjection from './GnomonicProjection';
 */

class AbstractProjection {

    constructor(minra, mindec, deltara, deltadec, fotw){

        if (new.target === AbstractProjection) {
            throw new TypeError("Abstract class cannot be instantiated.");
        }

        if (this.generateMatrix === undefined) {
            throw new TypeError("Must override generateMatrix()");
        }

        /**
         * 
         * @param {double} i 
         * @param {double} j 
         * @returns RA, Dec
         */
        if (this.pix2world === undefined) {
            throw new TypeError("Must override pix2world(i, j)");
        }

        /**
         * 
         * @param {double} ra 
         * @param {double} dec 
         * @returns [X, Y] projection on the cartesian plane of RA and Dec
         */
        if (this.world2pix === undefined) {
            throw new TypeError("Must override world2pix(ra, dec)");
        }

    }

}

export default AbstractProjection;