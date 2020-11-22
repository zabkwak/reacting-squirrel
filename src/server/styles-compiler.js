import Processor from 'combine-styles-processor';

export default class StylesCompiler {

	/** @type {Processor} */
	_processor = null;

	constructor(dirs, outDir, mergedFileName = 'rs-tmp.merged.css') {
		this._processor = new Processor(dirs, `${outDir}/${mergedFileName}`);
	}

	compile(cb) {
		if (typeof cb === 'function') {
			this.compile().then(cb).catch(cb);
			return;
		}
		// eslint-disable-next-line consistent-return
		return this._processor.process();
	}

}
