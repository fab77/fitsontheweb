/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/fitsontheweb
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 * import GnomonicProjection from './GnomonicProjection';
 * BITPIX definition from https://archive.stsci.edu/fits/fits_standard/node39.html
 * and "Definition of the Flexible Image Transport System (FITS)" standard document 
 * defined by FITS Working Group from the International Astronomical Union
 * http://fits.gsfc.nasa.gov/iaufwg/
 * 8	8-bit Character or unsigned binary integer
 * 16	16-bit twos-complement binary integer
 * 32	32-bit twos-complement binary integer
 * -32	32-bit IEEE single precision floating point
 * -64	64-bit IEEE double precision floating point
 * 
 */

import ParseUtils from '../ParseUtils';

class FITSWriter {

    _headerArray;
    _payloadArray;
    _fitsData;

    constructor () {

    }

    run (arrayData, headerDetails) {
        this.prepareHeader(headerDetails);
        this.preparePayload(arrayData, headerDetails.naxis1, headerDetails.bitpix);
        this.prepareFITS();
    }

    prepareHeader (headerDetails) {
        
        // Gnomonic
        let str = this.formatHeaderLine("SIMPLE", "T");
        str += this.formatHeaderLine("BITPIX", headerDetails.bitpix);
        str += this.formatHeaderLine("NAXIS", 2);
        str += this.formatHeaderLine("NAXIS1", headerDetails.naxis1);
        str += this.formatHeaderLine("NAXIS2", headerDetails.naxis2);
        str += this.formatHeaderLine("BLANK", headerDetails.blank);
        str += this.formatHeaderLine("BSCALE", headerDetails.bscale);
        str += this.formatHeaderLine("BZERO", headerDetails.bzero);
        str += this.formatHeaderLine("CTYPE1", "RA---TAN");
        str += this.formatHeaderLine("CTYPE2", "DEC--TAN");
        str += this.formatHeaderLine("CRPIX1", 0);
        str += this.formatHeaderLine("CRPIX2", 0);
        str += this.formatHeaderLine("CRVAL1", headerDetails.crval1);
        str += this.formatHeaderLine("CRVAL2", headerDetails.crval2);
        str += this.formatHeaderLine("WCSNAME", "Test Gnomonic");
        str += this.formatHeaderLine("ORIGIN", "FITSOnTheWeb v.0.x");
        str += this.formatHeaderLine("COMMENT", "FITSOnTheWebv0.x developed by F.Giordano and Y.Ascasibar");
        str += this.formatHeaderLine("END", "");

        let strBytelen = new TextEncoder().encode(str).length;
        
        for (let j = 0; j < 2880 - strBytelen; j++) {
            str += " ";
        }
        
        let ab = new ArrayBuffer(str.length * 2);
        // Javascript character occupies 2 16-bit -> reducing them to 1 byte
        this._headerArray = new Uint8Array(ab);
        for (let i = 0; i <  str.length; i++) {
            this._headerArray[i] = ParseUtils.getByteAt(str, i);
        }
         
    }

    formatHeaderLine (keyword, value) {
        
        // SIMPLE must be the first keyword in the primary HDU
        // BITPIX must be the second keyword in the primary HDU
        // all rows 80 ASCII chars of 1 byte
        // bytes [0-8]   -> keyword
        // bytes [9-10] -> '= '
        // bytes [11-80] -> value:
        //      in case of number -> right justified to the 30th??? digit/position
        //      in case of string -> between '' and starting from byte 12
        let klen = keyword.length;
        let vlen;
        // keyword
        if (isNaN(value)){
            if (keyword == 'SIMPLE')  {
                value = value;
            }else{
                value = "'"+value+"'";
            }
            vlen = value.length;
        }else{
            vlen = value.toString().length;
        }
        
        let str = keyword;
        for (let i = 0; i < 8 - klen; i++) {
            str += ' ';
        }

        // value
        str += "= ";
        str += value;
        for (let j = 80; j > 10 + vlen; j--) {
            str += ' ';
        }
        
        return str;
    }

    preparePayload (arrayData, dataRowLength, bitpix) {

        let finalFits;
        let dataColsLength = arrayData.length / dataRowLength;
        let ab;

        // Javascript array types described at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
        // if (bitpix == 8) {
        //     ab = new ArrayBuffer(dataRowLength * dataColsLength);
        //     this._payloadArray = new Uint8Array(ab);
        // } else if (bitpix == 16) {
        //     ab = new ArrayBuffer(dataRowLength * dataColsLength * 2);
        //     this._payloadArray = new Int16Array(ab);
        // } else if (bitpix == 32) {
        //     ab = new ArrayBuffer(dataRowLength * dataColsLength * 4);
        //     this._payloadArray = new Int32Array(ab);
        // } else if (bitpix == -32) {
        //     ab = new ArrayBuffer(dataRowLength * dataColsLength * 4);
        //     this._payloadArray = new Float32Array(ab);
        // } else if (bitpix == -64) {
        //     throw new TypeError("64-bit IEEE double precision floating point not implemeted")
        // }

        ab = new ArrayBuffer(dataRowLength * dataColsLength * 2);
        this._payloadArray = new Uint8Array(ab);


        for (let i = 0; i < dataRowLength; i++) {
            for ( let j = 0; j < dataColsLength; j++) {
                // this._payloadArray[i * dataRowLength + j] = arrayData[i * dataRowLength + j];

                let b1 = ParseUtils.getByteAt(arrayData[i * dataRowLength + j], 0);
                let b2 = ParseUtils.getByteAt(arrayData[i * dataRowLength + j], 1);
                this._payloadArray[i * dataRowLength + 2 * j] = b1;
                this._payloadArray[i * dataRowLength + 2 * j + 1] = b2;

            }
        }

        // for (let h = 0; h < finalFits.length; h++) {
        //     let val = ParseUtils.generate16bit2sComplement(finalFits[h]);
        // }


        
    }

    prepareFITS () {
        // let bytes = new Int16Array(this._headerArray.byteLength + this._payloadArray.byteLength);
        // let bytes = new Int16Array(this._headerArray.byteLength);
        // bytes.set(this._headerArray, 0);
        // bytes.set(this._payloadArray, this._headerArray.byteLength);
        
        // this._fitsData = this._headerArray;


        let bytes = new Uint8Array(this._headerArray.byteLength + this._payloadArray.byteLength);
        bytes.set(this._headerArray, 0);
        bytes.set(this._payloadArray, this._headerArray.byteLength);
        this._fitsData = bytes;
    }

    typedArrayToURL() {
        // return URL.createObjectURL(new Blob([this._fitsData.buffer], {type: 'application/fits'}));
        return URL.createObjectURL(new Blob([this._fitsData], {type: 'application/fits'}));
        
    }

}

export default FITSWriter;