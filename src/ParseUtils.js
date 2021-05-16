

/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/fitsontheweb
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 * 
 */

class ParseUtils {
	

	static getStringAt (data, offset, length) {
		let chars = [];
		for (let i=offset,j=0;i<offset+length;i++,j++) {
			
			chars[j] = String.fromCharCode(data.charCodeAt(i) & 0xFF);
			
		}
		return chars.join("");
	}
	
//	static getPhysicalNumber(idx, BITPIX, BZERO, BSCALE, data){
//		let val;
//    	if (BITPIX == 16){ // 16-bit 2's complement binary integer
//    		
//    		val = ParseUtils.parse16bit2sComplement(data, idx, true); //IEEE 754 half precision (float16)
//    		
//		}else if (this.BITPIX == -32){	// 32 bit single precision 
//			
//			val = ParseUtils.parse32bitSinglePrecisionFloatingPoint (data, idx, true); //IEEE 754 float32 is always big-endian	
//			if (val != 0){
//				val = (1.0+((val&0x007fffff)/0x0800000)) * Math.pow(2,((val&0x7f800000)>>23) - 127); // long to float conversion
//			}
//			
//		}
//    	// computing physical value
//    	let p_val = BZERO + BSCALE * val;
//    	return p_val;
//	}
	
	static parse32bitSinglePrecisionFloatingPoint (data, offset) {
		var byte1 = ParseUtils.getByteAt(data, offset);
		let byte2 = ParseUtils.getByteAt(data, offset + 1);
		let byte3 = ParseUtils.getByteAt(data, offset + 2);
		let byte4 = ParseUtils.getByteAt(data, offset + 3);
		
		let long = (((((byte1 << 8) + byte2) << 8) + byte3) << 8) + byte4;
		if (long < 0) long += 4294967296;
		
//		if (byte1 !== 192 && byte2 !== 0 && byte3 !== 0 && byte4 !== 127){
//			check = true;
//		}

		return long;
	}
	
	
	
	
	static parse16bit2sComplement(data, offset) {
		let byte1 = ParseUtils.getByteAt(data, offset);
		let byte2 = ParseUtils.getByteAt(data, offset + 1);
		let h = 0x0000 | (byte1 << 8) | byte2;
		
		let s = (h & 0x8000) >> 15;
		let e = (h & 0x7C00) >> 10;
		let f = h & 0x03FF; // non usato ma forse va cambiato in 0x07FF

		let res = h & 0x0000FFFF;
	    
	    if (s){
	    	res = (~h & 0x0000FFFF)  + 1;
	    	return -1 * res;
	    }
	    return res;

	}

	static parse32bit2sComplement(data, offset) {
		let byte1 = ParseUtils.getByteAt(data, offset);
		let byte2 = ParseUtils.getByteAt(data, offset + 1);
		let byte3 = ParseUtils.getByteAt(data, offset + 2);
		let byte4 = ParseUtils.getByteAt(data, offset + 3);
		
		let h = (byte1 << 24) | (byte2 << 16) | (byte3 << 8) | byte4;
		
		let s = (h & 0x80000000) >> 31;
		let e = (h & 0x7FC00000) >> 23;
		let f =  h & 0x007FFFFF;

		let res = h & 0xFFFFFFFF;
	    
	    if (s){
	    	res = (~h & 0xFFFFFFFF)  + 1;
	    	return -1 * res;
	    }
	    return res;

	}
	
	static getByteAt (data, offset) {
		let dataOffset = 0;
		return data.charCodeAt(offset + dataOffset) & 0xFF;
	}
	
	
}

export default ParseUtils;