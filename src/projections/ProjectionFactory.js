/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/fitsontheweb
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 * import GnomonicProjection from './GnomonicProjection';
 */

import {constants} from '../Constants';
import GnomonicProjection from './GnomonicProjection';

class ProjectionFactory {

    /**
     * 
     * @param {PROJECTIONS} projection 
     */
    static getProjection(projection) {

        switch (projection) {
            case constants.PROJECTIONS.GNOMONIC:
                return new GnomonicProjection();
            default:
                throw new TypeError("Projection "+projection+" not supported or recognised");
        }
    }
}

export default ProjectionFactory;