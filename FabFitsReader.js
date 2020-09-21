"use strict";

/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github URL
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 * 
 * 
 * 
 * BITPIX definition from https://archive.stsci.edu/fits/fits_standard/node39.html
 * 8	Character or unsigned binary integer
 * 16	16-bit twos-complement binary integer
 * 32	32-bit twos-complement binary integer
 * -32	IEEE single precision floating point
 * -64	IEEE double precision floating point
 * 
 */

class FabFitsReader {
	
	
//		r = [0.00000, 0.769231, 1.53846, 2.30769, 3.07692, 3.84615, 4.61538, 5.38462, 6.15385, 6.92308, 7.69231, 8.46154,
//	 	    9.23077, 10.0000, 11.5385, 13.0769, 14.6154, 16.1538, 17.6923, 19.2308, 20.7692, 22.3077, 23.8462, 25.3846,
//	 	    26.9231, 28.4615, 30.0000, 33.8462, 37.6923, 41.5385, 45.3846, 49.2308, 53.0769, 56.9231, 60.7692, 64.6154,
//	 	    68.4615, 72.3077, 76.1538, 80.0000, 88.5385, 97.0769, 105.615, 114.154, 122.692, 131.231, 139.769, 148.308,
//	 	    156.846, 165.385, 173.923, 182.462, 191.000, 193.846, 196.692, 199.538, 202.385, 205.231, 208.077, 210.923,
//	 	    213.769, 216.615, 219.462, 222.308, 225.154, 228.000, 229.182, 230.364, 231.545, 232.727, 233.909, 235.091,
//	 	    236.273, 237.455, 238.636, 239.818, 241.000, 241.000, 241.364, 241.727, 242.091, 242.455, 242.818, 243.182,
//	 	    243.545, 243.909, 244.273, 244.636, 245.000, 245.231, 245.462, 245.692, 245.923, 246.154, 246.385, 246.615,
//	 	    246.846, 247.077, 247.308, 247.538, 247.769, 248.000, 248.146, 248.292, 248.438, 248.585, 248.731, 248.877,
//	 	    249.023, 249.169, 249.315, 249.462, 249.608, 249.754, 249.900, 249.312, 248.723, 248.135, 247.546, 246.958,
//	 	    246.369, 245.781, 245.192, 244.604, 244.015, 243.427, 242.838, 242.250, 239.308, 236.365, 233.423, 230.481,
//	 	    227.538, 224.596, 221.654, 218.712, 215.769, 212.827, 209.885, 206.942, 204.000, 201.000, 198.000, 195.000,
//	 	    192.000, 189.000, 186.000, 183.000, 180.000, 177.000, 174.000, 171.000, 168.000, 165.000, 161.077, 157.154,
//	 	    153.231, 149.308, 145.385, 141.462, 137.538, 133.615, 129.692, 125.769, 121.846, 117.923, 114.000, 115.038,
//	 	    116.077, 117.115, 118.154, 119.192, 120.231, 121.269, 122.308, 123.346, 124.385, 125.423, 126.462, 127.500,
//	 	    131.423, 135.346, 139.269, 143.192, 147.115, 151.038, 154.962, 158.885, 162.808, 166.731, 170.654, 174.577,
//	 	    178.500, 180.462, 182.423, 184.385, 186.346, 188.308, 190.269, 192.231, 194.192, 196.154, 198.115, 200.077,
//	 	    202.038, 204.000, 205.962, 207.923, 209.885, 211.846, 213.808, 215.769, 217.731, 219.692, 221.654, 223.615,
//	 	    225.577, 227.538, 229.500, 230.481, 231.462, 232.442, 233.423, 234.404, 235.385, 236.365, 237.346, 238.327,
//	 	    239.308, 240.288, 241.269, 242.250, 242.642, 243.035, 243.427, 243.819, 244.212, 244.604, 244.996, 245.388,
//	 	    245.781, 246.173, 246.565, 246.958, 247.350, 247.814, 248.277, 248.741, 249.205, 249.668, 250.132, 250.595,
//	 	    251.059, 251.523, 251.986, 252.450];
//		g = [0.00000, 1.53846, 3.07692, 4.61538, 6.15385, 7.69231, 9.23077, 10.7692, 12.3077, 13.8462, 15.3846, 16.9231,
//	 	    18.4615, 20.0000, 32.6154, 45.2308, 57.8462, 70.4615, 83.0769, 95.6923, 108.308, 120.923, 133.538, 146.154,
//	 	    158.769, 171.385, 184.000, 187.923, 191.846, 195.769, 199.692, 203.615, 207.538, 211.462, 215.385, 219.308,
//	 	    223.231, 227.154, 231.077, 235.000, 235.308, 235.615, 235.923, 236.231, 236.538, 236.846, 237.154, 237.462,
//	 	    237.769, 238.077, 238.385, 238.692, 239.000, 239.077, 239.154, 239.231, 239.308, 239.385, 239.462, 239.538,
//	 	    239.615, 239.692, 239.769, 239.846, 239.923, 240.000, 240.091, 240.182, 240.273, 240.364, 240.455, 240.545,
//	 	    240.636, 240.727, 240.818, 240.909, 241.000, 241.000, 240.909, 240.818, 240.727, 240.636, 240.545, 240.455,
//	 	    240.364, 240.273, 240.182, 240.091, 240.000, 239.615, 239.231, 238.846, 238.462, 238.077, 237.692, 237.308,
//	 	    236.923, 236.538, 236.154, 235.769, 235.385, 235.000, 232.615, 230.231, 227.846, 225.462, 223.077, 220.692,
//	 	    218.308, 215.923, 213.538, 211.154, 208.769, 206.385, 204.000, 200.077, 196.154, 192.231, 188.308, 184.385,
//	 	    180.462, 176.538, 172.615, 168.692, 164.769, 160.846, 156.923, 153.000, 147.115, 141.231, 135.346, 129.462,
//	 	    123.577, 117.692, 111.808, 105.923, 100.038, 94.1538, 88.2692, 82.3846, 76.5000, 73.0769, 69.6538, 66.2308,
//	 	    62.8077, 59.3846, 55.9615, 52.5385, 49.1154, 45.6923, 42.2692, 38.8462, 35.4231, 32.0000, 29.5385, 27.0769,
//	 	    24.6154, 22.1538, 19.6923, 17.2308, 14.7692, 12.3077, 9.84615, 7.38462, 4.92308, 2.46154, 0.00000, 9.80769,
//	 	    19.6154, 29.4231, 39.2308, 49.0385, 58.8462, 68.6538, 78.4615, 88.2692, 98.0769, 107.885, 117.692, 127.500,
//	 	    131.423, 135.346, 139.269, 143.192, 147.115, 151.038, 154.962, 158.885, 162.808, 166.731, 170.654, 174.577,
//	 	    178.500, 180.462, 182.423, 184.385, 186.346, 188.308, 190.269, 192.231, 194.192, 196.154, 198.115, 200.077,
//	 	    202.038, 204.000, 205.962, 207.923, 209.885, 211.846, 213.808, 215.769, 217.731, 219.692, 221.654, 223.615,
//	 	    225.577, 227.538, 229.500, 230.481, 231.462, 232.442, 233.423, 234.404, 235.385, 236.365, 237.346, 238.327,
//	 	    239.308, 240.288, 241.269, 242.250, 242.642, 243.035, 243.427, 243.819, 244.212, 244.604, 244.996, 245.388,
//	 	    245.781, 246.173, 246.565, 246.958, 247.350, 247.814, 248.277, 248.741, 249.205, 249.668, 250.132, 250.595,
//	 	    251.059, 251.523, 251.986, 252.450];
//		b = [255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000,
//	 	    255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000,
//	 	    255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000,
//	 	    255.000, 255.000, 255.000, 255.000, 254.615, 254.231, 253.846, 253.462, 253.077, 252.692, 252.308, 251.923,
//	 	    251.538, 251.154, 250.769, 250.385, 250.000, 249.615, 249.231, 248.846, 248.462, 248.077, 247.692, 247.308,
//	 	    246.923, 246.538, 246.154, 245.769, 245.385, 245.000, 242.000, 239.000, 236.000, 233.000, 230.000, 227.000,
//	 	    224.000, 221.000, 218.000, 215.000, 212.000, 212.000, 208.636, 205.273, 201.909, 198.545, 195.182, 191.818,
//	 	    188.455, 185.091, 181.727, 178.364, 175.000, 171.538, 168.077, 164.615, 161.154, 157.692, 154.231, 150.769,
//	 	    147.308, 143.846, 140.385, 136.923, 133.462, 130.000, 122.942, 115.885, 108.827, 101.769, 94.7115, 87.6539,
//	 	    80.5962, 73.5385, 66.4808, 59.4231, 52.3654, 45.3077, 38.2500, 36.2885, 34.3269, 32.3654, 30.4038, 28.4423,
//	 	    26.4808, 24.5192, 22.5577, 20.5962, 18.6346, 16.6731, 14.7115, 12.7500, 11.7692, 10.7885, 9.80769, 8.82692,
//	 	    7.84615, 6.86539, 5.88461, 4.90385, 3.92308, 2.94231, 1.96154, 0.980769, 0.00000, 2.46154, 4.92308, 7.38462,
//	 	    9.84616, 12.3077, 14.7692, 17.2308, 19.6923, 22.1538, 24.6154, 27.0769, 29.5385, 32.0000, 32.0000, 32.0000,
//	 	    32.0000, 32.0000, 32.0000, 32.0000, 32.0000, 32.0000, 32.0000, 32.0000, 32.0000, 32.0000, 32.0000, 41.3077,
//	 	    50.6154, 59.9231, 69.2308, 78.5385, 87.8462, 97.1539, 106.462, 115.769, 125.077, 134.385, 143.692, 153.000,
//	 	    156.923, 160.846, 164.769, 168.692, 172.615, 176.538, 180.462, 184.385, 188.308, 192.231, 196.154, 200.077,
//	 	    204.000, 205.962, 207.923, 209.885, 211.846, 213.808, 215.769, 217.731, 219.692, 221.654, 223.615, 225.577,
//	 	    227.538, 229.500, 230.481, 231.462, 232.442, 233.423, 234.404, 235.385, 236.365, 237.346, 238.327, 239.308,
//	 	    240.288, 241.269, 242.250, 242.838, 243.427, 244.015, 244.604, 245.192, 245.781, 246.369, 246.958, 247.546,
//	 	    248.135, 248.723, 249.312, 249.900, 250.096, 250.292, 250.488, 250.685, 250.881, 251.077, 251.273, 251.469,
//	 	    251.665, 251.862, 252.058, 252.254, 252.450, 252.682, 252.914, 253.145, 253.377, 253.609, 253.841, 254.073,
//	 	    254.305, 254.536, 254.768, 255.000];
		
		BITPIX; // mandatory
		BLANK;
		BZERO = 0;	// physical_value = BZERO + BSCALE * array_value;
		BSCALE = 1;	// physical_value = BZERO + BSCALE * array_value;
		NAXIS1;
		NAXIS2;
		NAXIS = 2;
		SIMPLE = "T"; // for FITS following the STSCI standard. F if different standard
		colorMap = [];
		
	
	constructor (url, in_colorMap, callback){
		var self = this;
		this.colorMap = in_colorMap;
		
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, false);
	    xhr.overrideMimeType("text/plain; charset=x-user-defined");
	    
	    xhr.onload = function() {
	    	var img = self.processFits(xhr.responseText);
	    	img.onclick = function(){
	    		console.log("Clicked on img "+url);
	    	}
	    	callback(img);
	    }

		xhr.send(null);
	}
	
	processFits (data) {
		var headerOffset = this.readHeader(data);
		return this.readPayload(data, headerOffset);
	}
	
	readHeader (fitsFile) {
		var length = fitsFile.length;
		var offset = 0;
		var LINEWIDTH = 80;
		var header = {};
		var key;
		var val;

		var str;
		
		while (offset < length){
			str = this.getStringAt(fitsFile, offset,LINEWIDTH);
			offset += LINEWIDTH;
			var eq = str.indexOf('=');
			key = this.trim(str.substring(0,eq))
			val = this.trim(str.substring(eq+1,Math.max(str.indexOf('/'),str.length)))
			if(key.length > 0){
				if(val.indexOf("'") == 0 || key == "SIMPLE"){
					// It is a string
					val = val.substring(1,val.length-2)
				}else{
					if(val.indexOf('.') >= 0) val = parseFloat(val); // Floating point
					else val = parseInt(val); // Integer
				}
				header[key] = val;
			}
			if(str.indexOf('END') == 0) {
//				console.log("Found END with offset "+offset);
				break;
			}
		}

		this.BZERO = 0;	// physical_value = BZERO + BSCALE * array_value;
		this.BSCALE = 1;
		
		if(typeof header.NAXIS1=="number") this.width = header.NAXIS1;
		if(typeof header.NAXIS2=="number") this.height = header.NAXIS2;
		
		if (header.SIMPLE !== "undefined"){
			this.SIMPLE = header.SIMPLE; 
		}else{
			console.err("Not STSCI standard FITS. SIMPLE = "+header.SIMPLE);
			exit(-1);
		}
		
		if (header.BITPIX !== "undefined"){
			this.BITPIX = header.BITPIX; 
		}else{
			console.err("BITPIX not defined.");
			exit(-1);
		}
		
		if (header.BLANK !== "undefined"){
			this.BLANK = header.BLANK; 
		}
		
		if (header.BZERO !== "undefined"){
			this.BZERO = header.BZERO; 
		}
		
		if (header.BSCALE !== "undefined"){
			this.BSCALE = header.BSCALE; 
		}
		
		console.log("width "+this.width+", height "+this.height);
		// Remove any space padding
		while(offset < length && this.getStringAt(fitsFile,offset,1) == " ") offset++;
//		console.log("offset "+offset);
		return offset;
	}
	
	
	readPayload (fitsFile, headerOffset){		
		length = fitsFile.length;
//		console.log("headerOffset:"+headerOffset);
		// read the payload
    	var content = "";
    	var image = new Array(this.width * this.height);
    	var i = headerOffset;
    	var p = 0;
		var x;
		var min = 'NaN';
		var max = 'NaN';
		var c=document.createElement('canvas');
    	c.width = this.width;
        c.height = this.height;
    	var ctx=c.getContext("2d");
    	var imgData=ctx.createImageData(this.width, this.height);
    	var val;
    	// NON FUNZIONAAAAA
//    	min = max = val = this.getLongAt(fitsFile, i, true); //IEEE float32 is always big-endian
//    	max =0;
    	var maxindex;
    	
    	if (this.BZERO == undefined || this.BSCALE == undefined){
    		this.BZERO = 0;
    		this.BSCALE = 1;
		}
    	
    	this.BLANK_pv = this.BZERO + this.BSCALE * this.BLANK;
    	
    	
    	var p = 0;
    	
    	
		while (i < length){
			
			if (this.BITPIX == 16){
//				val = this.getIntAt(fitsFile, i, true); //IEEE 754 half precision (float16)
				val = this.float16_to_float_2(fitsFile, i, true); //IEEE 754 half precision (float16)
			}else if (this.BITPIX == -32){
				val = this.getLongAt(fitsFile, i, true); //IEEE 754 float32 is always big-endian	
				if (val != 0){
					// TODO to be checked
					val = (1.0+((val&0x007fffff)/0x0800000)) * Math.pow(2,((val&0x7f800000)>>23) - 127);
				}
			}
			
//			if (p < 100){
//				
//				console.log("val(10): "+val+" va(2): "+val.toString(2));
//				p=p++;
//			}
			
			
			
			
			// binary (int or long) to float conversion
//			if (val != 0) {
//				val = (1.0+((val&0x007fffff)/0x0800000)) * Math.pow(2,((val&0x7f800000)>>23) - 127);
				
//				val = (1.0+((val&0x007fffff)/(val&0x0800000)>>31)) * Math.pow(2,((val&0x7f800000)>>23) - 127);
//			}
//			if (val < 0) {
//				val = -val;
//			}
			
			
////		physical_value = BZERO + BSCALE * array_value;
			let p_val = this.BZERO + this.BSCALE * val;
//			p_val = (1.0+((p_val&0x007fffff)/0x0800000)) * Math.pow(2,((p_val&0x7f800000)>>23) - 127);
			
//			if (p < 100){
//				
//				console.log("processed val(10): "+p_val+" va(2): "+p_val.toString(2));
//				
//			}
			
			
			// this could be checked against the array blanck value val !== this.BLANK
			if( (p_val < min && p_val !== this.BLANK_pv) || isNaN(min)) {
				min = p_val;
			}
			if( (p_val > max && p_val !== this.BLANK_pv) || isNaN(max)) {
				max = p_val;
			}
			
//			physical_value = BZERO + BSCALE * array_value;
//			let p_val = this.BZERO + this.BSCALE * val;
//			val = p_val;
			image[p++] = p_val;
			i += Math.abs(this.BITPIX/8);
		}
//		console.log("MAX:"+max+" MIN:"+min);
//		console.log("----------------------------");

//		var min = -3;
//		var max = 7;
    	var row = 0;
    	var col = 0;
    	var i=0;
    	var pos;
    	var colors;
//    	var test = 0;
    	for (row=0;row<this.width; row++){
    		for (col=0;col<this.height;col++){
    			pos = ((this.width-row)*this.height+col)*4;
//    			colors = colorImage(image[i],"A");
    			colors = this.colorImage2(image[i],min, max);
//    			colors = colorImage3(imgData, image[i]);
    			
//    			if (row > 253){
    				// IL MAX e' SBALLATO!!!
//    				console.log("min: "+min+" max: "+max);
//					console.log("row: "+row+" col: "+col+"val: "+image[i]);
//					test++;
//				}
    			
    			imgData.data[pos] = colors.r;
    			imgData.data[pos+1] = colors.g;
    			imgData.data[pos+2] = colors.b;
    			imgData.data[pos+3] = 0xff; // alpha
    			i++;
    		}
    	}
    	ctx.putImageData(imgData, 0, 0);
    	var img = new Image();
        img.src = c.toDataURL();        
        return img;
	}
	
	
	
	
	getStringAt (data, offset, length) {
		var chars = [];
		for (var i=offset,j=0;i<offset+length;i++,j++) {
			chars[j] = String.fromCharCode(data.charCodeAt(i) & 0xFF);
		}
		return chars.join("");
	}
	

	getLongAt (data, offset) {
		var byte1 = this.getByteAt(data, offset),
			byte2 = this.getByteAt(data, offset + 1),
			byte3 = this.getByteAt(data, offset + 2),
			byte4 = this.getByteAt(data, offset + 3);
		
		var long = (((((byte1 << 8) + byte2) << 8) + byte3) << 8) + byte4;
		if (long < 0) long += 4294967296;
		
		if (byte1 !== 192 && byte2 !== 0 && byte3 !== 0 && byte4 !== 127){
//			check = true;
		}

		return long;
	}
	
	
	float16_to_float(data, offset) {
		var byte1 = this.getByteAt(data, offset),
		byte2 = this.getByteAt(data, offset + 1);
		var h = (byte1 << 8) | byte2;
		
	    var s = (h & 0x8000) >> 15;
	    var e = (h & 0x7C00) >> 10;
	    var f = h & 0x03FF;

	    if(e == 0) {
	        return (s?-1:1) * Math.pow(2,-14) * (f/Math.pow(2, 10));
	    } else if (e == 0x1F) {
	        return f?NaN:((s?-1:1)*Infinity);
	    }

	    return (s?-1:1) * Math.pow(2, e-15) * (1+(f/Math.pow(2, 10)));
	}
	
	float16_to_float_2(data, offset) {
		var byte1 = this.getByteAt(data, offset),
		byte2 = this.getByteAt(data, offset + 1);
		var h = 0x0000 | (byte1 << 8) | byte2;
		
	    var s = (h & 0x8000) >> 15;
	    var e = (h & 0x7C00) >> 10;
	    var f = h & 0x03FF;

//	    console.log(h.toString(2));
	    var res = h & 0x0000FFFF;
	    
	    if (s){
	    	res = (~h & 0x0000FFFF)  + 1;
//		    console.log(res.toString(2));
	    	return -1 * res;
	    }
	    return res;
//	    if (s > 0){ // negative number
//	    	res = ~h;
//	    	e = (res & 0x7C00) >> 10;
//		    f = (res & 0x03FF) + 1;
//	    	// let convert to float now
//		    if (  (e == 0) ){ // exp contains at least one bit on
//		    	res = Math.pow(2, e-15) * (f/Math.pow(2, 10)) ;
//		    }else{
//		    	res = Math.pow(2, e-15) * (1 + f/Math.pow(2, 10)) ;
//		    }
//		    
//		    
//		    
////	    	res = Math.pow(2, e-15) * (1+(f/Math.pow(2, 10)));
////	    	res = res - Math.pow(2, 16);
//	    	
//	    }else{
//	    	res = Math.pow(2, e-15) * (1+(f/Math.pow(2, 10)));
//	    	
//	    }
	    
//	    return res;
//	    if(e == 0) {
//	        return (s?-1:1) * Math.pow(2,-14) * (f/Math.pow(2, 10));
//	    } else if (e == 0x1F) {
//	        return f?NaN:((s?-1:1)*Infinity);
//	    }
//
//	    return (s?-1:1) * Math.pow(2, e-15) * (1+(f/Math.pow(2, 10)));
	}
	
	getIntAt (data, offset) {
		var byte1 = this.getByteAt(data, offset),
			byte2 = this.getByteAt(data, offset + 1);
		
		console.log("byte1(10) -> "+byte1+" byte1(2) -> "+byte1.toString(2));
		console.log("byte2(10) -> "+byte2+" byte2(2) -> "+byte2.toString(2));
		
		var int = (byte1 << 8) + byte2;
		console.log("int(10) -> "+int+" int(2) -> "+int.toString(2));
		var signInt = int >> 15;
		console.log("signInt(10) -> "+signInt+" signInt(2) -> "+signInt.toString(2));
		
		if ( signInt != 0 ){ // negative number
			int = int - 1.0;
			int = ~int;
		}
		console.log("complemented int(10) -> "+int+" int(2) -> "+int.toString(2));
		var myint = int;
//		var int = ((byte1 << 8) + byte2) & 0xFFFF;
//		var myint = ~int + 1 >>> 0;

		
		return myint;
	}
	
	getByteAt (data, offset) {
		var dataOffset = 0;
		return data.charCodeAt(offset + dataOffset) & 0xFF;
	}
	
	colorImage (v,type){
		
		if(type=="blackbody" || type=="heat") {
			return {
				r:((v<=127.5) ? v*2 : 255),
				g:((v>63.75) ? ((v<191.25) ? (v-63.75)*2 : 255) : 0),
				b:((v>127.5) ? (v-127.5)*2 : 0)};
		} else if(type=="A") {
			return {
				r:((v<=63.75) ? 0 : ((v<=127.5) ? (v-63.75)*4 : 255)),
				g:((v<=63.75) ? v*4 : ((v<=127.5) ? (127.5-v)*4 : ((v<191.25) ? 0: (v-191.25)*4))),
				b:((v<31.875) ? 0 : ((v<127.5) ? (v-31.875)*8/3 : ((v < 191.25) ? (191.25-v)*4 : 0)))};
		} else if(type=="B") {
			return {
				r:((v<=63.75) ? 0 : ((v<=127.5) ? (v-63.75)*4 : 255)),
				g:((v<=127.5) ? 0 : ((v<=191.25) ? (v-127.5)*4 : 255)),
				b: ((v<63.75) ? v*4 : ((v<127.5) ? (127.5-v)*4 : ((v<191.25) ? 0 : (v-191.25)*4 ))) };
		} else return {
			r:v,
			g:v,
			b:v
		};
	}

	colorImage2 (v,min,max){

		if (v<0) v = -v;
	//	var colormap_idx = Math.round(( (v-min) / (max-min)) * 255);
		var colormap_idx = ( (v-min) / (max-min)) * 256;
		var idx = Math.round(colormap_idx);
		if (idx<0){
			idx = -idx;
		}
	//	console.log("v["+v+"] min["+min+"] max["+max+"] coloidx: "+colormap_idx+" idx: "+idx+" R: "+this.r[idx]+" G: "+this.g[idx]+" B: "+this.b[idx]);
	//	return {r:255-colormap_idx,g:255-colormap_idx,b:255-colormap_idx};
//		return {r:this.r[idx],g:this.g[idx],b:this.b[idx]};
		
		if (this.colorMap.name == 'grayscale'){
			
			return {
				r:idx,
				g:idx,
				b:idx
			};
		}else{
			return {
				r:this.colorMap.r[idx],
				g:this.colorMap.g[idx],
				b:this.colorMap.b[idx]
			};	
		}
		
		
		
	}


	colorImage3 (img, v){
		var pixelData = img.data;
		if (v<0) v = -v;
	//	if (this.check2 < 10){
	//		console.log("[v]:"+v+" [R]:"+this.r[255-v]+" [G]:"+this.g[255-v]+" [B]:"+this.b[255-v]);
	//		this.check2++;
	//	}
		
		return {r:this.r[255-v],g:this.g[255-v],b:this.b[255-v]};
	}	

	trim (s) {
		s = s.replace(/(^\s*)|(\s*$)/gi,"");
		s = s.replace(/[ ]{2,}/gi," ");
		s = s.replace(/\n /,"\n");
		return s;
	}
}
	
	
	
	
	
	
	