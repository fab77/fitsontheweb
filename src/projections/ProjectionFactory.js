/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/fitsontheweb
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>

 */

import {constants} from '../Constants';
import GnomonicProjection from './GnomonicProjection';
import MercatorProjection from './MercatorProjection';

class ProjectionFactory {

    /**
     * 
     * @param {PROJECTIONS} projection 
     */
    static getProjection(projection, minra, mindec, deltara, deltadec, fotw) {

        switch (projection) {
            case constants.PROJECTIONS.GNOMONIC:
                return new GnomonicProjection(minra, mindec, deltara, deltadec, fotw);
            case constants.PROJECTIONS.MERCATOR:
                return new MercatorProjection(minra, mindec, deltara, deltadec, fotw);
            default:
                throw new TypeError("Projection "+projection+" not supported or recognised");
        }
    }
}

export default ProjectionFactory;