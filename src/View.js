/**
 * @author Fabrizio Giordano (Fab)
 */

import $ from "jquery";
class View{
	
	_container;
	_fitsHeader;
	_selectedColorMap;
	_selectedScaleFunction;
	
	
	
	constructor(in_canvas, insideSphere){
		console.log("inside View");
		this._container = $("#container");
		
		this._selectedScaleFunction = "linear";
		this._selectedColorMap = "grayscale";
		
		this._container.append(this.initErrorBox());
		this._container.append(this.initTitle());
		this._container.append("<hr>");
		this._container.append(this.initFileBrowser ());
		this._container.append("<hr>");
		this._container.append(this.initFITSHeader ());
		this._container.append("<hr>");
		this._container.append(this.initColorMaps());
		this._container.append("<hr>");
		this._container.append(this.initScaleFunction());
		this._container.append("<hr>");
		this._container.append(this.initPixelsScale());
		this._container.append("<hr>");
		
		this._container.append(this.initPixelValue());
		this._container.append("<hr>");
		
		this._container.append(this.initResultBoxes());
		
		this.clearErrorBox();
		
		
		
	}
	
	initTitle () {
		let html = "<div id='title'><h1>FITSOnTheWeb</h1></div>";
		return html;
	}
	
	getFITSImgFromDOM () {
		let t = $("#fitsImg");
		return t;
	}
	
	get selectedColorMap () {
		return this._selectedColorMap;
	}

	get selectedScaleFunction () {
		return this._selectedScaleFunction;
	}
	
	
	/**
	 * @param min: min physical value of the FITS 
	 */
	setMinMax (min, max){
		
		$('#range-min').prop('max',max);
		$('#range-min').prop('min',min);
		$('#range-min').prop('value',min);
		$("#min-val").val(min);
		
		$('#range-max').prop('min',min);
		$('#range-max').prop('max',max);
		$('#range-max').prop('value',max);
		$("#max-val").val(max);
		
	}
	
	get min() {
		return $("#min-val").val();
	}
	
	get max() {
		return $("#max-val").val();
	}
	
	set fitsHeader (headerText) {
		$("#fitsHeaderText").html(headerText);
	}
	
	/**
	 * @param imgUrl: URL of PNG/JPEG of the same product, if any 
	 */
	setImagePreview (imgUrl) {
		document.getElementById('postcardDiv').innerHTML = "<img src="+imgUrl+">";
	}

	/**
	 * @param img: converted PNG/JPEG from FITS 
	 */
	setFitsPreview (img) {

//		let temp = document.getElementById('fitsDiv');
//		img.id = 'fitsImg';
//		temp.innerHTML = img.outerHTML;

		let temp = document.getElementById('fitsImg');
		temp.src = img.src;		
	}


	
	addEnteredFITSURLHandler (handler) {
		$("#fitsUrl").on('keypress',function(e) {
		    if(e.which == 13) {
		    	handler();
		    }
		});
		
		$("#loadFits").on('click',function(e) {
		    	handler();
		});

	}
	
	addFITSLocalHandler (handler) {
		
		
		$("#loadLocalFits").on('click',function() {
			let file = document.querySelector("#fitsLocal").files[0];
			if (!file){
				return;
			}
			handler(file);
		});

	}
	
	
	
	
	addEnteredPostcardURLHandler (handler) {
		$("#postcardUrl").on('keypress',function(e) {
		    if(e.which == 13) {
		    	handler();
		    }
		});
		
		$("#loadPostcard").click(function(e) {
	    	handler();
		});
		
	}
	
	addChangeColorMapHandler (handler) {
        $("#colorMaps").change(handler);
    }
	
	addChangeScaleFunctionHandler (handler) {
        $("#scaleFunction").change(handler);
    }
	
	addShowFITSHeaderHandler(handler){
		$("#fitsHeader").click(function(e) {
	    	handler();
		});
	}
	
	addCloseFITSHeaderHandler(handler){
		$("#closeFitsHeaderPopup").click(function(e) {
	    	handler();
		});
	}
	
	addCloseErrMsgHandler(){
		let self = this;
		$("#closeErrorMsg").click(function(e) {
	    	self.clearErrorBox();
		});
	}
	
	addMinHadler () {
		
		$("#range-min").on("input change", function(e) {
			$("#min-val").val($("#range-min").val());
		});
		
	}

	updateMin () {
		$("#min-val").val($("#range-min").val());
	}
	
	addMaxHadler (handler) {
		
		$("#range-max").on("input change", function(e) {
			handler();
		});

	}
	
	updateMax () {
		$("#max-val").val($("#range-max").val());
	}
	
	addSetMinMax (handler) {
		
		$("#minmax").click(function(e){
			handler();
		});
	}
	
	addInverseHandler (handler) {

		
		$("#inverse").click(function(e){
			let checked = $("#inverse").is(':checked');
			handler(checked);
		});

	}

	
	initErrorBox () {
		let html = 
			"<div id='errorDiv'>" +
			"	<i><span id='errorMsg' ></span></i>" +
			"	<button id='closeErrorMsg'>X</button>" +
			"</div>" +
			"<br/>";
		return html;
	}
	
	showError(errorMsg) {
		$('#errorMsg').text(errorMsg);
		$('#errorDiv').css("display", "block")
	}
	
	clearErrorBox(){
		$('#errorMsg').text("");
		$('#errorDiv').css("display", "none");
	}
	
	showFITSHeaderPoPup () {
		var popup = document.getElementById("fitsHeaderPopup").style.display = "block";
	}
	
	hideFITSHeaderPoPup () {
		var popup = document.getElementById("fitsHeaderPopup").style.display = "none";
	}
	
	
	
	initFileBrowser () {
		let html = 
		"<div>" +
		"	<label class='myLabel' for='fitsLocal'>Select FITS from local disk:</label>" +
		"	<input class='inputFile' name='fitsLocal' id='fitsLocal' type='file'/>" +
		"	<button class='myButton' id='loadLocalFits'>Load</button>" +
		"	<br/>" +
		"	<label class='myLabel' for='fitsUrl'>Enter URL for FITS:</label>" +
		"	<input class='inputFile' name='fitsUrl' id='fitsUrl' type='text' size='256' value='http://skies.esac.esa.int/Herschel/normalized/hips250_pnorm_allsky/Norder3/Dir0/Npix281.fits'/>" +
		"	<button class='myButton' id='loadFits'>Load</button>" +
		"	<br/>" +
		"	<label class='myLabel' for='postcardUrl'>Enter URL for postcard (if any):</label>" +
		"	<input class='inputFile' name='postcardUrl' id='postcardUrl' type='text' size='256' value='http://skies.esac.esa.int/Herschel/normalized/hips250_pnorm_allsky/Norder3/Dir0/Npix281.png'/>" +
		"	<button class='myButton' id='loadPostcard'>Load</button>" +
		"</div>";
		
		
		return html;
	}
	
	initFITSHeader () {
		let html = 
			"<div>" +
			"	<label class='myLabel' for='fitsHeader'>FITS header:</label>" +
			"	<button class='myButton' id='fitsHeader'>Show</button>" +
			"	<div id='fitsHeaderPopup' class='popup'>" +
			"		<span id='fitsHeaderText' class='popuptext'>" + this._fitsHeader + "</span>" +
			"		<button class='myButton' id='closeFitsHeaderPopup'>Close</button>" +
			"	</div>" +
			"	<br/>" +
			"</div>";
			
			
		return html;
	}
	
	
	
	
	initColorMaps(){
		let html = 
		"<div>"+
		"	<label for='colorMaps'>Choose a color map:</label>"+
		
		"	<select name='colorMaps' id='colorMaps' class='colorMaps'>"+
		"	    <option value='grayscale'>Grayscale</option>"+
		"	    <option value='planck'>Planck</option>"+
		"	    <option value='eosb'>EOSB</option>"+
		"	    <option value='rainbow'>Rainbow</option>"+
		"	    <option value='cmb'>CMB</option>"+
		"	    <option value='cubehelix'>Cubehelix</option>"+
		"	</select>"+
		
		"	<input type='checkbox' id='inverse' name='inverse'>"+
		"	<label for='inverse'>Inverse</label><br>"+
		"</div>";
		return html;
	}
	
	initScaleFunction(){
		let html = 
		"<div>"+
		"	<label for='scaleFunction'>Choose a scale function:</label>"+

		"	<select name='scaleFunction' id='scaleFunction' class='scaleFunction' >"+
		"	    <option value='linear'>linear</option>"+
		"	    <option value='log'>log</option>"+
		"	    <option value='-power'>-power-</option>"+
		"	    <option value='sqrt'>sqrt</option>"+
		"	    <option value='-squared'>-squared-</option>"+
		"	    <option value='-asinh'>-asinh-</option>"+
		"	    <option value='-sinh'>-sinh-</option>"+
		"	    <option value='-histogram'>-histogram-</option>"+
		"	</select>"+
		"	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
		"	<select name='scaleFunction' id='scaleFunction' class='scaleFunction'>"+
		"	    <option value='minmax'>minmax</option>"+
		"	    <option value='-zscale'>-zscale-</option>"+
		"	</select>"+
		"</div>";
		return html;
	}
	
	initPixelsScale(){
		let html = 
			"<div>" +
			"	<label for='minmax'>Pixels scale:</label>"+
			"	<div id='minmax'>"+
			"		<label for='range-min'>Min:</label>"+
			"		<input type='range' name='range-min' id='range-min' step='0.0001' />" +
			"		<input type='text' id='min-val'/>" +
			"		<br>"+
			"		<label for='range-max'>Max:</label>"+
			"		<input type='range' name='range-max' id='range-max' step='0.0001'/>" +
			"		<input type='text' id='max-val'/>" +
			"		<input type='button' name='minmax' id='minmax' value='set'/>" +
			"	</div>"+
			"</div>";
		return html;
	}
	
	setPhysicalValue (pVal){
		document.getElementById('pixelValue').innerHTML = pVal;
	}

	setRADecValue (ra, dec){
		document.getElementById('raDec').innerHTML = ra+", "+dec;
	}

	setFITSxyValue (fits_x, fits_y){
		document.getElementById('xy').innerHTML = "("+fits_x+", "+fits_y+")";
	}
	
	initPixelValue() {
		
		let html = "<div id='pixValueContainer'>" +
				"		<label for='pixelValue'>Pixel physical value:</label>" +
				"		<div id='pixelValue'></div>" +
				"		<label for='raDec'>RA, Dec:</label>" +
				"		<div id='raDec'></div>" +
				"		<label for='xy'>(x, y):</label>" +
				"		<div id='xy'></div>" +
				"	</div>";
		return html;
	}
	
	initResultBoxes(){
		
		let html = "<div id='result'>"+
					"	<div class='prevCard'>"+
					"		<label for='fitsDiv'>"+
					"			computed image from FITS:"+
					"		</label>"+
					"		<div id='fitsDiv'><img id='fitsImg' />"+
					"		</div>"+
					"	</div>"+
						
					"	<div class='prevCard'>"+
					"		<label for='postcardDiv'>"+
					"			Postcard (if any):"+
					"		</label>"+
					"		<div id='postcardDiv'>"+
					"		</div>"+
					"	</div>"+
					"</div>";
		return html;
	}
	
}

export default View;
