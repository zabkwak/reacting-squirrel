import Processor from 'combine-styles-processor';

export default class StylesCompiler {

	/** @type {Processor} */
	_processor = null;

	constructor(dirs, outDir, mergedFileName = 'rs-tmp.merged.css') {
		this._processor = new Processor(dirs, `${outDir}/${mergedFileName}`);
	}

	compile(cb) {
		this._processor.process().then(cb).catch(cb);
	}

}
