/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/fitsontheweb
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>

 */

import {constants} from '../Constants';
import HEALPixProjection from './HEALPixProjection';
import GnomonicProjection from './GnomonicProjection';
import MercatorProjection from './MercatorProjection';

class ProjectionFactory {

    /**
     * 
     * @param {PROJECTIONS} projection 
     */
    static getProjection(projection) {

        switch (projection) {
            case constants.PROJECTIONS.HEALPIX:
                return new HEALPixProjection();
            case constants.PROJECTIONS.GNOMONIC:
                return new GnomonicProjection();
            case constants.PROJECTIONS.MERCATOR:
                return new MercatorProjection();
            default:
                throw new TypeError("Projection "+projection+" not supported or recognised");
        }
    }
}

export default ProjectionFactory;