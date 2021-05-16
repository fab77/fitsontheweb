import View from './View';
import Presenter from './Presenter';

class App{
	
	_presenter;
	
	constructor(){
		let view = new View();
		this._presenter = new Presenter(view);
		
	}
	
	run(){
		console.log("inside run");
	}
}

export default App;