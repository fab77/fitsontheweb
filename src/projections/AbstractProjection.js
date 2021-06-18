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

    constrructor(){

        if (new.target === AbstractProjection) {
            throw new TypeError("Abstract class cannot be instantiated.");
        }

        if (this.createHeader === undefined) {
            throw new TypeError("Must override createHeader()");
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

        if (this.addToFITS === undefined) {
            throw new TypeError("Must override addToFITS()");
        }

        if (this.getFITS === undefined) {
            throw new TypeError("Must override getFITS()");
        }

    }

}

export default AbstractProjection;