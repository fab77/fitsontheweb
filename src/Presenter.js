
import View from './View';
import FITSOnTheWeb from './FITSOnTheWeb';

class Presenter {
	
	_view;
	_fOTW;
	_fitsFile;
	_colorMap;
	_scaleFunction;
	_min;
	_max;
	
	constructor(in_view){
	
		this._view = in_view;
		this._fOTW = undefined;
		var self = this;

	
		this._view.addEnteredFITSURLHandler(function(){

			console.log("Inside addEnteredFITSURLHandler");
			let url = $("#fitsUrl").val();
			self._fOTW = new FITSOnTheWeb(
					url, null,
					function(img, min, max) { 
						self._view.setFitsPreview(img);	
						self._view.setMinMax(min, max);
					}, 
					self._view.selectedColorMap, 
					self._view.selectedScaleFunction, 
					null, null);
			self.addEventListener (self);

        });
		
		this._view.addFITSLocalHandler(function(file){

			console.log("Inside addFITSLocalHandler");
			
			self._fOTW = new FITSOnTheWeb(
					null, file, 
					function(img, min, max) { 
						self._view.setFitsPreview(img);	
						self._view.setMinMax(min, max);	
						
						$("img").mousemove(function (e) {

							var x = e.pageX - this.offsetLeft;
					        var y = e.pageY - this.offsetTop;
					        
					        let naxis1 = self._fOTW.header.getValue("NAXIS1");
					        let naxis2 = self._fOTW.header.getValue("NAXIS2");
					        let width = $(this).width();
					        let height = $(this).height();
					        let i = x;
					        let j = naxis2 - y;
					        
					        let p_value = self._fOTW.getPhysicalPixelValue(x, y);
					        console.log("i: "+i+" j: "+j+" p_value: "+p_value);
					    });

					}, 
					self._view.selectedColorMap, 
					self._view.selectedScaleFunction, 
					null, null);
			
			self.addEventListener (self);
			
			self._view.getFITSImgFromDOM.on("click", function (e) {
				var x = e.pageX - this.offsetLeft;
		        var y = e.pageY - this.offsetTop;
		        alert("X Coordinate: " + x + " Y Coordinate: " + y);
			});
			

        });
		
		
		this._view.addEnteredPostcardURLHandler(function(){

			console.log("Inside addEnteredPostcardURLHandler");
			let url = $("#postcardUrl").val();
			self._view.setImagePreview(url );	

        });

		
		this._view.addChangeColorMapHandler(function(){

			if (self._fOTW !== undefined){
				console.log("Inside changeColorMapHandler");
				let selectedColorMap = this.value;
				
				self._fOTW.changeColorMap(selectedColorMap);
				self._view.setFitsPreview(self._fOTW.img);
				
				self.addEventListener (self);

			}else{
				self._view.showError("Please load a FITS file first.");
			}
			 

        });

		
		this._view.addChangeScaleFunctionHandler(function(){

			if (self._fOTW !== undefined){
				console.log("Inside changeScaleFunctionHandler");

				let selectedScaleFunction = this.value;
				self._fOTW.changeTransferFunction(selectedScaleFunction);
				self._view.setFitsPreview(self._fOTW.img);
				
				self.addEventListener (self);				
				
			}else{
				self._view.showError("Please load a FITS file first.");
			}
			
        });

		this._view.addShowFITSHeaderHandler(function(){
			
			if (self._fOTW == null || self._fOTW === undefined){
				
				self._view.showError("Please load a FITS file first.");
				
			}else{
				
				let headerText = self._fOTW.header2String();
				self._view.fitsHeader = headerText;
				self._view.showFITSHeaderPoPup();
			}
			
			
		});
		
		this._view.addCloseFITSHeaderHandler(function(){
			
			self._view.hideFITSHeaderPoPup();

		});


		this._view.addCloseErrMsgHandler();
		
		this._view.addMinHadler(function() {
			
			if (self._fOTW == null || self._fOTW === undefined){
				
				self._view.showError("Please load a FITS file first.");
				
			}else{
				
				self._view.updateMin ();
				
			}
			
		});
		this._view.addMaxHadler(function() {
			
			if (self._fOTW == null || self._fOTW === undefined){
				
				self._view.showError("Please load a FITS file first.");
				
			}else{
				
				self._view.updateMax ();
				
			}
			
		});
		
		this._view.addSetMinMax(function() {
			
			if (self._fOTW == null || self._fOTW === undefined){
				self._view.showError("Please load a FITS file first.");
			}else{
				
				let img = self._fOTW.reprocess(self._view.min, self._view.max);
				self._view.setFitsPreview(img);	
				
				self.addEventListener (self);

			}
			
		});
		
		this._view.addInverseHandler(function (checked) {
			
			if (self._fOTW == null || self._fOTW === undefined){
				self._view.showError("Please load a FITS file first.");
			}else{
				console.log("inverse");

				self._fOTW.changeInverse(checked);
				self._view.setFitsPreview(self._fOTW.img);

				self.addEventListener (self);

			}
			
		} );

	}
	
	
	addEventListener (presenter) {
		
		console.log("ping");
		$("img").mousemove(function (e) {
	
			var x = e.pageX - this.offsetLeft;
	        var y = e.pageY - this.offsetTop;
	        
	        let p_value = presenter._fOTW.getPhysicalPixelValueFromScreenMouse(x, y);
	        presenter._view.setPhysicalValue(p_value);
	    });
	}
	
		
	
}

export default Presenter;

