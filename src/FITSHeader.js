/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/fitsontheweb
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 * 
 */

class FITSHeader{
	
	_keyValues;
	
	constructor(){
		this._keyValues = new Map();
	}
	
	setHeaderItem(key, value){
		
		this._keyValues.set(key, value);
		
	}
	
	getValue(key){
		return this._keyValues.get(key);
	}
	
}

export default FITSHeader;